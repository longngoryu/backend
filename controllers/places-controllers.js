const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const Place = require("../models/place");

let DUMMY_PLACES = [
  {
    id: "p1",
    title: "Empire State Building",
    description: "One of the most famous sky crapers in the world!",
    imageUrl:
      "https://i.pinimg.com/564x/bf/e3/44/bfe344de8e20967cdb62b8c6f0cbf1c2.jpg",
    address: "20 W 34th St, New York, NY 10001",
    location: {
      lat: 40.7484405,
      lng: -73.9878584,
    },
    creator: "u1",
  },
  {
    id: "p2",
    title: "Emp. State Building",
    description: "One of the most famous sky crapers in the world!",
    imageUrl:
      "https://i.pinimg.com/564x/f6/85/df/f685dfb67ec349d7b5b7c48cbeb81303.jpg",
    address: "20 W 34th St, New York, NY 10001",
    location: {
      lat: 40.7484405,
      lng: -73.9878584,
    },
    creator: "u2",
  },
];

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

  const { title, description, coordinates, address, image, creator } = req.body;

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image,
    creator,
  });

  try {
    await createdPlace.save();
  } catch (err) {
    const error = new HttpError(
      "Creating place failed, please try again.",
      500
    );
    return next(error);
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
    place = await Place.findById(placeId);
  } catch (error) {
    return next(
      new HttpError("Something went wrong, could not delete place.", 500)
    );
  }

  try {
    await place.deleteOne();
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
