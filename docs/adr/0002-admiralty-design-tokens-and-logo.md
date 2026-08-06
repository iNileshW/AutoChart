# ADR 0002: Adopt Admiralty brand tokens and UKHO logo for the SPA

- **Status**: Accepted
- **Date**: 2026-08-06
- **Deciders**: Frontend Lead, Product Owner
- **Consulted**: Backend Lead
- **Informed**: Design / Comms

## Context and problem statement

The SPA needed a visual identity aligned with UKHO / Admiralty presentation guidelines so it reads as an official-looking tool rather than a raw dev prototype.

## Decision drivers

- Recognisable UKHO branding for stakeholder demos.
- Alignment with `UKHO/admiralty-design-system` where practical.
- Keep dependency surface small — pulling the full component library (~34 MB unpacked) is disproportionate for a graduation project.

## Considered options

1. Install `@ukho/admiralty-core` and use its web components directly.
2. **Extract the primary brand tokens (Navy `#001B5F`, Marine Blue `#0090D4`, Gold `#F2A900`, Red `#E30613`, GDS ink) into local CSS custom properties and use the horizontal blue logo from admiralty.co.uk.**
3. Build a bespoke identity unrelated to Admiralty.

## Decision

Chosen option **"local tokens + brand lockup"**. `frontend/src/styles.css` defines `--admiralty-*` custom properties; `frontend/public/ukho-logo.svg` ships the official horizontal blue mark; the `page-header` uses the navy band and marine blue underline used across admiralty.co.uk. Fonts fall back to Arial (as does admiralty.co.uk) — GDS Transport is not publicly licensable.

## Consequences

- Positive: Zero runtime cost (SVG + a handful of CSS variables); WCAG 2.2-friendly contrast (Navy on white passes AAA; focus ring uses GDS yellow).
- Negative: We do not automatically inherit updates from `@ukho/admiralty-core` — tokens will need periodic refresh.
- Neutral: Interactive components (buttons, inputs) mimic the Admiralty visual language but are custom-built.

## Compliance / Follow-ups

- If the project moves inside UKHO delivery, swap to the published `@ukho/admiralty-core` web components and remove the local tokens.
- Track upstream releases and refresh `--admiralty-*` values annually.

## References

- https://www.admiralty.co.uk (source of the logo asset)
- https://github.com/UKHO/admiralty-design-system
- gov.uk ADR framework — https://www.gov.uk/government/publications/architectural-decision-record-framework
