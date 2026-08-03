# Architecture

This document describes how the LockA Admin Client codebase is organized. It follows a
feature-based structure on top of the Next.js App Router.

```
src/
  app/          Next.js App Router routes: pages, layouts, and route handlers
  components/   Shared, reusable UI/design-system components (Button, Badge, Modal, ...)
  features/     Feature-scoped modules (e.g. features/provider-review/), each owning its
                own components, hooks, and logic
  hooks/        Shared React hooks not tied to a single feature
  lib/          Cross-cutting utilities: typed env config, the locka-api client, the
                Soroban/blockchain client
  instrumentation.ts   Runs once at server startup to validate environment configuration
```

## Conventions

- Code used by only one feature lives under that feature's folder in `features/`, not in
  `components/` or `lib/`.
- Code shared by two or more features graduates into `components/`, `hooks/`, or `lib/`.
- Path aliases are configured as `@/*` -> `src/*` (see `tsconfig.json`) — import from
  `@/components/...`, `@/features/...`, `@/lib/...`, `@/hooks/...` rather than relative
  paths that cross directories.
