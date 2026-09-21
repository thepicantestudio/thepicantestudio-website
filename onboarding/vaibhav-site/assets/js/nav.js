(function () {
  "use strict";
  /* a link to #adults etc. opens that accordion */
  function openTarget() {
    var el = location.hash && document.getElementById(location.hash.slice(1));
    if (el && el.tagName === "DETAILS") { el.open = true; el.scrollIntoView(); }
  }
  window.addEventListener("hashchange", openTarget);
  window.addEventListener("load", openTarget);

  var btn = document.querySelector(".menu-btn"), nav = document.getElementById("site-nav");
  if (!btn || !nav) return;
  function set(open) {
    btn.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("open", open);
    document.body.classList.toggle("menu-open", open);
  }
  btn.addEventListener("click", function () { set(btn.getAttribute("aria-expanded") !== "true"); });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) set(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { set(false); } });
  window.addEventListener("resize", function () { if (window.innerWidth > 960) set(false); });
})();
