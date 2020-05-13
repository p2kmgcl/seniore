import { defineCommand } from '../common/define-command';
import { AppService } from '../services/AppService';

export const init = defineCommand({
  command: 'init',
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
