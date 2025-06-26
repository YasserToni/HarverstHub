const express = require("express");
const authController = require("../controller/authController");

const {
  addAddressToAddresses,
  RemoveAddressFromAddresses,
  getLoggedUseraddresses,
} = require("../controller/addressController");

const router = express.Router();

router.use(authController.protect, authController.allowedTo("user"));

router.route('/').post(addAddressToAddresses).get(getLoggedUseraddresses);

router.route("/:addressId").delete(RemoveAddressFromAddresses);

module.exports = router;
