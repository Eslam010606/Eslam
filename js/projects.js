/* ============================================================
   Projects module — selected projects, filters, details modal,
   services, why-work-with-me.
   ============================================================ */

/* global EDApp, ED_DATA */

(function () {
  "use strict";

  const { $, $$, t, tArr, token, icon, esc, P } = EDApp;

  let activeFilter = "all";
  let lastOpener = null;

  function sh(id, kicker, title, lead) {
    return (
      '<div class="section-head" data-reveal>' +
      '<p class="kicker">' + esc(kicker) + "</p>" +
      '<h2 id="' + id + '">' + esc(title) + "</h2>" +
      '<p class="lead">' + esc(lead) + "</p>" +
      "</div>"
    );
  }

  /* ---------- projects ---------- */

  function projectCard(p, i) {
    const techTags = (p.tech || []).map(function (t2) {
      return '<span class="pill">' + esc(t2) + "</span>";
    }).join("");
    const name = token(p.name);

    return (
      '<article class="project-card" data-reveal data-filters="' + esc((p.tags || []).join(" ")) + '">' +
      '<div class="project-card__thumb" data-open="' + p.id + '" role="button" tabindex="0" aria-label="' + esc(name) + '">' +
      '<span class="project-card__type">' + esc(token(p.type)) + "</span>" +
      '<span class="project-card__mono" aria-hidden="true">' + esc(p.thumbnail || p.index) + "</span>" +
      '<span class="project-card__index">' + esc(p.index) + "</span>" +
      "</div>" +
      '<div class="project-card__body">' +
      "<h3>" + esc(name) + "</h3>" +
      '<p class="project-card__concept">' + esc(token(p.concept)) + "</p>" +
      '<p class="project-card__desc">' + esc(token(p.summary)) + "</p>" +
      '<div class="project-card__tags">' + techTags + "</div>" +
      '<div class="project-card__links">' +
      '<button type="button" class="btn btn--sm btn--ghost" data-open="' + p.id + '">' +
      esc(t("projects.viewDetails")) + icon("arrowRight") + "</button>" +
      '<span class="soon-badge">' + icon("info") + esc(t("projects.comingSoon")) + "</span>" +
      "</div>" +
      "</div>" +
      "</article>"
    );
  }

  function renderProjects() {
    const filters = [
      { id: "all", label: t("projects.filters.all") },
      { id: "cxx", label: t("projects.filters.cxx") },
      { id: "academic", label: t("projects.filters.academic") },
    ];
    const fBtns = filters.map(function (f) {
      return '<button type="button" class="filter-btn" data-filter="' + f.id + '" aria-pressed="' + (f.id === "all") + '">' + esc(f.label) + "</button>";
    }).join("");

    const cards = (ED_DATA.projects || []).map(projectCard).join("");

    return (
      '<section class="section" id="section-projects" aria-labelledby="projects-title">' +
      '<div class="container">' +
      sh("projects-title", "07 — " + t("nav.projects"), t("projects.title"), t("projects.lead")) +
      '<div class="filters" role="group" aria-label="' + esc(t("projects.title")) + '">' + fBtns + "</div>" +
      '<div class="projects-grid" id="projects-grid">' + cards +
      '<div class="project-more" id="project-more" data-reveal>' +
      "<div><span class='pill pill--core'>" + esc(t("projects.more.tag")) + "</span>" +
      "<h3>" + esc(t("projects.more.title")) + "</h3>" +
      "<p>" + esc(t("projects.more.desc")) + "</p></div>" +
      "</div>" +
      "</div></div></section>"
    );
  }

  /* ---------- services ---------- */

  const SERVICE_ICONS = ["browser", "braces", "database", "layers", "code", "chip"];

  function renderServices() {
    const items = tArr("services.items") || [];
    const cards = items.map(function (s, i) {
      return (
        '<article class="service-card" data-reveal="scale">' +
        '<span class="service-card__n">' + String(i + 1).padStart(2, "0") + "</span>" +
        '<span class="service-card__icon" aria-hidden="true">' + icon(SERVICE_ICONS[i % SERVICE_ICONS.length]) + "</span>" +
        "<h3>" + esc(s.title) + "</h3>" +
        "<p>" + esc(s.desc) + "</p>" +
        "</article>"
      );
    }).join("");

    return (
      '<section class="section" id="section-services" aria-labelledby="services-title">' +
      '<div class="container">' +
      sh("services-title", "08 — " + t("nav.services"), t("services.title"), t("services.lead")) +
      '<p class="services-note" data-reveal>' + icon("info") + esc(t("services.note")) + "</p>" +
      '<div class="services-grid">' + cards + "</div></div></section>"
    );
  }

  /* ---------- why ---------- */

  function renderWhy() {
    const items = tArr("why.items") || [];
    const cards = items.map(function (w, i) {
      return (
        '<article class="why-card" data-reveal="scale">' +
        '<span class="why-card__mark">' + String(i + 1).padStart(2, "0") + "</span>" +
        "<h3>" + esc(w.title) + "</h3>" +
        "<p>" + esc(w.desc) + "</p>" +
        "</article>"
      );
    }).join("");

    return (
      '<section class="section" id="section-why" aria-labelledby="why-title">' +
      '<div class="container">' +
      sh("why-title", "09 — " + (t("nav.why") || "Why"), t("why.title"), t("why.lead")) +
      '<div class="why-grid">' + cards + "</div></div></section>"
    );
  }

  /* ---------- modal ---------- */

  function buildModal(p) {
    const name = token(p.name);
    const feat = (p.features || []).map(function (f) {
      return "<li>" + esc(token(f)) + "</li>";
    }).join("");
    const tech = (p.tech || []).map(function (t2) {
      return '<span class="pill pill--core">' + esc(t2) + "</span>";
    }).join("");

    const links =
      p.github || p.demo
        ? '<div class="modal-block"><h4>' + esc(t("projects.modal.linksNotice")) + "</h4>" +
          (p.github ? '<a class="btn btn--sm btn--outline" href="' + esc(p.github) + '" target="_blank" rel="noopener noreferrer">' + icon("github") + "GitHub " + icon("external") + "</a>" : "") +
          (p.demo ? '<a class="btn btn--sm btn--outline" href="' + esc(p.demo) + '" target="_blank" rel="noopener noreferrer">' + icon("external") + esc(t("projects.viewDetails")) + "</a>" : "") +
          "</div>"
        : '<div class="modal-block"><h4>' + esc(t("projects.modal.technology")) + "</h4><p>" + esc(t("projects.modal.linksNotice")) + "</p></div>";

    return (
      '<button type="button" class="modal-close" data-close aria-label="' + esc(t("projects.modal.close")) + '">' + icon("close") + "</button>" +
      '<div class="modal__head"><div><h3>' + esc(name) + "</h3>" +
      '<span class="sub">' + esc(token(p.type)) + "</span></div></div>" +
      '<div class="modal__body">' +
      '<div class="modal-block"><h4>' + esc(t("projects.modal.overview")) + "</h4><p>" + esc(token(p.summary)) + "</p></div>" +
      '<div class="modal-block"><h4>' + esc(t("projects.modal.concept")) + "</h4><p>" + esc(token(p.concept)) + "</p></div>" +
      '<div class="modal-block"><h4>' + esc(t("projects.modal.features")) + '</h4><ul class="modal-features">' + feat + "</ul></div>" +
      '<div class="modal-block"><h4>' + esc(t("projects.modal.technology")) + '</h4><div class="modal-features modal-features--tags">' + tech + "</div></div>" +
      links +
      "</div>" +
      '<div class="modal__foot">' +
      '<button type="button" class="btn btn--ghost" data-close>' + icon("close") + esc(t("projects.modal.close")) + "</button>" +
      "</div>"
    );
  }

  function openProject(id) {
    const p = (ED_DATA.projects || []).find(function (x) { return x.id === id; });
    if (!p) return;
    const root = $("#modal-root");
    if (!root) return;
    lastOpener = document.activeElement;
    root.innerHTML = buildModal(p);
    root.hidden = false;
    document.body.style.overflow = "hidden";
    const closeBtn = $("[data-close]", root);
    if (closeBtn) closeBtn.focus();
    $$("[data-close]", root).forEach(function (b) {
      b.addEventListener("click", closeProject);
    });
    $(".modal-backdrop", root) || backdrop();
  }

  function backdrop() {
    const root = $("#modal-root");
    const bd = document.createElement("div");
    bd.className = "modal-backdrop";
    bd.addEventListener("click", closeProject);
    root.insertBefore(bd, root.firstChild);
  }

  function closeProject() {
    const root = $("#modal-root");
    if (!root) return;
    root.hidden = true;
    root.innerHTML = "";
    document.body.style.overflow = "";
    if (lastOpener && lastOpener.focus) lastOpener.focus();
  }

  /* ---------- filters ---------- */

  function filterProjects(cat) {
    activeFilter = cat;
    $$("#projects-grid .project-card").forEach(function (card) {
      const tags = (card.getAttribute("data-filters") || "").split(" ");
      const show = cat === "all" || tags.indexOf(cat) !== -1;
      if (show) {
        card.classList.remove("is-hiding");
        card.removeAttribute("hidden");
      } else {
        card.classList.add("is-hiding");
        setTimeout(function () {
          if (cat === activeFilter) card.setAttribute("hidden", "");
        }, 320);
      }
    });
    const more = $("#project-more");
    if (more) more.hidden = cat !== "all";
    $$(".filter-btn").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-filter") === cat));
    });
  }

  /* ---------- bind ---------- */

  function bind() {
    $$(".filter-btn").forEach(function (b) {
      b.addEventListener("click", function () {
        filterProjects(b.getAttribute("data-filter"));
        const grid = $("#projects-grid");
        if (grid) grid.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    $$("[data-open]").forEach(function (el) {
      const onOpen = function () { openProject(el.getAttribute("data-open")); };
      el.addEventListener("click", onOpen);
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); }
      });
    });

    document.addEventListener("keydown", function (e) {
      const root = $("#modal-root");
      if (root && !root.hidden && e.key === "Escape") closeProject();
    });
  }

  EDApp.register({
    main: function () {
      return renderProjects() + renderServices() + renderWhy();
    },
    bind: bind,
  });
})();