const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const compression = require("compression");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

dotenv.config({ path: "config.env" });
const dbConnection = require("./config/dbconnection");

// Routes
const authRoute = require("./routes/authRoute");
const categoryRoute = require("./routes/categoryRoute");
const subCategoryRoute = require("./routes/subCategoryRoute");
const brandRoute = require("./routes/brandRoute");
const productRoute = require("./routes/productRoute");
const reviewRoute = require("./routes/reviewRoute");
const coupons = require("./routes/couponRoute");
const wishListRoute = require("./routes/wishListRoute");
const addressesRoute = require("./routes/addressRoute");
const auctionRoute = require("./routes/auctionRoute");
const blogRoute = require("./routes/blogRoute");

// const mountRoutes = require("./routes/index");
const ApiError = require("./utils/apiError");
const glabalError = require("./middlewares/errorMiddleware");

//connect with db
dbConnection();

// express app
const app = express();

// Enable CORS (Cross-Origin Resource Sharing) for all routes
// enable other domains to access your application
app.use(cors());
app.options("*", cors());

// compress all responses
app.use(compression());

// Middleware to parse JSON bodies
app.use(express.json());

// To remove data using these defaults:
app.use(mongoSanitize());
app.use(xss());

// Routes
// mountRoutes(app);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/category", categoryRoute);
app.use("/api/v1/subcategory", subCategoryRoute);
app.use("/api/v1/brand", brandRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/review", reviewRoute);
app.use("/api/v1/coupons", coupons);
app.use("/api/v1/wishlist", wishListRoute);
app.use("/api/v1/addresses", addressesRoute);
app.use("/api/v1/auctions", auctionRoute);
app.use("/api/v1/blogs", blogRoute);

app.get("/", (req, res) => {
  res.send("Server is working!");
});

app.all("*", (req, res, next) => {
  // create error and send it to error handling middleware
  // const err = new Error(`Can't find this route: ${req.originalUrl}`);
  // next(err.message);
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// Error handling middleware
app.use(glabalError);

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});

// Handle rejection outside express
process.on("unhandledRejection", (err) => {
  console.error(`unhandledRejection Error:${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`shutting down...`);
    process.exit(1);
  });
});
