## Description

<!-- Please include a summary of the changes and relevant context -->

## Type of change

Please use semantic commit messages for your commits:

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation only changes
- `style:` - Changes that do not affect the meaning of the code
- `refactor:` - A code change that neither fixes a bug nor adds a feature
- `perf:` - A code change that improves performance
- `test:` - Adding missing tests or correcting existing tests
- `chore:` - Changes to the build process or auxiliary tools

For breaking changes, add `BREAKING CHANGE` to the commit body or footer or add
a `!` after the type and before the `:`.

Example:

```
feat: add new extraction API

BREAKING CHANGE: removes the legacy extraction method
```

or

```
feat!: remove legacy extraction method
```

## Checklist:

- [ ] My code follows the project's coding style
- [ ] My commits follow the semantic commit convention
- [ ] I have performed a self-review of my changes
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] I have updated the documentation accordingly
