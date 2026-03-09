import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let buffer: Buffer;

    if (contentType.includes("application/json")) {
      // Accept a URL to fetch server-side (avoids CORS issues)
      const { url } = await request.json();
      if (!url) {
        return NextResponse.json({ error: "No url provided" }, { status: 400 });
      }
      const res = await fetch(url);
      if (!res.ok) {
        return NextResponse.json({ error: "Failed to fetch file from URL" }, { status: 502 });
      }
      buffer = Buffer.from(await res.arrayBuffer());
    } else {
      // Accept a file upload via FormData
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      if (file.type !== "application/pdf") {
        return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
      }

      buffer = Buffer.from(await file.arrayBuffer());
    }

    const parser = new PDFParse({ data: buffer });
    const text = await parser.getText();

    return NextResponse.json({ text });
  } catch (err) {
    console.error("PDF extraction error:", err);
    return NextResponse.json(
      { error: "Failed to extract text from PDF" },
      { status: 500 }
    );
  }
}
