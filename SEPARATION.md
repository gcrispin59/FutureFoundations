# Product separation — 2026-08-10

**MAGGie Pro** and **ARTI Scale** are standalone products and are no longer part of the Future Foundations PAC architecture.

## Future Foundations PAC (this repo)

Remaining scope:

- **True to the Oath** — institutional integrity, civic education
- **Political Candidate Covenant** — candidate assessment, voter matching
- **American Renewal Covenant** — reform tiers and pledge documents
- **Research** — civic/history discussion papers (`research/`)
- **Donations** — Square integration (`public/donate/`)

## Separate products

| Product | Location |
|---------|----------|
| MAGGie Pro | `S:/projects/MAGGie/pro/` — https://maggie-pro.netlify.app |
| ARTI Scale | `S:/projects/ARTI Scale/` — frameworks, platform schema in `platform/` |

## What was removed from this repo

- Database tables: `individuals`, `individual_assessments`, `journeys`, `arti_assessments`
- Project seeds: MAGGie, Agency, Journey, Resiliency, ARTI Scale, AI for Better Humanity
- API utilities for individual/ARTI assessment (moved to respective product repos)
- Ecosystem references on public site and in README

## Related products (external links only)

Future Foundations may link to MAGGie Pro or ARTI Scale as affiliated but independent products. No shared database schema or nested project hierarchy.
