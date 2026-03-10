import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import {
  generateProblemDefinition,
  generateProblemDefinitionFromPdf,
  generateSolutionOnePager,
  generateDevelopmentPlan,
  generateSolutionOverview,
  generateGettingStarted,
} from "@/lib/documentGeneration";

// Key files to read from repo for solution overview generation
const KEY_FILE_PATTERNS = [
  "package.json",
  "README.md",
  "CLAUDE.md",
  "tsconfig.json",
  "next.config.js",
  "next.config.ts",
  "next.config.mjs",
  "docker-compose.yml",
  "Dockerfile",
  ".env.example",
  "prisma/schema.prisma",
];

const KEY_DIR_PATTERNS = [
  "src/app",
  "src/pages",
  "src/lib",
  "src/components",
  "app",
  "pages",
  "lib",
  "api",
];

async function fetchRepoContents(owner: string, repo: string) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN not configured");

  const octokit = new Octokit({ auth: token });

  // Get full repo tree
  const { data: refData } = await octokit.git.getRef({ owner, repo, ref: "heads/main" });
  const { data: treeData } = await octokit.git.getTree({
    owner,
    repo,
    tree_sha: refData.object.sha,
    recursive: "true",
  });

  // Build tree string
  const treeLines = treeData.tree
    .filter((item) => item.type === "blob" || item.type === "tree")
    .map((item) => `${item.type === "tree" ? "📁" : "  "} ${item.path}`)
    .join("\n");

  // Read key files
  const fileContents: string[] = [];
  for (const item of treeData.tree) {
    if (item.type !== "blob" || !item.path) continue;

    const isKeyFile = KEY_FILE_PATTERNS.some((p) => item.path === p || item.path!.endsWith(`/${p}`));
    const isInKeyDir = KEY_DIR_PATTERNS.some((d) => item.path!.startsWith(`${d}/`));
    const isRouteOrPage =
      item.path.endsWith("/route.ts") ||
      item.path.endsWith("/route.tsx") ||
      item.path.endsWith("/page.ts") ||
      item.path.endsWith("/page.tsx") ||
      item.path.endsWith("/layout.tsx");
    const isConfig = item.path.endsWith(".config.js") || item.path.endsWith(".config.ts") || item.path.endsWith(".config.mjs");

    if (isKeyFile || ((isInKeyDir || isRouteOrPage) && item.path.match(/\.(ts|tsx|js|jsx|json|prisma|yml|yaml)$/))) {
      // Skip large files
      if (item.size && item.size > 50000) continue;

      try {
        const { data: fileData } = await octokit.git.getBlob({ owner, repo, file_sha: item.sha! });
        const decoded = Buffer.from(fileData.content, "base64").toString("utf-8");
        fileContents.push(`### ${item.path}\n\`\`\`\n${decoded.slice(0, 3000)}\n\`\`\``);
      } catch {
        // Skip files that can't be read
      }
    } else if (isConfig) {
      try {
        const { data: fileData } = await octokit.git.getBlob({ owner, repo, file_sha: item.sha! });
        const decoded = Buffer.from(fileData.content, "base64").toString("utf-8");
        fileContents.push(`### ${item.path}\n\`\`\`\n${decoded.slice(0, 2000)}\n\`\`\``);
      } catch {
        // Skip
      }
    }

    // Cap total content to avoid exceeding token limits
    if (fileContents.join("\n\n").length > 80000) break;
  }

  return { tree: treeLines, files: fileContents.join("\n\n") };
}

export async function POST(request: Request) {
  try {
    const { type, sourceContent, fileUrl, repoOwner, repoName, projectName } = await request.json();

    if (type === "solution_overview") {
      if (!repoOwner || !repoName) {
        return NextResponse.json(
          { error: "repoOwner and repoName are required for solution_overview" },
          { status: 400 }
        );
      }
      const { tree, files } = await fetchRepoContents(repoOwner, repoName);
      const content = await generateSolutionOverview(tree, files, projectName || repoName);
      return NextResponse.json({ content });
    }

    if (type === "getting_started") {
      if (!repoOwner || !repoName) {
        return NextResponse.json(
          { error: "repoOwner and repoName are required for getting_started" },
          { status: 400 }
        );
      }
      const { tree, files } = await fetchRepoContents(repoOwner, repoName);
      const content = await generateGettingStarted(tree, files, sourceContent || "", projectName || repoName);
      return NextResponse.json({ content });
    }

    if (!type || (!sourceContent && !fileUrl)) {
      return NextResponse.json(
        { error: "type and either sourceContent or fileUrl are required" },
        { status: 400 }
      );
    }

    let content: string;

    if (type === "problem_definition") {
      if (sourceContent) {
        content = await generateProblemDefinition(sourceContent);
      } else if (fileUrl) {
        const res = await fetch(fileUrl);
        if (!res.ok) {
          return NextResponse.json(
            { error: "Failed to fetch file from storage" },
            { status: 502 }
          );
        }
        const buffer = Buffer.from(await res.arrayBuffer());
        const base64 = buffer.toString("base64");
        content = await generateProblemDefinitionFromPdf(base64);
      } else {
        return NextResponse.json(
          { error: "sourceContent or fileUrl required for problem_definition" },
          { status: 400 }
        );
      }
    } else if (type === "solution_one_pager") {
      if (!sourceContent) {
        return NextResponse.json(
          { error: "sourceContent is required for solution_one_pager" },
          { status: 400 }
        );
      }
      content = await generateSolutionOnePager(sourceContent);
    } else if (type === "development_plan") {
      if (!sourceContent) {
        return NextResponse.json(
          { error: "sourceContent is required for development_plan" },
          { status: 400 }
        );
      }
      content = await generateDevelopmentPlan(sourceContent);
    } else {
      return NextResponse.json(
        { error: "Invalid document type" },
        { status: 400 }
      );
    }

    return NextResponse.json({ content });
  } catch (err) {
    console.error("Document generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate document" },
      { status: 500 }
    );
  }
}
