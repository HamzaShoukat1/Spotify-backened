import { Stream } from "../Models/Stream.modal.js";
import { asynchandler } from "../utils/Asynchandler.js";
import { Apierror } from "../utils/Apierror.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import mongoose from "mongoose";
import { Artist } from "../Models/artist.model.js";
import { Music } from "../Models/music.model.js";
import { DailyListeningUsage } from "../Models/DailyListeningUsage.model.js";
import { ListeningSession } from "../Models/ListeningSession.model.js";

const FREE_DAILY_LISTEN_LIMIT = 3;
const MINIMUM_LISTEN_DURATION_MS = 2 * 60 * 1000;

function getUtcUsageDate(date = new Date()): string {
    return date.toISOString().slice(0, 10);
}

async function reserveFreeListen(userId: mongoose.Types.ObjectId, usageDate: string) {
    const updatedUsage = await DailyListeningUsage.findOneAndUpdate(
        {
            user: userId,
            usageDate,
            listenCount: { $lt: FREE_DAILY_LISTEN_LIMIT }
        },
        { $inc: { listenCount: 1 } },
        { returnDocument: "after" },
    );

    if (updatedUsage) return updatedUsage;

    try {
        return await DailyListeningUsage.create({
            user: userId,
            usageDate,
            listenCount: 1,
        });
    } catch (error) {
        if ((error as { code?: number })?.code !== 11000) throw error;

        const retriedUsage = await DailyListeningUsage.findOneAndUpdate(
            {
                user: userId,
                usageDate,
                listenCount: { $lt: FREE_DAILY_LISTEN_LIMIT },
            },
            { $inc: { listenCount: 1 } },
            { returnDocument: "after" },
        );

        if (!retriedUsage)
            throw new Apierror(429, "You have reached today's free listening limit");
        return retriedUsage;
    }
};

export const startListening = asynchandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId || !mongoose.isValidObjectId(userId)) {
        throw new Apierror(401, "Unauthorized: valid listener not found");
    }

    const { musicId } = req.body as { musicId?: string };
    if (!musicId || !mongoose.isValidObjectId(musicId)) {
        throw new Apierror(400, "A valid musicId is required");
    }

    const musicExists = await Music.exists({ _id: musicId });
    if (!musicExists) throw new Apierror(404, "Music not found");

    const now = new Date();
    const isPremiumUser = req.user?.planTier === "premium"
        // req.user?.planTier === "premium" ||
        // Boolean(
        //     await Subscription.exists({
        //         user: userId,
        //         status: { $in: ["active", "trialing"] },
        //         currentPeriodEnd: { $gt: now },
        //     })
        // );

    if (isPremiumUser) {
        return res.status(200).json(
            new Apiresponse(
                200,
                {
                    allowed: true,
                    isPremium: true,
                    sessionId: null,
                    remaining: null,
                    dailyLimit: null,
                },
                "Premium listening allowed",
            ),
        );
    }

    const usageDate = getUtcUsageDate(now);
    const usage = await DailyListeningUsage.findOne({
        user: userId,
        usageDate,
    }).lean();
    const completedCount = usage?.listenCount ?? 0;
    if (completedCount >= FREE_DAILY_LISTEN_LIMIT) {
        throw new Apierror(429, "You have reached today's free listening limit");
    }

    const session = await ListeningSession.create({
        user: userId,
        music: musicId,
        usageDate,
        startedAt: now,
        status: "started",
    });

    return res.status(200).json(
        new Apiresponse(
            200,
            {
                allowed: true,
                isPremium: false,
                sessionId: session._id,
                remaining: Math.max(FREE_DAILY_LISTEN_LIMIT - completedCount, 0),
                dailyLimit: FREE_DAILY_LISTEN_LIMIT,
            },
            "Listening session started",
        ),
    );
});

