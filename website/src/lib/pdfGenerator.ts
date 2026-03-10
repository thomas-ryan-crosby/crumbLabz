import PDFDocument from "pdfkit";
import { marked, type Token, type Tokens } from "marked";
import { getLogoFullBuffer, getLogoCookieBuffer } from "@/assets/logos";

const CHARCOAL = "#2d2d2d";
const ACCENT = "#e87a2e";
const MUTED = "#999999";
const LIGHT_GRAY = "#f5f5f5";
const BORDER_GRAY = "#e0e0e0";

const PAGE_MARGIN_X = 72; // 1 inch
const PAGE_MARGIN_TOP = 54;
const HEADER_ZONE = 80;
const FOOTER_ZONE = 50;
const BODY_FONT_SIZE = 11;
const LINE_HEIGHT = 1.4;

// Pre-load logo buffers (embedded base64, works in serverless)
const logoFullBuffer = getLogoFullBuffer();
const logoCookieBuffer = getLogoCookieBuffer();

function stripBrandingTokens(tokens: Token[]): Token[] {
  const filtered: Token[] = [];
  let skipFooter = false;

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];

    if (i === 0 && t.type === "blockquote") {
      const raw = (t as Tokens.Blockquote).raw || "";
      if (raw.includes("CrumbLabz")) continue;
    }

    if (skipFooter) continue;
    if (t.type === "hr" && i >= tokens.length - 3) {
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
    return token.text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1");
  }
  return "";
}

export async function generatePdf(
  markdown: string,
  title: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "LETTER",
      margins: {
        top: PAGE_MARGIN_TOP + HEADER_ZONE,
        bottom: FOOTER_ZONE + 30,
        left: PAGE_MARGIN_X,
        right: PAGE_MARGIN_X,
      },
      bufferPages: true,
      info: {
        Title: title,
        Author: "CrumbLabz",
        Creator: "CrumbLabz Document Generator",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const tokens = stripBrandingTokens(marked.lexer(markdown));
    const contentWidth = doc.page.width - PAGE_MARGIN_X * 2;

    // Render body content
    for (const token of tokens) {
      ensureSpace(doc, 30);
      renderToken(doc, token, contentWidth);
    }

    // Add headers and footers to all buffered pages.
    // CRITICAL: We must prevent pdfkit from auto-paginating during header/footer
    // rendering. doc.text() internally checks if doc.y > page.maxY() and calls
    // addPage() — which creates ghost pages. Fix: temporarily set bottom margin
    // to 0 so maxY() returns the full page height, then restore everything after.
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      const savedX = doc.x;
      const savedY = doc.y;
      const savedBottomMargin = doc.page.margins.bottom;
      doc.page.margins.bottom = 0; // Disable auto-pagination
      drawHeader(doc);
      drawFooter(doc, i + 1, pages.count);
      doc.page.margins.bottom = savedBottomMargin;
      doc.x = savedX;
      doc.y = savedY;
    }

    doc.end();
  });
}

function drawHeader(doc: PDFKit.PDFDocument) {
  const pageWidth = doc.page.width;

  doc.save();

  // White background to cover any content that may have bled into the header zone
  doc.rect(0, 0, pageWidth, PAGE_MARGIN_TOP + HEADER_ZONE - 10).fill("#ffffff");

  // Logo image — large and prominent (embedded buffer, works in serverless)
  doc.image(logoFullBuffer, PAGE_MARGIN_X, PAGE_MARGIN_TOP - 2, {
    height: 56,
  });

  // Tagline on the right — positioned absolutely, no line break
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(MUTED)
    .text(
      "Custom Software Solutions",
      0,
      PAGE_MARGIN_TOP + 22,
      {
        width: pageWidth - PAGE_MARGIN_X,
        align: "right",
        lineBreak: false,
      }
    );

  // Orange accent line under header
  const lineY = PAGE_MARGIN_TOP + HEADER_ZONE - 16;
  doc
    .moveTo(PAGE_MARGIN_X, lineY)
    .lineTo(pageWidth - PAGE_MARGIN_X, lineY)
    .strokeColor(ACCENT)
    .lineWidth(2)
    .stroke();

  doc.restore();
}

