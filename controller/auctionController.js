const Auction = require("../model/auctionModel");
const ApiError = require("../utils/apiError");
const cloudinary = require("../middlewares/cloudinaryConfig");

exports.createAuction = async (req, res, next) => {
  try {
    const { title, description, startingPrice, startDate, duration } = req.body;

    if (!req.files || req.files.length === 0) {
      return next(new ApiError("At least one image is required", 400));
    }

    // Upload images to Cloudinary
    const uploadPromises = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { folder: "Auction Images", resource_type: "image" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          )
          .end(file.buffer);
      });
    });

    const imageUrls = await Promise.all(uploadPromises);

    // Create auction
    const auction = await Auction.create({
      title,
      description,
      images: imageUrls,
      startingPrice,
      startDate: new Date(startDate),
      duration: parseInt(duration),
      merchant: req.user._id,
      status: "pending",
      highestBid: startingPrice,
    });

    res.status(201).json({
      message: "Auction created successfully",
      data: auction,
    });
  } catch (err) {
    console.error("Auction creation error:", err);
    next(new ApiError("Failed to create auction", 500));
  }
};

exports.getAuctionById = async (req, res, next) => {
  try {
    const auction = await Auction.findById(req.params.id).populate("merchant");

    if (!auction) {
      return next(new ApiError("Auction not found", 404));
    }

    // Update auction status based on time
    const now = Date.now();

    if (now < auction.startDate.getTime()) {
      auction.status = "pending";
    } else if (
      now >= auction.startDate.getTime() &&
      now < auction.endDate.getTime()
    ) {
      auction.status = "live";
    } else {
      auction.status = "ended";
    }

    // Save updated status only if changed
    if (auction.isModified("status")) {
      await auction.save();
    }

    res.status(200).json({
      data: auction,
    });
  } catch (error) {
    next(new ApiError("Error while fetching auction", 500));
  }
};

exports.getAllAuctions = async (req, res, next) => {
  try {
    const auctions = await Auction.find().populate("merchant highestBidder");

    const now = Date.now();

    for (const auction of auctions) {
      const prevStatus = auction.status;

      if (now < auction.startDate.getTime()) {
        auction.status = "pending";
      } else if (
        now >= auction.startDate.getTime() &&
        now < auction.endDate.getTime()
      ) {
        auction.status = "live";
      } else {
        auction.status = "ended";
      }

      if (auction.status !== prevStatus) {
        await auction.save();
      }
    }

    res.status(200).json({
      results: auctions.length,
      data: auctions,
    });
  } catch (err) {
    console.error("Error fetching auctions:", err);
    next(new ApiError("Failed to fetch auctions", 500));
  }
};

exports.getAuctionsByMerchant = async (req, res, next) => {
  try {
    const merchantId = req.user._id;

    const auctions = await Auction.find({ merchant: merchantId }).populate(
      "highestBidder"
    );

    const now = Date.now();

    for (const auction of auctions) {
      const prevStatus = auction.status;

      if (now < auction.startDate.getTime()) {
        auction.status = "pending";
      } else if (
        now >= auction.startDate.getTime() &&
        now < auction.endDate.getTime()
      ) {
        auction.status = "live";
      } else {
        auction.status = "ended";
      }

      if (auction.status !== prevStatus) {
        await auction.save();
      }
    }

    res.status(200).json({
      results: auctions.length,
      data: auctions,
    });
  } catch (err) {
    console.error("Error fetching merchant auctions:", err);
    next(new ApiError("Failed to fetch your auctions", 500));
  }
};

exports.placeBid = async (req, res, next) => {
  try {
    const auctionId = req.params.id;
    const userId = req.user._id;
    const bidAmount = Number(req.body.bid);

    const auction = await Auction.findById(auctionId);

    if (!auction) {
      return next(new ApiError("Auction not found", 404));
    }

    // state must be live
    const now = Date.now();
    if (now < auction.startDate || now >= auction.endDate) {
      return next(new ApiError("Auction is not live", 400));
    }

    if (auction.status !== "live") {
      auction.status = "live";
      await auction.save(); // update the state
    }

    // merchant can not make a bid
    if (auction.merchant.toString() === userId.toString()) {
      return next(new ApiError("Merchant can't bid on their own auction", 403));
    }

    // bid amount must be heigher than hidhtestBid
    if (bidAmount <= auction.highestBid) {
      return next(
        new ApiError(
          `Your bid must be higher than current bid (${auction.highestBid})`,
          400
        )
      );
    }

    // update auction
    auction.highestBid = bidAmount;
    auction.highestBidder = userId;

    await auction.save();

    res.status(200).json({
      message: "Bid placed successfully",
      data: {
        auctionId: auction._id,
        highestBid: auction.highestBid,
        highestBidder: req.user._id,
      },
    });
  } catch (err) {
    console.error("Error placing bid:", err);
    next(new ApiError("Failed to place bid", 500));
  }
};

