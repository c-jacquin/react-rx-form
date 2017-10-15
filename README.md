# Boilerplate for React-native app using expo

[![Travis](https://img.shields.io/travis/rust-lang/rust.svg)]()
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![nps friendly](https://img.shields.io/badge/nps-friendly-blue.svg?style=flat-square)](https://github.com/kentcdodds/nps)

- [Presentation](#presentation)
- [Requirement](#requirement)
- [Installation](#installation)
- [Development](#development)
- [Production](#production)
- [Releases](#releases)
- [Contributing](#contibuting)

## Presentation

This boilerplate include :
 - react-native
 - expo
 - redux
 - rxjs with redux-observable
 - reselect
 - react-intl (i18n)
 - react-navigation (amazing isomorphic router)
 - unit test with jest
 - continuous integration with Travis
 - tslint and prettier
 - commitizen with cz-conventional-changelog
 - gitHook with husky and lint-staged
   - run prettier before commit
   - run test before push
## Requirement

 - Node.js
 - Expo Ide
 - Redux remote devtools
 - an android/iphone or genymotion installed

## Installation

### install dependancies

```bash
$ npm i
```

### Compile typescript source

```bash
$ npm start
```

Then open Expo ide and start your project


## Development

### First release

```bash
$ npm run release --first-release
```

### Run tests

```bash
$ npm test
$ npm run tdd
```

### Scafolding

```bash
$ npm run generate
```

You have access to plop.js generators:
 - component
 - containers
 - redux module (reducers, selector, actionCreator, middlewares)
 - language
 - page
 - navigator

## production

### Publish a release

```bash
$ npm run release
```

## Changelog
* [Changelog](CHANGELOG.md)


## Contributing
* [Contributing](CONTRIBUTING.md)
