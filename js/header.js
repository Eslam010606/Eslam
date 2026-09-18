/* ============================================================
   Header module — nav bar, language dropdown, mobile menu,
   theme button, scroll spy.
   ============================================================ */

/* global EDApp */

(function () {
  "use strict";

  const { $, $$, t, tArr, token, icon, P, esc, lang } = EDApp;

  /* [labelKey, anchorId] — order matters; nav home links to ###hero */
  const NAV = [
    ["home", "hero"],
    ["about", "section-about"],
    ["skills", "section-skills"],
    ["stack", "section-stack"],
    ["experience", "section-xp"],
    ["projects", "section-projects"],
    ["services", "section-services"],
    ["contact", "section-contact"],
  ];

  const LANG_DATA = {
    ar: { flag: "\u{1F1E6}\u{1F1F7}", name: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629" },
    en: { flag: "\u{1F1EC}\u{1F1E7}", name: "English" },
    fr: { flag: "\u{1F1EB}\u{1F1F7}", name: "Fran\u00E7ais" },
    de: { flag: "\u{1F1E9}\u{1F1EA}", name: "Deutsch" },
    es: { flag: "\u{1F1EA}\u{1F1F8}", name: "Espa\u00F1ol" },
    it: { flag: "\u{1F1EE}\u{1F1F9}", name: "Italiano" },
    pt: { flag: "\u{1F1F5}\u{1F1F9}", name: "Portugu\u00EAs" },
    ru: { flag: "\u{1F1F7}\u{1F1FA}", name: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439" },
    zh: { flag: "\u{1F1E8}\u{1F1F3}", name: "\u4E2D\u6587" },
    ja: { flag: "\u{1F1EF}\u{1F1F5}", name: "\u65E5\u672C\u8A9E" },
  };

  function nativeName(code) {
    const d = LANG_DATA[code];
    return d ? { flag: d.flag, name: d.name } : { flag: "", name: code };
  }

  function renderHeader() {
    const cur = lang();
    const links = NAV.map(([key, anchor]) => {
      const label = t("nav." + key);
      return '<a class="nav-link" href="#' + anchor + '" data-spy="' + anchor + '">' + esc(label) + "</a>";
    }).join("");

    const langs = EDApp.t !== undefined && window.ED_I18N.supported
      ? window.ED_I18N.supported.map((code) => {
          const n = nativeName(code);
          const active = code === cur ? " active" : "";
          const current = code === cur ? ' aria-current="true"' : "";
          return (
            '<button type="button" class="lang-item' + active + '" data-lang="' + code + '"' + current + ">" +
            '<span class="flag" aria-hidden="true">' + n.flag + "</span>" +
            '<span class="native">' + esc(n.name) + "</span>" +
            '<span class="lang-item__code">' + code.toUpperCase() + "</span>" +
            "</button>"
          );
        }).join("")
      : "";

    return (
      '<a class="skip-link" href="#main">' + esc(t("nav.skip") || "Skip to content") + "</a>" +
      '<div class="container header-inner">' +
      '<a class="nav-logo" href="#hero" aria-label="ESLAM DAWOUD — ' + esc(t("nav.home")) + '">' +
      '<span class="nav-logo__mark" aria-hidden="true">ED</span>' +
      '<span class="nav-logo__text">' +
      '<span class="nav-logo__name">ESLAM DAWOUD</span>' +
      '<span class="nav-logo__sub">' + esc(t("hero.role")) + "</span>" +
      "</span>" +
      "</a>" +

      '<nav class="nav" aria-label="' + esc(t("a11y.primary") || "Main navigation") + '" id="primary-nav">' +
      '<ul class="nav__links">' + links + "</ul>" +
      "</nav>" +

      '<div class="nav__actions">' +
      '<button type="button" class="icon-btn" id="theme-btn" aria-label="" title=""></button>' +
      '<div class="lang" id="lang-root">' +
      '<button type="button" class="lang__trigger icon-btn" id="lang-trigger" aria-haspopup="true" aria-expanded="false" aria-label="' + esc(t("lang.switcher") || "Change language") + '">' +
      icon("globe") + '<span class="lang__code">' + cur.toUpperCase() + "</span>" + icon("chevron") +
      "</button>" +
      '<ul class="lang__menu" id="lang-menu" role="menu" aria-label="' + esc(t("lang.switcher") || "Change language") + '">' +
      langs +
      "</ul>" +
      "</div>" +
      '<button type="button" class="hamburger icon-btn" id="hamburger" aria-expanded="false" aria-controls="mobile-menu" aria-label="' + esc(t("menu.open")) + '">' +
      '<span class="hamburger__line"></span>' +
      '<span class="hamburger__line"></span>' +
      '<span class="hamburger__line"></span>' +
      "</button>" +
      "</div>" +
      "</div>" +

      '<div class="mobile-menu" id="mobile-menu" aria-hidden="true">' +
      "<nav aria-label=\"" + esc(t("a11y.mobile") || "Mobile navigation") + '">' +
      '<div class="container">' +
      '<ul class="mobile-menu__links">' +
      NAV.map(([key, anchor]) => {
        return '<li><a class="mobile-link" href="#' + anchor + '">' + esc(t("nav." + key)) + "</a></li>";
      }).join("") +
      "</ul>" +
      '<div class="mobile-menu__foot">' +
      '<span class="mobile-menu__loc">' + icon("pin") + esc(token(P.location)) + "</span>" +
      '<a class="mobile-menu__cta btn btn--primary btn--sm" href="mailto:' + P.email + '">' + icon("mail") + esc(t("contact.btnEmail")) + "</a>" +
      "</div>" +
      "</div>" +
      "</nav>" +
      "</div>"
    );
  }

  /* ---------- scroll spy ---------- */
  let spyObserver = null;

  function initSpy() {
    if (spyObserver) spyObserver.disconnect();
    const sections = $$("section[id]");
    spyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          const tgt = en.target;
          const link = $('.nav-link[data-spy="' + tgt.id + '"]');
          if (!link) return;
          if (en.isIntersecting && en.intersectionRatio > 0) {
            $$(".nav-link").forEach((l) => l.removeAttribute("aria-current"));
            link.setAttribute("aria-current", "true");
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach((s) => spyObserver.observe(s));
  }

  function bindHeader() {
    const root = $("#site-header");
    if (!root) return;

    /* sync theme button with current theme */
    EDApp.setTheme(document.documentElement.getAttribute("data-theme") || "light");

    /* scrolled state */
    const onScroll = () => root.classList.toggle("scrolled", window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* language menu */
    const trigger = $("#lang-trigger");
    const menu = $("#lang-menu");
    const langRoot = $("#lang-root");
    const openMenu = (open) => {
      langRoot.classList.toggle("open", open);
      trigger.setAttribute("aria-expanded", String(open));
    };
    trigger.addEventListener("click", () => {
      const isOpen = menu.classList.contains("open");
      openMenu(!isOpen);
    });
    document.addEventListener("click", (e) => {
      if (!$("#lang-root").contains(e.target)) openMenu(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") openMenu(false);
      if (e.key === "Tab" && langRoot.classList.contains("open") && !langRoot.contains(e.target)) openMenu(false);
    });

    $$(".lang-item", menu).forEach((btn) => {
      btn.addEventListener("click", () => {
        EDApp.setLang(btn.getAttribute("data-lang"));
        openMenu(false);
      });
    });

    /* hamburger / mobile menu */
    const burger = $("#hamburger");
    const mobile = $("#mobile-menu");
    const syncMob = () => {
      const open = mobile.classList.contains("open");
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", t(open ? "menu.close" : "menu.open"));
      mobile.setAttribute("aria-hidden", String(!open));
      document.body.style.overflow = open ? "hidden" : "";
    };
    burger.addEventListener("click", () => {
      mobile.classList.toggle("open");
      syncMob();
    });
    $$(".mobile-link", mobile).forEach((a) =>
      a.addEventListener("click", () => {
        mobile.classList.remove("open");
        syncMob();
      })
    );

    initSpy();

    /* doc-level: close menu on resize to desktop */
    window.addEventListener("resize", () => {
      if (window.innerWidth > 900 && mobile.classList.contains("open")) {
        mobile.classList.remove("open");
        syncMob();
      }
    }, { passive: true });
  }

  EDApp.register({ header: renderHeader, bind: bindHeader });
})();