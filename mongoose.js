const mongoose = require("mongoose");

const Product = require("./models/product");

mongoose
  .connect("mongodb+srv://longngoryu:281099@cluster0.ic9tyrv.mongodb.net/mern")
  .then(() => {
    console.log("Connected to database");
  })
  .catch(() => {
    console.log("Connected failed");
  });

async function createProduct(req, res, next) {
  const createdProduct = new Product({
    name: req.body.name,
    price: req.body.price,
  });

  const result = await createdProduct.save();
  res.json(result);
}

async function getProducts(req, res, next) {
  const products = await Product.find().exec();
  res.json(products);
}

module.exports = { createProduct, getProducts };