function drawFooter(
  doc: PDFKit.PDFDocument,
  pageNum: number,
  totalPages: number
) {
  const pageWidth = doc.page.width;
  const y = doc.page.height - FOOTER_ZONE - 10;

  doc.save();

  // Thin separator line
  doc
    .moveTo(PAGE_MARGIN_X, y)
    .lineTo(pageWidth - PAGE_MARGIN_X, y)
    .strokeColor(BORDER_GRAY)
    .lineWidth(0.5)
    .stroke();

  // Cookie icon in footer (embedded buffer)
  doc.image(logoCookieBuffer, PAGE_MARGIN_X, y + 5, { height: 16 });

  // Footer text with clickable website link
  const textX = PAGE_MARGIN_X + 22;
  const footerTextY = y + 10;
  doc
    .font("Helvetica")
    .fontSize(7.5)
    .fillColor(MUTED)
    .text("Prepared by CrumbLabz  |  ", textX, footerTextY, {
      lineBreak: false,
      continued: true,
    })
    .fillColor(ACCENT)
    .text("crumblabz.com", {
      lineBreak: false,
      continued: true,
      link: "https://crumblabz.com",
    })
    .fillColor(MUTED)
    .text("  |  Confidential", { lineBreak: false });

  // Page number — right-aligned, no line break
  doc
    .font("Helvetica")
    .fontSize(7.5)
    .fillColor(MUTED)
    .text(
      `Page ${pageNum} of ${totalPages}`,
      0,
      y + 10,
      {
        width: pageWidth - PAGE_MARGIN_X,
        align: "right",
        lineBreak: false,
      }
    );

  doc.restore();
}

function ensureSpace(doc: PDFKit.PDFDocument, needed: number) {
  const bottomLimit = doc.page.height - FOOTER_ZONE - 30;
  if (doc.y + needed > bottomLimit) {
    doc.addPage();
  }
}

