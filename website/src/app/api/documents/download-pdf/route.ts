import { NextResponse } from "next/server";
import { generatePdf } from "@/lib/pdfGenerator";

export async function POST(request: Request) {
  try {
    const { markdown, title } = await request.json();

    if (!markdown || !title) {
      return NextResponse.json(
        { error: "markdown and title are required" },
        { status: 400 }
      );
    }

    const pdfBuffer = await generatePdf(markdown, title);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${title.replace(/[^a-zA-Z0-9 ._-]/g, "")}.pdf"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : "";
    console.error("PDF generation error:", message, stack);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
