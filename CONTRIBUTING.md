# Contributing to Distille

Thank you for your interest in contributing to Distille!

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/)
specification for our commit messages:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (formatting,
  etc.)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools

### Breaking Changes

Breaking changes should be indicated by:

1. Adding an `!` after the type/scope: `feat!: remove legacy API`
2. Adding a footer with `BREAKING CHANGE:` followed by description

Example:

```
feat: add new extraction API

BREAKING CHANGE: removes the legacy extraction method
```

### Scope

The scope can be anything specifying the place of the commit change, such as:

- **core**: Changes to the core package
- **ui**: Changes to the UI components
- **cli**: Changes to the CLI interface

## Pull Request Process

1. Ensure all your commits follow the Conventional Commits format
2. Update documentation where applicable
3. Add tests for any new features
4. Make sure all tests pass
5. Pull requests will be merged after review and approval

## Development Setup

1. Clone the repository
2. Install Deno by following the
   [official installation guide](https://deno.land/manual/getting_started/installation)
3. Run tests with `deno test`

## Versioning

We use [Semantic Versioning](https://semver.org/) for our releases. The version
numbers are automatically determined from commit messages through
semantic-release.
