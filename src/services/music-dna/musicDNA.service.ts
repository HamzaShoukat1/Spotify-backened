import type { MusicDNAProfile } from "../../Models/music-dna.model.js";
import { getCachedMusicDNA, saveMusicDNACache } from "./musicDNA.cache.js";
import { generateMusicDNAProfile } from "./musicDNA.groq.js";
import { createLimitedMusicDNAProfile, collectMusicDNAStatistics } from "./musicDNA.stats.js";

const MINIMUM_HISTORY_ITEMS = 3;

export async function getMusicDNA(userId: string, refresh = false) {
  if (!refresh) {
    const cached = await getCachedMusicDNA(userId);
    if (cached) {
      return {
        profile: cached.profile,
        generatedAt: cached.generatedAt,
        isCached: true,
        isLimitedData: cached.isLimitedData,
      };
    }
  }

  const statistics = await collectMusicDNAStatistics(userId);
  const isLimitedData = statistics.historyCount < MINIMUM_HISTORY_ITEMS;
  const profile: MusicDNAProfile = isLimitedData
    ? createLimitedMusicDNAProfile(statistics.historyCount)
    : await generateMusicDNAProfile(statistics);

  return saveMusicDNACache(userId, profile, isLimitedData);
}
