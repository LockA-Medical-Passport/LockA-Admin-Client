# LockA Admin Client - Build-out Issues

This document enumerates the GitHub issues for building the LockA Admin Client from an empty repository to a functioning provider-approval interface, organized as 9 epics covering 58 concrete tasks (67 issues total).

**Design reference:** https://locka.remixdapp.eth.limo/  
That build is an early ethers.js/EVM prototype used _only_ to establish the visual language (dark navy + glass-card theme, button/badge/status styling, typography). It is not the target tech stack. The Admin Client's actual implementation follows the platform documentation: Next.js/TypeScript/Tailwind talking to `locka-api`, with Stellar/Soroban + Freighter wallet for on-chain provider verification (`ProviderRegistry` contract).

**Labels used:** `epic`, `area: scaffolding`, `area: design-system`, `area: auth`, `area: core-feature`, `area: blockchain`, `area: dashboard`, `area: testing`, `area: devops`, `area: community`, plus the repo's default `good first issue` / `help wanted` / `enhancement` / `documentation` labels.

---

## [EPIC] Project Scaffolding & Tooling

Stand up the Next.js/TypeScript project and the baseline tooling every other issue depends on.

**Scope of this epic:**

- Initialize Next.js + TypeScript project scaffold
- Configure Tailwind CSS with the LockA design token palette
- Set up ESLint, Prettier, and EditorConfig
- Configure absolute imports and path aliases
- Set up environment variable management
- Add Husky + lint-staged pre-commit hooks
- Add project LICENSE
- Document base project architecture

Individual tasks are opened as separate issues labeled `area: scaffolding` and reference this epic in their description.

### Initialize Next.js + TypeScript project scaffold

**Labels:** area: scaffolding

Bootstrap the Admin Client as a Next.js (App Router) project written in TypeScript. This is the foundation every other issue builds on top of.

**Acceptance Criteria**

- [ ] Next.js project created with TypeScript, App Router, and `strict` mode enabled in `tsconfig.json`
- [ ] `npm run dev` starts a working dev server
- [ ] `npm run build` produces a clean production build with no type errors
- [ ] Existing `README.md` is preserved at the project root

### Configure Tailwind CSS with the LockA design token palette

**Labels:** area: scaffolding, area: design-system

Wire up Tailwind CSS and extend its theme with the LockA visual identity so every component built afterward pulls from a single source of truth.

**Acceptance Criteria**

