const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/StayScape";

async function main() {
    await mongoose.connect(MONGO_URL);
}

async function initDB() {
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);
    console.log("database was initialized");
}


main()
    .then(() => {
        console.log("connected to database");
        return initDB();
    })
    .catch(err => {
        console.log(err);
    });
