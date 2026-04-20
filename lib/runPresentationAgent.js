{\rtf1\ansi\ansicpg1252\cocoartf2869
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tqr\tx720\tqr\tx1440\tqr\tx2160\tqr\tx2880\tqr\tx3600\tqr\tx4320\tqr\tx5040\tqr\tx5760\tqr\tx6480\tqr\tx7200\tqr\tx7920\tqr\tx8640\pardirnatural\qr\partightenfactor0

\f0\fs24 \cf0 import fs from "fs";\
import path from "path";\
\
function slugifyTopic(input) \{\
  if (!input || typeof input !== "string") return "presentation";\
  return input\
    .trim()\
    .toLowerCase()\
    .replace(/['"]/g, "")\
    .replace(/[^a-z0-9\\u0590-\\u05FF\\s-]/g, "")\
    .replace(/\\s+/g, "-")\
    .replace(/-+/g, "-")\
    .replace(/^-|-$/g, "") || "presentation";\
\}\
\
function ensureDir(dirPath) \{\
  if (!fs.existsSync(dirPath)) \{\
    fs.mkdirSync(dirPath, \{ recursive: true \});\
  \}\
\}\
\
function buildContentStage(\{ topic, audience, purpose, notes \}) \{\
  return \{\
    coreInsight: `This presentation explores the deeper meaning of "$\{topic\}" and turns it into a structured and practical presentation flow.`,\
    slides: [\
      \{\
        type: "opening",\
        title: topic,\
        content: [\
          purpose || "Insight and practical takeaway"\
        ]\
      \},\
      \{\
        type: "framing",\
        title: "Why this matters",\
        content: [\
          `The topic of "$\{topic\}" is not only informational.`,\
          "It reflects a deeper tension that deserves clear framing."\
        ]\
      \},\
      \{\
        type: "breakdown",\
        title: "Core idea",\
        content: [\
          `Main audience: $\{audience || "Parents of adolescents"\}`,\
          notes || "No additional notes provided."\
        ]\
      \},\
      \{\
        type: "process",\
        title: "How it works",\
        content: [\
          "Start from the core issue",\
          "Clarify the emotional or conceptual tension",\
          "Translate it into structure and action"\
        ]\
      \},\
      \{\
        type: "application",\
        title: "Practical meaning",\
        content: [\
          "Apply the idea to real situations",\
          "Turn insight into usable understanding"\
        ]\
      \},\
      \{\
        type: "summary",\
        title: "Takeaway",\
        content: [\
          `A good presentation about "$\{topic\}" should create both clarity and movement.`\
        ]\
      \},\
      \{\
        type: "closing",\
        title: "\uc0\u1500 \u1497 \u1497 \u1506 \u1493 \u1509  \u1493 \u1502 \u1506 \u1504 \u1492 :",\
        content: [\
          "0537661500",\
          "nesharim.org.il"\
        ]\
      \}\
    ]\
  \};\
\}\
\
function chooseLayoutByType(type) \{\
  switch (type) \{\
    case "opening":\
    case "closing":\
      return "A";\
    case "framing":\
    case "summary":\
      return "B";\
    case "breakdown":\
    case "application":\
      return "C";\
    case "process":\
      return "D";\
    default:\
      return "B";\
  \}\
\}\
\
function buildDesignStage(contentResult) \{\
  return \{\
    coreInsight: contentResult.coreInsight,\
    slides: contentResult.slides.map((slide) => (\{\
      ...slide,\
      layout: chooseLayoutByType(slide.type),\
      visualHint: `Use layout $\{chooseLayoutByType(slide.type)\} with clear hierarchy and minimal visual emphasis.`\
    \}))\
  \};\
\}\
\
function getBackgroundClass(layout) \{\
  if (layout === "A") return "bg-full-blue";\
  return "bg-frame-blue";\
\}\
\
function renderSlideContent(slide) \{\
  const safeContent = Array.isArray(slide.content) ? slide.content : [];\
\
  if (slide.layout === "A") \{\
    return `\
      <div class="content center">\
        <h1>$\{slide.title || ""\}</h1>\
        $\{safeContent[0] ? `<h2>$\{safeContent[0]\}</h2>` : ""\}\
        $\{\
          safeContent.length > 1\
            ? `<div class="closing-lines">$\{safeContent\
                .slice(1)\
                .map((item) => `<p>$\{item\}</p>`)\
                .join("")\}</div>`\
            : ""\
        \}\
      </div>\
    `;\
  \}\
\
  if (slide.layout === "B") \{\
    return `\
      <div class="content stack">\
        <h2>$\{slide.title || ""\}</h2>\
        <div class="underline"></div>\
        <div class="text-block">\
          $\{safeContent.map((item) => `<p>$\{item\}</p>`).join("")\}\
        </div>\
      </div>\
    `;\
  \}\
\
  if (slide.layout === "C") \{\
    return `\
      <div class="content stack">\
        <h2>$\{slide.title || ""\}</h2>\
        <div class="underline"></div>\
        <ul class="bullet-list">\
          $\{safeContent.map((item) => `<li>$\{item\}</li>`).join("")\}\
        </ul>\
      </div>\
    `;\
  \}\
\
  if (slide.layout === "D") \{\
    const left = safeContent.slice(0, Math.ceil(safeContent.length / 2));\
    const right = safeContent.slice(Math.ceil(safeContent.length / 2));\
\
    return `\
      <div class="content stack">\
        <h2>$\{slide.title || ""\}</h2>\
        <div class="underline"></div>\
        <div class="two-col">\
          <div class="col">\
            $\{left.map((item) => `<p>$\{item\}</p>`).join("")\}\
          </div>\
          <div class="col">\
            $\{right.map((item) => `<p>$\{item\}</p>`).join("")\}\
          </div>\
        </div>\
      </div>\
    `;\
  \}\
\
  if (slide.layout === "E") \{\
    return `\
      <div class="content stack">\
        <h2>$\{slide.title || ""\}</h2>\
        <div class="underline"></div>\
        <div class="grid">\
          $\{safeContent.map((item) => `<div class="card">$\{item\}</div>`).join("")\}\
        </div>\
      </div>\
    `;\
  \}\
\
  return `\
    <div class="content stack">\
      <h2>$\{slide.title || ""\}</h2>\
      <div class="text-block">\
        $\{safeContent.map((item) => `<p>$\{item\}</p>`).join("")\}\
      </div>\
    </div>\
  `;\
\}\
\
function buildHtmlStage(designResult, topic) \{\
  const slidesHtml = designResult.slides\
    .map((slide) => \{\
      const bgClass = getBackgroundClass(slide.layout);\
\
      return `\
        <section class="slide $\{bgClass\}">\
          <div class="slide-bg"></div>\
          $\{renderSlideContent(slide)\}\
        </section>\
      `;\
    \})\
    .join("\\n");\
\
  return `\
<!DOCTYPE html>\
<html lang="he" dir="rtl">\
<head>\
  <meta charset="UTF-8" />\
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\
  <title>$\{topic\}</title>\
  <style>\
    :root \{\
      --navy: #0A1C2F;\
      --mint: #78DDB5;\
      --mint-light: #A6E5CC;\
      --coral: #E06768;\
      --mustard: #EBC13A;\
      --gray-light: #F4F4F4;\
      --white: #FFFFFF;\
    \}\
\
    * \{\
      box-sizing: border-box;\
    \}\
\
    html, body \{\
      margin: 0;\
      padding: 0;\
      font-family: Arial, sans-serif;\
      background: #ffffff;\
      color: var(--navy);\
    \}\
\
    body \{\
      direction: rtl;\
    \}\
\
    .slide \{\
      position: relative;\
      width: 100%;\
      height: 100vh;\
      height: 100dvh;\
      overflow: hidden;\
      display: flex;\
      align-items: center;\
      justify-content: center;\
      padding: clamp(20px, 3vw, 48px);\
    \}\
\
    .slide-bg \{\
      position: absolute;\
      inset: 0;\
      z-index: 0;\
      background-size: cover;\
      background-position: center;\
      background-repeat: no-repeat;\
    \}\
\
    .bg-full-blue .slide-bg \{\
      background: linear-gradient(135deg, #f7fbff 0%, #dcecf7 100%);\
    \}\
\
    .bg-frame-blue .slide-bg \{\
      background:\
        linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,255,255,0.94)),\
        linear-gradient(135deg, #eef5fa 0%, #ddeaf2 100%);\
      border: clamp(16px, 2vw, 28px) solid #d8e5ef;\
      inset: clamp(14px, 1.2vw, 20px);\
      border-radius: clamp(16px, 1.6vw, 24px);\
    \}\
\
    .content \{\
      position: relative;\
      z-index: 1;\
      width: min(88%, 1400px);\
      max-height: 88dvh;\
      overflow: hidden;\
    \}\
\
    .content.center \{\
      display: flex;\
      flex-direction: column;\
      align-items: center;\
      justify-content: center;\
      text-align: center;\
      gap: clamp(16px, 2vw, 32px);\
    \}\
\
    .content.stack \{\
      display: flex;\
      flex-direction: column;\
      gap: clamp(16px, 2vw, 32px);\
    \}\
\
    h1 \{\
      margin: 0;\
      font-size: clamp(40px, 4vw, 60px);\
      line-height: 1.1;\
      font-weight: 800;\
    \}\
\
    h2 \{\
      margin: 0;\
      font-size: clamp(28px, 2.7vw, 40px);\
      line-height: 1.2;\
      font-weight: 700;\
    \}\
\
    p, li \{\
      margin: 0;\
      font-size: clamp(18px, 1.5vw, 26px);\
      line-height: 1.5;\
    \}\
\
    .underline \{\
      width: clamp(80px, 10vw, 160px);\
      height: 4px;\
      background: var(--mint);\
      border-radius: 999px;\
    \}\
\
    .text-block \{\
      display: flex;\
      flex-direction: column;\
      gap: clamp(12px, 1.5vw, 20px);\
    \}\
\
    .bullet-list \{\
      margin: 0;\
      padding-inline-start: 1.2em;\
      display: flex;\
      flex-direction: column;\
      gap: clamp(12px, 1.5vw, 20px);\
    \}\
\
    .two-col \{\
      display: flex;\
      gap: clamp(20px, 2.5vw, 40px);\
    \}\
\
    .col \{\
      flex: 1;\
      display: flex;\
      flex-direction: column;\
      gap: clamp(12px, 1.5vw, 20px);\
    \}\
\
    .grid \{\
      display: grid;\
      grid-template-columns: repeat(2, minmax(0, 1fr));\
      gap: clamp(16px, 2vw, 32px);\
    \}\
\
    .card \{\
      background: rgba(255,255,255,0.85);\
      border-radius: clamp(12px, 1vw, 20px);\
      padding: clamp(16px, 1.5vw, 28px);\
      box-shadow: 0 8px 24px rgba(10, 28, 47, 0.08);\
      font-size: clamp(18px, 1.4vw, 24px);\
      line-height: 1.4;\
    \}\
\
    .closing-lines \{\
      display: flex;\
      flex-direction: column;\
      gap: clamp(10px, 1.2vw, 16px);\
      align-items: center;\
    \}\
\
    @media (max-width: 900px) \{\
      .two-col \{\
        flex-direction: column;\
      \}\
\
      .grid \{\
        grid-template-columns: 1fr;\
      \}\
\
      .content \{\
        width: min(92%, 1400px);\
      \}\
    \}\
\
    @media (max-height: 700px) \{\
      .content \{\
        max-height: 84dvh;\
      \}\
    \}\
\
    @media (max-height: 600px) \{\
      .slide \{\
        padding: 20px;\
      \}\
\
      .content \{\
        max-height: 82dvh;\
      \}\
    \}\
\
    @media (max-height: 500px) \{\
      .content \{\
        max-height: 78dvh;\
      \}\
    \}\
\
    @media (prefers-reduced-motion: reduce) \{\
      .slide \{\
        transition: none !important;\
      \}\
    \}\
  </style>\
</head>\
<body>\
  $\{slidesHtml\}\
\
  <script>\
    function initSlides() \{\
      const slides = document.querySelectorAll('.slide');\
\
      slides.forEach(slide => \{\
        slide.style.opacity = '0';\
        slide.style.transform = 'translateY(20px)';\
      \});\
\
      slides.forEach(slide => \{\
        slide.offsetHeight;\
        slide.style.transition = 'opacity 0.6s ease, transform 0.6s ease';\
        slide.style.opacity = '1';\
        slide.style.transform = 'translateY(0)';\
      \});\
    \}\
\
    window.onload = initSlides;\
  </script>\
</body>\
</html>\
  `.trim();\
\}\
\
function buildExportStage(\{ topic, html \}) \{\
  const outputDir = path.join(process.cwd(), "output");\
  ensureDir(outputDir);\
\
  const slug = slugifyTopic(topic);\
  const htmlFileName = `presentation_$\{slug\}.html`;\
  const htmlFilePath = path.join(outputDir, htmlFileName);\
\
  fs.writeFileSync(htmlFilePath, html, "utf8");\
\
  return \{\
    htmlFileName,\
    htmlFilePath,\
    outputDir\
  \};\
\}\
\
export async function runPresentationAgent(\{\
  topic,\
  audience,\
  purpose,\
  notes,\
  exportPdf = false,\
  deployPublic = false\
\}) \{\
  if (!topic || typeof topic !== "string" || !topic.trim()) \{\
    throw new Error("Topic is required.");\
  \}\
\
  const safeTopic = topic.trim();\
\
  const contentResult = buildContentStage(\{\
    topic: safeTopic,\
    audience,\
    purpose,\
    notes\
  \});\
\
  const designResult = buildDesignStage(contentResult);\
\
  const html = buildHtmlStage(designResult, safeTopic);\
\
  const exportResult = buildExportStage(\{\
    topic: safeTopic,\
    html\
  \});\
\
  return \{\
    ok: true,\
    topic: safeTopic,\
    coreInsight: contentResult.coreInsight,\
    slideCount: designResult.slides.length,\
    contentResult,\
    designResult,\
    output: exportResult,\
    requestedOptions: \{\
      exportPdf,\
      deployPublic\
    \},\
    nextStep: "Replace internal placeholder logic with real AI execution per skill."\
  \};\
\}}