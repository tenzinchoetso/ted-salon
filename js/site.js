/* ==========================================================================
   Ted Salon — behaviour (plain JS, no libraries).
   Data: TED_MENU / TED_POLICIES (menu-data.js), TED_TEAM (team.js),
   TED_REVIEWS (reviews.js). Bookings open WhatsApp with a ready message —
   nothing is sent until the guest presses send.
   ========================================================================== */
(function () {
  "use strict";

  var WA = "919816714492";
  var OPEN_MIN = 10 * 60 + 30;  // 10:30
  var CLOSE_MIN = 21 * 60;      // 21:00

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  };
  var inr = function (n) { return "₹" + Number(n).toLocaleString("en-IN"); };
  var waUrl = function (text) { return "https://wa.me/" + WA + "?text=" + encodeURIComponent(text); };

  var MENU = window.TED_MENU || [];
  var POLICIES = window.TED_POLICIES || [];
  var TEAM = window.TED_TEAM || [];
  var DEPTS = window.TED_DEPTS || [];
  var EXTRA = window.TED_EXTRA_SERVICES || {};
  var REVIEWS = window.TED_REVIEWS || [];

  var teamById = {};
  TEAM.forEach(function (p) { teamById[p.id] = p; });
  var bookable = TEAM.filter(function (p) { return p.book !== false; });
  var whoDoes = function (cat) { return bookable.filter(function (p) { return (p.services || []).indexOf(cat) > -1; }); };
  var photo = function (p, small) { return "assets/img/team/" + (small ? "sm/" : "") + p.photo + ".jpg"; };

  // Every bookable category: the printed menu, plus extras that aren't on it (PMU).
  var menuNames = {};
  MENU.forEach(function (c) { c.items.forEach(function (it) { menuNames[it.name] = true; }); });
  var CATS = MENU.map(function (c) { return { id: c.id, label: c.label, note: c.note, items: c.items }; });
  Object.keys(EXTRA).forEach(function (id) {
    CATS.push({
      id: id, label: EXTRA[id].label, extra: true,
      onMenu: EXTRA[id].items.every(function (n) { return menuNames[n]; }),
      items: EXTRA[id].items.map(function (n) { return { name: n, price: null }; })
    });
  });
  var catById = {};
  CATS.forEach(function (c) { catById[c.id] = c; });

  function istNow() {
    var parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(new Date());
    var get = function (type) { return (parts.find(function (p) { return p.type === type; }) || {}).value; };
    var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return { day: days[get("weekday")], minutes: parseInt(get("hour"), 10) * 60 + parseInt(get("minute"), 10) };
  }
  var todayIST = function () { return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date()); };

  function openWhatsApp(text) {
    var url = waUrl(text);
    var w = window.open(url, "_blank");
    if (w) w.opener = null; else location.href = url;
  }

  /* ---------- Header shadow once the page scrolls ---------- */
  var hdr = $("[data-hdr]");
  if (hdr) {
    var onScroll = function () { hdr.classList.toggle("is-stuck", window.scrollY > 36); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Side sheets (menu + booking) ---------- */
  var lastTrigger = null;
  var openSheetEl = null;
  function openSheet(sheet, trigger) {
    if (openSheetEl && openSheetEl !== sheet) closeSheet(openSheetEl, true);
    lastTrigger = trigger || document.activeElement;
    sheet.hidden = false;
    void sheet.offsetWidth; // start the slide-in from the off-screen position
    sheet.classList.add("is-open");
    document.documentElement.classList.add("is-locked");
    openSheetEl = sheet;
    var burger = $("[data-nav-open]");
    if (burger && sheet.hasAttribute("data-nav-drawer")) burger.setAttribute("aria-expanded", "true");
  }
  function closeSheet(sheet, keepFocus) {
    if (!sheet || !sheet.classList.contains("is-open")) return;
    sheet.classList.remove("is-open");
    document.documentElement.classList.remove("is-locked");
    setTimeout(function () { if (!sheet.classList.contains("is-open")) sheet.hidden = true; }, reduce ? 0 : 460);
    if (openSheetEl === sheet) openSheetEl = null;
    var burger = $("[data-nav-open]");
    if (burger && sheet.hasAttribute("data-nav-drawer")) burger.setAttribute("aria-expanded", "false");
    if (!keepFocus && lastTrigger && lastTrigger.focus) lastTrigger.focus({ preventScroll: true });
  }
  document.addEventListener("keydown", function (e) {
    if (!openSheetEl) return;
    if (e.key === "Escape") { closeSheet(openSheetEl); return; }
    if (e.key !== "Tab") return;
    // keep keyboard focus inside the open sheet
    var f = $$("a[href], button:not([disabled]), input, select, textarea", $(".sheet__panel", openSheetEl))
      .filter(function (el) { return el.offsetParent !== null; });
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });

  /* ---------- Rendering helpers ---------- */
  function teamCard(p, opts) {
    var q = opts.quotes && p.quote
      ? '<blockquote class="tcard__quote">“' + esc(p.quote.text) + "”<cite>— " + esc(p.quote.by) + "</cite></blockquote>" : "";
    var action = p.book === false
      ? '<p class="tcard__front">Here to help on the day — just ask for ' + esc(p.name) + ".</p>"
      : '<button class="pill pill--dark pill--sm tcard__book" type="button" data-book-with="' + p.id + '">Book with ' + esc(p.name) + "</button>";
    return '<article class="tcard" data-dept="' + p.dept + '">' +
      '<div class="tcard__img"><img src="' + photo(p) + '" alt="' + esc(p.name + ", " + p.role + " at Ted Salon") + '" loading="lazy" width="720" height="900" draggable="false"></div>' +
      '<div class="tcard__meta"><h3 class="tcard__name">' + esc(p.name) + '</h3><p class="tcard__role">' + esc(p.role) + "</p>" + action + q + "</div>" +
    "</article>";
  }

  function reviewCard(r, hidden) {
    return '<figure class="rcard"' + (hidden ? ' aria-hidden="true"' : "") + ">" +
      '<div class="rcard__stars" aria-label="5 out of 5 stars">★★★★★</div>' +
      "<blockquote>" + esc(r.text) + "</blockquote>" +
      "<figcaption><strong>" + esc(r.name) + "</strong><span>" + esc(r.service) + " · " + esc(r.date) + "</span></figcaption>" +
    "</figure>";
  }

  // Chip filters (team by department)
  function setupChips(bar, items, cards, attr) {
    bar.innerHTML = items.map(function (it) {
      var n = it.id === "all" ? cards.length : cards.filter(function (c) { return c.dataset[attr] === it.id; }).length;
      return n ? '<button class="chip" type="button" data-chip="' + it.id + '" aria-pressed="false">' + esc(it.label) + " <span class=\"muted\">" + n + "</span></button>" : "";
    }).join("");
    function apply(id, push) {
      if (!$('[data-chip="' + id + '"]', bar)) id = "all";
      $$("[data-chip]", bar).forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.chip === id)); });
      cards.forEach(function (c) {
        var on = id === "all" || c.dataset[attr] === id;
        c.classList.toggle("is-hidden", !on);
      });
      if (push) history.replaceState(null, "", id === "all" ? location.pathname : "#" + id);
    }
    bar.addEventListener("click", function (e) {
      var b = e.target.closest("[data-chip]");
      if (b) apply(b.dataset.chip, true);
    });
    var fromHash = function () { apply(location.hash.slice(1) || "all", false); };
    window.addEventListener("hashchange", fromHash);
    fromHash();
  }

  /* ---------- Team ---------- */
  $$("[data-team]").forEach(function (strip) {
    strip.innerHTML = bookable.map(function (p) { return teamCard(p, {}); }).join("");
  });
  var teamGrid = $("[data-grid-team]");
  if (teamGrid) {
    teamGrid.innerHTML = TEAM.map(function (p) { return teamCard(p, { quotes: true }); }).join("");
    setupChips($('[data-chips="team"]'), DEPTS, $$(".tcard", teamGrid), "dept");
  }

  /* ---------- Reviews (rendered twice so the drift loops seamlessly) ---------- */
  $$("[data-reviews]").forEach(function (strip) {
    strip.innerHTML = REVIEWS.map(function (r) { return reviewCard(r); }).join("") +
      REVIEWS.map(function (r) { return reviewCard(r, true); }).join("");
  });

  /* ---------- Services + policies ---------- */
  var svc = $("[data-services]");
  if (svc) {
    var svcCats = CATS.filter(function (c) { return !c.onMenu; });
    var serviceRow = function (c, it) {
      var price = it.price
        ? '<span class="svc__price">' + (it.onwards ? "<small>from</small>" : "") + inr(it.price) + "</span>"
        : '<button class="enq" type="button" data-enquire="' + esc(it.name) + '" data-cat="' + c.id + '">Enquire</button>';
      return '<li class="svc__item"><span class="svc__name">' + esc(it.name) +
        (it.duration ? " <small>· " + esc(it.duration) + "</small>" : "") + "</span>" + price +
        (it.desc ? '<p class="svc__desc">' + esc(it.desc) + "</p>" : "") + "</li>";
    };
    svc.innerHTML = svcCats.map(function (c) {
      var who = whoDoes(c.id);
      return '<section class="svc__cat" id="' + c.id + '" aria-labelledby="svc-' + c.id + '">' +
        '<div><h2 class="h-sec" id="svc-' + c.id + '">' + esc(c.label) + "</h2>" +
          (c.note ? '<p class="muted">' + esc(c.note) + "</p>" : "") +
          (who.length ? '<div class="svc__who" aria-label="Who does it">' + who.map(function (p) {
            return '<button class="who" type="button" data-book-with="' + p.id + '" data-cat="' + c.id + '"><img src="' + photo(p, true) + '" alt="" width="30" height="30" loading="lazy">' + esc(p.name) + "</button>";
          }).join("") + "</div>" : "") +
        "</div>" +
        '<ul class="svc__list">' + c.items.map(function (it, k) {
          // sub-heading whenever the item's group changes (Brows, Lips, Refills…)
          var head = it.group && (k === 0 || c.items[k - 1].group !== it.group) ? '<li class="svc__group">' + esc(it.group) + "</li>" : "";
          return head + serviceRow(c, it);
        }).join("") + "</ul>" +
      "</section>";
    }).join("");
    var svcChips = $('[data-chips="services"]');
    if (svcChips) svcChips.innerHTML = svcCats.map(function (c) { return '<a class="chip" href="#' + c.id + '">' + esc(c.label) + "</a>"; }).join("");
  }
  var pol = $("[data-policies]");
  if (pol) pol.innerHTML = POLICIES.map(function (p) { return "<div><dt>" + esc(p.title) + "</dt><dd>" + esc(p.text) + "</dd></div>"; }).join("");

  /* ---------- Booking forms ---------- */
  function fillServices(select, personId, catFirst) {
    var keep = select.value;
    var person = teamById[personId];
    var first = person ? (person.services || []) : catFirst ? [catFirst] : [];
    var cats = CATS.filter(function (c) { return !c.onMenu || first.indexOf(c.id) > -1; });
    cats.sort(function (a, b) {
      var ia = first.indexOf(a.id), ib = first.indexOf(b.id);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
    select.length = 1; // keep the "Choose a service" placeholder
    $$("optgroup", select).forEach(function (g) { g.remove(); });
    cats.forEach(function (c) {
      var g = document.createElement("optgroup");
      g.label = c.label + (person && first.indexOf(c.id) > -1 ? " · " + person.name + "'s speciality" : "");
      c.items.forEach(function (it) {
        var label = it.name + (it.price ? " — " + (it.onwards ? "from " : "") + inr(it.price) : "");
        g.appendChild(new Option(label, it.name));
      });
      select.appendChild(g);
    });
    var other = new Option("Not sure yet — I'd like advice", "Not sure yet — need advice");
    select.appendChild(other);
    select.value = keep;
    if (select.value !== keep) select.value = "";
  }

  function fillSlots(timeSel, dateVal) {
    if (!timeSel) return;
    var now = istNow().minutes;
    var isToday = dateVal && dateVal === todayIST();
    var keep = timeSel.value;
    timeSel.length = 1;
    for (var m = OPEN_MIN; m <= CLOSE_MIN - 60; m += 30) {
      var h = Math.floor(m / 60), min = m % 60;
      var label = ((h + 11) % 12 + 1) + ":" + (min ? "30" : "00") + (h < 12 ? " am" : " pm");
      var o = new Option(label, label);
      if (isToday && m < now + 30) o.disabled = true;
      timeSel.appendChild(o);
    }
    timeSel.value = keep;
    if (timeSel.value !== keep || (timeSel.selectedOptions[0] && timeSel.selectedOptions[0].disabled)) timeSel.value = "";
  }

  var drawer = $("[data-book-drawer]");
  var whoBox = drawer && $("[data-book-who]", drawer);
  function showWho(id) {
    if (!whoBox) return;
    var p = teamById[id];
    whoBox.hidden = !p;
    whoBox.innerHTML = p ? '<img src="' + photo(p) + '" alt="" width="56" height="70"><div><strong>' + esc(p.name) + "</strong><span>" + esc(p.role) + "</span></div>" : "";
  }

  $$("[data-book-form]").forEach(function (form) {
    var stylist = $("[data-stylist]", form);
    var service = $("[data-service]", form);
    var timeSel = $("[data-time]", form);
    var date = form.elements.date;
    var err = $(".form__err", form);
    var inDrawer = drawer && drawer.contains(form);

    bookable.forEach(function (p) { stylist.appendChild(new Option(p.name + " — " + p.role, p.id)); });
    fillServices(service, "", "");
    date.min = todayIST();
    fillSlots(timeSel, "");

    stylist.addEventListener("change", function () {
      fillServices(service, stylist.value, "");
      if (inDrawer) {
        showWho(stylist.value);
        var p = teamById[stylist.value];
        $("#book-title").textContent = p ? "Book with " + p.name : "Book your chair";
      }
    });
    date.addEventListener("change", function () { fillSlots(timeSel, date.value); });
    form.addEventListener("input", function (e) { if (e.target.getAttribute("aria-invalid") === "true") e.target.setAttribute("aria-invalid", "false"); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.elements.name;
      var today = todayIST();
      var checks = [
        [name, name.value.trim() ? "" : "Please add your name."],
        [service, service.value ? "" : "Choose a service (or “Not sure yet”)."],
        [date, !date.value ? "Pick a date." : date.value < today ? "Please choose today or a later date." : ""]
      ];
      var first = null;
      checks.forEach(function (c) {
        c[0].setAttribute("aria-invalid", c[1] ? "true" : "false");
        if (c[1] && !first) first = c;
      });
      err.textContent = first ? first[1] : "";
      if (first) { first[0].focus(); return; }

      var p = teamById[stylist.value];
      var pretty = new Date(date.value + "T12:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
      var lines = [
        "Hello Ted Salon! I'd like to book an appointment.",
        "",
        "Name: " + name.value.trim(),
        "Service: " + service.value,
        "With: " + (p ? p.name + " (" + p.role + ")" : "Anyone available"),
        "Date: " + pretty,
        "Time: " + (timeSel && timeSel.value ? timeSel.value : "Any time")
      ];
      var notes = form.elements.notes && form.elements.notes.value.trim();
      if (notes) lines.push("Notes: " + notes);
      lines.push("", "Thank you!");
      openWhatsApp(lines.join("\n"));
    });
  });

  // Old links such as find-us.html?service=Hair%20donation%20cut#book preselect a service
  var presetService = new URLSearchParams(location.search).get("service");
  if (presetService) {
    $$("[data-book-form]").forEach(function (form) {
      if (drawer && drawer.contains(form)) return;
      var sel = $("[data-service]", form);
      sel.value = presetService;
      if (sel.value !== presetService) sel.value = "";
    });
  }

  function openBook(opts) {
    if (!drawer) return;
    var form = $("[data-book-form]", drawer);
    var stylist = $("[data-stylist]", form);
    var service = $("[data-service]", form);
    var p = teamById[opts.who] && teamById[opts.who].book !== false ? teamById[opts.who] : null;
    stylist.value = p ? p.id : "";
    service.value = "";
    fillServices(service, stylist.value, opts.cat || "");
    if (opts.service) service.value = opts.service;
    showWho(stylist.value);
    var cat = catById[opts.cat];
    $("#book-title").textContent = p ? "Book with " + p.name : cat && !opts.service ? "Book " + cat.label.toLowerCase() : "Book your chair";
    $(".form__err", form).textContent = "";
    openSheet(drawer, opts.trigger);
    var focusEl = form.elements.name.value.trim() ? (opts.service ? form.elements.date : service) : form.elements.name;
    setTimeout(function () { focusEl.focus({ preventScroll: true }); }, reduce ? 0 : 300);
  }

  /* ---------- One click handler for every trigger ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-nav-open], [data-nav-close], [data-book-close], [data-book], [data-book-with], [data-enquire]");
    if (!t) return;
    var nav = $("[data-nav-drawer]");
    if (t.hasAttribute("data-nav-open")) { openSheet(nav, t); return; }
    if (t.hasAttribute("data-nav-close")) { closeSheet(nav); return; }
    if (t.hasAttribute("data-book-close")) { closeSheet(drawer); return; }
    e.preventDefault();
    if (nav && nav.contains(t)) closeSheet(nav, true);
    openBook({
      who: t.dataset.bookWith,
      cat: t.dataset.bookServiceCat || t.dataset.cat,
      service: t.dataset.enquire,
      trigger: nav && nav.contains(t) ? $("[data-nav-open]") : t
    });
  });

  /* ---------- Hero carousel ---------- */
  var hero = $("[data-hero]");
  if (hero) (function () {
    var slides = $$("[data-slide]", hero);
    var dotsEl = $("[data-hero-dots]", hero);
    var DUR = 6500;
    var phone = window.matchMedia("(max-width: 720px)").matches;
    hero.style.setProperty("--slide-ms", DUR + "ms");

    $$("video[data-src-d]", hero).forEach(function (v) {
      if (phone && v.dataset.posterM) v.poster = v.dataset.posterM;
      v.src = phone ? v.dataset.srcM : v.dataset.srcD;
    });

    dotsEl.setAttribute("role", "tablist");
    dotsEl.setAttribute("aria-label", "Choose a slide");
    dotsEl.innerHTML = slides.map(function (s, k) {
      return '<button type="button" role="tab" aria-label="Slide ' + (k + 1) + '" aria-selected="false"></button>';
    }).join("");
    var dots = $$("button", dotsEl);

    var i = 0, timer = 0, startedAt = 0, left = DUR, paused = false, inView = true;
    function arm() {
      clearTimeout(timer);
      if (paused || reduce) return;
      startedAt = performance.now();
      timer = setTimeout(function () { show(i + 1); }, left);
    }
    function playCurrent(play) {
      slides.forEach(function (s, k) {
        var v = $("video", s);
        if (!v) return;
        if (play && k === i && !reduce) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
        else v.pause();
      });
    }
    function show(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle("is-active", k === i); s.inert = k !== i; });
      dots.forEach(function (d) { d.setAttribute("aria-selected", "false"); });
      void dotsEl.offsetWidth; // restart the progress bar
      dots[i].setAttribute("aria-selected", "true");
      playCurrent(!paused);
      left = DUR;
      arm();
    }
    function setPaused(p) {
      if (p === paused) return;
      paused = p;
      hero.classList.toggle("is-paused", p);
      if (p) { clearTimeout(timer); left = Math.max(300, left - (performance.now() - startedAt)); }
      else arm();
      playCurrent(!p);
    }
    var sync = function () { setPaused(!inView || document.hidden); };
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { inView = en[0].isIntersecting; sync(); }, { threshold: 0.2 }).observe(hero);
    }
    document.addEventListener("visibilitychange", sync);

    $("[data-hero-prev]", hero).addEventListener("click", function () { show(i - 1); });
    $("[data-hero-next]", hero).addEventListener("click", function () { show(i + 1); });
    dotsEl.addEventListener("click", function (e) {
      var k = dots.indexOf(e.target.closest("button"));
      if (k > -1) show(k);
    });
    hero.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") show(i - 1);
      if (e.key === "ArrowRight") show(i + 1);
    });
    var tx = null, ty = 0;
    hero.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
    hero.addEventListener("touchend", function (e) {
      if (tx === null) return;
      var t = e.changedTouches[0], dx = t.clientX - tx, dy = t.clientY - ty;
      tx = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) show(i + (dx < 0 ? 1 : -1));
    }, { passive: true });

    show(0);
  })();

  /* ---------- Strips: native scroll + mouse drag + arrows (+ drift) ---------- */
  $$("[data-strip]").forEach(function (strip) {
    var down = null, suppress = false;
    strip.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = { x: e.clientX, left: strip.scrollLeft, id: e.pointerId, moved: false };
    });
    strip.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - down.x;
      if (!down.moved && Math.abs(dx) > 6) {
        down.moved = true;
        strip.classList.add("is-dragging");
        try { strip.setPointerCapture(down.id); } catch (_) {}
      }
      if (down.moved) strip.scrollLeft = down.left - dx;
    });
    var end = function () {
      if (!down) return;
      suppress = down.moved;
      strip.classList.remove("is-dragging");
      down = null;
      setTimeout(function () { suppress = false; }, 0);
    };
    strip.addEventListener("pointerup", end);
    strip.addEventListener("pointercancel", end);
    // a drag must not count as a click on the card underneath
    strip.addEventListener("click", function (e) { if (suppress) { e.preventDefault(); e.stopPropagation(); } }, true);
    strip.addEventListener("dragstart", function (e) { e.preventDefault(); });

    var wrap = strip.closest(".strip-wrap");
    var prev = wrap && $("[data-strip-prev]", wrap), next = wrap && $("[data-strip-next]", wrap);
    if (prev && next) {
      var step = function (dir) { strip.scrollBy({ left: dir * strip.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" }); };
      prev.addEventListener("click", function () { step(-1); });
      next.addEventListener("click", function () { step(1); });
      var ends = function () {
        prev.disabled = strip.scrollLeft < 8;
        next.disabled = strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 8;
      };
      strip.addEventListener("scroll", ends, { passive: true });
      window.addEventListener("resize", ends);
      ends();
    }

    if (strip.hasAttribute("data-drift") && !reduce) drift(strip);
  });

  // Slow continuous drift that loops; pauses ~2 s after any touch, drag,
  // wheel or keyboard scroll — never on hover.
  function drift(strip) {
    var items = strip.children;
    var half = Math.floor(items.length / 2);
    if (half < 2) return;
    var SPEED = 32; // px per second
    var loopW = 0, pos = strip.scrollLeft, written = -1, last = 0, pausedUntil = 0, raf = 0;
    var measure = function () { loopW = items[half].offsetLeft - items[0].offsetLeft; };
    var hold = function () { pausedUntil = performance.now() + 2000; };
    ["pointerdown", "wheel", "touchstart", "keydown"].forEach(function (ev) { strip.addEventListener(ev, hold, { passive: true }); });
    strip.addEventListener("scroll", function () {
      // someone else moved it (finger, trackpad, drag, keys)
      if (Math.abs(strip.scrollLeft - written) > 2) { hold(); pos = strip.scrollLeft; }
    }, { passive: true });
    window.addEventListener("resize", measure);
    function tick(t) {
      raf = requestAnimationFrame(tick);
      var dt = Math.min(64, t - (last || t));
      last = t;
      if (t < pausedUntil || strip.classList.contains("is-dragging")) return;
      if (!loopW) measure();
      pos += SPEED * dt / 1000;
      while (loopW && pos >= loopW) pos -= loopW;
      strip.scrollLeft = pos;
      written = strip.scrollLeft;
    }
    var start = function () { if (!raf) { last = 0; pos = strip.scrollLeft; raf = requestAnimationFrame(tick); } };
    var stop = function () { cancelAnimationFrame(raf); raf = 0; };
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { en[0].isIntersecting ? start() : stop(); }).observe(strip);
    } else start();
  }

  /* ---------- Video tiles: load when near, play only while visible ---------- */
  var vids = $$("video[data-src]");
  if (vids.length && "IntersectionObserver" in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) {
          if (!v.getAttribute("src")) v.src = v.dataset.src;
          if (!reduce) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
        } else v.pause();
      });
    }, { rootMargin: "150px 0px" });
    vids.forEach(function (v) { vio.observe(v); });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = $$("[data-reveal]");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); rio.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { rio.observe(el); });
  }

  /* ---------- Open / closed status (salon time, IST) ---------- */
  function updateStatus() {
    var now = istNow();
    $$("[data-hours] li").forEach(function (li) { li.classList.toggle("is-today", Number(li.dataset.day) === now.day); });
    var el = $("[data-open-status]");
    if (!el) return;
    var open = now.minutes >= OPEN_MIN && now.minutes < CLOSE_MIN;
    el.classList.toggle("is-open", open);
    el.classList.toggle("is-closed", !open);
    if (open) {
      var leftMin = CLOSE_MIN - now.minutes;
      el.textContent = leftMin <= 60 ? "Open · closes in " + leftMin + " min" : "Open now · until 9 pm";
    } else {
      el.textContent = now.minutes < OPEN_MIN ? "Closed · opens 10:30 am" : "Closed · opens 10:30 am tomorrow";
    }
  }
  updateStatus();
  setInterval(updateStatus, 60 * 1000);

  /* ---------- Arriving with #section on a rendered page (services.html#nails) ---------- */
  if (svc && location.hash.length > 1) {
    var target = document.getElementById(location.hash.slice(1));
    if (target) window.addEventListener("load", function () {
      setTimeout(function () { target.scrollIntoView({ behavior: "auto", block: "start" }); }, 100);
    });
  }

  var year = $("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
