# Field Notes — a Hugo log site for GitHub Pages

A static blog for daily project entries. Posts are folders, images sit next to
the text, videos come from YouTube, comments come from GitHub Discussions.
No database, no server, no monthly bill.

---

## 1. First-time setup (about 15 minutes)

### Install Hugo

You need the **extended** build, 0.128 or newer.

```bash
# macOS
brew install hugo

# Windows
winget install Hugo.Hugo.Extended

# Linux — grab the latest .deb from github.com/gohugoio/hugo/releases
sudo dpkg -i hugo_extended_0.148.2_linux-amd64.deb
```

Check it: `hugo version` must print `+extended`.

### Create the repo

Two options for the URL:

| Repo name | Site lives at | `baseURL` in `hugo.toml` |
|---|---|---|
| `YOURNAME.github.io` | `https://YOURNAME.github.io/` | `https://YOURNAME.github.io/` |
| anything else, e.g. `notes` | `https://YOURNAME.github.io/notes/` | `https://YOURNAME.github.io/notes/` |

The first is cleaner. Make the repo **public** — comments need that, and Pages
on free accounts needs it too.

```bash
cd <this-folder>
git init
git branch -M main
git remote add origin https://github.com/khajababa1139/khajababa1139.github.io.git
```

### Edit five things in `hugo.toml`

`baseURL`, `title`, `params.author`, `params.tagline`, `params.intro`.
Then `content/about.md`.

### Turn on Pages

Push first:

```bash
git add -A && git commit -m "initial site" && git push -u origin main
```

Then in the repo: **Settings → Pages → Build and deployment → Source →
GitHub Actions**. Push again (or **Actions → Deploy site → Run workflow**) and
your site is live in about a minute.

### Turn on comments

1. Repo **Settings → General → Features → Discussions** ✅
2. **Discussions → Categories → New category**, name it `Comments`, format
   **Announcement** (only you can start threads — the site creates them).
3. Install the giscus app: <https://github.com/apps/giscus> — grant it access
   to this one repo.
4. Go to <https://giscus.app>, enter your repo, pick **Discussion title contains
   page pathname** and the `Comments` category. It prints a `<script>` block.
5. Copy `data-repo-id` and `data-category-id` out of it into `hugo.toml`, and
   set `enable = true`:

```toml
[params.giscus]
  enable     = true
  repo       = "khajababa1139/khajababa1139.github.io"
  repoId     = "R_kgDO..."
  category   = "Comments"
  categoryId = "DIC_kwDO..."
```

Readers need a GitHub account to comment. For a projects-and-findings blog
that's the right audience, and it means zero spam and zero moderation tooling
to run. You moderate from the Discussions tab.

---

## 2. The daily workflow

```bash
./new.sh reading-serial-data-from-an-esp32
```

Creates `content/posts/reading-serial-data-from-an-esp32/index.md`.

1. Drag images straight into that folder.
2. Write. Fill in `summary` and `tags`.
3. Set `draft = false`.
4. `hugo server -D` → <http://localhost:1313> to preview (live-reloads as you type).
5. `./publish.sh "esp32 serial notes"`

That's it. The Action builds and deploys.

---

## 3. Front matter

```toml
+++
title    = "Reading serial data from an ESP32"
date     = 2026-07-19T09:00:00+06:00
draft    = false
summary  = "One or two lines. This is what shows in the log — write it yourself."
tags     = ["esp32", "python"]
video    = "dQw4w9WgXcQ"   # YouTube ID only. Adds a preview + a Video flag
featured = true             # pins to the landing-page showcase
toc      = true             # contents box, for long entries
comments = false            # turn off the thread for this one entry
+++
```

`featured` controls the horizontal showcase on the landing page. If fewer than
three posts are featured, it falls back to the six most recent.

---

## 4. Images

Put them in the post folder. Reference by filename:

```
{{< img src="scope-trace.png" alt="Oscilloscope trace showing the glitch"
        caption="The dropout at 12 ms." >}}
```

Hugo resizes, converts to WebP, writes `width`/`height` so the page doesn't
jump, and lazy-loads it. You do nothing.

**Special filenames:**

- `cover.jpg` — showcase card thumbnail + social preview image
- `gallery-01.jpg`, `gallery-02.jpg`, … — pulled into a grid by `{{< gallery >}}`

Plain markdown `![alt](scope-trace.png)` works too, it just skips the resizing.

---

## 5. Video

Front matter `video = "ID"` puts it at the top of the entry. Mid-post:

```
{{< yt id="aqz-KE-bpKQ" title="Bench test, run 3" >}}
```

Both render a thumbnail only. YouTube's player loads on click, so an entry with
five videos loads as fast as one with none.

---

## 6. Callouts

```
{{< note label="Gotcha" >}}
The datasheet is wrong about pin 14.
{{< /note >}}
```

---

## 7. Custom domain

Add `static/CNAME` containing one line, e.g. `notes.example.com`. Point a CNAME
DNS record at `YOURNAME.github.io`. Update `baseURL`.

---

## 8. What's where — the editing map

Each concern lives in exactly one file. Find the row, edit that file only.

| I want to change… | Edit |
|---|---|
| Site title, tagline, intro, links, menus | `hugo.toml` |
| Add / edit a project | `content/projects/<slug>/index.md` (or `./new-project.sh <slug>`) |
| My About page | `content/about.md` |
| Colors, fonts, spacing (whole site) | `assets/css/10-tokens-base.css` |
| Header / nav appearance | `assets/css/20-header.css` |
| Landing page appearance | `assets/css/30-home.css` + `layouts/index.html` |
| The log list appearance | `assets/css/40-log.css` + `layouts/partials/entry.html` |
| Project card appearance | `assets/css/50-showcase.css` + `layouts/partials/project-card.html` |
| Projects list + single page | `layouts/projects/list.html` + `layouts/projects/single.html` |
| Post page appearance | `assets/css/60-article.css` + `layouts/_default/single.html` |
| Search behavior | `assets/js/search.js` |
| Search appearance | `assets/css/80-search.css` + `layouts/_default/search.html` |
| What search indexes | `layouts/index.searchindex.json` |
| Video click-to-load behavior | `assets/js/youtube.js` |
| New-post template | `archetypes/posts.md` |
| New-project template | `archetypes/projects.md` |
| Deploy pipeline | `.github/workflows/deploy.yml` |

```
hugo.toml                    identity, features, menus — the control panel
content/
  about.md
  search/_index.md           search page stub (layout does the work)
  posts/<slug>/index.md      one folder per log entry, images alongside
  projects/<slug>/index.md   one folder per project, images alongside
assets/
  css/10..80-*.css           styling, split by concern, bundled in order
  js/search.js               client-side search
  js/youtube.js              lazy YouTube embeds
layouts/
  index.html                 landing page
  index.searchindex.json     build-time search index (posts + projects)
  _default/                  single, list, terms, search, baseof, 404
  projects/                  list + single templates for the Projects section
  partials/                  head, header, footer, scripts, entry,
                             project-card, card, youtube, comments
  shortcodes/                img, gallery, yt, note
.github/workflows/deploy.yml
new.sh / new-project.sh / publish.sh
```

## 9. Search

`/search/` works with zero services: Hugo writes `searchindex.json` at build
time and `assets/js/search.js` filters it in the reader's browser. Every new
post is searchable automatically after the next push. Queries land in the URL
(`/search/?q=ros`) so results are shareable.
