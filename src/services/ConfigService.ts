import { resolve } from 'path';
import { existsSync, readFileSync, unlinkSync } from 'fs';
import { writeFileSync } from 'fs';
import { homedir } from 'os';
import { LogService } from './LogService';
import Ajv from 'ajv';
import ConfigurationSchema from '../types/configuration.schema';
import ConfigurationSchemaDefinition from '../types/configuration.schema.json';

const CONFIG_PATH = resolve(homedir(), '.seniore.json');

const DEFAULT_CONFIG: ConfigurationSchema = {
  $schema:
    'https://raw.githubusercontent.com/p2kmgcl/seniore/master/src/types/configuration.schema.json',
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
        'Configuration file doesnt exist or is not a JSON file. ' +
          'You can create a new one with init command.',
        {
          error: true,
        },
      );
    }

    return cachedConfig;
  },

  validate(): boolean {
    const config = this.getConfig();

    if (!config || config === DEFAULT_CONFIG) {
      return false;
    }

    const cleanedConfig = { ...config };
    const validateSchema = new Ajv().compile(ConfigurationSchemaDefinition);

    delete cleanedConfig.$schema;

    if (!validateSchema(cleanedConfig)) {
      LogService.logText(
        'Invalid configuration file. ' +
          'Try to regenerate it with the `init` command ' +
          'or fix the following errors:',
        { error: true },
      );

      validateSchema.errors?.forEach((error) => {
        LogService.logText(`- ${error.message}`);
      });

      if (!validateSchema.errors || !validateSchema.errors.length) {
        LogService.logText('No errors found', { dim: true });
      }

      return false;
    }

    return true;
  },
};
