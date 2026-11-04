import { toFile } from "groq-sdk/uploads";
import Groq from "groq-sdk";
import { Apierror } from "../../utils/Apierror.js";
import { ChatSession } from "../../Models/chat-session.model.js";
import { runAgent } from "./agent.orchestrator.js";

export async function processVoiceAgent(userId: string, file: Express.Multer.File) {
    if (!process.env.GROQ_API_KEY) {
        throw new Apierror(500, "Voice agent is not configured. Add GROQ_API_KEY to Spotify-backend/.env and restart the backend.");
    }
    const transcription = await new Groq({ apiKey: process.env.GROQ_API_KEY, timeout: 30_000 }).audio.transcriptions.create({
        file: await toFile(file.buffer, file.originalname || "voice.m4a", { type: file.mimetype }),
        model: process.env.GROQ_TRANSCRIPTION_MODEL || "whisper-large-v3-turbo",
        response_format: "json",
        temperature: 0,
    });
    const text = transcription.text?.trim();
    if (!text) throw new Apierror(422, "No speech was detected");

    const chatSession = await ChatSession.create({
        user: userId,
        messages: [{ role: "user", content: text }],
        status: "processing",
    });

    try {
        const result = await runAgent(userId, text);
        const playlistId = getPlaylistId(result.playlist);

        await ChatSession.findByIdAndUpdate(chatSession._id, {
            $push: { messages: { role: "assistant", content: result.message } },
            $set: {
                status: "completed",
                ...(playlistId ? { playlist: playlistId } : {}),
            },
        });

        return { chatSessionId: chatSession._id.toString(), transcription: text, ...result };
    } catch (error) {
        await ChatSession.findByIdAndUpdate(chatSession._id, {
            $set: {
                status: "failed",
                errorMessage: error instanceof Apierror ? error.message : "Agent request failed",
            },
        });
        throw error;
    }
}

function getPlaylistId(value: unknown) {
    if (!value || typeof value !== "object" || !("_id" in value)) return undefined;
    const id = value._id;
    return typeof id === "string" && id.length > 0 ? id : undefined;
}
