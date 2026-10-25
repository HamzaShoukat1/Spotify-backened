import { Apierror, Apiresponse, asynchandler } from "../utils/index.js"
import { generateAccessToken, generateRefreshToken } from "../services/token.service.js"
import crypto from "node:crypto";
import { Session } from "../Models/session.model.js";


import { User } from "../Models/user.model.js"
import mongoose from "mongoose";

const hashRefreshToken = (token: string) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};

const generateAccessAndRefreshToken = async (userId: string) => {
    try {
        //get user
        const user = await User.findById(userId)
        if (!user) throw new Apierror(404, "User not Found")
        const sessionId = new mongoose.Types.ObjectId().toString();

        const accessToken = generateAccessToken({
            _id: user._id.toString(),
            sessionId
        });
        const refreshToken = generateRefreshToken({
            _id: user._id.toString(),
            sessionId
        });
        await Session.create({
            _id: sessionId,
            userId,
            refreshTokenHash: hashRefreshToken(refreshToken),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }

    } catch (error: any) {
        throw new Apierror(500, error?.message || "Something went wrong while generating access and refresh tokens");

    }
}










const SignUp = asynchandler(async (req, res) => {
    //get user details from fronted
    //validattion
    //check user already exist
    //create user obj in db
    //remove password and refreshToken from res
    //return res
    const { email, password, gender, name } = req.body

    if ([
        email, password, gender, name
    ].some((field) => field?.trim() === "")) {
        throw new Apierror(400, "all fields are required")

    }
    if (password.length < 8) {
        throw new Apierror(400, "Password must be 8 characters long")
    }

    const existedUser = await User.findOne({
        $or: [{ email: email.toLowerCase() }]
    });

    if (existedUser) {
        throw new Apierror(400, "user with this email  already exist")
    }

    const userData: Partial<any> = {
        email: email.toLowerCase(),
        password: password,
        gender: gender,
        name: name,
    }

    const user = await User.create(userData)

    const { accessToken, refreshToken } =
        await generateAccessAndRefreshToken(user._id.toString());
    const createUser = await User.findById(user._id).select("-password  -favoriteArtists")
    if (!createUser) {
        throw new Apierror(500, "Something wrong while register User")
    };

    return res.status(201).json(
        new Apiresponse(201,
            {
                createUser,
                accessToken,
                refreshToken
            },

            "User registered SuccessFully")
    )

})


const Signin = asynchandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new Apierror(400, "Email and password are required");
  }

  const user = await User.findOne({
    email: email.toLowerCase().trim(),
  });

  if (!user) {
    throw new Apierror(401, "Invalid email or password");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new Apierror(401, "Invalid email or password");
  }

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshToken(user._id.toString());

  const loggedInUser = await User.findById(user._id)
    .select("-password");

  if (!loggedInUser) {
    throw new Apierror(404, "User not found");
  }

  return res.status(200).json(
    new Apiresponse(
      200,
      {
        user: loggedInUser,
        accessToken,
        refreshToken,
      },
      "User logged in successfully"
    )
  );
});


const Logout = asynchandler(async (req, res) => {
    const sessionId = req.user?.sessionId;

    if (!sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
        throw new Apierror(401, "Invalid session");
    }

    const session = await Session.findOneAndUpdate(
        {
            _id: sessionId,
            userId: req.user?._id,
            revokedAt: null,
        },
        {
            $set: {
                revokedAt: new Date(),
            },
        },
        {
            returnDocument: "after",
        }
    );

    if (!session) {
        throw new Apierror(401, "Session not found or already revoked");
    }

    return res.status(200).json(
        new Apiresponse(200, {}, "Logged out successfully")
    );
});

const getCurrentUser = asynchandler(async (req, res) => {

    // get user from user's table

    // if artist get artist's profile data 

    // combine into 1 object and then return it
    return res.status(200).json(
        new Apiresponse(200, req.user, "current User fetched successfully")

    )
});

const completeOnboarding = asynchandler(async (req, res) => {
    const { favoriteArtists } = req.body;

    if (!Array.isArray(favoriteArtists) || favoriteArtists.length < 3) {
        throw new Apierror(400, "Select at least 3 favorite artists");
    }

    if (
        favoriteArtists.some((artistId) =>
            !mongoose.Types.ObjectId.isValid(artistId)
        )
    ) {
        throw new Apierror(400, "Favorite artists contain an invalid ID");
    }

    const uniqueFavoriteArtists = [...new Set(favoriteArtists)];
    if (uniqueFavoriteArtists.length !== favoriteArtists.length) {
        throw new Apierror(400, "Favorite artists must be unique");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                onboarding: true,
                favoriteArtists: uniqueFavoriteArtists,
            },
        },
        { returnDocument: 'after' }
    ).select("-password -refreshToken")

    if (!user) {
        throw new Apierror(404, "User not Found")
    }

    return res.status(200).json(
        new Apiresponse(200, user, "Onboarding completed successfully")
    )

});


const changeUsername = asynchandler(async (req, res) => {
    const { name } = req.body;

    if (!name || name.trim() === "") {
        throw new Apierror(400, "name is required");
    }

    const updateFields: Record<string, any> = {};
    updateFields.name = name;

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateFields },
        { returnDocument: 'after', runValidators: true }
    ).select("-password -refreshToken -favoriteArtists -onboarding -email -gender -role");

    if (!user) {
        throw new Apierror(404, "User not found");
    }
    await user.save()
    return res.status(200).json(
        new Apiresponse(200, user, "Username updated successfully")
    );
});



export {
    SignUp,
    Signin,
    Logout,
    getCurrentUser,
    completeOnboarding,
    changeUsername
}