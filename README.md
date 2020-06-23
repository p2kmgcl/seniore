<h1 align="center">
  <img
    name="logo"
    src="https://raw.githubusercontent.com/p2kmgcl/seniore/master/assets/logo.png"
    alt="Seniore logo, a yellow and pink diamond"
    width="200"
  />
  <br />
  Seniore
</h1>

<h4 align="center">
  Gracefully manage your GitHub and Jira workflow<br><br>

  <a href="https://github.com/p2kmgcl/seniore/releases">
    <img alt="GitHub release" src="https://img.shields.io/github/release/p2kmgcl/seniore.svg">
  </a>
  <a href="https://www.npmjs.com/package/seniore">
    <img alt="NPM release" src="https://img.shields.io/npm/v/seniore.svg">
  </a>
  <a href="https://github.com/p2kmgcl/seniore/blob/master/package.json">
    <img alt="Node version" src="https://img.shields.io/node/v/seniore">
  </a>
  <a href="https://github.com/p2kmgcl/seniore/blob/master/LICENSE">
    <img alt="License" src="https://img.shields.io/github/license/p2kmgcl/seniore">
  </a>
  <br>
  <a href="https://github.com/p2kmgcl/seniore/pulls">
    <img alt="Openned issues" src="https://img.shields.io/github/issues/p2kmgcl/seniore">
  </a>
  <a href="https://github.com/p2kmgcl/seniore/pulls">
    <img alt="Openned pull requests" src="https://img.shields.io/github/issues-pr/p2kmgcl/seniore">
  </a>
  <br>
  <a href="https://paypal.me/p2kmgcl">
    <img alt="PayPal donations" src="https://img.shields.io/badge/donations-paypal-blue">
  </a>
</h4>

```
Custom list of github and jira related commands currently customized to
behave as an ordinary Liferay workflow.

*About `username` parameter*: in Liferay, we make PRs to forked repos
instead of using the upstream repository. Because of this, if `username`
is not specified in some command, it defaults to the *origin* remote instead
of upstream.

Options:
  --verbose-error                             show full stack trace when a fatal error occurs
  -V, --version                               output the version number
  -h, --help                                  display help for command

Commands:
  init|i [options]                            initialize config file
  checkout-pull-request|c [options] <number>  checkout specified PR
  send-pull-request|s [options] <username>    send current branch as PR
  list-issues|li <boardId>                    list JIRA board issues
  list-pull-requests|lp [options]             list existing pull requests
  list-notifications|ln [options]             list GitHub notifications
```
