# benjamintranpugh.com

Personal portfolio of Benjamin Tran-Pugh — mechanical engineering student, University of Waterloo. The audience is **recruiters**: every change must look deliberate, load fast, and read as the work of a careful engineer. This file is the standing brief; follow it exactly, regardless of which model you are.

## Non-negotiables

1. **The design system is locked.** All colors, fonts, and spacing come from `src/styles/tokens.css`. Never hardcode a color, font, or magic number in a component or page. If a new value is truly needed, add a token first.
2. **No generic AI-website tropes.** No gradients, no glassmorphism, no rounded-corner cards, no emoji as icons, no purple, no fake/dead buttons, no marketing taglines. If a button exists, it does something.
3. **Copy voice:** first person, factual, specific. Numbers over adjectives ("60+ m range", not "incredible performance"). No filler like "passionate about innovation". If you can't verify a claim from existing content, ask — never invent achievements, dates, or specs.
4. **Cheap edits stay cheap.** Read only the files the task needs. Content tasks live in ONE `.mdx` file — do not open components or styles for them. Never rewrite a whole file to change one field. If the user's request is a one-word change documented in `EDITING.md`, make the one-word change (and you may point them to the EDITING.md recipe for next time).

## Design system (reference — the source of truth is tokens.css)

- Ground `#131519` charcoal with a faint 44px grid; panels `#1a1d23`; borders `#2a2e36`; text `#e9e8e3` / muted `#9a9da4`.
- **Amber `#f2a33c` is the only accent.** Used sparingly: telemetry lines, hover borders, one highlight per view.
- Type roles: **Anton** = `.display` (big uppercase headlines only), **Archivo** = body, **IBM Plex Mono** = `.mono-label` (nav, tags, captions, telemetry). Fonts are self-hosted woff2 in `public/fonts/` — never add a font CDN.
- Signature elements: live double-pendulum canvas (`Pendulum.astro`), mono telemetry lines on cards, hatched placeholders wherever an image file is missing (never a broken image).
- Layout is dense and left-aligned. Hairline borders (`--line`), not shadows.

## File map — touch only what the task needs

| Task | File(s) |
|---|---|
| Edit project text/images/order/tags | `src/content/projects/<slug>.mdx` only |
| Add a project | copy `src/content/projects/_template.mdx` |
| Add/replace media | drop into `public/images/<slug>/` — the auto-gallery (`Gallery.astro`) shows everything there; `<Figure>`-inlined files are auto-excluded. Videos must be web-sized H.264 mp4 (<100 MB; compress with ffmpeg) |
| Resume content | `src/pages/resume.astro`; PDF = `public/resume.pdf` |
| Hero text / status line | `src/pages/index.astro` |
| Contact info | `src/components/Footer.astro` |
| Colors/fonts/spacing | `src/styles/tokens.css` (values) or `src/styles/global.css` (shared patterns) |
| Card layout | `src/components/ProjectCard.astro` |
| Project page shell | `src/pages/projects/[...slug].astro` |
| Nav | `src/components/Nav.astro` |

Project frontmatter fields (`title, order, featured, summary, telemetry, tags, cover, github`) are validated by `src/content.config.ts`. `order` controls grid position; `<Figure src caption align="left|right|full" />` places images; missing images auto-render as placeholders.

## Verify & deploy

- Before any commit: `npm run build` must pass clean. For visual changes also `npm run dev` and eyeball the affected page (desktop + narrow viewport).
- Push to `main` = automatic deploy via `.github/workflows/deploy.yml` → GitHub Pages → benjamintranpugh.com. Never deploy any other way.
- Commit or push only when Benjamin asks.

## Codebase questions

A Graphify knowledge graph of this repo lives in `graphify-out/` (gitignored): `GRAPH_REPORT.md` + queryable `graph.json`. For "where is X / how does Y connect" questions, prefer `graphify explain "X"` / `graphify path "A" "B"` or the report over scanning the repo. Regenerate after structural changes (not content edits) with `graphify update .` — the code-only mode, no API key needed (plain `graphify .` requires an LLM key for docs/images).