exports.updateBid = async (req, res, next) => {
  try {
    const auctionId = req.params.id;
    const userId = req.user._id;
    const newBid = Number(req.body.bid);

    const auction = await Auction.findById(auctionId);

    if (!auction) {
      return next(new ApiError("Auction not found", 404));
    }

    const now = Date.now();
    if (now < auction.startDate || now >= auction.endDate) {
      return next(new ApiError("Auction is not live", 400));
    }

    // the same user who made old bid
    if (
      !auction.highestBidder ||
      auction.highestBidder.toString() !== userId.toString()
    ) {
      return next(new ApiError("You are not the current highest bidder", 403));
    }

    // new bid must be heigher then old bid
    if (newBid <= auction.highestBid) {
      return next(
        new ApiError(
          `New bid must be higher than current bid (${auction.highestBid})`,
          400
        )
      );
    }

    // update highestBid
    auction.highestBid = newBid;
    await auction.save();

    res.status(200).json({
      message: "Your bid updated successfully",
      data: {
        auctionId: auction._id,
        newHighestBid: auction.highestBid,
      },
    });
  } catch (err) {
    console.error("Error updating bid:", err);
    next(new ApiError("Failed to update bid", 500));
  }
};

exports.updateAuction = async (req, res, next) => {
  try {
    const auctionId = req.params.id;
    const merchantId = req.user._id;

    const auction = await Auction.findById(auctionId);

    if (!auction) {
      return next(new ApiError("Auction not found", 404));
    }

    if (auction.merchant.toString() !== merchantId.toString()) {
      return next(
        new ApiError("You are not allowed to update this auction", 403)
      );
    }

    if (auction.status === "live" || auction.status === "ended") {
      return next(
        new ApiError("Cannot update auction while it's live or ended", 400)
      );
    }

    // update attribute
    auction.title = req.body.title || auction.title;
    auction.description = req.body.description || auction.description;
    auction.startPrice = req.body.startPrice || auction.startPrice;
    auction.duration = req.body.duration || auction.duration;

    // update image is provided
    if (req.files && req.files.images) {
      // upload image
      const uploadPromises = req.files.images.map((file) => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              { folder: "Auction Images", resource_type: "image" },
              (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
              }
            )
            .end(file.buffer);
        });
      });

      const imageUrls = await Promise.all(uploadPromises);
      auction.images = imageUrls;
    }

    await auction.save();

    res.status(200).json({
      message: "Auction updated successfully",
      data: auction,
    });
  } catch (err) {
    console.error("Error updating auction:", err);
    next(new ApiError("Failed to update auction", 500));
  }
};

exports.deleteAuction = async (req, res, next) => {
  try {
    const auctionId = req.params.id;
    const merchantId = req.user._id;

    const auction = await Auction.findById(auctionId);

    if (!auction) {
      return next(new ApiError("Auction not found", 404));
    }

    if (auction.merchant.toString() !== merchantId.toString()) {
      return next(
        new ApiError("You are not allowed to delete this auction", 403)
      );
    }

    if (auction.status === "live") {
      return next(new ApiError("Cannot delete auction while it's live", 400));
    }

    await auction.deleteOne();

    res.status(200).json({
      message: "Auction deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting auction:", err);
    next(new ApiError("Failed to delete auction", 500));
  }
};

exports.deleteBid = async (req, res, next) => {
  try {
    const auctionId = req.params.id;
    const userId = req.user._id;

    const auction = await Auction.findById(auctionId);

    if (!auction) {
      return next(new ApiError("Auction not found", 404));
    }

    // تأكد إن فيه مزايدة أساسًا
    if (
      !auction.currentBid ||
      auction.currentBid.user.toString() !== userId.toString()
    ) {
      return next(
        new ApiError("You do not have a bid to delete on this auction", 403)
      );
    }

    // ممكن نمنع الحذف لو الحالة ended
    if (auction.status === "ended") {
      return next(
        new ApiError("Cannot delete bid after auction has ended", 400)
      );
    }

    // حذف المزايدة
    auction.currentBid = undefined;

    await auction.save();

    res.status(200).json({
      message: "Bid deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting bid:", err);
    next(new ApiError("Failed to delete bid", 500));
  }
};
