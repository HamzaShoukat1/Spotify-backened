import { Artist } from "../Models/artist.model.js";
import { Music } from "../Models/music.model.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import { asynchandler } from "../utils/Asynchandler.js";












const search = asynchandler(async (req, res) => {
    const query = String(req.query.q || "").trim();

    const emptyPayload = { artists: [], music: [] };

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

    const [artists, music] = await Promise.all([
        Artist.find({ name: searchRegex })
            .select("_id name profileImage")
            .limit(10)
            .lean(),

        Music.find({ musicTitle: searchRegex })
            .select("_id musicTitle coverPhoto")
            .limit(20)
            .lean(),
    ]);

    return res.status(200).json(
        new Apiresponse(
            200,
            { artists, music },
            "Artists and music retrieved successfully"
        )
    );


});


export {
    search
}