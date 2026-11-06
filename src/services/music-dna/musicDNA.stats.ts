import mongoose from "mongoose";
import { LikedSong } from "../../Models/UserLikedSong.model.js";
import { RecentSongsPlaying } from "../../Models/RecentSongPlaying.model.js";
import { Stream } from "../../Models/Stream.modal.js";

const HISTORY_DAYS = 90;

export type MusicSummary = {
  title: string;
  artist: string;
  genre: string;
  language: string;
  playCount?: number;
};

export type MusicDNAStatistics = {
  historyCount: number;
  totalStreams: number;
  topGenres: string[];
  topArtists: string[];
  topTracks: MusicSummary[];
  recentTracks: MusicSummary[];
  likedTracks: MusicSummary[];
};

export async function collectMusicDNAStatistics(userId: string): Promise<MusicDNAStatistics> {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const since = new Date(Date.now() - HISTORY_DAYS * 24 * 60 * 60 * 1000);
  const streamRows = await Stream.aggregate<MusicSummary & { _id: mongoose.Types.ObjectId }>([
    { $match: { listenerId: userObjectId, createdAt: { $gte: since } } },
    { $group: { _id: "$musicId", playCount: { $sum: 1 } } },
    { $sort: { playCount: -1 } },
    { $limit: 50 },
    { $lookup: { from: "musics", localField: "_id", foreignField: "_id", as: "music" } },
    { $unwind: "$music" },
    {
      $project: {
        _id: 1,
        playCount: 1,
        title: "$music.musicTitle",
        artist: "$music.primaryArtistName",
        genre: "$music.Genre",
        language: "$music.Language",
      },
    },
  ]);

  const [recentRows, likedRows] = await Promise.all([
    RecentSongsPlaying.find({ user: userObjectId })
      .sort({ playedAt: -1 })
      .limit(20)
      .populate("music", "musicTitle primaryArtistName Genre Language")
      .lean(),
    LikedSong.find({ user: userObjectId })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("music", "musicTitle primaryArtistName Genre Language")
      .lean(),
  ]);

  const recentTracks = recentRows.flatMap((row) => toMusicSummary(row.music));
  const likedTracks = likedRows.flatMap((row) => toMusicSummary(row.music));
  const topTracks = streamRows.filter((row) => row.title && row.artist).slice(0, 15);
  const { topArtists, topGenres } = computeTopEntities(streamRows, recentTracks, likedTracks);

  return {
    historyCount: topTracks.length + recentTracks.length + likedTracks.length,
    totalStreams: topTracks.reduce((total, row) => total + (row.playCount ?? 0), 0),
    topGenres,
    topArtists,
    topTracks,
    recentTracks: recentTracks.slice(0, 10),
    likedTracks: likedTracks.slice(0, 10),
  };
}

export function createLimitedMusicDNAProfile(
  historyCount: number,
  topGenres: string[] = [],
  topArtists: string[] = [],
) {
  return {
    headline: "Your Music DNA is just getting started",
    personality: "We need a little more listening history to describe your musical personality.",
    topGenres,
    topArtists,
    listeningHabits: [`Listen to a few more songs to build your Music DNA (${historyCount} signals recorded so far).`],
    surprisingInsight: "Your listening story is still unfolding.",
    recommendationDirections: ["Play more songs", "Like songs you want us to remember"],
  };
}

function computeTopEntities(
  streamRows: (MusicSummary & { playCount?: number })[],
  recentTracks: MusicSummary[],
  likedTracks: MusicSummary[],
) {
  const artistCounts = new Map<string, number>();
  const genreCounts = new Map<string, number>();

  const record = (map: Map<string, number>, value: string | undefined, weight: number) => {
    if (!value) return;
    const clean = value.trim();
    if (!clean) return;
    map.set(clean, (map.get(clean) ?? 0) + weight);
  };

  for (const track of streamRows) {
    const weight = typeof track.playCount === "number" && track.playCount > 0 ? track.playCount : 1;
    record(artistCounts, track.artist, weight);
    record(genreCounts, track.genre, weight);
  }

  for (const track of recentTracks) {
    record(artistCounts, track.artist, 1);
    record(genreCounts, track.genre, 1);
  }

  for (const track of likedTracks) {
    record(artistCounts, track.artist, 2);
    record(genreCounts, track.genre, 2);
  }

  const topArtists = [...artistCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([artist]) => artist)
    .slice(0, 10);

  const topGenres = [...genreCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([genre]) => genre)
    .slice(0, 10);

  return { topArtists, topGenres };
}

function toMusicSummary(value: unknown): MusicSummary[] {
  if (!value || typeof value !== "object" || !("musicTitle" in value)) return [];
  const music = value as Record<string, unknown>;
  return [{
    title: String(music.musicTitle ?? ""),
    artist: String(music.primaryArtistName ?? ""),
    genre: String(music.Genre ?? ""),
    language: String(music.Language ?? ""),
  }];
}
