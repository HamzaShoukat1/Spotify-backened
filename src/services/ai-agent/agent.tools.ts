import type { ChatCompletionTool } from "groq-sdk/resources/chat/completions.js";

export const agentTools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "searchSongs",
      description: "Search the existing catalogue by title, artist, genre, language, or emotional/situational mood context.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Song title, artist text, or semantic search keywords" },
          genre: { type: "string", description: "Genre or genres, for example Hindi or Pop" },
          language: { type: "string", description: "Language, for example Hindi or English" },
          mood: {
            type: "string",
            description: "The mood or energy level extracted from user context (e.g., energetic, relaxed, sad, happy, dark, focus, workout)."
          },
          limit: { type: "number", description: "Maximum number of songs to return" },
          excludeLiked: { type: "boolean", description: "Whether to exclude the user's liked songs" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "createPlaylist",
      description: "Create a playlist owned by the authenticated user. Can be themed around a requested mood or vibe.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 1, maxLength: 100, description: "Descriptive name for the playlist, incorporating the mood context if provided" },
          mood: { type: "string", description: "Optional underlying mood tag tied to this playlist initialization" }
        },
        required: ["name"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "addSongsToPlaylist",
      description: "Add catalogue songs to a playlist owned by the authenticated user.",
      parameters: {
        type: "object",
        properties: {
          playlistId: { type: "string" },
          playlistName: { type: "string", description: "Existing playlist name when the user named a playlist" },
          songIds: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 50 },
        },
        required: ["songIds"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "deletePlaylist",
      description: "Delete a playlist owned by the authenticated user when the user explicitly requests deletion.",
      parameters: {
        type: "object",
        properties: {
          playlistId: { type: "string" },
          playlistName: { type: "string", description: "Existing playlist name when the user named it" },
          all: { type: "boolean", description: "Set true only when the user explicitly asks to delete all playlists" },
        },
        additionalProperties: false,
      },
    },
  },
];
