const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const slugify = require("slugify");

exports.createProductValidator = [
  check("title")
    .notEmpty()
    .withMessage("Product title is required")
    .isLength({ min: 3 })
    .withMessage("Too short product title")
    .isLength({ max: 100 })
    .withMessage("Too long product title"),

  check("description")
    .notEmpty()
    .withMessage("Product description is required")
    .isLength({ min: 20 })
    .withMessage("Too short product description"),

  check("price")
    .notEmpty()
    .withMessage("Product price is required")
    .isNumeric()
    .withMessage("Product price must be a number"),

  check("quantity")
    .notEmpty()
    .withMessage("Product quantity is required")
    .isNumeric()
    .withMessage("Product quantity must be a number"),

  check("category")
    .notEmpty()
    .withMessage("Product category is required")
    .isMongoId()
    .withMessage("Invalid category id format"),

  body("title").custom((val, { req }) => {
    req.body.slug = slugify(val);
    return true;
  }),

  validatorMiddleware,
];

exports.approveProductValidator = [
  check("id").isMongoId().withMessage("Invalid product id format"),
  validatorMiddleware,
];

exports.getProductValidator = [
  check("id").isMongoId().withMessage("Invalid product ID format"),
  validatorMiddleware,
];

exports.updateProductValidator = [
  check("id").isMongoId().withMessage("Invalid product ID format"),

  check("title")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Too short product title")
    .isLength({ max: 100 })
    .withMessage("Too long product title"),

  check("description")
    .optional()
    .isLength({ min: 20 })
    .withMessage("Too short product description"),

  check("price")
    .optional()
    .isNumeric()
    .withMessage("Product price must be a number"),

  check("quantity")
    .optional()
    .isNumeric()
    .withMessage("Product quantity must be a number"),

  check("category")
    .optional()
    .isMongoId()
    .withMessage("Invalid category id format"),

  validatorMiddleware,
];

exports.deleteProductValidator = [
  check("id").isMongoId().withMessage("Invalid product ID format"),
  validatorMiddleware,
];
