import { defineCommand } from '../define-command';
import { AppService } from '../services/AppService';

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
  handler: async (app: AppService, { force }: { force: boolean }) => {
    app.config.init({ force });
  },
});
