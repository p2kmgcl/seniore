import { formatDistanceToNowStrict } from 'date-fns';
import { Octokit } from '@octokit/rest';
import { ConfigService } from './ConfigService';

type RefStatus = 'Pending' | 'Failure' | 'Success' | 'Unknown';

interface GitHubPullRequest {
  number: number;
  title: string;
  html_url: string;
  head: { sha: string };
  user: { login: string };
}

interface PullRequest {
  id: string;
  number: number;
  title: string;
  url: string;
  creator: string;
  status: RefStatus;
}

interface Notification {
  id: string;
  title: string;
  repository: string;
  reason: string;
}

export class GitHubService {
  private octokit: Octokit;

  constructor({ config }: { config: ConfigService }) {
    this.octokit = new Octokit({ auth: config.getConfig().githubToken });
  }

  async addCommentToPullRequest(
    owner: string,
    repo: string,
    number: number,
    comment: string,
  ): Promise<void> {
    await this.octokit.issues.createComment({
      owner,
      repo,
      issue_number: number,
      body: comment,
    });
  }

  async clearNotifications(): Promise<void> {
    await this.octokit.activity.markNotificationsAsRead();
  }

  async closePullRequest(
    owner: string,
    repo: string,
    number: number,
  ): Promise<void> {
    try {
      await this.octokit.pulls.update({
        owner,
        repo,
        pull_number: number,
        state: 'closed',
      });
    } catch (error) {
      throw new Error(
        `Couldn't close PR https://github.com/${owner}/${repo}/pull/${number}`,
      );
    }
  }

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
    return this.mapPullRequest(
      targetOwner,
      repo,
      await this.octokit.pulls
        .create({
          owner: targetOwner,
          repo,
          title,
          head: `${sourceOwner}:${sourceBranch}`,
          base: targetBranch,
        })
        .then(({ data }) => data),
    );
  }

  async getNotifications(): Promise<Notification[]> {
    const {
      data,
    } = await this.octokit.activity.listNotificationsForAuthenticatedUser();

    return data.map((notification) => ({
      id: formatDistanceToNowStrict(new Date(notification.updated_at)),
      title: notification.subject.title,
      repository: notification.repository.full_name,
      reason: notification.reason,
    }));
  }

  private async getRefStatus(
    owner: string,
    repo: string,
    ref: string,
  ): Promise<RefStatus> {
    const statuses = await this.octokit.repos
      .listCommitStatusesForRef({
        ref,
        owner,
        repo,
      })
      .then(({ data: statuses }) =>
        statuses.filter(
          (statusA, statusAIndex) =>
            statuses.findIndex(
              (statusB) => statusA.context === statusB.context,
            ) === statusAIndex,
        ),
      );

    return statuses.length
      ? statuses.some((status) => status.state === 'pending')
        ? 'Pending'
        : statuses.some((status) => status.state === 'failure')
        ? 'Failure'
        : statuses.every((status) => status.state === 'success')
        ? 'Success'
        : 'Unknown'
      : 'Unknown';
  }

  async getPullRequest(
    owner: string,
    repo: string,
    number: number,
  ): Promise<PullRequest> {
    const { data: pullRequest } = await this.octokit.pulls.get({
      owner,
      repo,
      pull_number: number,
    });

    return this.mapPullRequest(owner, repo, pullRequest);
  }

  async getPullRequests(owner: string, repo: string): Promise<PullRequest[]> {
    try {
      const { data } = await this.octokit.pulls.list({
        owner,
        repo,
      });

      const pullRequests: PullRequest[] = [];

      for (const pullRequest of data) {
        pullRequests.push(await this.mapPullRequest(owner, repo, pullRequest));
      }

      return pullRequests;
    } catch (error) {
      if (error && error.status === 404) {
        throw new Error(`${owner}/${repo} repository not found`);
      }

      throw error;
    }
  }

  private async mapPullRequest(
    owner: string,
    repo: string,
    gitHubPullRequest: GitHubPullRequest,
  ): Promise<PullRequest> {
    return {
      id: `#${gitHubPullRequest.number}`,
      number: gitHubPullRequest.number,
      title: gitHubPullRequest.title,
      url: gitHubPullRequest.html_url,
      creator: gitHubPullRequest.user.login,
      status: await this.getRefStatus(owner, repo, gitHubPullRequest.head.sha),
    };
  }
}
