import { resolve } from 'path';
import { existsSync, readFileSync, unlinkSync } from 'fs';
import { writeFileSync } from 'fs';
import { homedir } from 'os';
import { LogService } from './LogService';

interface Config {
  $spec: string;
  githubToken: string;
  jiraHost: string;
  jiraUser: string;
  jiraPassword: string;
  githubUserToJiraUser: {
    [key: string]: string;
  };
}

const CONFIG_PATH = resolve(homedir(), '.seniore.json');

const { repository } = JSON.parse(
  readFileSync(resolve(__dirname, '../../package.json'), 'utf-8'),
);

const DEFAULT_CONFIG: Config = {
  $spec: `${repository.url}/blob/master/types/config.d.ts`,
  githubToken: '',
  jiraHost: '',
  jiraUser: '',
  jiraPassword: '',
  githubUserToJiraUser: {},
};

export class ConfigService {
  private static CACHED_CONFIG: null | Config = null;
  private log: LogService;

  constructor({ log }: { log: LogService }) {
    this.log = log;
  }

  init({ force }: { force: boolean }): void {
    const createConfig = (): void => {
      writeFileSync(
        CONFIG_PATH,
        JSON.stringify(DEFAULT_CONFIG, null, 2),
        'utf-8',
      );

      this.log.logText(`${CONFIG_PATH} created`);
    };

    if (existsSync(CONFIG_PATH)) {
      if (force) {
        unlinkSync(CONFIG_PATH);
        createConfig();
      } else {
        this.log.logText(`${CONFIG_PATH} already exists, use --force to reset`);
      }
    } else {
      createConfig();
    }
  }

  getConfig(): Config {
    try {
      ConfigService.CACHED_CONFIG =
        ConfigService.CACHED_CONFIG ||
        (JSON.parse(readFileSync(CONFIG_PATH, 'utf-8')) as Config);
    } catch (error) {
      ConfigService.CACHED_CONFIG = DEFAULT_CONFIG;

      this.log.logText(
        'Invalid config file. You can create a new one with init command.\n',
        {
          error: true,
        },
      );
    }

    return ConfigService.CACHED_CONFIG;
  }
}
