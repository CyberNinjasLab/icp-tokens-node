# ICP Tokens Node Backend

Node backend for ICP Tokens.

## What's inside?

This Turborepo includes the following:

### Apps and Packages

- `icp-onchain`: an [Express](https://expressjs.com/) server
- `@repo/eslint-config`: ESLint presets
- `@repo/typescript-config`: tsconfig.json's used throughout the monorepo
- `@repo/jest-presets`: Jest configurations

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

# Requirements
If running in Mac make sure to install brew.sh package manager and install the following:
```
brew install docker
brew install nvm
nvm install v20.9.0
nvm use v20.9.0
npm install -g pnpm@8.15.9
pnpm install -g turbo@2.2.3 vercel@36.0.0 nodemon@3.1.3 graphqurl@1.0.3
```

### Docker
Install docker and docker-compose.
```
alias dc='docker-compose'
dc up icp-onchain --build
```

Open http://localhost:3001/api.

To shutdown all running containers:

```
# Stop all running containers
docker kill $(docker ps -q) && docker rm $(docker ps -a -q)
```

### Remote Caching
Not working yet. Skip.
Login to Vercel Turbo using the following command:

```
pnpx turbo login
pnpx turbo link # select the team you want to link to
```

This example includes optional remote caching. In the Dockerfiles of the apps, uncomment the build arguments for `TURBO_TEAM` and `TURBO_TOKEN`. Then, pass these build arguments to your Docker build.

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Jest](https://jestjs.io) test runner for all things JavaScript
- [Prettier](https://prettier.io) for code formatting


# Commands
```
turbo run lint
turbo run test
turbo run build
turbo run -F icp-onchain dev
turbo run -F icp-onchain start
```
