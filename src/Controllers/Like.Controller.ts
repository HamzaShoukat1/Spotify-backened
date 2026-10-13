import { Music } from "../Models/music.model.js";
import { Apierror } from "../utils/Apierror.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import { asynchandler } from "../utils/Asynchandler.js";

const LikedAndUnlikeSong = asynchandler(async (req, res) => {
    const { musicId } = req.params;
    const userId = req.user._id;

    const music = await Music.findById(musicId).select("_id likedBy")
    if (!music) {
        throw new Apierror(404, "Music not found");
    }

    const hasLiked = music.likedBy.includes(userId)

    let updateQuery;
    let message;

    if (hasLiked) {
        updateQuery = { $pull: { likedBy: userId } };
        message = "Music unliked successfully";
    } else {
        updateQuery = { $addToSet: { likedBy: userId } };
        message = "Music liked successfully";
    }

    const updatedMusic = await Music.findByIdAndUpdate(
        musicId,
        updateQuery,
        { returnDocument: "after" }
    );

    const LikesCount = updatedMusic?.likedBy.length;

    return res.status(200).json(
        new Apiresponse(200, { message, LikesCount})
    );
});

const getLikedSongs = asynchandler(async (req, res) => {
    const userId = req.user._id;

    const likedSongs = await Music.find({ likedBy: userId })
        .select('_id musicTitle primaryArtistName coverPhoto.url');

    if (!likedSongs || likedSongs.length === 0) {
        return res.status(404).json(
            new Apiresponse(404, [], "No liked songs found")
        );
    }

    return res.status(200).json(
        new Apiresponse(200, likedSongs, "Liked songs fetched successfully")
    );
});


export { LikedAndUnlikeSong, getLikedSongs };
