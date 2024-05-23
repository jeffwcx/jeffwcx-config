# @jeffwcx/license

Generate license file.

```bash
npm install -g @jeffwcx/license

lic
```

or

```bash
npx @jeffwcx/license
```

## Directly generate the specified license

```bash
lic apache
```

This will generate the **Apache License 2.0** License

### Sorting criteria (in descending order of proportion)

- Popularity (Is it widely known?)
- OSI Approved
- FSF Free
- Software
- CC
- Documentation
- Fonts
- Hardware
- Version
- Name Length

## Commands

<!-- commands -->

- [`lic [LICENSE]`](#lic-license)

## `lic [LICENSE]`

Generate license file.

```
USAGE
  $ lic  [LICENSE] [-f <value>] [-p <value>] [-t
    WellKnown|OSI|FSF|CC|Documentation|Fonts|Hardware|Deprecated]

FLAGS
  -f, --file=<value>      [default: ./LICENSE]
  -p, --pageSize=<value>  [default: 10]
  -t, --tags=<option>...  <options: WellKnown|OSI|FSF|CC|Documentation|Fonts|Hardware|Deprecated>

DESCRIPTION
  Generate license file.

ALIASES
  $ lic license

EXAMPLES
  Select your license file.

    $ lic

  If you dont know which license you should choose, you can use this command to help you choose

    $ lic -i
```

<!-- commandsstop -->
