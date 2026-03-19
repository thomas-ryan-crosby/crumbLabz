import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are the CrumbLabz intake assistant. CrumbLabz builds custom software tools that eliminate manual work slowing businesses down.

Your job is to have a friendly, concise conversation to collect the visitor's contact information and understand what problem their business is facing, so the CrumbLabz team can follow up.

CONVERSATION FLOW:
1. Greet them warmly and ask for their name and company name to get started.
2. Once you have their name and company, ask for the best email and phone number to reach them at.
3. Now that you have their info, ask what's going on — what process in their business feels slow, manual, or frustrating? Use their first name.
4. Ask 1-2 short follow-up questions to understand the problem better (what tools they use today, how much time it wastes, how many people are affected, etc.). Don't interrogate — keep it conversational.
5. Once you have a solid understanding, thank them and let them know the CrumbLabz team will be in touch within 24 hours. Mention they'll receive an email with next steps including a link to book a free discovery call.

RULES:
- Keep responses SHORT — 2-3 sentences max. This is a chat, not an essay.
- Be warm and human. Use the visitor's first name once you have it.
- Don't use emojis.
- Don't make promises about pricing, timelines, or specific solutions.
- If someone asks about pricing, say "Every project is different — the CrumbLabz team will walk you through that on the discovery call. The initial conversation and problem mapping are completely free."
- If someone asks technical questions, answer briefly but redirect back to understanding their problem.
- Collect info in the order above: name/company first, then email/phone, then the headache. Don't skip ahead.
- Phone number is optional — if they don't provide one, that's fine.
- When you have collected: (1) name, (2) company, (3) email, and (4) a clear problem description — respond with your thank-you message AND include a JSON block at the very end of your message in this exact format:

|||INTAKE_COMPLETE|||
{"name": "Their Name", "company": "Their Company", "email": "their@email.com", "phone": "their phone or empty string", "headache": "A 2-3 sentence summary of the problem they described"}
|||END_INTAKE|||

The user will NOT see the JSON block — it will be parsed by the system. Your thank-you message should be the visible part.`;

function getClient() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not configured");
  return new Anthropic({ apiKey: key });
}

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const client = getClient();

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Check if intake is complete
    let intakeData = null;
    let visibleText = text;
    const intakeMatch = text.match(
      /\|\|\|INTAKE_COMPLETE\|\|\|\s*(\{[\s\S]*?\})\s*\|\|\|END_INTAKE\|\|\|/
    );
    if (intakeMatch) {
      try {
        intakeData = JSON.parse(intakeMatch[1]);
        visibleText = text.slice(0, text.indexOf("|||INTAKE_COMPLETE|||")).trim();
      } catch {
        // JSON parse failed — just return the full text
      }
    }

    return NextResponse.json({
      message: visibleText,
      intakeComplete: !!intakeData,
      intakeData,
    });
  } catch (err) {
    console.error("Chat intake error:", err);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
