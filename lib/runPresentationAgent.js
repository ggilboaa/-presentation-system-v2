export function slugifyTopic(input) {
  if (!input || typeof input !== "string") return "presentation";
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9\u0590-\u05FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "presentation";
}

function buildContentStage({ topic, audience, purpose, notes }) {
  return {
    coreInsight: `המצגת הזו חוקרת את המשמעות העמוקה של "${topic}" והופכת אותה לזרימה מובנית ומעשית.`,
    slides: [
      {
        type: "opening",
        title: topic,
        content: [
          purpose || "תובנה וכלי מעשי"
        ]
      },
      {
        type: "framing",
        title: "למה זה חשוב",
        content: [
          `הנושא "${topic}" אינו רק מידע.`,
          "הוא משקף מתח עמוק יותר שראוי למסגרו בבהירות."
        ]
      },
      {
        type: "breakdown",
        title: "הרעיון המרכזי",
        content: [
          `קהל יעד מרכזי: ${audience || "הורים לבני נוער"}`,
          notes || "לא סופקו הערות נוספות."
        ]
      },
      {
        type: "process",
        title: "איך זה עובד",
        content: [
          "להתחיל מהסוגיה המרכזית",
          "לחדד את המתח הרגשי או הרעיוני",
          "לתרגם למבנה ולפעולה"
        ]
      },
      {
        type: "application",
        title: "משמעות מעשית",
        content: [
          "להחיל את הרעיון על מצבים אמיתיים",
          "להפוך תובנה להבנה שימושית"
        ]
      },
      {
        type: "summary",
        title: "מסר מרכזי",
        content: [
          `מצגת טובה על "${topic}" יוצרת גם בהירות וגם תנועה.`
        ]
      },
      {
        type: "closing",
        title: "לייעוץ ומענה:",
        content: [
          "0537661500",
          "nesharim.org.il"
        ]
      }
    ]
  };
}

function chooseLayoutByType(type) {
  switch (type) {
    case "opening":
    case "closing":
      return "A";
    case "framing":
    case "summary":
      return "B";
    case "breakdown":
    case "application":
      return "C";
    case "process":
      return "D";
    default:
      return "B";
  }
}

function buildDesignStage(contentResult) {
  return {
    coreInsight: contentResult.coreInsight,
    slides: contentResult.slides.map((slide) => ({
      ...slide,
      layout: chooseLayoutByType(slide.type),
      visualHint: `Use layout ${chooseLayoutByType(slide.type)} with clear hierarchy and minimal visual emphasis.`
    }))
  };
}

function getBackgroundClass(layout) {
  if (layout === "A") return "bg-full-blue";
  return "bg-frame-blue";
}

function renderSlideContent(slide) {
  const safeContent = Array.isArray(slide.content) ? slide.content : [];

  if (slide.layout === "A") {
    return `
      <div class="content center">
        <h1>${slide.title || ""}</h1>
        ${safeContent[0] ? `<h2>${safeContent[0]}</h2>` : ""}
        ${
          safeContent.length > 1
            ? `<div class="closing-lines">${safeContent
                .slice(1)
                .map((item) => `<p>${item}</p>`)
                .join("")}</div>`
            : ""
        }
      </div>
    `;
  }

  if (slide.layout === "B") {
    return `
      <div class="content stack">
        <h2>${slide.title || ""}</h2>
        <div class="underline"></div>
        <div class="text-block">
          ${safeContent.map((item) => `<p>${item}</p>`).join("")}
        </div>
      </div>
    `;
  }

  if (slide.layout === "C") {
    return `
      <div class="content stack">
        <h2>${slide.title || ""}</h2>
        <div class="underline"></div>
        <ul class="bullet-list">
          ${safeContent.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </div>
    `;
  }

  if (slide.layout === "D") {
    const left = safeContent.slice(0, Math.ceil(safeContent.length / 2));
    const right = safeContent.slice(Math.ceil(safeContent.length / 2));

    return `
      <div class="content stack">
        <h2>${slide.title || ""}</h2>
        <div class="underline"></div>
        <div class="two-col">
          <div class="col">
            ${left.map((item) => `<p>${item}</p>`).join("")}
          </div>
          <div class="col">
            ${right.map((item) => `<p>${item}</p>`).join("")}
          </div>
        </div>
      </div>
    `;
  }

  if (slide.layout === "E") {
    return `
      <div class="content stack">
        <h2>${slide.title || ""}</h2>
        <div class="underline"></div>
        <div class="grid">
          ${safeContent.map((item) => `<div class="card">${item}</div>`).join("")}
        </div>
      </div>
    `;
  }

  return `
    <div class="content stack">
      <h2>${slide.title || ""}</h2>
      <div class="text-block">
        ${safeContent.map((item) => `<p>${item}</p>`).join("")}
      </div>
    </div>
  `;
}

