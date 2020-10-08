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
5. Now you can use `seniore` commands normally, it will use your local
   repository.

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

We use semver for every release, and these are made manually following these
steps:

1. Checklist before release:
   - [ ] `docs: x` update outdated documentation.
   - [ ] `build: Update/Remove x` update dependencies (`npm audit`, `npm outdated`).
   - [ ] `fix/test: x` run all tests and linters.
2. Update `package.json` and `package-lock.json` version number and
   commit `build(release) Prepare vX.X.X`.
3. Create GitHub release (`vX.X.X` release title and tag) and
   write changelog (use `npm run show-changelog` as base).
4. Fetch and checkout GitHub generated tag `vX.X.X`.
5. `npm publish`.

### Publishing a pre-release

In case of publishing a pre-release in order to test some new functionallity,
the steps are the same than publishing a regular release, except:

- The package version and tag name will be `vX.X.X-rcY`, being `X.X.X` the future
  stable version (ex. `2.12.1`) and `Y` an incremental number starting from 1
  (`v2.12.1-rc1`, `v2.12.1-rc2` ...).
- `npm publish --tag next` should be run instead of `npm publish`, to avoid
  overriding existing stable release.

[1]: https://www.conventionalcommits.org/en/v1.0.0/#specification
[2]: https://github.com/p2kmgcl/seniore/blob/master/CONTRIBUTING.md#release-cycle
