import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  TabStopPosition,
  TabStopType,
} from "docx";
import { marked, type Token, type Tokens } from "marked";
import path from "path";
import fs from "fs";

const CHARCOAL = "2d2d2d";
const ACCENT = "e87a2e";
const MUTED = "888888";
const WHITE = "ffffff";

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

function tokenToRuns(tokens: Token[]): TextRun[] {
  const runs: TextRun[] = [];
  for (const t of tokens) {
    if (t.type === "strong") {
      runs.push(
        new TextRun({
          text: (t as Tokens.Strong).text,
          bold: true,
          color: CHARCOAL,
          font: "Calibri",
          size: 22,
        })
      );
    } else if (t.type === "em") {
      runs.push(
        new TextRun({
          text: (t as Tokens.Em).text,
          italics: true,
          color: CHARCOAL,
          font: "Calibri",
          size: 22,
        })
      );
    } else if (t.type === "text") {
      runs.push(
        new TextRun({
          text: (t as Tokens.Text).text,
          color: CHARCOAL,
          font: "Calibri",
          size: 22,
        })
      );
    } else if (t.type === "codespan") {
      runs.push(
        new TextRun({
          text: (t as Tokens.Codespan).text,
          font: "Courier New",
          color: CHARCOAL,
          size: 20,
        })
      );
    } else if ("text" in t) {
      runs.push(
        new TextRun({
          text: String((t as { text: string }).text),
          color: CHARCOAL,
          font: "Calibri",
          size: 22,
        })
      );
    }
  }
  return runs;
}

function tokenToParagraphs(tokens: Token[]): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case "heading": {
        const t = token as Tokens.Heading;
        const level =
          t.depth === 1
            ? HeadingLevel.HEADING_1
            : t.depth === 2
              ? HeadingLevel.HEADING_2
              : HeadingLevel.HEADING_3;
        const fontSize = t.depth === 1 ? 32 : t.depth === 2 ? 26 : 22;

        paragraphs.push(
          new Paragraph({
            heading: level,
            spacing: { before: t.depth === 1 ? 300 : 200, after: 100 },
            children: [
              new TextRun({
                text: t.text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1"),
                bold: true,
                color: CHARCOAL,
                font: "Calibri",
                size: fontSize,
              }),
            ],
          })
        );
        break;
      }

      case "paragraph": {
        const t = token as Tokens.Paragraph;
        const runs = t.tokens ? tokenToRuns(t.tokens) : [
          new TextRun({ text: t.text, color: CHARCOAL, font: "Calibri", size: 22 }),
        ];
        paragraphs.push(
          new Paragraph({
            spacing: { after: 120 },
            children: runs,
          })
        );
        break;
      }

      case "list": {
        const t = token as Tokens.List;
        for (let i = 0; i < t.items.length; i++) {
          const item = t.items[i];
          let runs: TextRun[] = [];

          if (item.tokens) {
            for (const sub of item.tokens) {
              if (sub.type === "paragraph" && (sub as Tokens.Paragraph).tokens) {
                runs = runs.concat(tokenToRuns((sub as Tokens.Paragraph).tokens));
              } else if (sub.type === "text") {
                runs.push(
                  new TextRun({
                    text: (sub as Tokens.Text).text,
                    color: CHARCOAL,
                    font: "Calibri",
                    size: 22,
                  })
                );
              }
            }
          }

          if (runs.length === 0) {
            runs.push(
              new TextRun({
                text: item.text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1"),
                color: CHARCOAL,
                font: "Calibri",
                size: 22,
              })
            );
          }

          const bulletPrefix = t.ordered ? `${i + 1}.  ` : "•  ";
          runs.unshift(
            new TextRun({
              text: bulletPrefix,
              color: CHARCOAL,
              font: "Calibri",
              size: 22,
            })
          );

          paragraphs.push(
            new Paragraph({
              spacing: { after: 40 },
              indent: { left: 360 },
              children: runs,
            })
          );
        }
        break;
      }

      case "blockquote": {
        const t = token as Tokens.Blockquote;
        const subParagraphs = t.tokens ? tokenToParagraphs(t.tokens) : [];
        for (const p of subParagraphs) {
          paragraphs.push(
            new Paragraph({
              ...p,
              indent: { left: 480 },
              border: {
                left: {
                  style: BorderStyle.SINGLE,
                  size: 6,
                  color: ACCENT,
                  space: 10,
                },
              },
            })
          );
        }
        break;
      }

      case "hr": {
        paragraphs.push(
          new Paragraph({
            spacing: { before: 200, after: 200 },
            border: {
              bottom: {
                style: BorderStyle.SINGLE,
                size: 1,
                color: MUTED,
              },
            },
            children: [],
          })
        );
        break;
      }

      case "space": {
        paragraphs.push(new Paragraph({ spacing: { after: 80 }, children: [] }));
        break;
      }

      default:
        if ("text" in token) {
          paragraphs.push(
            new Paragraph({
              spacing: { after: 120 },
              children: [
                new TextRun({
                  text: String((token as { text: string }).text),
                  color: CHARCOAL,
                  font: "Calibri",
                  size: 22,
                }),
              ],
            })
          );
        }
        break;
    }
  }

  return paragraphs;
}

