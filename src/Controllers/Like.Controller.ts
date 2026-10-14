import mongoose from "mongoose";
import { Music } from "../Models/music.model.js";
import { Apierror } from "../utils/Apierror.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import { asynchandler } from "../utils/Asynchandler.js";
import { LikedSong } from "../Models/UserLikedSong.model.js";



const likeSong = asynchandler(async (req, res) => {
  const { musicId } = req.params as { musicId: string };
  const userId = req.user?._id;

  if (!mongoose.isValidObjectId(musicId)) {
    throw new Apierror(400, "Invalid music ID");
  }

  if (!userId) {
    throw new Apierror(401, "Unauthorized");
  }

  const musicExists = await Music.exists({ _id: musicId });

  if (!musicExists) {
    throw new Apierror(404, "Music not found");
  }
  const filter = {
    user: userId,
    music: musicId,
  };

  await LikedSong.updateOne(
    filter,
    {
      $setOnInsert: {
        user: userId,
        music: musicId,
      },
    },
    {
      upsert: true,
    }
  );

  return res.status(200).json(
    new Apiresponse(
      200,
      {
        musicId,
        isLiked: true,
      },
      "Music liked successfully"
    )
  );
});


const unlikeSong = asynchandler(async (req, res) => {
  const { musicId } = req.params as { musicId: string };
  const userId = req.user?._id;

  if (!mongoose.isValidObjectId(musicId)) {
    throw new Apierror(400, "Invalid music ID");
  }

  if (!userId) {
    throw new Apierror(401, "Unauthorized");
  }
  const filter = {
    user: userId,
    music: musicId,
  };


  await LikedSong.deleteOne(filter);

  return res.status(200).json(
    new Apiresponse(
      200,
      {
        musicId,
        isLiked: false,
      },
      "Music unliked successfully"
    )
  );
});
const getLikedSongs = asynchandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new Apierror(401, "Unauthorized");
  }

  const likedSongs = await LikedSong.find({
    user: userId,
  })
    .sort({ createdAt: -1 })
    .populate({
      path: "music",
      select: [
        "musicTitle",
        "primaryArtistName",
        "coverPhoto.url",
      ]
    })
    .lean();

  const availableLikedSongs = likedSongs.filter((likedSong) => likedSong.music);


  return res.status(200).json(
    new Apiresponse(
      200,
      availableLikedSongs,
      "Liked songs fetched successfully"
    )
  );
});

export {
  likeSong,
  unlikeSong,
};



export { getLikedSongs };
