(function () {
  "use strict";

  var doc = document;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- год в футере ---------- */
  var year = doc.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- шапка и прогресс скролла ---------- */
  var header = doc.getElementById("site-header");
  var bar = doc.getElementById("progress-bar");

  function onScroll() {
    var y = window.scrollY || doc.documentElement.scrollTop;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (bar) {
      var max = doc.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? Math.min(100, (y / max) * 100) : 0;
      bar.style.width = pct.toFixed(2) + "%";
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- появление блоков ---------- */
  var revealables = Array.prototype.slice.call(doc.querySelectorAll("[data-reveal]"));

  if (!reduceMotion && "IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    revealables.forEach(function (el) {
      var siblings = el.parentElement
        ? Array.prototype.filter.call(el.parentElement.children, function (n) {
            return n.hasAttribute("data-reveal");
          })
        : [];
      var index = Math.max(0, siblings.indexOf(el));
      el.style.setProperty("--reveal-delay", Math.min(index, 5) * 70 + "ms");
      revealObserver.observe(el);
    });
  } else {
    revealables.forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  /* ---------- подсветка карточек под курсором ---------- */
  if (window.matchMedia("(hover: hover)").matches && !reduceMotion) {
    doc.querySelectorAll(".project-card").forEach(function (card) {
      card.addEventListener("pointermove", function (event) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", event.clientX - rect.left + "px");
        card.style.setProperty("--my", event.clientY - rect.top + "px");
      });
    });
  }

  /* ---------- мобильное меню ---------- */
  var toggle = doc.getElementById("nav-toggle");
  var nav = doc.querySelector(".nav");

  function setMenu(open) {
    if (!toggle || !nav) return;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setMenu(false);
    });

    doc.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setMenu(false);
    });

    doc.addEventListener("click", function (event) {
      if (!nav.contains(event.target) && !toggle.contains(event.target)) setMenu(false);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 860) setMenu(false);
    });
  }

  /* ---------- активный пункт меню ---------- */
  var sections = Array.prototype.slice.call(doc.querySelectorAll("main section[id]"));
  var navLinks = Array.prototype.slice.call(doc.querySelectorAll(".nav__list a"));

  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    var map = {};
    navLinks.forEach(function (link) {
      map[link.getAttribute("href").slice(1)] = link;
    });

    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var link = map[entry.target.id];
          if (!link) return;
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) { l.classList.remove("is-active"); });
            link.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach(function (section) { spy.observe(section); });
  }
})();
