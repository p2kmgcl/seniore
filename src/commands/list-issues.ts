import { defineCommand } from '../common/define-command';
import { AppService } from '../services/AppService';

export const listIssues = defineCommand({
  command: 'list-issues <boardId>',
  description: 'list JIRA board issues',
  handler: async (app: AppService, boardId: string) => {
    const issues = await app.jira.getBoardIssues(boardId);

    app.log.logLines(
      issues.map((issue) => ({
        id: issue.key,
        description: issue.description,
        title: issue.title,
        url: issue.url,
        topics: [issue.assignee, issue.status],
      })),
      'No issues',
    );
  },
});
