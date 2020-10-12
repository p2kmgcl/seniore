import { GitHubService, Notification, PullRequest } from './GitHubService';
import { LogService } from './LogService';

export const VerboseGitHubService: typeof GitHubService = {
  init() {
    GitHubService.init();
  },

  async addCommentToPullRequest(
    owner: string,
    repo: string,
    number: number,
    comment: string,
  ): Promise<void> {
    return LogService.logProgress(
      `Adding comment to ${repo}/${owner}/${number}`,
      GitHubService.addCommentToPullRequest(owner, repo, number, comment),
    );
  },

  async clearNotifications(): Promise<void> {
    return LogService.logProgress(
      'Clearing notifications',
      GitHubService.clearNotifications(),
    );
  },

  async closePullRequest(
    owner: string,
    repo: string,
    number: number,
  ): Promise<void> {
    return LogService.logProgress(
      `Closing ${owner}/${repo}/${number}`,
      GitHubService.closePullRequest(owner, repo, number),
    );
  },

  async createPullRequest({
    sourceOwner,
    sourceBranch,
    targetOwner,
    targetBranch,
    repo,
    title,
  }: {
    sourceOwner: string;
    sourceBranch: string;
    targetOwner: string;
    targetBranch: string;
    repo: string;
    title: string;
  }): Promise<PullRequest> {
    return LogService.logProgress(
      `Creating pull request in ${targetOwner}/${repo}`,
      GitHubService.createPullRequest({
        sourceOwner,
        sourceBranch,
        targetOwner,
        targetBranch,
        repo,
        title,
      }),
    );
  },

  async getNotifications(): Promise<Notification[]> {
    return LogService.logProgress(
      'Getting notifications',
      GitHubService.getNotifications(),
    );
  },

  async getPullRequest(
    owner: string,
    repo: string,
    number: number,
  ): Promise<PullRequest> {
    return LogService.logProgress(
      `Getting pull request ${owner}/${repo}/${number} info`,
      GitHubService.getPullRequest(owner, repo, number),
    );
  },

  async getPullRequests(owner: string, repo: string): Promise<PullRequest[]> {
    return LogService.logProgress(
      `Listing pull requests of ${owner}/${repo}`,
      GitHubService.getPullRequests(owner, repo),
    );
  },
};
