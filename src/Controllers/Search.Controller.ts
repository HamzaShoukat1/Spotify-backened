import { Artist } from "../Models/artist.model.js";
import { Music } from "../Models/music.model.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import { asynchandler } from "../utils/Asynchandler.js";
import { Album } from "../Models/album.model.js";
import { Playlist } from "../Models/playlist.model.js";







// import mongoose, { Schema } from "mongoose";

// const playlistSchema = new Schema(
//   {
//     name: { type: String, required: true, trim: true, maxlength: 100 },
//     owner: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       index: true,
//     },
//     songs: [{ type: Schema.Types.ObjectId, ref: "Music" }],
//   },
//   { timestamps: true },
// );

// playlistSchema.index({ owner: 1, createdAt: -1 });
// export const Playlist = mongoose.model("Playlist", playlistSchema);



const search = asynchandler(async (req, res) => {
    const query = String(req.query.q || "").trim();

    const emptyPayload = { artists: [], music: [], albums: [] };

    if (!query) {
        return res.status(200).json(
            new Apiresponse(200, emptyPayload, "Search query is empty")
        );
    }

    if (query.length < 2) {
        return res.status(200).json(
            new Apiresponse(200, emptyPayload, "Search query must contain at least 2 characters")
        );
    }

    const escapedQuery = query.replace(/[.*+?^\${}()|[\]\\]/g, "\\$&");

    const searchRegex = new RegExp(escapedQuery, "i");

    const [artists, music, albums, playlist] = await Promise.all([
        Artist.find({ name: searchRegex })
            .select("_id name profileImage")
            .limit(10)
            .lean(),

        Music.find({ $or: [{ musicTitle: searchRegex }, { primaryArtistName: searchRegex }] })
            .select("_id musicTitle primaryArtistName coverPhoto")
            .limit(20)
            .lean(),
        Album.find({ $or: [{ albumTitle: searchRegex }, { artistName: searchRegex }] })
            .select("_id albumTitle artistName albumCoverArt")
            .limit(20)
            .lean(),
        Playlist.find({ $or: [{ name: searchRegex }] })
            .select("_id name")
            .limit(20)
            .lean(),
    ]);


    return res.status(200).json(
        new Apiresponse(
            200,
            { artists, music, albums,playlist },
            "Artists and music retrieved successfully"
        )
    );


});


export {
    search
}
