import mongoose from "mongoose";
import { Album } from "../Models/album.model.js";
import { Music } from "../Models/music.model.js";
import { Apierror } from "../utils/Apierror.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import { asynchandler } from "../utils/Asynchandler.js";
import { destroyCloudinary, uploadCloudinary } from "../utils/upload.cloudinary.js";

type UploadedFiles = {
  [fieldname: string]: Express.Multer.File[];
};

const createAlbum = asynchandler(async (req, res) => {
  const { albumTitle, artistName, trackMetadata: tracksJson } = req.body;
  const files = (req.files as UploadedFiles | undefined) ?? {};
  const cover = files.coverPhoto?.[0];
  const audioFiles = files.tracks ?? [];

  if (!req.user?._id) throw new Apierror(401, "Unauthorized request");
  if (req.user.role !== "artist") throw new Apierror(403, "Only artists can create albums");
  if (!albumTitle?.trim() || !artistName?.trim() || !cover || audioFiles.length === 0) {
    throw new Apierror(400, "Album details, cover art, and at least one track are required");
  }

  let trackMetadata: { title: string; fileName: string }[];
  try {
    trackMetadata = JSON.parse(tracksJson ?? "[]");
  } catch {
    throw new Apierror(400, "Invalid track metadata");
  }

  if (trackMetadata.length !== audioFiles.length || trackMetadata.some((track) => !track.title?.trim())) {
    throw new Apierror(400, "Each audio file needs a song title");
  }

  let coverUpload: Awaited<ReturnType<typeof uploadCloudinary>> | undefined;
  let audioUploads: Awaited<ReturnType<typeof uploadCloudinary>>[] = [];
  let album: InstanceType<typeof Album> | undefined;
  let createdTracks: Awaited<ReturnType<typeof Music.insertMany>> = [];

  try {
    coverUpload = await uploadCloudinary(cover.buffer, "spotify/artists/albums");
    const validatedTrackMetadata = trackMetadata as [{ title: string; fileName: string }, ...{ title: string; fileName: string }[]];
    audioUploads = await Promise.all(audioFiles.map((file) => uploadCloudinary(file.buffer, "spotify/artists/music")));

    album = await Album.create({
      albumTitle: albumTitle.trim(),
      artistName: artistName.trim(),
      albumCoverArt: { url: coverUpload.url, publicId: coverUpload.publicId },
      uploadedBy: req.user._id,
      tracks: [],
    });

    createdTracks = await Music.insertMany(audioUploads.map((upload, index) => ({
      musicTitle: validatedTrackMetadata[index]!.title.trim(),
      primaryArtistName: artistName.trim(),
      Genre: "Album",
      Language: "Unknown",
      music: { url: upload.url, publicId: upload.publicId },
      coverPhoto: { url: coverUpload!.url, publicId: coverUpload!.publicId },
      uploadedBy: req.user!._id,
      album: album!._id,
      trackNumber: index + 1,
    })));

    album.tracks = createdTracks.map((track) => track._id);
    await album.save();
  } catch (error) {
    if (createdTracks.length > 0) await Music.deleteMany({ _id: { $in: createdTracks.map((track) => track._id) } });
    if (album) await Album.deleteOne({ _id: album._id });
    await Promise.all([
      coverUpload ? destroyCloudinary(coverUpload.publicId, "image") : Promise.resolve(),
      ...audioUploads.map((upload) => destroyCloudinary(upload.publicId, "video")),
    ]);
    throw error;
  }

  return res.json(new Apiresponse(201, album, "Album created successfully"));
});

const getAlbums = asynchandler(async (_req, res) => {
  const albums = await Album.find()
    .select("_id albumTitle artistName albumCoverArt createdAt")
    .sort({ createdAt: -1 })
    .lean();
  return res.json(new Apiresponse(200, albums, "Albums retrieved successfully"));
});

const getAlbumById = asynchandler(async (req, res) => {
  const { albumId } = req.params;
  if (!mongoose.isValidObjectId(albumId)) throw new Apierror(400, "Invalid album ID");

  const album = await Album.findById(albumId)
     .populate({ path: "tracks", options: { sort: { trackNumber: 1 } }, select: "_id musicTitle trackNumber coverPhoto" })
    .lean();
  if (!album) throw new Apierror(404, "Album not found");

  return res.json(new Apiresponse(200, album, "Album retrieved successfully"));
});

export { createAlbum, getAlbums, getAlbumById };