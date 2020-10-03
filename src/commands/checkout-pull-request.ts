import { defineCommand } from '../define-command';
import { GitHubService } from '../services/GitHubService';
import { GitService } from '../services/GitService';

export const checkoutPullRequest = defineCommand({
  command: 'checkout-pull-request <number>',
  alias: 'c',
  description: 'checkout specified PR',
  options: [
    {
      definition: '-o, --owner <username>',
      description: 'repo owner (default: username from "origin")',
    },
  ],
  handler: async (numberString: string, options: { owner?: string }) => {
    const number = parseInt(numberString, 10);

    if (isNaN(number)) {
      throw new Error('Invalid PR number');
    }

    const repo = await GitService.getRepositoryName();
    const owner = options.owner || (await GitService.getRepositoryOwner());

    const pr = await GitHubService.getPullRequest(owner, repo, number);

    if (!pr) {
      throw new Error(`PR ${owner}/${repo}/${number} not found`);
    } else {
      await GitService.checkoutPullRequest(owner, repo, number);
    }
  },
});
