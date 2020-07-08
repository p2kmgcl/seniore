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

let octokit: Octokit;

const getRefStatus = async (
  owner: string,
  repo: string,
  ref: string,
): Promise<RefStatus> => {
  const statuses = await octokit.repos
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
};

const mapPullRequest = async (
  owner: string,
  repo: string,
  gitHubPullRequest: GitHubPullRequest,
): Promise<PullRequest> => {
  return {
    id: `#${gitHubPullRequest.number}`,
    number: gitHubPullRequest.number,
    title: gitHubPullRequest.title,
    url: gitHubPullRequest.html_url,
    creator: gitHubPullRequest.user.login,
    status: await getRefStatus(owner, repo, gitHubPullRequest.head.sha),
  };
};

export const GitHubService = {
  init(): void {
    octokit = new Octokit({
      auth: ConfigService.getConfig().github.token,
    });
  },

  async addCommentToPullRequest(
    owner: string,
    repo: string,
    number: number,
    comment: string,
  ): Promise<void> {
    try {
      await octokit.issues.createComment({
        owner,
        repo,
        issue_number: number,
        body: comment,
      });
    } catch (error) {
      throw new Error(
        `Couldn't add comment to PR https://github.com/${owner}/${repo}/pull/${number}. Please check if you have permissions for this repository.`,
      );
    }
  },

  async clearNotifications(): Promise<void> {
    try {
      await octokit.activity.markNotificationsAsRead();
    } catch (error) {
      if (error.status === 401) {
        throw new Error(
          'GitHub authentication needed. Please check your GitHub configuration.',
        );
      }

      throw error;
    }
  },

  async closePullRequest(
    owner: string,
    repo: string,
    number: number,
  ): Promise<void> {
    try {
      await octokit.pulls.update({
        owner,
        repo,
        pull_number: number,
        state: 'closed',
      });
    } catch (error) {
      throw new Error(
        `Couldn't close PR https://github.com/${owner}/${repo}/pull/${number}. Please check if you have write permissions for this repository.`,
      );
    }
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
    try {
      return mapPullRequest(
        targetOwner,
        repo,
        await octokit.pulls
          .create({
            owner: targetOwner,
            repo,
            title,
            head: `${sourceOwner}:${sourceBranch}`,
            base: targetBranch,
          })
          .then(({ data }) => data),
      );
    } catch (error) {
      if (error.status === 404) {
        throw new Error(
          `${targetOwner}/${repo} repository not found. Please check if you have permissions to create pull requests here.`,
        );
      }

      if (error?.errors?.[0]?.message) {
        throw new Error(error.errors[0].message);
      }

      throw error;
    }
  },

  async getNotifications(): Promise<Notification[]> {
    try {
      const {
        data,
      } = await octokit.activity.listNotificationsForAuthenticatedUser();

      return data.map((notification) => ({
        id: formatDistanceToNowStrict(new Date(notification.updated_at)),
        title: notification.subject.title,
        repository: notification.repository.full_name,
        reason: notification.reason,
      }));
    } catch (error) {
      if (error.status === 401) {
        throw new Error(
          'GitHub authentication needed. Please check your GitHub configuration.',
        );
      }

      throw error;
    }
  },

  async getPullRequest(
    owner: string,
    repo: string,
    number: number,
  ): Promise<PullRequest> {
    try {
      const { data: pullRequest } = await octokit.pulls.get({
        owner,
        repo,
        pull_number: number,
      });

      return mapPullRequest(owner, repo, pullRequest);
    } catch (error) {
      if (error.status === 404) {
        throw new Error(
          `${owner}/${repo} repository not found. Please check if you have access permissions.`,
        );
      }

      throw error;
    }
  },

  async getPullRequests(owner: string, repo: string): Promise<PullRequest[]> {
    try {
      const { data } = await octokit.pulls.list({
        owner,
        repo,
      });

      const pullRequests: PullRequest[] = [];

      for (const pullRequest of data) {
        pullRequests.push(await mapPullRequest(owner, repo, pullRequest));
      }

      return pullRequests;
    } catch (error) {
      if (error.status === 404) {
        throw new Error(
          `${owner}/${repo} repository not found. Please check if you have access permissions.`,
        );
      }

      throw error;
    }
  },
};
