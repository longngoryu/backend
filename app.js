const express = require("express");

const placesRoutes = require("./routers/places-route");
const usersRoutes = require("./routers/users-route");
const HttpError = require("./models/http-error");
const mongoose = require("mongoose");

const app = express();
const PORT = 5000;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
  throw new HttpError("Could not find this route.", 404);
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

mongoose
  .connect("mongodb+srv://longngoryu:281099@cluster0.ziyelll.mongodb.net/mern")
  .then(() => {
    console.log("Connected to database");
    app.listen(PORT);
  })
  .catch((err) => {
    console.log(err);
    mongoose.disconnect();
  });
