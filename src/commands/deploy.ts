import { homedir } from 'os';
import { defineCommand } from '../define-command';
import { GitService } from '../services/GitService';
import { LogService } from '../services/LogService';
import { ModuleService } from '../services/ModuleService';
import { RunService } from '../services/RunService';

export const deploy = defineCommand({
  command: 'deploy',
  alias: 'd',
  description: 'deploy current Liferay module',
  options: [
    {
      definition: '-a, --all',
      description: 'deploy all modified modules instead of current path',
      defaultValue: false,
    },
    {
      definition: '-c, --clean',
      description: 'do a clean deploy',
      defaultValue: true,
    },
  ],
  handler: async ({
    all = false,
    clean = true,
  }: {
    all: boolean;
    clean: boolean;
  }) => {
    const gradlew = ModuleService.getGradlewPath();
    const baseDirectory = await GitService.getBaseDirectory();

    if (!baseDirectory) {
      throw new Error('no git repository found');
    }

    if (!gradlew) {
      throw new Error('gradlew not found');
    } else {
      LogService.logText(`Gradlew: ${gradlew.replace(homedir(), '~')}`);
    }

    if (all) {
      const modifiedModules = new Set<string>(
        (await GitService.getModifiedFiles())
          .map((module) => ModuleService.getModulePath(module) || '')
          .filter((module) => module),
      );

      if (!modifiedModules.size) {
        throw new Error('no modified modules');
      }

      const errors: Record<string, Error> = {};

      LogService.logText(`Found ${modifiedModules.size} module(s)`);

      for (const modifiedModule of modifiedModules) {
        LogService.logText(
          `\nModule: ${modifiedModule.replace(baseDirectory, '')}`,
        );

        try {
          await RunService.runCommand(
            `${gradlew} ${clean ? 'clean' : ''} deploy -Dbuild=portal`,
            { cwd: modifiedModule, bindIO: true },
          );
        } catch (error) {
          errors[modifiedModule] = error as Error;
        }
      }

      if (errors.length) {
        throw new Error(
          `Errors found during deploy:\n${Object.entries(errors)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n')}`,
        );
      }
    } else {
      const modulePath = ModuleService.getModulePath();

      if (!modulePath) {
        throw new Error('module not found');
      }

      LogService.logText(`Module: ${modulePath.replace(baseDirectory, '')}`);

      await RunService.runCommand(
        `${gradlew} ${clean ? 'clean' : ''} deploy -Dbuild=portal`,
        { cwd: modulePath, bindIO: true },
      );
    }
  },
});
