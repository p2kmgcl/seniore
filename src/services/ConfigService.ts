import { resolve } from 'path';
import { existsSync, readFileSync, unlinkSync } from 'fs';
import { writeFileSync } from 'fs';
import { homedir } from 'os';
import { LogService } from './LogService';
import ConfigurationSchema from '../types/configuration.schema';

const CONFIG_PATH = resolve(homedir(), '.seniore.json');

const DEFAULT_CONFIG: ConfigurationSchema = {
  $schema:
    'https://github.com/p2kmgcl/seniore/blob/master/types/configuration.schema.json',
  github: {
    token: '',
  },
  jira: {
    host: '',
    username: '',
    password: '',
  },
  githubUserToJiraUser: {},
};

let cachedConfig: null | ConfigurationSchema = null;

export const ConfigService = {
  init({ force, quiet }: { force: boolean; quiet: boolean }): void {
    const createConfig = (): void => {
      writeFileSync(
        CONFIG_PATH,
        JSON.stringify(DEFAULT_CONFIG, null, 2),
        'utf-8',
      );

      if (!quiet) {
        LogService.logText(`${CONFIG_PATH} created`);
      }
    };

    if (existsSync(CONFIG_PATH)) {
      if (force) {
        unlinkSync(CONFIG_PATH);
        createConfig();
      } else if (!quiet) {
        LogService.logText(
          `${CONFIG_PATH} already exists, use --force to reset`,
        );
      }
    } else {
      createConfig();
    }
  },

  getConfig(): ConfigurationSchema {
    try {
      cachedConfig =
        cachedConfig ||
        (JSON.parse(readFileSync(CONFIG_PATH, 'utf-8')) as ConfigurationSchema);
    } catch (error) {
      cachedConfig = DEFAULT_CONFIG;

      LogService.logText(
        'Invalid config file. You can create a new one with init command.\n',
        {
          error: true,
        },
      );
    }

    return cachedConfig;
  },
};
