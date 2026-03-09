import { NextResponse } from "next/server";
import { fetchTranscript, formatTranscriptForAI } from "@/lib/fireflies";
import {
  generateProblemDefinition,
  generateSolutionOnePager,
} from "@/lib/documentGeneration";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import {
  db,
  addClientDocument,
  updateContact,
} from "@/lib/firebase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Fireflies webhook payload includes the meeting/transcript ID
    const transcriptId =
      body.data?.transcript_id ||
      body.data?.id ||
      body.transcript_id ||
      body.meetingId;

    if (!transcriptId) {
      console.error("No transcript ID in webhook payload:", body);
      return NextResponse.json(
        { error: "No transcript ID provided" },
        { status: 400 }
      );
    }

    console.log(`Processing Fireflies transcript: ${transcriptId}`);

    // 1. Fetch the full transcript from Fireflies API
    const transcript = await fetchTranscript(transcriptId);
    if (!transcript) {
      return NextResponse.json(
        { error: "Failed to fetch transcript" },
        { status: 502 }
      );
    }

    // 2. Try to match the meeting to a contact by title convention
    //    Expected format: "[CompanyName] Discovery Call" or similar
    const meetingTitle = transcript.title || "";
    const companyGuess = meetingTitle
      .replace(/discovery call/i, "")
      .replace(/meeting/i, "")
      .replace(/[-—|]/g, "")
      .trim();

    let contactId: string | null = null;

    if (companyGuess) {
      // Search contacts by company name (case-insensitive not supported in Firestore,
      // so we fetch all and filter — acceptable at small scale)
      const contactsSnapshot = await getDocs(
        query(collection(db, "contacts"))
      );
      const match = contactsSnapshot.docs.find((d) => {
        const company = (d.data().company || "").toLowerCase();
        return company.includes(companyGuess.toLowerCase()) ||
          companyGuess.toLowerCase().includes(company);
      });
      if (match) {
        contactId = match.id;
        console.log(`Matched transcript to contact: ${contactId} (${match.data().company})`);
      }
    }

    // 3. Format transcript for AI processing
    const formattedTranscript = formatTranscriptForAI(transcript);

    // 4. If we matched a contact, store the raw transcript and generate docs
    if (contactId) {
      // Store raw transcript
      await addClientDocument(contactId, {
        title: `Meeting Transcript — ${transcript.title}`,
        type: "meeting_transcript",
        content: formattedTranscript,
        status: "approved",
        generatedBy: "ai",
      });

      // Generate Problem Definition
      console.log("Generating Problem Definition...");
      const problemDef = await generateProblemDefinition(formattedTranscript);
      await addClientDocument(contactId, {
        title: "Problem Definition Document",
        type: "problem_definition",
        content: problemDef,
        status: "draft",
        generatedBy: "ai",
      });

      // Generate Solution One-Pager
      console.log("Generating Solution One-Pager...");
      const solutionOnePager = await generateSolutionOnePager(problemDef);
      await addClientDocument(contactId, {
        title: "Solution One-Pager",
        type: "solution_one_pager",
        content: solutionOnePager,
        status: "draft",
        generatedBy: "ai",
      });

      // Advance pipeline stage to problem_definition
      await updateContact(
        contactId,
        { stage: "problem_definition" },
        "System (Fireflies)"
      );

      console.log(`Documents generated and stored for contact: ${contactId}`);
    } else {
      console.warn(
        `Could not match transcript "${meetingTitle}" to a contact. ` +
        `Store manually via admin. Transcript ID: ${transcriptId}`
      );
    }

    return NextResponse.json({
      success: true,
      transcriptId,
      contactId: contactId || "unmatched",
      documentsGenerated: contactId ? true : false,
    });
  } catch (err) {
    console.error("Fireflies webhook error:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
