# Botcraft — RAG Chatbot Platform (Dashboard)

> The web dashboard for [Botcraft](https://github.com/sayyedarib/botcraft): upload a knowledge base,
> tune the RAG pipeline, test the bot in a live playground, theme the widget, and copy an embed
> snippet onto your site.

Built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**,
**shadcn/ui**, **TanStack Query**, and **Zustand**.

**Backend repo:** [sayyedarib/botcraft](https://github.com/sayyedarib/botcraft)

## Demo

https://github.com/user-attachments/assets/54d84790-75c6-422e-96ae-de04889a3490

---

## Why this project is interesting

- **A real product surface, not a toy CRUD app** — 22 routes covering auth, onboarding, a
  multi-source knowledge base, analytics, a live WebSocket playground, and a theming studio.
- **Deliberate state boundaries.** Server state (workspaces, knowledge base, config) lives in
  TanStack Query with cache invalidation; client-only state (active workspace) lives in a persisted
  Zustand store. Neither leaks into the other.
- **Runtime-configurable ML pipeline from the UI.** The Advanced Settings page exposes chunk size,
  overlap, splitter, PDF parser, embedding model, LoRA/QLoRA fine-tuning parameters, temperature, and
  the system prompt — all validated with Zod before hitting the API.
- **Live theming.** Theme colors are converted to CSS custom properties at runtime, so the widget
  preview updates instantly without a rebuild.
- **Type-safe end to end** — TypeScript throughout, Zod schemas on every form, typed API client.

---

## Features

| Page | What it does |
|---|---|
| **Auth** (`/login`, `/signup`, `/forgot-password`, `/reset-password`) | Cookie-based session auth; middleware guards `/dashboard/*` |
| **Onboarding** (`/onboarding`) | Guided first-run flow to create a workspace |
| **Dashboard** (`/dashboard`) | Usage overview with Recharts visualizations |
| **Analytics** (`/analytics`) | Conversation and retrieval metrics |
| **Knowledge base** (`/knowledge-base`) | Manage PDFs, links, spreadsheets, and images — sortable, filterable TanStack Tables with per-source detail views |
| **Playground** (`/playground`) | Live chat against your knowledge base over a WebSocket |
| **General settings** (`/settings/general`) | Workspace name and the copy-paste embed `<script>` snippet |
| **Advanced settings** (`/settings/advanced`) | Full RAG pipeline configuration |
| **Theme settings** (`/settings/theme`) | Widget colors with live preview |

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 App Router + Turbopack | Server components by default; route groups keep auth and dashboard layouts separate |
| UI | React 19, Tailwind CSS v4, shadcn/ui (47 components) | Owned, themeable primitives rather than an opaque component library |
| Server state | TanStack Query v5 | Caching, background refetch, and invalidation instead of hand-rolled `useEffect` fetching |
| Client state | Zustand + `persist` + `immer` | Active workspace survives reloads; immer keeps updates readable |
| Forms | React Hook Form + Zod | One schema drives both validation and inferred TypeScript types |
| Tables | TanStack Table v8 | Sorting, filtering, column visibility, pagination |
| Charts | Recharts | Composable, themeable via CSS variables |
| HTTP | Axios (`withCredentials`) | Sends the HTTP-only auth cookie on every request |

---

## Getting started

### Prerequisites

- **Node.js 18.18+** (developed on 20.x)
- The **[Botcraft backend](https://github.com/sayyedarib/botcraft)** running on `http://localhost:8000`

### 1. Clone and install

```bash
git clone https://github.com/sayyedarib/botcraft-frontend.git
cd botcraft-frontend

npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api/v1` | Base URL of the Botcraft API, including the version prefix and no trailing slash. Every path in `src/lib/api/endpoints` is relative to it, and the playground WebSocket URL is derived from it — so `https://` automatically becomes `wss://` in production. |

### 3. Run

```bash
npm run dev
```

Open http://localhost:3000. Sign up, complete onboarding to create a workspace, then upload a
document under **Knowledge base** and try it in the **Playground**.

### Other commands

```bash
npm run build       # production build
npm run start       # serve the production build
npm run lint        # ESLint
npm test            # Vitest unit tests
npm run test:watch  # Vitest in watch mode
```

### Docker

```bash
docker build --build-arg NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1 -t botcraft-frontend .
docker run -p 3000:3000 botcraft-frontend
```

`NEXT_PUBLIC_*` values are inlined at build time, so the API URL is a build
argument rather than a runtime environment variable.

## Tests

```bash
npm test
```

| Area | What's guarded |
|---|---|
| WebSocket URL | `https://` yields `wss://` — a `ws://` socket on an HTTPS page is blocked as mixed content |
| Playground socket | Every message survives a burst, the socket closes on unmount, sends are refused before the handshake completes, and re-renders don't open a second connection |
| Validation | Signup password rules, password confirmation, and email format |
| Theming | camelCase colour names become CSS custom properties |

CI runs lint, `tsc --noEmit`, the unit tests, and a production build on every push.

---

## Project structure

```
src/
├── app/
│   ├── (auth)/              # Route group: login, signup, password reset
│   ├── (dashboard)/         # Route group: shares the sidebar layout
│   │   ├── dashboard/       analytics/       playground/
│   │   ├── knowledge-base/  # pdfs · links · images · xls, each with [id] detail
│   │   └── settings/        # general · advanced · theme
│   ├── onboarding/
│   └── layout.tsx           # Root layout, providers, fonts
├── components/
│   ├── ui/                  # 47 shadcn/ui primitives
│   ├── charts/              # Recharts wrappers
│   ├── auth/                onboarding/
│   └── app-sidebar.tsx      workspace-switcher.tsx      nav-*.tsx
├── hooks/                   # use-auth, use-workspace, use-knowledge-base,
│                            # use-advanced-config, use-theme, use-websocket
├── lib/
│   ├── api/
│   │   ├── endpoints/       # client.ts (axios) + one module per resource
│   │   └── base.ts
│   ├── validations/         # Zod schemas
│   ├── constants/           # routes, static data
│   └── utils.ts             # `cn()` class merger
├── stores/workspace-store.ts   # Zustand, persisted
├── providers/query-provider.tsx
├── types/                   # Shared TypeScript types
└── middleware.ts            # Redirects unauthenticated users off /dashboard/*

public/
└── chatbot.js               # The embeddable widget script
```

### Conventions

- **Route groups** — `(auth)` and `(dashboard)` share layouts without adding URL segments.
- **One hook per resource** — each `hooks/use-*.ts` wraps the matching `lib/api/endpoints/*` module
  and owns its query keys and invalidation, so components never call Axios directly.
- **Zod as the source of truth** — form schemas infer their TypeScript types via `z.infer`.

---

## How auth works

1. Login posts to the backend, which sets an HTTP-only `access_token` cookie.
2. `middleware.ts` checks for that cookie on `/dashboard/*` and redirects to `/login` if it's absent.
3. The Axios client sends `withCredentials: true`, so the cookie rides along on every API call.

Because the token is HTTP-only, it is never readable from JavaScript — which rules out token theft
via XSS.

---

## Roadmap

- [ ] Extend middleware matching to all authenticated routes (currently `/dashboard/*` only)
- [ ] Optimistic updates for knowledge-base uploads
- [ ] Auto-reconnect with backoff for the playground WebSocket
- [ ] Component tests (Vitest + Testing Library) and E2E coverage (Playwright)
- [ ] Storybook for the `components/ui` primitives

## License

See [LICENSE](./LICENSE).
