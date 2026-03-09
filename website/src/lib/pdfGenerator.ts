import PDFDocument from "pdfkit";
import { marked, type Token, type Tokens } from "marked";

const CHARCOAL = "#2d2d2d";
const ACCENT = "#e87a2e";
const MUTED = "#888888";
const WHITE = "#ffffff";

const PAGE_MARGIN = 60;
const HEADER_HEIGHT = 70;
const FOOTER_HEIGHT = 40;

function stripBrandingTokens(tokens: Token[]): Token[] {
  const filtered: Token[] = [];
  let skipFooter = false;

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];

    // Skip branded blockquote header (first blockquote containing "CrumbLabz")
    if (i === 0 && t.type === "blockquote") {
      const raw = (t as Tokens.Blockquote).raw || "";
      if (raw.includes("CrumbLabz")) continue;
    }

    // Skip trailing footer (hr + italic lines at end)
    if (skipFooter) continue;
    if (
      t.type === "hr" &&
      i >= tokens.length - 3
    ) {
      // Check if remaining tokens look like the branded footer
      const remaining = tokens.slice(i + 1);
      const isFooter = remaining.every(
        (r) => r.type === "paragraph" || r.type === "space"
      );
      if (isFooter) {
        skipFooter = true;
        continue;
      }
    }

    filtered.push(t);
  }

  return filtered;
}

function getInlineText(token: Token): string {
  if ("text" in token && typeof token.text === "string") {
    // Strip markdown inline formatting for plain text
    return token.text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1");
  }
  return "";
}

export async function generatePdf(
  markdown: string,
  title: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: {
        top: PAGE_MARGIN + HEADER_HEIGHT,
        bottom: PAGE_MARGIN + FOOTER_HEIGHT,
        left: PAGE_MARGIN,
        right: PAGE_MARGIN,
      },
      bufferPages: true,
      info: {
        Title: title,
        Author: "CrumbLabz",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const tokens = stripBrandingTokens(marked.lexer(markdown));
    const pageWidth = doc.page.width - PAGE_MARGIN * 2;

    // Render body content
    for (const token of tokens) {
      ensureSpace(doc, 40);
      renderToken(doc, token, pageWidth);
    }

    // Add headers and footers to all pages
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      drawHeader(doc);
      drawFooter(doc, i + 1, pages.count);
    }

    doc.end();
  });
}

function drawHeader(doc: PDFKit.PDFDocument) {
  const pageWidth = doc.page.width;

  // Charcoal background bar
  doc.save();
  doc.rect(0, 0, pageWidth, HEADER_HEIGHT + 20).fill(CHARCOAL);

  // Company name
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .fillColor(WHITE)
    .text("CrumbLabz", PAGE_MARGIN, 22, { continued: true })
    .font("Helvetica")
    .fontSize(14)
    .fillColor(WHITE)
    .text("  |  Custom Software Solutions", { continued: false });

  // Tagline
  doc
    .font("Helvetica-Oblique")
    .fontSize(9)
    .fillColor(ACCENT)
    .text("Turning Business Headaches Into Working Tools", PAGE_MARGIN, 44);

  // Orange accent line
  doc
    .rect(0, HEADER_HEIGHT + 20, pageWidth, 3)
    .fill(ACCENT);

  doc.restore();
}

function drawFooter(
  doc: PDFKit.PDFDocument,
  pageNum: number,
  totalPages: number
) {
  const pageWidth = doc.page.width;
  const y = doc.page.height - FOOTER_HEIGHT - 20;

  doc.save();

  // Thin rule
  doc
    .moveTo(PAGE_MARGIN, y)
    .lineTo(pageWidth - PAGE_MARGIN, y)
    .strokeColor(MUTED)
    .lineWidth(0.5)
    .stroke();

  // Footer text
  doc
    .font("Helvetica-Oblique")
    .fontSize(7)
    .fillColor(MUTED)
    .text(
      "Prepared by CrumbLabz | crumblabz.com  •  This document is confidential and intended for the named client only.",
      PAGE_MARGIN,
      y + 8,
      { width: pageWidth - PAGE_MARGIN * 2, align: "left" }
    );

  // Page number
  doc
    .font("Helvetica")
    .fontSize(7)
    .fillColor(MUTED)
    .text(`${pageNum} / ${totalPages}`, PAGE_MARGIN, y + 8, {
      width: pageWidth - PAGE_MARGIN * 2,
      align: "right",
    });

  doc.restore();
}

