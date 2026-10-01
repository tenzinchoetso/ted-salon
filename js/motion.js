/* ==========================================================================
   Ted Salon — motion layer (GSAP + ScrollTrigger + SplitText + Lenis)
   Everything here is enhancement: if the CDN scripts don't load, the page
   still works through main.js.
   ========================================================================== */
(function () {
  "use strict";

  var html = document.documentElement;
  if (!window.gsap || !window.ScrollTrigger) { html.classList.remove("is-loading"); return; }

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

  if (reduce) { html.classList.remove("is-loading"); return; }
  html.classList.add("has-gsap");

  /* Start at the top so the intro plays in order (unless a #section was linked) */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  if (!location.hash) window.scrollTo(0, 0);

  /* ---------- Smooth scrolling ---------- */
  var lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    if (html.classList.contains("is-loading")) lenis.stop();

    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a || e.defaultPrevented) return;
      var id = a.getAttribute("href");
      if (id === "#" || id === "#main") return;
      var target = id === "#top" ? 0 : $(id);
      if (target === null) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: id === "#top" ? 0 : -10, duration: 1.5 });
    });
  }

  /* ---------- Split helpers ---------- */
  function split(el, type, opts) {
    if (!SplitText) return null;
    return SplitText.create(el, Object.assign({ type: type, tag: "span" }, opts || {}));
  }

  /* ---------- Intro curtain (starts right away) ---------- */
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
        v: 100, duration: 1.7, ease: "power2.inOut",
        onUpdate: function () {
          count.textContent = Math.round(counter.v);
          bar.style.transform = "scaleX(" + counter.v / 100 + ")";
        }
      })
      .to(".preloader__inner", { y: -30, autoAlpha: 0, duration: 0.5, ease: "power2.in" }, "+=0.1")
      .to(".preloader", { clipPath: "inset(0 0 100% 0)", duration: 1.1, ease: "expo.inOut" }, "-=0.15")
      .add(playHero, "-=0.55")
      .add(function () {
        html.classList.remove("is-loading");
        try { sessionStorage.setItem("ted-intro", "1"); } catch (e) {}
        if (lenis) lenis.start();
        ScrollTrigger.refresh();
      });
  } else {
    heroRequested = true;
  }

  /* Everything that splits text waits for the web fonts (max 1.5 s) */
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
    .from(heroChars.length ? heroChars : "[data-hero-title] .hero__word > span", { yPercent: 115, duration: 1.3, ease: "expo.out", stagger: 0.05 })
    .from("[data-hero-title] .o-ring", { scale: 0, rotate: -200, duration: 1.4, ease: "expo.out" }, 0.25)
    .from("[data-hero-intro]", { y: 34, autoAlpha: 0, duration: 1.1, ease: "power3.out", stagger: 0.12 }, 0.3)
    .from(".site-header__inner > *", { y: -24, autoAlpha: 0, duration: 0.9, ease: "power3.out", stagger: 0.07 }, 0.2)
    .add(function () { if (window.tedPlayVisible) window.tedPlayVisible(); });
  if (heroRequested) heroTl.play();

  /* ---------- Scroll progress ---------- */
  gsap.to("[data-progress]", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });

  /* ---------- Hero parallax on scroll ---------- */
  gsap.to("[data-hero-media]", {
    yPercent: 18, scale: 1.06, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });
  gsap.to("[data-hero-content]", {
    yPercent: -14, autoAlpha: 0.15, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "40% top", end: "bottom top", scrub: true }
  });

  /* Gold "O" rings turn as you scroll */
  // (a full turn ends face-on, so they always rest looking like an "O")
  $$("[data-spin]").forEach(function (ring) {
    var inHero = !!ring.closest(".hero");
    gsap.fromTo(ring, { rotateY: 0 }, {
      rotateY: 360, ease: "none",
      scrollTrigger: inHero
        ? { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 }
        : { trigger: ring, start: "top bottom", end: "bottom bottom", scrub: 1 }
    });
  });

  /* ---------- Marquee reacts to scroll speed and direction ---------- */
  var marquee = $("[data-marquee]");
  if (marquee) {
    var mx = 0, dir = 1, boost = 0;
    ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate: function (self) {
        dir = self.direction;
        boost = Math.min(Math.abs(self.getVelocity()) / 250, 14);
      }
    });
    gsap.ticker.add(function () {
      var half = marquee.scrollWidth / 2;
      if (!half) return;
      mx -= dir * (0.55 + boost);
      boost *= 0.93;
      if (mx <= -half) mx += half;
      if (mx > 0) mx -= half;
      gsap.set(marquee, { x: mx });
    });
  }

  /* ---------- Headings: letters rise out of a mask ---------- */
  $$("[data-split]").forEach(function (el) {
    var s = split(el, "words,chars", { mask: "chars" });
    if (!s) return;
    gsap.from(s.chars, {
      yPercent: 115, duration: 1.1, ease: "expo.out", stagger: 0.035,
      scrollTrigger: { trigger: el, start: "top 88%" }
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

  /* ---------- Images: curtain reveal + inner zoom ---------- */
  $$("[data-clip-reveal]").forEach(function (el) {
    var inner = el.querySelector("img, iframe, .video");
    var tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 88%" } });
    tl.fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut" });
    if (inner && inner.tagName === "IMG") tl.from(inner, { scale: 1.35, duration: 1.8, ease: "expo.out" }, 0.1);
  });

  $$("[data-parallax]").forEach(function (img) {
    var amount = parseFloat(img.dataset.parallax) || -10;
    gsap.fromTo(img, { yPercent: 0 }, {
      yPercent: amount, ease: "none",
      scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true }
    });
  });

  $$("[data-float]").forEach(function (el) {
    var d = parseFloat(el.dataset.float) || 18;
    gsap.fromTo(el, { yPercent: d }, { yPercent: -d, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
  });

  $$("[data-rotate]").forEach(function (el) {
    gsap.to(el, { rotate: 360, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 } });
  });

  /* ---------- Count-up numbers ---------- */
  $$("[data-count]").forEach(function (el) {
    var end = parseFloat(el.dataset.count);
    var dec = parseInt(el.dataset.decimals || "0", 10);
    var o = { v: 0 };
    el.textContent = (0).toFixed(dec);
    gsap.to(o, {
      v: end, duration: 2.2, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 92%", once: true },
      onUpdate: function () { el.textContent = o.v.toFixed(dec); }
    });
  });

  /* ---------- Service cards ---------- */
  gsap.from(".service-card--type .service-card__glyph", {
    scale: 0.4, autoAlpha: 0, rotate: -20, duration: 1.2, ease: "back.out(1.7)",
    scrollTrigger: { trigger: ".service-card--type", start: "top 85%" }
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
        pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: function (self) { if (bar) bar.style.transform = "scaleX(" + self.progress + ")"; }
      }
    });
    gsap.from(".reel", {
      y: 120, rotate: function (i) { return i % 2 ? 4 : -4; }, autoAlpha: 0, duration: 1.2, ease: "expo.out", stagger: 0.08,
      scrollTrigger: { trigger: section, start: "top 70%" }
    });
  });
  mm.add("(max-width: 980px)", function () {
    gsap.from(".reel", {
      y: 60, autoAlpha: 0, duration: 1, ease: "expo.out", stagger: 0.08,
      scrollTrigger: { trigger: "[data-reels]", start: "top 75%" }
    });
  });

  /* ---------- Training video grows into place ---------- */
  $$("[data-expand]").forEach(function (el) {
    gsap.fromTo(el, { scale: 0.78, rotate: -3, borderRadius: "999px" }, {
      scale: 1, rotate: 0, borderRadius: "999px 999px 22px 22px", ease: "none",
      scrollTrigger: { trigger: el, start: "top 95%", end: "top 35%", scrub: true }
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
      { y: 18, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out", stagger: 0.035, overwrite: true });
  });

  /* ---------- Footer wordmark ---------- */
  var footerWord = $("[data-footer-word] .hero__word > span");
  if (footerWord) {
    var fs = split(footerWord, "chars", { charsClass: "char" });
    refit();
    if (fs) {
      gsap.from(fs.chars, {
        yPercent: 110, duration: 1.2, ease: "expo.out", stagger: 0.05,
        scrollTrigger: { trigger: "[data-footer-word]", start: "top 95%" }
      });
    }
  }

  /* ---------- Pointer-only niceties ---------- */
  if (finePointer) {
    // Magnetic buttons
    $$("[data-magnetic]").forEach(function (el) {
      var xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
      var yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.28);
        yTo((e.clientY - r.top - r.height / 2) * 0.38);
      });
      el.addEventListener("mouseleave", function () { xTo(0); yTo(0); });
    });

    // 3D tilt + light on service cards
    $$("[data-tilt]").forEach(function (card) {
      var rx = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3" });
      var ry = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3" });
      gsap.set(card, { transformPerspective: 900 });
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        ry((px - 0.5) * 10);
        rx((0.5 - py) * 8);
        card.style.setProperty("--mx", px * 100 + "%");
        card.style.setProperty("--my", py * 100 + "%");
      });
      card.addEventListener("mouseleave", function () { rx(0); ry(0); });
    });

    // Custom cursor
    var cursor = $("[data-cursor]");
    if (cursor) {
      html.classList.add("has-cursor");
      var dot = $(".cursor__dot", cursor);
      var ring = $(".cursor__ring", cursor);
      var label = $("[data-cursor-label]", cursor);
      var dX = gsap.quickTo(dot, "x", { duration: 0.08 }), dY = gsap.quickTo(dot, "y", { duration: 0.08 });
      var rX = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3" }), rY = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3" });
      window.addEventListener("mousemove", function (e) {
        dX(e.clientX); dY(e.clientY); rX(e.clientX); rY(e.clientY);
        cursor.classList.remove("is-hidden");
      }, { passive: true });
      document.addEventListener("mouseover", function (e) {
        var withText = e.target.closest("[data-cursor-text]");
        var link = e.target.closest("a, button, select, input, textarea, label, [role='tab']");
        cursor.classList.toggle("is-label", !!withText);
        label.textContent = withText ? withText.dataset.cursorText : "";
        cursor.classList.toggle("is-link", !withText && !!link);
      });
      document.documentElement.addEventListener("mouseleave", function () { cursor.classList.add("is-hidden"); });
    }
  }

  /* ---------- Keep measurements fresh ---------- */
  refit();
  ScrollTrigger.refresh();
  window.addEventListener("load", function () { refit(); ScrollTrigger.refresh(); });
  } // end init
})();
