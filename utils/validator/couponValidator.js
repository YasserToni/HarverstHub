const { check, param } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

// Validate Coupon ID in params
exports.couponIdValidator = [
  param("id").isMongoId().withMessage("Invalid Coupon ID format"),
  validatorMiddleware,
];

// Create Coupon Validator
exports.createCouponValidator = [
  check("name")
    .notEmpty()
    .withMessage("Coupon name is required")
    .isString()
    .withMessage("Coupon name must be a string"),

  check("expire")
    .notEmpty()
    .withMessage("Coupon expiry date is required")
    .isISO8601()
    .withMessage("Expire date must be a valid ISO8601 date"),

  check("discount")
    .notEmpty()
    .withMessage("Discount value is required")
    .isFloat({ min: 1, max: 100 })
    .withMessage("Discount must be between 1 and 100"),

  validatorMiddleware,
];

// Update Coupon Validator
exports.updateCouponValidator = [
  param("id").isMongoId().withMessage("Invalid Coupon ID format"),

  check("name")
    .optional()
    .isString()
    .withMessage("Coupon name must be a string"),

  check("expire")
    .optional()
    .isISO8601()
    .withMessage("Expire date must be a valid ISO8601 date"),

  check("discount")
    .optional()
    .isFloat({ min: 1, max: 100 })
    .withMessage("Discount must be between 1 and 100"),

  validatorMiddleware,
];