function buildHtmlStage(designResult, topic) {
  const slidesHtml = designResult.slides
    .map((slide) => {
      const bgClass = getBackgroundClass(slide.layout);

      return `
        <section class="slide ${bgClass}">
          <div class="slide-bg"></div>
          ${renderSlideContent(slide)}
        </section>
      `;
    })
    .join("\n");

  return `
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${topic}</title>
  <style>
    :root {
      --navy: #0A1C2F;
      --mint: #78DDB5;
      --mint-light: #A6E5CC;
      --coral: #E06768;
      --mustard: #EBC13A;
      --gray-light: #F4F4F4;
      --white: #FFFFFF;
    }

    * {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background: #ffffff;
      color: var(--navy);
    }

    body {
      direction: rtl;
    }

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
      position: absolute;
      inset: 0;
      z-index: 0;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }

    .bg-full-blue .slide-bg {
      background: linear-gradient(135deg, #f7fbff 0%, #dcecf7 100%);
    }

    .bg-frame-blue .slide-bg {
      background:
        linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,255,255,0.94)),
        linear-gradient(135deg, #eef5fa 0%, #ddeaf2 100%);
      border: clamp(16px, 2vw, 28px) solid #d8e5ef;
      inset: clamp(14px, 1.2vw, 20px);
      border-radius: clamp(16px, 1.6vw, 24px);
    }

    .content {
      position: relative;
      z-index: 1;
      width: min(88%, 1400px);
      max-height: 88dvh;
      overflow: hidden;
    }

    .content.center {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: clamp(16px, 2vw, 32px);
    }

    .content.stack {
      display: flex;
      flex-direction: column;
      gap: clamp(16px, 2vw, 32px);
    }

    h1 {
      margin: 0;
      font-size: clamp(40px, 4vw, 60px);
      line-height: 1.1;
      font-weight: 800;
    }

    h2 {
      margin: 0;
      font-size: clamp(28px, 2.7vw, 40px);
      line-height: 1.2;
      font-weight: 700;
    }

    p, li {
      margin: 0;
      font-size: clamp(18px, 1.5vw, 26px);
      line-height: 1.5;
    }

    .underline {
      width: clamp(80px, 10vw, 160px);
      height: 4px;
      background: var(--mint);
      border-radius: 999px;
    }

    .text-block {
      display: flex;
      flex-direction: column;
      gap: clamp(12px, 1.5vw, 20px);
    }

    .bullet-list {
      margin: 0;
      padding-inline-start: 1.2em;
      display: flex;
      flex-direction: column;
      gap: clamp(12px, 1.5vw, 20px);
    }

    .two-col {
      display: flex;
      gap: clamp(20px, 2.5vw, 40px);
    }

    .col {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: clamp(12px, 1.5vw, 20px);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: clamp(16px, 2vw, 32px);
    }

    .card {
      background: rgba(255,255,255,0.85);
      border-radius: clamp(12px, 1vw, 20px);
      padding: clamp(16px, 1.5vw, 28px);
      box-shadow: 0 8px 24px rgba(10, 28, 47, 0.08);
      font-size: clamp(18px, 1.4vw, 24px);
      line-height: 1.4;
    }

    .closing-lines {
      display: flex;
      flex-direction: column;
      gap: clamp(10px, 1.2vw, 16px);
      align-items: center;
    }

    @media (max-width: 900px) {
      .two-col {
        flex-direction: column;
      }

      .grid {
        grid-template-columns: 1fr;
      }

      .content {
        width: min(92%, 1400px);
      }
    }

    @media (max-height: 700px) {
      .content {
        max-height: 84dvh;
      }
    }

    @media (max-height: 600px) {
      .slide {
        padding: 20px;
      }

      .content {
        max-height: 82dvh;
      }
    }

    @media (max-height: 500px) {
      .content {
        max-height: 78dvh;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .slide {
        transition: none !important;
      }
    }

    @media print {
      @page { size: 1920px 1080px; margin: 0; }
      html, body { background: #fff; }
      .slide {
        width: 1920px;
        height: 1080px;
        page-break-after: always;
        break-after: page;
      }
      .slide:last-child {
        page-break-after: auto;
        break-after: auto;
      }
    }
  </style>
</head>
<body>
  ${slidesHtml}

  <script>
    function initSlides() {
      const slides = document.querySelectorAll('.slide');

      slides.forEach(slide => {
        slide.style.opacity = '0';
        slide.style.transform = 'translateY(20px)';
      });

      slides.forEach(slide => {
        slide.offsetHeight;
        slide.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        slide.style.opacity = '1';
        slide.style.transform = 'translateY(0)';
      });
    }

    window.onload = initSlides;
  </script>
</body>
</html>
  `.trim();
}

export function buildPresentationHtml({ topic, audience, purpose, notes }) {
  if (!topic || typeof topic !== "string" || !topic.trim()) {
    throw new Error("Topic is required.");
  }

  const safeTopic = topic.trim();

  const contentResult = buildContentStage({
    topic: safeTopic,
    audience,
    purpose,
    notes
  });

  const designResult = buildDesignStage(contentResult);

  const html = buildHtmlStage(designResult, safeTopic);

  return {
    topic: safeTopic,
    coreInsight: contentResult.coreInsight,
    slideCount: designResult.slides.length,
    contentResult,
    designResult,
    html
  };
}

export async function runPresentationAgent({
  topic,
  audience,
  purpose,
  notes,
  exportPdf = false,
  deployPublic = false
}) {
  const built = buildPresentationHtml({ topic, audience, purpose, notes });

  return {
    ok: true,
    topic: built.topic,
    coreInsight: built.coreInsight,
    slideCount: built.slideCount,
    contentResult: built.contentResult,
    designResult: built.designResult,
    html: built.html,
    requestedOptions: {
      exportPdf,
      deployPublic
    }
  };
}