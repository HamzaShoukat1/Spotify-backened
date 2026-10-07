import mongoose from "mongoose";
import { Music } from "../Models/music.model.js";
import { Apierror } from "../utils/Apierror.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import { asynchandler } from "../utils/Asynchandler.js";
import { uploadCloudinary } from "../utils/upload.cloudinary.js";




const AddMusic = asynchandler(async (req, res) => {
    const { musicTitle, primaryArtistName, Genre, Language } = req.body;
    const files = req.files as {
        [fieldname: string]: Express.Multer.File[];
    } | undefined;

    const useruploadmusic = files?.music?.[0]
    const useruploadcover = files?.coverPhoto?.[0]


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
        uploadCloudinary(useruploadcover.buffer, "spotify/artists/cover")
    ])

    if (!musicUpload?.url || !CoverUpload?.url) {
        throw new Apierror(500, "Failed to upload file to Cloudinary");
    }


    if (!req.user?._id) {
        throw new Apierror(401, "Unauthorized request");
    }


    const MusicCreation = await Music.create({
        music: {
            url: musicUpload.url,
            publicId: musicUpload.publicId
        },
        coverPhoto: {
            url: CoverUpload.url,
            publicId: CoverUpload.publicId
        },
        musicTitle,
        primaryArtistName,
        Genre,
        Language,
        uploadedBy: req.user._id
    });

    return res.status(201).json(
        new Apiresponse(201, MusicCreation, "Music added successfully")
    );
});


const getMusicDataForHome = asynchandler(async (req, res) => {
    const artists = await Music.find()
        .select("musicTitle  coverPhoto.url")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new Apiresponse(200, artists, "music data for home retrieved successfully")
    );

})



const getdetailsfortracksplaying = asynchandler(async (req, res) => {
    const { musicId } = req.params;

    if (!musicId || Array.isArray(musicId)) {
        throw new Apierror(400, "music ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(musicId)) {
        throw new Apierror(400, "Invalid artist ID");
    }

    const artist = await Music.findById(musicId).select(
        "musicTitle primaryArtistName music.url coverPhoto.url"
    );

    if (!artist) {
        throw new Apierror(404, "Artist profile not found");
    }

    return res.status(200).json(
        new Apiresponse(200, artist, "Music details retrieved successfully")
    );
});

export {
    getMusicDataForHome,
    AddMusic,
    getdetailsfortracksplaying
}