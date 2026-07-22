# Editing cheatsheet: zero AI tokens required

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
| `github:` | source link button on the project page |
| `writeup:` | link to a writeup you wrote. Shows as the amber primary button, ahead of the source link |

## Add an image or video to a project

**Just drop the file into `public/images/<project-name>/`. That's it.**
Everything in that folder automatically appears in the MEDIA grid at the bottom
of the project page (label comes from the filename, so name files like
`exploded-view.png`). Supported: jpg/png/webp/gif + mp4/webm.

To place a file **inline in the text** instead, add one line in the `.mdx`:
```
<Figure src="<project-name>/photo.jpg" align="right" caption="CAPTION" />
```
Files placed inline are automatically left out of the bottom grid.

Videos: keep them small (compress to ~1280px H.264 mp4). GitHub rejects files
over 100 MB. Ask Claude to compress if unsure, ffmpeg is installed.

`<Figure>` also takes videos. Add `autoplay` for a silent looping clip with no
controls (use it once per page at most):
```
<Figure src="<project-name>/clip.mp4" autoplay caption="CAPTION" />
```

## Show a headline result, a before/after, or a live sim

Three extra blocks are available in any `.mdx`. See
`src/content/projects/active-suspension.mdx` for all three in use.

**Big result numbers** (once per page, at the top; numbers must come from a
real measurement or simulation):
```
<Stats items={[
  { value: "-57.1%", label: "RMS ACCEL / RESONANCE" },
  { value: "663 N",  label: "PEAK ACTUATOR FORCE" }
]} note="OPTIONAL SMALL PRINT UNDER THE ROW" />
```

**Side-by-side comparison.** Put exactly two `<Figure>` inside:
```
<Compare>
  <Figure src="<project>/before.png" caption="PASSIVE" />
  <Figure src="<project>/after.png"  caption="ACTIVE" />
</Compare>
```

**Embedded interactive page.** Drop a self-contained `.html` into
`public/sims/`, then:
```
<Sim src="/sims/your-file.html" title="LABEL SHOWN ABOVE THE FRAME" />
```
Add `height="1200px"` if the embedded page gets its own scrollbar.

## Write an equation

Use LaTeX directly in any `.mdx`. `$...$` for inline, `$$...$$` on its own lines
for a display block. MathJax renders it to an image at build time, so there is
nothing to install and no font to load:

```
The ride rate is $RR = k_1k_2/(k_1+k_2)$, so:

$$
c_c = 2\sqrt{\frac{k_1k_2}{k_1+k_2}\,m_2} = 5655\ \mathrm{N\,s/m}
$$
```

> Two gotchas. **Never type an em dash or a middot anywhere** (see CLAUDE.md).
> Use ` / ` between fields and a plain space in units. And the fonts in
> `public/fonts/` are subset to ~229 glyphs, so pasted symbols like `√`, `Σ`, `ω`
> or subscripts fall back to a mismatched system font in normal text. Inside
> `$...$` you are safe, because LaTeX commands (`\sqrt`, `\Sigma`, `\omega`,
> `x_1`) are plain ASCII and render as artwork.

## Add a whole new project

1. Copy `src/content/projects/_template.mdx` → `src/content/projects/my-project.mdx` (filename = URL).
2. Fill in the frontmatter and body (instructions are inside the template).
3. Drop images/videos into `public/images/my-project/`, they show up in the MEDIA grid automatically.
4. Commit & push.

## Update the resume

Replace `public/resume.pdf` with your new file, commit, and push. That is the
whole job. The resume page shows a live image preview of the PDF, and the
download button serves it. The preview image is rendered from the PDF
automatically on every build, so there is nothing to convert by hand and no
text to keep in sync. Multi-page PDFs show every page stacked.

## Embed a YouTube video

One line anywhere in a project `.mdx` (the id is the part after `youtu.be/`):
```
<YouTube id="uuaAOCRsIaw" caption="CAPTION" />
```

## Change the hero status line

`src/pages/index.astro` → the `STATUS :` line. Also `FOCUS`/`TOOLS` lines right there.

## Change contact info

`src/components/Footer.astro`: email, phone, links are plain text.

## When to ask Claude instead

- Anything touching layout/CSS across pages
- New page types or components
- "Make it look better" judgment calls
- Debugging a failed build or deploy

When you do, name the file from this sheet ("in robot-arm-2.mdx, ..."). It keeps the session short and cheap.
