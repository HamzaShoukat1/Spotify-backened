import { Apierror } from "../../utils/Apierror.js";
import type { MusicDNAProfile } from "../../Models/music-dna.model.js";
import { z } from "zod";

const profileText = z.string().trim().min(1).max(1000); 
const profileList = z.array(z.string().trim().min(1).max(250)).max(20); 

export const musicDNAProfileSchema = z.object({
  headline: z.string().trim().min(1).max(200),
  personality: profileText,
  
  topGenres: profileList.catch([]),
  topArtists: profileList.catch([]),
  listeningHabits: profileList.catch([]),
  
  surprisingInsight: profileText.catch("No surprising insights found."),
  recommendationDirections: profileList.catch([]),
});

export function parseMusicDNAResponse(content: string): MusicDNAProfile {
  let cleanedContent = content.trim();
  
  try {
    const match = content.match(/```(?:json)?\s*([\s\(\S\)]*?)\s*```/);
    if (match && match[1]) {
      cleanedContent = match[1].trim();
    }

    const value = JSON.parse(cleanedContent);
    return validateMusicDNAProfile(value);
  } catch (error) {
    if (error instanceof Apierror) throw error;
    


    throw new Apierror(502, "Music DNA AI returned invalid JSON structure");
  }
}

export function validateMusicDNAProfile(value: unknown): MusicDNAProfile {
  const result = musicDNAProfileSchema.safeParse(value);
  
  if (!result.success) {
    console.error(" Zod Validation Failed:", JSON.stringify(result.error.format(), null, 2));
    console.error(" Value Object:", JSON.stringify(value, null, 2));
    
    throw new Apierror(502, "Music DNA AI returned an invalid profile structure");
  }
  
  return result.data;
}
