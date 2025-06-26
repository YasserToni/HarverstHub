const factory = require("./handlerFactory");
const couponModel = require("../model/couponModel");

// description Get coupons with page and limit
// route GET api/v1/Coupons
// access Private/ admin-manger
exports.getCoupons = factory.getAll(couponModel);

// description Get coupon by Id
// route GET api/v1/coupons
// access Private/ admin-manger
exports.getCoupon = factory.getOne(couponModel);
// descriptin  Create brand by id
// route POST  /api/v1/coupons/:id
// access Private/ admin-manger
exports.createCoupon = factory.createOne(couponModel);

// descriptin  update coupon by id
// route POST  /api/v1/coupons/:id
// access Private/ admin-manger
exports.updateCoupon = factory.updateOne(couponModel);
// descriptin  Delete coupon by id
// route get  /api/v1/coupons/:id
// access Private/ admin-manger
exports.deleteCoupon = factory.deleteOne(couponModel);
