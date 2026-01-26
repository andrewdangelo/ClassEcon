# Beta Access Code — How to Generate

This document explains how to generate beta access codes used to let early users join the app.

## Purpose

Beta access codes are short tokens stored in MongoDB that gate access for early testers. The repository contains a small script that creates these records.

## Requirements

- Node / pnpm (or npm) installed
- `pnpm install` run in the `Backend` directory so dev dependencies like `tsx` are available
- A reachable MongoDB instance. The script reads `DATABASE_URL` from environment variables; if not set it falls back to `mongodb://localhost:27017/classecon`.

## Script location

The generator script lives at `Backend/scripts/generate-beta-code.ts` and is exposed via an npm script in `Backend/package.json` as `generate-beta-code`.

## Usage

From the `Backend` folder:

```bash
cd Backend
pnpm install      # if you haven't already
pnpm run generate-beta-code <CODE> "<DESCRIPTION>" <MAX_USES>
# Example:
pnpm run generate-beta-code BETA2026 "Early testers" 50
```

From the repo root (pnpm workspace):

```bash
pnpm --filter Backend run generate-beta-code -- BETA2026 "Early testers" 50
```

Arguments:
- `<CODE>` — short string for the access code (will be upper-cased by the script). Default: `BETA2024` if omitted.
- `<DESCRIPTION>` — optional human-readable description (wrap in quotes if it contains spaces).
- `<MAX_USES>` — integer maximum number of times this code may be used. Default: `10`.

## Environment

Set `DATABASE_URL` in `Backend/.env` or in your shell to point to your MongoDB. Example `Backend/.env`:

```env
DATABASE_URL=mongodb://localhost:27017/classecon
```

If the script finds an existing code with the same value it will exit with an error and non-zero exit code.

## Example output

When successful the script prints summary info, for example:

```
🎉 Beta access code created successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Code: BETA2026
📝 Description: Early testers
🔢 Max Uses: 50
📅 Created: 2026-01-26T12:34:56.789Z
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Disconnected from MongoDB
```

## Notes

- The script connects with `dotenv` so `Backend/.env` is the simplest place to store `DATABASE_URL` during local development.
- The script uses `tsx` to run TypeScript directly. If you prefer, you can compile the TypeScript and run the produced JS.

---

Reference: [Backend/scripts/generate-beta-code.ts](../../Backend/scripts/generate-beta-code.ts)
