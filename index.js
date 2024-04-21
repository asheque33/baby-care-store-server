require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = process.env.MONGODB_URI;

console.log(uri);

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("babKrStore");
    const productsCollection = db.collection("baby accessories");
    const categoriesCollection = db.collection("categories");

    //  get all  products
    app.get("/products", async (req, res) => {
      const result = await productsCollection.find({}).toArray();
      res.status(200).json({
        success: true,
        message: "All Products retrieved successfully",
        data: result,
      });
    });
    // get a specific product
    app.get("/products/:productId", async (req, res) => {
      try {
        const id = req.params.productId;
        const _id = { _id: new ObjectId(id) };
        const result = await productsCollection.findOne(_id);
        console.log(result);
        if (!result) {
          res.status(404).json({
            success: false,
            message: "Product not found",
          });
        } else {
          res.status(200).json({
            success: true,
            message: "Product retrieved successfully",
            data: result,
          });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    });
    // get specific categories
    app.get("/baby-accessories", async (req, res) => {
      const name = req.query.category;
      let categories = [];
      if (name) {
        categories = await productsCollection
          .find({ category: { $regex: new RegExp(name), $options: "i" } })
          .toArray();
      } else if (!name) {
        categories = await productsCollection.find({}).toArray();
      }
      res.send({ status: true, message: "success", data: categories });
    });
    //  get all  categories
    app.get("/categories", async (req, res) => {
      const result = await categoriesCollection.find({}).toArray();
      res.status(200).json({
        success: true,
        message: "All Categories retrieved successfully",
        data: result,
      });
    });

    // * create a new product
    app.post("/product", async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.status(200).json({
        success: true,
        message: "Product created successfully",
        data: result,
      });
    });
    // * create a new category
    app.post("/category", async (req, res) => {
      const category = req.body;
      const result = await categoriesCollection.insertOne(category);
      res.status(200).json({
        success: true,
        message: "Category created successfully",
        data: result,
      });
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  const statusObject = {
    statusMessage: "Server is running very smoothly!",
    timeStamp: new Date(),
  };
  res.send(statusObject);
});
