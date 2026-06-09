import { cardHtml } from "cli-cards";
import type { Card, Dimensions, Palette } from "cli-cards";

// Render a card to a PNG blob entirely in the browser. The card HTML is
// embedded in an SVG <foreignObject>, drawn to a canvas, and exported.
// Reuses the same cardHtml the CLI screenshots so the web export matches

// foreignObject is parsed as strict XML, so the raw cardHtml (with its doctype,
// <meta charset> void tag, and html/head/body wrapper) breaks it. Parse the
// document and re-serialize the style and body as well-formed XHTML
function svgWrap(html: string, dim: Dimensions): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  // cardHtml puts layout and background on the body, so carry the body's own
  // styles onto the wrapper that takes its place inside foreignObject
  const css = doc.querySelector("style")?.textContent ?? "";
  const bodyStyle = doc.body.getAttribute("style") ?? "";
  const serializer = new XMLSerializer();
  const body = Array.from(doc.body.children)
    .filter((el) => el.tagName.toLowerCase() !== "style")
    .map((el) => serializer.serializeToString(el))
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${dim.w}" height="${dim.h}">
  <foreignObject width="100%" height="100%">
    <body xmlns="http://www.w3.org/1999/xhtml" style="margin:0;width:${dim.w}px;height:${dim.h}px;${bodyStyle}">
      <style>${css}</style>
      ${body}
    </body>
  </foreignObject>
</svg>`;
}

export async function cardToPngBlob(
  card: Card,
  dim: Dimensions,
  palette: Palette,
  scale = 1,
): Promise<Blob> {
  // Ensure web fonts are ready so text metrics match the preview
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const svg = svgWrap(cardHtml(card, dim, palette), dim);
  // A data URL keeps the SVG same-origin. An object URL taints the canvas in
  // Chrome when the foreignObject renders text, blocking toBlob
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  const img = new Image();
  img.width = dim.w;
  img.height = dim.h;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to render card SVG"));
    img.src = dataUrl;
  });

  const canvas = document.createElement("canvas");
  canvas.width = dim.w * scale;
  canvas.height = dim.h * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.scale(scale, scale);
  ctx.drawImage(img, 0, 0);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas toBlob returned null"));
    }, "image/png");
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
