export default interface ConfigurationSchema {
  $schema: 'https://raw.githubusercontent.com/p2kmgcl/seniore/master/src/types/configuration.schema.json';
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
