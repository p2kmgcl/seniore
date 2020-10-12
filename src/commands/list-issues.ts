import { defineCommand } from '../define-command';
import { LogService } from '../services/LogService';
import { VerboseJiraService } from '../services/VerboseJiraService';

export const listIssues = defineCommand({
  command: 'list-issues <boardId>',
  alias: 'li',
  description: 'list JIRA board issues',
  handler: async (boardId: string) => {
    const issues = await VerboseJiraService.getBoardIssues(boardId);

    LogService.logLines(
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
