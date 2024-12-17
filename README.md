# ICP Tokens Node Backend

Node backend for ICP Tokens.

## What's inside?

This Turborepo includes the following:

### Apps and Packages

- `core`: an [Express](https://expressjs.com/) server
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
pnpm install -g turbo@2.2.3 vercel@36.0.0 nodemon@3.1.3 graphqurl@1.0.3 @antfu/ni@0.22.1
```

### Docker
Install docker and docker-compose.
```
alias dc='docker-compose'
dc up core --build
```

Open http://localhost:3001/api.

To shutdown all running containers:

```
# Stop all running containers
docker kill $(docker ps -q) && docker rm $(docker ps -a -q)
```

### Remote Caching
Login to Vercel Turbo using the following command:

```
export TURBO_TOKEN=your_token_here
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
turbo run -F @icptokens/core dev
turbo run -F @icptokens/core start
```

# TimescaleDB
Connect to k8s cluster and port forward to timescale db
```
sudo -E kubefwd svc -n data # port forward timescale to a localhost, also changes host to be icptokens-svc locally
```

In another shell run to get secret password:
```
k get secret icptokens -n data -o yaml | yq -r '.data.superuser-password' | base64 -d
```

Connect to timescale db:
```
host: icptokens-svc
port: 5432
user: postgres
password: <retrieve from kubernetes secret>
```
