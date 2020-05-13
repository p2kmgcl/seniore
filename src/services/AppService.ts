import { GitService } from './GitService';
import { RunService } from './RunService';
import { ConfigService } from './ConfigService';
import { LogService } from './LogService';
import { GitHubService } from './GitHubService';
import { JiraService } from './JiraService';

export class AppService {
  public readonly config: ConfigService;
  public readonly log: LogService;
  public readonly git: GitService;
  public readonly gitHub: GitHubService;
  public readonly jira: JiraService;
  public readonly run: RunService;

  constructor() {
    this.log = new LogService();
    this.config = new ConfigService({ log: this.log });
    this.run = new RunService();
    this.git = new GitService({ runService: this.run });
    this.gitHub = new GitHubService({ config: this.config });
    this.jira = new JiraService({ config: this.config });
  }
}
