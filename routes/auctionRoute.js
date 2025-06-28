const express = require("express");
const router = express.Router();
const auctionController = require("../controller/auctionController");
const authController = require("../controller/authController");
const upload = require("../middlewares/upload");
const {
  createAuctionValidator,
  updateAuctionValidator,
  getAuctionValidator,
  placeBidValidator,
  updateBidValidator,
  deleteBidValidator,
} = require("../utils/validator/auctionValidator");

// Creat auction by merchant
// create bid by user
router
  .post(
    "/",
    authController.protect,
    authController.allowedTo("merchant"),
    upload.array("images", 5),
    createAuctionValidator,
    auctionController.createAuction
  )
  .post(
    "/:id/bid",
    authController.protect,
    authController.allowedTo("user"),
    placeBidValidator,
    auctionController.placeBid
  );

// get all auctions by admin
// get specific auctions by merchant & user
// get my auctions by merchant
router
  .get(
    "/",
    authController.protect,
    authController.allowedTo("amdin"),
    auctionController.getAllAuctions
  )
  .get(
    "/merchant",
    authController.protect,
    authController.allowedTo("merchant", "admin"),
    getAuctionValidator,
    auctionController.getAuctionsByMerchant
  )
  .get(
    "/:id",
    authController.protect,
    authController.allowedTo("merchant"),
    auctionController.getAuctionById
  );

// update bid by user
//update auction by merchant
router
  .put(
    "/:id/bid",
    authController.protect,
    authController.allowedTo("user"),
    updateBidValidator,
    auctionController.updateBid
  )
  .put(
    "/:id",
    authController.protect,
    authController.allowedTo("merchant"),
    upload.fields([{ name: "images", maxCount: 5 }]),
    updateAuctionValidator,
    auctionController.updateAuction
  );

// delete auction by id ( merchant )
// delete bid by user
router
  .delete(
    "/:id",
    authController.protect,
    authController.allowedTo("merchant"),
    auctionController.deleteAuction
  )
  .delete(
    "/:id/bid",
    authController.protect,
    authController.allowedTo("user"),
    deleteBidValidator,
    auctionController.deleteBid
  );

module.exports = router;
