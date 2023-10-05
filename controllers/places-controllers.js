const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Place = require("../models/place");
const User = require("../models/user");

async function getPlaceById(req, res, next) {
  const placesId = req.params.pid;
  let place;

  try {
    place = await Place.findById(placesId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a place",
      500
    );
    return next(error);
  }

  if (!place) {
    return next(
      new HttpError("Could not find a place for the provided id.", 404)
    );
  }

  res.json({ place: place.toObject({ getters: true }) });
}

async function getPlacesByUserId(req, res, next) {
  const userId = req.params.uid;
  let places;

  try {
    places = await Place.find({ creator: userId });
  } catch (error) {
    return next(
      new HttpError("Fetching places failed, please try again later", 500)
    );
  }

  if (!places || places.length === 0) {
    return next(
      new HttpError("Could not find a places for the provided user id.", 404)
    );
  }

  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
}

async function createPlace(req, res, next) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    console.log(error);
    throw new HttpError("Invalid inputs passed, please check your data.", 422);
  }

  const { title, description, address, location, image, creator } = req.body;

  const createdPlace = new Place({
    title,
    description,
    address,
    location,
    image,
    creator,
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (error) {
    return next(new HttpError("Creating place failed, please try again", 500));
  }

  if (!user) {
    return next(new HttpError("Creating place failed, please try again.", 500));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    await createdPlace.save({ session: sess });

    user.places.push(createdPlace);
    await user.save({ session: sess });

    await sess.commitTransaction();
  } catch (err) {
    return next(new HttpError("Creating place failed, please try again.", 500));
  }

  res.status(201).json({ place: createdPlace });
}

async function updatePlace(req, res, next) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    next(new HttpError("Invalid inputs passed, please check your data.", 422));
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;
  let place;

  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(
      new HttpError("Something went wrong, could not update place", 500)
    );
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (error) {
    return next(
      new HttpError("Something went wrong, could not update place.", 500)
    );
  }
  res.status(200).json({ place: place.toObject({ getters: true }) });
}

async function deletePlace(req, res, next) {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate("creator");
  } catch (error) {
    return next(
      new HttpError("Something went wrong, could not delete place.", 500)
    );
  }

  if (!place) {
    return next(new HttpError("Could not find place for this id.", 404));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    await place.deleteOne({ session: sess });

    place.creator.places.pull(place);
    await place.creator.save({ session: sess });

    await sess.commitTransaction();
  } catch (error) {
    return next(
      new HttpError("Something went wrong, could not delete place.", 500)
    );
  }

  res.status(200).json({ message: "Deleted place." });
}

module.exports = {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlace,
  deletePlace,
};
