# benjamintranpugh.com

Personal portfolio: Astro static site, deployed to GitHub Pages on every push to `main`.

- **Edit content without AI:** see [EDITING.md](EDITING.md), most changes are one line.
- **Working with Claude/Opus:** the standing brief is [CLAUDE.md](CLAUDE.md) (read automatically).
- **Local preview:** `npm install`, then `npm run dev` → http://localhost:4321

## Layout

```
src/content/projects/   ← one .mdx file per project (the thing you'll edit most)
public/images/<slug>/   ← project photos (missing ones show placeholders, not broken images)
public/resume.pdf       ← drop your resume here to activate the download button
src/styles/tokens.css   ← every color/font/spacing value on the site
```
