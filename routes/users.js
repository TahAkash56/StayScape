const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const User = require("../models/user.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");


//signup get route
router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

//signup post route
router.post("/signup", wrapAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);

        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to StayScape!");
            res.redirect("/listings");
        });
        
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }
}));

//Login get route
router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

//login post route
router.post("/login", saveRedirectUrl, passport.authenticate("local", 
    {failureRedirect: "/login", failureFlash: true}),
    (req, res) => {
        const redirectUrl = res.locals.returnTo || "/listings";

        req.flash("success", "Welcome back!");
        res.redirect(redirectUrl);
});

//Logout Route
router.get("/logout", (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.flash("success", "Logged out successfully");
    res.redirect("/listings");
  });
});

module.exports = router;

