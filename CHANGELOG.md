# Changelog
## [1.1.0](https://github.com/NoraH1to/setup-cli/compare/v1.0.0...v1.1.0) (2023-05-26)


### Features

* **generator:** automatic formatting of file contents on output ([66fc8db](https://github.com/NoraH1to/setup-cli/commit/66fc8db0edb34ef8b393e446ffab1762703c325f))
* **hook:** no longer mandatory for meta information ([35e5549](https://github.com/NoraH1to/setup-cli/commit/35e5549acd64bb43e2f9655f288eb5a17b7cfd64))

## [1.0.0](https://github.com/NoraH1to/setup-cli/compare/v1.0.0-alpha.10...v1.0.0) (2023-05-24)


### Bug Fixes

* **file:** error when parsing commented json ([edd42f5](https://github.com/NoraH1to/setup-cli/commit/edd42f5f80e6b1590ff37aea0757eeeb80b51b65))

## [1.0.0-alpha.10](https://github.com/NoraH1to/setup-cli/compare/v1.0.0-alpha.9...v1.0.0-alpha.10) (2023-03-28)


### Bug Fixes

* **file:** type error ([bd27315](https://github.com/NoraH1to/setup-cli/commit/bd27315adeddd2b0e42d993e793685e139cf11fc))

## [1.0.0-alpha.9](https://github.com/NoraH1to/setup-cli/compare/v1.0.0-alpha.8...v1.0.0-alpha.9) (2023-03-06)


### Features

* **command-inject:** add command inject ([e346f34](https://github.com/NoraH1to/setup-cli/commit/e346f34d8bcff4e1eaef2a119d4e9b8662482c33))
* **hook-on-merging:** add folder information pass parameters ([a429f6f](https://github.com/NoraH1to/setup-cli/commit/a429f6f11ab079bce5bea6eba8bee1790f4d20b2))

## [1.0.0-alpha.8](https://github.com/NoraH1to/setup-cli/compare/v1.0.0-alpha.7...v1.0.0-alpha.8) (2023-03-03)


### ⚠ BREAKING CHANGES

* **hook:** `afterGenerate` will be executed after the build is complete and before the file is
output
* **generator:** `beforeMerge` and `afterMerge` are now called before and after each `eMerging`,
respectively, and provide directory information and file information

### Features

* **command:** add `reset` command ([4dd491b](https://github.com/NoraH1to/setup-cli/commit/4dd491bbdae73753ede7b5b69e2ba0723bf7c2f0))
* **dirinfo:** add `getMap` function to get item's collection ([4ba360c](https://github.com/NoraH1to/setup-cli/commit/4ba360c900852ba6db0c833c9ab6bdec1e3089e6))
* **dirinfo:** added DirInfo class for managing files in memory ([ccf704b](https://github.com/NoraH1to/setup-cli/commit/ccf704b5287038be9c5a91fbad50739dd80c5606))
* **hook:** add `beforeMerge`, `afterMerge`, `afterOutput` hooks ([134ed97](https://github.com/NoraH1to/setup-cli/commit/134ed97f08c56d77d40521d9d08405a8cdf37e4d))


### Bug Fixes

* **dirinfo:** the directory name is not set correctly ([3d9650c](https://github.com/NoraH1to/setup-cli/commit/3d9650cc97ded426b626b8cf7a04da832b982198))


* **generator:** modify files in memory to reduce I/O ([aa5f08d](https://github.com/NoraH1to/setup-cli/commit/aa5f08dc18194bab178b9026652e063f5971b24a))

## [1.0.0-alpha.7](https://github.com/NoraH1to/setup-cli/compare/v1.0.0-alpha.6...v1.0.0-alpha.7) (2023-02-24)


### Features

* **qa:** checkbox add search support ([70a7a10](https://github.com/NoraH1to/setup-cli/commit/70a7a10678786d89893d31d258ecbe43a3a69706))


### Bug Fixes

* **qa:** the base template for the create command should be required ([b8bfacc](https://github.com/NoraH1to/setup-cli/commit/b8bfaccf496d3e2c18db70a92e89ba86672fae1d))
* **scripts/init:** failed to initialize properly ([45fb7e9](https://github.com/NoraH1to/setup-cli/commit/45fb7e9558a430e612c424d373be00aad6d971c3))

## [1.0.0-alpha.6](https://github.com/NoraH1to/setup-cli/compare/v1.0.0-alpha.5...v1.0.0-alpha.6) (2023-02-23)

## [1.0.0-alpha.5](https://github.com/NoraH1to/setup-cli/compare/v1.0.0-alpha.4...v1.0.0-alpha.5) (2023-02-23)


### Bug Fixes

* **file:** file content should not be undefined when file exist and empty ([bf0eb88](https://github.com/NoraH1to/setup-cli/commit/bf0eb88980e4dc1daf1f67cafd70c056667fb584))

## [1.0.0-alpha.4](https://github.com/NoraH1to/setup-cli/compare/v1.0.0-alpha.3...v1.0.0-alpha.4) (2023-02-22)


### Bug Fixes

* **repo:** fix "$GIT_DIR too big" error cause by pnpm's long dir ([d9e115f](https://github.com/NoraH1to/setup-cli/commit/d9e115f9169f2ef31ffd7b7ac3068b329060551c))

## [1.0.0-alpha.3](https://github.com/NoraH1to/setup-cli/compare/v1.0.0-alpha.2...v1.0.0-alpha.3) (2023-02-21)


### Bug Fixes

* **update:** git error ([7541825](https://github.com/NoraH1to/setup-cli/commit/7541825ee381807eae1f45321de3c0f5c59aec10))

## [1.0.0-alpha.2](https://github.com/NoraH1to/setup-cli/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2023-02-21)

## [1.0.0-alpha.1](https://github.com/NoraH1to/setup-cli/compare/v1.0.0-alpha.0...v1.0.0-alpha.1) (2023-02-21)

## 1.0.0-alpha.0 (2023-02-21)


### Features

* **hook:** add hooks, provide hook-helper, export hook type ([4ab6e58](https://github.com/NoraH1to/setup-cli/commit/4ab6e5885c27db243703c3bb86ad2d8ab573c96a))
* **repo:** complete command `repo` ([7e3670b](https://github.com/NoraH1to/setup-cli/commit/7e3670bc80d66c2725368f918b1debafe5af4867))


### Bug Fixes

* **utils:** fix wrong env var ([e8f81a8](https://github.com/NoraH1to/setup-cli/commit/e8f81a8b736091abdc1696d7ceebc524113cc8b1))
