import { buildPresentationHtml, slugifyTopic } from "../lib/runPresentationAgent.js";

function detectOrigin(req) {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  if (!host) return "";
  const proto = forwardedProto ? String(forwardedProto).split(",")[0].trim() : "https";
  return `${proto}://${host}`;
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        ok: false,
        error: "Method not allowed. Use POST."
      });
    }

    const {
      topic,
      audience,
      purpose,
      notes,
      exportPdf = false,
      deployPublic = false
    } = req.body || {};

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return res.status(400).json({
        ok: false,
        error: "Missing required field: topic"
      });
    }

    const built = buildPresentationHtml({ topic, audience, purpose, notes });

    const payload = {
      topic: built.topic,
      audience: audience || undefined,
      purpose: purpose || undefined,
      notes: notes || undefined
    };
    const d = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");

    const origin = detectOrigin(req);
    const slug = slugifyTopic(built.topic) || "presentation";

    const presentationUrl = deployPublic && origin ? `${origin}/api/presentation?d=${d}` : null;
    const pdfUrl = exportPdf && origin ? `${origin}/api/presentation?d=${d}&print=1` : null;

    return res.status(200).json({
      ok: true,
      topic: built.topic,
      coreInsight: built.coreInsight,
      slideCount: built.slideCount,
      htmlFileName: `presentation_${slug}.html`,
      pdfFileName: exportPdf ? `presentation_${slug}.pdf` : null,
      presentationUrl,
      pdfUrl,
      requestedOptions: { exportPdf, deployPublic }
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "Failed to run presentation agent.",
      details: error.message
    });
  }
}
