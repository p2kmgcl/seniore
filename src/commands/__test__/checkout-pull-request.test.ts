import { testCommand } from '../../test-command';
import { checkoutPullRequest } from '../checkout-pull-request';
import { GitService } from '../../services/GitService';
import { GitHubService } from '../../services/GitHubService';

jest.mock('../../services/GitService');
jest.mock('../../services/GitHubService');

const MockedGitService = GitService as jest.Mocked<typeof GitService>;
const MockedGitHubService = GitHubService as jest.Mocked<typeof GitHubService>;

describe('commands/checkout-pull-request', () => {
  beforeEach(() => {
    MockedGitHubService.getPullRequest.mockImplementation(
      async (owner: string, repo: string, number: number) => ({
        number,
        id: `#${number}`,
        title: `${owner}/${repo}/${number} pull request`,
        url: `https://github.com/${repo}/${owner}/pull/${number}`,
        creator: 'foo',
        status: 'Pending',
      }),
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('checkouts specified pull request', async () => {
    MockedGitService.getRepositoryOwner.mockReturnValue(Promise.resolve('foo'));
    MockedGitService.getRepositoryName.mockReturnValue(Promise.resolve('var'));

    await testCommand(checkoutPullRequest, ['123']);

    expect(MockedGitService.checkoutPullRequest).toHaveBeenCalledWith(
      'foo',
      'var',
      123,
    );
  });

  it('uses given owner if specified with --owner', async () => {
    MockedGitService.getRepositoryName.mockReturnValue(Promise.resolve('var'));

    await testCommand(checkoutPullRequest, ['--owner', 'they', '123']);

    expect(MockedGitService.checkoutPullRequest).toHaveBeenCalledWith(
      'they',
      'var',
      123,
    );
  });

  it('uses given owner if specified with -o', async () => {
    MockedGitService.getRepositoryName.mockReturnValue(Promise.resolve('var'));

    await testCommand(checkoutPullRequest, ['-o', 'they', '123']);

    expect(MockedGitService.checkoutPullRequest).toHaveBeenCalledWith(
      'they',
      'var',
      123,
    );
  });

  it('throws an error if specified number is not a number', async () => {
    await expect(testCommand(checkoutPullRequest, ['OLa'])).rejects.toThrow(
      new Error('Invalid PR number'),
    );
  });

  it('throws an error if PR does not exist', async () => {
    MockedGitService.getRepositoryOwner.mockReturnValue(Promise.resolve('foo'));
    MockedGitService.getRepositoryName.mockReturnValue(Promise.resolve('var'));
    MockedGitHubService.getPullRequest.mockReset();

    await expect(testCommand(checkoutPullRequest, ['1234'])).rejects.toThrow(
      new Error('PR foo/var/1234 not found'),
    );
  });
});
