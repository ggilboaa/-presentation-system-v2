import { buildHtml } from "../lib/runPresentationAgent.js";

const PRINT_SCRIPT = `
<script>
  window.addEventListener('load', function () {
    setTimeout(function () {
      try { window.print(); } catch (_) {}
    }, 400);
  });
</script>
`;

function decodePayload(d) {
  const json = Buffer.from(String(d), "base64url").toString("utf8");
  return JSON.parse(json);
}

export default function handler(req, res) {
  try {
    const d = req.query && req.query.d;
    if (!d) {
      res.status(400).json({ ok: false, error: "Missing 'd' query parameter." });
      return;
    }

    const payload = decodePayload(d);
    if (!payload || !payload.design || !Array.isArray(payload.design.slides)) {
      res.status(400).json({ ok: false, error: "Invalid payload: expected { topic, theme, design:{slides:[]} }." });
      return;
    }

    const html = buildHtml({
      slides: payload.design.slides,
      theme: payload.theme,
      topic: payload.topic || ""
    });

    const printMode = req.query && (req.query.print === "1" || req.query.print === "true");
    const finalHtml = printMode ? html.replace("</body>", PRINT_SCRIPT + "</body>") : html;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
    res.status(200).send(finalHtml);
  } catch (error) {
    console.error("[presentation] error:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to render presentation.",
      details: error?.message || String(error)
    });
  }
}
