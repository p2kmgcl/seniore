import { GitService } from './GitService';
import { LogService } from './LogService';

export const VerboseGitService: typeof GitService = {
  async createBranch(name: string, fromBranch?: string): Promise<void> {
    return LogService.logProgress(
      `Creating branch ${name}${fromBranch ? `from ${fromBranch}` : ''}`,
      GitService.createBranch(name, fromBranch),
    );
  },

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

  async fetchBranch(
    remote: string,
    branch: string,
    localBranch: string = branch,
  ): Promise<void> {
    return LogService.logProgress(
      `Fetching ${branch} from ${remote} into ${localBranch}`,
      GitService.fetchBranch(remote, branch, localBranch),
    );
  },

  getLastCommitMessage(): Promise<string> {
    return GitService.getLastCommitMessage();
  },

  getRemotes(): Promise<string[]> {
    return GitService.getRemotes();
  },

  async getRepositoryName(): Promise<string> {
    return GitService.getRepositoryName();
  },

  async getRepositoryOwner(): Promise<string> {
    return GitService.getRepositoryOwner();
  },

  getBaseDirectory(): Promise<string> {
    return GitService.getBaseDirectory();
  },

  getModifiedFiles(): Promise<string[]> {
    return GitService.getModifiedFiles();
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
