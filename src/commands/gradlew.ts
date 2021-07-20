import { homedir } from 'os';
import { defineCommand } from '../define-command';
import { GitService } from '../services/GitService';
import { LogService } from '../services/LogService';
import { ModuleService } from '../services/ModuleService';
import { RunService } from '../services/RunService';

export const gradlew = defineCommand({
  command: 'gradlew [command...]',
  alias: 'g',
  description: 'finds and uses local gradlew binary',
  options: [],
  handler: async (command: string[]) => {
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

    const modulePath = ModuleService.getModulePath();

    if (!modulePath) {
      throw new Error('module not found');
    }

    LogService.logText(`Module: ${modulePath.replace(baseDirectory, '')}`);
    LogService.logText(`Command: gradlew ${command.join(' ')}`);

    await RunService.runCommand(`${gradlew} ${command.join(' ')}`, {
      cwd: modulePath,
      bindIO: true,
    });
  },
});
