export default interface ConfigurationSchema {
  $schema: 'https://github.com/p2kmgcl/seniore/blob/master/types/configuration.schema.json';
  github: {
    token: string;
  };
  jira: {
    host: string;
    username: string;
    password: string;
  };
  githubUserToJiraUser: {
    [githubUser: string]: string;
  };
}
