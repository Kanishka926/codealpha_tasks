const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const Category = require("../models/Category");
const Product = require("../models/Product");

// Load env variables
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected for seeding"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

// Read the existing data.json from the frontend public folder
const data = require(path.join(__dirname, "..", "..", "public", "JS", "data.json"));

const seedDatabase = async () => {
  try {
    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});

    console.log("Cleared existing data");

    // Insert categories (skip the "recently-viewed" virtual category)
    const categoriesToInsert = data.categories.filter(
      (cat) => cat.id !== "recently-viewed"
    );

    const categoryDocs = await Category.insertMany(
      categoriesToInsert.map((cat) => ({
        name: cat.name,
        slug: cat.id,
        description: cat.description,
        image: cat.image,
        isRecentlyViewed: cat.isRecentlyViewed || false,
      }))
    );

    console.log(`Seeded ${categoryDocs.length} categories`);

    // Insert products
    const productDocs = await Product.insertMany(
      data.products.map((p) => ({
        name: p.name,
        brand: p.brand,
        category: p.category,
        price: p.price,
        originalPrice: p.originalPrice,
        discount: p.discount,
        rating: p.rating,
        description: p.description,
        image: p.image,
        colors: p.colors,
        sizes: p.sizes,
        inStock: p.inStock,
      }))
    );

    console.log(`Seeded ${productDocs.length} products`);
    console.log("Database seeded successfully!");

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error.message);
    process.exit(1);
  }
};

seedDatabase();
