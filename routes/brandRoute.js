const express = require("express");

const {
  getBrandValidator,
  createBrandValidator,
  updateBrandValidator,
  deleteBrandValidator,
} = require("../utils/validator/brandValidator");
const {
  getBrands,
  createBrand,
  getBrand,
  updateBrand,
  deleteBrand,
} = require("../controller/brandsController");
const upload = require("../middlewares/upload");

const authController = require("../controller/authController");

const router = express.Router();

// get all categories
// create category
router
  .route("/")
  .get(getBrands)
  .post(
    authController.protect,
    authController.allowedTo("admin"),
    upload.single("image"),
    createBrandValidator,
    createBrand
  );
// get category by ids
router
  .route("/:id")
  .get(getBrandValidator, getBrand)
  .put(
    authController.protect,
    authController.allowedTo("admin"),
    upload.single("image"),
    updateBrandValidator,
    updateBrand
  )
  .delete(
    authController.protect,
    authController.allowedTo("admin"),
    deleteBrandValidator,
    deleteBrand
  );
module.exports = router;
