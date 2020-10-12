import { defineCommand } from '../define-command';
import { VerboseGitHubService } from '../services/VerboseGitHubService';
import { VerboseGitService } from '../services/VerboseGitService';

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
      throw new Error(`Invalid PR number "${numberString}"`);
    }

    const repo = await VerboseGitService.getRepositoryName();
    const owner =
      options.owner || (await VerboseGitService.getRepositoryOwner());

    const pr = await VerboseGitHubService.getPullRequest(owner, repo, number);

    if (!pr) {
      throw new Error(`PR ${owner}/${repo}/${number} not found`);
    } else {
      await VerboseGitService.checkoutPullRequest(owner, repo, number);
    }
  },
});
