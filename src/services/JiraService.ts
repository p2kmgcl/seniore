import { ConfigService } from './ConfigService';
import JiraAPI from 'jira-client';

interface Issue {
  key: string;
  title: string;
  url: string;
  description: string;
  assignee: string;
  status: string;
}

let jira: JiraAPI;

export const JiraService = {
  init(): void {
    const { jira: jiraConfig } = ConfigService.getConfig();

    jira = new JiraAPI({
      protocol: 'https',
      host: jiraConfig.host,
      username: jiraConfig.username,
      password: jiraConfig.password,
      strictSSL: true,
      apiVersion: '2',
    });
  },

  async getBoardIssues(boardId: string): Promise<Issue[]> {
    const { issues } = await jira.getIssuesForBoard(boardId);

    return issues.map((issue) => ({
      key: issue.key,
      title: issue.fields.summary,
      url: `https://${ConfigService.getConfig().jira.host}/browse/${issue.key}`,
      description: issue.fields.customfield_10421 || '',
      assignee: issue.fields.assignee.displayName,
      status: issue.fields.status.name,
    }));
  },

  async assignIssueToUser(
    issueId: string,
    username: string,
    pullRequestUrl: string,
  ): Promise<void> {
    const transition = (await jira.listTransitions(issueId)).transitions.find(
      (transition) => transition.name === 'Code Review Request',
    );

    if (transition) {
      await jira.transitionIssue(issueId, {
        transition,

        fields: {
          customfield_10421: pullRequestUrl,
          assignee: { name: username },
        },
      });
    } else {
      await jira.updateIssue(issueId, {
        fields: {
          customfield_10421: pullRequestUrl,
        },
      });
    }
  },
};
