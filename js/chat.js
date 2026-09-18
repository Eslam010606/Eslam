/* Chat module — portfolio assistant.
   Modes: "kb" (offline keyword intents, 10 languages) or "api"
   (LLM endpoint). Configure BEFORE this file loads:

     window.CHAT_CONFIG = {
       mode: "api",
       apiUrl: "https://.../v1/chat/completions",
       apiKey: "",
       model: "",
       systemPrompt: "You are Eslam's assistant...",
     }; */

/* global EDApp, ED_DATA, CHAT_INTENTS */

(function () {
  "use strict";

  const { $, t, icon, esc, P } = EDApp;

  const CHAT_LANG_KEY = "ed-chat-lang";
  const CHAT_LANGS = ED_I18N.supported || ["en", "ar", "fr", "de", "es", "it", "pt", "ru", "zh", "ja"];
  const CHAT_NATIVE = {
    ar: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629", en: "English", fr: "Fran\u00E7ais", de: "Deutsch",
    es: "Espa\u00F1ol", it: "Italiano", pt: "Portugu\u00EAs",
    ru: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439", zh: "\u4E2D\u6587", ja: "\u65E5\u672C\u8A9E",
  };

  function siteLang() {
    try { return EDApp.lang(); } catch (e) { return "en"; }
  }

  function pickChatLang() {
    try {
      const stored = localStorage.getItem(CHAT_LANG_KEY);
      if (stored && CHAT_LANGS.indexOf(stored) !== -1) return stored;
    } catch (e) { /* ignore */ }
    return siteLang();
  }

  let chatLang = pickChatLang();

  const ck = (path) => ED_I18N.gt(chatLang, path);
  const carr = (path) => ED_I18N.gtArr(chatLang, path);

  function setChatLang(code) {
    if (!code || CHAT_LANGS.indexOf(code) === -1) return;
    chatLang = code;
    try { localStorage.setItem(CHAT_LANG_KEY, code); } catch (e) { /* ignore */ }
    ED_I18N.prepare(code);
    translate(true);
  }

  const CFG = window.CHAT_CONFIG || {};
  const MODE = CFG.mode === "api" && CFG.apiUrl ? "api" : "kb";

  const PRIORITY = ["name", "role", "why", "services", "contact", "location", "stack", "depi", "cv", "github", "linkedin", "projects", "exp", "edu", "skills", "fee"];

  const GREET = {
    en: ["hello", "hi", "hey", "salam", "good morning"], ar: ["اهلا", "السلام", "مرحبا", "صباح", "هاي"],
    fr: ["bonjour", "salut", "bonsoir"], de: ["hallo", "guten tag", "hi"],
    es: ["hola", "buenos dias", "buenas"], it: ["ciao", "salve", "buongiorno"],
    pt: ["olá", "ola", "bom dia", "oi"], ru: ["привет", "здравствуйте", "здравствуй"],
    zh: ["你好", "您好", "嗨"], ja: ["こんにちは", "こんばんは", "やあ"],
  };
  const THANKS = {
    en: ["thanks", "thank you", "thx"], ar: ["شكرا", "شكراً"], fr: ["merci"], de: ["danke"],
    es: ["gracias"], it: ["grazie"], pt: ["obrigado"], ru: ["спасибо"], zh: ["谢谢"], ja: ["ありがとう"],
  };

  let ui = { fab: null, panel: null, body: null, chips: null, text: null, close: null };

  function chatIcon() {
    return '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3C6.5 3 2 6.9 2 11.7c0 2.6 1.3 4.9 3.4 6.5-.1.9-.5 2.2-1.2 3.2 2.9-.2 5-1.3 6.2-2.3 1.4.3 2.7.4 4.1.4 3.6 0 6.9-1.6 8.6-4.1 1.2-1.7 1.9-3.8 1.9-6C24.9 7.2 19.1 3 12 3z"/></svg>';
  }

  function typingDots() {
    return '<span class="typing-dots" aria-label="typing"><i></i><i></i><i></i></span>';
  }

  function buildMsg(bot) {
    const msg = document.createElement("div");
    msg.className = "chat-msg " + (bot ? "chat-msg--bot" : "chat-msg--user");
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    msg.appendChild(bubble);
    ui.body.appendChild(msg);
    ui.body.scrollTop = ui.body.scrollHeight;
    return bubble;
  }

  function addBot(text, html) {
    const bubble = buildMsg(true);
    const typing = document.createElement("span");
    typing.innerHTML = typingDots();
    bubble.appendChild(typing);
    ui.body.scrollTop = ui.body.scrollHeight;
    setTimeout(function () {
      bubble.textContent = "";
      bubble.insertAdjacentHTML("afterbegin", html || esc(text));
      ui.body.scrollTop = ui.body.scrollHeight;
    }, 500 + Math.random() * 550);
    return bubble;
  }

  function addUser(text) {
    buildMsg(false).textContent = text;
  }

  function answerFor(intent) {
    if (window.EDBrain) {
      const b = window.EDBrain.answer(intent, chatLang);
      if (b) return b;
    }
    let html = esc(ck("chat.a." + intent));
    if (intent === "contact") {
      html +=
        '<div class="chat-msg__links">' +
        '<a href="mailto:' + P.email + '">' + esc(ck("contact.details.email")) + "</a>" +
        '<a href="' + P.linkedin + '" target="_blank" rel="noopener noreferrer">' + esc(ck("contact.details.linkedin")) + "</a>" +
        '<a href="' + P.github + '" target="_blank" rel="noopener noreferrer">' + esc(ck("contact.details.github")) + "</a>" +
        "</div>";
    }
    return html;
  }

  function match(text, list, langs) {
    if (!list) return false;
    return list.some(function (k) {
      return k && text.indexOf((langs ? k : k).toLowerCase()) !== -1;
    });
  }

  function computeReply(raw) {
    const lang = chatLang;
    const text = (raw || "").trim();
    const low = text.toLowerCase();
    if (!text) return ck("chat.help");
    if (match(low, GREET[lang] || GREET.en)) return ck("chat.greet") + " " + ck("chat.help");
    if (match(low, THANKS[lang] || THANKS.en)) return ck("chat.thanks");
    if (window.EDBrain) {
      const b = window.EDBrain.reply(text, chatLang);
      if (b) return b;
    }
    const kw = (window.CHAT_INTENTS && window.CHAT_INTENTS[lang]) || window.CHAT_INTENTS.en || {};
    for (let i = 0; i < PRIORITY.length; i++) {
      const id = PRIORITY[i];
      if (match(text, kw[id])) return answerFor(id);
    }
    return ck("chat.fallback") + " " + ck("chat.help");
  }

  function apiReply(userText) {
    const system = CFG.systemPrompt || ck("chat.title");
    return fetch(CFG.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(CFG.apiKey ? { Authorization: "Bearer " + CFG.apiKey } : {}),
      },
      body: JSON.stringify({
        model: CFG.model || "",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userText },
        ],
      }),
    })
      .then(function (r) {
        if (!r.ok) throw new Error("api " + r.status);
        return r.json();
      })
      .then(function (d) {
        const out = (d && (d.reply || d.content || d.message || (d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content)));
        return out ? String(out).trim() : "";
      })
      .then(function (out) {
        return out || computeReply(userText);
      })
      .catch(function () {
        return computeReply(userText);
      });
  }

  function send(text) {
    const clean = (text || "").trim();
    if (!clean) return;
    addUser(clean);
    const bubble = addBot("");
    if (MODE === "api") {
      apiReply(clean).then(function (out) {
        bubble.textContent = "";
        bubble.insertAdjacentHTML("afterbegin", esc(out));
        ui.body.scrollTop = ui.body.scrollHeight;
      });
    } else {
      const reply = computeReply(clean);
      setTimeout(function () {
        bubble.textContent = "";
        bubble.insertAdjacentHTML("afterbegin", reply);
        ui.body.scrollTop = ui.body.scrollHeight;
      }, 700);
    }
  }

  function openPanel(open) {
    ui.panel.classList.toggle("open", open);
    ui.fab.setAttribute("aria-expanded", String(open));
    if (open) ui.text.focus();
  }

  function bind() {
    ui.fab.addEventListener("click", function () {
      openPanel(!ui.panel.classList.contains("open"));
    });
    ui.close.addEventListener("click", function () { openPanel(false); });
    if (ui.lang) {
      ui.lang.value = chatLang;
      ui.lang.addEventListener("change", function () { setChatLang(ui.lang.value); });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && ui.panel.classList.contains("open")) openPanel(false);
    });
    document.getElementById("chat-form").addEventListener("submit", function (e) {
      e.preventDefault();
      send(ui.text.value);
      ui.text.value = "";
    });
    document.querySelectorAll(".chat-chips button").forEach(function (b) {
      b.addEventListener("click", function () {
        const chipIndex = parseInt(b.getAttribute("data-chip"), 10);
        const map = ["name", "skills", "exp", "contact"];
        sendChip(chipIndex, map[chipIndex]);
      });
    });
  }

  function sendChip(index, intent) {
    const chips = carr("chat.chips") || [];
    if (chips[index]) addUser(chips[index]);
    if (intent) {
      const bubble = addBot("");
      const reply = answerFor(intent);
      setTimeout(function () {
        bubble.textContent = "";
        bubble.insertAdjacentHTML("afterbegin", reply);
        ui.body.scrollTop = ui.body.scrollHeight;
      }, 600);
    }
  }

  function translate() {
    const panel = ui.panel;
    if (!panel) return;
    panel.setAttribute("aria-label", esc(ck("chat.title")));
    const h3 = panel.querySelector(".chat-head h3");
    if (h3) h3.textContent = ck("chat.title");
    const st = panel.querySelector(".chat-head .status");
    if (st) st.textContent = ck("chat.subtitle");
    ui.text.placeholder = ck("chat.placeholder");
    ui.text.setAttribute("aria-label", ck("chat.placeholder"));
    if (ui.lang) {
      ui.lang.setAttribute("aria-label", ck("chat.langAria"));
      if (ui.lang.value !== chatLang) ui.lang.value = chatLang;
    }
    const lbl = panel.querySelector(".chat-lang-label");
    if (lbl) lbl.textContent = ck("chat.langLabel");
    const wrap = panel.querySelector(".chat-chips");
    if (wrap) {
      (carr("chat.chips") || []).forEach(function (c, i) {
        if (wrap.children[i]) wrap.children[i].textContent = c;
      });
    }
    ui.body.innerHTML = "";
    const greet = addBot(ck("chat.greet"));
    (function () {
      setTimeout(function () {
        greet.textContent = "";
        greet.insertAdjacentHTML("afterbegin", esc(ck("chat.greet")));
      }, 60);
    })();
  }

  function init() {
    const root = document.getElementById("chat-root");
    if (!root) return;
    root.innerHTML =
      '<button type="button" class="chat-fab" id="chat-fab" aria-expanded="false" aria-label="Portfolio assistant">' +
      '<span class="online-dot"></span>' + chatIcon() + "</button>" +
      '<div class="chat-panel" id="chat-panel" role="dialog" aria-hidden="true">' +
      '<div class="chat-head">' +
      '<span class="chat-head__avatar" aria-hidden="true">ED</span>' +
      "<div><h3></h3><span class='status'></span></div>" +
      '<div class="chat-head__side">' +
      '<button type="button" class="icon-btn chat-head__close" id="chat-close" aria-label="' + esc(ck("projects.modal.close")) + '">' + icon("close") + "</button>" +
      "</div>" +
      "</div>" +
      '<div class="chat-lang-row">' +
      '<span class="chat-lang-label" id="chat-lang-label"></span>' +
      '<label class="chat-lang-wrap"><span class="chat-lang-flag" aria-hidden="true">' + icon("globe") + "</span>" +
      '<select class="chat-lang" id="chat-lang" aria-label="Chat language">' +
      CHAT_LANGS.map(function (c) {
        return '<option value="' + c + '">' + esc(CHAT_NATIVE[c] || c) + " (" + c + ")</option>";
      }).join("") +
      "</select></label>" +
      "</div>" +
      '<div class="chat-body" id="chat-body"></div>' +
      '<div class="chat-chips"></div>' +
      '<form class="chat-input" id="chat-form">' +
      '<input type="text" id="chat-text" autocomplete="off" aria-label="">' +
      '<button type="submit" aria-label="' + esc(t("contact.form.send")) + '">' + icon("send") + "</button>" +
      "</form></div>";

    ui = {
      fab: $("#chat-fab"),
      panel: $("#chat-panel"),
      body: $("#chat-body"),
      text: $("#chat-text"),
      close: $("#chat-close"),
      lang: $("#chat-lang"),
    };
    bind();
    translate();
    document.addEventListener("ed:langchange", translate);
  }

  init();

  window.EDChat = {
    open: function () { openPanel(true); },
    send: send,
    setLang: setChatLang,
    lang: function () { return chatLang; },
  };

  /* Boot the app — all modules have now registered. */
  window.EDApp.init();
})();