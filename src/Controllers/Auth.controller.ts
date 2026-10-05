import { Apierror, Apiresponse, asynchandler } from "../utils/index.js"
import { generateAccessToken, generateRefreshToken } from "../services/token.service.js"


import { User } from "../Models/user.model.js"


const generateAccessAndRefreshToken = async (userId: string) => {
    try {
        //get user
        const user = await User.findById(userId)
        if (!user) throw new Apierror(404, "User not Found")


        const accessToken = generateAccessToken({
            _id: user._id.toString()
        });
        const refreshToken = generateRefreshToken({
            _id: user._id.toString()
        });
        user.refreshToken = refreshToken
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
    const createUser = await User.findById(user._id).select("-password -refreshToken")
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
    const { email } = req.body;

    if (!email ) {
        throw new Apierror(400, "Email  is required");
    }

    const user = await User.findOne({
        email: email.toLowerCase(),
    });

    if (!user) {
        throw new Apierror(400, "User does not exist");
    }

    // const isPasswordValid = await user.isPasswordCorrect(password);

    // if (!isPasswordValid) {
    //     throw new Apierror(401, "Invalid password");
    // }

    const { accessToken, refreshToken } =
        await generateAccessAndRefreshToken(user._id.toString());

    const loggedInUser = await User
        .findById(user._id)
        .select("-refreshToken");

    return res
        .status(200)
        .json(
            new Apiresponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },

                "User logged in successfully"
            )
        );
});


const Logout = asynchandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            returnDocument: "after"
        }
    )
    return res.status(200)
        .json(
            new Apiresponse(200, {}, "user logged out")

        )

});

const getCurrentUser = asynchandler(async (req, res) => {
    return res.status(200).json(
        new Apiresponse(200, req.user, "current User fetched successfully")

    )

});


export {
    SignUp,
    Signin,
    Logout,
    getCurrentUser,
    // getAllUsers
}