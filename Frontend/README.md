# Classroom Economy Frontend (React + Vite + Tailwind + shadcn/ui)

A minimal, production-quality starter scaffold.

## Quickstart

```bash
pnpm i   # or npm i / yarn
pnpm dev # http://localhost:5173
```

## What’s included
- Vite + React + TypeScript
- TailwindCSS configured with shadcn-style tokens
- Minimal shadcn/ui primitives: Button, Card, Input
- React Router layout + example pages: Dashboard, Classes, Students, Store
- Aliases: `@` -> `src/`

## Add more shadcn components
1. Install the CLI (optional):
   ```bash
   npx shadcn@latest init
   ```
2. Generate components, e.g.:
   ```bash
   npx shadcn@latest add dialog dropdown-menu table
   ```

## Theming
Switch tokens in `src/index.css` or use `dark` class on `<html>` to enable dark mode.
