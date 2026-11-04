import type { ChatCompletionTool } from "groq-sdk/resources/chat/completions.js";

export const agentTools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "searchSongs",
      description: "Search the existing catalogue. Genre and language are supported metadata; mood is not available.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Song title or artist text" },
          genre: { description: "Genre or genres, for example Hindi or [Hindi, Pop]" },
          language: { description: "Language, for example Hindi or English" },
          mood: { description: "Optional mood preference; mood is not stored as catalogue metadata" },
          limit: { description: "Maximum number of songs" },
          excludeLiked: { description: "Whether to exclude the user's liked songs" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "createPlaylist",
      description: "Create a playlist owned by the authenticated user.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 1, maxLength: 100 },
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
