# BCGov Express + SSO Keycloak API Documentation

[![Lifecycle:Experimental](https://img.shields.io/badge/Lifecycle-Experimental-339999)](Redirect-URL)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

[![NodeJS](https://img.shields.io/badge/Node.js_20-43853D?style=for-the-badge&logo=node.js&logoColor=white)](NodeJS)
[![Typescript](https://img.shields.io/badge/TypeScript_5-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](Typescript)
[![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](Express)

<br />

<details>
<summary><h2>TL/DR</h2></summary>

1. Install package by following the steps at [Installing the Package](#installing-the-package).
2. Set up the package by following the steps at [Basic Setup Guide](#basic-setup-guide).
3. Use with [@bcgov/citz-imb-kc-express].
4. Allows semi-auto generation of api documentation and integration with Keycloak SSO protected endpoints.

</details>

---

## Table of Contents

- [General Information](#general-information)
- [Installing the Package](#installing-the-package) - **Start Here!**
- [Basic Setup Guide](#basic-setup-guide) - Setting up after installing.
- [Environment Variables](#environment-variables) - Required variables for initialization.
- [Directory Structure](#directory-structure) - How the repo is designed.
- [Scripts](#scripts) - Scripts for running and working on the package.
- [Module Exports](#module-exports) - Functions available from the module.
- [TypeScript Types](#typescript-types) - Available TypeScript types.
- [Applications using this Solution](#applications-using-this-solution) - See an example of how to use.

## General Information

- For running on a NodeJS:20 Express API.
- Works with Vanilla JavaScript or Typescript 5.
- Use with [@bcgov/citz-imb-kc-express].
- Allows semi-auto generation of api documentation and integration with Keycloak SSO protected endpoints.

---

<br />

## Installing the Package

1. Add the following line to your `package.json`:

``` JSON5
{
  "dependencies": {
    "@bcgov/citz-imb-kc-express-api-docs": "https://github.com/bcgov/citz-imb-kc-express-api-docs/releases/download/v<VERSION>/bcgov-citz-imb-kc-express-api-docs-<VERSION>.tgz",
    // The rest of your dependencies...
  },
}
```

2. Replace `<VERSION>` with the version you wish to use. Reference [releases] for version numbers.

<br />

3. Run `npm install` to add the package.

[Return to Top](#bcgov-express-+-sso-keycloak-api-documentation)

<br />

## Basic Setup Guide

1. Add the required environment variables from the [Environment Variables](#environment-variables) section below.

2. TBD

[Return to Top](#bcgov-express-+-sso-keycloak-api-documentation)

<br />

## Environment Variables

```ENV
# TBD
```

[Return to Top](#bcgov-express-+-sso-keycloak-api-documentation)

<br />

## Directory Structure

```
.
├── .github/
|   ├── config/
|   |   └── dep-report.json5                # Configure options for NPM Dep Report.
|   ├── helpers/
|   |   ├── github-api/                     # Functions to access the GitHub API.
|   |   ├── bump-version.js                 # Bumps package.json version.
|   |   ├── create-npm-dep-report-issues.js # Creates GitHub Issues for Npm Dep Reports.
|   |   ├── create-npm-dep-report.js        # Creates text bodies for Npm Dep Reports.
|   |   ├── parse-json5-config.js           # Parses json5 files for GitHub actions output.
|   |   └── parse-npm-deps.js               # Parses package.json files for changes to package versions.
|   ├── workflows/
|   |   ├── npm-dep-report.yaml             # Reports on new package versions.
|   |   └── releases.yaml                   # Creates a new GitHub Release.
├── scripts/
|   ├── remove-dts-files.mjs                # Removes TypeScript declaration files from the build.
|   └── remove-empty-dirs.mjs               # Removes empty directories from the build.
├── src/                                    # Source code for package.
|   ├── utils/                              # Utility functions.
|   ├── config.ts                           # Config variables.
|   ├── index.ts                            # Export functions for the package.
|   └── types.ts                            # TypeScript types.
├── package.json                            # Package config and dependencies.
├── rollup.config.mjs                       # Builds and compiles TypeScript files into JavaScript.
├── rollupdts.config.mjs                    # Builds and compiles TypeScript declartion files.
```

[Return to Top](#bcgov-express-+-sso-keycloak-api-documentation)

<br />

## Scripts

```bash
# Compile all src code into a bundle in build/ directory.
$ npm run build
```

```bash
# Part of 'build' and it bundles the typescipt declarations into a single bundle.d.ts file.
$ npm run build:dts
```

```bash
# Part of build and it removes directories and files before the build.
$ npm run clean:prebuild
```

```bash
# Part of build and it removes directories and files after the build.
$ npm run clean:postbuild
```

```bash
# Used to package the code before a release.
$ npm run pack
```

[Return to Top](#bcgov-express-+-sso-keycloak-api-documentation)

<br />

## Module Exports

These are the functions and types exported by the `@bcgov/citz-imb-kc-express-api-docs` module.

```JavaScript
import {
  // TBD
} from '@bcgov/citz-imb-kc-express-api-docs';

```

[Return to Top](#bcgov-express-+-sso-keycloak-api-documentation)

<br />

## TypeScript Types

These are the TypeScript types of the `@bcgov/citz-imb-kc-express-api-docs` module.

```TypeScript
// TBD
```

[Return to Top](#bcgov-express-+-sso-keycloak-api-documentation)

<br />

## Applications using this Solution

The following applications are currently using this keycloak implementation solution:

TBD

<!-- [PLAY](https://github.com/bcgov/citz-imb-playground) - CITZ IMB Package Testing App -->
<!-- TBD: [SET](https://github.com/bcgov/citz-imb-salary-estimate-tool) - Salary Estimation Tool -->

[Return to Top](#bcgov-express-+-sso-keycloak-api-documentation)

<!-- Link References -->

[@bcgov/citz-imb-kc-express]: https://github.com/bcgov/citz-imb-kc-express
[releases]: https://github.com/bcgov/citz-imb-kc-express-api-docs/releases
