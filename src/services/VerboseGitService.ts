import { GitService } from './GitService';
import { LogService } from './LogService';

export const VerboseGitService: typeof GitService = {
  getCurrentBranchName(): Promise<string> {
    return GitService.getCurrentBranchName();
  },

  async checkoutBranch(branch: string): Promise<void> {
    return GitService.checkoutBranch(branch);
  },

  async checkoutPullRequest(
    owner: string,
    repo: string,
    number: number,
  ): Promise<void> {
    return LogService.logProgress(
      `Checking out ${owner}/${repo}/${number}`,
      GitService.checkoutPullRequest(owner, repo, number),
    );
  },

  async deleteBranch(branch: string): Promise<void> {
    return GitService.deleteBranch(branch);
  },

  getLastCommitMessage(): Promise<string> {
    return GitService.getLastCommitMessage();
  },

  async getRepositoryName(): Promise<string> {
    return GitService.getRepositoryName();
  },

  async getRepositoryOwner(): Promise<string> {
    return GitService.getRepositoryOwner();
  },

  async pushBranch(
    branch: string,
    { force = true, remote = 'origin' }: { force?: any; remote?: any } = {},
  ): Promise<void> {
    return LogService.logProgress(
      `Pushing ${branch} to ${remote}`,
      GitService.pushBranch(branch, { force, remote }),
    );
  },
};
