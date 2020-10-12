import { defineCommand } from '../define-command';
import { LogService } from '../services/LogService';
import { ConfigService } from '../services/ConfigService';
import { VerboseGitHubService } from '../services/VerboseGitHubService';
import { VerboseGitService } from '../services/VerboseGitService';
import { VerboseJiraService } from '../services/VerboseJiraService';

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

    const title = await VerboseGitService.getLastCommitMessage();
    const branch = await VerboseGitService.getCurrentBranchName();
    const localOwner = await VerboseGitService.getRepositoryOwner();
    const repo = await VerboseGitService.getRepositoryName();

    await VerboseGitService.pushBranch(branch);

    const targetPR = await VerboseGitHubService.createPullRequest({
      sourceOwner: localOwner,
      sourceBranch: branch,
      targetOwner,
      targetBranch: 'master',
      repo,
      title,
    });

    if (!targetPR) {
      throw new Error('Unknown error. The PR could not be created');
    }

    if (forward) {
      await VerboseGitHubService.addCommentToPullRequest(
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

      const sourcePR = await VerboseGitHubService.getPullRequest(
        sourceOwner,
        repo,
        sourceNumber,
      );

      if (![targetOwner, localOwner].includes(sourcePR.creator)) {
        await VerboseGitHubService.addCommentToPullRequest(
          targetOwner,
          repo,
          targetPR.number,
          `/cc @${sourcePR.creator}`,
        );
      }

      await VerboseGitHubService.addCommentToPullRequest(
        sourceOwner,
        repo,
        sourceNumber,
        targetPR.url,
      );

      try {
        await VerboseGitHubService.closePullRequest(
          sourceOwner,
          repo,
          sourceNumber,
        );
      } catch (error) {
        LogService.logError(error.toString());
      }
    }

    if (!keepBranch) {
      await VerboseGitService.checkoutBranch('master');
      await VerboseGitService.deleteBranch(branch);
    }

    LogService.logText(targetPR.url);

    if (COMMIT_MESSAGE_PATTERN.test(title)) {
      const [, issueId] = COMMIT_MESSAGE_PATTERN.exec(title) as RegExpExecArray;
      const targetJiraUser = config.githubUserToJiraUser[targetOwner];

      if (targetJiraUser) {
        await VerboseJiraService.assignIssueToUser(
          issueId,
          targetJiraUser,
          targetPR.url,
        );
      } else {
        LogService.logText(`No JIRA user found for ${targetOwner}`);
      }

      if (config.jira.host) {
        LogService.logText(`https://${config.jira.host}/browse/${issueId}`);
      }
    }
  },
});
