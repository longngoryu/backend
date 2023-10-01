const mongoose = require("mongoose");

const Scheme = mongoose.Schema;

const placesShema = new Scheme({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, require: true },
  address: { type: String, require: true },
  location: {
    lat: { type: String, require: true },
    lng: { type: String, require: true },
  },
  creator: { type: String, require: true },
});

module.exports = mongoose.model("Place", placesShema);
