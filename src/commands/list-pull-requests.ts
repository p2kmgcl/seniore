import { defineCommand } from '../define-command';
import { LogService } from '../services/LogService';
import { VerboseGitHubService } from '../services/VerboseGitHubService';
import { GitService } from '../services/GitService';

export const listPullRequests = defineCommand({
  command: 'list-pull-requests',
  alias: 'lp',
  description: 'list existing pull requests',
  options: [
    {
      definition: '-o, --owner <username>',
      description: 'repo owner (default: username from "origin")',
    },
  ],
  handler: async (options: { owner: string }) => {
    const owner = options.owner || (await GitService.getRepositoryOwner());
    const repo = await GitService.getRepositoryName();
    const pullRequests = await VerboseGitHubService.getPullRequests(
      owner,
      repo,
    );

    LogService.logLines(
      pullRequests.map((pullRequest) => ({
        id: pullRequest.id,
        title: pullRequest.title,
        url: pullRequest.url,
        topics: [`@${pullRequest.creator}`, pullRequest.status],
      })),
      'No PRs',
    );
  },
});
