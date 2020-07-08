import { defineCommand } from '../define-command';
import { AppService } from '../services/AppService';

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
  ],
  handler: async (
    app: AppService,
    targetOwner: string,
    { forward }: { forward: boolean },
  ) => {
    const config = app.config.getConfig();

    const title = await app.git.getLastCommitMessage();
    const branch = await app.git.getCurrentBranchName();
    const localOwner = await app.git.getRepositoryOwner();
    const repo = await app.git.getRepositoryName();

    await app.git.pushBranch(branch);

    const targetPR = await app.gitHub.createPullRequest({
      sourceOwner: localOwner,
      sourceBranch: branch,
      targetOwner,
      targetBranch: 'master',
      repo,
      title,
    });

    if (forward) {
      await app.gitHub.addCommentToPullRequest(
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

      const sourcePR = await app.gitHub.getPullRequest(
        sourceOwner,
        repo,
        sourceNumber,
      );

      if (targetOwner !== sourcePR.creator && localOwner !== sourcePR.creator) {
        await app.gitHub.addCommentToPullRequest(
          targetOwner,
          repo,
          targetPR.number,
          `/cc @${sourcePR.creator}`,
        );
      }

      await app.gitHub.addCommentToPullRequest(
        sourceOwner,
        repo,
        sourceNumber,
        targetPR.url,
      );

      try {
        await app.gitHub.closePullRequest(sourceOwner, repo, sourceNumber);
      } catch (error) {
        app.log.logText(error.toString(), {
          error: true,
        });
      }
    }

    await app.git.checkoutBranch('master');
    await app.git.deleteBranch(branch);

    app.log.logText(targetPR.url);

    if (COMMIT_MESSAGE_PATTERN.test(title)) {
      const [, issueId] = COMMIT_MESSAGE_PATTERN.exec(title) as RegExpExecArray;
      const targetJiraUser = config.githubUserToJiraUser[targetOwner];

      if (targetJiraUser) {
        await app.jira.assignIssueToUser(issueId, targetJiraUser, targetPR.url);
      } else {
        app.log.logText(`No JIRA user found for ${targetOwner}`);
      }

      app.log.logText(`https://${config.jiraHost}/browse/${issueId}`);
    }
  },
});
