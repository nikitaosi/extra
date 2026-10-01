# Extra

An expense tracker built with Next.js App Router and a typed, binary Protobuf API. Expenses live in PostgreSQL on the separate Extra API backend; the browser does not store them locally.

## Run locally

Use Node.js 24 and pnpm 11. Start the API and PostgreSQL first, following the backend README, and create its first user. Then, in this repository:

```sh
pnpm install
cp .env.example .env.local
pnpm dev
```

Open <http://localhost:3000> and sign in with the user created in the API. `NEXT_PUBLIC_API_URL` points to the API at `http://localhost:3101` by default. It is a public browser setting, never a place for secrets. The session uses an HttpOnly cookie; no API key is bundled into the frontend.

## What is included

- Sign-in and sign-out for one protected user.
- Create, read, update and delete expenses through ConnectRPC's binary Protobuf transport.
- Search, category filtering, pagination, loading and error states.
- Exact minor-unit money conversion, with no floating-point arithmetic for stored amounts.
- A generated TypeScript client from the backend's canonical `.proto` contract.

If the backend contract changes, run `pnpm proto:generate` in the adjacent `extra-api` repository, then `pnpm api:sync` here. Set `API_REPO_DIR` if the backend lives elsewhere.

## Checks

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

GitHub Actions runs the same checks on pushes and pull requests. Changes to the API contract should be regenerated in the backend and synced here before committing.

Deployment is not configured yet. The intended frontend host is Netlify; the API and database host remain to be chosen. The cookie and API origin settings must be reviewed together before deploying across domains.
