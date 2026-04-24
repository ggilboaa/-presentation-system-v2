import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import { fileURLToPath } from "url";

// ─────────────────────────────────────────────────────────────
// Skills + config loading (happens once at cold start).
// If any file is missing or empty, fail immediately — no fallback.
// ─────────────────────────────────────────────────────────────
function loadFile(rel) {
  const p = fileURLToPath(new URL(rel, import.meta.url));
  const t = fs.readFileSync(p, "utf8").trim();
  if (!t) throw new Error(`Required file is empty: ${rel}`);
  return t;
}

const SKILL_CONTENT = loadFile("../skills/slides-content/prompt.md");
const SKILL_DESIGN  = loadFile("../skills/slides-design/prompt.md");
const SKILL_BUILD   = loadFile("../skills/slides-build/prompt.md");
const SKILL_EXPORT  = loadFile("../skills/slides-export/prompt.md");
const CONFIG        = loadFile("../config.md");

// Expose loaded skills for debugging/introspection.
export const loadedSkills = {
  content: SKILL_CONTENT.length,
  design:  SKILL_DESIGN.length,
  build:   SKILL_BUILD.length,
  export:  SKILL_EXPORT.length,
  config:  CONFIG.length
};

// ─────────────────────────────────────────────────────────────
// Asset paths (actual filenames on disk, no dashes)
// ─────────────────────────────────────────────────────────────
const BACKGROUNDS = {
  blue:  { full: "/assets/backgrounds/bgfullblue.jpg",  frame: "/assets/backgrounds/bgframeblue.jpg"  },
  green: { full: "/assets/backgrounds/bgfullgreen.jpg", frame: "/assets/backgrounds/bgframegreen.jpg" }
};

function pickTheme(theme) {
  return String(theme || "").toLowerCase() === "green" ? "green" : "blue";
}

// ASCII kebab-case slug for filenames (export skill rule).
function slugAscii(input) {
  return String(input || "presentation")
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "presentation";
}

// ─────────────────────────────────────────────────────────────
// Anthropic client (lazy) + model fallback
// ─────────────────────────────────────────────────────────────
let _client = null;
function getClient() {
  if (_client) return _client;
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it in Vercel → Project → Settings → Environment Variables."
    );
  }
  _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

// Model order: Haiku 4.5 first for speed (fits well under Vercel's 60s
// function limit). Fall back to Sonnet variants only if Haiku is unavailable
// on the account.
const MODEL_CANDIDATES = [
  "claude-haiku-4-5",
  "claude-haiku-4-5-20251001",
  "claude-sonnet-4-6",
  "claude-3-5-sonnet-latest"
];

