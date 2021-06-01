import execa from 'execa';

export const RunService = {
  async runCommand(
    command: string,
    { cwd, bindIO }: { cwd?: string; bindIO?: boolean } = {},
  ): Promise<string> {
    const { stdout } = await execa.command(command, {
      cwd,
      stdout: bindIO ? process.stdout : undefined,
      stderr: bindIO ? process.stderr : undefined,
      stdin: bindIO ? process.stdin : undefined,
    });

    return stdout;
  },
};
