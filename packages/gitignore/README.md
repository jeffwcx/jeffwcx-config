# @jeffwcx/gitignore

Generate `.gitignore` file, using [gitignore.io](https://docs.gitignore.io/use/api)

# Usage

```bash
$ npm install -g @jeffwcx/gitignore

$ gi
```

# Commands

  <!-- commands -->
* [`gi [ENVNAMES]`](#gi-envnames)

## `gi [ENVNAMES]`

Generate `.gitignore` file.

```
USAGE
  $ gi  [ENVNAMES] [-f <value>]

FLAGS
  -f, --file=<value>  [default: ./.gitignore]

DESCRIPTION
  Generate `.gitignore` file.

ALIASES
  $ gi gitignore

EXAMPLES
  Generate `.gitignore` through interactive selection

    $ gi

  Generate the `.gitignore` file in the current directory that adapt to macOS, Windows, Linux, and Node.js
  environments

    $ gi macos,windows,linux,node
```
<!-- commandsstop -->
