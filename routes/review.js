const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams is important for nested routes
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const Review = require('../models/review.js');
const Listing = require('../models/listing.js'); // Ensure Listing model is imported
const {validateReview, isLoggedIn, isReviewAuthor}=require("../middleware.js")
const reviewController=require("../controllers/reviews.js")


// Create review
router.post("/",
isLoggedIn,
validateReview, wrapAsync(reviewController.createReview));

// Delete review
router.delete("/:reviewId",
isLoggedIn,isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;
