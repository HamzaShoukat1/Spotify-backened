import { Apierror } from "../../utils/Apierror.js";
import type { MusicDNAProfile } from "../../Models/music-dna.model.js";

export function parseMusicDNAResponse(content: string): MusicDNAProfile {
  try {
    const value = JSON.parse(content.replace(/^```json\s*|\s*```$/g, ""));
    return validateMusicDNAProfile(value);
  } catch (error) {
    if (error instanceof Apierror) throw error;
    throw new Apierror(502, "Music DNA AI returned invalid JSON");
  }
}

export function validateMusicDNAProfile(value: unknown): MusicDNAProfile {
  if (!value || typeof value !== "object") {
    throw new Apierror(502, "Music DNA AI returned an invalid profile");
  }
  const data = value as Record<string, unknown>;
  const requiredText = ["headline", "personality", "surprisingInsight"];
  const arrayFields = ["topGenres", "topArtists", "listeningHabits", "recommendationDirections"];

  if (requiredText.some((key) => typeof data[key] !== "string")) {
    throw new Apierror(502, "Music DNA AI returned an incomplete profile");
  }
  if (arrayFields.some((key) => !isStringArray(data[key]))) {
    throw new Apierror(502, "Music DNA AI returned invalid profile lists");
  }

  return {
    headline: data.headline as string,
    personality: data.personality as string,
    surprisingInsight: data.surprisingInsight as string,
    topGenres: data.topGenres as string[],
    topArtists: data.topArtists as string[],
    listeningHabits: data.listeningHabits as string[],
    recommendationDirections: data.recommendationDirections as string[],
  };
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}
