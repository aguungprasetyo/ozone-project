# ozone-project

Scaffold a Next.js project from the terminal with an interactive Ink UI.

## Usage

```bash
npx ozone-project my-app
```

```bash
pnpm dlx ozone-project my-app
```

Run without a name to be prompted:

```bash
npx ozone-project
```

```bash
pnpm dlx ozone-project
```

## What it does

- Prompts for a project name (if not provided).
- Lets you choose a template (or provide a custom repo URL).
- Clones the template and installs dependencies with `pnpm`.

## Requirements

- Node.js 18+
- `pnpm` installed globally
- `git` available in PATH

## Development

```bash
pnpm install
pnpm run build
node bin/index.js
```

## Publish

```bash
pnpm run build
npm adduser
pnpm publish
```
