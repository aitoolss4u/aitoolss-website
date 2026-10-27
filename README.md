# AIToolss

A global, English-language directory for discovering helpful AI tools and browser utilities.

## Product principles

- Brand palette: Midnight Navy `#0B1020`, Electric Violet `#7657FF`, Neon Cyan `#35D9FF`.
- Responsive and accessible by default.
- The 60-tool catalogue is a roadmap; a tool is not advertised as functional until its implementation is tested.
- No paid APIs or services without explicit approval. Prefer browser-native processing where practical.
- Advertising stays disabled until the required publisher setup and policy checks are complete.

## Tech stack

- Next.js App Router
- React and TypeScript
- Tailwind CSS
- npm

## Local development

Requirements: Node.js 20.9 or newer (Node.js 24 LTS is suitable).

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```

GitHub Actions runs these checks for the foundation branch and pull requests to `main`.

## Current scope

The homepage includes searchable/filterable directory cards and the category navigation. Some entries are marked “Coming soon” and are not functional tools yet. Tool implementation, SEO/legal pages, deployment, and domain connection are subsequent project steps.

## Deployment and domain

Vercel's free tier is the initial deployment candidate; review current terms and limits before deploying. The intended domain is not yet purchased. Do not purchase it until the owner confirms the final hosting and domain pricing.
