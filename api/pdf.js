import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { buildPresentationHtml, slugifyTopic } from "../lib/runPresentationAgent.js";

export const config = { maxDuration: 60 };

function decodePayload(d) {
  const json = Buffer.from(String(d), "base64url").toString("utf8");
  return JSON.parse(json);
}

export default async function handler(req, res) {
  let browser;
  try {
    const d = req.query && req.query.d;
    if (!d) {
      res.status(400).json({ ok: false, error: "Missing 'd' query parameter." });
      return;
    }

    const payload = decodePayload(d);
    const { html, topic } = buildPresentationHtml(payload);

    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
      executablePath: await chromium.executablePath(),
      headless: true
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    await page.emulateMediaType("print");

    const pdfBuffer = await page.pdf({
      width: "1920px",
      height: "1080px",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" }
    });

    await browser.close();
    browser = null;

    const slug = slugifyTopic(topic) || "presentation";
    const asciiSlug = slug.replace(/[^a-zA-Z0-9-]/g, "_") || "presentation";
    const utf8FileName = `presentation_${slug}.pdf`;
    const asciiFileName = `presentation_${asciiSlug}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${asciiFileName}"; filename*=UTF-8''${encodeURIComponent(utf8FileName)}`
    );
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
    res.status(200).send(Buffer.from(pdfBuffer));
  } catch (error) {
    if (browser) {
      try { await browser.close(); } catch (_) {}
    }
    res.status(500).json({
      ok: false,
      error: "Failed to render PDF.",
      details: error.message
    });
  }
}
