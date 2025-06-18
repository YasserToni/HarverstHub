const express = require("express");

const {
  signValidator,
  loginValidator,
  resetPasswordValidator,
} = require("../utils/validator/authValidator");
const {
  singup,
  login,
  forgetPassword,
  verifyResetCode,
  resetPassword,
} = require("../controller/authController");

const router = express.Router();

// signup
router.route("/signup").post(signValidator, singup);

// login
router.route("/login").post(loginValidator, login);

router.route("/forgetpassword").post(forgetPassword);

router.route("/verifyResetCode").post(verifyResetCode);

router.route("/resetPassword").put(resetPasswordValidator, resetPassword);

// router.route("/getLoggedUserData").get(resetPasswordValidator, resetPassword);

module.exports = router;
