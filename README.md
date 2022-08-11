# `pnpm-bin`

# Installation

I suggest you globally install this package so it'll be available everywhere for you.

```shell
pnpm add --global justinanastos/pnpm-bin
```

# Purpose

This library enables you to easily run a pnpm installed binary while applying arguments to `node`.

For example, if you want to run `jest` with the node inspector, usually you'd do something like this:

```shell
node --inspect $(npm bin)/jest --runInBand
```

With `pnpm`, you can't do this beacuse the files in `$(npm bin)` are shell scripts. This script will parse those shell scripts and run node for you

# Usage

```shell
pnpm-bin [...nodeArguments] [binaryName] [...binaryArguments]
```

* `nodeArguments` optional list of arguments to pass to `node`
* `binaryName` represents the binary name for the script you want to run
* `binaryArguments` optional list of arguments to pass to your binary

Note that `nodeArguments` and `binaryArguments` are optional.

This command:

```shell
pnpm-bin --inspect jest --watch --runInBand
```

Will translate into this:

```shell
node --inspect [bin to jest] --watch --runInBand
```
