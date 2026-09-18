/* ============================================================
   Contact & Footer module — contact facts, validated contact
   form (mailto bridge), and site footer.
   ============================================================ */

/* global EDApp, ED_DATA */

(function () {
  "use strict";

  const { $, $$, t, token, icon, esc, P, toast } = EDApp;

  function sh(id, kicker, title, lead) {
    return (
      '<div class="section-head" data-reveal>' +
      '<p class="kicker">' + esc(kicker) + "</p>" +
      '<h2 id="' + id + '">' + esc(title) + "</h2>" +
      '<p class="lead">' + esc(lead) + "</p>" +
      "</div>"
    );
  }

  /* ---------- contact ---------- */

  const FACTS = [
    { key: "email", iconName: "mail", display: function () { return P.email; }, href: "mailto:" + ED_DATA.profile.email, external: false },
    { key: "phone", iconName: "phone", display: function () { return P.phoneDisplay; }, href: "tel:" + P.phoneTel, external: false },
  ];

  function renderContact() {
    const facts = FACTS.map(function (f) {
      const label = esc(t("contact.details." + f.key));
      const value = esc(f.display());
      return (
        '<div class="contact-fact">' +
        '<span class="contact-fact__icon" aria-hidden="true">' + icon(f.iconName) + "</span>" +
        "<div>" + "<small>" + label + "</small>" +
        (f.href
          ? '<a href="' + esc(f.href) + '"' + (f.external ? ' target="_blank" rel="noopener noreferrer"' : "") + ">" + value + "</a>"
          : "<span>" + value + "</span>") +
        "</div>" +
        "</div>"
      );
    }).join("");

    const externalFacts =
      '<div class="contact-fact">' +
      '<span class="contact-fact__icon" aria-hidden="true">' + icon("linkedin") + "</span>" +
      "<div><small>" + esc(t("contact.details.linkedin")) + '</small><a href="' + P.linkedin + '" target="_blank" rel="noopener noreferrer">' + esc(P.linkedin) + "</a></div>" +
      "</div>" +
      '<div class="contact-fact">' +
      '<span class="contact-fact__icon" aria-hidden="true">' + icon("github") + "</span>" +
      "<div><small>" + esc(t("contact.details.github")) + '</small><a href="' + P.github + '" target="_blank" rel="noopener noreferrer">' + esc(P.github) + "</a></div>" +
      "</div>";

    return (
      '<section class="section" id="section-contact" aria-labelledby="contact-title">' +
      '<div class="container">' +
      sh("contact-title", "12 — " + t("nav.contact"), t("contact.title"), t("contact.lead")) +
      '<div class="contact-grid">' +

      '<div class="contact-intro">' +
      '<h2 data-reveal>' + esc(t("contact.title")) + "</h2>" +
      '<p class="cta-text" data-reveal>' + esc(t("contact.lead")) + "</p>" +
      '<div class="contact-actions" data-reveal>' +
      '<a class="btn btn--primary" href="mailto:' + P.email + '">' + icon("mail") + esc(t("contact.btnEmail")) + "</a>" +
      '<a class="btn btn--ghost" href="' + P.linkedin + '" target="_blank" rel="noopener noreferrer">' + icon("linkedin") + esc(t("contact.btnContact")) + "</a>" +
      "</div>" +
      '<div class="contact-facts" data-reveal>' + facts + externalFacts + "</div>" +
      "</div>" +

      '<div class="form-card" data-reveal="right">' +
      "<h3>" + esc(t("contact.form.title")) + "</h3>" +
      '<form id="contact-form" novalidate>' +
      '<div class="form-grid">' +

      '<div class="field field--full" data-err="name">' +
      '<label for="cf-name">' + esc(t("contact.form.name")) + ' *</label>' +
      '<input id="cf-name" name="name" type="text" autocomplete="name" placeholder="' + esc(t("contact.ph.name")) + '">' +
      '<span class="err-msg">' + esc(t("validation.name")) + "</span>" +
      "</div>" +

      '<div class="field" data-err="email">' +
      '<label for="cf-email">' + esc(t("contact.form.email")) + ' *</label>' +
      '<input id="cf-email" name="email" type="email" autocomplete="email" placeholder="' + esc(t("contact.ph.email")) + '">' +
      '<span class="err-msg">' + esc(t("validation.email")) + "</span>" +
      "</div>" +

      '<div class="field" data-err="subject">' +
      '<label for="cf-subject">' + esc(t("contact.form.subject")) + ' *</label>' +
      '<input id="cf-subject" name="subject" type="text" autocomplete="off" placeholder="' + esc(t("contact.ph.subject")) + '">' +
      '<span class="err-msg">' + esc(t("validation.subject")) + "</span>" +
      "</div>" +

      '<div class="field field--full" data-err="message">' +
      '<label for="cf-message">' + esc(t("contact.form.message")) + ' *</label>' +
      '<textarea id="cf-message" name="message" rows="5" placeholder="' + esc(t("contact.ph.message")) + '"></textarea>' +
      '<span class="err-msg">' + esc(t("validation.message")) + "</span>" +
      "</div>" +

      '<p class="form-note">' + icon("info") + esc(t("contact.form.note")) + "</p>" +
      '<button type="submit" class="btn btn--primary form-submit">' + icon("send") + esc(t("contact.form.send")) + "</button>" +
      "</div></form></div>" +

      "</div></div></section>"
    );
  }

  /* ---------- footer ---------- */

  function renderFooter() {
    const links = [
      { key: "linkedin", href: P.linkedin, external: true },
      { key: "github", href: P.github, external: true },
      { key: "email", href: "mailto:" + P.email, external: false },
      { key: "cv", href: P.cv, download: true, external: false },
    ];
    const linkHTML = links.map(function (l) {
      return (
        '<a href="' + esc(l.href) + '"' +
        (l.external ? ' target="_blank" rel="noopener noreferrer"' : "") +
        (l.download ? ' download' : "") +
        ">" + esc(t("footer.links." + l.key)) + "</a>"
      );
    }).join("");

    return (
      '<footer class="site-footer">' +
      '<div class="container"><div class="footer-inner">' +
      '<div class="footer-top">' +
      '<div class="footer-brand">' +
      '<div class="name">ESLAM DAWOUD</div>' +
      "<p>" + esc(t("footer.role")) + " · " + esc(token(P.location)) + "</p>" +
      "</div>" +
      '<nav class="footer-links" aria-label="Footer">' + linkHTML + "</nav>" +
      "</div>" +
      '<div class="footer-bottom">' +
      "<span>" + esc(t("footer.rights")) + "</span>" +
      "<span>Full-Stack .NET · C# · SQL Server</span>" +
      "</div>" +
      "</div></div></footer>"
    );
  }

  /* ---------- form ---------- */

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(name, hasError) {
    const field = $('[data-err="' + name + '"]');
    if (field) field.classList.toggle("has-error", hasError);
  }

  function clearErrors() {
    $$(".field.has-error").forEach(function (f) { f.classList.remove("has-error"); });
  }

  function onFormSubmit(e) {
    e.preventDefault();
    clearErrors();

    const name = $("#cf-name").value.trim();
    const email = $("#cf-email").value.trim();
    const subject = $("#cf-subject").value.trim();
    const message = $("#cf-message").value.trim();

    let ok = true;
    if (!name) { setError("name", true); ok = false; }
    if (!email || !EMAIL_RE.test(email)) { setError("email", true); ok = false; }
    if (!subject) { setError("subject", true); ok = false; }
    if (!message) { setError("message", true); ok = false; }
    if (!ok) return;

    const body =
      "Hi Eslam,\n\n" +
      message +
      "\n\n— " + name + "\n" + email;
    const mailto =
      "mailto:" + P.email +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);

    toast(t("toast.mailto"));
    window.location.href = mailto;
  }

  function bind() {
    const form = $("#contact-form");
    if (form) form.addEventListener("submit", onFormSubmit);
    const inputs = $$("#contact-form input, #contact-form textarea");
    inputs.forEach(function (inp) {
      inp.addEventListener("input", function () {
        const name = inp.getAttribute("name");
        if (name) setError(name, false);
      });
    });
  }

  EDApp.register({
    main: renderContact,
    footer: renderFooter,
    bind: bind,
  });
})();