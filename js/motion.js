/* ==========================================================================
   Ted Salon — motion layer (GSAP + ScrollTrigger + SplitText)
   Only transform/opacity animations (cheap for the GPU), native scrolling.
   Everything here is enhancement: if the CDN scripts don't load, the page
   still works through main.js.
   ========================================================================== */
(function () {
  "use strict";

  var html = document.documentElement;
  if (!window.gsap || !window.ScrollTrigger) { html.classList.remove("is-loading"); html.classList.add("is-fitted"); return; }

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  var SplitText = window.SplitText;
  gsap.registerPlugin(ScrollTrigger);
  if (SplitText) gsap.registerPlugin(SplitText);

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return gsap.utils.toArray(s, r); };
  var refit = function () { if (window.tedFitAll) window.tedFitAll(); };

  if (reduce) { html.classList.remove("is-loading"); html.classList.add("is-fitted"); return; }
  html.classList.add("has-gsap");
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* Start at the top so the intro plays in order (unless a #section was linked) */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  if (!location.hash) window.scrollTo({ top: 0, behavior: "instant" });

  function split(el, type, opts) {
    if (!SplitText) return null;
    return SplitText.create(el, Object.assign({ type: type, tag: "span" }, opts || {}));
  }

  /* ---------- Intro curtain (first visit only) ---------- */
  var heroTl = null;
  var heroRequested = false;
  function playHero() {
    heroRequested = true;
    if (heroTl) heroTl.play();
  }

  if (html.classList.contains("is-loading")) {
    var bar = $("[data-preloader-bar]");
    var count = $("[data-preloader-count]");
    var counter = { v: 0 };
    gsap.timeline()
      .to(counter, {
        v: 100, duration: 1.1, ease: "power2.inOut",
        onUpdate: function () {
          count.textContent = Math.round(counter.v);
          bar.style.transform = "scaleX(" + counter.v / 100 + ")";
        }
      })
      .to(".preloader__inner", { y: -24, autoAlpha: 0, duration: 0.4, ease: "power2.in" })
      .to(".preloader", { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, "-=0.1")
      .add(playHero, "-=0.5")
      .add(function () {
        html.classList.remove("is-loading");
        try { sessionStorage.setItem("ted-intro", "1"); } catch (e) {}
      });
  } else {
    heroRequested = true;
  }

  /* Anything that splits text waits for the web fonts (max 1.5 s) */
  var fontsReady = document.fonts && document.fonts.ready
    ? Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 1500); })])
    : Promise.resolve();
  fontsReady.then(init);

  function init() {
    /* ---------- Hero intro ---------- */
    var heroChars = [];
    $$("[data-hero-title] .hero__word > span").forEach(function (span) {
      var s = split(span, "chars", { charsClass: "char" });
      if (s) heroChars = heroChars.concat(s.chars);
    });
    refit();

    heroTl = gsap.timeline({ paused: true });
    heroTl
      .from(heroChars.length ? heroChars : "[data-hero-title] .hero__word > span", { yPercent: 115, duration: 1.2, ease: "expo.out", stagger: 0.05 })
      .from("[data-hero-title] .o-ring", { scale: 0, rotate: -180, duration: 1.3, ease: "expo.out" }, 0.25)
      .from("[data-hero-intro]", { y: 30, autoAlpha: 0, duration: 1, ease: "power3.out", stagger: 0.12 }, 0.3)
      .from(".site-header__inner > *", { y: -20, autoAlpha: 0, duration: 0.8, ease: "power3.out", stagger: 0.06 }, 0.2)
      .add(function () { if (window.tedPlayVisible) window.tedPlayVisible(); });
    html.classList.add("is-fitted");
    if (heroRequested) heroTl.play();

    /* ---------- Scroll progress ---------- */
    gsap.to("[data-progress]", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } });

    /* ---------- Hero photo drifts slightly slower than the page ---------- */
    gsap.to("[data-hero-media]", {
      yPercent: 12, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });

    /* ---------- Headings: letters rise out of a mask ---------- */
    $$("[data-split]").forEach(function (el) {
      var s = split(el, "words,chars", { mask: "chars" });
      if (!s) return;
      gsap.from(s.chars, {
        yPercent: 110, duration: 1, ease: "expo.out", stagger: 0.03,
        scrollTrigger: { trigger: el, start: "top 88%", once: true }
      });
    });

    /* ---------- Statements: words fill in as you read ---------- */
    $$("[data-word-fill]").forEach(function (el) {
      var s = split(el, "words", { wordsClass: "word" });
      if (!s) return;
      gsap.to(s.words, {
        opacity: 1, ease: "none", stagger: 0.1,
        scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 50%", scrub: true }
      });
    });

    /* ---------- Gentle parallax on photos ---------- */
    $$("[data-parallax]").forEach(function (img) {
      var amount = parseFloat(img.dataset.parallax) || -8;
      gsap.fromTo(img, { yPercent: 0 }, {
        yPercent: amount, ease: "none",
        scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true }
      });
    });
    $$("[data-float]").forEach(function (el) {
      var d = parseFloat(el.dataset.float) || 14;
      gsap.fromTo(el, { yPercent: d }, { yPercent: -d, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    });
    $$("[data-rotate]").forEach(function (el) {
      gsap.to(el, { rotate: 360, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    });

    /* ---------- Count-up numbers ---------- */
    $$("[data-count]").forEach(function (el) {
      var end = parseFloat(el.dataset.count);
      var dec = parseInt(el.dataset.decimals || "0", 10);
      var o = { v: 0 };
      el.textContent = (0).toFixed(dec);
      gsap.to(o, {
        v: end, duration: 2, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 92%", once: true },
        onUpdate: function () { el.textContent = o.v.toFixed(dec); }
      });
    });

    gsap.from(".service-card--type .service-card__glyph", {
      scale: 0.4, autoAlpha: 0, rotate: -20, duration: 1.1, ease: "back.out(1.7)",
      scrollTrigger: { trigger: ".service-card--type", start: "top 85%", once: true }
    });

    /* ---------- Reels: horizontal scroll while the section is pinned ---------- */
    var mm = gsap.matchMedia();
    mm.add("(min-width: 981px)", function () {
      var section = $("[data-reels]");
      var track = $("[data-reels-track]");
      var bar = $("[data-reels-progress]");
      if (!section || !track) return;
      var viewport = track.parentElement;
      var distance = function () { return Math.max(0, track.scrollWidth - viewport.clientWidth); };

      gsap.to(track, {
        x: function () { return -distance(); },
        ease: "none",
        scrollTrigger: {
          trigger: section, start: "top top", end: function () { return "+=" + distance(); },
          pin: true, scrub: 0.6, invalidateOnRefresh: true,
          onUpdate: function (self) { if (bar) bar.style.transform = "scaleX(" + self.progress + ")"; }
        }
      });
      gsap.from(".reel", {
        y: 80, autoAlpha: 0, duration: 1, ease: "expo.out", stagger: 0.07,
        scrollTrigger: { trigger: section, start: "top 70%", once: true }
      });
    });
    mm.add("(max-width: 980px)", function () {
      gsap.from(".reel", {
        y: 50, autoAlpha: 0, duration: 0.9, ease: "expo.out", stagger: 0.07,
        scrollTrigger: { trigger: "[data-reels]", start: "top 75%", once: true }
      });
    });

    /* ---------- Training video grows into place ---------- */
    $$("[data-expand]").forEach(function (el) {
      gsap.fromTo(el, { scale: 0.85 }, {
        scale: 1, ease: "none",
        scrollTrigger: { trigger: el, start: "top 95%", end: "top 45%", scrub: true }
      });
    });

    /* ---------- Big outlined line slides with scroll ---------- */
    var bigline = $("[data-bigline]");
    if (bigline) {
      gsap.fromTo(bigline, { xPercent: 0 }, {
        xPercent: -38, ease: "none",
        scrollTrigger: { trigger: ".bigline", start: "top bottom", end: "bottom top", scrub: true }
      });
    }

    /* ---------- Menu: items cascade in when a tab changes ---------- */
    document.addEventListener("ted:tab", function (e) {
      var panel = e.detail;
      if (!panel) return;
      gsap.fromTo(panel.querySelectorAll(".menu__panel-head, .menu-item"),
        { y: 16, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out", stagger: 0.03, overwrite: true });
    });

    /* ---------- Footer wordmark ---------- */
    var footerWord = $("[data-footer-word] .hero__word > span");
    if (footerWord) {
      var fs = split(footerWord, "chars", { charsClass: "char" });
      refit();
      if (fs) {
        gsap.from(fs.chars, {
          yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.05,
          scrollTrigger: { trigger: "[data-footer-word]", start: "top 95%", once: true }
        });
      }
    }

    /* ---------- Pointer-only niceties ---------- */
    if (finePointer) {
      $$("[data-magnetic]").forEach(function (el) {
        var xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "elastic.out(1, 0.45)" });
        var yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "elastic.out(1, 0.45)" });
        el.addEventListener("mousemove", function (e) {
          var r = el.getBoundingClientRect();
          xTo((e.clientX - r.left - r.width / 2) * 0.25);
          yTo((e.clientY - r.top - r.height / 2) * 0.35);
        });
        el.addEventListener("mouseleave", function () { xTo(0); yTo(0); });
      });

      $$("[data-tilt]").forEach(function (card) {
        var rx = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power3" });
        var ry = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power3" });
        gsap.set(card, { transformPerspective: 900 });
        card.addEventListener("mousemove", function (e) {
          var r = card.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width;
          var py = (e.clientY - r.top) / r.height;
          ry((px - 0.5) * 8);
          rx((0.5 - py) * 6);
          card.style.setProperty("--mx", px * 100 + "%");
          card.style.setProperty("--my", py * 100 + "%");
        });
        card.addEventListener("mouseleave", function () { rx(0); ry(0); });
      });

      var cursor = $("[data-cursor]");
      if (cursor) {
        html.classList.add("has-cursor");
        var dot = $(".cursor__dot", cursor);
        var ring = $(".cursor__ring", cursor);
        var label = $("[data-cursor-label]", cursor);
        var dX = gsap.quickTo(dot, "x", { duration: 0.05 }), dY = gsap.quickTo(dot, "y", { duration: 0.05 });
        var rX = gsap.quickTo(ring, "x", { duration: 0.2, ease: "power3" }), rY = gsap.quickTo(ring, "y", { duration: 0.2, ease: "power3" });
        window.addEventListener("mousemove", function (e) {
          dX(e.clientX); dY(e.clientY); rX(e.clientX); rY(e.clientY);
          cursor.classList.remove("is-hidden");
        }, { passive: true });
        document.addEventListener("mouseover", function (e) {
          var withText = e.target.closest("[data-cursor-text]");
          var link = withText ? null : e.target.closest("a, button, select, input, textarea, label");
          cursor.classList.toggle("is-label", !!withText);
          cursor.classList.toggle("is-link", !!link);
          if (withText) label.textContent = withText.dataset.cursorText;
        });
        html.addEventListener("mouseleave", function () { cursor.classList.add("is-hidden"); });
      }
    }

    /* ---------- Measure once everything is in place ---------- */
    refit();
    ScrollTrigger.refresh();
    window.addEventListener("load", function () { ScrollTrigger.refresh(); }, { once: true });
  }
})();
