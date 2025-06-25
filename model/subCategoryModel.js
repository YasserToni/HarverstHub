const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "subCategory must have name"],
      trim: true,
      unique: [true, "SubCategory must be unique"],
      minLength: [2, "Too Short Subcategory name"],
      maxLength: [32, "Too long SubCategory name"],
    },
    slug: {
      type: String,
      lowerCase: true,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "SubCategory must be belong to parent category "],
    },
  },
  { timestamps: true }
);

const subCategoryModel = mongoose.model("SubCategory", subCategorySchema);
module.exports = subCategoryModel;
