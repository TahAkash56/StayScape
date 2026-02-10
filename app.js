const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const connectMongo = require("connect-mongo");
const MongoStore = connectMongo.default || connectMongo.MongoStore || connectMongo;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const { setFlashLocals } = require("./middleware.js");

const listingsRouter = require("./routes/listings.js");
const reviewsRouter = require("./routes/reviews.js");
const userRouter = require("./routes/users.js");

const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/StayScape";
const secret = process.env.SESSION_SECRET || "dev-secret-change-me";
const port = process.env.PORT || 8080;

if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}

async function main() {
    await mongoose.connect(dbUrl);
};

main()
    .then(res => {
        console.log("connected to database");
    })
    .catch(err => console.log(err))

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate)
app.use(express.static(path.join(__dirname, "public")));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: { secret },
  touchAfter: 24 * 3600
});

store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE");
});

const sessionOptions = {
  store,
  secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
};

app.get("/", (req, res) => {
    res.send("Hi, I am root");
});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(setFlashLocals);

// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "sigma-student",
//     });

//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// });

app.use("/listings/:id/reviews", reviewsRouter);
app.use("/listings", listingsRouter);
app.use("/", userRouter);

app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong"} = err;
    res.status(statusCode).render("error.ejs", { message });
});

app.listen(port, () => {
    console.log(`server is listening to port ${port}`)
});
