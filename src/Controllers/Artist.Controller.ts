import { Artist } from "../Models/artist.model.js";
import { Apierror } from "../utils/Apierror.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import { asynchandler, } from "../utils/Asynchandler.js";
import { uploadCloudinary } from "../utils/upload.cloudinary.js";
import { Music } from "../Models/music.model.js";
import { User } from "../Models/user.model.js";

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

const AddMusic = asynchandler(async (req, res) => {
    const { musicTitle, primaryArtistName, Genre, Language } = req.body;

    const useruploadmusic = req.file;

    if (
        !useruploadmusic ||
        !musicTitle?.trim() ||
        !primaryArtistName?.trim() ||
        !Genre?.trim() ||
        !Language?.trim()
    ) {
        throw new Apierror(400, "All music fields and the audio file are required");
    }

    const musicUpload = await uploadCloudinary(useruploadmusic.buffer, "spotify/artists/music");

    if (!musicUpload || !musicUpload.url) {
        throw new Apierror(500, "Failed to upload audio file to Cloudinary");
    }

    const MusicCreation = await Music.create({
        music: {
            url: musicUpload.url,
            publicId: musicUpload.publicId
        },
        musicTitle,
        primaryArtistName,
        Genre,
        Language
    });

    return res.status(201).json(
        new Apiresponse(201, MusicCreation, "Music added successfully")
    );
});



export {
    BecameAnArtist,
    GetArtistProfile,
    UpdateArtistProfile,
    AddMusic
}