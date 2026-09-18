/* ============================================================
   Chat Brain — offline question-understanding engine.
   Understands free-typed questions (multi-language) and answers
   from the REAL portfolio data (ED_DATA + i18n), instead of
   canned one-liners.

   Loaded AFTER data.js, i18n.js, chat-i1..i3.js and BEFORE
   chat.js. Exposes window.EDBrain.
   ============================================================ */

/* global ED_DATA, ED_I18N, CHAT_INTENTS */

(function () {
  "use strict";

  const CJK = /[\u3040-\u30ff\u4e00-\u9fff]/;
  const AR = /[\u0600-\u06ff]/;
  const CYR = /[\u0400-\u04ff\u0500-\u052f]/;

  /* ---------- helpers ---------- */

  function pick(l) {
    const set = (window.ED_I18N && ED_I18N.supported) || [];
    return set.indexOf(l) !== -1 ? l : (window.ED_I18N && ED_I18N.lang) || "en";
  }

  function langReady(l) {
    try {
      if (window.ED_I18N && ED_I18N.prepare) ED_I18N.prepare(l);
    } catch (e) { /* ignore */ }
  }

  function G(l, path) {
    try { return window.ED_I18N ? ED_I18N.gt(l, path) : path; } catch (e) { return ""; }
  }

  /* resolve a data value: "@key.path" is translated via i18n */
  function TR(l, v) {
    if (typeof v === "string" && v.charAt(0) === "@") {
      const r = G(l, v.slice(1));
      return typeof r === "string" ? r : "";
    }
    return v == null ? "" : String(v);
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function tags(items) {
    return (items || []).filter(Boolean).map(function (x) { return '<span class="tag">' + esc(x) + "</span>"; }).join(" ");
  }

  function safe(run) {
    try { return run(); } catch (e) { return ""; }
  }

  /* ---------- normalization ---------- */

  const ACCENT = {
    á: "a", à: "a", â: "a", ã: "a", ä: "a", å: "a",
    é: "e", è: "e", ê: "e", ë: "e",
    í: "i", ì: "i", î: "i", ï: "i",
    ó: "o", ò: "o", ô: "o", õ: "o", ö: "o", ø: "o",
    ú: "u", ù: "u", û: "u", ü: "u",
    ç: "c", ñ: "n", ý: "y", ÿ: "y",
    œ: "oe", æ: "ae", ß: "ss",
  };

  function deaccent(t) {
    return t.replace(/[áàâãäåéèêëíìîïóòôõöøúùûüçñýÿœæß]/g, function (m) { return ACCENT[m] || m; });
  }

  function norm(s) {
    let t = String(s || "").toLowerCase();
    if (AR.test(t)) {
      t = t.replace(/[\u0610-\u061a\u064b-\u0652\u0670]/g, "");   /* diacritics */
      t = t.replace(/[\u0622\u0623\u0625\u0671]/g, "\u0627");      /* alef variants → ا */
      t = t.replace(/\u0629/g, "\u0647");                          /* ة → ه */
      t = t.replace(/\u0649/g, "\u064a").replace(/\u0640/g, " ");  /* ى → ي */
    } else {
      t = deaccent(t);
    }
    t = t.replace(/[^a-z0-9\u0600-\u06ff\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af\u0400-\u04ff\u0500-\u052f\s]/g, " ");
    return t.replace(/\s+/g, " ").trim();
  }

  const STOP = {
    en: ("and the is are a an do does did can could what how where who when which why with for to of at on in from by me you your my his her he she it they we i be have has had about tell please will would should may might not no yes more some any this that these those if then than so as").split(" "),
    ar: ("هو هي انا انت انتي انت انتم نحن هذا هذه ذلك تلك و في من الى الي عن على مع لا ما لم لن هل الذي التي الذين اللواتي ال او عند ثم كان كانت ب اي ايه مين اللي بتاع بتاعة").split(" "),
  };

  const AR_ARTICLE = /^ال/;

  function tokens(q, l) {
    const t = norm(q);
    if (!t || CJK.test(t)) return [];
    const stop = STOP[l] || STOP.en;
    return t.split(" ").filter(function (w) {
      return w.length > 1 && stop.indexOf(w) === -1;
    }).map(function (w) {
      if (AR.test(w)) {
        if (w.length > 4 && /^[وفب]/.test(w)) w = w.slice(1);
        if (w.length > 4 && AR_ARTICLE.test(w)) w = w.slice(2);
        return w;
      }
      if (/[a-z0-9]/.test(w)) {
        if (w.length > 4 && w.slice(-3) === "ies") w = w.slice(0, -3) + "y";
        else if (w.length > 4 && w.slice(-2) === "es") w = w.slice(0, -2);
        else if (w.length > 3 && w.slice(-1) === "s" && w.slice(-2) !== "ss") w = w.slice(0, -1);
        else if (w.length > 3 && w.slice(-2) === "ed") w = w.slice(0, -2);
      }
      return w;
    });
  }

  function bigrams(s) {
    const arr = [];
    for (let i = 0; i < s.length - 1; i++) arr.push(s.charAt(i) + s.charAt(i + 1));
    return arr;
  }

  /* Levenshtein distance (small strings) */
  function lev(a, b) {
    const m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    const d = [new Array(n + 1)];
    for (let j = 0; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++) {
      d[i] = [i];
      for (let j = 1; j <= n; j++) {
        const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      }
    }
    return d[m][n];
  }

  /* ---------- intent scoring ---------- */

  const ORDER = { name: 0, role: 1, why: 2, services: 3, contact: 4, location: 5, stack: 6, depi: 7, cv: 8, github: 9, linkedin: 10, projects: 11, exp: 12, edu: 13, skills: 14, fee: 15 };

  /* extra synonyms merged on top of CHAT_INTENTS at scoring time */
  const EXTRA = {
    name: { en: ["tell about", "get to know", "introduction"], ar: ["تعرف على", "مقدمه", "عرفني", "المقدمة"] },
    role: { en: ["full stack developer", "front end", "back end", "developer", "job", "specialized", "specialize", "specializes", "specialization", "focus"], ar: ["مطور", "مطور ويب", "فول ستاك", "شغلته", "بيشتغل"] },
    skills: { en: ["knows", "know how", "can code", "programming languages", "can he", "can you", "code in", "write in", "technologies he"], ar: ["يعرف", "يعمل ب", "بيشتغل ب", "الكود", "برمجة", "لغات البرمجة", "يتقن", "تقنياته", "مهاراته"] },
    projects: { en: ["built some", "made any", "his work"], ar: ["عمل مشروع", "بنى مشاريع", "مشاريعه", "أعماله"] },
    exp: { en: ["history", "depi training", "career path"], ar: ["تاريخه", "مسيرته", "خبرته", "خبره", "شغله"] },
    edu: { en: ["studied", "graduated", "school", "academic"], ar: ["متعلم", "تخرج", "دراسه", "تعليمه"] },
    contact: { en: ["reach him", "his email", "his phone", "call him", "get in touch", "talk to"], ar: ["ايميله", "رقمه", "موبايله", "كلمه", "اتواصل"] },
    location: { en: ["living", "address", "based"], ar: ["فين", "مقيم", "عنوانه"] },
    github: { en: ["source"], ar: ["السورس"] },
  };

  function intentTokenSet(list, l) {
    const set = [];
    (list || []).forEach(function (ph) {
      tokens(ph, l).forEach(function (t) { if (set.indexOf(t) === -1) set.push(t); });
    });
    return set;
  }

  /* are the phrase tokens a contiguous subsequence of the query tokens? */
  function phraseInTokens(pt, qt) {
    if (!pt.length || !qt.length || pt.length > qt.length) return false;
    outer:
    for (let i = 0; i <= qt.length - pt.length; i++) {
      for (let j = 0; j < pt.length; j++) {
        if (pt[j] !== qt[i + j]) continue outer;
      }
      return true;
    }
    return false;
  }

  /* true when a question token loosely matches a keyword token */
  function fuzz(q, p, arabic) {
    if (q === p) return true;
    if (q.length < 4 || p.length < 4) return false;
    if (Math.abs(q.length - p.length) > 2) return false;
    let pre = 0;
    while (pre < q.length && pre < p.length && q.charCodeAt(pre) === p.charCodeAt(pre)) pre++;
    const d = lev(q, p);
    if (arabic) return d <= 1 || (d <= 2 && pre >= 3);
    if (d <= 1) return pre >= 2 || Math.max(q.length, p.length) >= 6;
    if (d <= 2) return Math.max(q.length, p.length) >= 6;
    /* long shared prefix = same root family (e.g. contattare / contatto) */
    return d <= 4 && pre >= 4;
  }

  /* proper-name tokens only make the "name" intent win when an actual
     name phrase was typed — keep them out of plain token scoring */
  const BAN_PROPER = ["eslam", "اسلام", "داود", "داوود"];

  function scoreIntent(l, n) {
    if (!n) return null;
    const kw = (window.CHAT_INTENTS && window.CHAT_INTENTS[l]) || {};
    const enkw = l === "en" ? kw : (window.CHAT_INTENTS && window.CHAT_INTENTS.en) || {};
    const cjk = CJK.test(n);

    const all = {}; /* de-duplicate keyword lists + extra synonyms */
    Object.keys(kw).forEach(function (id) { all[id] = (kw[id] || []).slice(); });
    Object.keys(enkw).forEach(function (id) {
      if (!all[id]) all[id] = [];
      (enkw[id] || []).forEach(function (p) { if (all[id].indexOf(p) === -1) all[id].push(p); });
    });
    Object.keys(EXTRA).forEach(function (id) {
      if (!all[id]) all[id] = [];
      ((EXTRA[id] && EXTRA[id][l]) || []).forEach(function (p) { if (all[id].indexOf(p) === -1) all[id].push(p); });
      if (l !== "en") {
        ((EXTRA[id] && EXTRA[id].en) || []).forEach(function (p) { if (all[id].indexOf(p) === -1) all[id].push(p); });
      }
    });

    let best = null;
    const scores = {};

    function consider(id, list) {
      if (!list || !list.length) return;
      let score = 0;
      const tset = intentTokenSet(list, l);
      const arabicWords = AR.test(n);

      if (cjk) {
        const qb = {};
        bigrams(n).forEach(function (b) { qb[b] = true; });
        for (let i = 0; i < list.length; i++) {
          const np = norm(list[i]);
          if (!np) continue;
          if (n.indexOf(np) !== -1) { score += 1.6; continue; }
          const nb = bigrams(np);
          if (!nb.length) continue;
          let inter = 0;
          nb.forEach(function (b) { if (qb[b]) inter++; });
          const ratio = inter / nb.length;
          if (ratio > 0.3) score += 1 + ratio;
        }
        if (score > 0 && (!best || score > best.score || (score === best.score && (ORDER[id] || 99) < (ORDER[best.intent] || 99)))) {
          scores[id] = score;
          best = { intent: id, score: score };
        }
        return;
      }

      const qt = tokens(n, l);
      let qtIdx = 0;
      const used = [];

      /* phrase-level matching */
      for (let i = 0; i < list.length; i++) {
        const pt = tokens(list[i], l);
        if (!pt.length) continue;
        const np = norm(list[i]);
        let matched;
        if (id === "name") {
          /* name intent requires the full phrase — a bare "eslam" token
             alone must not trigger "who is" answers */
          matched = !!(np && n.indexOf(np) !== -1);
        } else if (arabicWords) {
          /* Arabic words never glue with spaces but the definite article
             ("ال") does — compare token-to-token to avoid false substrings */
          matched = phraseInTokens(pt, qt);
        } else {
          /* Latin/Cyrillic keeps word boundaries — a plain substring of
             the full normalized phrase is the reliable signal */
          matched = !!(np && n.indexOf(np) !== -1);
        }
        if (matched) {
          score += 1 + Math.min(1, pt.length * 0.15);
          pt.forEach(function (t) { if (used.indexOf(t) === -1) used.push(t); });
        }
      }

      /* token-level overlap (one signal per query token per intent) */
      qt.forEach(function (q) {
        if (!q || q.length < 2) return;
        let hit = false;
        for (let i = 0; i < tset.length; i++) {
          if (tset[i] === q) { hit = true; break; }
        }
        if (!hit) {
          for (let i = 0; i < tset.length; i++) {
            if (fuzz(q, tset[i], arabicWords)) { hit = true; break; }
          }
        }
        if (!hit) return;
        /* proper-name tokens never carry intent weight on their own */
        if (BAN_PROPER.indexOf(q) !== -1) return;
        if (used.indexOf(q) !== -1) return;
        used.push(q);
        score += q.length >= 5 ? 1 : 0.8;
      });

      if (score > 0 && (!best || score > best.score || (score === best.score && (ORDER[id] || 99) < (ORDER[best.intent] || 99)))) {
        scores[id] = score;
        best = { intent: id, score: score };
      }
    }

    Object.keys(all).forEach(function (id) { consider(id, all[id]); });

    if (best && best.score < 1) best = null;
    if (best) best.scores = scores;
    return best;
  }

  /* ---------- literal technology detection ---------- */

  const LITERAL = [
    { d: "C#", latin: /\bc#|\bc sharp\b/, ar: ["سي شارب", "سى شارب", "سي شاب", "سيشاب"] },
    { d: "ASP.NET Core", latin: /\bas[pp]\.?\s?net\b/, ar: ["أسب دوت نت", "اسب دوت نت", "اسبرينغ"] },
    { d: ".NET", latin: /\b\.net\b|\bnet\b/, ar: ["دوت نت", "دوتنت"] },
    { d: "Web API", latin: /\bweb api\b/, ar: ["ويب اى بى اى", "ويبابي", "ويب بي اي"] },
    { d: "Entity Framework Core", latin: /\bentity framework\b/, ar: ["انتى فريم"] },
    { d: "SQL Server", latin: /\bsql server\b/, ar: ["اس كيو ال سيرفر"] },
    { d: "SQL", latin: /\bsql\b/, ar: ["اس كيو ال"] },
    { d: "Python", latin: /\bpython\b/, ar: ["بايثون", "بيثون"] },
    { d: "Dart", latin: /\bdart\b/, ar: ["دارت"] },
    { d: "JavaScript", latin: /\bjavascript\b|\bjava\s?script\b/, ar: ["جافاسكربت", "جافا سكريبت"] },
    { d: "HTML", latin: /\bhtml\b/, ar: ["اتش تي ام ال"] },
    { d: "CSS", latin: /\bcss\b/, ar: ["سي اس اس"] },
    { d: "C++", latin: /\bc\+\+/, ar: ["سي بلاس", "سي بلاس بلاس"] },
    { d: "Flutter", latin: /\bflutter\b/, ar: ["فلاتر"] },
    { d: "Git", latin: /\bgit\b/, ar: ["جيت"] },
    { d: "OOP", latin: /\bopp\b|\boop\b/, ar: ["كائنى", "كائنيه", "كائنات", "برمجة كائنية"] },
  ];

  function literalHits(raw) {
    const r = String(raw || "").toLowerCase();
    const sk = (window.ED_DATA && ED_DATA.skills) || {};
    const featured = (sk.featured || []).map(function (x) { return String(x).toLowerCase(); });
    const languages = (sk.languages || []).map(function (x) { return String(x).toLowerCase(); });
    const backend = (sk.backend || []).map(function (x) { return String(x).toLowerCase(); });
    const dataList = (sk.data || []).map(function (x) { return String(x).toLowerCase(); });
    const seen = {};
    let out = [];
    LITERAL.forEach(function (it) {
      if (seen[it.d]) return;
      let matched = false;
      if (it.latin && it.latin.test(r)) matched = true;
      if (!matched && (it.ar || []).some(function (w) { return r.indexOf(w) !== -1; })) matched = true;
      if (!matched) return;
      const low = it.d.toLowerCase();
      let group = null;
      if (featured.indexOf(low) !== -1 || it.d === "SQL Server") group = "featured";
      else if (languages.indexOf(low) !== -1) group = "languages";
      else if (backend.indexOf(low) !== -1) group = "backend";
      else if (dataList.indexOf(low) !== -1) group = "data";
      seen[it.d] = true;
      out.push({ d: it.d, group: group });
    });
    /* ".NET" is implied by "ASP.NET Core" — drop the redundant generic hit */
    if (seen["ASP.NET Core"] && seen[".NET"]) {
      out = out.filter(function (x) { return x.d !== ".NET"; });
    }
    return out;
  }

  /* ---------- answer builders (data-driven) ---------- */

  function P() { return (window.ED_DATA && ED_DATA.profile) || {}; }

  function answerName(l) {
    const p = P();
    return safe(function () {
      return "<b>" + esc(p.name || "ESLAM DAWOUD") + "</b><br>" +
        "Full name: " + esc(TR(l, p.fullName)) + ".<br>" +
        "Role: " + esc(TR(l, p.role)) + ".<br>" +
        "Specialization: " + esc(TR(l, p.special)) + ".<br>" +
        "Based in " + esc(TR(l, p.location)) + ". Ask about skills, projects, experience, or contact.";
    });
  }

  function answerRole(l) {
    const p = P();
    const focus = G(l, "profile.focus");
    const arr = Array.isArray(focus) ? focus.join(", ") : "";
    return safe(function () {
      return "<b>" + esc(TR(l, p.role)) + "</b>" +
        (arr ? "<br>Focus: " + esc(arr) + "." : "") +
        "<br>Specialization: " + esc(TR(l, p.special));
    });
  }

  function resolveList(l, items) {
    return (items || []).map(function (x) { return TR(l, x); }).filter(Boolean);
  }

  function answerSkills(l) {
    const sk = (window.ED_DATA && ED_DATA.skills) || {};
    return safe(function () {
      let h = "<b>" + esc(G(l, "skills.title")) + "</b><br><br>";
      const feats = resolveList(l, sk.featured);
      if (feats.length) {
        h += esc(G(l, "skills.featuredTitle")) + " (" + esc(G(l, "skills.featuredNote")) + "):<br>" + tags(feats) + "<br><br>";
      }
      const langs = resolveList(l, sk.languages);
      if (langs.length) h += esc(G(l, "skills.g1")) + ":<br>" + tags(langs) + "<br><br>";
      const bk = resolveList(l, sk.backend);
      if (bk.length) h += esc(G(l, "skills.g2")) + ":<br>" + tags(bk) + "<br><br>";
      const dt = resolveList(l, sk.data);
      if (dt.length) h += esc(G(l, "skills.g3")) + ":<br>" + tags(dt) + "<br><br>";
      const core = resolveList(l, sk.core);
      if (core.length) h += esc(G(l, "skills.g4")) + ":<br>" + tags(core);
      return h;
    });
  }

  function answerSkillsTech(l, hits) {
    const sk = (window.ED_DATA && ED_DATA.skills) || {};
    const featured = sk.featured || [];
    return safe(function () {
      const names = hits.map(function (x) { return x.d; }).join(" and ");
      let lead = "<b>Yes — Eslam knows/uses:</b> " + names + ".<br>";
      const lines = hits.map(function (h) {
        let where = null;
        if (h.group === "languages") where = G(l, "skills.g1");
        else if (h.group === "backend") where = G(l, "skills.g2");
        else if (h.group === "data") where = G(l, "skills.g3");
        else if (h.group === "featured") where = G(l, "skills.featuredNote");
        return "<b>" + esc(h.d) + "</b>" + (where ? " — part of " + esc(where) : "");
      });
      lead += lines.join("<br>") + "<br><br>";
      if (featured.length) lead += esc(G(l, "skills.featuredTitle")) + ":<br>" + tags(featured);
      return lead;
    });
  }

  function answerStack(l) {
    const layers = G(l, "stack.layers");
    return safe(function () {
      let h = "<b>" + esc(G(l, "stack.title")) + "</b><br>";
      const labels = (Array.isArray(layers) ? layers : []).map(function (x) { return x.label; }).join(" → ");
      if (labels) h += "<br>" + esc(labels) + "<br><b>" + esc(G(l, "stack.caption")) + ".</b><br><br>";
      const notes = (Array.isArray(layers) ? layers : []).slice(0, 4).map(function (x) {
        return "• <b>" + esc(x.label) + "</b>: " + esc(x.desc);
      });
      if (notes.length) h += notes.join("<br>") + "<br>";
      h += "<br>Built with C#, .NET, ASP.NET Core, Web API, Entity Framework Core, and SQL Server.";
      return h;
    });
  }

  function answerProjects(l) {
    const pr = (window.ED_DATA && ED_DATA.projects) || [];
    return safe(function () {
      if (!pr.length) return "";
      let h = "<b>" + esc(G(l, "projects.title")) + "</b><br><br>";
      pr.forEach(function (p, i) {
        const name = TR(l, p.name);
        const type = TR(l, p.type);
        const sum = TR(l, p.summary);
        const tech = (p.tech || []).slice();
        h += "<b>" + (i + 1) + ". " + esc(name) + "</b>" + (type ? " — " + esc(type) : "") + "<br>" +
          (sum ? esc(sum) + "<br>" : "") +
          (tech.length ? "Tech: " + tags(tech) + "<br><br>" : "<br>");
      });
      h += esc(G(l, "projects.more.tag")) + " — " + esc(G(l, "projects.more.desc"));
      return h;
    });
  }

  function answerExp(l) {
    const ex = (window.ED_DATA && ED_DATA.experience) || [];
    return safe(function () {
      if (!ex.length) return "";
      const e = ex[0];
      let h = "<b>" + esc(TR(l, e.role)) + "</b> — " + esc(TR(l, e.company)) + "<br>" +
        esc(TR(l, e.period)) + " · " + esc(TR(l, e.location)) + "<br><br>";
      (e.desc || []).forEach(function (d) {
        const s = TR(l, d);
        if (s) h += "• " + esc(s) + "<br>";
      });
      if (e.chips && e.chips.length) h += "<br>Tech: " + tags(e.chips);
      return h;
    });
  }

  function answerEdu(l) {
    const ed = (window.ED_DATA && ED_DATA.education) || [];
    return safe(function () {
      if (!ed.length) return "";
      const e = ed[0];
      return "<b>" + esc(TR(l, e.degree)) + "</b><br>" + esc(TR(l, e.institution)) + "<br>" +
        esc(TR(l, e.period)) + " · " + esc(TR(l, e.location));
    });
  }

  function answerDepi(l) {
    const d = (window.ED_DATA && ED_DATA.depi) || {};
    return safe(function () {
      if (!d.company) return "";
      let h = "<b>" + esc(TR(l, d.role)) + "</b> — " + esc(TR(l, d.company)) + "<br>" + esc(TR(l, d.period)) + "<br><br>";
      const steps = G(l, "depi.steps");
      if (Array.isArray(steps)) {
        steps.forEach(function (s, i) {
          const tx = (s && s.title) || "";
          if (tx) h += (i + 1) + ". " + esc(tx) + "<br>";
        });
        h += "<br>";
      }
      if (d.tech && d.tech.length) h += "Tech: " + tags(d.tech);
      return h;
    });
  }

  function answerContact(l) {
    const p = P();
    return safe(function () {
      let h = "<b>" + esc(G(l, "profile.title")) + "</b><br>";
      h += "Email: <a href='mailto:" + esc(p.email) + "'>" + esc(p.email) + "</a><br>";
      h += "Phone: <a href='tel:" + esc(p.phoneTel) + "'>" + esc(p.phoneDisplay) + "</a><br>";
      h += "Location: " + esc(TR(l, p.location)) + "<br>";
      h += "<br><div class='chat-msg__links'>" +
        "<a href='mailto:" + esc(p.email) + "'>" + esc(G(l, "contact.details.email")) + "</a>" +
        "<a href='" + esc(p.linkedin) + "' target='_blank' rel='noopener noreferrer'>LinkedIn</a>" +
        "<a href='" + esc(p.github) + "' target='_blank' rel='noopener noreferrer'>GitHub</a>" +
        "</div>";
      return h;
    });
  }

  function answerLocation(l) {
    const p = P();
    return safe(function () {
      return "<b>" + esc(TR(l, p.location)) + "</b><br>" +
        "Phone: <a href='tel:" + esc(p.phoneTel) + "'>" + esc(p.phoneDisplay) + "</a><br>" +
        esc(G(l, "profile.status"));
    });
  }

  function answerCv(l) {
    const p = P();
    return safe(function () {
      return "CV ready to download:<br><a href='" + esc(p.cv) + "' target='_blank' rel='noopener noreferrer' download>Download CV (PDF)</a>";
    });
  }

  function answerGithub(l) {
    const p = P();
    return safe(function () {
      return "<b>GitHub</b> — " + esc(p.githubUser) + "<br>" +
        "<a href='" + esc(p.github) + "' target='_blank' rel='noopener noreferrer'>" + esc(p.github) + "</a>" +
        "<br><br>" + esc(G(l, "github.empty"));
    });
  }

  function answerLinkedin(l) {
    const p = P();
    return safe(function () {
      return "<b>LinkedIn</b><br><a href='" + esc(p.linkedin) + "' target='_blank' rel='noopener noreferrer'>" + esc(p.linkedin) + "</a>";
    });
  }

  function answerServices(l) {
    const items = G(l, "services.items");
    return safe(function () {
      let h = "<b>" + esc(G(l, "services.title")) + "</b><br><br>";
      if (Array.isArray(items)) {
        items.forEach(function (it) {
          if (it && it.title) h += "• <b>" + esc(it.title) + "</b>" + (it.desc ? " — " + esc(it.desc) : "") + "<br>";
        });
      }
      h += "<br>" + esc(G(l, "services.note"));
      return h;
    });
  }

  function answerWhy(l) {
    const items = G(l, "why.items");
    return safe(function () {
      let h = "<b>" + esc(G(l, "why.title")) + "</b><br><br>";
      if (items && typeof items === "object") {
        let n = 0;
        for (const k in items) {
          if (items[k] && items[k].title) {
            h += "• <b>" + esc(items[k].title) + "</b>" + (items[k].desc ? " — " + esc(items[k].desc) : "") + "<br>";
            n++;
            if (n >= 5) break;
          }
        }
      }
      return h;
    });
  }

  function answerFee(l) {
    const s = G(l, "chat.a.fee");
    return typeof s === "string" && s && s.indexOf("chat.a.fee") === -1 ? s : G("en", "chat.a.fee");
  }

  function answerFallback(l) {
    const s = G(l, "chat.a.fallback") || G(l, "chat.fallback");
    return typeof s === "string" ? s : "";
  }

  const BUILDERS = {
    name: answerName, role: answerRole, skills: answerSkills, stack: answerStack,
    projects: answerProjects, exp: answerExp, edu: answerEdu, depi: answerDepi,
    contact: answerContact, location: answerLocation, cv: answerCv,
    github: answerGithub, linkedin: answerLinkedin, services: answerServices,
    why: answerWhy, fee: answerFee,
  };

  function answer(intent, l) {
    const L = pick(l);
    langReady(L);
    if (intent === "fallback") return answerFallback(L);
    const fn = BUILDERS[intent];
    if (!fn) return "";
    const r = safe(function () { return fn(L); });
    return r || answerFallback(L);
  }

  /* ---------- top-level ---------- */

  function reply(q, l) {
    const parsed = String(q || "").trim();
    /* auto-use Arabic intents when the question is typed in Arabic */
    const effLang = AR.test(parsed) ? "ar" : pick(l);
    const L = effLang;
    langReady(L);
    const raw = parsed;
    const n = norm(raw);
    if (!n) return null;
    const hits = literalHits(raw);
    const it = scoreIntent(L, n);
    if (hits.length) return answerSkillsTech(L, hits);
    if (it) return answer(it.intent, L);
    return null;
  }

  function search(q, l) {
    const parsed = String(q || "").trim();
    const L = AR.test(parsed) ? "ar" : pick(l);
    return scoreIntent(L, norm(parsed));
  }

  window.EDBrain = {
    reply: reply,
    answer: answer,
    search: search,
    literals: literalHits,
    norm: norm,
    _debug: function (q, l) {
      const parsed = String(q || "").trim();
      const L = AR.test(parsed) ? "ar" : pick(l);
      return { lang: L, it: scoreIntent(L, norm(parsed)), lit: literalHits(parsed) };
    },
  };
})();