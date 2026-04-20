import { buildPresentationHtml } from "../lib/runPresentationAgent.js";

function decodePayload(d) {
  const json = Buffer.from(String(d), "base64url").toString("utf8");
  return JSON.parse(json);
}

const PRINT_SCRIPT = `
<script>
  window.addEventListener('load', function () {
    setTimeout(function () {
      try { window.print(); } catch (_) {}
    }, 400);
  });
</script>
`;

export default function handler(req, res) {
  try {
    const d = req.query && req.query.d;
    if (!d) {
      res.status(400).json({ ok: false, error: "Missing 'd' query parameter." });
      return;
    }

    const payload = decodePayload(d);
    const { html } = buildPresentationHtml(payload);

    const printMode = req.query && (req.query.print === "1" || req.query.print === "true");
    const finalHtml = printMode ? html.replace("</body>", PRINT_SCRIPT + "</body>") : html;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
    res.status(200).send(finalHtml);
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: "Failed to render presentation.",
      details: error.message
    });
  }
}
