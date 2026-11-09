import Groq from "groq-sdk";
import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions.js";
import { Playlist } from "../../Models/playlist.model.js";
import { Apierror } from "../../utils/Apierror.js";
import { agentSystemPrompt } from "./agent.prompts.js";
import { agentTools } from "./agent.tools.js";
import { addSongsToPlaylist, validateAddSongsArgs } from "./tools/addSongsToPlaylist.tool.js";
import { createPlaylist, validateCreatePlaylistArgs } from "./tools/createPlaylist.tool.js";
import { searchSongs, validateSearchSongsArgs } from "./tools/searchSongs.tool.js";
import { deletePlaylist, validateDeletePlaylistArgs } from "./tools/deletePlaylist.tool.js";

const maxSteps = 6;
type AgentAction = "none" | "created" | "added" | "removed" | "deleted";

function getGroqClient() {
    return new Groq({ apiKey: process.env.GROQ_API_KEY, timeout: 30_000 });
}

async function cleanupEmptyPlaylist(playlistId: string | null, userId: string) {
    if (!playlistId) return;
    try {
        await Playlist.findOneAndDelete({
            _id: playlistId,
            owner: userId,
            songs: { $size: 0 },
        });
    } catch {
        // ignore cleanup error
    }
}

export type AgentContext = {
    history?: { role: "user" | "assistant"; content: string }[];
    activePlaylist?: { _id: string; name: string } | null;
    mood?: string;
};
export async function runAgent(userId: string, transcription: string, context?: AgentContext) {
    let systemPrompt = agentSystemPrompt;
    if (context?.mood) {
        systemPrompt += `\nUser's detected current mood: "${context.mood}". Tailor thematic searches or playlist generation names to match this aura if applicable.`;
    }

    if (context?.activePlaylist) {
        systemPrompt += `\nCurrently active playlist context: "${context.activePlaylist.name}" (ID: ${context.activePlaylist._id}). If the user refers to "it", "this playlist", or "that playlist" without naming another, prioritize this active playlist.`;
    }

    const historyMessages: ChatCompletionMessageParam[] = (context?.history || []).map((m) => ({
        role: m.role,
        content: m.content,
    }));

    const messages: ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
        ...historyMessages,
        { role: "user", content: transcription },
    ];
    let playlist: unknown = null;
    let action: AgentAction = "none";
    let createdPlaylistId: string | null = null;

    try {
        for (let step = 0; step < maxSteps; step += 1) {
            const completion = await getGroqClient().chat.completions.create({
                model: process.env.GROQ_AGENT_MODEL || "openai/gpt-oss-120b",
                temperature: 0.1,
                reasoning_effort: "low",
                messages,
                tools: agentTools,
                tool_choice: "auto",
                parallel_tool_calls: false,
            });
            const message = completion.choices[0]?.message;
            if (!message) throw new Apierror(502, "AI returned an empty response");
            messages.push(message as ChatCompletionMessageParam);

            if (!message.tool_calls?.length) {
                return { action, message: message.content?.trim() || "I could not complete that request.", playlist };
            }

            for (const call of message.tool_calls) {
                const toolCall = call as { id: string; function: { name: string; arguments: string } };
                let result: unknown;
                try {
                    let args: unknown;
                    try {
                        args = JSON.parse(toolCall.function.arguments || "{}");
                    } catch {
                        if (toolCall.function.name === "addSongsToPlaylist" && createdPlaylistId) {
                            await cleanupEmptyPlaylist(createdPlaylistId, userId);
                        }
                        throw new Apierror(502, "AI returned invalid tool arguments");
                    }

                    switch (toolCall.function.name) {
                        case "searchSongs":
                            result = await searchSongs(userId, validateSearchSongsArgs(args));
                            break;

                        case "createPlaylist":
                            result = await createPlaylist(userId, validateCreatePlaylistArgs(args));
                            playlist = result;
                            action = "created";
                            createdPlaylistId = (result as { _id?: string })._id ?? null;
                            break;

                        case "addSongsToPlaylist":
                            try {
                                result = await addSongsToPlaylist(userId, validateAddSongsArgs(args));
                                playlist = result;
                                action = "added";
                            } catch (error) {
                                if (createdPlaylistId) {
                                    await cleanupEmptyPlaylist(createdPlaylistId, userId);
                                    if (playlist && typeof playlist === "object" && "_id" in playlist && (playlist as { _id: string })._id === createdPlaylistId) {
                                        playlist = null;
                                        action = "none";
                                    }
                                }
                                throw error;
                            }
                            break;

                        case "deletePlaylist":
                            result = await deletePlaylist(userId, validateDeletePlaylistArgs(args));
                            action = "deleted";
                            break;

                        default:
                            throw new Apierror(400, "AI requested an unsupported tool");
                    }
                } catch (error) {
                    throw error;
                }
                messages.push({ role: "tool", tool_call_id: toolCall.id, content: JSON.stringify(result) });
            }
        };
        throw new Apierror(504, "AI agent reached its execution limit");
    } catch (error) {
        if (createdPlaylistId) {
            await cleanupEmptyPlaylist(createdPlaylistId, userId);
        }
        throw error;
    }
}