export async function generateDocx(
  markdown: string,
  title: string
): Promise<Buffer> {
  const tokens = stripBrandingTokens(marked.lexer(markdown));
  const bodyParagraphs = tokenToParagraphs(tokens);

  // Load logo for header
  const logoPath = path.join(process.cwd(), "public", "images", "CrumbLabz_LogoFull.png");
  const headerChildren: Paragraph[] = [];

  if (fs.existsSync(logoPath)) {
    const logoBuffer = fs.readFileSync(logoPath);
    headerChildren.push(
      new Paragraph({
        spacing: { after: 40 },
        children: [
          new ImageRun({
            data: logoBuffer,
            transformation: { width: 160, height: 40 },
            type: "png",
          }),
        ],
      })
    );
  } else {
    headerChildren.push(
      new Paragraph({
        spacing: { after: 40 },
        children: [
          new TextRun({
            text: "CrumbLabz",
            bold: true,
            color: CHARCOAL,
            font: "Calibri",
            size: 28,
          }),
        ],
      })
    );
  }

  headerChildren.push(
    new Paragraph({
      spacing: { after: 100 },
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          size: 6,
          color: ACCENT,
          space: 8,
        },
      },
      tabStops: [
        {
          type: TabStopType.RIGHT,
          position: TabStopPosition.MAX,
        },
      ],
      children: [
        new TextRun({
          text: "Custom Software Solutions",
          italics: true,
          color: MUTED,
          font: "Calibri",
          size: 16,
        }),
      ],
    })
  );

  const doc = new Document({
    title,
    creator: "CrumbLabz",
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              bottom: 1440,
              left: 1080,
              right: 1080,
            },
          },
        },
        headers: {
          default: new Header({
            children: headerChildren,
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                border: {
                  top: {
                    style: BorderStyle.SINGLE,
                    size: 1,
                    color: MUTED,
                    space: 4,
                  },
                },
                tabStops: [
                  {
                    type: TabStopType.RIGHT,
                    position: TabStopPosition.MAX,
                  },
                ],
                children: [
                  new TextRun({
                    text: "Prepared by CrumbLabz | crumblabz.com  •  Confidential",
                    italics: true,
                    color: MUTED,
                    font: "Calibri",
                    size: 14,
                  }),
                  new TextRun({
                    children: ["\t"],
                  }),
                  new TextRun({
                    children: ["Page ", PageNumber.CURRENT, " of ", PageNumber.TOTAL_PAGES],
                    color: MUTED,
                    font: "Calibri",
                    size: 14,
                  }),
                ],
              }),
            ],
          }),
        },
        children: bodyParagraphs,
      },
    ],
    numbering: {
      config: [],
    },
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            size: 22,
            color: CHARCOAL,
          },
        },
      },
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          run: { bold: true, size: 32, color: CHARCOAL, font: "Calibri" },
          paragraph: { spacing: { before: 300, after: 100 } },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          run: { bold: true, size: 26, color: CHARCOAL, font: "Calibri" },
          paragraph: { spacing: { before: 200, after: 100 } },
        },
        {
          id: "Heading3",
          name: "Heading 3",
          run: { bold: true, size: 22, color: CHARCOAL, font: "Calibri" },
          paragraph: { spacing: { before: 200, after: 80 } },
        },
      ],
    },
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
