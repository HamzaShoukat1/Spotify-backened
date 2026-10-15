import { Stream } from "../Models/Stream.modal.js";
import { asynchandler } from "../utils/Asynchandler.js";
import { Apierror } from "../utils/Apierror.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import mongoose from "mongoose";
import { Artist } from "../Models/artist.model.js";
import { Music } from "../Models/music.model.js";
import { RecentSongsPlaying } from "../Models/RecentSongPlaying.model.js";

const trackStream = asynchandler(async (req, res) => {
    const { musicId } = req.body;

    const listenerId = req.user?._id

    if (!listenerId || !mongoose.isValidObjectId(listenerId)) {
        throw new Apierror(401, "Unauthorized: valid listener not found");
    }

    if (!musicId || !mongoose.isValidObjectId(musicId)) {
        throw new Apierror(400, "A valid musicId is required");
    }


    const music = await Music.findById(musicId)
        .select("_id uploadedBy");

    if (!music) {
        throw new Apierror(404, "Music not found");
    }

    const artist = await Artist.findOne({
        user: music.uploadedBy,
    }).select("_id").lean();

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






    return res.status(201).json(
        new Apiresponse(
            201,
            newStream,
            "Stream metric saved successfully"
        )
    );
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

    const range: AnalyticsRange = requestedRange in rangeDaysMap ? (requestedRange as AnalyticsRange) : "7d";

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

    const streamCounts = new Map(output.timelineData.map((item: any) => [item._id, item.count]));

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

        topSongs: output.topSongs.map((song: {
            _id: mongoose.Types.ObjectId;
            count: number;
            title: string;
            coverUrl?: string;
        }) => ({
            _id: song._id.toString(),
            count: song.count,
            title: song.title,
            coverUrl: song.coverUrl,
        })),

        timelineData,
    };

    return res.status(200).json(
        new Apiresponse(
            200,
            dashboardData,
            "Artist dashboard statistics fetched successfully"
        )
    );
});


export {
    trackStream,
    getArtistDashboard
};
