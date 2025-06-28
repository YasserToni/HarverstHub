const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.createBlogValidator = [
  check("title")
    .notEmpty()
    .withMessage("Blog title is required")
    .isLength({ min: 3 })
    .withMessage("Too short blog title"),

  check("content")
    .notEmpty()
    .withMessage("Blog content is required")
    .isLength({ min: 10 })
    .withMessage("Content is too short"),

  validatorMiddleware,
];
exports.updateBlogValidator = [
  check("id").isMongoId().withMessage("Invalid blog id format"),
  validatorMiddleware,
];
exports.getBlogByIdValidator = [
  check("id").isMongoId().withMessage("Invalid blog id format"),
  validatorMiddleware,
];

exports.deleteBlogValidator = [
  check("id").isMongoId().withMessage("Invalid blog id format"),
  validatorMiddleware,
];

exports.addCommentValidator = [
  check("id").isMongoId().withMessage("Invalid blog id format"),
  check("text")
    .notEmpty()
    .withMessage("Comment text is required")
    .isLength({ min: 1 })
    .withMessage("Comment text must not be empty"),
  validatorMiddleware,
];

exports.likeDislikeCommentValidator = [
  check("blogId").isMongoId().withMessage("Invalid blog id format"),
  check("commentId").isMongoId().withMessage("Invalid comment id format"),
  validatorMiddleware,
];
exports.CommentIdValidator = [
  check("commentId").isMongoId().withMessage("Invalid comment id format"),
  validatorMiddleware,
];

exports.getCommentsValidator = [
  check("blogId").isMongoId().withMessage("Invalid blog id format"),
  validatorMiddleware,
];

exports.blogIdValidator = [
  check("blogId").isMongoId().withMessage("Invalid blog id format"),
  validatorMiddleware,
];
