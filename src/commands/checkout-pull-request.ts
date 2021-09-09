import { defineCommand } from '../define-command';
import { VerboseGitHubService } from '../services/VerboseGitHubService';
import { VerboseGitService } from '../services/VerboseGitService';

const PULL_REQUEST_REGEXP =
  /https:\/\/github.com\/([a-z0-9-_]+)\/([a-z0-9-_]+)\/pull\/([0-9]+)/i;

export const checkoutPullRequest = defineCommand({
  command: 'checkout-pull-request <number|url>',
  alias: 'c',
  description: 'checkout specified PR',
  options: [
    {
      definition: '-o, --owner <username>',
      description:
        'repo owner, only valid for PR number (default: username from "origin")',
    },
  ],
  handler: async (numberOrURL: string, options: { owner?: string }) => {
    let repo = '';
    let owner = '';
    let number = NaN;

    const localRepo = await VerboseGitService.getRepositoryName();
    const localOwner = await VerboseGitService.getRepositoryOwner();

    if (PULL_REQUEST_REGEXP.test(numberOrURL)) {
      const [, urlOwner, urlRepo, urlNumber] =
        PULL_REQUEST_REGEXP.exec(numberOrURL) || [];

      if (options.owner && options.owner !== urlOwner) {
        throw new Error('Cannot use both PR url and owner option');
      }

      if (localRepo !== urlRepo) {
        throw new Error(
          `You are trying to fetch PR into a different project ("${urlRepo}" vs "${localRepo}")`,
        );
      }

      repo = urlRepo;
      owner = urlOwner;
      number = parseInt(urlNumber, 10);
    } else {
      repo = localRepo;
      owner = options.owner || localOwner;
      number = parseInt(numberOrURL, 10);
    }

    if (isNaN(number)) {
      throw new Error('Invalid PR number');
    }

    const pr = await VerboseGitHubService.getPullRequest(owner, repo, number);

    if (!pr) {
      throw new Error(`PR ${owner}/${repo}/${number} not found`);
    } else {
      await VerboseGitService.checkoutPullRequest(owner, repo, number);
    }
  },
});
