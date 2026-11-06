import { toFile } from "groq-sdk/uploads";
import Groq from "groq-sdk";
import mongoose from "mongoose";
import { Apierror } from "../../utils/Apierror.js";
import { ChatSession } from "../../Models/chat-session.model.js";
import { Playlist } from "../../Models/playlist.model.js";
import { runAgent } from "./agent.orchestrator.js";

const SESSION_INACTIVITY_MS = 15 * 60 * 1000;
export async function processVoiceAgent(userId: string, file: Express.Multer.File) {
    if (!process.env.GROQ_API_KEY) {
        throw new Apierror(500, "Voice agent is not configured.");
    }
    const transcription = await new Groq({ apiKey: process.env.GROQ_API_KEY, timeout: 30_000 }).audio.transcriptions.create({
        file: await toFile(file.buffer, file.originalname || "voice.m4a", { type: file.mimetype }),
        model: process.env.GROQ_TRANSCRIPTION_MODEL || "whisper-large-v3-turbo",
        response_format: "json",
        temperature: 0,
    });
    const text = transcription.text?.trim();
    if (!text) throw new Apierror(422, "No speech was detected");

    const cutoff = new Date(Date.now() - SESSION_INACTIVITY_MS);
    //15 min sliding window to find the most recent active session for the user
    let chatSession = await ChatSession.findOne({
        user: userId,
        updatedAt: { $gte: cutoff },
        status: { $ne: "failed" },
    }).sort({ updatedAt: -1 });

    const historyMessages = chatSession ? chatSession.messages.slice(-4) : [];

    // Resolve the active playlist from the session or recently updated by the user
    let activePlaylist: { _id: mongoose.Types.ObjectId; name: string } | null = null;
    if (chatSession?.playlist) {
        activePlaylist = await Playlist.findOne({
            _id: chatSession.playlist,
            owner: userId,
        }).select("_id name").lean();
    }
    if (!activePlaylist) {
        activePlaylist = await Playlist.findOne({
            owner: userId,
        }).sort({ updatedAt: -1 }).select("_id name").lean();
    }

    if (chatSession) {
        await ChatSession.findByIdAndUpdate(chatSession._id, {
            $push: { messages: { role: "user", content: text, createdAt: new Date() } },
            $set: { status: "processing" },
        });
    } else {
        chatSession = await ChatSession.create({
            user: userId,
            messages: [{ role: "user", content: text, createdAt: new Date() }],
            status: "processing",
        });
    }

    try {
        const result = await runAgent(userId, text, {
            history: historyMessages.map((m) => ({
                role: m.role as "user" | "assistant",
                content: m.content,
            })),
            activePlaylist: activePlaylist ? { _id: activePlaylist._id.toString(), name: activePlaylist.name } : null,
        });

        const playlistId = getPlaylistId(result.playlist);

        const updateSet: Record<string, unknown> = { status: "completed" };
        const updateUnset: Record<string, unknown> = {};

        if (result.action === "deleted") {
            updateUnset.playlist = 1;
        } else if (playlistId) {
            updateSet.playlist = playlistId;
        }

        await ChatSession.findByIdAndUpdate(chatSession._id, {
            $push: { messages: { role: "assistant", content: result.message, createdAt: new Date() } },
            $set: updateSet,
            ...(Object.keys(updateUnset).length > 0 ? { $unset: updateUnset } : {}),
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
