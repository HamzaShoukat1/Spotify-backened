import Groq from "groq-sdk";
import { Apierror } from "../../utils/Apierror.js";
import type { MusicDNAProfile } from "../../Models/music-dna.model.js";
import type { MusicDNAStatistics } from "./musicDNA.stats.js";
import { musicDNASystemPrompt } from "./musicDNA.prompt.js";
import { parseMusicDNAResponse } from "./musicDNA.validation.js";

export async function generateMusicDNAProfile(statistics: MusicDNAStatistics): Promise<MusicDNAProfile> {
  if (!process.env.GROQ_API_KEY) throw new Apierror(500, "Music DNA is not configured");

  const response = await new Groq({ apiKey: process.env.GROQ_API_KEY, timeout: 30_000 }).chat.completions.create({
    model: process.env.GROQ_DNA_MODEL || process.env.GROQ_AGENT_MODEL || "openai/gpt-oss-120b",
    reasoning_effort: "low",
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: musicDNASystemPrompt },
      { role: "user", content: JSON.stringify(statistics) },
    ],
  });

  const content = response.choices[0]?.message.content;
  if (!content) throw new Apierror(502, "Music DNA AI returned an empty response");
  return parseMusicDNAResponse(content);
}
