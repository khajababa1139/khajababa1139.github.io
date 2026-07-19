/**
 * youtube.js — click-to-load YouTube embeds.
 *
 * Post templates render a thumbnail <button data-yt="VIDEO_ID"> instead of
 * an iframe, so nothing loads from YouTube until the reader clicks. This
 * script swaps the button for the real player on click.
 */
(function () {
  "use strict";
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-yt]");
    if (!el) return;
    var iframe = document.createElement("iframe");
    iframe.src = "https://www.youtube-nocookie.com/embed/" + el.dataset.yt + "?autoplay=1&rel=0";
    iframe.title = el.getAttribute("aria-label") || "YouTube video";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture";
    iframe.allowFullscreen = true;
    el.innerHTML = "";
    el.appendChild(iframe);
    el.style.cursor = "default";
  });
})();