function renderToken(
  doc: PDFKit.PDFDocument,
  token: Token,
  contentWidth: number
) {
  switch (token.type) {
    case "heading": {
      const t = token as Tokens.Heading;
      const sizes: Record<number, number> = { 1: 22, 2: 17, 3: 14 };
      const fontSize = sizes[t.depth] || 12;

      if (t.depth === 1) {
        doc.moveDown(1.0);
      } else if (t.depth === 2) {
        doc.moveDown(0.8);
      } else {
        doc.moveDown(0.6);
      }

      const headingText = getInlineText(t);

      if (t.depth === 1) {
        doc
          .font("Helvetica-Bold")
          .fontSize(fontSize)
          .fillColor(CHARCOAL)
          .text(headingText, { width: contentWidth, lineGap: 4 });
        const underY = doc.y + 4;
        doc
          .moveTo(PAGE_MARGIN_X, underY)
          .lineTo(PAGE_MARGIN_X + contentWidth, underY)
          .strokeColor(ACCENT)
          .lineWidth(1.5)
          .stroke();
        doc.y = underY + 10;
      } else if (t.depth === 2) {
        doc
          .font("Helvetica-Bold")
          .fontSize(fontSize)
          .fillColor(CHARCOAL)
          .text(headingText, { width: contentWidth, lineGap: 3 });
        const underY = doc.y + 3;
        doc
          .moveTo(PAGE_MARGIN_X, underY)
          .lineTo(PAGE_MARGIN_X + contentWidth, underY)
          .strokeColor(BORDER_GRAY)
          .lineWidth(0.75)
          .stroke();
        doc.y = underY + 8;
      } else {
        doc
          .font("Helvetica-Bold")
          .fontSize(fontSize)
          .fillColor(ACCENT)
          .text(headingText, { width: contentWidth, lineGap: 2 });
        doc.moveDown(0.3);
      }
      break;
    }

    case "paragraph": {
      const t = token as Tokens.Paragraph;
      renderInlineTokens(doc, t.tokens || [], contentWidth);
      doc.moveDown(0.6);
      break;
    }

    case "list": {
      const t = token as Tokens.List;
      for (let i = 0; i < t.items.length; i++) {
        ensureSpace(doc, 20);
        const item = t.items[i];
        const bullet = t.ordered ? `${i + 1}.` : "\u2022";
        const indent = 20;
        const bulletWidth = t.ordered ? 18 : 12;

        // Draw bullet/number
        doc
          .font("Helvetica")
          .fontSize(BODY_FONT_SIZE)
          .fillColor(t.ordered ? CHARCOAL : ACCENT)
          .text(bullet, PAGE_MARGIN_X + indent, doc.y, {
            width: bulletWidth,
            continued: false,
          });

        // Move up to align item text with bullet
        doc.y = doc.y - doc.currentLineHeight(true);

        // Render item content
        const textX = PAGE_MARGIN_X + indent + bulletWidth + 4;
        const textWidth = contentWidth - indent - bulletWidth - 4;
        const savedX = doc.x;
        doc.x = textX;

        if (item.tokens && item.tokens.length > 0) {
          let rendered = false;
          for (const sub of item.tokens) {
            if (
              sub.type === "paragraph" &&
              (sub as Tokens.Paragraph).tokens
            ) {
              renderInlineTokens(
                doc,
                (sub as Tokens.Paragraph).tokens,
                textWidth
              );
              rendered = true;
            } else if (sub.type === "text") {
              doc
                .font("Helvetica")
                .fontSize(BODY_FONT_SIZE)
                .fillColor(CHARCOAL)
                .text(getInlineText(sub), {
                  width: textWidth,
                  lineGap: BODY_FONT_SIZE * (LINE_HEIGHT - 1),
                });
              rendered = true;
            }
          }
          if (!rendered) {
            doc
              .font("Helvetica")
              .fontSize(BODY_FONT_SIZE)
              .fillColor(CHARCOAL)
              .text(getInlineText(item), {
                width: textWidth,
                lineGap: BODY_FONT_SIZE * (LINE_HEIGHT - 1),
              });
          }
        } else {
          doc
            .font("Helvetica")
            .fontSize(BODY_FONT_SIZE)
            .fillColor(CHARCOAL)
            .text(getInlineText(item), {
              width: textWidth,
              lineGap: BODY_FONT_SIZE * (LINE_HEIGHT - 1),
            });
        }

        doc.x = savedX;
        doc.moveDown(0.25);
      }
      doc.moveDown(0.4);
      break;
    }

    case "blockquote": {
      const t = token as Tokens.Blockquote;
      const startY = doc.y;

      const savedX = doc.x;
      doc.x = PAGE_MARGIN_X + 16;

      // Render content first to measure height
      for (const sub of t.tokens || []) {
        renderToken(doc, sub, contentWidth - 24);
      }
      const endY = doc.y;

      // Draw background and accent bar
      doc
        .rect(
          PAGE_MARGIN_X + 4,
          startY - 4,
          contentWidth - 4,
          endY - startY + 8
        )
        .fill(LIGHT_GRAY);

      // Orange left bar
      doc
        .rect(PAGE_MARGIN_X + 4, startY - 4, 3, endY - startY + 8)
        .fill(ACCENT);

      // Re-render content on top of background
      doc.y = startY;
      doc.x = PAGE_MARGIN_X + 16;
      for (const sub of t.tokens || []) {
        renderToken(doc, sub, contentWidth - 24);
      }

      doc.x = savedX;
      doc.moveDown(0.4);
      break;
    }

    case "hr": {
      doc.moveDown(0.6);
      doc
        .fontSize(12)
        .fillColor(MUTED)
        .text("\u2022    \u2022    \u2022", PAGE_MARGIN_X, doc.y, {
          width: contentWidth,
          align: "center",
        });
      doc.moveDown(0.6);
      break;
    }

    case "space": {
      doc.moveDown(0.4);
      break;
    }

    default:
      if ("text" in token) {
        doc
          .font("Helvetica")
          .fontSize(BODY_FONT_SIZE)
          .fillColor(CHARCOAL)
          .text(getInlineText(token), {
            width: contentWidth,
            lineGap: BODY_FONT_SIZE * (LINE_HEIGHT - 1),
          });
        doc.moveDown(0.4);
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
    const lineGap = BODY_FONT_SIZE * (LINE_HEIGHT - 1);

    if (t.type === "strong") {
      doc
        .font("Helvetica-Bold")
        .fontSize(BODY_FONT_SIZE)
        .fillColor(CHARCOAL)
        .text((t as Tokens.Strong).text, {
          width,
          continued: !isLast,
          lineGap,
        });
    } else if (t.type === "em") {
      doc
        .font("Helvetica-Oblique")
        .fontSize(BODY_FONT_SIZE)
        .fillColor(CHARCOAL)
        .text((t as Tokens.Em).text, {
          width,
          continued: !isLast,
          lineGap,
        });
    } else if (t.type === "codespan") {
      doc
        .font("Courier")
        .fontSize(BODY_FONT_SIZE - 1)
        .fillColor(CHARCOAL)
        .text((t as Tokens.Codespan).text, {
          width,
          continued: !isLast,
          lineGap,
        });
    } else {
      const text =
        t.type === "text"
          ? (t as Tokens.Text).text
          : "raw" in t
            ? String((t as { raw: string }).raw)
            : "";
      if (text) {
        doc
          .font("Helvetica")
          .fontSize(BODY_FONT_SIZE)
          .fillColor(CHARCOAL)
          .text(text, { width, continued: !isLast, lineGap });
      }
    }
  }
}
