# VIP Command Center

Private command center for VIP chat, offers, follow-ups, posting kits, and retention — CRM plus ops dashboard, not one-off content spam.

## Modules

CRM · buyer scoring · offer/menu generator · follow-up engine · posting-kit generator · campaign tracking · analytics · VIP retention

## Docs

- [docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md) — positioning and V1/V2 scope
- [docs/EXECUTION_PLAN.md](docs/EXECUTION_PLAN.md) — day-by-day build plan
- [n8n/workflows.md](n8n/workflows.md) — automation workflows

## Layout

- `apps/` — dashboard / app code
- `n8n/` — workflow notes
- `docs/` — product + execution specs
- Nested `Vip-command-base/` may hold an earlier base tree

## Quick start

1. Create a Supabase project and apply the schema from the docs/app tree.
2. Configure `.env` from `.env.example` (Telegram bot, Supabase, AI keys as needed).
3. Run Telegram commands from the execution plan (`/newlead`, `/paid`, `/hot`, `/metrics`), then bring up the Next.js dashboard.

See the product spec for V1 pages (Leads, Hot Leads, Follow-Ups, Campaign Posts, Transactions, Offers, Metrics, Prompt Runs).
