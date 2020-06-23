import { defineCommand } from '../define-command';
import { AppService } from '../services/AppService';

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
  handler: async (app: AppService, options: { clear: boolean }) => {
    const notifications = await app.gitHub.getNotifications();

    app.log.logLines(
      notifications.map((notification) => ({
        id: notification.id,
        title: notification.title,
        topics: [notification.repository, notification.reason],
      })),
      'No notifications',
    );

    if (options.clear) {
      await app.gitHub.clearNotifications();
    }
  },
});