function ensureSpace(doc: PDFKit.PDFDocument, needed: number) {
  const bottomLimit =
    doc.page.height - PAGE_MARGIN - FOOTER_HEIGHT - 10;
  if (doc.y + needed > bottomLimit) {
    doc.addPage();
  }
}

function renderToken(
  doc: PDFKit.PDFDocument,
  token: Token,
  pageWidth: number
) {
  switch (token.type) {
    case "heading": {
      const t = token as Tokens.Heading;
      const sizes: Record<number, number> = { 1: 20, 2: 16, 3: 13 };
      const fontSize = sizes[t.depth] || 12;
      doc.moveDown(t.depth === 1 ? 0.8 : 0.5);
      doc
        .font("Helvetica-Bold")
        .fontSize(fontSize)
        .fillColor(CHARCOAL)
        .text(getInlineText(t), { width: pageWidth });
      doc.moveDown(0.3);
      break;
    }

    case "paragraph": {
      const t = token as Tokens.Paragraph;
      renderInlineTokens(doc, t.tokens || [], pageWidth);
      doc.moveDown(0.5);
      break;
    }

    case "list": {
      const t = token as Tokens.List;
      for (let i = 0; i < t.items.length; i++) {
        ensureSpace(doc, 18);
        const item = t.items[i];
        const bullet = t.ordered ? `${i + 1}.` : "•";
        doc
          .font("Helvetica")
          .fontSize(10)
          .fillColor(CHARCOAL);

        const x = doc.x;
        doc.text(`${bullet}  `, x + 15, doc.y, {
          continued: true,
          width: pageWidth - 15,
        });
        // Render item inline tokens
        if (item.tokens && item.tokens.length > 0) {
          for (const sub of item.tokens) {
            if (sub.type === "text" || sub.type === "paragraph") {
              const inlineTokens = (sub as Tokens.Paragraph).tokens || [];
              if (inlineTokens.length > 0) {
                renderInlineTokens(doc, inlineTokens, pageWidth - 30, true);
              } else {
                doc.text(getInlineText(sub), { width: pageWidth - 30 });
              }
            }
          }
        } else {
          doc.text(getInlineText(item), { width: pageWidth - 30 });
        }
        doc.moveDown(0.15);
      }
      doc.moveDown(0.3);
      break;
    }

    case "blockquote": {
      const t = token as Tokens.Blockquote;
      const x = doc.x;
      const startY = doc.y;

      // Render blockquote content indented
      doc.x = x + 20;
      for (const sub of t.tokens || []) {
        renderToken(doc, sub, pageWidth - 25);
      }
      const endY = doc.y;

      // Draw left accent bar
      doc
        .rect(x + 5, startY, 3, endY - startY)
        .fill(ACCENT);

      doc.x = x;
      doc.moveDown(0.3);
      break;
    }

    case "hr": {
      doc.moveDown(0.5);
      doc
        .moveTo(doc.x, doc.y)
        .lineTo(doc.x + pageWidth, doc.y)
        .strokeColor(MUTED)
        .lineWidth(0.5)
        .stroke();
      doc.moveDown(0.5);
      break;
    }

    case "space": {
      doc.moveDown(0.3);
      break;
    }

    default:
      // For any unhandled token with text, render as plain paragraph
      if ("text" in token) {
        doc
          .font("Helvetica")
          .fontSize(10)
          .fillColor(CHARCOAL)
          .text(getInlineText(token), { width: pageWidth });
        doc.moveDown(0.3);
      }
      break;
  }
}

function renderInlineTokens(
  doc: PDFKit.PDFDocument,
  tokens: Token[],
  width: number,
  continuing = false
) {
  if (tokens.length === 0) return;

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const isLast = i === tokens.length - 1 && !continuing;

    if (t.type === "strong") {
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(CHARCOAL)
        .text((t as Tokens.Strong).text, {
          width,
          continued: !isLast,
        });
    } else if (t.type === "em") {
      doc
        .font("Helvetica-Oblique")
        .fontSize(10)
        .fillColor(CHARCOAL)
        .text((t as Tokens.Em).text, {
          width,
          continued: !isLast,
        });
    } else {
      const text =
        t.type === "text"
          ? (t as Tokens.Text).text
          : t.type === "codespan"
            ? (t as Tokens.Codespan).text
            : "raw" in t
              ? String((t as { raw: string }).raw)
              : "";
      if (text) {
        doc
          .font("Helvetica")
          .fontSize(10)
          .fillColor(CHARCOAL)
          .text(text, { width, continued: !isLast });
      }
    }
  }
}
