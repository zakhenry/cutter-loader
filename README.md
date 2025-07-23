# Cutting Loader

![Loader example](https://i.redd.it/cgyb9nhrhpef1.gif)

This project is an experiment in generating an SVG loader that looks like a machine tool cutting a polygon. 

The (self-imposed) challenge was to achieve this using strictly only svg tooling, i.e. no runtime javascript animations
at all.

The framework used is Angular simply for familiarity and dev tooling, but the resulting SVG is completely static, and
could be extracted as a `.svg` file and used anywhere.

## Prerequisites

* You'll need node 22 installed, recommend using `nvm` and then run `nvm use` in the project root to pick up the version
this repo is tested against

To install dependencies
```shell
yarn install
```

## Development server

To start a local development server, run:

```bash
yarn start
```


This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.1.1.
