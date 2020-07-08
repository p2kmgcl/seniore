import commander from 'commander';
import { LogService } from './services/LogService';

interface CommandDefinition {
  command: string;
  alias?: string;
  description: string;
  handler: (...args: any[]) => any;
  options?: Array<{
    definition: string;
    description: string;
    defaultValue?: string | boolean;
  }>;
}

function wrapError<T extends Array<any>, R = void>(
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
        LogService.logText(error.toString(), { error: true });
        process.exit(1);
      }
    }
  };
}

export function defineCommand(
  definition: CommandDefinition,
): (program: commander.Command) => void {
  return (program: commander.Command): void => {
    let builtProgram = program
      .command(definition.command)
      .description(definition.description);

    if (definition.alias) {
      builtProgram = builtProgram.alias(definition.alias);
    }

    for (const option of definition.options || []) {
      builtProgram = builtProgram.option(
        option.definition,
        option.description,
        option.defaultValue,
      );
    }

    builtProgram.action((...args: any[]): any => {
      return wrapError(definition.handler)(...args);
    });
  };
}
