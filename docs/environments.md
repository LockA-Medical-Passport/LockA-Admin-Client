# Environment configuration

The admin client reads its configuration from environment variables. Variables prefixed with
`NEXT_PUBLIC_` are embedded into the browser bundle at **build time**, so changing them requires a
new build/deployment rather than just restarting the server.

`src/instrumentation.ts` imports `src/lib/config.ts` on server startup and fails fast if a required
variable is missing.

## Required variables

| Variable                                    | Used by        | Description                                                                  |
| ------------------------------------------- | -------------- | ---------------------------------------------------------------------------- |
| `NEXT_PUBLIC_LOCKA_API_URL`                 | browser/server | Base URL of the `locka-api` backend                                          |
| `NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE`    | browser        | Stellar network passphrase (`Test SDF Network ; September 2015` for testnet) |
| `NEXT_PUBLIC_SOROBAN_RPC_URL`               | browser/server | Soroban RPC endpoint used to build/confirm transactions                      |
| `NEXT_PUBLIC_PROVIDER_REGISTRY_CONTRACT_ID` | browser/server | Deployed `ProviderRegistry` contract ID; must be set to build                |

For local development, copy `.env.example` to `.env.local` and fill in the values. Never commit
`.env.local` or any file containing secrets.

## Optional variables

| Variable                     | Description                                                                               |
| ---------------------------- | ----------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SENTRY_DSN`     | Enables error monitoring in production builds                                             |
| `SENTRY_ORG`                 | Sentry organization slug (build-time source map upload)                                   |
| `SENTRY_PROJECT`             | Sentry project slug (build-time source map upload)                                        |
| `SENTRY_AUTH_TOKEN`          | Sentry auth token; when absent, source maps are not uploaded and the build still succeeds |
| `NEXT_PUBLIC_E2E_TEST_MODE`  | E2E-only chain bypass. **Never set to `1` outside the Playwright suite.**                 |
| `E2E_PORT` / `MOCK_API_PORT` | Port overrides for the Playwright web servers (defaults `3100` / `4100`)                  |

`NEXT_PUBLIC_E2E_TEST_MODE=1` skips the real Soroban transaction submission/confirmation and
accepts a synthetic transaction hash in the decision route. It exists only so CI can exercise the
approval UI without a wallet or network. Deployed environments must leave it unset.

## Development, staging, and production

| Concern          | Development                                | Staging / preview                           | Production                               |
| ---------------- | ------------------------------------------ | ------------------------------------------- | ---------------------------------------- |
| `locka-api`      | local `http://localhost:4000`              | staging API URL                             | production API URL                       |
| Stellar network  | testnet                                    | testnet                                     | mainnet passphrase + mainnet Soroban RPC |
| ProviderRegistry | testnet contract or placeholder to build   | testnet contract                            | production contract                      |
| Sentry           | disabled (no DSN)                          | enabled with staging DSN, lower sample rate | enabled with production DSN              |
| E2E test mode    | only during `npm run test:e2e`             | never                                       | never                                    |
| `npm run build`  | requires all required `NEXT_PUBLIC_*` vars | same                                        | same                                     |

Keep separate Vercel projects or separate environment scopes for staging and production. Vercel
stores the `NEXT_PUBLIC_*` values per environment and injects them at build time.

## Preview deployments

`.github/workflows/preview.yml` deploys every same-repository pull request to Vercel and comments
the preview URL on the PR. Configure these repository secrets:

- `VERCEL_TOKEN` — a Vercel personal/team token
- `VERCEL_ORG_ID` — from `.vercel/project.json` after linking the project
- `VERCEL_PROJECT_ID` — from `.vercel/project.json`

Also set the required `NEXT_PUBLIC_*` variables in the Vercel project's **Preview** environment.
Forks cannot access repository secrets, so preview deployment is skipped for them; maintainers can
deploy a fork manually or rely on Vercel's Git integration if it is enabled instead.

If the repository is connected to Vercel's Git integration, Vercel can create preview deployments
without this workflow. Use one mechanism, not both, to avoid duplicate comments.

## Error monitoring

Sentry is initialized in:

- `instrumentation-client.ts` (browser)
- `sentry.server.config.ts` (Node runtime)
- `sentry.edge.config.ts` (Edge runtime)

`src/lib/sentry-options.ts` keeps Sentry disabled unless `NODE_ENV=production` and
`NEXT_PUBLIC_SENTRY_DSN` is set. `beforeSend` removes request data, user identity, and breadcrumbs so
auth cookies, admin details, and provider PII are not captured.

To verify production monitoring after configuring the DSN, trigger a controlled error in a
non-production preview/staging deployment and confirm it appears in Sentry. Do not test by breaking
a production user flow.
