import { runPresentationAgent } from "../lib/runPresentationAgent.js";

export const config = { maxDuration: 60 };

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
      theme
    } = req.body || {};

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return res.status(400).json({
        ok: false,
        error: "Missing required field: topic"
      });
    }

    const origin = detectOrigin(req);
    const result = await runPresentationAgent({
      topic,
      audience,
      purpose,
      notes,
      theme,
      origin
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("[create-presentation] error:", error);
    const msg = error?.message || String(error);
    const isTimeout =
      error?.name === "APIConnectionTimeoutError" ||
      /timeout|timed out/i.test(msg);
    const isOverloaded = error?.status === 529 || /overloaded/i.test(msg);

    if (isTimeout || isOverloaded) {
      return res.status(503).json({
        ok: false,
        error: "ה-AI לא הגיב בזמן. אנא נסה שוב.",
        details: msg
      });
    }
    return res.status(500).json({
      ok: false,
      error: "Failed to run presentation pipeline.",
      details: msg
    });
  }
}
