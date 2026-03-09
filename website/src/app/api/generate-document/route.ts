import { NextResponse } from "next/server";
import {
  generateProblemDefinition,
  generateProblemDefinitionFromPdf,
  generateSolutionOnePager,
} from "@/lib/documentGeneration";

export async function POST(request: Request) {
  try {
    const { type, sourceContent, fileUrl } = await request.json();

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
        // Fetch the PDF server-side and send directly to Claude
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
    } else {
      return NextResponse.json(
        { error: "Invalid document type. Use problem_definition or solution_one_pager" },
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
