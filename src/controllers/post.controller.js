import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Post } from "../models/post.model.js";

const createPost = asyncHandler(async (req, res) => {
  const { title, desc } = req.body;

  if (!(title && desc)) {
    throw new ApiError(400, "user should provide title and discription");
  }
  const newPost = await Post.create({
    title,
    desc,
    username: req.user?._username,
  });
  if (!newPost) {
    throw new ApiError(400, "Post could not be created");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, newPost, "Post created successfully"));
});

const allPosts = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, {}, "all posts route"));
});

const singlePost = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, {}, "single post route"));
});

const updatePost = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, {}, "Update post route"));
});

const deletePost = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, {}, "Delete post route"));
});
export { createPost, allPosts, singlePost, updatePost, deletePost };
