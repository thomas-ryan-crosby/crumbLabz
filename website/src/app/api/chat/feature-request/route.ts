import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are the CrumbLabz feature request assistant. You help clients and team members articulate feature requests for software projects built by CrumbLabz.

Your job is to have a focused conversation to understand what the user wants built or changed, then produce one or more structured feature requests.

CONVERSATION FLOW:
1. Ask what they'd like to see added, changed, or improved.
2. Ask 1-2 clarifying questions: What problem does this solve? Who uses it? How do they do it today? What would "done" look like?
3. If the request is actually multiple features, identify each one separately.
4. Once you understand the request(s), summarize what you'll submit and ask them to confirm.
5. After confirmation, output the structured data.

RULES:
- Keep responses SHORT — 2-3 sentences max.
- Be conversational and helpful. Don't use jargon.
- Don't use emojis.
- If a request is vague, ask for specifics. "Make it better" needs clarification.
- Help the user think through priority: Is this blocking their work (high), would be nice to have soon (medium), or a future wish (low)?
- You can create multiple feature requests from one conversation if the user describes multiple things.
- When the user confirms the request(s), output your confirmation message AND include a JSON block at the very end:

|||FEATURES_COMPLETE|||
[{"title": "Short descriptive title", "description": "2-3 sentence description of what needs to be built and why", "priority": "low|medium|high"}]
|||END_FEATURES|||

The JSON should be an array — even if there's only one request. The user will NOT see the JSON block.`;

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
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    let featuresData = null;
    let visibleText = text;
    const match = text.match(
      /\|\|\|FEATURES_COMPLETE\|\|\|\s*(\[[\s\S]*?\])\s*\|\|\|END_FEATURES\|\|\|/
    );
    if (match) {
      try {
        featuresData = JSON.parse(match[1]);
        visibleText = text.slice(0, text.indexOf("|||FEATURES_COMPLETE|||")).trim();
      } catch {
        // parse failed — return full text
      }
    }

    return NextResponse.json({
      message: visibleText,
      featuresComplete: !!featuresData,
      features: featuresData,
    });
  } catch (err) {
    console.error("Feature request chat error:", err);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
