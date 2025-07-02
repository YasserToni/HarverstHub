const multer = require("multer");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
// const { uploadMixofImage } = require("../middlewares/uploadimageMiddleware");

const ApiError = require("../utils/apiError");
const ProductsModel = require("../model/productsModel");
const factory = require("./handlerFactory");

// const multerStorage = multer.memoryStorage();

// const multerFilter = function (req, file, cb) {
//   if (file.mimetype.startsWith("image")) {
//     cb(null, true);
//   } else {
//     cb(new ApiError("Only Images allowed", 400), false);
//   }
// };
// const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

// // upload array of image
// exports.uploadProductImage = uploadMixofImage([
//   { name: "imageCover", maxCount: 1 },
//   { name: "images", maxCount: 5 },
// ]);

// exports.resizeImage = asyncHandler(async (req, res, next) => {
//   // 1)  image processing for image Cover
//   if (req.files.imageCover) {
//     const productCoverFileName = `productCover-${uuidv4()}-${Date.now()}.jpeg`;
//     await sharp(req.files.imageCover[0].buffer)
//       .resize(2000, 1333)
//       .toFormat("jpeg")
//       .jpeg({ quality: 90 })
//       .toFile(`uploads/products/${productCoverFileName}`);

//     // save image into database
//     req.body.imageCover = productCoverFileName;
//   }

//   // 2) image processing for images
//   if (req.files.images) {
//     req.body.images = [];
//     await Promise.all(
//       req.files.images.map(async (img, index) => {
//         const productImageName = `productImage-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;
//         await sharp(img.buffer)
//           .resize(2000, 1333)
//           .toFormat("jpeg")
//           .jpeg({ quality: 90 })
//           .toFile(`uploads/products/${productImageName}`);

//         // save image into database
//         req.body.images.push(productImageName);
//       })
//     );
//   }
//   next();
// });

// description Get products with page and limit
// route GET api/v1/products
// access public
exports.getProducts = factory.getAll(ProductsModel, "productsModel");

// description Get products by Id
// route GET api/v1/products
// access public
exports.getProduct = factory.getOne(ProductsModel, "reviews");
// exports.getProduct = factory.getOne(ProductsModel);

// exports.getProduct = async (req, res) => {
//   try {
//     const product = await ProductsModel.findById(req.params.id)
//       .populate("category", "name _id")
//       .populate({
//         path: "reviews",
//         select: "title ratings user createdAt",
//         populate: {
//           path: "user",
//           select: "firstName lastName",
//         },
//         strictPopulate: false, // مهم لتفادي الخطأ لو virtual مش واضح لمونجوز
//       });

//     if (!product) {
//       return res.status(404).json({
//         status: "fail",
//         message: "Product not found",
//       });
//     }

//     res.status(200).json({
//       status: "success",
//       data: product,
//     });
//   } catch (error) {
//     console.error("Error fetching product:", error);
//     res.status(500).json({
//       status: "error",
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

// descriptin  Create product by id
// route POST  /api/v1/product/:id
// access   admin

// exports.createProduct = factory.createOne(ProductsModel);
const cloudinary = require("cloudinary").v2;
// const productsModel = require("../models/productsModel");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      quantity,
      price,
      category,
      subcategory,
      brand,
      colors,
      PriceAfterDiscount,
    } = req.body;

    if (!req.files || !req.files.imageCover) {
      return res
        .status(400)
        .json({ error: "Main image (imageCover) is required" });
    }

    // 1. Upload imageCover
    const coverImageUrl = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "Product Cover Images", resource_type: "image" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        )
        .end(req.files.imageCover[0].buffer);
    });

    // 2. Upload additional images (optional)
    let imageUrls = [];
    if (req.files.images && req.files.images.length > 0) {
      const uploadPromises = req.files.images.map((file) => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              { folder: "Product Images", resource_type: "image" },
              (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
              }
            )
            .end(file.buffer);
        });
      });

      imageUrls = await Promise.all(uploadPromises);
    }

    // 3. Create slug from title
    const slug = title.trim().toLowerCase().replace(/\s+/g, "-");

    // 4. Create product in DB
    const product = new ProductsModel({
      title,
      slug,
      description,
      quantity,
      price,
      PriceAfterDiscount,
      colors: colors ? colors.split(",") : [],
      imageCover: coverImageUrl,
      images: imageUrls,
      category,
      subcategory,
      brand,
    });

    await product.save();

    res.status(201).json({
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Product creation error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// descriptin  update product by id
// route POST  /api/v1/product/:id
// access   admin

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await ProductsModel.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const {
      title,
      description,
      quantity,
      price,
      category,
      subcategory,
      brand,
      colors,
      PriceAfterDiscount,
    } = req.body;

    // 1. Upload new cover image if provided
    if (req.files && req.files.imageCover) {
      const coverImageUrl = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { folder: "Product Cover Images", resource_type: "image" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          )
          .end(req.files.imageCover[0].buffer);
      });
      product.imageCover = coverImageUrl;
    }

    // 2. Upload new images if provided
    if (req.files && req.files.images && req.files.images.length > 0) {
      const imageUrls = await Promise.all(
        req.files.images.map((file) => {
          return new Promise((resolve, reject) => {
            cloudinary.uploader
              .upload_stream(
                { folder: "Product Images", resource_type: "image" },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result.secure_url);
                }
              )
              .end(file.buffer);
          });
        })
      );
      product.images = imageUrls;
    }

    // 3. Update other fields
    if (title) {
      product.title = title;
      product.slug = title.trim().toLowerCase().replace(/\s+/g, "-");
    }
    if (description) product.description = description;
    if (quantity) product.quantity = quantity;
    if (price) product.price = price;
    if (PriceAfterDiscount) product.PriceAfterDiscount = PriceAfterDiscount;
    if (category) product.category = category;
    if (subcategory) product.subcategory = subcategory;
    if (brand) product.brand = brand;
    if (colors) product.colors = colors.split(",");

    await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Product update error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// descriptin  Delete product by id
// route get  /api/v1/product/:id
// access   admin
exports.deleteProduct = factory.deleteOne(ProductsModel);
