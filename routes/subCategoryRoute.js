const express = require("express");
const {
  createSubCategoryValidator,
  getSubCategoryValidator,
  updateSubCategoryValidator,
  deleteSubCategoryValidator,
} = require("../utils/validator/subCategoryValidator");

const {
  createSubCategory,
  getSubCategory,
  getsubCategories,
  updateSubCategory,
  deleteSubCategory,
  setCategoryIdTobBody,
  createFilterObj,
} = require("../controller/subCategoryController");

const authController = require("../controller/authController");

const router = express.Router({ mergeParams: true });

// get all categories
// create category
router
  .route("/")
  .get(createFilterObj,getsubCategories)
  .post(
    authController.protect,
    authController.allowedTo("admin", "manager"),
    setCategoryIdTobBody,
    createSubCategoryValidator,
    createSubCategory
  );

// get subCategory by id
router
  .route("/:id")
  .get(getSubCategoryValidator, getSubCategory)
  .put(
    authController.protect,
    authController.allowedTo("admin", "manager"),
    updateSubCategoryValidator,
    updateSubCategory
  )
  .delete(
    authController.protect,
    authController.allowedTo("admin"),
    deleteSubCategoryValidator,
    deleteSubCategory
  );

module.exports = router;
