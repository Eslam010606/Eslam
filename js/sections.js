/* ============================================================
   Sections module — hero, about, skills, stack, experience,
   education, DEPI journey. Exposes single "main" HTML string
   and optional per-section bind logic.
   ============================================================ */

/* global EDApp, ED_DATA, ED_I18N */

(function () {
  "use strict";

  const { $, $$, t, tArr, token, icon, esc, P, reducedMotion } = EDApp;

  /* ---------- helpers ---------- */

  function sh(id, kicker, title, lead) {
    return (
      '<div class="section-head" data-reveal>' +
      '<p class="kicker">' + esc(kicker) + "</p>" +
      '<h2 id="' + id + '">' + esc(title) + "</h2>" +
      '<p class="lead">' + esc(lead) + "</p>" +
      "</div>"
    );
  }

  function check() { return icon("check"); }

  function chip(text) {
    return '<li class="tag">' + check() + esc(text) + "</li>";
  }

  function coreChip(text) {
    return '<li class="tag tag--core">' + esc(text) + "</li>";
  }

  function microTag(text) {
    return '<span class="micro-tag">' + esc(text) + "</span>";
  }

  /* ---------- hero ---------- */

  function renderHero() {
    const c = tArr("stack.layers");
    const visIds = ["front", "api", "core", "ef", "sql"];
    const featuredChips = (ED_DATA.skills.featured || []).slice(0, 4).map(microTag).join("");

    return (
      '<section class="hero section" id="hero" aria-labelledby="hero-title">' +
      '<div class="tech-canvas" aria-hidden="true">' +
      '<span class="ghost-tag gt-1">.NET</span>' +
      '<span class="ghost-tag gt-2">C#</span>' +
      '<span class="ghost-tag gt-3">SQL</span>' +
      '<span class="ghost-tag gt-4">API</span>' +
      "</div>" +

      '<div class="container hero__inner">' +

      /* left */
      '<div class="hero__content" data-reveal>' +
      '<p class="hero__eyebrow"><span class="dot"></span>' + esc(t("hero.eyebrow")) + "</p>" +
      '<h1 id="hero-title" class="hero__name">' +
      '<span class="line">ESLAM</span>' +
      '<span class="line accent">DAWOUD</span>' +
      "</h1>" +
      '<p class="hero__role">' + esc(t("hero.role")) + "</p>" +
      '<p class="hero__desc">' + esc(t("hero.desc1")) + "</p>" +
      '<p class="hero__desc">' + esc(t("hero.desc2")) + "</p>" +
      '<div class="hero__actions">' +
      '<a class="btn btn--primary" href="#section-projects">' + esc(t("hero.btnPrimary")) + "</a>" +
      '<a class="btn btn--outline" href="mailto:' + P.email + '">' + esc(t("hero.btnSecondary")) + "</a>" +
      '<a class="btn btn--ghost" href="' + P.cv + '" download rel="noopener">' + esc(t("hero.btnTertiary")) + icon("download") + "</a>" +
      "</div>" +
      '<div class="hero__socials" aria-label="Social links">' +
      '<a class="icon-btn" href="' + P.github + '" target="_blank" rel="noopener noreferrer" aria-label="GitHub">' + icon("github") + "</a>" +
      '<a class="icon-btn" href="' + P.linkedin + '" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">' + icon("linkedin") + "</a>" +
      '<a class="icon-btn" href="mailto:' + P.email + '" aria-label="Email">' + icon("mail") + "</a>" +
      "</div>" +
      "</div>" +

      /* right – stack viz */
      '<div class="hero__visual" data-reveal="right">' +
      '<div class="stack-viz" aria-hidden="true">' +
      '<div class="stack-viz__head"><strong>' + esc(t("hero.vizCaption")) + '</strong><span class="led">' + esc(t("hero.vizLed")) + "</span></div>" +
      '<ul class="stack-layers">' +
      (c || []).map(function (L, i) {
        return (
          '<li class="stack-layer">' +
          '<span class="stack-layer__icon">' + esc(L.viz) + "</span>" +
          '<span class="stack-layer__name">' + esc(L.label) + "</span>" +
          '<span class="stack-layer__tagline">' + esc(L.sub) + "</span>" +
          '<span class="stack-layer__idl">' + esc(visIds[i] ? visIds[i].toUpperCase() : "") + "</span>" +
          "</li>"
        );
      }).join("") +
      "</ul>" +
      '<div class="stack-viz__foot">' + featuredChips + "</div>" +
      "</div>" +
      "</div>" +

      "</div>" +
      "</section>"
    );
  }

  /* ---------- about ---------- */

  function renderAbout() {
    var chips = (tArr("about.chips") || []).map(chip).join("");
    var focus = (tArr("profile.focus") || []).map(function (f) {
      return "<span class='pill'>" + esc(f) + "</span>";
    }).join("");
    var core = (ED_DATA.skills.featured || []).map(function (f) {
      return "<span class='pill pill--core'>" + esc(f) + "</span>";
    }).join("");

    return (
      '<section class="section" id="section-about" aria-labelledby="about-title">' +
      '<div class="container">' +
      sh("about-title", "01 — " + t("nav.about"), t("about.title"), t("about.lead")) +
      '<div class="about-grid">' +

      '<div class="about-copy" data-reveal>' +
      "<p>" + esc(t("about.p1")) + "</p>" +
      "<p>" + esc(t("about.p2")) + "</p>" +
      "<p>" + esc(t("about.p3")) + "</p>" +
      '<ul class="about-chips">' + chips + "</ul>" +
      "</div>" +

      '<aside class="profile-card" data-reveal="right">' +
      '<div class="profile-card__head">' +
      '<div class="profile-card__avatar" aria-hidden="true">ED</div>' +
      "<div><h3>" + esc(P.name) + "</h3>" +
      '<span class="status">' + esc(token(P.role)) + "</span></div>" +
      "</div>" +
      "<dl>" +
      '<div class="profile-row"><dt>' + esc(t("profile.roleLabel")) + "</dt><dd>" + esc(token(P.role)) + "</dd></div>" +
      '<div class="profile-row"><dt>' + esc(t("profile.specLabel")) + "</dt><dd>" + esc(token(P.special)) + "</dd></div>" +
      '<div class="profile-row"><dt>' + esc(t("profile.focusLabel")) + "</dt><dd class='muted'><ul class='pill-list'>" + focus + "</ul></dd></div>" +
      '<div class="profile-row"><dt>' + esc(t("profile.coreLabel")) + "</dt><dd class='muted'><ul class='pill-list'>" + core + "</ul></dd></div>" +
      '<div class="profile-row"><dt>' + esc(t("profile.locLabel")) + "</dt><dd>" + esc(token(P.location)) + "</dd></div>" +
      "</dl>" +
      '<div style="padding:0 24px 24px"><a class="btn btn--primary btn--sm" href="' + P.cv + '" download rel="noopener">' + icon("download") + esc(t("hero.btnTertiary")) + "</a></div>" +
      "</aside>" +

      "</div></div></section>"
    );
  }

  /* ---------- skills ---------- */

  function renderSkills() {
    var S = ED_DATA.skills;

    var groups = [
      { title: t("skills.g1"), sub: t("skills.g1sub"), arr: S.languages, iconName: "code" },
      { title: t("skills.g2"), sub: "", arr: S.backend, iconName: "layers" },
      { title: t("skills.g3"), sub: "", arr: S.data, iconName: "database" },
      { title: t("skills.g4"), sub: "", arr: S.core, iconName: "braces" },
    ];

    var grid = groups.map(function (g, idx) {
      var items = g.arr.map(function (raw) {
        var text = token(raw);
        var cls = idx === 3 ? " tag--core" : "";
        return '<span class="tag' + cls + '">' + esc(text) + "</span>";
      }).join("");

      return (
        '<div class="skill-group" data-reveal>' +
        '<div class="skill-group__head">' +
        '<span class="skill-group__icon" aria-hidden="true">' + icon(g.iconName) + "</span>" +
        "<h3>" + esc(g.title) +
        (g.sub ? "<small>" + esc(g.sub) + "</small>" : "") +
        "</h3></div>" +
        '<div class="tag-cloud">' + items + "</div>" +
        "</div>"
      );
    }).join("");

    var featured = S.featured.map(coreChip).join("");

    return (
      '<section class="section" id="section-skills" aria-labelledby="skills-title">' +
      '<div class="container">' +
      sh("skills-title", "02 — " + t("nav.skills"), t("skills.title"), t("skills.lead")) +
      '<div class="skills-grid">' + grid + "</div>" +
      '<div class="skills-featured" data-reveal="scale">' +
      '<span class="skills-featured__label">' + esc(t("skills.featuredTitle")) + "<br>" + esc(t("skills.featuredNote")) + "</span>" +
      '<div class="skills-featured__tags">' + featured + "</div>" +
      "</div></div></section>"
    );
  }

  /* ---------- stack ---------- */

  function stackVizId(i) {
    return ["front", "api", "core", "ef", "sql"][i] || "";
  }

  function renderStack() {
    var layers = tArr("stack.layers") || [];
    var nodes = layers.map(function (L, i) {
      var accent = i === 0 || i === 4 ? " accent" : "";
      return (
        '<div class="stack-node" data-layer="' + i + '">' +
        '<button type="button" class="stack-node__btn" data-activate="' + i + '" aria-pressed="' + (i === 0) + '" aria-label="' + esc(L.label) + '">' +
        '<span class="stack-node__num">' + String(i + 1).padStart(2, "0") + "</span>" +
        '<span class="stack-node__icon' + accent + '">' + esc(L.viz) + "</span>" +
        '<span class="stack-node__label">' + esc(L.label) + "</span>" +
        '<span class="stack-node__sub">' + esc(L.sub) + "</span>" +
        "</button></div>"
      );
    }).join("");

    var arrows = "";
    for (var a = 0; a < 4; a++) {
      arrows += '<span class="stack-arrow" style="--i:' + a + '" aria-hidden="true"></span>';
    }

    var desc = layers[0] || {};

    return (
      '<section class="section stack-section" id="section-stack" aria-labelledby="stack-title">' +
      '<div class="container">' +
      sh("stack-title", "03 — " + t("nav.stack"), t("stack.title"), t("stack.lead")) +
      '<div class="stack-wrap" data-reveal>' +
      '<div class="stack-flow" id="stack-flow">' + nodes + arrows + "</div>" +
      '<div class="stack-desc" aria-live="polite">' +
      '<div class="stack-desc__inner">' +
      '<span class="stack-desc__marker"></span>' +
      "<div><h4 id='stack-desc-title'>" + esc(desc.label) + "</h4>" +
      "<p id='stack-desc-text'>" + esc(desc.desc) + "</p></div>" +
      "</div></div></div></div></section>"
    );
  }

  /* ---------- experience ---------- */

  function renderExperience() {
    var items = (ED_DATA.experience || []).map(function (e) {
      var chips = (e.chips || []).map(microTag).join("");
      var paragraphs = (e.desc || []).map(function (d) {
        return "<p>" + esc(token(d)) + "</p>";
      }).join("");

      return (
        '<article class="timeline-item" data-reveal>' +
        '<span class="timeline-item__dot" aria-hidden="true"></span>' +
        '<span class="timeline-item__period">' + esc(token(e.period)) + "</span>" +
        '<h3 class="timeline-item__company">' + esc(token(e.company)) + "</h3>" +
        '<span class="timeline-item__role">' + esc(token(e.role)) + "</span>" +
        '<div class="timeline-item__meta">' + chips + "</div>" +
        '<div class="timeline-item__desc">' + paragraphs + "</div>" +
        "</article>"
      );
    }).join("");

    return (
      '<section class="section" id="section-xp" aria-labelledby="xp-title">' +
      '<div class="container">' +
      sh("xp-title", "04 — " + t("nav.experience"), t("xp.title"), t("xp.lead")) +
      '<div class="timeline">' + items + "</div></div></section>"
    );
  }

  /* ---------- education ---------- */

  function renderEducation() {
    var e = (ED_DATA.education || [])[0] || {};

    return (
      '<section class="section" id="section-edu" aria-labelledby="edu-title">' +
      '<div class="container">' +
      sh("edu-title", "05 — " + t("nav.education"), t("edu.title"), t("edu.lead")) +
      '<article class="edu-card" data-reveal>' +
      '<div class="edu-card__seal" aria-hidden="true">' + icon("cap") + "</div>" +
      "<div>" +
      "<h3>" + esc(token(e.institution)) + "</h3>" +
      '<p class="degree">' + esc(token(e.degree)) + "</p>" +
      '<div class="meta">' +
      "<span>" + icon("pin") + esc(token(e.location)) + "</span>" +
      "<span>" + icon("calendar") + esc(token(e.period)) + "</span>" +
      "</div></div></article></div></section>"
    );
  }

  /* ---------- DEPI ---------- */

  function renderDepi() {
    var d = ED_DATA.depi;
    var tech = (d.tech || []).map(function (t2) {
      return '<span class="tag tag--core">' + esc(t2) + "</span>";
    }).join("");
    var steps = (d.steps || []).map(function (si, i) {
      var step = (tArr("depi.steps") || [])[si] || {};
      return (
        '<div class="roadmap-step" data-reveal="scale">' +
        '<span class="roadmap-step__n">STEP ' + (i + 1) + "</span>" +
        "<h4>" + esc(step.title) + "</h4>" +
        "<p>" + esc(step.desc) + "</p>" +
        (i < 3 ? '<span class="roadmap-step__arrow" aria-hidden="true">' + icon("arrowRight") + "</span>" : "") +
        "</div>"
      );
    }).join("");

    return (
      '<section class="section" id="section-depi" aria-labelledby="depi-title">' +
      '<div class="container">' +
      sh("depi-title", "06 — " + (t("nav.depi") || "DEPI"), t("depi.title"), t("depi.lead")) +
      '<div class="depi-card" data-reveal>' +
      '<div class="depi-head"><h3>' + esc(token(d.company)) + "</h3>" +
      '<span class="role-tag">' + esc(token(d.role)) + "</span></div>" +
      '<div class="depi-meta">' +
      "<span>" + icon("pin") + esc(token(P.location)) + "</span>" +
      "<span>" + icon("calendar") + esc(token(d.period)) + "</span>" +
      "</div>" +
      '<div class="depi-tech"><div class="label">' + esc(t("depi.techLabel")) + '</div><div class="tag-cloud">' + tech + "</div></div>" +
      '<div class="roadmap">' + steps + "</div>" +
      "</div></div></section>"
    );
  }

  /* ---------- stack behaviour ---------- */

  function activate(i) {
    var layers = tArr("stack.layers") || [];
    var btns = $$("[data-activate]");
    btns.forEach(function (b) {
      b.setAttribute("aria-pressed", String(parseInt(b.getAttribute("data-activate"), 10) === i));
    });
    var tgt = layers[i] || {};
    var titleEl = document.getElementById("stack-desc-title");
    var textEl = document.getElementById("stack-desc-text");
    if (titleEl) titleEl.textContent = tgt.label || "";
    if (textEl) textEl.textContent = tgt.desc || "";
  }

  function bindStack() {
    $$("[data-activate]").forEach(function (btn) {
      var idx = parseInt(btn.getAttribute("data-activate"), 10);
      btn.addEventListener("click", function () { activate(idx); });
      btn.addEventListener("mouseenter", function () { activate(idx); });
      btn.addEventListener("focus", function () { activate(idx); });
    });
  }

  /* ---------- register ---------- */

  EDApp.register({
    main: function () {
      return renderHero() + renderAbout() + renderTerminal() + renderSkills() + renderStack() + renderExperience() + renderEducation() + renderDepi();
    },
    bind: bindStack,
  });
})();