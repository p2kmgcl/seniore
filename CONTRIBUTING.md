# Contributing

When contributing to this repository, please first discuss the change you wish
to make with the owners of this repository via issue, email, or any other
method before making a change.

## Local development

In order to test your changes without having them published, you can use
`npm link` feature:

1. Ensure you have uninstalled existing `seniore` from global NPM.
2. `cd youtProjectDirectory`.
3. `npm link` (this only has to be runned once, run `npm unlink` to undo).
4. `npm run build [--watch]` compiles the project
5. Now you can use `seniore` commands normally, it will use your local toolkit
   project.

## Pull Request Process

When you create your contribution, please keep this list in mind:

- Start from the existing `master` branch and add your changes.
  **Use [conventional commits][1] to write your commit messages**.
- Create your contribution.
- Ensure any install or build dependencies are removed before the end of the
  layer when doing a build.
- Add tests if necessary.
- Ensure that it passes all tests and linting process and includes needed
  documentation.
- **Do not change the version number manually** (see [Release Cycle][2]).
- Create your pull request against `master` branch and resolve any
  conflicts if necessary.

## Release Cycle

We use semver for every release, and continuous release is automatically
done with CI. However, we should be manually checking repository health status
time by time:

- `docs: x` update outdated documentation.
- `chore: Update/Remove x` update dependencies (`npm audit`, `npm outdated`).
- `fix: x` run all tests and linters.

[1]: https://www.conventionalcommits.org/en/v1.0.0/#specification
[2]: https://github.com/p2kmgcl/seniore/blob/master/CONTRIBUTING.md#release-cycle
