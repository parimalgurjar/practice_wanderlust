const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const Listing = require("../models/listing");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer = require('multer');
const {storage}=require("../cloudConfig.js")
const upload = multer({storage });

// Index route
router.get("/", wrapAsync(listingController.index));

// New route
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Show route
router.get("/:id", wrapAsync(listingController.showListing));

// Create route with file upload
router.post("/", isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingController.createListing));

// Edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

// Update route
router.put("/:id", isLoggedIn, isOwner,upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing));

// Delete route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

module.exports = router;
