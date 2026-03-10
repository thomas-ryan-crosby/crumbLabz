import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");

  if (!owner || !repo) {
    return NextResponse.json({ error: "owner and repo are required" }, { status: 400 });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "GITHUB_TOKEN not configured" }, { status: 500 });
  }

  try {
    const octokit = new Octokit({ auth: token });
    const { data: refData } = await octokit.git.getRef({ owner, repo, ref: "heads/main" });

    // Get commit details for the message and date
    const { data: commitData } = await octokit.git.getCommit({
      owner,
      repo,
      commit_sha: refData.object.sha,
    });

    return NextResponse.json({
      sha: refData.object.sha,
      message: commitData.message.split("\n")[0],
      date: commitData.author.date,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch repo info";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
