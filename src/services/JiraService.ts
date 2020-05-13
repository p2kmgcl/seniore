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

export class JiraService {
  private jira: JiraAPI;
  private config: ConfigService;

  constructor({ config }: { config: ConfigService }) {
    this.config = config;

    const { jiraHost, jiraPassword, jiraUser } = config.getConfig();

    this.jira = new JiraAPI({
      protocol: 'https',
      host: jiraHost,
      username: jiraUser,
      password: jiraPassword,
      strictSSL: true,
      apiVersion: '2',
    });
  }

  async getBoardIssues(boardId: string): Promise<Issue[]> {
    const issues = await this.jira.getIssuesForBoard(boardId);

    return issues.map((issue) => ({
      key: issue.key,
      title: issue.fields.summary,
      url: `https://${this.config.getConfig().jiraHost}/browse/${issue.key}`,
      description: issue.fields.customfield_10421 || '',
      assignee: issue.fields.assignee.displayName,
      status: issue.fields.status.name,
    }));
  }

  async assignIssueToUser(
    issueId: string,
    username: string,
    pullRequestUrl: string,
  ): Promise<void> {
    const transition = (
      await this.jira.listTransitions(issueId)
    ).transitions.find(
      (transition) => transition.name === 'Code Review Request',
    );

    if (transition) {
      await this.jira.transitionIssue(issueId, {
        transition,

        fields: {
          customfield_10421: pullRequestUrl,
          assignee: { name: username },
        },
      });
    } else {
      await this.jira.updateIssue(issueId, {
        fields: {
          customfield_10421: pullRequestUrl,
        },
      });
    }
  }
}
