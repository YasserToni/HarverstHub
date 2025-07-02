const productsModel = require("../model/productsModel");
const userModel = require("../model/userModel");
const asyncHandler = require("express-async-handler");
const cloudinary = require("../middlewares/cloudinaryConfig");
const ApiError = require("../utils/apiError");
const sendEmail = require("../utils/sendEmail");

// Create product
exports.createProduct = asyncHandler(async (req, res, next) => {
  const {
    title,
    description,
    quantity,
    price,
    PriceAfterDiscount,
    colors,
    category,
    subcategory,
    brand,
    specifications,
  } = req.body;

  if (!req.files || !req.files.imageCover) {
    return next(new ApiError("Main image (imageCover) is required", 400));
  }

  // Upload cover image
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

  // Upload additional images if exists
  let imagesUrls = [];
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

    imagesUrls = await Promise.all(uploadPromises);
  }

  // Create product
  const product = await productsModel.create({
    title,
    description,
    quantity,
    price,
    PriceAfterDiscount,
    colors: colors ? colors.split(",") : [],
    category,
    subcategory,
    brand,
    specifications: specifications ? JSON.parse(specifications) : [],
    imageCover: coverImageUrl,
    images: imagesUrls,
    merchant: req.user._id,
    approved: false, // Default until admin approves
  });

  res.status(201).json({
    status: "success",
    data: product,
  });
});

// Approve product
exports.approveProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const product = await productsModel.findById(id);
  if (!product) {
    return next(new ApiError("Product not found", 404));
  }

  if (product.approved) {
    return next(new ApiError("Product already approved", 400));
  }

  product.approved = true;
  await product.save();

  // Get merchant details
  const merchant = await userModel.findById(product.merchant);
  if (!merchant) {
    return next(new ApiError("Merchant not found", 404));
  }

  // Send email
  const message = `Hi ${merchant.firstName},\n\nYour product "${product.title}" has been approved and is now visible in the store!\n\nThanks,\nHarvestHub Team`;

  try {
    await sendEmail({
      email: merchant.email,
      subject: "Product Approved ✅",
      message,
    });
  } catch (error) {
    console.error("Email sending error:", error);
    // Optional: Continue without failing if email fails
  }

  res.status(200).json({
    status: "success",
    message: "Product approved successfully and email sent to merchant",
    data: product,
  });
});

// Get all approved products with search, pagination, sort, filters
exports.getAllProducts = asyncHandler(async (req, res, next) => {
  let queryObj = { approved: true };

  // Search by title
  if (req.query.search) {
    queryObj.title = { $regex: req.query.search, $options: "i" };
  }

  // Filter by category
  if (req.query.category) {
    queryObj.category = req.query.category;
  }

  // Filter by price range
  if (req.query.minPrice || req.query.maxPrice) {
    queryObj.price = {};
    if (req.query.minPrice)
      queryObj.price.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice)
      queryObj.price.$lte = parseFloat(req.query.maxPrice);
  }

  // Sort
  let sortBy = req.query.sort || "-createdAt"; // default: newest first

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Query
  const products = await productsModel
    .find(queryObj)
    .sort(sortBy)
    .skip(skip)
    .limit(limit);

  // Count
  const totalProducts = await productsModel.countDocuments(queryObj);

  res.status(200).json({
    status: "success",
    results: products.length,
    page,
    totalPages: Math.ceil(totalProducts / limit),
    data: products,
  });
});

// Get product by ID (approved only)
exports.getProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const product = await productsModel
    .findOne({ _id: id, approved: true })
    .populate("category", "name")
    .populate("subcategory", "name")
    .populate("brand", "name", "Brands");

  if (!product) {
    return next(new ApiError("Product not found or not approved", 404));
  }

  res.status(200).json({
    status: "success",
    data: product,
  });
});

// Update product
exports.updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const product = await productsModel.findById(id);
  if (!product) {
    return next(new ApiError("Product not found", 404));
  }

  // Check if current user is the merchant
  if (product.merchant.toString() !== req.user._id.toString()) {
    return next(
      new ApiError("You are not authorized to update this product", 403)
    );
  }

  // Check if product is approved
  if (product.approved) {
    return next(new ApiError("Cannot update an approved product", 400));
  }

  // Upload new images if provided
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
    req.body.imageCover = coverImageUrl;
  }

  if (req.files && req.files.images && req.files.images.length > 0) {
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

    const imagesUrls = await Promise.all(uploadPromises);
    req.body.images = imagesUrls;
  }

  // Parse specifications if sent as string
  if (req.body.specifications) {
    req.body.specifications = JSON.parse(req.body.specifications);
  }

  const updatedProduct = await productsModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: updatedProduct,
  });
});

// Delete product
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const product = await productsModel.findById(id);
  if (!product) {
    return next(new ApiError("Product not found", 404));
  }

  // Check if current user is the merchant
  if (product.merchant.toString() !== req.user._id.toString()) {
    return next(
      new ApiError("You are not authorized to delete this product", 403)
    );
  }

  // Optional: prevent deleting approved products
  // if (product.approved) {
  //   return next(new ApiError("Cannot delete an approved product", 400));
  // }

  await productsModel.findByIdAndDelete(id);

  res.status(204).json({
    status: "success",
    message: "Product deleted successfully",
  });
});

// Get not approved products (admin only)
exports.getNotApprovedProducts = asyncHandler(async (req, res, next) => {
  console.log("hi");
  const products = await productsModel.find({ approved: false });

  res.status(200).json({
    status: "success",
    results: products.length,
    data: products,
  });
});

// Get all products for current merchant
exports.getMerchantProducts = asyncHandler(async (req, res, next) => {
  const products = await productsModel.find({ merchant: req.user._id });

  res.status(200).json({
    status: "success",
    results: products.length,
    data: products,
  });
});
