const express = require("express");
const authController = require("../controller/authController");

const {
  addProductToWishList,
  removeProductFromWishList,
  getLoggedUserWishlist,
} = require("../controller/wishListController");

const router = express.Router();

router.use(authController.protect, authController.allowedTo("user"));

router.route('/').post(addProductToWishList).get(getLoggedUserWishlist);

router.route("/:productId").delete(removeProductFromWishList);

module.exports = router;
