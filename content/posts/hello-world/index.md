+++
title = "How this site works"
date = 2026-07-19T09:00:00+06:00
draft = false
summary = "The posting workflow, the shortcodes, and where images go. Read this one first, then delete it."
tags = ["meta", "hugo"]
featured = true
toc = true
+++

This entry exists to show you every tool the site gives you. Delete it once
you've read it.

## Where a post lives

Every entry is a folder, not a file:

```
content/posts/how-this-site-works/
├── index.md          ← the writing
├── cover.jpg         ← optional; used on the showcase card and social previews
├── setup.png         ← any image, referenced by filename
└── gallery-01.jpg    ← images named gallery-* land in the {{</* gallery */>}} grid
```

Keeping images beside the text is the whole trick. You never think about paths,
never break a link when you rename something, and deleting a post deletes its
images with it.

## Making a new one

```bash
./new.sh reading-serial-data-from-an-esp32
```

That creates the folder, the `index.md` with today's date, and opens nothing —
you take it from there. Drag images into the folder. When you're ready, set
`draft = false` and push.

## Front matter

| Field | What it does |
|---|---|
| `title` | Heading and page title |
| `date` | Sorts the log; shown as the stamp in the left gutter |
| `draft` | `true` keeps it off the built site |
| `summary` | The line under the title in the log. Write it — auto-truncation reads badly |
| `tags` | Builds the topic index |
| `video` | A YouTube ID. Puts a preview at the top and a **Video** flag in the log |
| `featured` | Pins the entry to the landing-page showcase |
| `toc` | Adds a contents box for long entries |

## Images

{{</* img src="setup.png" alt="A breadboard with an ESP32 wired to a sensor" caption="Resized, converted to WebP, and made responsive at build time." */>}}

Point it at a filename in the post folder. Hugo generates a WebP at two widths
and writes the `width`/`height` so the page doesn't jump while loading. You do
nothing.

For a batch, name the files `gallery-01.jpg`, `gallery-02.jpg`, and so on:

{{</* gallery */>}}

## Video

Set `video = "VIDEO_ID"` in the front matter for the headline video, or drop one
mid-entry:

{{</* yt id="aqz-KE-bpKQ" title="Big Buck Bunny" */>}}

Nothing loads from YouTube until someone clicks the thumbnail, so a page with
three videos still loads like a page with none.

## Callouts

{{</* note label="Watch out" */>}}
Use these sparingly. One per entry, at most — a page of boxes is a page with no
emphasis at all.
{{</* /note */>}}

## Comments

Every entry has a comment thread at the bottom, backed by GitHub Discussions.
Replies, threading, reactions, markdown, and moderation all come free, and the
data sits in your own repo. Readers need a GitHub account to post. Set
`comments = false` in front matter to turn it off for one entry.
