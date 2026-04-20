import { runPresentationAgent } from "../lib/runPresentationAgent.js";

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

    const result = await runPresentationAgent({
      topic,
      audience,
      purpose,
      notes,
      exportPdf,
      deployPublic
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "Failed to run presentation agent.",
      details: error.message
    });
  }
}