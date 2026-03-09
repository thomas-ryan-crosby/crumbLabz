import { NextResponse } from "next/server";
import { generateDocx } from "@/lib/docxGenerator";

export async function POST(request: Request) {
  try {
    const { markdown, title } = await request.json();

    if (!markdown || !title) {
      return NextResponse.json(
        { error: "markdown and title are required" },
        { status: 400 }
      );
    }

    const docxBuffer = await generateDocx(markdown, title);

    return new NextResponse(new Uint8Array(docxBuffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${title.replace(/[^a-zA-Z0-9 ._-]/g, "")}.docx"`,
      },
    });
  } catch (err) {
    console.error("DOCX generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate DOCX" },
      { status: 500 }
    );
  }
}
