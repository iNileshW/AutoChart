# Architectural Decision Records

We follow the [gov.uk Architectural Decision Record framework](https://www.gov.uk/government/publications/architectural-decision-record-framework) — an evolution of Michael Nygard's ADR template. Each significant, ideally irreversible design choice gets a short, dated, immutable Markdown file here.

## Index

| ID | Title | Status |
|----|-------|--------|
| [0001](0001-single-fastapi-serves-spa-rest-mcp.md) | One FastAPI process serves the SPA, REST API, and MCP endpoint | Accepted |
| [0002](0002-admiralty-design-tokens-and-logo.md) | Adopt Admiralty brand tokens and UKHO logo for the SPA | Accepted |

## Adding a new ADR

1. Copy `0000-adr-template.md` to `NNNN-slug.md` where `NNNN` is the next number.
2. Fill in Status, Date, Deciders, Context, Options, Decision, Consequences.
3. Reference the gov.uk framework and any upstream policies that constrain the choice.
4. Update the index above in the same PR.

ADRs are immutable once accepted — supersede them with a new ADR that references the previous one.
