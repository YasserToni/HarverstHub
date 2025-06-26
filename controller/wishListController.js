const asyncHandler = require("express-async-handler");
const userModel = require("../model/userModel");

// @desc add Product to wishList
// @route POST /api/v1/wishtlist/:productId
// @access protected/ user
exports.addProductToWishList = asyncHandler(async (req, res, next) => {
  //$addToSet => add productId to wishList array if productId not existing in wishList
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { wishList: req.body.productId },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Product added to wishlist",
    results: user.wishList.length,
    data: user.wishList,
  });
});

// @desc add Product to wishList
// @route DELETE /api/v1/wishtlist/:productId
// @access protected/ user
exports.removeProductFromWishList = asyncHandler(async (req, res, next) => {
  //$addToSet => remove productId from wishList array if productId existing in wishLis
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    { $pull: { wishList: req.params.productId } },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Product removed from wishlist",
    results: user.wishList.length,
    data: user.wishList,
  });
});

// @desc get logged user wishlist
// @route GET /api/v1/wishtlist
// @access protected/ user
exports.getLoggedUserWishlist = asyncHandler(async (req, res, next) => {
  const user = await userModel.findById(req.user._id).populate("wishList");
  res.status(200).json({
    status: "success",
    results: user.wishList.length,
    data: user.wishList,
  });
});
