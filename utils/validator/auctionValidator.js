const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.createAuctionValidator = [
  check("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3 })
    .withMessage("Title too short"),

  check("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10 })
    .withMessage("Description too short"),

  check("startingPrice")
    .notEmpty()
    .withMessage("Start price is required")
    .isNumeric()
    .withMessage("Start price must be a number"),

  check("duration")
    .notEmpty()
    .withMessage("Duration is required")
    .isIn([1, 3, 7])
    .withMessage("Duration must be 1, 3, or 7 days"),

  validatorMiddleware,
];

exports.updateAuctionValidator = [
  check("title").optional().isLength({ min: 3 }),
  check("description").optional().isLength({ min: 10 }),
  check("startPrice").optional().isNumeric(),
  check("duration").optional().isIn([1, 3, 7]),
  validatorMiddleware,
];

exports.deleteAuctionValidator = [
  check("id").isMongoId().withMessage("Invalid auction ID format"),
  validatorMiddleware,
];

exports.getAuctionValidator = [
  check("id").isMongoId().withMessage("Invalid auction ID format"),
  validatorMiddleware,
];

exports.placeBidValidator = [
  check("id").isMongoId().withMessage("Invalid auction ID format"),
  check("bid")
    .notEmpty()
    .withMessage("Bid amount is required")
    .isNumeric()
    .withMessage("Bid must be a number")
    .isFloat({ gt: 0 })
    .withMessage("Bid must be greater than 0"),
  validatorMiddleware,
];

exports.updateBidValidator = [
  check("id").isMongoId().withMessage("Invalid auction ID format"),
  check("bid")
    .notEmpty()
    .withMessage("New bid amount is required")
    .isNumeric()
    .withMessage("Bid must be a number")
    .isFloat({ gt: 0 })
    .withMessage("Bid must be greater than 0"),
  validatorMiddleware,
];

exports.deleteBidValidator = [
  check("id").isMongoId().withMessage("Invalid auction ID format"),
  validatorMiddleware,
];
