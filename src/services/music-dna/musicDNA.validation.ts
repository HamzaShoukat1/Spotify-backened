import { Apierror } from "../../utils/Apierror.js";
import type { MusicDNAProfile } from "../../Models/music-dna.model.js";
import { z } from "zod";

const profileText = z.string().trim().min(1).max(500);
const profileList = z.array(z.string().trim().min(1).max(160)).max(10);

export const musicDNAProfileSchema = z.object({
  headline: profileText.max(120),
  personality: profileText,
  topGenres: profileList,
  topArtists: profileList,
  listeningHabits: profileList,
  surprisingInsight: profileText,
  recommendationDirections: profileList,
});

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
  const result = musicDNAProfileSchema.safeParse(value);
  if (!result.success) throw new Apierror(502, "Music DNA AI returned an invalid profile");
  return result.data;
}
