import execa from 'execa';

export const RunService = {
  async runCommand(command: string): Promise<string> {
    const { stdout } = await execa.command(command);

    return stdout;
  },
};
