# @jeffwcx/cli

Some configurations cannot be achieved through sharing and can only be generated through cli, for example: .gitignore, license, etc.

## Usage

```
npm i -g @jeffwcx/cli
```

## Features

### Genereate .gitignore

```bash
jeff gi Node,macOS,Windows
```

If you want to select interactively:

```bash
jeff gi
```

### Choose License

```bash
jeff lic
```

### Genereate simple npm package

```bash
jeff pkg
```

> There are obvious personal preferences for package generation. By default, pnpm and typescript are used.

The default npm package generation will go through the following process:

- detect whether it is a git repo and whether it is an npm package
- If the current directory is within npm pkg, check whether it is a monorepo.
  If the user thinks it is, skip the following two steps.
- genereate .gitignore
- choose license
- select the module type of the package (esm+cjs/only cjs/only esm)
- select bundler(tsup/microbundle...)
- generate npm package files
