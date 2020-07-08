import { defineCommand } from '../define-command';
import { LogService } from '../services/LogService';
import { ConfigService } from '../services/ConfigService';
import { GitHubService } from '../services/GitHubService';
import { GitService } from '../services/GitService';
import { JiraService } from '../services/JiraService';

const BRANCH_NAME_PATTERN = /^pr\/([a-zA-Z0-9-]+)\/([0-9]+)$/i;
const COMMIT_MESSAGE_PATTERN = /^(LPS-[0-9]+)[ ]*(.*)$/i;

export const sendPullRequest = defineCommand({
  command: 'send-pull-request <username>',
  alias: 's',
  description: 'send current branch as PR',
  options: [
    {
      definition: '-f, --forward',
      description: 'add ci:forward comment to the created pull-request',
      defaultValue: false,
    },
    {
      definition: '-k, --keep-branch',
      description: 'keep local branch instead of cleaning up',
      defaultValue: false,
    },
  ],
  handler: async (
    targetOwner: string,
    { forward, keepBranch }: { forward: boolean; keepBranch: boolean },
  ) => {
    const config = ConfigService.getConfig();

    const title = await GitService.getLastCommitMessage();
    const branch = await GitService.getCurrentBranchName();
    const localOwner = await GitService.getRepositoryOwner();
    const repo = await GitService.getRepositoryName();

    await GitService.pushBranch(branch);

    const targetPR = await GitHubService.createPullRequest({
      sourceOwner: localOwner,
      sourceBranch: branch,
      targetOwner,
      targetBranch: 'master',
      repo,
      title,
    });

    if (forward) {
      await GitHubService.addCommentToPullRequest(
        targetOwner,
        repo,
        targetPR.number,
        'ci:forward',
      );
    }

    if (BRANCH_NAME_PATTERN.test(branch)) {
      const data = BRANCH_NAME_PATTERN.exec(branch) as RegExpExecArray;

      const sourceOwner = data[1];
      const sourceNumber = parseInt(data[2], 10);

      const sourcePR = await GitHubService.getPullRequest(
        sourceOwner,
        repo,
        sourceNumber,
      );

      if (targetOwner !== sourcePR.creator && localOwner !== sourcePR.creator) {
        await GitHubService.addCommentToPullRequest(
          targetOwner,
          repo,
          targetPR.number,
          `/cc @${sourcePR.creator}`,
        );
      }

      await GitHubService.addCommentToPullRequest(
        sourceOwner,
        repo,
        sourceNumber,
        targetPR.url,
      );

      try {
        await GitHubService.closePullRequest(sourceOwner, repo, sourceNumber);
      } catch (error) {
        LogService.logText(error.toString(), {
          error: true,
        });
      }
    }

    if (!keepBranch) {
      await GitService.checkoutBranch('master');
      await GitService.deleteBranch(branch);
    }

    LogService.logText(targetPR.url);

    if (COMMIT_MESSAGE_PATTERN.test(title)) {
      const [, issueId] = COMMIT_MESSAGE_PATTERN.exec(title) as RegExpExecArray;
      const targetJiraUser = config.githubUserToJiraUser[targetOwner];

      if (targetJiraUser) {
        await JiraService.assignIssueToUser(
          issueId,
          targetJiraUser,
          targetPR.url,
        );
      } else {
        LogService.logText(`No JIRA user found for ${targetOwner}`);
      }

      LogService.logText(`https://${config.jira.host}/browse/${issueId}`);
    }
  },
});
