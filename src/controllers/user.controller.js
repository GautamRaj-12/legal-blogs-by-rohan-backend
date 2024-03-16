// Import necessary modules and functions
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

// Define a function to generate access and refresh tokens for a given user ID
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    // Find the user by ID
    const user = await User.findById(userId);

    // Generate access and refresh tokens using user's methods
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Update the user's refresh token in the database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Return the generated tokens
    return { accessToken, refreshToken };
  } catch (error) {
    // Throw an error if something goes wrong during token generation
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh tokens"
    );
  }
};

// Define a function to handle user registration
const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend/postman
  const { username, email, fullName, password } = req.body;

  // validation - not empty or undefined
  if (
    [fullName, email, username, password].some(
      (field) => field === undefined || field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // check if user already exists? username, email
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  // Throw an error if the user already exists
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // create user object - create entry in db
  const user = await User.create({
    fullName,
    email,
    password,
    username: username.toLowerCase(),
  });

  // check for user creation and remove password and refresh token
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Throw an error if user creation fails
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering");
  }

  // return user response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

// Define a function to handle user login
const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  const { email, username, password } = req.body;
  // username or email
  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }

  // find the user
  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // check password
  const isPasswordValid = await user.isPasswordCorrect(password);

  // Throw an error if the password is invalid
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // Retrieve the logged-in user details (excluding password and refresh token)
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // send Cookie
  const options = {
    httpOnly: true,
    secure: true,
  };

  // Set cookies in the response containing the access and refresh tokens
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User Logged In Successfully"
      )
    );
});

// Define a function to handle user logout
const logoutUser = asyncHandler(async (req, res) => {
  // Update the user's refreshToken to undefined in the database
  User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: undefined } },
    { new: true }
  );

  // Configure options for clearing cookies
  const options = {
    httpOnly: true,
    secure: true,
  };

  // Clear cookies in the response for accessToken and refreshToken
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// Define a function to handle refreshing access tokens
const refreshAccessToken = asyncHandler(async (req, res) => {
  // Retrieve the incoming refreshToken from cookies or request body
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  // Throw an error if no refreshToken is provided
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    // Verify the incoming refreshToken using the secret key
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // Find the user based on the decodedToken
    const user = await User.findById(decodedToken?._id);

    // Throw an error if the user does not exist
    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    // Throw an error if the incoming refreshToken does not match the user's refreshToken
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    // Configure options for cookies
    const options = {
      httpOnly: true,
      secure: true,
    };

    // Generate new access and refresh tokens
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    // Set cookies in the response containing the new access and refresh tokens
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    // Throw an error if token verification fails
    throw new ApiError(401, error?.message || "Invalid Refresh Token");
  }
});

// Export the functions for use in routes
export { registerUser, loginUser, logoutUser, refreshAccessToken };
