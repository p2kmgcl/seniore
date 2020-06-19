import { defineCommand } from '../define-command';
import { AppService } from '../services/AppService';

export const checkoutPullRequest = defineCommand({
  command: 'checkout-pull-request <number>',
  description: 'checkout specified PR',
  options: [
    {
      definition: '-o, --owner <username>',
      description: 'repo owner (default: username from "origin")',
    },
  ],
  handler: async (
    app: AppService,
    numberString: string,
    options: { owner?: string },
  ) => {
    const number = parseInt(numberString, 10);

    if (isNaN(number)) {
      throw new Error('Invalid PR number');
    }

    const localOwner = await app.git.getRepositoryOwner();
    const repo = await app.git.getRepositoryName();
    const owner = options.owner || localOwner;

    const pr = await app.gitHub.getPullRequest(owner, repo, number);

    if (!pr) {
      throw new Error(`PR ${owner}/${repo}/${number} not found`);
    } else {
      await app.git.checkoutPullRequest(owner, repo, number);
    }
  },
});
