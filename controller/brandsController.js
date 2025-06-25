const asyncHandler = require("express-async-handler");

const cloudinary = require("cloudinary").v2;

const brandsModel = require("../model/brandsModel");
const factory = require("./handlerFactory");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// description Get brands with page and limit
// route GET api/v1/brands
// access public
exports.getBrands = factory.getAll(brandsModel);

// description Get brand by Id
// route GET api/v1/brand
// access public
exports.getBrand = factory.getOne(brandsModel);
// descriptin  Create brand by id
// route POST  /api/v1/brand/:id
// access   admin

// exports.createBrand = factory.createOne(brandsModel);
exports.createBrand = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    // Upload the image to Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      { folder: "Brands Image", resource_type: "image" },
      async (error, result) => {
        if (error) {
          console.error("Error uploading image:", error);
          return res.status(500).json({ error: "Cloudinary upload failed." });
        }

        // Image uploaded successfully, now save to MongoDB
        const brand = new brandsModel({
          name: req.body.name,
          image: result.url, // Image URL from Cloudinary
          // cloudinary_id: result.public_id, // Cloudinary public ID
        });

        // Save image data to MongoDB
        await brand.save();

        // Respond with the saved image data
        return res.status(200).json({
          message: "Image uploaded and saved successfully",
          data: brand,
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

// descriptin  update brand by id
// route POST  /api/v1/brand/:id
// access   admin
// exports.updateBrand = factory.updateOne(brandsModel);
exports.updateBrand = async (req, res) => {
  try {
    const brand = await brandsModel.findById(req.params.id);
    if (!brand) {
      return res
        .status(404)
        .json({ error: `Brand not found with this id ==>> ${req.params.id}` });
    }

    // Update name if provided
    if (req.body.name) {
      brand.name = req.body.name;
    }

    // If a new file is uploaded, upload it to Cloudinary
    if (req.file) {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "Brands Image", resource_type: "image" },
        async (error, result) => {
          if (error) {
            console.error("Cloudinary error:", error);
            return res.status(500).json({ error: "Cloudinary upload failed" });
          }

          // Update image URL
          brand.image = result.url;
          // brand.cloudinary_id = result.public_id; // Uncomment if needed

          await brand.save();

          return res.status(200).json({
            message: "Brand updated successfully",
            data: brand,
          });
        }
      );

      // Stream file to Cloudinary
      uploadStream.end(req.file.buffer);
    } else {
      // No image uploaded, just update name
      await brand.save();
      return res.status(200).json({
        message: "Brand updated successfully",
        data: brand,
      });
    }
  } catch (error) {
    console.error("Update error:", error);
    return res
      .status(500)
      .json({ error: "Something went wrong during update" });
  }
};

// descriptin  Delete brand by id
// route get  /api/v1/brand/:id
// access   admin
exports.deleteBrand = factory.deleteOne(brandsModel);