export const completeListening = asynchandler(async (req, res) => {
    const userId = req.user?._id;
    const { sessionId, isCompleted } = req.body as { sessionId?: string; isCompleted?: boolean };

    if (!userId || !mongoose.isValidObjectId(userId))
        throw new Apierror(401, "Unauthorized");

    if (req.user?.planTier === "premium") {
        return res
            .status(200)
            .json(
                new Apiresponse(
                    200,
                    { counted: false, isPremium: true, remaining: null, thresholdReached: false },
                    "Premium listening does not count towards daily limits",
                ),
            );
    }

    if (!sessionId || !mongoose.isValidObjectId(sessionId))
        throw new Apierror(400, "A valid sessionId is required");

    const session = await ListeningSession.findOne({
        _id: sessionId,
        user: userId,
    }).lean();
    if (!session) throw new Apierror(404, "Listening session not found");

    if (session.status === "completed") {
        const usage = await DailyListeningUsage.findOne({
            user: userId,
            usageDate: session.usageDate,
        }).lean();
        const count = usage?.listenCount ?? 0;
        return res
            .status(200)
            .json(
                new Apiresponse(
                    200,
                    {
                        counted: true,
                        listenCount: count,
                        remaining: Math.max(FREE_DAILY_LISTEN_LIMIT - count, 0),
                        dailyLimit: FREE_DAILY_LISTEN_LIMIT,
                        thresholdReached: count >= FREE_DAILY_LISTEN_LIMIT,
                    },
                    "Listening session already counted",
                ),
            );
    }

    const elapsedMs = Date.now() - session.startedAt.getTime();
    if (!isCompleted && elapsedMs < MINIMUM_LISTEN_DURATION_MS) {
        throw new Apierror(400, "At least two minutes of listening is required");
    }

    const claimedSession = await ListeningSession.findOneAndUpdate(
        { _id: session._id, user: userId, status: "started" },
        { status: "completed", completedAt: new Date() },
        { returnDocument: "after" },
    );
    if (!claimedSession) {
        return res
            .status(200)
            .json(
                new Apiresponse(
                    200,
                    { counted: true },
                    "Listening session already counted",
                ),
            );
    }

    let usage;
    try {
        usage = await reserveFreeListen(userId, session.usageDate);
    } catch (error) {
        await ListeningSession.updateOne(
            { _id: session._id, user: userId, status: "completed" },
            { status: "started", $unset: { completedAt: 1 } },
        );
        throw error;
    }

    const remaining = Math.max(FREE_DAILY_LISTEN_LIMIT - usage.listenCount, 0);
    const thresholdReached = usage.listenCount >= FREE_DAILY_LISTEN_LIMIT;

    return res.status(200).json(
        new Apiresponse(
            200,
            {
                counted: true,
                listenCount: usage.listenCount,
                remaining,
                dailyLimit: FREE_DAILY_LISTEN_LIMIT,
                thresholdReached,
            },
            thresholdReached
                ? "Daily free listen limit reached"
                : "Listening session counted",
        ),
    );
});