- [ ] Tailwind CSS installed and configured for the Next.js app
- [ ] `tailwind.config.ts` extends `theme.colors` with the navy scale (950-600), `locka-cyan` (#00d4ff), `locka-blue` (#0066ff), `locka-purple` (#6600cc), and brand colors (blue #3b82f6, cyan #06b6d4, green #10b981, amber #f59e0b, red #ef4444)
- [ ] `Inter` (sans) and `JetBrains Mono` (mono) fonts loaded and set as default font families
- [ ] Default app background/text match the dark theme (`#0a1628` background, `#e2e8f0` text)

**Reference:** Tokens sourced from the reference build: https://locka.remixdapp.eth.limo/

### Set up ESLint, Prettier, and EditorConfig

**Labels:** area: scaffolding, good first issue

Establish consistent code style and catch lint errors before they reach review, so contributions from many different people stay consistent.

**Acceptance Criteria**

- [ ] ESLint configured with the Next.js + TypeScript recommended rulesets
- [ ] Prettier configured and wired into ESLint with no conflicting rules
- [ ] `.editorconfig` added for consistent indentation/line endings across editors
- [ ] `npm run lint` passes on the base scaffold

### Configure absolute imports and path aliases

**Labels:** area: scaffolding, good first issue

Add `@/*` path aliases so imports don't degrade into long relative `../../../` chains as the app grows.

**Acceptance Criteria**

- [ ] `tsconfig.json` paths configured (e.g. `@/components/*`, `@/lib/*`, `@/hooks/*`)
- [ ] Next.js config recognizes the aliases
- [ ] At least one example import in the scaffold uses the alias

### Set up environment variable management

**Labels:** area: scaffolding

Centralize configuration (locka-api base URL, Soroban network/RPC endpoint, contract IDs) behind a typed config module instead of scattering `process.env` reads across the app.

**Acceptance Criteria**

- [ ] `.env.example` documents every required variable (locka-api base URL, Stellar network passphrase, Soroban RPC URL, ProviderRegistry contract ID)
- [ ] A single typed config module validates and exposes these at startup, failing fast on missing values
- [ ] `.env*` (except `.env.example`) is gitignored

### Add Husky + lint-staged pre-commit hooks

**Labels:** area: scaffolding, good first issue

Run lint/format checks automatically before a commit lands, so broken style never reaches a PR.

**Acceptance Criteria**

- [ ] Husky installed with a `pre-commit` hook
- [ ] `lint-staged` runs ESLint/Prettier only on staged files
- [ ] Hook verified to block a commit that fails lint

### Add project LICENSE

**Labels:** area: scaffolding, good first issue, documentation

Pick and add an OSS license so external contributors know the terms under which they can use and contribute to the code.

**Acceptance Criteria**

- [ ] LICENSE file added at repo root (MIT suggested as default for maintainers to confirm)
- [ ] License referenced from README.md

### Document base project architecture

**Labels:** area: scaffolding, documentation

Write an ARCHITECTURE.md describing the feature-based folder structure (e.g. `app/`, `components/`, `features/provider-review/`, `lib/`, `hooks/`) so contributors know where new code belongs.

**Acceptance Criteria**

- [ ] ARCHITECTURE.md added documenting folder layout and where features, API clients, and blockchain integration code live
- [ ] Structure applied to the actual scaffold (folders created, even if empty)

---

## [EPIC] Design System & UI Components

Port the LockA visual language (navy/glass theme, buttons, badges, forms) into a reusable component library.

**Scope of this epic:**

- Global theme provider and base styles
- Build Button component with semantic variants
- Build Badge component for status pills
- Build form field components (Input, Select, Textarea)
- Build Modal/Dialog component
- Build Table component for application queues
- Build Toast notification system
- Build loading skeleton and spinner components
- Build EmptyState component
- Build app shell: Navbar + sidebar navigation

Individual tasks are opened as separate issues labeled `area: design-system` and reference this epic in their description.

### Global theme provider and base styles

**Labels:** area: design-system

Port the reference build's global visual language: dark navy background, `.glass`/`.glass-bright` translucent card surfaces, and `glow-*` shadow utilities.

**Acceptance Criteria**

- [ ] Global CSS defines `glass`, `glass-bright`, and `glow-{blue,cyan,green}` utility classes matching the reference build's values
- [ ] Custom scrollbar styling matches the reference (`#0d1530` track, `#1e3a5f` thumb)
- [ ] `fade-in` / `slide-up` animations available as reusable utilities

**Reference:** Mirrors the global CSS in https://locka.remixdapp.eth.limo/

### Build Button component with semantic variants

**Labels:** area: design-system, good first issue

Implement a shared `<Button>` with `primary`, `secondary`, `success`, `danger`, and `amber` variants, matching the reference build's `.btn-*` classes. These map directly onto Approve (success), Reject (danger), and Pending/warning (amber) actions in the review workflow.

**Acceptance Criteria**

- [ ] Variants: primary, secondary, success, danger, amber
- [ ] Disabled and loading (spinner) states supported
- [ ] Hover/focus states match reference (glow + slight lift on hover)

### Build Badge component for status pills

**Labels:** area: design-system, good first issue

Implement a `<Badge>` for status indicators (green/amber/red/cyan/gray), used to show provider application status at a glance.

**Acceptance Criteria**

- [ ] Color variants: green, amber, red, cyan, gray, matching reference `.badge-*` styles
- [ ] Maps cleanly onto ProviderStatus values (Pending -> amber, Verified -> green, Suspended -> gray, Revoked -> red)

**Reference:** ProviderStatus enum from the reference build: `{0: Pending, 1: Verified, 2: Suspended, 3: Revoked}`

### Build form field components (Input, Select, Textarea)

**Labels:** area: design-system

Shared form primitives styled after the reference `.input-field` class, used throughout the review and settings screens.

**Acceptance Criteria**

- [ ] Input, Select, and Textarea share consistent styling, focus ring, and placeholder color
- [ ] Support label, helper text, and error states
- [ ] Keyboard accessible with proper label/`for` association

### Build Modal/Dialog component

**Labels:** area: design-system

A reusable modal for confirmation flows (e.g. "Approve this provider?", "Reject with reason").

**Acceptance Criteria**

- [ ] Traps focus while open; closes on Esc and backdrop click
- [ ] Supports a title, body content, and footer actions
- [ ] Animates in with the reference's slide-up/fade-in treatment

### Build Table component for application queues

**Labels:** area: design-system

A reusable data table (sortable headers, row click-through, empty-state slot) to power the provider application queue and audit log views.

**Acceptance Criteria**

- [ ] Supports sortable columns, row selection (for bulk actions), and a loading state
- [ ] Renders an empty state when there is no data
- [ ] Responsive behavior on narrow viewports (horizontal scroll or stacked layout)

### Build Toast notification system

**Labels:** area: design-system

Port the reference build's toast API (`toast.success(message, { title, txHash })` / `toast.error(...)`) so async actions (approve/reject, transaction submission) give clear feedback.

**Acceptance Criteria**

- [ ] `toast.success` / `toast.error` helpers with optional `title` and `txHash` (linking to a block explorer)
- [ ] Auto-dismiss with a manual close option
- [ ] Stacks multiple toasts without overlapping

**Reference:** Mirrors src/components/Toast.jsx in https://locka.remixdapp.eth.limo/

### Build loading skeleton and spinner components

**Labels:** area: design-system, good first issue

Reusable skeleton placeholders (for the queue table, detail view) and a small inline spinner matching the reference build's spinner animation, used inside buttons during async actions.

**Acceptance Criteria**

- [ ] `<Skeleton>` supports block/text/avatar shapes
- [ ] `<Spinner>` matches reference sizing/animation and drops cleanly into buttons

### Build EmptyState component

**Labels:** area: design-system, good first issue

"No pending applications", "No results match your filters" - a consistent empty-state block used across the queue, audit log, and search results.

**Acceptance Criteria**

- [ ] Accepts icon/illustration, title, description, and an optional call-to-action
- [ ] Used in at least one real screen (application queue) once available

### Build app shell: Navbar + sidebar navigation

**Labels:** area: design-system

Implement the persistent app shell using the reference build's nav-link/active styling, wired to the Admin Client's own sections (Dashboard, Applications, Providers, Audit Log, Settings) rather than the patient/provider portal tabs from the reference.

**Acceptance Criteria**

- [ ] Sidebar/nav lists Admin Client sections with active-state highlighting
- [ ] Shows the connected admin identity/wallet and a logout control
- [ ] Responsive: collapses to a mobile-friendly nav below a defined breakpoint

---

## [EPIC] Authentication & Access Control

Admin login, Freighter wallet connect, sessions, and role-based access control.

**Scope of this epic:**

- Build admin login page
- Integrate Freighter wallet connect
- Implement auth session management
- Implement protected route middleware
- Implement role-based access control (RBAC)
- Build admin user management page
- Implement logout flow

Individual tasks are opened as separate issues labeled `area: auth` and reference this epic in their description.

### Build admin login page

**Labels:** area: auth

Email/password (or SSO, if provided by locka-api) login screen for administrators, styled to match the reference's dark glass-card aesthetic.

**Acceptance Criteria**

- [ ] Login form with validation and error states (invalid credentials, network failure)
- [ ] Successful login stores a session and redirects to the dashboard
- [ ] Loading state on submit

### Integrate Freighter wallet connect

**Labels:** area: auth, help wanted

Allow an admin to connect their Stellar Freighter wallet, required for signing on-chain ProviderRegistry approval transactions later.

**Acceptance Criteria**

- [ ] "Connect Wallet" detects Freighter, prompts connection, and surfaces a clear message if Freighter is not installed
- [ ] Connected public key displayed in the navbar
- [ ] Disconnect/switch-account flow supported

### Implement auth session management

**Labels:** area: auth

Handle session persistence (token storage, refresh, expiry) against locka-api, decoupled from any single page.

**Acceptance Criteria**

- [ ] Session/token stored securely (httpOnly cookie preferred over localStorage)
- [ ] Expired/invalid sessions redirect to login
- [ ] Silent refresh (if supported by the API) avoids unnecessary re-logins

### Implement protected route middleware

**Labels:** area: auth

Guard all admin routes so unauthenticated users are redirected to login before any application data loads.

**Acceptance Criteria**

- [ ] Unauthenticated access to any `/admin/*` route redirects to `/login`
- [ ] Authenticated users are redirected away from `/login`
- [ ] Guard is centralized (middleware or layout-level), not duplicated per page

### Implement role-based access control (RBAC)

**Labels:** area: auth, help wanted

Distinguish at least two admin roles - e.g. super-admin (can manage other admins) and reviewer (can approve/reject applications only) - and gate UI/actions accordingly.

**Acceptance Criteria**

- [ ] Role is available from the session and exposed via a hook (e.g. `useAdminRole()`)
- [ ] Reviewer-role users cannot see/access admin-management screens
- [ ] Attempting a disallowed action fails gracefully with a clear message

### Build admin user management page

**Labels:** area: auth

A screen for super-admins to invite, deactivate, or change the role of other admin accounts.

**Acceptance Criteria**

- [ ] List of admin users with role and status
- [ ] Invite flow (email invite or manual creation, per locka-api's supported method)
- [ ] Deactivate/reactivate an admin account

### Implement logout flow

**Labels:** area: auth, good first issue

Clear the session/wallet connection and return to the login screen.

**Acceptance Criteria**

- [ ] Logout available from the navbar on every authenticated screen
- [ ] Clears the session token and, if connected, disconnects the wallet from app state
- [ ] Redirects to `/login`

---

## [EPIC] Provider Application Review (Core Feature)

The heart of the app: the queue and workflow admins use to review, approve, reject, suspend, and revoke health provider applications.

**Scope of this epic:**

- Build provider application queue view
- Build provider application detail view
- Build license/credential document viewer
- Implement approve application flow
- Implement reject application flow
- Implement suspend/revoke actions for verified providers
- Add search, filter, and sort to the application queue
- Add pagination to the application queue
- Implement bulk approve/reject actions
- Build per-provider status history/timeline
- Build authorized staff management for a verified provider

Individual tasks are opened as separate issues labeled `area: core-feature` and reference this epic in their description.

### Build provider application queue view

**Labels:** area: core-feature

The primary screen: a table of provider applications awaiting review, mirroring the ProviderStatus states surfaced by the on-chain registry.

**Acceptance Criteria**

- [ ] Columns: organization/provider name, provider type, country, submitted date, status badge
- [ ] Defaults to showing Pending applications first
- [ ] Clicking a row opens the application detail view

**Reference:** ProviderStatus: {0: Pending, 1: Verified, 2: Suspended, 3: Revoked}. ProviderTypes: Hospital, Clinic, Doctor, Laboratory, Pharmacy, Insurance Company, Public Health Agency (from the reference build).

### Build provider application detail view

**Labels:** area: core-feature

Full detail screen for a single application: provider type, submitted license number/hash, country, wallet address, and submission timestamp, plus the approve/reject actions.

**Acceptance Criteria**

- [ ] Displays all fields captured at registration (provider type, license number, license hash, country)
- [ ] Shows current on-chain status
- [ ] Links back to the queue

### Build license/credential document viewer

**Labels:** area: core-feature

If providers attach supporting documents (license scans, certificates) via locka-api, render them inline (PDF and image preview) so admins don't need to download files to review them.

**Acceptance Criteria**

- [ ] Inline preview for PDF and common image formats
- [ ] Fallback download link for unsupported types
- [ ] Handles the missing/no-document case gracefully

### Implement approve application flow

**Labels:** area: core-feature

The core admin action: approve a pending provider, moving it from Pending to Verified.

**Acceptance Criteria**

- [ ] Confirmation modal before submitting
- [ ] Triggers the on-chain verification write and shows a pending -> success toast with tx hash
- [ ] Queue/detail view reflects the new status once confirmed

### Implement reject application flow

**Labels:** area: core-feature

Reject a pending application, capturing a reason so the provider understands what to fix and can reapply.

**Acceptance Criteria**

- [ ] Reject action requires a non-empty reason/note
- [ ] Reason is stored and visible in the application's history
- [ ] Provider-facing status updates accordingly via locka-api

### Implement suspend/revoke actions for verified providers

**Labels:** area: core-feature, help wanted

Admins need to act on providers after initial approval too - suspending access temporarily or revoking it permanently (e.g. after a complaint or credential expiry).

**Acceptance Criteria**

- [ ] Suspend and Revoke actions available from a verified provider's detail view
- [ ] Both require a confirmation modal; revoke requires a reason
- [ ] Reflected on-chain via ProviderRegistry

### Add search, filter, and sort to the application queue

**Labels:** area: core-feature

Let admins narrow a growing queue by status, provider type, country, or free-text search on name, and sort by submission date.

**Acceptance Criteria**

- [ ] Filter by status (Pending/Verified/Suspended/Revoked) and provider type
- [ ] Free-text search across provider name/license number
- [ ] Sort toggles on submitted date and status

### Add pagination to the application queue

**Labels:** area: core-feature, good first issue

Keep the queue table performant as applications accumulate.

**Acceptance Criteria**

- [ ] Server-side (preferred) or client-side pagination with a sensible page size
- [ ] Page state reflected in the URL so it is shareable/bookmarkable

### Implement bulk approve/reject actions

**Labels:** area: core-feature, help wanted

Let an admin select multiple pending applications and approve or reject them in one action, for high-volume periods.

**Acceptance Criteria**

- [ ] Row selection checkboxes plus a select-all control
- [ ] Bulk action confirms the count before executing and reports per-item success/failure

### Build per-provider status history/timeline

**Labels:** area: core-feature

A timeline of everything that happened to a provider's application: submitted -> approved/rejected -> suspended/revoked, each entry with actor, timestamp, and note.

**Acceptance Criteria**

- [ ] Timeline renders in the provider detail view in chronological order
- [ ] Each entry shows the responsible admin, action, and any reason/note
- [ ] Sourced from the audit log

### Build authorized staff management for a verified provider

**Labels:** area: core-feature, help wanted

Per the platform docs, a verified provider organization has multiple authorized staff members; admins need visibility into (and the ability to revoke) individual staff authorizations under an organization.

**Acceptance Criteria**

- [ ] Detail view lists staff associated with a verified provider
- [ ] Admin can revoke an individual staff member's authorization without revoking the whole provider

---

## [EPIC] Blockchain / Soroban Integration

Wire admin decisions to the on-chain ProviderRegistry contract on Stellar/Soroban.

**Scope of this epic:**

- Set up Soroban RPC client for ProviderRegistry reads
- Implement Freighter transaction signing for approval writes
- Build transaction status tracking UI
- Index ProviderRegistry events via locka-api

Individual tasks are opened as separate issues labeled `area: blockchain` and reference this epic in their description.

### Set up Soroban RPC client for ProviderRegistry reads

**Labels:** area: blockchain, help wanted

A typed client wrapping Soroban RPC calls to read provider records/status from the ProviderRegistry contract.

**Acceptance Criteria**

- [ ] Client exposes typed methods (e.g. `getProvider(id)`, `getProviderStatus(id)`, `listPendingProviders()`)
- [ ] Configurable network (testnet/mainnet) and contract ID via the env config
- [ ] Includes basic error handling for RPC failures

**Reference:** Note: the design reference (https://locka.remixdapp.eth.limo/) is an ethers.js/EVM UI prototype used only for visual design - this repo targets the real Stellar/Soroban ProviderRegistry contract per the platform documentation.

### Implement Freighter transaction signing for approval writes

**Labels:** area: blockchain, help wanted

Wire the approve/reject/suspend/revoke actions to actually submit signed transactions to ProviderRegistry via the connected Freighter wallet.

**Acceptance Criteria**

- [ ] Approve/reject/suspend/revoke build the correct contract invocation and request a Freighter signature
- [ ] Handles user rejection in Freighter gracefully (no crash, clear toast)
- [ ] Submitted transaction hash is surfaced to the admin

### Build transaction status tracking UI

**Labels:** area: blockchain

Give feedback while a submitted transaction is pending confirmation, rather than leaving the admin guessing.

**Acceptance Criteria**

- [ ] Visible pending/confirmed/failed states tied to a submitted transaction
- [ ] Failure state surfaces the contract/RPC error message
- [ ] UI unblocks (or clearly re-enables) once resolved

### Index ProviderRegistry events via locka-api

**Labels:** area: blockchain, help wanted

Reconcile on-chain state with the admin UI by consuming locka-api's indexed ProviderRegistry events, so the queue reflects reality even if a write was submitted outside this client.

**Acceptance Criteria**

- [ ] Queue/detail views refresh from indexed event data, not just local optimistic state
- [ ] Handles eventual consistency (on-chain confirmed but not yet indexed) with a clear "syncing" indicator

---

## [EPIC] Dashboard, Notifications & Audit

Give admins situational awareness: summary stats, audit trail, and live notifications.

**Scope of this epic:**

- Build admin dashboard with summary stats
- Build global audit log view
- Build in-app notification center
- Implement real-time queue updates

Individual tasks are opened as separate issues labeled `area: dashboard` and reference this epic in their description.

### Build admin dashboard with summary stats

**Labels:** area: dashboard

Landing page after login: counts of applications by status, and recent activity, so an admin gets situational awareness before diving into the queue.

**Acceptance Criteria**

- [ ] Stat cards for Pending / Verified / Suspended / Revoked counts
- [ ] Recent activity list (last N approvals/rejections)
- [ ] Links from each stat card into the filtered queue view

### Build global audit log view

**Labels:** area: dashboard

A searchable, paginated log of every admin action (approve, reject, suspend, revoke, admin-user changes) for accountability and compliance.

**Acceptance Criteria**

- [ ] Each entry: actor, action, target provider, timestamp, reason/note (if any)
- [ ] Filterable by admin, action type, and date range
- [ ] Exportable (CSV) for compliance reporting

### Build in-app notification center

**Labels:** area: dashboard

Surface new incoming applications and important events (e.g. a transaction failure) without requiring a manual refresh of the queue.

**Acceptance Criteria**

- [ ] Notification bell with unread count in the navbar
- [ ] New pending application triggers a notification
- [ ] Notifications can be marked read / cleared

### Implement real-time queue updates

**Labels:** area: dashboard, help wanted

Keep the application queue current across admins working concurrently, via polling or a websocket subscription to locka-api.

**Acceptance Criteria**

- [ ] New applications appear in the queue without a manual page refresh
- [ ] Approach (polling interval vs. websocket) documented with its trade-offs
- [ ] Avoids duplicate/flickering rows on refresh

---

## [EPIC] Testing & Quality Assurance

Unit, end-to-end, and accessibility test coverage for the app.

**Scope of this epic:**

- Set up Jest + React Testing Library
- Set up Playwright end-to-end testing
- Write unit tests for core design-system components
- Write E2E test for the full provider approval workflow
- Run an accessibility (a11y) audit pass

Individual tasks are opened as separate issues labeled `area: testing` and reference this epic in their description.

### Set up Jest + React Testing Library

**Labels:** area: testing, good first issue

Establish the unit/component testing foundation for the project.

**Acceptance Criteria**

- [ ] Jest configured for the Next.js/TypeScript setup
- [ ] One example component test passes
- [ ] `npm test` documented in README/CONTRIBUTING

### Set up Playwright end-to-end testing

**Labels:** area: testing

Establish the E2E testing foundation, running against a local dev build.

**Acceptance Criteria**

- [ ] Playwright installed and configured
- [ ] One smoke test (e.g. login page renders) passes in headless mode

### Write unit tests for core design-system components

**Labels:** area: testing, good first issue

Cover Button, Badge, Modal, Table, and Toast with unit tests for their variants and interactive states.

**Acceptance Criteria**

- [ ] Each listed component has tests covering its documented variants/props
- [ ] Coverage report generated

### Write E2E test for the full provider approval workflow

**Labels:** area: testing, help wanted

An end-to-end test that logs in as an admin, opens a pending application, and approves it, asserting the resulting status change.

**Acceptance Criteria**

- [ ] Test covers login -> queue -> detail -> approve -> status reflected
- [ ] Runs against a mocked/staging backend and contract, not live mainnet

### Run an accessibility (a11y) audit pass

**Labels:** area: testing, help wanted

Given the dark, glass aesthetic of the reference design, verify the implemented UI still meets WCAG AA contrast and keyboard/screen-reader accessibility.

**Acceptance Criteria**

- [ ] Automated audit (e.g. axe) run against key screens with issues logged/fixed
- [ ] Keyboard-only navigation verified for login, queue, and approve/reject flows
- [ ] Color contrast for text on glass/navy backgrounds meets WCAG AA

---

## [EPIC] DevOps, CI/CD & Deployment

Automate checks and deployments so contributions are verified and shippable.

**Scope of this epic:**

- Set up GitHub Actions CI
- Set up preview deployments for PRs
- Configure production build and environment configs
- Integrate error monitoring (Sentry)

Individual tasks are opened as separate issues labeled `area: devops` and reference this epic in their description.

### Set up GitHub Actions CI

**Labels:** area: devops

Automated checks on every PR so broken code can't merge silently.

**Acceptance Criteria**

- [ ] Workflow runs lint, typecheck, unit tests, and build on every PR
- [ ] Status checks required before merge (documented for maintainers to enable branch protection)

### Set up preview deployments for PRs

**Labels:** area: devops

Give reviewers a live preview of each PR's changes without pulling the branch locally.

**Acceptance Criteria**

- [ ] Each PR gets an automatically deployed preview URL (e.g. via Vercel)
- [ ] Preview URL posted as a PR comment/check

### Configure production build and environment configs

**Labels:** area: devops

Define how staging/production environment variables (API URLs, Stellar network) are managed and documented for deployment.

**Acceptance Criteria**

- [ ] Documented separation of dev/staging/production config
- [ ] Production build verified to run with production-like env vars

### Integrate error monitoring (Sentry)

**Labels:** area: devops, help wanted

Capture unhandled frontend errors in deployed environments so issues surface before a user/admin reports them.

**Acceptance Criteria**

- [ ] Sentry (or equivalent) initialized for production builds only
- [ ] Test error confirmed to appear in the monitoring dashboard
- [ ] No sensitive data (tokens, PII) included in captured events

---

## [EPIC] Community & Documentation

The housekeeping that makes this a healthy repo to contribute to.

**Scope of this epic:**

- Write CONTRIBUTING.md
- Add CODE_OF_CONDUCT.md
- Add issue and pull request templates
- Set up Storybook for component documentation
- Add 404 page and global error boundary

Individual tasks are opened as separate issues labeled `area: community` and reference this epic in their description.

### Write CONTRIBUTING.md

**Labels:** area: community, good first issue

Document how to get the project running locally, coding conventions, branch/PR process, and how issues are labeled, so first-time contributors aren't guessing.

**Acceptance Criteria**

- [ ] Local setup steps verified to work from a clean clone
- [ ] PR/commit conventions documented
- [ ] Label taxonomy (`epic`, `area: *`, `good first issue`, `help wanted`) explained

### Add CODE_OF_CONDUCT.md

**Labels:** area: community, good first issue

Adopt a standard code of conduct (e.g. Contributor Covenant) for the project.

**Acceptance Criteria**

- [ ] CODE_OF_CONDUCT.md added
- [ ] Linked from README.md and CONTRIBUTING.md

### Add issue and pull request templates

**Labels:** area: community, good first issue

Structured templates so bug reports, feature requests, and PRs consistently include the information maintainers need.

**Acceptance Criteria**

- [ ] `.github/ISSUE_TEMPLATE/` includes at least bug-report and feature-request templates
- [ ] `.github/PULL_REQUEST_TEMPLATE.md` added with a description/checklist format

### Set up Storybook for component documentation

**Labels:** area: community

Give contributors an isolated environment to build/view design-system components without needing the full app/auth/backend running.

**Acceptance Criteria**

- [ ] Storybook installed and configured for the Next.js project
- [ ] Every core design-system component has at least one story

### Add 404 page and global error boundary

**Labels:** area: community, good first issue

Handle unknown routes and unexpected render errors gracefully instead of a blank screen or default framework error page, styled to match the app's visual language.

**Acceptance Criteria**

- [ ] Custom 404 page matches the app's design system
- [ ] A top-level error boundary catches render errors and offers a way back (e.g. "Return to dashboard")

---
