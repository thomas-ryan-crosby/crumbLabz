import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DOCS_DIR = path.join(process.cwd(), "docs");

const DOC_LABELS: Record<string, string> = {
  CrumbLabz_BusinessModel: "Business Model",
  CrumbLabz_ClientProcess: "Client Process",
  CrumbLabz_BrandIdentify: "Brand Identity",
  CrumbLabz_WebsitePRD: "Website PRD",
  CrumbLabz_AutomationPlaybook: "Automation Playbook",
  CallScript_DiscoveryCall: "Call Script: Discovery Call",
  CallScript_SolutionReview: "Call Script: Solution Review",
  CallScript_MVPPresentation: "Call Script: MVP Presentation",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (slug) {
    const filePath = path.join(DOCS_DIR, `${slug}.md`);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const content = fs.readFileSync(filePath, "utf-8");
    const label = DOC_LABELS[slug] || slug;
    return NextResponse.json({ slug, label, content });
  }

  const files = fs
    .readdirSync(DOCS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const slug = f.replace(".md", "");
      return {
        slug,
        label: DOC_LABELS[slug] || slug,
        filename: f,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  return NextResponse.json(files);
}