async function callLLM({ systemParts, userMessage, maxTokens }) {
  const client = getClient();
  const models = MODEL_CANDIDATES;
  let lastError;

  for (const model of models) {
    try {
      const resp = await client.messages.create({
        model,
        max_tokens: maxTokens,
        system: systemParts,
        messages: [{ role: "user", content: userMessage }]
      });
      const text = resp.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("");
      return { text, model };
    } catch (err) {
      lastError = err;
      const status = err?.status;
      const msg = String(err?.message || "");
      // Retry on unknown-model only.
      if (status === 404 || /model.*not.*found|invalid.*model|does not exist/i.test(msg)) {
        console.warn(`[llm] model "${model}" unavailable — trying next. reason: ${msg}`);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

function extractJson(text, stage) {
  const trimmed = (text || "").trim();
  try { return JSON.parse(trimmed); } catch (_) {}
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced) {
    try { return JSON.parse(fenced[1]); } catch (_) {}
  }
  const first = trimmed.indexOf("{");
  const last  = trimmed.lastIndexOf("}");
  if (first !== -1 && last > first) {
    try { return JSON.parse(trimmed.slice(first, last + 1)); } catch (_) {}
  }
  throw new Error(`[${stage}] LLM did not return parseable JSON. First 300 chars: ${trimmed.slice(0, 300)}`);
}

// ─────────────────────────────────────────────────────────────
// Combined stage — content + design in a single LLM call
// (Two sequential calls exceed Vercel's 60s function limit.
//  The design skill's decisions depend entirely on content, so
//  we let the model produce both together.)
// ─────────────────────────────────────────────────────────────
const COMBINED_INSTRUCTION = `You will receive a presentation request and must produce BOTH the content and the design assignments in a single JSON response.

Follow the content skill to decide slides, titles and bullet/paragraph text.
Follow the design skill to assign a layout in {A, B, C, D, E} to each slide.

Return ONLY this JSON shape. No prose, no markdown, no code fences:

{
  "coreInsight": "string",
  "slides": [
    {
      "type": "opening | framing | breakdown | process | application | summary | closing",
      "layout": "A | B | C | D | E",
      "title": "string",
      "content": ["string"],
      "visualHint": "string (optional)"
    }
  ]
}

Layout rules (from the design skill):
- opening, closing, transition → A
- single idea → B
- list (up to 6 items) → C
- two-column comparison or emphasis → D
- grid of up to 6 items → E`;

const DEFAULT_TITLES = {
  opening: "פתיחה",
  framing: "למה זה חשוב",
  breakdown: "הרעיון המרכזי",
  process: "איך זה עובד",
  application: "משמעות מעשית",
  summary: "מסר מרכזי",
  closing: "לייעוץ ומענה:"
};

async function stageContentAndDesign({ topic, audience, purpose, notes, theme }) {
  console.log("[content+design] starting");

  const systemParts = [
    { type: "text", text: CONFIG,        cache_control: { type: "ephemeral" } },
    { type: "text", text: SKILL_CONTENT, cache_control: { type: "ephemeral" } },
    { type: "text", text: SKILL_DESIGN,  cache_control: { type: "ephemeral" } },
    { type: "text", text: COMBINED_INSTRUCTION }
  ];

  const input = {
    topic,
    audience: audience || null,
    purpose: purpose || null,
    notes: notes || null,
    theme: pickTheme(theme)
  };
  const userMessage = `Request:\n\n${JSON.stringify(input, null, 2)}`;

  // max_tokens high enough for long presentations (30+ slides). Haiku 4.5
  // generates fast enough (~2-3k tok/s) that even a long deck finishes
  // well under Vercel's 60s function limit.
  const { text, model } = await callLLM({ systemParts, userMessage, maxTokens: 8000 });
  const json = extractJson(text, "content+design");

  if (!Array.isArray(json.slides) || json.slides.length === 0) {
    throw new Error("[content+design] response missing or empty `slides[]`");
  }

  const allowedLayouts = new Set(["A", "B", "C", "D", "E"]);
  json.slides = json.slides.map((s) => {
    if (!s || typeof s !== "object" || !s.type) {
      throw new Error(`[content+design] slide missing 'type': ${JSON.stringify(s).slice(0,200)}`);
    }
    if (typeof s.title !== "string" || !s.title.trim()) s.title = DEFAULT_TITLES[s.type] || "";
    if (typeof s.content === "string") s.content = [s.content];
    if (!Array.isArray(s.content)) s.content = [];
    s.content = s.content.filter((x) => typeof x === "string" && x.trim());
    if (!allowedLayouts.has(s.layout)) {
      s.layout = (s.type === "opening" || s.type === "closing") ? "A" : "B";
    }
    return s;
  });

  console.log(`[content+design] done — ${json.slides.length} slides, model=${model}`);
  return json; // { coreInsight, slides: [{type,layout,title,content[],visualHint}] }
}

// ─────────────────────────────────────────────────────────────
// Stage 3 — build (deterministic HTML; respects slides-build + config)
// ─────────────────────────────────────────────────────────────
function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderSlideContent(slide) {
  const safe = Array.isArray(slide.content) ? slide.content : [];
  const titleHtml = escapeHtml(slide.title || "");

  if (slide.layout === "A") {
    const subtitle = safe[0] ? `<h2>${escapeHtml(safe[0])}</h2>` : "";
    const rest = safe.length > 1
      ? `<div class="closing-lines">${safe.slice(1).map((x) => `<p>${escapeHtml(x)}</p>`).join("")}</div>`
      : "";
    return `<div class="content center"><h1>${titleHtml}</h1>${subtitle}${rest}</div>`;
  }

  if (slide.layout === "B") {
    return `<div class="content stack">
      <h2>${titleHtml}</h2>
      <div class="underline"></div>
      <div class="text-block">${safe.map((x) => `<p>${escapeHtml(x)}</p>`).join("")}</div>
    </div>`;
  }

  if (slide.layout === "C") {
    return `<div class="content stack">
      <h2>${titleHtml}</h2>
      <div class="underline"></div>
      <ul class="bullet-list">${safe.slice(0, 6).map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
    </div>`;
  }

  if (slide.layout === "D") {
    const mid = Math.ceil(safe.length / 2);
    const left  = safe.slice(0, mid);
    const right = safe.slice(mid);
    return `<div class="content stack">
      <h2>${titleHtml}</h2>
      <div class="underline"></div>
      <div class="two-col">
        <div class="col">${left.map((x) => `<p>${escapeHtml(x)}</p>`).join("")}</div>
        <div class="col">${right.map((x) => `<p>${escapeHtml(x)}</p>`).join("")}</div>
      </div>
    </div>`;
  }

  // E — Grid
  return `<div class="content stack">
    <h2>${titleHtml}</h2>
    <div class="underline"></div>
    <div class="grid">${safe.slice(0, 6).map((x) => `<div class="card">${escapeHtml(x)}</div>`).join("")}</div>
  </div>`;
}

export function buildHtml({ slides, theme = "blue", topic = "" }) {
  console.log("[build] starting");
  const themeKey = pickTheme(theme);
  const bg = BACKGROUNDS[themeKey];

  const slidesHtml = slides.map((s) => {
    const bgUrl = s.layout === "A" ? bg.full : bg.frame;
    return `<section class="slide" data-type="${escapeHtml(s.type || "")}" data-layout="${escapeHtml(s.layout)}">
      <div class="slide-bg" style="background-image:url('${bgUrl}')"></div>
      ${renderSlideContent(s)}
    </section>`;
  }).join("\n");

  const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(topic)}</title>
<style>
@font-face { font-family: "Paamon"; src: url("/assets/fonts/paamon/paamon-light-aaa.otf")   format("opentype"); font-weight: 300; font-display: swap; }
@font-face { font-family: "Paamon"; src: url("/assets/fonts/paamon/paamon-regular-aaa.otf") format("opentype"); font-weight: 400; font-display: swap; }
@font-face { font-family: "Paamon"; src: url("/assets/fonts/paamon/paamon-medium-aaa.otf")  format("opentype"); font-weight: 500; font-display: swap; }
@font-face { font-family: "Paamon"; src: url("/assets/fonts/paamon/paamon-bold-aaa.otf")    format("opentype"); font-weight: 700; font-display: swap; }
@font-face { font-family: "Paamon"; src: url("/assets/fonts/paamon/paamon-black-aaa.otf")   format("opentype"); font-weight: 900; font-display: swap; }

:root {
  --navy: #0A1C2F;
  --mint: #78DDB5;
  --mint-light: #A6E5CC;
  --coral: #E06768;
  --mustard: #EBC13A;
  --gray-light: #F4F4F4;
  --white: #FFFFFF;
  --sp-s: 16px;
  --sp-m: 32px;
  --sp-l: 56px;
}
* { box-sizing: border-box; }
html, body {
  margin: 0; padding: 0;
  font-family: "Paamon", Arial, sans-serif;
  background: #fff;
  color: var(--navy);
}
body { direction: rtl; }

.slide {
  position: relative;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(20px, 3vw, 48px);
}
.slide-bg {
  position: absolute; inset: 0; z-index: 0;
  background-size: cover; background-position: center; background-repeat: no-repeat;
}
.content {
  position: relative; z-index: 1;
  width: min(88%, 1400px);
  max-width: 800px;
  max-height: 88dvh;
  overflow: hidden;
  text-align: center;
  margin: 0 auto;
}
.content.center {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: clamp(16px, 2vw, 32px);
}
.content.stack {
  display: flex; flex-direction: column;
  gap: clamp(16px, 2vw, 32px);
  align-items: center;
}

h1 { margin: 0; font-weight: 800; line-height: 1.1;  font-size: clamp(40px, 4.4vw, 56px); }
h2 { margin: 0; font-weight: 700; line-height: 1.15; font-size: clamp(26px, 2.8vw, 36px); }
p, li { margin: 0; font-weight: 400; line-height: 1.5; font-size: clamp(18px, 1.7vw, 24px); }

.underline {
  width: clamp(80px, 10vw, 160px);
  height: 4px;
  background: var(--mint);
  border-radius: 999px;
}

.text-block { display: flex; flex-direction: column; gap: var(--sp-s); }

.bullet-list {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: var(--sp-s);
}
.bullet-list li::before {
  content: "•"; color: var(--mint); margin-inline-start: 0.5em;
}

.two-col { display: flex; gap: var(--sp-m); width: 100%; }
.two-col .col { flex: 1; display: flex; flex-direction: column; gap: var(--sp-s); }

.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--sp-m); width: 100%; }
.card {
  background: rgba(255,255,255,0.85);
  border-radius: 16px;
  padding: var(--sp-s);
  font-size: clamp(18px, 1.5vw, 24px);
  line-height: 1.4;
}

.closing-lines { display: flex; flex-direction: column; gap: 10px; align-items: center; }

@media (max-width: 900px) {
  .two-col { flex-direction: column; }
  .grid { grid-template-columns: 1fr; }
  .content { max-width: 92%; }
}
@media (max-height: 700px) { .content { max-height: 84dvh; } }
@media (max-height: 600px) { .slide { padding: 20px; } .content { max-height: 82dvh; } }
@media (max-height: 500px) { .content { max-height: 78dvh; } }

@media print {
  @page { size: 1920px 1080px; margin: 0; }
  html, body { background: #fff; }
  .slide {
    width: 1920px; height: 1080px;
    page-break-after: always;
    break-after: page;
  }
  .slide:last-child { page-break-after: auto; break-after: auto; }
}
</style>
</head>
<body>
${slidesHtml}
<script>
function initSlides() {
  var slides = document.querySelectorAll('.slide');
  slides.forEach(function(slide){
    slide.style.opacity = 0;
    slide.style.transform = 'translateY(20px)';
  });
  slides.forEach(function(slide){
    slide.offsetHeight;
    slide.style.transition = 'all 0.6s ease';
    slide.style.opacity = 1;
    slide.style.transform = 'translateY(0)';
  });
}
window.onload = initSlides;
</script>
</body>
</html>`;

  console.log(`[build] done — ${slides.length} slides, theme=${themeKey}`);
  return html;
}

// ─────────────────────────────────────────────────────────────
// Stage 4 — export (deterministic URL construction)
// ─────────────────────────────────────────────────────────────
function buildExportUrls({ designOutput, theme, topic, origin }) {
  console.log("[export] starting");
  const payload = {
    topic,
    theme: pickTheme(theme),
    design: { slides: designOutput.slides }
  };
  const d = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const urls = {
    presentationUrl: origin ? `${origin}/api/presentation?d=${d}` : null,
    pdfUrl:          origin ? `${origin}/api/presentation?d=${d}&print=1` : null
  };
  console.log("[export] done");
  return urls;
}

// ─────────────────────────────────────────────────────────────
// Optional: persist stage artifacts to tmp for debugging (never breaks on failure).
// ─────────────────────────────────────────────────────────────
function writeTmp(name, data) {
  try {
    const dir = "/tmp";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(`${dir}/${name}`, typeof data === "string" ? data : JSON.stringify(data, null, 2), "utf8");
  } catch (_) {}
}

// ─────────────────────────────────────────────────────────────
// Top-level orchestrator
// ─────────────────────────────────────────────────────────────
export async function runPresentationAgent({ topic, audience, purpose, notes, theme, origin }) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it in Vercel → Project → Settings → Environment Variables."
    );
  }
  if (!topic || typeof topic !== "string" || !topic.trim()) {
    throw new Error("Topic is required.");
  }

  const combined = await stageContentAndDesign({ topic, audience, purpose, notes, theme });
  writeTmp("combined.json", combined);

  // Build runs once eagerly so we can fail fast if something is malformed,
  // plus we stash the HTML for debugging. The stateless /api/presentation
  // endpoint renders it again deterministically from the URL payload.
  const html = buildHtml({ slides: combined.slides, theme, topic });
  writeTmp("presentation.html", html);

  const urls = buildExportUrls({ designOutput: combined, theme, topic, origin });
  const slug = slugAscii(topic);

  return {
    ok: true,
    topic: topic.trim(),
    theme: pickTheme(theme),
    coreInsight: combined.coreInsight || null,
    slideCount: combined.slides.length,
    htmlFileName: `presentation_${slug}.html`,
    pdfFileName:  `presentation_${slug}.pdf`,
    ...urls,
    design: combined
  };
}
