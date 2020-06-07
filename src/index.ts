import { Command } from 'commander';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { init } from './commands/init';
import { checkoutPullRequest } from './commands/checkout-pull-request';
import { sendPullRequest } from './commands/send-pull-request';
import { listIssues } from './commands/list-issues';
import { listPullRequests } from './commands/list-pull-requests';
import { listNotifications } from './commands/list-notifications';
import { LogService } from './services/LogService';

const program = new Command();

const { version } = JSON.parse(
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
  new LogService().logText(program.helpInformation());
});

program.version(version);
program.parse(process.argv);
