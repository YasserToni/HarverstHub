const asyncHandler = require("express-async-handler");

const userModel = require("../model/userModel");

// @desc add adress to user addresses list
// @route POST /api/v1/addresses
// @access protected/ user
exports.addAddressToAddresses = asyncHandler(async (req, res, next) => {
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { addresses: req.body } },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Address added successfully",
    data: user.addresses,
  });
});

// @desc remove adress from user addresses list
// @route DELETE /api/v1/addresses
// @access protected/ user
exports.RemoveAddressFromAddresses = asyncHandler(async (req, res, next) => {
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    { $pull: { addresses: { _id: req.params.addressId } } },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Address removed successfully",
    data: user.addresses,
  });
});

// @desc get logged user address list
// @route GET /api/v1/addresses
// @access protected/ user
exports.getLoggedUseraddresses = asyncHandler(async (req, res, next) => {
  const user = await userModel.findById(req.user._id).populate("addresses");
  res.status(200).json({
    status: "success",
    results: user.addresses.length,
    data: user.addresses,
  });
});
