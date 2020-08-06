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

function checkJiraConfiguration(): void {
  if (!jira) {
    throw new Error(
      'Invalid Jira configuration. Please check your configuration file.',
    );
  }
}

export const JiraService = {
  init(): void {
    const { jira: jiraConfig } = ConfigService.getConfig();

    if (jiraConfig.host && jiraConfig.username && jiraConfig.password) {
      jira = new JiraAPI({
        protocol: 'https',
        host: jiraConfig.host,
        username: jiraConfig.username,
        password: jiraConfig.password,
        strictSSL: true,
        apiVersion: '2',
      });
    }
  },

  async getBoardIssues(boardId: string): Promise<Issue[]> {
    checkJiraConfiguration();

    try {
      const { issues } = await jira.getIssuesForBoard(boardId);

      return issues.map((issue) => ({
        key: issue.key,
        title: issue.fields.summary,
        url: `https://${ConfigService.getConfig().jira.host}/browse/${
          issue.key
        }`,
        description: issue.fields.customfield_10421 || '',
        assignee: issue.fields.assignee.displayName,
        status: issue.fields.status.name,
      }));
    } catch (error) {
      if (error.statusCode === 403) {
        throw new Error(
          'Jira authentication error.\n' +
            'Please check if you have permissions to access this board.',
        );
      }

      if (error.error?.errors?.rapidViewId) {
        throw new Error(error.error.errors.rapidViewId);
      }

      throw error;
    }
  },

  async assignIssueToUser(
    issueId: string,
    username: string,
    pullRequestUrl: string,
  ): Promise<void> {
    checkJiraConfiguration();

    try {
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
    } catch (error) {
      if (error.statusCode === 403) {
        throw new Error(
          'Jira authentication error.\n' +
            'Please check if you have permissions to update this issue.',
        );
      }

      if (error.error?.errorMessages?.[0]) {
        throw new Error(error.error.errorMessages[0]);
      }

      throw error;
    }
  },
};
