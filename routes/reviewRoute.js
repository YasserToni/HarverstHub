const express = require("express");

const {
  getReviewValidator,
  createReviewValidator,
  updateReviewValidator,
  deleteReviewValidator,
} = require("../utils/validator/reviewValidator");
const {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  setproductIdAndUserIdtoBody,
  createFilterObj,
} = require("../controller/reviewController");

const authController = require("../controller/authController");

const router = express.Router({ mergeParams: true });

// get all categories
// create category
router
  .route("/")
  .get(
    authController.protect,
    authController.allowedTo("user"),
    createFilterObj,
    getReviews
  )
  .post(
    authController.protect,
    authController.allowedTo("user"),
    setproductIdAndUserIdtoBody,
    createReviewValidator,
    createReview
  );
// get category by ids
router
  .route("/:id")
  .get(authController.protect, getReviewValidator, getReview)
  .put(
    authController.protect,
    authController.allowedTo("user"),
    updateReviewValidator,
    updateReview
  )
  .delete(
    authController.protect,
    authController.allowedTo("admin", "user", "manger"),
    deleteReviewValidator,
    deleteReview
  );
module.exports = router;
