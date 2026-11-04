import Groq from "groq-sdk";
import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions.js";
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

export async function runAgent(userId: string, transcription: string) {
    const messages: ChatCompletionMessageParam[] = [
        { role: "system", content: agentSystemPrompt },
        { role: "user", content: transcription },
    ];
    let playlist: unknown = null;
    let action: AgentAction = "none";

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
                const args: unknown = JSON.parse(toolCall.function.arguments || "{}");
                if (toolCall.function.name === "searchSongs") result = await searchSongs(userId, validateSearchSongsArgs(args));
                else if (toolCall.function.name === "createPlaylist") {
                    result = await createPlaylist(userId, validateCreatePlaylistArgs(args));
                    playlist = result;
                    action = "created";
                } else if (toolCall.function.name === "addSongsToPlaylist") {
                    result = await addSongsToPlaylist(userId, validateAddSongsArgs(args));
                    playlist = result;
                    action = "added";
                } else if (toolCall.function.name === "deletePlaylist") {
                    result = await deletePlaylist(userId, validateDeletePlaylistArgs(args));
                    action = "deleted";
                } else throw new Apierror(400, "AI requested an unsupported tool");
            } catch (error) {
                if (error instanceof SyntaxError) throw new Apierror(502, "AI returned invalid tool arguments");
                throw error;
            }
            messages.push({ role: "tool", tool_call_id: toolCall.id, content: JSON.stringify(result) });
        }
    };
    throw new Apierror(504, "AI agent reached its execution limit");
}
