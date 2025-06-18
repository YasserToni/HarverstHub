const { check } = require("express-validator");
const userModel = require("../../model/userModel");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.signValidator = [
  check("name")
    .notEmpty()
    .withMessage("name required")
    .isLength({ min: 3 })
    .withMessage("Too short name"),

  check("email")
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .custom((val) =>
      userModel.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("Email already in use"));
        }
      })
    ),
  check("password")
    .notEmpty()
    .withMessage("Please enter your password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new Error("Invalid confirm password");
      }
      return true;
    }),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("Please enter your confirm password"),

  validatorMiddleware,
];

exports.loginValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Please enter a valid email address"),

  check("password")
    .notEmpty()
    .withMessage("Please enter your password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  validatorMiddleware,
];

exports.resetPasswordValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Please enter a valid email address"),

  check("newPassword")
    .notEmpty()
    .withMessage("Please enter your password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .custom((newPassword, { req }) => {
      if (newPassword !== req.body.newPasswordConfirm) {
        throw new Error("Invalid confirm password");
      }
      return true;
    }),

  check("newPasswordConfirm")
    .notEmpty()
    .withMessage("Please enter your confirm password"),

  validatorMiddleware,
];
