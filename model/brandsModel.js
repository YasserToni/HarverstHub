const mongoose = require("mongoose");

// 1- create schema
const brandsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "brands required"],
      unique: [true, "brands must be unique"],
      minLingth: [3, "Too short brands name"],
      maxLength: [32, "Too long brands name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },
  { timestamps: true }
);

// 2 - create model
const brandsModel = mongoose.model("Brands", brandsSchema);

module.exports = brandsModel;
