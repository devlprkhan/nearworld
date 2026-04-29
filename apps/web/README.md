# @nearworld/web

## Frontend TBD

This package is a placeholder in the Turborepo pipeline.

**When implementing the frontend:**

1. Choose a framework (Next.js, Remix, Vite + React, etc.)
2. Run the framework's init command inside this directory
3. Add `@nearworld/types` and `@nearworld/utils` as workspace dependencies:
   `pnpm add --filter @nearworld/web @nearworld/types@workspace:*`
4. Extend `@nearworld/tsconfig/node.json` in tsconfig.json
5. Update `dev`, `build`, `lint`, and `typecheck` scripts in package.json
6. The Turborepo pipeline in `turbo.json` will pick it up automatically.
