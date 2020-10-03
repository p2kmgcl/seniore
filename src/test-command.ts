import commander from 'commander';

export const testCommand = async (
  defineCommand: (program: commander.Command) => void,
  argv: string[] = [],
): Promise<void> => {
  const program = new commander.Command();

  defineCommand(program);

  const commandName = program.commands[0]._name as string;

  await program.parseAsync([commandName, ...argv], { from: 'user' });
};
