const express = require("express");

const {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
} = require("../utils/validator/categoryValidator");
const {
  getCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
} = require("../controller/categoryController");

const upload = require("../middlewares/upload");

const authController = require("../controller/authController");

const router = express.Router();
const subCategoryRoutes = require("./subCategoryRoute");

router.use("/:categoryId/subcategories", subCategoryRoutes);

// get all categories
// create category
router
  .route("/")
  .get(getCategories)
  .post(
    authController.protect,
    authController.allowedTo("admin"),
    upload.single("image"),
    createCategory
  );

// get category by ids
router
  .route("/:id")
  .get(getCategoryValidator, getCategory)
  .put(
    authController.protect,
    authController.allowedTo("admin"),
    upload.single("image"),
    updateCategoryValidator,
    updateCategory
  )
  .delete(
    authController.protect,
    authController.allowedTo("admin"),
    deleteCategoryValidator,
    deleteCategory
  );

module.exports = router;
