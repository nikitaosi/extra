# Extra

Extra is a private, full-stack expense tracker built as a portfolio project. The Next.js app talks to a separate Fastify API through ConnectRPC and binary Protobuf; PostgreSQL is the source of truth for expenses and sessions.

## Product demo

After signing in, you can create, browse, search, filter, edit, and delete expenses. Amounts are validated and stored as integer satang/cents, not floating-point values. New expenses default to Thai baht (THB), with USD available as an additional currency. The interface supports light and dark themes, follows the device preference on first visit, and remembers only the selected theme in browser storage.

The API remains the only place expense records are stored. The browser does not cache expense data locally.

## Architecture

- `app/` — App Router entry point, metadata, global design tokens, and query provider.
- `src/features/expense-tracker/` — expense workflow, view components, form model, and theme control.
- `src/shared/api/` — ConnectRPC transport and generated TypeScript contract.
- `src/shared/lib/` — exact money parsing and formatting.
- `tests/` — API transport and money unit tests.

The backend and canonical Protobuf contract live in the adjacent `extra-api` repository. Database changes are versioned as SQL migrations there. The currency update is additive: THB is supported for new expenses, while existing GEL records remain readable.

## Run locally

Use Node.js 24 and pnpm 11. Start the API and PostgreSQL first, following the backend README, and create its first user. Then, in this repository:

```sh
pnpm install
cp .env.example .env.local
pnpm dev
```

Open <http://localhost:3000> and sign in with the user created in the API. `NEXT_PUBLIC_API_URL` points to the local API at `http://localhost:3101` by default. It is a public browser setting, never a place for secrets. The session uses an HttpOnly cookie; no API key is bundled into the frontend.

## Contract workflow

The `.proto` contract in `extra-api` is canonical. After changing it, run `pnpm proto:generate` in that repository and then `pnpm api:sync` here. Set `API_REPO_DIR` if the backend lives elsewhere. Keep old enum values stable when extending the API.

## Checks

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

GitHub Actions runs the frontend checks on pushes and pull requests. The API test suite runs CRUD and authentication flows against an isolated PostgreSQL-compatible test database.

## Hosting

The frontend uses its own `/api` path by default. Netlify proxies that path to the hosted API so the session cookie remains same-origin. `NEXT_PUBLIC_API_URL` can override the address for local or non-Netlify setups. Do not point the browser directly at an unrelated `onrender.com` domain: the `SameSite=Lax` session cookie will not accompany cross-site API requests.
