import commander from 'commander';
import { AppService } from './services/AppService';
import { LogService } from './services/LogService';

interface CommandDefinition {
  command: string;
  description: string;
  handler: (app: AppService, ...args: any[]) => any;
  options?: Array<{
    definition: string;
    description: string;
    defaultValue?: string | boolean;
  }>;
}

function wrapError<T extends Array<any>, R = void>(
  log: LogService,
  fn: (...args: T) => R | Promise<R>,
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      const debug = process.argv.some((arg) => arg === '--verbose-error');

      if (debug) {
        throw error;
      } else {
        log.logText(error.toString(), { error: true });
        process.exit(1);
      }
    }
  };
}

export function defineCommand(
  definition: CommandDefinition,
): (program: commander.Command) => void {
  const app = new AppService();

  return (program: commander.Command): void => {
    let builtProgram = program
      .command(definition.command)
      .description(definition.description);

    for (const option of definition.options || []) {
      builtProgram = builtProgram.option(
        option.definition,
        option.description,
        option.defaultValue,
      );
    }

    builtProgram.action((...args: any[]): any => {
      return wrapError(app.log, definition.handler)(app, ...args);
    });
  };
}
