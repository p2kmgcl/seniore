import { defineCommand } from '../define-command';
import { ConfigService } from '../services/ConfigService';

export const init = defineCommand({
  command: 'init',
  alias: 'i',
  description: 'initialize config file',
  options: [
    {
      definition: '-f, --force',
      description: 'force to overwrite existing config file',
    },
  ],
  handler: async ({ force }: { force: boolean }) => {
    ConfigService.init({ force, quiet: false });
  },
});
