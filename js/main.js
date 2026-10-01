/* ==========================================================================
   Ted Salon — core interactions (work with or without the animation layer)
   ========================================================================== */
(function () {
  "use strict";

  var SALON_WHATSAPP = "919816714492";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  function scrollToEl(el) {
    if (el) el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  /* ---------- Fit the giant wordmarks to the container width ---------- */
  function fitText(el) {
    var parent = el.parentElement;
    var style = getComputedStyle(parent);
    var available = parent.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    el.style.fontSize = "100px";
    // measure the inner spans: the word wrappers stretch to full width when stacked
    var words = $$(".hero__word > span", el);
    var stacked = getComputedStyle(el).flexDirection === "column";
    var rects = words.map(function (w) { return w.getBoundingClientRect(); });
    var width = stacked
      ? Math.max.apply(null, rects.map(function (r) { return r.width; }))
      : rects[rects.length - 1].right - rects[0].left;
    if (width > 0) el.style.fontSize = Math.floor(100 * available / width * 0.995 * 10) / 10 + "px";
  }
  function fitAll() { $$("[data-fit]").forEach(fitText); }
  window.tedFitAll = fitAll;

  // Only re-fit when the width really changes (phones fire resize while scrolling)
  var resizeTimer, lastWidth = window.innerWidth;
  window.addEventListener("resize", function () {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(fitAll, 120);
  });
  fitAll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
  // Failsafe: show the title even if the animation layer never starts
  setTimeout(function () { document.documentElement.classList.add("is-fitted"); }, 2500);

  /* ---------- Buttons: rolling label on hover ---------- */
  $$(".btn").forEach(function (btn) {
    Array.prototype.slice.call(btn.childNodes).forEach(function (node) {
      if (node.nodeType !== 3 || !node.textContent.trim()) return;
      var text = node.textContent.trim();
      var roll = document.createElement("span");
      roll.className = "btn__roll";
      roll.innerHTML = "<span></span><span aria-hidden=\"true\"></span>";
      roll.firstChild.textContent = text;
      roll.lastChild.textContent = text;
      btn.replaceChild(roll, node);
    });
  });

  /* ---------- Header: solid after the hero, hide on scroll down ---------- */
  var header = $("[data-header]");
  var hero = $(".hero");
  var quickbar = $("[data-quickbar]");
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    var heroBottom = hero ? hero.offsetHeight - 120 : 300;
    header.classList.toggle("is-solid", y > 40);
    var goingDown = y > lastY && y > heroBottom;
    header.classList.toggle("is-hidden", goingDown && !document.body.classList.contains("nav-open"));
    if (quickbar) quickbar.classList.toggle("is-visible", y > heroBottom * 0.6);
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile navigation ---------- */
  var toggle = $("[data-nav-toggle]");
  var mobileNav = $("[data-mobile-nav]");
  function setNav(open) {
    toggle.setAttribute("aria-expanded", String(open));
    $(".visually-hidden", toggle).textContent = open ? "Close menu" : "Open menu";
    document.body.classList.toggle("nav-open", open);
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      mobileNav.hidden = false;
      requestAnimationFrame(function () { requestAnimationFrame(function () { mobileNav.classList.add("is-open"); }); });
      header.classList.add("is-solid");
      header.classList.remove("is-hidden");
    } else {
      mobileNav.classList.remove("is-open");
      setTimeout(function () { if (!mobileNav.classList.contains("is-open")) mobileNav.hidden = true; }, 700);
      onScroll();
    }
  }
  toggle.addEventListener("click", function () { setNav(toggle.getAttribute("aria-expanded") !== "true"); });
  $$("a", mobileNav).forEach(function (a) { a.addEventListener("click", function () { setNav(false); }); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { setNav(false); toggle.focus(); }
  });

  /* ---------- Reveal on scroll ---------- */
  var reveals = $$(".reveal, [data-clip-reveal]");
  if (!("IntersectionObserver" in window) || reduceMotion) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) {
      var siblings = el.parentElement ? $$(":scope > .reveal", el.parentElement) : [];
      var index = siblings.indexOf(el);
      if (index > 0) el.style.transitionDelay = Math.min(index, 6) * 70 + "ms";
      revealObserver.observe(el);
    });
  }

  /* ---------- Marquee: duplicate content for a seamless loop ---------- */
  var marquee = $("[data-marquee]");
  if (marquee) marquee.innerHTML += marquee.innerHTML;

  /* ---------- Videos: load when near, play only while visible ---------- */
  var videos = $$(".lazy-video");
  if ("IntersectionObserver" in window) {
    var videoObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var v = entry.target;
        if (entry.isIntersecting) {
          if (!v.getAttribute("src") && v.dataset.src) v.src = v.dataset.src;
          if (!reduceMotion) {
            // autoplay lets the browser resume it once it's actually visible
            v.autoplay = true;
            var p = v.play(); if (p && p.catch) p.catch(function () {});
          }
        } else {
          v.autoplay = false;
          if (!v.paused) v.pause();
        }
      });
    }, { rootMargin: "200px 200px" });
    videos.forEach(function (v) { videoObserver.observe(v); });
  }

  // Re-try visible videos (e.g. after the intro curtain lifts)
  window.tedPlayVisible = function () {
    if (reduceMotion) return;
    videos.forEach(function (v) {
      var r = v.getBoundingClientRect();
      if (v.getAttribute("src") && r.bottom > 0 && r.top < window.innerHeight && v.paused) {
        var p = v.play(); if (p && p.catch) p.catch(function () {});
      }
    });
  };

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") window.tedPlayVisible();
  });

  /* ---------- Reel player (dialog) ---------- */
  var modal = $("[data-reel-modal]");
  var modalVideo = $("[data-reel-modal-video]");
  if (modal && modalVideo && typeof modal.showModal === "function") {
    $$("[data-reel-open]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        modalVideo.poster = btn.dataset.reelPoster || "";
        modalVideo.src = btn.dataset.reelOpen;
        modal.showModal();
        var p = modalVideo.play(); if (p && p.catch) p.catch(function () {});
      });
    });
    $("[data-reel-close]").addEventListener("click", function () { modal.close(); });
    modal.addEventListener("click", function (e) { if (e.target === modal) modal.close(); });
    modal.addEventListener("close", function () {
      modalVideo.pause();
      modalVideo.removeAttribute("src");
      modalVideo.load();
    });
  } else {
    // Old browsers: open the video file directly
    $$("[data-reel-open]").forEach(function (btn) {
      btn.addEventListener("click", function () { window.open(btn.dataset.reelOpen, "_blank", "noopener"); });
    });
  }

  /* ---------- Service menu ---------- */
  var menu = window.TED_MENU || [];
  var tabsEl = $("[data-tabs]");
  var panelsEl = $("[data-panels]");
  var indicator = $("[data-tab-indicator]");
  var rupee = new Intl.NumberFormat("en-IN");

  function escapeHTML(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]; }); }

  function priceHTML(item) {
    if (item.price == null) {
      return '<button type="button" class="menu-item__enquire" data-enquire="' + escapeHTML(item.name) + '">Enquire</button>';
    }
    return '<span class="menu-item__price">' + (item.onwards ? "<small>from</small>" : "") + "₹" + rupee.format(item.price) + "</span>";
  }

  if (tabsEl && panelsEl && menu.length) {
    menu.forEach(function (cat, i) {
      var tab = document.createElement("button");
      tab.type = "button";
      tab.className = "tab";
      tab.id = "tab-" + cat.id;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", "panel-" + cat.id);
      tab.setAttribute("aria-selected", i === 0 ? "true" : "false");
      tab.tabIndex = i === 0 ? 0 : -1;
      tab.dataset.tab = cat.id;
      tab.textContent = cat.label;
      tabsEl.appendChild(tab);

      var panel = document.createElement("div");
      panel.className = "menu__panel";
      panel.id = "panel-" + cat.id;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tab.id);
      panel.tabIndex = 0;
      panel.hidden = i !== 0;
      panel.innerHTML =
        '<div class="menu__panel-head"><h3>' + escapeHTML(cat.label) + "</h3><p>" + escapeHTML(cat.note) + "</p></div>" +
        '<ul class="menu-list" role="list">' +
        cat.items.map(function (item) {
          return '<li class="menu-item">' +
            '<span class="menu-item__name">' + escapeHTML(item.name) +
              (item.duration ? ' <span class="menu-item__time">· ' + escapeHTML(item.duration) + "</span>" : "") +
              (item.tag ? ' <span class="menu-item__tag">' + escapeHTML(item.tag) + "</span>" : "") + "</span>" +
            priceHTML(item) +
            '<span class="menu-item__desc">' + escapeHTML(item.desc) + "</span>" +
          "</li>";
        }).join("") +
        "</ul>";
      panelsEl.appendChild(panel);
    });
  }

  var policiesEl = $("[data-policies]");
  if (policiesEl && window.TED_POLICIES) {
    policiesEl.innerHTML = window.TED_POLICIES.map(function (p) {
      return "<div><dt>" + escapeHTML(p.title) + "</dt><dd>" + escapeHTML(p.text) + "</dd></div>";
    }).join("");
  }

  function moveIndicator() {
    if (!indicator) return;
    var active = $('.tab[aria-selected="true"]', tabsEl);
    if (!active) return;
    indicator.style.width = active.offsetWidth + "px";
    indicator.style.height = active.offsetHeight + "px";
    indicator.style.transform = "translate(" + active.offsetLeft + "px," + active.offsetTop + "px)";
  }

  function selectTab(id, focus) {
    $$(".tab", tabsEl).forEach(function (t) {
      var on = t.dataset.tab === id;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      if (on) {
        if (focus) t.focus();
        if (tabsEl.scrollWidth > tabsEl.clientWidth) {
          tabsEl.scrollTo({ left: t.offsetLeft - tabsEl.clientWidth / 2 + t.offsetWidth / 2, behavior: "smooth" });
        }
      }
    });
    var shown;
    $$(".menu__panel", panelsEl).forEach(function (p) {
      p.hidden = p.id !== "panel-" + id;
      if (!p.hidden) shown = p;
    });
    moveIndicator();
    document.dispatchEvent(new CustomEvent("ted:tab", { detail: shown }));
  }

  if (tabsEl) {
    moveIndicator();
    window.addEventListener("resize", moveIndicator);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveIndicator);
    tabsEl.addEventListener("click", function (e) {
      var t = e.target.closest(".tab");
      if (t) selectTab(t.dataset.tab);
    });
    tabsEl.addEventListener("keydown", function (e) {
      var tabs = $$(".tab", tabsEl);
      var current = tabs.indexOf(document.activeElement);
      if (current < 0) return;
      var next = null;
      if (e.key === "ArrowRight") next = (current + 1) % tabs.length;
      if (e.key === "ArrowLeft") next = (current - 1 + tabs.length) % tabs.length;
      if (e.key === "Home") next = 0;
      if (e.key === "End") next = tabs.length - 1;
      if (next !== null) { e.preventDefault(); selectTab(tabs[next].dataset.tab, true); }
    });
  }

  // Service cards open the matching menu tab
  $$("[data-open-tab]").forEach(function (link) {
    link.addEventListener("click", function () { selectTab(link.dataset.openTab); });
  });

  // menu.html#colour → open the Colour tab and bring the menu into view
  var wanted = location.hash.slice(1);
  if (tabsEl && menu.some(function (c) { return c.id === wanted; })) {
    selectTab(wanted);
    setTimeout(function () { scrollToEl($("#menu")); }, 350);
  }

  /* ---------- Home: price highlights straight from the menu data ---------- */
  var highlights = $("[data-price-highlights]");
  if (highlights) {
    var rows = [];
    menu.forEach(function (cat) {
      cat.items.forEach(function (item) {
        if (item.price == null) return;
        rows.push('<li><a href="menu.html#' + cat.id + '">' +
          '<span class="price-list__name">' + escapeHTML(item.name) + '<small>' + escapeHTML(cat.label) + "</small></span>" +
          '<span class="price-list__dots" aria-hidden="true"></span>' +
          '<span class="price-list__price">' + (item.onwards ? "<small>from</small>" : "") + "₹" + rupee.format(item.price) + "</span>" +
          "</a></li>");
      });
    });
    highlights.innerHTML = rows.join("");
  }

  /* ---------- Reviews carousel ---------- */
  var reviewsEl = $("[data-reviews]");
  var reviews = window.TED_REVIEWS || [];
  if (reviewsEl) {
    reviewsEl.innerHTML = reviews.map(function (r) {
      return '<li class="review">' +
        '<span class="stars" aria-label="5 out of 5 stars">★★★★★</span>' +
        "<blockquote>" + escapeHTML(r.text) + "</blockquote>" +
        "<footer><div><p class=\"review__name\">" + escapeHTML(r.name) + "</p>" +
        '<p class="review__meta">Google review · ' + escapeHTML(r.date) + "</p></div>" +
        '<span class="review__service">' + escapeHTML(r.service) + "</span></footer>" +
      "</li>";
    }).join("");

    var prev = $("[data-prev]");
    var next = $("[data-next]");
    var step = function () {
      var card = $(".review", reviewsEl);
      return card ? card.getBoundingClientRect().width + 20 : reviewsEl.clientWidth;
    };
    var updateButtons = function () {
      prev.disabled = reviewsEl.scrollLeft < 8;
      next.disabled = reviewsEl.scrollLeft + reviewsEl.clientWidth >= reviewsEl.scrollWidth - 8;
    };
    prev.addEventListener("click", function () { reviewsEl.scrollBy({ left: -step(), behavior: "smooth" }); });
    next.addEventListener("click", function () { reviewsEl.scrollBy({ left: step(), behavior: "smooth" }); });
    reviewsEl.addEventListener("scroll", function () { window.requestAnimationFrame(updateButtons); }, { passive: true });
    window.addEventListener("resize", updateButtons);
    updateButtons();

    // Drag to scroll with a mouse
    var drag = null;
    reviewsEl.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      drag = { x: e.clientX, left: reviewsEl.scrollLeft, moved: false };
    });
    window.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 5) { drag.moved = true; reviewsEl.classList.add("is-dragging"); }
      if (drag.moved) reviewsEl.scrollLeft = drag.left - dx;
    });
    window.addEventListener("pointerup", function () {
      if (!drag) return;
      drag = null;
      reviewsEl.classList.remove("is-dragging");
    });
  }

  /* ---------- Open / closed status (salon time, IST) ---------- */
  var OPEN_MIN = 10 * 60 + 30;  // 10:30
  var CLOSE_MIN = 21 * 60;      // 21:00
  function istNow() {
    var parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(new Date());
    var get = function (type) { return (parts.find(function (p) { return p.type === type; }) || {}).value; };
    var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return { day: days[get("weekday")], minutes: parseInt(get("hour"), 10) * 60 + parseInt(get("minute"), 10) };
  }
  function updateStatus() {
    var now = istNow();
    var statusEl = $("[data-open-status]");
    $$("[data-hours] li").forEach(function (li) {
      li.classList.toggle("is-today", Number(li.dataset.day) === now.day);
    });
    if (!statusEl) return;
    var open = now.minutes >= OPEN_MIN && now.minutes < CLOSE_MIN;
    statusEl.classList.toggle("is-open", open);
    statusEl.classList.toggle("is-closed", !open);
    if (open) {
      var left = CLOSE_MIN - now.minutes;
      statusEl.textContent = left <= 60 ? "Open · closes in " + left + " min" : "Open now · until 9 pm";
    } else {
      statusEl.textContent = now.minutes < OPEN_MIN ? "Closed · opens 10:30 am" : "Closed · opens 10:30 am tomorrow";
    }
  }
  updateStatus();
  setInterval(updateStatus, 60 * 1000);

  /* ---------- YouTube: load the player only on click ---------- */
  $$("[data-video]").forEach(function (box) {
    var btn = $(".video__play", box);
    btn.addEventListener("click", function () {
      var iframe = document.createElement("iframe");
      iframe.src = "https://www.youtube-nocookie.com/embed/" + box.dataset.video + "?autoplay=1&rel=0";
      iframe.title = "Ted Salon grand opening — Ted Kunchok on YouTube";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      box.innerHTML = "";
      box.appendChild(iframe);
    });
  });

  /* ---------- Booking form → WhatsApp ---------- */
  var form = $("[data-book-form]");
  var presetAndGoTo = null;
  if (form) {
    var serviceSelect = $("[data-service-select]", form);
    var timeSelect = $("[data-time-select]", form);
    var dateInput = form.elements.date;

    menu.forEach(function (cat) {
      var group = document.createElement("optgroup");
      group.label = cat.label;
      cat.items.forEach(function (item) {
        var opt = document.createElement("option");
        opt.value = item.name;
        opt.textContent = item.name + (item.price != null ? " — ₹" + rupee.format(item.price) + (item.onwards ? "+" : "") : "");
        group.appendChild(opt);
      });
      serviceSelect.appendChild(group);
    });
    var other = document.createElement("option");
    other.value = "Not sure yet — need advice";
    other.textContent = "Not sure yet — I'd like advice";
    serviceSelect.appendChild(other);

    for (var m = OPEN_MIN; m <= CLOSE_MIN - 60; m += 30) {
      var h = Math.floor(m / 60), min = m % 60;
      var label = ((h + 11) % 12 + 1) + ":" + (min ? "30" : "00") + (h < 12 ? " am" : " pm");
      var o = document.createElement("option");
      o.value = label; o.textContent = label;
      timeSelect.appendChild(o);
    }

    var todayIST = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
    dateInput.min = todayIST;

    presetAndGoTo = function (service) {
      serviceSelect.value = service;
      scrollToEl($("#book"));
      setTimeout(function () {
        form.classList.remove("is-flash");
        void form.offsetWidth;
        form.classList.add("is-flash");
        form.elements.name.focus({ preventScroll: true });
      }, 900);
    };

    // "Book a donation cut" and similar links preselect a service
    $$("[data-preset-service]").forEach(function (link) {
      link.addEventListener("click", function () { serviceSelect.value = link.dataset.presetService; });
    });
    // Arriving from another page with ?service=… (Enquire buttons, donation link)
    var preset = new URLSearchParams(location.search).get("service");
    if (preset) {
      serviceSelect.value = preset;
      setTimeout(function () { form.classList.add("is-flash"); }, 600);
    }

    function setError(field, message) {
      var err = $("#" + field.id + "-err");
      field.setAttribute("aria-invalid", message ? "true" : "false");
      if (message) field.setAttribute("aria-describedby", field.id + "-err");
      else field.removeAttribute("aria-describedby");
      if (err) err.textContent = message || "";
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.elements.name;
      var checks = [
        [name, name.value.trim() ? "" : "Please add your name."],
        [serviceSelect, serviceSelect.value ? "" : "Choose a service (or “Not sure yet”)."],
        [dateInput, !dateInput.value ? "Pick a date." : (dateInput.value < todayIST ? "Please choose today or a later date." : "")]
      ];
      var firstInvalid = null;
      checks.forEach(function (c) {
        setError(c[0], c[1]);
        if (c[1] && !firstInvalid) firstInvalid = c[0];
      });
      if (firstInvalid) { firstInvalid.focus(); return; }

      var date = new Date(dateInput.value + "T12:00:00");
      var prettyDate = date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
      var lines = [
        "Hello Ted Salon! I'd like to book an appointment.",
        "",
        "Name: " + name.value.trim(),
        "Service: " + serviceSelect.value,
        "Date: " + prettyDate,
        "Time: " + (timeSelect.value || "Any time")
      ];
      var notes = form.elements.notes.value.trim();
      if (notes) lines.push("Notes: " + notes);
      lines.push("", "Thank you!");

      window.open("https://wa.me/" + SALON_WHATSAPP + "?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
    });
  }

  /* ---------- "Enquire" buttons in the menu ---------- */
  if (panelsEl) {
    panelsEl.addEventListener("click", function (e) {
      var b = e.target.closest("[data-enquire]");
      if (!b) return;
      if (form) presetAndGoTo(b.dataset.enquire);
      else location.href = "find-us.html?service=" + encodeURIComponent(b.dataset.enquire) + "#book";
    });
  }

  /* ---------- Arriving with a #section from another page (e.g. find-us.html#book) ---------- */
  // Wait until fonts and the animation layer have settled, then land exactly on it.
  var arrival = location.hash.length > 1 && !(tabsEl && menu.some(function (c) { return "#" + c.id === location.hash; }))
    ? document.getElementById(location.hash.slice(1)) : null;
  if (arrival) {
    window.addEventListener("load", function () {
      setTimeout(function () { arrival.scrollIntoView({ behavior: "auto", block: "start" }); }, 150);
    });
  }

  /* ---------- Footer year ---------- */
  var year = $("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
