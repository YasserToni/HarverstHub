const reviewModel = require("../model/reviewModel");
const factory = require("./handlerFactory");

//Nested Route 
// Get /api/v1/products/:productId/reviews
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.productId) filterObject = { product: req.params.productId };
  req.fillterObj = filterObject;
  next();
};
// description Get reviews with page and limit
// route GET api/v1/reviews
// access public
exports.getReviews = factory.getAll(reviewModel);

// description Get Review by Id
// route GET api/v1/Review
// access public
exports.getReview = factory.getOne(reviewModel);

// descriptin  Create Review by id
// route POST  /api/v1/Review/:id
// access   admin

// Nested route (create)
exports.setproductIdAndUserIdtoBody = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};
exports.createReview = factory.createOne(reviewModel);

// descriptin  update brand by id
// route POST  /api/v1/brand/:id
// access user
exports.updateReview = factory.updateOne(reviewModel);

// descriptin  Delete Review by id
// route get  /api/v1/Review/:id
// access admin
exports.deleteReview = factory.deleteOne(reviewModel);
