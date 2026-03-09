const FIREFLIES_API_URL = "https://api.fireflies.ai/graphql";

interface FirefliesSentence {
  speaker_name: string;
  text: string;
}

interface FirefliesTranscript {
  id: string;
  title: string;
  date: string;
  duration: number;
  sentences: FirefliesSentence[];
  summary: {
    overview: string;
    action_items: string;
    keywords: string[];
  } | null;
}

export async function fetchTranscript(
  transcriptId: string
): Promise<FirefliesTranscript | null> {
  const apiKey = process.env.FIREFLIES_API_KEY;
  if (!apiKey) {
    console.error("FIREFLIES_API_KEY not configured");
    return null;
  }

  const query = `
    query Transcript($transcriptId: String!) {
      transcript(id: $transcriptId) {
        id
        title
        date
        duration
        sentences {
          speaker_name
          text
        }
        summary {
          overview
          action_items
          keywords
        }
      }
    }
  `;

  const response = await fetch(FIREFLIES_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query,
      variables: { transcriptId },
    }),
  });

  if (!response.ok) {
    console.error("Fireflies API error:", response.status, await response.text());
    return null;
  }

  const result = await response.json();
  return result.data?.transcript || null;
}

export function formatTranscriptForAI(transcript: FirefliesTranscript): string {
  const header = `Meeting: ${transcript.title}\nDate: ${transcript.date}\nDuration: ${Math.round(transcript.duration / 60)} minutes\n`;

  const summarySection = transcript.summary?.overview
    ? `\nAI Summary:\n${transcript.summary.overview}\n`
    : "";

  const conversationLines = transcript.sentences
    .map((s) => `${s.speaker_name}: ${s.text}`)
    .join("\n");

  return `${header}${summarySection}\n---\nFull Transcript:\n\n${conversationLines}`;
}
