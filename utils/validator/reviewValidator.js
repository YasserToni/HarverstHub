const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const reviewModel = require("../../model/reviewModel");

exports.getReviewValidator = [
  check("id").isMongoId().withMessage("Invalid Review id format"),
  validatorMiddleware,
];

exports.createReviewValidator = [
  check("title").optional(),
  check("ratings")
    .notEmpty()
    .withMessage("ratings value required")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Ratings value must be between 1 to 5"),
  check("product").isMongoId().withMessage("Invalid product id format"),
  check("user")
    .isMongoId()
    .withMessage("Invalid user id format")
    .custom(async (val, { req }) => {
      // check if user already create review before
      const userId = req.user._id;
      const review = await reviewModel.findOne({
        user: userId,
        product: req.body.product,
      });

      if (review) {
        throw new Error("You already create review");
      }
      if (req.user._id.toString() !== req.body.user.toString()) {
        throw new Error("You are not allowed to perform this action ");
      }
    }),
  validatorMiddleware,
];

exports.updateReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Review id format")
    .custom((val, { req }) =>
      reviewModel.findById(val).then((review) => {
        if (!review) {
          return Promise.reject(new Error(`There is no review this id ${val}`));
        }
        if (review.user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(
            new Error("You are not allowed to perform this action ")
          );
        }
      })
    ),

  check("ratings")
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage("ratings value must be between 1 to 5"),

  validatorMiddleware,
];
exports.deleteReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Review id format")
    .custom((val, { req }) => {
      // check review ownership before update
      if (req.user.role === "user") {
        return reviewModel.findById(val).then((review) => {
          if (!review) {
            return Promise.reject(
              new Error(`There is no review this id ${val}`)
            );
          }
          if (review.user._id.toString() !== req.user._id.toString()) {
            return Promise.reject(
              new Error("You are not allowed to perform this action ")
            );
          }
        });
      }
      return true;
    }),
  validatorMiddleware,
];
