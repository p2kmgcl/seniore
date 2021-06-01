import { Command } from 'commander';
import { readFileSync } from 'fs';
import updateNotifier from 'update-notifier';
import { resolve } from 'path';
import chalk from 'chalk';
import { init } from './commands/init';
import { checkoutPullRequest } from './commands/checkout-pull-request';
import { deploy } from './commands/deploy';
import { sendPullRequest } from './commands/send-pull-request';
import { listIssues } from './commands/list-issues';
import { listPullRequests } from './commands/list-pull-requests';
import { listNotifications } from './commands/list-notifications';
import { LogService } from './services/LogService';
import { GitHubService } from './services/GitHubService';
import { ConfigService } from './services/ConfigService';
import { JiraService } from './services/JiraService';

const program = new Command();

const pkg = JSON.parse(
  readFileSync(resolve(__dirname, '../package.json'), 'utf-8'),
);

const unindent = (str: string): string =>
  str
    .split('\n')
    .map((part: string) => part.trim())
    .join('\n')
    .trim();

[
  init,
  checkoutPullRequest,
  deploy,
  sendPullRequest,
  listIssues,
  listPullRequests,
  listNotifications,
].forEach((command) => {
  command(program);
});

program.description(
  unindent(`
    Custom list of github and jira related commands currently customized to
    behave as an ordinary Liferay workflow.

    *About \`username\` parameter*: in Liferay, we make PRs to forked repos
    instead of using the upstream repository. Because of this, if \`username\`
    is not specified in some command, it defaults to the *origin* remote instead
    of upstream.
  `),
);

program.option(
  '--verbose-error',
  'show full stack trace when a fatal error occurs',
);

program.action(() => {
  LogService.logText(program.helpInformation());
});

updateNotifier({
  pkg,
}).notify({
  isGlobal: true,
  boxenOptions: {
    align: 'left',
    padding: 1,
    borderColor: 'green',
  },
  message: unindent(`
    Update available {currentVersion} -> ${chalk.bold.green('{latestVersion}')}.
    Run ${chalk.bold.cyan.italic('{updateCommand}')} to update.
    See changes in ${pkg.repository.url}/releases/tag/v{latestVersion}
  `),
});

if (!['init', 'i'].includes(process.argv[2])) {
  if (ConfigService.validate()) {
    GitHubService.init();
    JiraService.init();
  } else {
    process.exit(1);
  }
}

program.version(pkg.version);
program.parse(process.argv);
