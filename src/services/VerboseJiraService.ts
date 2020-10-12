import { Issue, JiraService } from './JiraService';
import { LogService } from './LogService';

export const VerboseJiraService: typeof JiraService = {
  init() {
    return JiraService.init();
  },

  async assignIssueToUser(
    issueId: string,
    username: string,
    pullRequestUrl: string,
  ): Promise<void> {
    return LogService.logProgress(
      `Assigning ${issueId} to ${username}`,
      JiraService.assignIssueToUser(issueId, username, pullRequestUrl),
    );
  },

  async getBoardIssues(boardId: string): Promise<Issue[]> {
    return LogService.logProgress(
      `Getting issues of board ${boardId}`,
      JiraService.getBoardIssues(boardId),
    );
  },
};
