const subCategoryModel = require("../model/subCategoryModel");
// const categoryModel = require("../model/categoryModel")

const factory = require("./handlerFactory");

// descriptin  Create category by id
// route POST  /api/v1/category/:id
// access   admin

exports.setCategoryIdTobBody = (req, res, next) => {
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};
exports.createSubCategory = factory.createOne(subCategoryModel);

// description Get subCategory by Id
// route GET api/v1/category
// access public
exports.getSubCategory = factory.getOne(subCategoryModel);

// for nested route
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) filterObject = { category: req.params.categoryId };
  req.fillterObj = filterObject;
  next();
};
exports.getsubCategories = factory.getAll(subCategoryModel);
// descriptin  update category by id
// route POST  /api/v1/category/:id
// access   admin
exports.updateSubCategory = factory.updateOne(subCategoryModel);

// descriptin  Delete category by id
// route get  /api/v1/category/:id
// access   admin
exports.deleteSubCategory = factory.deleteOne(subCategoryModel);
