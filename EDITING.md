# Editing cheatsheet — zero AI tokens required

Almost every routine change is a one-line edit you can do yourself in VS Code.
After any change: **save → `npm run build` (optional check) → commit & push → site updates itself in ~1 minute.**

```
git add -A
git commit -m "describe the change"
git push
```

---

## Move an image left / right / full width

In the project's file (`src/content/projects/<name>.mdx`), find the `<Figure>` and change one word:

```
<Figure src="air-cannon/build.jpg" align="right" caption="PRESSURE CHAMBER" />
                                          ↑ change to "left" or "full"
```

## Reorder projects on the home page

Each project file has `order: N` in its frontmatter. Lower = earlier. Swap the numbers.

## Change a project's card

All card content is frontmatter in that project's `.mdx` file:

| Field | Controls |
|---|---|
| `summary:` | the sentence on the card |
| `telemetry:` | the amber mono spec line |
| `tags: [...]` | tag list on card + project page |
| `cover:` | card image (path under `public/images/`) |
| `featured:` | true/false |

## Add an image or video to a project

**Just drop the file into `public/images/<project-name>/` — that's it.**
Everything in that folder automatically appears in the MEDIA grid at the bottom
of the project page (label comes from the filename, so name files like
`exploded-view.png`). Supported: jpg/png/webp/gif + mp4/webm.

To place a file **inline in the text** instead, add one line in the `.mdx`:
```
<Figure src="<project-name>/photo.jpg" align="right" caption="CAPTION" />
```
Files placed inline are automatically left out of the bottom grid.

Videos: keep them small (compress to ~1280px H.264 mp4). GitHub rejects files
over 100 MB. Ask Claude to compress if unsure — ffmpeg is installed.

## Add a whole new project

1. Copy `src/content/projects/_template.mdx` → `src/content/projects/my-project.mdx` (filename = URL).
2. Fill in the frontmatter and body (instructions are inside the template).
3. Drop images/videos into `public/images/my-project/` — they show up in the MEDIA grid automatically.
4. Commit & push.

## Update the resume

- **PDF:** replace `public/resume.pdf` (first time: just add the file — the download button activates automatically).
- **On-page content:** edit `src/pages/resume.astro` — education/skills are plain text near the top; the EXPERIENCE section has a placeholder block with instructions in a comment.

## Change the hero status line

`src/pages/index.astro` → the `STATUS :` line. Also `FOCUS`/`TOOLS` lines right there.

## Change contact info

`src/components/Footer.astro` — email, phone, links are plain text.

## When to ask Claude instead

- Anything touching layout/CSS across pages
- New page types or components
- "Make it look better" judgment calls
- Debugging a failed build or deploy

When you do, name the file from this sheet ("in robot-arm-2.mdx, ...") — it keeps the session short and cheap.
