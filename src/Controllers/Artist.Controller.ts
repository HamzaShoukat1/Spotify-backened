import { Artist } from "../Models/artist.model.js";
import { Apierror } from "../utils/Apierror.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import { asynchandler, } from "../utils/Asynchandler.js";
import { uploadCloudinary } from "../utils/upload.cloudinary.js";
import { Music } from "../Models/music.model.js";
import { User } from "../Models/user.model.js";
import mongoose from "mongoose";

const BecameAnArtist = asynchandler(async (req, res) => {
    const { name, artistType, genres, bio } = req.body;
    const files = req.files as {
        [fieldname: string]: Express.Multer.File[];
    } | undefined;

    if (!name?.trim() || !artistType?.trim() || !genres?.trim() || !bio?.trim()) {
        throw new Apierror(400, "Artist profile fields are required");
    }

    const profileImage = files?.profileImage?.[0];
    const coverImage = files?.coverImage?.[0];

    if (!profileImage || !coverImage) {
        throw new Apierror(400, "Profile and cover images are required");
    }

    if (!req.user?._id) {
        throw new Apierror(401, "Unauthorized request");
    }

    const [profileUpload, coverUpload] = await Promise.all([
        uploadCloudinary(profileImage.buffer, "spotify/artists/profile"),
        uploadCloudinary(coverImage.buffer, "spotify/artists/cover"),
    ]);

    const newArtist = await Artist.create({
        user: req.user._id,
        name,
        artistType,
        genres,
        bio,
        profileImage: {
            url: profileUpload.url,
            publicId: profileUpload.publicId,
        },
        coverImage: {
            url: coverUpload.url,
            publicId: coverUpload.publicId,
        },
    });

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { role: "artist" }
        },
        { returnDocument: 'after' }
    );

    return res.status(201).json(
        new Apiresponse(201, newArtist, "Became an artist now successfully")
    );
});


const GetArtistProfile = asynchandler(async (req, res) => {
    if (!req.user?._id) {
        throw new Apierror(401, "Unauthorized request");
    }

    const artist = await Artist.findOne({ user: req.user._id });

    if (!artist) {
        throw new Apierror(404, "Artist profile not found");
    }

    return res.status(200).json(
        new Apiresponse(200, artist, "Artist profile fetched successfully")
    );
});

const UpdateArtistProfile = asynchandler(async (req, res) => {
    if (!req.user?._id) {
        throw new Apierror(401, "Unauthorized request");
    }

    const artist = await Artist.findOne({ user: req.user._id });

    if (!artist) {
        throw new Apierror(404, "Artist profile not found");
    }

    const { name, artistType, genres, bio } = req.body;
    const files = req.files as {
        [fieldname: string]: Express.Multer.File[];
    } | undefined;

    const nextName = name === undefined ? artist.name : name.trim();
    const nextArtistType = artistType === undefined
        ? artist.artistType
        : artistType.trim();
    const nextGenres = genres === undefined ? artist.genres : genres.trim();
    const nextBio = bio === undefined ? artist.bio : bio.trim();

    artist.name = nextName;
    artist.artistType = nextArtistType;
    artist.genres = nextGenres;
    artist.bio = nextBio;

    const profileImage = files?.profileImage?.[0];
    const coverImage = files?.coverImage?.[0];

    const [profileUpload, coverUpload] = await Promise.all([
        profileImage
            ? uploadCloudinary(profileImage.buffer, "spotify/artists/profile")
            : null,
        coverImage
            ? uploadCloudinary(coverImage.buffer, "spotify/artists/cover")
            : null,
    ]);

    if (profileUpload) {
        artist.profileImage = {
            url: profileUpload.url,
            publicId: profileUpload.publicId,
        };
    }

    if (coverUpload) {
        artist.coverImage = {
            url: coverUpload.url,
            publicId: coverUpload.publicId,
        };
    }

    await artist.save();

    return res.status(200).json(
        new Apiresponse(200, artist, "Artist profile updated successfully")
    );
});

const getPublicArtistDetails = asynchandler(async (req, res) => {
    const { artistId } = req.params;

    if (!artistId || Array.isArray(artistId)) {
        throw new Apierror(400, "Artist ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(artistId)) {
        throw new Apierror(400, "Invalid artist ID");
    }

    const artist = await Artist.findById(artistId)
        .select("-profileImage.publicId -coverImage.publicId");

    if (!artist) {
        throw new Apierror(404, "Artist profile not found");
    }

    const artistMusic = await Music.find({ uploadedBy: artist.user })
        .select("musicTitle  coverPhoto.url ")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new Apiresponse(
            200,
            { ...artist.toObject(), artistmusic: artistMusic },
            "Artist details retrieved successfully"
        )
    );
});


const getPublicArtists = asynchandler(async (req, res) => {
    const artists = await Artist.find()
        .select("name  profileImage.url")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new Apiresponse(200, artists, "Artists retrieved successfully")
    );
});









export {
    BecameAnArtist,
    GetArtistProfile,
    UpdateArtistProfile,
    getPublicArtistDetails,
    getPublicArtists,
}