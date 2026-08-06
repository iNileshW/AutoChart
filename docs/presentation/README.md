# AutoChart — presentation

A [Reveal.js](https://revealjs.com/) deck summarising the graduation project:
what was built, how the pieces fit together, and why it matters to UKHO customers.

## Run locally

```bash
# From the repo root — any static server will do:
python -m http.server 8081 --directory docs/presentation
```

Then open http://localhost:8081/.

## Behind the lab reverse proxy

The deck references CDN-hosted `reveal.js`, `highlight.js`, and `mermaid` bundles.
No build step required — just serve the folder.

## Slides

1. Cover
2. Problem statement
3. Architecture (Mermaid)
4. Backend surfaces — REST + MCP tool catalogue
5. Frontend views — Home + Agent Chatbot
6. Chat → map sequence (Mermaid)
7. Admiralty design system + WCAG 2.2
8. Observability baseline + Web Vitals KPIs
9. Grafana dashboard
10. DevOps — tests, coverage, container
11. Architectural Decision Records
12. Beacon message
13. Concrete benefits
14. Roadmap
15. Thanks

Speaker notes: press `S` in Reveal.js to open the notes window.
