const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, validateReview, isReviewAuthor } = require("../middleware.js");

//Post Reviews route //Post Route
router.post("/", isLoggedIn, validateReview, wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        req.flash("error", "Listing does not exist");
        return res.redirect("/listings");
    }
    const review = new Review(req.body.review);
    review.author = req.user._id;

    listing.reviews.push(review);
    await review.save();
    await listing.save();

    req.flash("success", "New Review Created!")
    res.redirect(`/listings/${listing._id}`);
}));

//Delete Review Route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(async (req, res, next) => {
    const { id, reviewId} = req.params;

    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;
