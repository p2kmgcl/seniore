import { defineCommand } from '../define-command';
import { AppService } from '../services/AppService';

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
  handler: async (app: AppService, options: { owner: string }) => {
    const owner = options.owner || (await app.git.getRepositoryOwner());
    const repo = await app.git.getRepositoryName();
    const pullRequests = await app.gitHub.getPullRequests(owner, repo);

    app.log.logLines(
      pullRequests.map((pullRequest) => ({
        id: pullRequest.id,
        title: pullRequest.title,
        url: pullRequest.url,
        topics: [pullRequest.creator, pullRequest.status],
      })),
      'No PRs',
    );
  },
});
