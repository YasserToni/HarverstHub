const express = require("express");
const reviewRoute = require("./reviewRoute");

const {
  getProductValidator,
  createProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require("../utils/validator/productValidator");
const {
  getProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
} = require("../controller/productController");
const upload = require("../middlewares/upload");
const authController = require("../controller/authController");

const router = express.Router();

// post /products/(id > asdhfklsjdf)/reviews   go to review route
router.use("/:productId/review", reviewRoute);

// get all products
// create product
router
  .route("/")
  .get(getProducts)
  .post(
    authController.protect,
    authController.allowedTo("admin"),
    upload.fields([
      { name: "imageCover", maxCount: 1 },
      { name: "images", maxCount: 5 }, // up to 5 sub-images
    ]),
    createProductValidator,
    createProduct
  );

// get product by ids
router
  .route("/:id")
  .get(getProductValidator, getProduct)
  .put(
    authController.protect,
    authController.allowedTo("admin", "manager"),
    updateProductValidator,
    updateProduct
  )
  .delete(
    authController.protect,
    authController.allowedTo("admin"),
    deleteProductValidator,
    deleteProduct
  );
module.exports = router;
