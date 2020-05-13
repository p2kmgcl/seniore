import execa from 'execa';

export class RunService {
  async runCommand(command: string): Promise<string> {
    const { stdout } = await execa.command(command);

    return stdout;
  }
}
