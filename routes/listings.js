const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, validateListing, isListingOwner } = require("../middleware.js");
const ExpressError = require("../utils/ExpressError.js");


//Index Route
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//New Route
router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new.ejs");
});

//Show Route
router.get("/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");

    if (!listing) {
        // throw new ExpressError(404, "Listing not found");
        req.flash("error", "Listing does not exist");
        return res.redirect("/listings")
    }

    res.render("listings/show.ejs", { listing });
}));

//Create Route
router.post("/", isLoggedIn, validateListing, wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id; // ownership set here
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
}));

//Edit Route
router.get("/:id/edit", isLoggedIn, isListingOwner, wrapAsync(async (req, res) => {
    const {id} = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        // throw new ExpressError(404, "Listing not found");
        req.flash("error", "Listing does not exist");
        return res.redirect("/listings")
    }
    res.render("listings/edit.ejs", {listing});
}));

//Update Route
router.put("/:id", isLoggedIn, isListingOwner, validateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
}));

// Delete Route
router.delete("/:id", isLoggedIn, isListingOwner, wrapAsync(async (req, res) => {
    const {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);

    if (!deletedListing) {
        throw new ExpressError(404, "Listing not found");
    }
    
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings")
}));

module.exports = router;
