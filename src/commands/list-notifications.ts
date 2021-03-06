import { defineCommand } from '../define-command';
import { LogService } from '../services/LogService';
import { VerboseGitHubService } from '../services/VerboseGitHubService';

export const listNotifications = defineCommand({
  command: 'list-notifications',
  alias: 'ln',
  description: 'list GitHub notifications',
  options: [
    {
      definition: '--no-clear',
      description: 'do not notifications after listing',
      defaultValue: false,
    },
  ],
  handler: async (options: { clear: boolean }) => {
    const notifications = await VerboseGitHubService.getNotifications();

    LogService.logLines(
      notifications.map((notification) => ({
        id: notification.id,
        title: notification.title,
        topics: [notification.repository, notification.reason],
      })),
      'No notifications',
    );

    if (options.clear) {
      await VerboseGitHubService.clearNotifications();
    }
  },
});
