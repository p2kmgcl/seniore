import { testCommand } from '../../test-command';
import { sendPullRequest } from '../send-pull-request';
import { GitHubService } from '../../services/GitHubService';
import { LogService } from '../../services/LogService';
import { GitService } from '../../services/GitService';
import { ConfigService } from '../../services/ConfigService';

jest.mock('../../services/ConfigService');
jest.mock('../../services/GitService');
jest.mock('../../services/GitHubService');
jest.mock('../../services/JiraService');
jest.mock('../../services/LogService');

const MockedConfigService = ConfigService as jest.Mocked<typeof ConfigService>;
const MockedGitService = GitService as jest.Mocked<typeof GitService>;
const MockedGitHubService = GitHubService as jest.Mocked<typeof GitHubService>;
const MockedLogService = LogService as jest.Mocked<typeof LogService>;

describe('commands/send-pull-request', () => {
  const repositoryName = 'repository';
  const targetPRNumber = 123;
  const originalOwner = 'they';
  const originalPRNumber = 412;
  const originalTitle = 'LPS-1234 Change some stuff';

  beforeEach(() => {
    MockedConfigService.getConfig.mockReturnValue({
      github: { token: '' },
      jira: { host: '', password: '', username: '' },
      githubUserToJiraUser: {},
    });

    MockedGitService.getLastCommitMessage.mockReturnValue(
      Promise.resolve(originalTitle),
    );

    MockedGitService.getCurrentBranchName.mockReturnValue(
      Promise.resolve(`pr/${originalOwner}/${originalPRNumber}`),
    );

    MockedGitService.getRepositoryOwner.mockReturnValue(
      Promise.resolve('localOwner'),
    );

    MockedGitService.getRepositoryName.mockReturnValue(
      Promise.resolve(repositoryName),
    );

    MockedGitHubService.getPullRequest.mockImplementation(
      async (owner, repo, number) => {
        return {
          id: number.toString(),
          number,
          url: `https://github.com/${owner}/${repo}/pull/${number}`,
          creator: originalOwner,
          title: originalTitle,
          status: 'Pending',
        };
      },
    );

    MockedGitHubService.createPullRequest.mockImplementation(
      async ({ sourceOwner, repo, targetOwner, title }) => ({
        id: targetPRNumber.toString(),
        number: targetPRNumber,
        status: 'Pending',
        title,
        creator: sourceOwner,
        url: `https://github.com/${targetOwner}/${repo}/pull/${targetPRNumber}`,
      }),
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('logs the created pull request url', async () => {
    await testCommand(sendPullRequest, ['you']);

    expect(MockedLogService.logText).toHaveBeenCalledWith(
      `https://github.com/you/${repositoryName}/pull/${targetPRNumber}`,
    );
  });

  it('adds a ci:forward comment if --forward is specified', async () => {
    await testCommand(sendPullRequest, ['--forward', 'you']);

    expect(MockedGitHubService.addCommentToPullRequest).toHaveBeenCalledWith(
      'you',
      repositoryName,
      targetPRNumber,
      'ci:forward',
    );
  });

  it('adds a ci:forward comment if -f is specified', async () => {
    await testCommand(sendPullRequest, ['--forward', 'you']);

    expect(MockedGitHubService.addCommentToPullRequest).toHaveBeenCalledWith(
      'you',
      repositoryName,
      targetPRNumber,
      'ci:forward',
    );
  });

  it('closes previous pull request if branch name matches', async () => {
    await testCommand(sendPullRequest, ['you']);

    expect(MockedGitHubService.closePullRequest).toHaveBeenCalledWith(
      originalOwner,
      repositoryName,
      412,
    );
  });

  it('mentions previous pull request opener', async () => {
    await testCommand(sendPullRequest, ['you']);

    expect(MockedGitHubService.addCommentToPullRequest).toHaveBeenCalledWith(
      'you',
      repositoryName,
      targetPRNumber,
      `/cc @${originalOwner}`,
    );
  });
});
