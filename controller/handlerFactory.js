const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");
// const ApiFeatures = require("../utils/apiFeatures");

exports.deleteOne = (model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await model.findByIdAndDelete(id);
    if (!document) {
      return next(new ApiError(`No document With this ${id}`, 404));
    }

    res.status(200).json({
      data: null,
    });
  });

exports.updateOne = (model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await model.findByIdAndUpdate(
      id,
      req.body,
      { new: true } // to return category after updated
    );
    if (!document) {
      return next(new ApiError(`No document With this ${id}`, 404));
    }
    // trigger "save:" event when document is updated
    document.save();
    res.status(200).json({
      data: document,
    });
  });

exports.createOne = (model) =>
  asyncHandler(async (req, res) => {
    const document = await model.create(req.body);
    res.status(200).json({ data: document });
  });

exports.getOne = (model, populateOption) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    let query = model.findById(id);
    if (populateOption) {
      query = query.populate(populateOption);
    }
    const document = await query;
    if (!document) {
      return next(new ApiError(`No document With this ${id}`, 404));
    }
    res.status(200).json({ data: document });
  });

exports.getAll = (model, modelName = "") =>
  asyncHandler(async (req, res, next) => {
    let filter = {};
    if (req.fillterObj) {
      filter = req.fillterObj;
    }

    // build query
    const countDocuments = await model.countDocuments();
    const apiFeatures = new ApiFeatures(model.find(filter), req.query)
      .paginate(countDocuments)
      .filter()
      .search(modelName)
      .limitFields()
      .sort();

    // excute query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const document = await mongooseQuery;
    res
      .status(200)
      .json({ results: document.length, paginationResult, data: document });
  });
