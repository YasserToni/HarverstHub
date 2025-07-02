const express = require("express");
const {
  createProductValidator,
  approveProductValidator,
  getProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require("../utils/validator/productValidator");
const {
  createProduct,
  approveProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getNotApprovedProducts,
  getMerchantProducts,
} = require("../controller/productController");
const authController = require("../controller/authController");
const upload = require("../middlewares/upload");

const router = express.Router();

// Create product
router.post(
  "/",
  authController.protect,
  authController.allowedTo("merchant"),
  upload.fields([
    { name: "imageCover", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  createProductValidator,
  createProduct
);

router.patch(
  "/approve/:id",
  authController.protect,
  authController.allowedTo("admin"),
  approveProductValidator,
  approveProduct
);

router
  .get(
    "/",
    authController.protect,
    authController.allowedTo("user"),
    getAllProducts
  )
  .get(
    "/:id",
    authController.protect,
    authController.allowedTo("user"),
    getProductValidator,
    getProduct
  )
  .get(
    "/notapproved/not-approved",
    authController.protect,
    authController.allowedTo("admin"),
    getNotApprovedProducts
  )
  .get(
    "/my-products/my-products",
    authController.protect,
    authController.allowedTo("merchant"),
    getMerchantProducts
  );

router.put(
  "/:id",
  authController.protect,
  authController.allowedTo("merchant"),
  upload.fields([
    { name: "imageCover", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  updateProductValidator,
  updateProduct
);

router.delete(
  "/:id",
  authController.protect,
  authController.allowedTo("merchant"),
  deleteProductValidator,
  deleteProduct
);

//admin can get all product not approved

// router.get("/not-approved", (req, res) => {
//   res.send("Route works without any middleware");
// });
module.exports = router;
