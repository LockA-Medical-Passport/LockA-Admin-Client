# Contributing to the LockA Admin Client

Thanks for helping improve the LockA Admin Client. This guide covers local setup, the checks we
run, and the conventions we use for issues and pull requests.

By participating, you agree to follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Local setup

The project uses Node.js 20+ and npm.

```bash
git clone https://github.com/LockA-Medical-Passport/LockA-Admin-Client.git
cd LockA-Admin-Client
npm install
cp .env.example .env.local   # fill in the values for your environment
npm run dev                  # http://localhost:3000
```

`src/lib/config.ts` validates required environment variables at startup. See
[docs/environments.md](docs/environments.md) for the full variable list and environment guidance.

## Commands

| Command                   | What it does                                               |
| ------------------------- | ---------------------------------------------------------- |
| `npm run dev`             | Start the Next.js dev server                               |
| `npm run build`           | Production build (requires the `NEXT_PUBLIC_*` env values) |
| `npm run start`           | Serve a production build                                   |
| `npm run lint`            | ESLint                                                     |
| `npm run typecheck`       | TypeScript, no emit                                        |
| `npm test`                | Jest unit tests                                            |
| `npm run test:coverage`   | Jest with a coverage report                                |
| `npm run test:e2e`        | Playwright E2E suite (mock locka-api + production build)   |
| `npm run test:e2e:ui`     | Playwright interactive UI                                  |
| `npm run storybook`       | Storybook on http://localhost:6006                         |
| `npm run build-storybook` | Static Storybook build                                     |
| `npm run format`          | Format with Prettier                                       |
| `npm run format:check`    | Verify formatting without changing files                   |

Before opening a PR, run at least:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Run `npm run test:e2e` when your change touches authentication, provider review, wallet
transactions, or shared UI used by those flows. The E2E suite starts its own mock API and
production server; no real backend, Freighter extension, or Stellar network is required.

## Testing notes

- Unit tests live next to the component under `__tests__/` and use React Testing Library.
- Playwright specs live in `e2e/`. Ports can be overridden with `E2E_PORT` and `MOCK_API_PORT`.
- The E2E-only chain bypass is `NEXT_PUBLIC_E2E_TEST_MODE=1` (see `src/lib/e2e.ts`). Never set it
  in a deployed environment.
- Accessibility is part of the suite: axe runs against login, the provider queue, provider detail,
  and the decision dialog. Keep new interactive UI keyboard accessible and WCAG AA contrast-safe.

## Commit and PR conventions

- Write commit messages in the imperative mood, e.g. `Add provider bulk approval tests`.
- Keep commits focused; avoid mixing refactors with behavior changes when possible.
- Reference the issue in the PR body, e.g. `Closes #42`.
- Fill in the pull request template, including the commands you ran and any screenshots for UI
  changes.
- Keep PRs reviewable in size. If a change is large, explain the structure and call out areas that
  need extra attention.

## Labels

We use a small label taxonomy:

| Label              | Meaning                                                             |
| ------------------ | ------------------------------------------------------------------- |
| `epic`             | A large body of work that groups related issues                     |
| `area: *`          | The area touched, e.g. `area: ui`, `area: auth`, `area: blockchain` |
| `good first issue` | Small, well-scoped issues suitable for new contributors             |
| `help wanted`      | Maintainers would welcome community help                            |
| `bug`              | Something is broken                                                 |
| `enhancement`      | New feature or improvement                                          |
| `documentation`    | Docs-only work                                                      |

If you are unsure where an issue fits, open it with the closest matching template and a maintainer
will adjust labels.

## Code style

- TypeScript strict mode is enabled; avoid `any` and prefer explicit types at module boundaries.
- Follow the feature-based layout described in [ARCHITECTURE.md](ARCHITECTURE.md).
- Reuse the design-system components in `src/components/ui/` rather than re-implementing controls.
- Keep secrets and personal data out of logs, test fixtures, and Sentry events.
- Prettier and ESLint are enforced in CI. Husky + lint-staged run them on staged files before commit.
