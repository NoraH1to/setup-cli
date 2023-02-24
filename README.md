<h1 align="center">Setup-CLI</h1>

<p align="center">Quickly setup everything, or custom it in simple way</p>

<p align="center">
<a href="https://github.com/NoraH1to/setup-cli/actions/workflows/test.yml"><img src="https://github.com/NoraH1to/setup-cli/actions/workflows/test.yml/badge.svg" alt="test status"></a>
<a href='https://coveralls.io/github/NoraH1to/setup-cli?branch=main'><img src='https://coveralls.io/repos/github/NoraH1to/setup-cli/badge.svg?branch=main' alt='Coverage Status' /></a>
</p>

<p align="center">
  <img width="500" src="https://raw.githubusercontent.com/NoraH1to/setup-cli/main/demo.gif">
  <br>
  <span>GIF made by <a href="https://github.com/charmbracelet/vhs">VHS</a></span>
</p>

## ✨ Features

- **Simple**: Use in simple way.

- **Simple**: Build in simple way.

- **Simple**: Custom in simple way.

## 🔨 Todo

- [x] core

  - [x] QA

  - [x] Generator

  - [x] Hook

- [ ] command

  - [x] create

  - [ ] inject

  - [x] repo

- [x] unit test

- [ ] [default templates](https://github.com/NoraH1to/setup-template) 🚧

- [ ] docs 🚧

## 🪄 Usage

install

```shell
pnpm add @norah1to/setup-cli -g
```

use

```bash
setup-cli help
```

### create

create a app

```bash
setup-cli create
```

### repo

opt repo

```bash
# Recommend exec "setup-cli update" after do this
setup-cli <add|set|rm>
```

show repo list

```bash
setup-cli list
```

### update

synchronize the local repo with the remote

```bash
setup-cli update
```

### inject

Todo

## 🚀 Custom

You can build you own template repo.

Every template has `files`,`hook` two folder.

```bash
└───base-node
      ├───files
      ├───hook
      └───...
```

`index.js` in `hook` must **export a function by default**, and must be an `ESM` module.

It should be of type `BaseHook` or `InjectHook`, depending on the template type, so you should write hook like this.

```javascript
// base-node/hook/index.js
/**
 * @type {import("@norah1to/setup-cli").BaseHook}
 */
const hook = () => ({ ... });
export default hook;
```

### Third-party deps

Of course, you can also use third-party dependencies through packaging tools.

I provide a [template](https://github.com/NoraH1to/setup-template/tree/main/base-base) base on `rollup` that uses a third-party dependency.

### Base

Base templates must start with `base-` like `base-node`.

Its **must contain metadata** for Inject to use:

```javascript
const hook = () => ({ ... });
// metadata
hook.meta = { ... }
export default hook;
```

### Inject

Base templates must start with `inject-` like `inject-lint`.

It does **not need** to additionally export metadata (temporarily)
