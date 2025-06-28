const mongoose = require("mongoose");

const auctionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Auction title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Auction description is required"],
      trim: true,
    },
    images: {
      type: [String],
      validate: [arrayLimit, "You can upload up to 5 images only"],
    },
    startingPrice: {
      type: Number,
      required: [true, "Starting price is required"],
      min: [0, "Starting price must be positive"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    duration: {
      type: Number,
      enum: [1, 3, 7],
      required: [true, "Auction duration (in days) is required"],
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["pending", "live", "ended"],
      default: "pending",
    },
    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Auction must be linked to a merchant"],
    },
    highestBid: {
      type: Number,
      default: 0,
    },
    highestBidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Limit images to 5
function arrayLimit(val) {
  return val.length <= 5;
}

// Set endDate automatically based on startDate and duration
auctionSchema.pre("save", function (next) {
  if (this.isModified("startDate") || this.isModified("duration")) {
    const durationInMs = this.duration * 24 * 60 * 60 * 1000;
    this.endDate = new Date(this.startDate.getTime() + durationInMs);
  }
  next();
});

const Auction = mongoose.model("Auction", auctionSchema);

module.exports = Auction;
