import { defineCommand } from '../define-command';
import { LogService } from '../services/LogService';
import { VerboseGitService } from '../services/VerboseGitService';

export const checkoutBranch = defineCommand({
  command: 'checkout-branch <name>',
  alias: 'cb',
  description: 'checkouts or creates specified branch',
  options: [
    {
      definition: '-o, --owner <username>',
      description: 'if specified, branch will be fetched from this user',
    },
  ],
  handler: async (name: string, options: { owner?: string }) => {
    if (options.owner) {
      const repo = await VerboseGitService.getRepositoryName();

      await VerboseGitService.fetchBranch(
        `https://github.com/${options.owner}/${repo}`,
        name,
        `${options.owner}/${name}`,
      );

      await VerboseGitService.checkoutBranch(`${options.owner}/${name}`);
    } else {
      try {
        await VerboseGitService.checkoutBranch(name);
      } catch (error) {
        let fetched = false;

        for (const remote of await VerboseGitService.getRemotes()) {
          if (fetched) break;

          try {
            await VerboseGitService.createBranch(name, `${remote}/${name}`);
            await VerboseGitService.checkoutBranch(name);
            LogService.logText(`Created branch ${name} from ${remote}/${name}`);
            fetched = true;
          } catch (error) {
            console.log(error);
            // Noop
          }
        }

        if (!fetched) {
          await VerboseGitService.createBranch(name);
          await VerboseGitService.checkoutBranch(name);
        }
      }
    }
  },
});
