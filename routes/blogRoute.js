const express = require("express");
const {
  createBlog,
  updateBlog,
  getAllBlogs,
  getBlogById,
  deleteBlog,
  addComment,
  likeComment,
  dislikeComment,
  getAllComments,
  likeBlog,
  dislikeBlog,
  deleteComment,
  updateComment,
} = require("../controller/blogController");
const {
  createBlogValidator,
  updateBlogValidator,
  getBlogByIdValidator,
  deleteBlogValidator,
  addCommentValidator,
  getCommentsValidator,
  likeDislikeCommentValidator,
  blogIdValidator,
  CommentIdValidator,
} = require("../utils/validator/blogValidator");
const authController = require("../controller/authController");
const upload = require("../middlewares/upload");

const router = express.Router();

// create blog (Merchant or admin)
// add comment on blog (user)
router
  .post(
    "/",
    authController.protect,
    authController.allowedTo("merchant", "admin"),
    upload.array("images", 5),
    createBlogValidator,
    createBlog
  )
  .post(
    "/:id/comments",
    authController.protect,
    authController.allowedTo("user"),
    addCommentValidator,
    addComment
  );

// update blog (admin & merchant
// // update comment
// add like on comment by user
// add dislike on comment by user
// add like on blog
router
  .put(
    "/:id",
    authController.protect,
    authController.allowedTo("merchant", "admin"),
    upload.array("images", 5),
    updateBlogValidator,
    updateBlog
  )
  .put(
    "/:blogId/comments/:commentId",
    authController.protect,
    //     CommentIdValidator,
    updateComment
  )
  .put(
    "/:blogId/comments/:commentId/like",
    authController.protect,
    authController.allowedTo("user"),
    likeDislikeCommentValidator,
    likeComment
  )
  .put(
    "/:blogId/comments/:commentId/dislike",
    authController.protect,
    authController.allowedTo("user"),
    likeDislikeCommentValidator,
    dislikeComment
  )
  .put("/:blogId/like", authController.protect, blogIdValidator, likeBlog)
  .put(
    "/:blogId/dislike",
    authController.protect,
    blogIdValidator,
    dislikeBlog
  );

// get all blogs by user
// get blog by id by user
// get comments on blog by user
router
  .get(
    "/",
    authController.protect,
    authController.allowedTo("user"),
    getAllBlogs
  )
  .get("/:id", authController.protect, getBlogByIdValidator, getBlogById)
  .get(
    "/:blogId/comments",
    authController.protect,
    authController.allowedTo("user"),
    getCommentsValidator,
    getAllComments
  );

// delete blog by (admin & merchant)
router
  .delete(
    "/:id",
    authController.protect,
    authController.allowedTo("merchant", "admin"),
    deleteBlogValidator,
    deleteBlog
  )
  .delete(
    "/:blogId/comments/:commentId",
    authController.protect,
    CommentIdValidator,
    deleteComment
  );
module.exports = router;
