/* ============================================================
   GitHub & LinkedIn module — live repository feed with offline
   fallback states, plus the LinkedIn call-to-action card.
   ============================================================ */

/* global EDApp, ED_DATA */

(function () {
  "use strict";

  const { $, t, token, icon, esc, P, toast } = EDApp;

  const GITHUB_API = "https://api.github.com/users/" + P.githubUser + "/repos?sort=updated&per_page=15&page=1";

  let repoReqId = 0;
  let repoCache = null;

  function sh(id, kicker, title, lead) {
    return (
      '<div class="section-head" data-reveal>' +
      '<p class="kicker">' + esc(kicker) + "</p>" +
      '<h2 id="' + id + '">' + esc(title) + "</h2>" +
      '<p class="lead">' + esc(lead) + "</p>" +
      "</div>"
    );
  }

  function ago(dateStr) {
    if (!dateStr) return "";
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const days = Math.max(0, Math.floor(diff / 86400000));
      return t("github.lastUpdated") + ": " + (days === 0 ? t("github.today", "today") : days + "d");
    } catch (e) {
      return "";
    }
  }

  function repoCard(r) {
    const name = esc(r.name || "repo");
    const desc = r.description ? esc(r.description) : "";
    const url = r.html_url || "https://github.com/" + P.githubUser;
    const lang = r.language ? '<span class="repo-card__lang">' + esc(r.language) + "</span>" : "";
    return (
      '<article class="repo-card">' +
      '<a class="repo-card__name" href="' + url + '" target="_blank" rel="noopener noreferrer">' + icon("github") + "<span>" + name + "</span>" + "</a>" +
      (desc ? '<p class="repo-card__desc">' + desc + "</p>" : "") +
      '<div class="repo-card__meta">' +
      lang +
      "<span>" + icon("calendar") + esc(ago(r.pushed_at)) + "</span>" +
      "</div>" +
      "</article>"
    );
  }

  function renderRepos(repos) {
    const status = $("#repo-status");
    if (!status) return;
    status.innerHTML = '<div class="repo-grid">' + repos.map(repoCard).join("") + "</div>";
  }

  function loadingHtml() {
    return '<div class="github-loading" role="status"><span class="spinner" aria-hidden="true"></span> ' + esc(t("github.loading")) + "</div>";
  }

  function emptyHtml() {
    return '<div class="github-empty">' + icon("github") + "<p>" + esc(t("github.empty")) + "</p></div>";
  }

  function errorHtml() {
    return (
      '<div class="github-empty">' + icon("info") +
      "<p>" + esc(t("github.error")) + "</p>" +
      '<button type="button" class="btn btn--sm btn--ghost" id="repo-retry">' + icon("git") + esc(t("github.retry")) + "</button>" +
      "</div>"
    );
  }

  function loadRepos(force) {
    const status = $("#repo-status");
    if (!status) return;
    const id = ++repoReqId;
    status.innerHTML = loadingHtml();

    if (repoCache && !force) {
      renderRepos(repoCache);
      return;
    }

    const ctrl = new AbortController();
    const timer = setTimeout(function () { ctrl.abort(); }, 9000);

    fetch(GITHUB_API, {
      signal: ctrl.signal,
      headers: { Accept: "application/vnd.github+json" },
    })
      .then(function (res) {
        if (!res.ok) throw new Error("GitHub request failed: " + res.status);
        return res.json();
      })
      .then(function (list) {
        if (id !== repoReqId) return;
        const repos = (Array.isArray(list) ? list : []).filter(function (r) { return !r.fork; }).slice(0, 12);
        if (!repos.length) status.innerHTML = emptyHtml();
        else {
          repoCache = repos;
          renderRepos(repos);
        }
      })
      .catch(function () {
        if (id !== repoReqId) return;
        status.innerHTML = errorHtml();
      });
  }

  function bindRetry() {
    const btn = $("#repo-retry");
    if (btn) btn.addEventListener("click", function () { loadRepos(true); });
  }

  /* ---------- github ---------- */

  function renderGithub() {
    return (
      '<section class="section" id="section-github" aria-labelledby="github-title">' +
      '<div class="container">' +
      sh("github-title", "10 — " + (t("nav.github") || "GitHub"), t("github.title"), t("github.lead")) +
      '<div class="github-card" data-reveal>' +
      '<div class="github-top">' +
      "<div><h3>" + esc(P.name) + " · GitHub</h3><p>" + esc(t("github.lead")) + "</p></div>" +
      '<a class="btn btn--primary" href="' + P.github + '" target="_blank" rel="noopener noreferrer">' +
      icon("github") + esc(t("github.button")) + icon("external") + "</a>" +
      "</div>" +
      '<div id="repo-status" aria-live="polite"></div>' +
      "</div></div></section>"
    );
  }

  /* ---------- linkedin ---------- */

  function renderLinkedin() {
    return (
      '<section class="section" id="section-linkedin" aria-labelledby="linkedin-title">' +
      '<div class="container">' +
      sh("linkedin-title", "11 — " + (t("nav.linkedin", "LinkedIn") || "LinkedIn"), t("linkedin.title"), t("linkedin.lead")) +
      '<div class="linkedin-card" data-reveal="right">' +
      "<div><h3>" + esc(P.name) + "</h3><p>" + esc(token(P.role)) + " · " + esc(token(P.location)) + "</p></div>" +
      '<a class="btn btn--primary" href="' + P.linkedin + '" target="_blank" rel="noopener noreferrer">' +
      icon("linkedin") + esc(t("linkedin.button")) + icon("external") + "</a>" +
      "</div></div></section>"
    );
  }

  /* ---------- bind ---------- */

  function bind() {
    bindRetry();
    if (repoCache === null) loadRepos(false);
    else renderRepos(repoCache);
  }

  EDApp.register({
    main: function () {
      return renderGithub() + renderLinkedin();
    },
    bind: bind,
  });
})();