# ESLAM DAWOUD — Portfolio

Personal portfolio for **Eslam Mohamed Fathy Dawoud**, Software Engineer / Full-Stack Developer. Pure static HTML + CSS + vanilla JavaScript (no build step). Works fully offline except for Google Fonts and the live GitHub repo feed.

## Features

- **10 languages** with a header switcher: Arabic (RTL), English, French, German, Spanish, Italian, Portuguese, Russian, Chinese, Japanese. Selection persists in `localStorage` (`ed-lang`).
- **Dark / light mode**, persisted in `localStorage` (`ed-theme`), respects `prefers-color-scheme` on first visit.
- **In-page AI assistant** (chat bubble) that answers questions about Eslam. The chat has its **own language selector** (10 languages) independent of the site language — switched from the `chat-lang` dropdown in the panel header and persisted in `localStorage` (`ed-chat-lang`). Call `window.EDChat.setLang("ar")` programmatically. Questions are understood by an offline **chat brain** (`js/chat-brain.js`) that scores intents across the question's wording (multi-lingual synonyms, fuzzy token matching, Arabic morphology) and looks up the **real CV/portfolio data** (`ED_DATA` + i18n) to build answers — e.g. "does he know Python?", "ما هو ايميله؟", "ايه المشاريع؟". Mentioning any technology name (C#, .NET, Python, SQL Server…) is detected directly.
- **Interactive terminal** section — type `help` to get started. Commands: `about`, `skills`, `stack`, `projects`, `experience`, `education`, `depi`, `contact`, `links`, `lang <code>`, `theme <dark|light>`, `clear`. Up/Down arrows recall history; `clear` or the `clear` button wipes the screen.
- **Live GitHub feed** — pulls Eslam's public repos from the GitHub API (loading / empty / error + retry states, 12-repo cache).
- **Project cards with modal details**, filter tabs, services and "why me" sections.
- **Contact form** with validation that opens the visitor's email client via `mailto:` (no backend required).
- Accessible: skip link, ARIA labels, keyboard-navigable menus, focus styles, reduced-motion support.

## Project structure

```
index.html            page skeleton + SEO/OG meta + script order
css/styles.css        full design system
js/
  data.js             factual content (name, links, projects, skills, etc.) + edT() token loader
  i18n.js             ED_I18N: 10-locale dictionary builder (en default, other locales deep-merged)
  core.js             EDApp namespace: helpers ($/$$/t/tArr/token/icon), theme, lang,
                      toast, reveal animations, renderer registry, renderAll, init
  header.js           nav + language dropdown + mobile menu + scroll spy + theme toggle
  sections.js         hero, about, skills, stack (interactive), experience, education, DEPI roadmap
  projects.js         projects + filters + modal + services + why
  github.js           live repo feed + LinkedIn card
  contact.js          contact form (mailto bridge) + footer
  terminal.js         interactive command-line terminal (section)
  chat.js             assistant logic (KB mode) + boot call EDApp.init()
  chat-i1.js          chat intent keywords: en, ar, fr, de
  chat-i2.js          chat intent keywords: es, it, pt
  chat-i3.js          chat intent keywords: ru, zh, ja
  chat-brain.js       offline question-understanding engine (intent scoring + data answers)
assets/
  favicon.svg
  og-image.png             1200×630 social share image
  ESLAM_DAWOUD_CV.pdf      CV (PLACEHOLDER — see below)
```

Keep script tags in `index.html` in this order: `data.js` → `i18n.js` → `core.js` → `header.js` → `sections.js` → `projects.js` → `github.js` → `contact.js` → `terminal.js` → `chat-i1.js` → `chat-i2.js` → `chat-i3.js` → `chat-brain.js` → `chat.js`. The app boots at the end of `chat.js` via `window.EDApp.init()`.

All content is data-driven. Text values starting with `@` in `data.js` resolve through `i18n.js` via `edT()`; plain strings stay as-is.

## Replace the placeholder CV

`assets/ESLAM_DAWOUD_CV.pdf` is a minimal placeholder. Replace it with the real resume PDF, keeping the filename `ESLAM_DAWOUD_CV.pdf` (or update `profile.cv` in `js/data.js`). There is a "Download CV" button in the About section that links to this file.

## Connect a real email service

The contact form assembles a `mailto:` link on valid submit (subject + body pre-filled) and shows a confirmation toast — it does not send mail by itself and never fakes a "sent" message.

To receive messages directly, replace the submit handler in `js/contact.js` with an endpoint call, e.g. a free service:

- **Formspree**: POST the form JSON to `https://formspree.io/f/<your-id>`, then on success show `toast.mailto`.
- **EmailJS**: call their SDK with the form payload.
- **Netlify Forms / Vercel** serverless functions if you deploy there.

Keep the `mailto:` bridge as a graceful fallback so the form always works.

## Upgrade the chat assistant to a real LLM API

By default the assistant is offline-knowledge-base only (`mode: "kb"`). To use a real model, set `window.CHAT_CONFIG` **before** `chat.js` loads (for example in a small script tag above it in `index.html`):

```html
<script>
  window.CHAT_CONFIG = {
    mode: "api",
    apiUrl: "https://api.openai.com/v1/chat/completions",
    apiKey: "sk-...",
    model: "gpt-4o-mini",
    systemPrompt: "You are the assistant for ESLAM DAWOUD's portfolio. Answer only with factual information about him; if unsure, say so."
  };
</script>
```

Fallback KB replies are always used when the API call fails or befor the config is set. Never commit a real `apiKey`; load it from an environment/secret at deploy time.

## Deploy

This is a static site — deploy `index.html`, `css/`, `js/`, `assets/` as-is. Good options: GitHub Pages, Netlify, Vercel, Cloudflare Pages. Update the `og:url` in `index.html` to the live URL once published.

## Content governance

All facts (name, role, education, experience, projects, links, contact) come from the user. No details have been invented — if you change content, verify it stays factual.