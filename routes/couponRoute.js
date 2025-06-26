const express = require("express");

const {
  getCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../controller/couponController");

const {
  couponIdValidator,
  createCouponValidator,
  updateCouponValidator,
} = require("../utils/validator/couponValidator");

const authController = require("../controller/authController");

const router = express.Router();

router.use(authController.protect, authController.allowedTo("admin"));

// get all categories
// create category
router.route("/").get(getCoupons).post(createCouponValidator, createCoupon);
// get category by ids
router
  .route("/:id")
  .get(couponIdValidator, getCoupon)
  .put(couponIdValidator, updateCouponValidator, updateCoupon)
  .delete(couponIdValidator, deleteCoupon);
module.exports = router;
