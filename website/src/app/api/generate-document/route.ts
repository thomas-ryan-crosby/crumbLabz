import { NextResponse } from "next/server";
import {
  generateProblemDefinition,
  generateSolutionOnePager,
} from "@/lib/documentGeneration";

export async function POST(request: Request) {
  try {
    const { type, sourceContent } = await request.json();

    if (!type || !sourceContent) {
      return NextResponse.json(
        { error: "type and sourceContent are required" },
        { status: 400 }
      );
    }

    let content: string;

    if (type === "problem_definition") {
      content = await generateProblemDefinition(sourceContent);
    } else if (type === "solution_one_pager") {
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
