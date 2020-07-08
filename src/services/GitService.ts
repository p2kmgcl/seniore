import { RunService } from './RunService';

export const GitService = {
  getLastCommitMessage(): Promise<string> {
    return RunService.runCommand('git log -1 --pretty=%s');
  },

  getCurrentBranchName(): Promise<string> {
    return RunService.runCommand('git rev-parse --abbrev-ref HEAD');
  },

  async getRepositoryName(): Promise<string> {
    try {
      const data = /:([^/]+)\/([^.]+)\.git$/.exec(
        await RunService.runCommand('git remote get-url origin'),
      );

      if (!data || !data[2]) {
        throw new Error();
      }

      return data[2];
    } catch (error) {
      throw new Error('Not a git repository or no "origin" remote');
    }
  },

  async getRepositoryOwner(): Promise<string> {
    try {
      const data = /:([^/]+)\/([^.]+)\.git$/.exec(
        await RunService.runCommand('git remote get-url origin'),
      );

      if (!data || !data[1]) {
        throw new Error();
      }

      return data[1];
    } catch (error) {
      throw new Error('Not a git repository or no "origin" remote');
    }
  },

  async checkoutBranch(branch: string): Promise<void> {
    await RunService.runCommand(`git checkout ${branch}`);
  },

  async checkoutPullRequest(
    owner: string,
    repo: string,
    number: number,
  ): Promise<void> {
    await RunService.runCommand(
      `git fetch --force --update-head-ok https://github.com/${owner}/${repo} refs/pull/${number}/head:pr/${owner}/${number}`,
    );

    await RunService.runCommand(`git checkout pr/${owner}/${number}`);
  },

  async deleteBranch(branch: string): Promise<void> {
    await RunService.runCommand(`git branch -D ${branch}`);
  },

  async pushBranch(
    branch: string,
    { force = true, remote = 'origin' } = {},
  ): Promise<void> {
    await RunService.runCommand(
      `git push ${force ? '--force' : ''} ${remote} ${branch}`,
    );
  },
};
