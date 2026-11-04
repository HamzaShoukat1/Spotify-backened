import { Stream } from "../Models/Stream.modal.js";
import { asynchandler } from "../utils/Asynchandler.js";
import { Apierror } from "../utils/Apierror.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import mongoose from "mongoose";
import { Artist } from "../Models/artist.model.js";
import { Music } from "../Models/music.model.js";
import { DailyListeningUsage } from "../Models/DailyListeningUsage.model.js";
import { Subscription } from "../Models/subscription.modal.js";
import { User } from "../Models/user.model.js";
import { stripe } from "../config/stripe.js";
import { RecentSongsPlaying } from "../Models/RecentSongPlaying.model.js";

const FREE_DAILY_LISTEN_LIMIT = 3;

function getUtcUsageDate(date = new Date()): string {
    return date.toISOString().slice(0, 10);
};

async function hasPremiumAccess(userId: mongoose.Types.ObjectId, planTier?: string) {
    if (planTier === "premium") return true;

    const activeSubscription = await Subscription.exists({
        user: userId,
        status: { $in: ["active", "trialing"] },
        currentPeriodEnd: { $gt: new Date() },
    });
    if (activeSubscription) {
        await User.updateOne(
            { _id: userId, planTier: { $ne: "premium" } },
            { $set: { planTier: "premium" } },
        );
        return true;
    }

    const pendingSubscription = await Subscription.findOne({
        user: userId,
        status: "incomplete",
    }).sort({ createdAt: -1 });
    if (!pendingSubscription) return false;

    let stripeSubscription;
    try {
        stripeSubscription = await stripe.subscriptions.retrieve(
            pendingSubscription.stripeSubscriptionId,
        );
    } catch (error) {
        console.error("Failed to verify pending Stripe subscription:", error);
        throw new Apierror(503, "Unable to verify your subscription right now. Please try again.");
    }

    const stripeCustomerId = typeof stripeSubscription.customer === "string"
        ? stripeSubscription.customer
        : stripeSubscription.customer.id;
    const periodEnd = new Date(stripeSubscription.current_period_end * 1000);
    const stripeIsActive =
        stripeCustomerId === pendingSubscription.stripeCustomerId &&
        ["active", "trialing"].includes(stripeSubscription.status) &&
        periodEnd > new Date();

    if (!stripeIsActive) return false;

    await Promise.all([
        User.findByIdAndUpdate(userId, { planTier: "premium" }),
        Subscription.findByIdAndUpdate(pendingSubscription._id, {
            status: stripeSubscription.status,
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
            canceledAt: stripeSubscription.canceled_at
                ? new Date(stripeSubscription.canceled_at * 1000)
                : null,
        }),
    ]);

    return true;
};

async function registerFreeListen(
    userId: mongoose.Types.ObjectId,
    usageDate: string,
    musicId: mongoose.Types.ObjectId,
) {
    const addUniqueListen = () => DailyListeningUsage.findOneAndUpdate(
        {
            user: userId,
            usageDate,
            listenCount: { $lt: FREE_DAILY_LISTEN_LIMIT },
            listenedSongIds: { $ne: musicId },
        },
        {
            $addToSet: { listenedSongIds: musicId },
            $inc: { listenCount: 1 },
        },
        { returnDocument: "after" },
    );

    const updatedUsage = await addUniqueListen();
    if (updatedUsage) return updatedUsage;

    const existingUsage = await DailyListeningUsage.findOne({
        user: userId,
        usageDate,
    });
    if (existingUsage?.listenedSongIds?.some((id) => String(id) === String(musicId))) {
        return existingUsage;
    }
    if (existingUsage && existingUsage.listenCount >= FREE_DAILY_LISTEN_LIMIT) {
        throw new Apierror(429, "You have reached today's free listening limit");
    }

    try {
        return await DailyListeningUsage.create({
            user: userId,
            usageDate,
            listenCount: 1,
            listenedSongIds: [musicId],
        });
        
    } catch (error) {
        if ((error as { code?: number })?.code !== 11000) throw error;

        const retriedUsage = await addUniqueListen();

        if (!retriedUsage) {
            const concurrentUsage = await DailyListeningUsage.findOne({
                user: userId,
                usageDate,
            });
            if (concurrentUsage?.listenedSongIds?.some((id) => String(id) === String(musicId))) {
                return concurrentUsage;
            }
            throw new Apierror(429, "You have reached today's free listening limit");
        }
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
    const isPremiumUser = await hasPremiumAccess(userId, req.user?.planTier);

    if (isPremiumUser) {
        await RecentSongsPlaying.updateOne(
            { user: userId, music: musicId },
            { $set: { playedAt: now } },
            { upsert: true },
        );

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
    const completedCount = usage?.listenedSongIds?.length ?? usage?.listenCount ?? 0;
    const alreadyListened = usage?.listenedSongIds?.some((id) => String(id) === musicId);
    if (completedCount >= FREE_DAILY_LISTEN_LIMIT && !alreadyListened) {
        throw new Apierror(429, "You have reached today's free listening limit");
    }

    await RecentSongsPlaying.updateOne(
        { user: userId, music: musicId },
        { $set: { playedAt: now } },
        { upsert: true },
    );

    return res.status(200).json(
        new Apiresponse(
            200,
            {
                allowed: true,
                isPremium: false,
                sessionId: null,
                remaining: Math.max(FREE_DAILY_LISTEN_LIMIT - completedCount, 0),
                dailyLimit: FREE_DAILY_LISTEN_LIMIT,
                playCount: completedCount,
                isLimitReached: completedCount >= FREE_DAILY_LISTEN_LIMIT,
            },
            "Listening session started",
        ),
    );
});

export const registerListening = asynchandler(async (req, res) => {
    const userId = req.user?._id;
    const { musicId } = req.body as { musicId?: string };

    if (!userId || !mongoose.isValidObjectId(userId)) {
        throw new Apierror(401, "Unauthorized");
    }
    if (!musicId || !mongoose.isValidObjectId(musicId)) {
        throw new Apierror(400, "A valid musicId is required");
    }
    if (!(await Music.exists({ _id: musicId }))) {
        throw new Apierror(404, "Music not found");
    }

    if (await hasPremiumAccess(userId, req.user?.planTier)) {
        return res.status(200).json(
            new Apiresponse(200, {
                counted: false,
                isPremium: true,
                playCount: null,
                isLimitReached: false,
                remaining: null,
                dailyLimit: null,
            }, "Premium listening does not count towards daily limits"),
        );
    }

    const usage = await registerFreeListen(
        userId,
        getUtcUsageDate(),
        new mongoose.Types.ObjectId(musicId),
    );
    const playCount = usage.listenedSongIds?.length ?? usage.listenCount;

    return res.status(200).json(
        new Apiresponse(200, {
            counted: true,
            isPremium: false,
            playCount,
            listenCount: playCount,
            isLimitReached: playCount >= FREE_DAILY_LISTEN_LIMIT,
            thresholdReached: playCount >= FREE_DAILY_LISTEN_LIMIT,
            remaining: Math.max(FREE_DAILY_LISTEN_LIMIT - playCount, 0),
            dailyLimit: FREE_DAILY_LISTEN_LIMIT,
        }, "Listening milestone registered"),
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

    await RecentSongsPlaying.updateOne(
        { user: listenerId, music: music._id },
        { $set: { playedAt: new Date() } },
        { upsert: true },
    );

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
