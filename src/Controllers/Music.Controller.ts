import mongoose from "mongoose";
import { Music } from "../Models/music.model.js";
import { Artist } from "../Models/artist.model.js";
import { Apierror } from "../utils/Apierror.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import { asynchandler } from "../utils/Asynchandler.js";
import { uploadCloudinary } from "../utils/upload.cloudinary.js";
import { RecentSongsPlaying } from "../Models/RecentSongPlaying.model.js";

const AddMusic = asynchandler(async (req, res) => {
    const { musicTitle, primaryArtistName, Genre, Language } = req.body;
    const files = req.files as
        | {
            [fieldname: string]: Express.Multer.File[];
        }
        | undefined;

    const useruploadmusic = files?.music?.[0];
    const useruploadcover = files?.coverPhoto?.[0];

    if (
        !useruploadmusic ||
        !musicTitle?.trim() ||
        !primaryArtistName?.trim() ||
        !Genre?.trim() ||
        !Language?.trim() ||
        !useruploadcover
    ) {
        throw new Apierror(400, "All music fields and the audio file are required");
    }

    const [musicUpload, CoverUpload] = await Promise.all([
        uploadCloudinary(useruploadmusic.buffer, "spotify/artists/music"),
        uploadCloudinary(useruploadcover.buffer, "spotify/artists/cover"),
    ]);

    if (!musicUpload?.url || !CoverUpload?.url) {
        throw new Apierror(500, "Failed to upload file to Cloudinary");
    }

    if (!req.user?._id) {
        throw new Apierror(401, "Unauthorized request");
    }

    const MusicCreation = await Music.create({
        music: {
            url: musicUpload.url,
            publicId: musicUpload.publicId,
        },
        coverPhoto: {
            url: CoverUpload.url,
            publicId: CoverUpload.publicId,
        },
        musicTitle,
        primaryArtistName,
        Genre,
        Language,
        uploadedBy: req.user._id,
    });

    return res
        .status(201)
        .json(new Apiresponse(201, MusicCreation, "Music added successfully"));
});

const getMusicDataForHome = asynchandler(async (req, res) => {
    const songs = await Music.find()
        .select("_id musicTitle coverPhoto.url")
        .sort({ createdAt: -1 })
        .limit(15)
        .lean();

    return res
        .status(200)
        .json(new Apiresponse(200, songs, "Homepage music retrieved successfully"));
});
const getdetailsfortracksplaying = asynchandler(async (req, res) => {
    const { musicId } = req.params;

    if (!musicId || Array.isArray(musicId)) {
        throw new Apierror(400, "music ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(musicId)) {
        throw new Apierror(400, "Invalid music ID");
    }

    const music = await Music.findById(musicId).select(
        "musicTitle primaryArtistName Genre Language music.url coverPhoto.url uploadedBy isliked",
    );

    if (!music) {
        throw new Apierror(404, "Music not found");
    }

    const artist = await Artist.findOne({ user: music.uploadedBy })
        .select("name artistType genres bio profileImage.url coverImage.url")
        .lean();

    return res
        .status(200)
        .json(
            new Apiresponse(
                200,
                { ...music.toObject(), artist: artist ?? null },
                "Music details retrieved successfully",
            ),
        );
});

const getRecentlyPlayedSongs = asynchandler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId || !mongoose.isValidObjectId(userId)) {
        throw new Apierror(401, "Unauthorized");
    }

    const recentSongs = await RecentSongsPlaying.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $sort: {
                playedAt: -1,
            },
        },
        {
            $group: {
                _id: "$music",
                lastPlayed: { $first: "$playedAt" },
            },
        },
        {
            $sort: {
                lastPlayed: -1,
            },
        },
        {
            $limit: 5
        },
        {
            $lookup: {
                from:"musics",
                localField: "_id",
                foreignField: "_id",
                as: "songDetails",
            },
        },
        {
            $unwind: "$songDetails",
        },
        {
            $project: {
                _id: "$songDetails._id",
                musicTitle: "$songDetails.musicTitle",
                coverPhotoUrl: "$songDetails.coverPhoto.url",
                playedAt: "$lastPlayed",
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new Apiresponse(200, recentSongs, "Recent songs fetched successfully"),
        );
});

export {
    getMusicDataForHome,
    AddMusic,
    getdetailsfortracksplaying,
    getRecentlyPlayedSongs,
};
