import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Post } from "../models/post.model.js";

// Handler for Creating post
const createPost = asyncHandler(async (req, res) => {
  const { title, desc } = req.body;

  if (!(title && desc)) {
    throw new ApiError(400, "user should provide title and discription");
  }
  const newPost = await Post.create({
    title,
    desc,
    username: req.user?._id,
  });
  if (!newPost) {
    throw new ApiError(400, "Post could not be created");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, newPost, "Post created successfully"));
});

// Handler for fetching all posts
const allPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find();
  return res.json(new ApiResponse(200, posts, "All posts fetched successfully"));
});

// Handler for fetching a single post by ID
const singlePost = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }
  return res.json(new ApiResponse(200, post, "Post fetched successfully"));
});

// Handler for updating a post by ID
const updatePost = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const { title, desc } = req.body;

  if (!(title && desc)) {
    throw new ApiError(400, "User should provide title and description");
  }

  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  // Check if the authenticated user is the owner of the post
  if (post.username.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized to update this post");
  }

  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    { title, desc },
    { new: true }
  );

  if (!updatedPost) {
    throw new ApiError(404, "Post not found");
  }

  return res.json(new ApiResponse(200, updatedPost, "Post updated successfully"));
});

// Handler for deleting a post by ID
const deletePost = asyncHandler(async (req, res) => {
  const postId = req.params.id;

  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  // Check if the authenticated user is the owner of the post
  if (post.username.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized to delete this post");
  }

  const deletedPost = await Post.findByIdAndDelete(postId);
  if (!deletedPost) {
    throw new ApiError(404, "Post not found");
  }
  return res.json(new ApiResponse(200, {}, "Post deleted successfully"));
});

export { createPost, allPosts, singlePost, updatePost, deletePost };