const trackStream = asynchandler(async (req, res) => {
    const { musicId } = req.body;

    const listenerId = req.user?._id;

    if (!listenerId || !mongoose.isValidObjectId(listenerId)) {
        throw new Apierror(401, "Unauthorized: valid listener not found");
    }

    if (!musicId || !mongoose.isValidObjectId(musicId)) {
        throw new Apierror(400, "A valid musicId is required");
    }

    const music = await Music.findById(musicId).select("_id uploadedBy");

    if (!music) {
        throw new Apierror(404, "Music not found");
    }

    const artist = await Artist.findOne({
        user: music.uploadedBy,
    })
        .select("_id")
        .lean();

    if (!artist) {
        throw new Apierror(404, "Artist associated with this music was not found");
    }

    const artistId = (artist as { _id: mongoose.Types.ObjectId })._id;

    const newStream = await Stream.create({
        musicId: music._id,
        artistId,
        listenerId,
    });

    // await RecentSongsPlaying.create({
    //     user: listenerId,
    //     music: music._id,
    // });

    return res
        .status(201)
        .json(new Apiresponse(201, newStream, "Stream metric saved successfully"));
});
const getArtistDashboard = asynchandler(async (req, res) => {
    const userId = req.user?._id ?? req.user?.id;

    if (!userId || !mongoose.isValidObjectId(userId)) {
        throw new Apierror(401, "Unauthorized");
    }

    const rangeDaysMap = {
        "7d": 7,
        "30d": 30,
        "120d": 120,
        "360d": 360,
    } as const;

    type AnalyticsRange = keyof typeof rangeDaysMap;

    const requestedRange = String(req.query.range);

    const range: AnalyticsRange =
        requestedRange in rangeDaysMap ? (requestedRange as AnalyticsRange) : "7d";

    const days = rangeDaysMap[range];

    const artist = await Artist.findOne({
        user: userId,
    }).select("_id name");

    if (!artist) {
        throw new Apierror(404, "Artist profile not found");
    }

    const now = new Date();

    const startDate = new Date(now);
    startDate.setUTCHours(0, 0, 0, 0);
    startDate.setUTCDate(startDate.getUTCDate() - (days - 1));

    const stats = await Stream.aggregate([
        {
            $match: {
                artistId: artist._id,
                createdAt: {
                    $gte: startDate,
                    $lte: now,
                },
            },
        },
        {
            $facet: {
                totalStreams: [
                    {
                        $count: "count",
                    },
                ],

                uniqueListeners: [
                    {
                        $match: {
                            listenerId: {
                                $exists: true,
                                $ne: null,
                            },
                        },
                    },
                    {
                        $group: {
                            _id: "$listenerId",
                        },
                    },
                    {
                        $count: "count",
                    },
                ],

                topSongs: [
                    {
                        $group: {
                            _id: "$musicId",
                            count: {
                                $sum: 1,
                            },
                        },
                    },
                    {
                        $sort: {
                            count: -1,
                        },
                    },
                    {
                        $limit: 5,
                    },
                    {
                        $lookup: {
                            from: Music.collection.name,
                            localField: "_id",
                            foreignField: "_id",
                            as: "musicDetails",
                        },
                    },
                    {
                        $unwind: "$musicDetails",
                    },
                    {
                        $project: {
                            _id: 1,
                            count: 1,
                            title: "$musicDetails.musicTitle",
                            coverUrl: "$musicDetails.coverPhoto.url",
                        },
                    },
                ],

                timelineData: [
                    {
                        $group: {
                            _id: {
                                $dateToString: {
                                    format: "%Y-%m-%d",
                                    date: "$createdAt",
                                    timezone: "UTC",
                                },
                            },
                            count: {
                                $sum: 1,
                            },
                        },
                    },
                    {
                        $sort: {
                            _id: 1,
                        },
                    },
                ],
            },
        },
    ]);

    const output = stats[0];

    const streamCounts = new Map(
        output.timelineData.map((item: any) => [item._id, item.count]),
    );

    const timelineData = Array.from({ length: days }, (_, i) => {
        const date = new Date(startDate);
        date.setUTCDate(date.getUTCDate() + i);
        const dateKey = date.toISOString().slice(0, 10);

        return { date: dateKey, value: streamCounts.get(dateKey) ?? 0 };
    });

    const dashboardData = {
        artist: {
            id: artist._id.toString(),
            name: artist.name,
        },

        range,
        days,

        totalStreams: output.totalStreams[0]?.count ?? 0,

        uniqueListeners: output.uniqueListeners[0]?.count ?? 0,

        topSongs: output.topSongs.map(
            (song: {
                _id: mongoose.Types.ObjectId;
                count: number;
                title: string;
                coverUrl?: string;
            }) => ({
                _id: song._id.toString(),
                count: song.count,
                title: song.title,
                coverUrl: song.coverUrl,
            }),
        ),

        timelineData,
    };

    return res
        .status(200)
        .json(
            new Apiresponse(
                200,
                dashboardData,
                "Artist dashboard statistics fetched successfully",
            ),
        );
});

export { trackStream, getArtistDashboard };
