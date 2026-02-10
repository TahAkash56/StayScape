const { listingSchema, reviewSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");

function isLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;

        req.flash("error", "You must be logged in first");
        return res.redirect("/login");
    }
    next();
}

function saveRedirectUrl(req, res, next){
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map((el) => el.message).join(",");
        next(new ExpressError(400, errMsg));
    } else {
        next();
    }
};

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map((el) => el.message).join(",");
        next(new ExpressError(400, errMsg));
    } else {
        next();
    }
};

const isListingOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing does not exist");
        return res.redirect("/listings");
    }
    if (!listing.owner.equals(req.user._id)) {
        req.flash("error", "You don't have permission to do that");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

const isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) {
        req.flash("error", "Review does not exist");
        return res.redirect(`/listings/${id}`);
    }
    if (!review.author || !review.author.equals(req.user._id)) {
        req.flash("error", "You don't have permission to do that");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

const setFlashLocals = (req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
};

module.exports = {
    isLoggedIn,
    validateListing,
    validateReview,
    isListingOwner,
    isReviewAuthor,
    setFlashLocals,
    saveRedirectUrl,
};
