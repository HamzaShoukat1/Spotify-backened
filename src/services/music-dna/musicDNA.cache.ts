import { MusicDNA, type MusicDNAProfile } from "../../Models/music-dna.model.js";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export async function getCachedMusicDNA(userId: string) {
  return MusicDNA.findOne({ user: userId, expiresAt: { $gt: new Date() } }).lean();
}

export async function saveMusicDNACache(userId: string, profile: MusicDNAProfile, isLimitedData: boolean) {
  const generatedAt = new Date();
  const saved = await MusicDNA.findOneAndUpdate(
    { user: userId },
    {
      $set: {
        profile,
        generatedAt,
        expiresAt: new Date(generatedAt.getTime() + CACHE_TTL_MS),
        isLimitedData,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();

  return {
    profile: saved.profile,
    generatedAt: saved.generatedAt,
    isCached: false,
    isLimitedData: saved.isLimitedData,
  };
}
