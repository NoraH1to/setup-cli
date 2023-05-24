<h1 align="center">Setup-CLI</h1>

<p align="center">Quickly setup everything, or custom it in simple way</p>

<p align="center">
<a href="https://github.com/NoraH1to/setup-cli/actions/workflows/test.yml"><img src="https://github.com/NoraH1to/setup-cli/actions/workflows/test.yml/badge.svg" alt="test status"></a>
<a href="https://coveralls.io/github/NoraH1to/setup-cli?branch=main" target="_blank"><img src="https://coveralls.io/repos/github/NoraH1to/setup-cli/badge.svg?branch=main" alt="Coverage Status" /></a>
<a href="https://www.npmjs.com/package/@norah1to/setup-cli?activeTab=readme" target="_blank"><img alt="npm" src="https://img.shields.io/npm/dw/@norah1to/setup-cli"></a>
</p>

<p align="center">
  <img width="500" src="https://raw.githubusercontent.com/NoraH1to/setup-cli/main/demo.gif">
  <br>
  <span>GIF made by <a href="https://github.com/charmbracelet/vhs">VHS</a></span>
</p>

## ✨ Features

❗ `ESM` only, `pnpm` only.

- **Simple**: Use in simple way.

- **Simple**: Build in simple way.

- **Simple**: Custom in simple way.

## 🪄 Usage

Install

```shell
pnpm add @norah1to/setup-cli -g
```

Help

```bash
setup-cli help
```

### create

Create a app

```bash
setup-cli create
```

### repo

Opt repo

```bash
# Recommend exec "setup-cli update" after do this
setup-cli repo <add|set|rm>
```

Show repo list

```bash
setup-cli repo list
```

### update

Synchronize the local repo with the remote

```bash
setup-cli update
```

### inject

Inject anything into current project

```bash
setup-cli inject
```

### reset

Reset the CLI to the state it was first installed in

```bash
setup-cli reset
```

## 🚀 Custom

We provide the [default templates](https://github.com/NoraH1to/setup-template).

You can build your own too.

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

Inject templates must start with `inject-` like `inject-lint`.

It does **not need** to additionally export metadata (temporarily)

## ⚙️ Hooks

Hooks is the **core** of custom templates, it provides many life cycle hooks.

You can customize the injection logic in it.

The following are described in order of execution.

All hooks are **optional**.

### beforeGenerate

Will be executed at the beginning, usually used to collect requirements.

### beforeMerge(options)

It will be executed when each file of the current template is about to be merged.

Used to make some preparations before merging a file.

#### options

Type: `object`

##### srcDir

Type: [`DirInfo`](#dirinfo)

A virtual file tree rooted in the `files` folder in the template.

##### destDir

Type: [`DirInfo`](#dirinfo)

Virtual file tree of target folder.

##### src

Type: [`FileInfo`](#fileinfo)

The virtual file object to be merged into the current template.

##### dest

Type: [`FileInfo`](#fileinfo)

A virtual file object with the same name in the target directory.

### onMerging(options): content

Used to overwrite the merge logic for files with the same name.

By default, files with the same name in the target path will be overwritten, but sometimes they need to be merged instead of overwritten.

For example when you need to merge `package.json`:

```typescript
onMerging({ srcDir, destDir, src, dest }) {
  if (src === srcDir.get('package.json'))
    return JSON.stringify(
      dpMergePackageJson(dest.getJson(), src.getJson())
    );
  return src.getContent();
},
```

#### return

Type: `string`\
Required: `true`

#### options

Type: `object`

##### srcDir

Type: [`DirInfo`](#dirinfo)

##### destDir

Type: [`DirInfo`](#dirinfo)

##### src

Type: [`FileInfo`](#fileinfo)

##### dest

Type: [`FileInfo`](#fileinfo)

### afterMerge(options)

Execute after the current file is merged, the rest is the same as [`beforeMerge`](#beforemergeoptions)

### afterGenerate(options)

Execute after the virtual file tree is generated.

#### options

Type: `object`

##### targetDir

Type: [`DirInfo`](#dirinfo)

Virtual file tree of target folder.

### afterOutput

Execute after outputting the virtual file tree to disk.

Usually used to execute some installation scripts, for example you need to customize `eslint` configuration:

```typescript
async afterOutput() {
  const cwd = process.cwd();
  await $.cd(__dir_target_root__);
  $.verbose = true;
  await $`pnpm create @eslint/config`;
}
```

## Objects

### DirInfo

Used to store folder information, won't modify the original file or folder on disk.

#### name

Type: `string`

Folder name.

#### pathname

Type: `string`

The full absolute path of the folder.

#### dirname

Type: `string`

The folder's parent folder path.

#### parent

Type: [`DirInfo`](#dirinfo)

Parent folder information, `null` if root.

#### isDir

Type: `boolean`

Whether it is a folder, used to determine the type when fuzzy searching in the tree.

#### exist

Type: `boolean`

Does the folder exist.

#### has(pathname: string, options)

Find if a file or folder exists in the tree.

```typescript
/*
 * └───foo
 *    ├───index.ts
 *    └───bar
 *        └───deep.ts
 */
const dir = new DirInfo({ pathname: '/foo' });
dir.has('/index.ts'); // true
dir.has('/bar'); // true
dir.has('/bar/deep.ts'); // true
dir.has('/bar/deep.ts', { type: 'dir' }); // false
```

##### pathname

Required: `true`

Relative path relative to folder.

##### options.type

Required: `false`

Type: `"file"`,`"dir"`

#### get(pathname: string, options): DirInfo | FileInfo | undefined

Get item by path, it will return `undefined` if not exist.

##### pathname

Same as above.

##### options.type

Same as above.

#### getMap(options): Record<string, DirInfo | FileInfo>

Get the child mapping table under the current folder, the `key` is the file name or folder name.

##### options.type

Same as above.

#### ensure(pathname: string, options)

Make sure a file or folder exists, create it if it does not exist.

##### pathname

Same as above.

##### options.type

Same as above, but **Required**.

### FileInfo

Used to store file information, won't modify the original file on disk.

#### dirname

Type: `string`

The directory where the file is located

#### filename

Type: `string`

Filename, including extension.

#### pathname

Type: `string`

The full absolute path of the file.

#### ext

Type: `string`

File extension.

#### exist

Type: `boolean`

Does the file exist.

#### parent

Type: [`DirInfo`](#dirinfo)

Parent folder information.

#### isDir

Type: `boolean`

Whether it is a folder, used to determine the type when fuzzy searching in the tree.

#### setContent(content: string)

Set the content of the file.

#### getContent()

Return the content of the file, return `undefined` when the file does not exist and no content is added.

#### getJson()

`json` and `yaml` files will parse their contents, and this method returns the parsed result object.

Returns `undefined` if the file is empty, does not exist, or is malformed.
