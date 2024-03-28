import { Router } from "express";
const router = Router();
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
  createPost,
  allPosts,
  singlePost,
  updatePost,
  deletePost,
} from "../controllers/post.controller.js";

router.route("/create").post(verifyJWT, createPost);
router.route("/all-posts").get(allPosts);
router.route("/post/:id").get(singlePost);
router.route("/update/:id").put(updatePost);
router.route("/delete/:id").delete(deletePost);
export default router;
