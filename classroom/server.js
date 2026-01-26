const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");

const app = express();

const sessionOptions = {
    secret: "this-should-be-an-env-variable",
    resave: false,
    saveUninitialized: false,
  }

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(session(sessionOptions));
app.use(flash());

app.use((req, res, next) => {
	res.locals.success = req.flash("success");
	res.locals.error = req.flash("error");
	res.locals.currentUser = res.session.name;
	next();
});

app.get("/", (req, res) => {
  	res.send("Session learning started");
});

app.get("/set", (req, res) => {
	req.session.username = "Akash";
	res.send("Session data set");
});

app.get("/get", (req, res) => {
  	res.send(`Hello ${req.session.username}`);
});

app.get("/count", (req, res) => {
    if(!req.session.count) {
        req.session.count = 1;
    } else {
        req.session.count++;
    }
    res.send(`Count: ${req.session.count}`);
});


app.get("/set-flash", (req, res) => {
	let { name = "anonymous" } = req.query;
	req.session.name = name;

	if(name === "anonymous") {
		req.flash("error", "please enter a valid name");
	} else {
		req.flash("success", "This is a success message");
	}
	res.redirect("/get-flash");
});

app.get("/get-flash", (req, res) => { 
	res.locals.name = req.session.name;
	res.render("page.ejs");
});

app.listen(3000, () => {
  	console.log("Server running on port 3000");
});
