declare module 'jira-client' {
  interface Issue {
    key: string;
    fields: {
      summary: string;
      customfield_10421?: string;
      assignee: { displayName: string };
      status: { name: string };
    };
  }

  interface Transition {
    name: string;
  }

  class JiraAPI {
    constructor(options: {
      protocol: 'https';
      host: string;
      username: string;
      password: string;
      strictSSL: boolean;
      apiVersion: '2';
    });

    listTransitions(issueId: string): Promise<{ transitions: Transition[] }>;
    getIssuesForBoard(boardId: string): Promise<Issue[]>;

    transitionIssue(
      issueId: string,
      options: {
        transition: Transition;
        fields: { customfield_10421: string; assignee: { name: string } };
      },
    ): Promise<void>;

    updateIssue(
      issueId: string,
      options: {
        fields: {
          customfield_10421: string;
        };
      },
    ): Promise<void>;
  }

  export = JiraAPI;
}
