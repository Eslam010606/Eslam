/* Terminal module — interactive command-line explorer. */

/* global EDApp, ED_DATA, ED_I18N */

(function () {
  "use strict";

  const { $, t, tArr, token, esc, P } = EDApp;
  const PROMPT = "eslam@dawoud:~$";
  const history = [];
  let histIdx = -1;

  function line(content, cls) {
    const div = document.createElement("div");
    div.className = "t-line" + (cls ? " " + cls : "");
    if (cls === "t-cmd-line") {
      div.innerHTML =
        '<span class="terminal__prompt">' + esc(PROMPT) + "</span><span>" + esc(content) + "</span>";
    } else {
      div.innerHTML = content;
    }
    $("#term-body").appendChild(div);
    $("#term-body").scrollTop = $("#term-body").scrollHeight;
  }

  function out(text, cls) {
    line(esc(text), cls || "t-out");
  }

  function printCommand(cmd) {
    line(cmd, "t-cmd-line");
  }

  function renderTerminal() {
    return (
      '<section class="terminal-section" id="section-terminal" aria-label="' + esc(t("term.title")) + '">' +
      '<div class="container">' +
      '<div class="section-head">' +
      "<h2>" + esc(t("term.title")) + "</h2>" +
      '<p class="lead">' + esc(t("term.lead")) + "</p>" +
      "</div>" +
      '<div class="terminal" data-reveal>' +
      '<div class="terminal__bar">' +
      '<span class="terminal__dots" aria-hidden="true"><i></i><i></i><i></i></span>' +
      "<span class=\"terminal__title\">" + esc(PROMPT) + "</span>" +
      '<button type="button" class="terminal__clear-btn" id="term-clear" aria-label="' + esc(t("term.clear")) + '">clear</button>' +
      "</div>" +
      '<div class="terminal__body" id="term-body" tabindex="0" aria-live="polite">' +
      '<div class="t-line t-out">' + esc(t("term.welcome")) + "</div>" +
      '<div class="t-line t-dim">' + esc(t("term.hint")) + "</div>" +
      "</div>" +
      '<form class="terminal__input" id="term-form" autocomplete="off">' +
      '<span class="terminal__prompt">' + esc(PROMPT) + "</span>" +
      '<input id="term-input" spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="Terminal command" placeholder="' + esc(t("term.hintCmd")) + '">' +
      "</form>" +
      "</div>" +
      "</div></div></section>"
    );
  }

  function execute(raw) {
    const input = $("#term-input");
    const body = $("#term-body");
    const cmd = (raw || "").trim();
    if (cmd) {
      history.push(cmd);
      if (history.length > 50) history.shift();
    }
    histIdx = history.length;
    printCommand(cmd);

    const parts = cmd.toLowerCase().split(/\s+/);
    const name = parts[0] || "";
    const arg = parts.slice(1).join(" ");

    switch (name) {
      case "help":
        tArr("term.commands").forEach(function (c) { out(c); });
        break;

      case "whoami":
      case "about":
        out(P.fullName);
        out(P.role + " · " + P.special);
        out(token(P.location));
        break;

      case "skills":
        [].concat(
          ED_DATA.skills.languages || [],
          ED_DATA.skills.backend || []
        ).forEach(function (s) { out(token(s)); });
        break;

      case "stack":
        (tArr("stack.layers") || []).forEach(function (s, i) {
          out((i + 1) + ". " + s);
        });
        break;

      case "projects":
        ED_DATA.projects.forEach(function (p) {
          out(token(p.name) + " [" + p.tech.join(", ") + "]");
          out("   " + token(p.summary || ""));
          out("   status: COMING SOON");
        });
        break;

      case "experience":
        ED_DATA.experience.forEach(function (x) {
          out(token(x.role) + " @ " + token(x.company));
          out(token(x.period) + " · " + token(x.location));
        });
        break;

      case "education":
        ED_DATA.education.forEach(function (e) {
          out(token(e.degree) + " — " + token(e.institution));
          out(token(e.period) + " · " + token(e.location));
        });
        break;

      case "depi":
        (tArr("depi.steps") || []).forEach(function (s) {
          out("> " + s);
        });
        break;

      case "contact":
        out("email: " + P.email);
        out("phone: " + P.phoneDisplay);
        out(token(P.location));
        break;

      case "links":
        out("github:   " + P.github);
        out("linkedin: " + P.linkedin);
        out("cv:       " + P.cv);
        break;

      case "lang": {
        const code = arg;
        if (code && window.ED_I18N.supported.indexOf(code) !== -1) {
          EDApp.setLang(code);
          out(t("term.langChanged") + " '" + code + "' — " + t("term.ok"));
        } else {
          out(t("term.invalid") + " — use: en, ar, fr, de, es, it, pt, ru, zh, ja");
        }
        break;
      }

      case "theme": {
        const mode = arg;
        if (mode === "dark" || mode === "light") {
          EDApp.setTheme(mode);
          out(t("term.themeChanged") + " '" + mode + "'");
        } else {
          out(t("term.invalid") + " — use: dark | light");
        }
        break;
      }

      case "clear":
        body.innerHTML = "";
        break;

      case "":
        break;

      default:
        out("'" + name + "': " + t("term.unknown") + ". " + t("term.tryHelp"));
    }
    input.value = "";
    input.focus();
  }

  function bindTerminal() {
    const form = $("#term-form");
    const input = $("#term-input");
    if (!form || !input) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      execute(input.value);
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (histIdx > 0) {
          histIdx -= 1;
          input.value = history[histIdx] || "";
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (histIdx < history.length) {
          histIdx += 1;
          input.value = history[histIdx] || "";
        } else {
          input.value = "";
        }
      } else if (e.key === "l" && e.ctrlKey) {
        e.preventDefault();
        const body = $("#term-body");
        if (body) body.innerHTML = "";
      }
    });

    const clearBtn = $("#term-clear");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        const body = $("#term-body");
        if (body) body.innerHTML = "";
        input.focus();
      });
    }

    const term = $("#section-terminal .terminal");
    if (term) {
      term.addEventListener("click", function () { input.focus(); });
    }
  }

  window.renderTerminal = renderTerminal;

  EDApp.register({
    main: function () { return ""; },
    bind: bindTerminal,
  });
})();