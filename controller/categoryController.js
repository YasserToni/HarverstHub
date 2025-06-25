const asyncHandler = require("express-async-handler");
// const multer = require("multer");
const categoryModel = require("../model/categoryModel");
const factory = require("./handlerFactory");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// description Get categories with page and limit
// route GET api/v1/categories
// access public
exports.getCategories = factory.getAll(categoryModel);

// description Get gategoy by Id
// route GET api/v1/category
// access public
exports.getCategory = factory.getOne(categoryModel);

//////// descriptin  Create category by id
// route POST  /api/v1/category/:id
// access   admin
// exports.createCategory = factory.createOne(categoryModel);
exports.createCategory = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    // Upload the image to Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      { folder: "Category Image", resource_type: "image" },
      async (error, result) => {
        if (error) {
          console.error("Error uploading image:", error);
          return res.status(500).json({ error: "Cloudinary upload failed." });
        }

        // Image uploaded successfully, now save to MongoDB
        const category = new categoryModel({
          name: req.body.name,
          image: result.url, // Image URL from Cloudinary
          // cloudinary_id: result.public_id, // Cloudinary public ID
        });

        // Save image data to MongoDB
        await category.save();

        // Respond with the saved image data
        return res.status(200).json({
          message: "Image uploaded and saved successfully",
          data: category,
        });
      }
    );

    // Pipe the file buffer to Cloudinary
    result.end(req.file.buffer);
  } catch (error) {
    console.error("Error uploading image:", error);
    return res
      .status(500)
      .json({ error: "Something went wrong during upload." });
  }
};
// descriptin  update category by id
// route POST  /api/v1/category/:id
// access   admin
exports.updateCategory = factory.updateOne(categoryModel);
// descriptin  Delete category by id
// route get  /api/v1/category/:id
// access   admin
exports.deleteCategory = factory.deleteOne(categoryModel);
