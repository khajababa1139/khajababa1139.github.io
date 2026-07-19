/**
 * search.js — client-side full-text search.
 *
 * How it works:
 *   1. Hugo emits /searchindex.json at build time (see hugo.toml
 *      [outputFormats.SearchIndex] and layouts/index.searchindex.json).
 *   2. This script fetches that index once, then filters it as you type.
 *
 * No dependencies, no external service. Everything runs in the reader's
 * browser, so it works on GitHub Pages' static hosting.
 *
 * Scoring: a result must contain every query word (in title, tags, summary,
 * or body). Title and tag hits rank above body hits; ties break by date.
 */
(function () {
  "use strict";

  var input = document.getElementById("search-input");
  var status = document.getElementById("search-status");
  var results = document.getElementById("search-results");
  if (!input || !results) return; // not on the search page

  var INDEX_URL = results.dataset.index; // set by the template, respects baseURL
  var index = null;
  var DEBOUNCE_MS = 120;
  var MAX_RESULTS = 50;
  var timer = null;

  // ---- load index -----------------------------------------------------------

  fetch(INDEX_URL)
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(function (data) {
      index = data.map(function (p) {
        return {
          title: p.title,
          url: p.url,
          date: p.date,
          dateLabel: p.dateLabel,
          summary: p.summary,
          tags: p.tags || [],
          haystackTitle: p.title.toLowerCase(),
          haystackTags: (p.tags || []).join(" ").toLowerCase(),
          haystackBody: (p.summary + " " + p.body).toLowerCase()
        };
      });
      status.textContent = index.length + " entries indexed";
      // Support arriving with ?q=... in the URL (e.g. shared links)
      var q = new URLSearchParams(location.search).get("q");
      if (q) {
        input.value = q;
        run(q);
      }
      input.focus();
    })
    .catch(function (err) {
      status.textContent = "Could not load search index (" + err.message + ")";
    });

  // ---- search ---------------------------------------------------------------

  function run(query) {
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);

    if (terms.length === 0) {
      results.innerHTML = "";
      status.textContent = index ? index.length + " entries indexed" : "";
      return;
    }

    var scored = [];
    for (var i = 0; i < index.length; i++) {
      var p = index[i];
      var score = 0;
      var ok = true;

      for (var t = 0; t < terms.length; t++) {
        var term = terms[t];
        if (p.haystackTitle.indexOf(term) !== -1) score += 5;
        else if (p.haystackTags.indexOf(term) !== -1) score += 3;
        else if (p.haystackBody.indexOf(term) !== -1) score += 1;
        else { ok = false; break; }
      }
      if (ok) scored.push({ p: p, score: score });
    }

    scored.sort(function (a, b) {
      return b.score - a.score || (a.p.date < b.p.date ? 1 : -1);
    });

    render(scored.slice(0, MAX_RESULTS), terms);
    status.textContent = scored.length === 0
      ? "No entries match \u201C" + query + "\u201D"
      : scored.length + (scored.length === 1 ? " entry" : " entries");
  }

  function render(items, terms) {
    results.innerHTML = "";
    var frag = document.createDocumentFragment();

    items.forEach(function (item) {
      var p = item.p;
      var a = document.createElement("a");
      a.className = "entry";
      a.href = p.url;

      var stamp = el("span", "entry__stamp", p.dateLabel);

      var body = document.createElement("span");
      var title = el("span", "entry__title", "");
      title.innerHTML = highlight(p.title, terms);
      var sum = el("span", "entry__sum", "");
      sum.innerHTML = highlight(p.summary, terms);
      body.appendChild(title);
      body.appendChild(sum);

      if (p.tags.length) {
        var tags = el("span", "entry__tags", "");
        p.tags.forEach(function (t) { tags.appendChild(el("span", "tag", t)); });
        body.appendChild(tags);
      }

      a.appendChild(stamp);
      a.appendChild(body);
      frag.appendChild(a);
    });

    results.appendChild(frag);
  }

  // ---- helpers --------------------------------------------------------------

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  /** Escape HTML, then wrap query terms in <mark>. */
  function highlight(text, terms) {
    var safe = text.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
    terms.forEach(function (term) {
      var esc = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      safe = safe.replace(new RegExp("(" + esc + ")", "ig"), "<mark>$1</mark>");
    });
    return safe;
  }

  input.addEventListener("input", function () {
    clearTimeout(timer);
    var q = input.value;
    timer = setTimeout(function () {
      run(q);
      // keep the URL shareable without reloading
      var url = q ? "?q=" + encodeURIComponent(q) : location.pathname;
      history.replaceState(null, "", url);
    }, DEBOUNCE_MS);
  });
})();
