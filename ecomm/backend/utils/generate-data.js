const fs = require('fs');
const path = require('path');

const categories = [
  { id: 1, name: "Electronics", slug: "electronics", icon: "laptop", description: "Latest gadgets and devices" },
  { id: 2, name: "Clothing", slug: "clothing", icon: "shirt", description: "Fashion for everyone" },
  { id: 3, name: "Home & Kitchen", slug: "home-kitchen", icon: "home", description: "Everything for your home" },
  { id: 4, name: "Books", slug: "books", icon: "book", description: "Knowledge at your fingertips" },
  { id: 5, name: "Sports & Outdoors", slug: "sports", icon: "football", description: "Gear up for adventure" },
  { id: 6, name: "Accessories", slug: "accessories", icon: "watch", description: "Complete your look" },
  { id: 7, name: "Beauty & Personal Care", slug: "beauty", icon: "sparkles", description: "Look and feel your best" },
  { id: 8, name: "Grocery & Gourmet", slug: "grocery", icon: "shopping-cart", description: "Fresh and gourmet food" },
  { id: 9, name: "Toys & Games", slug: "toys", icon: "gamepad", description: "Fun for all ages" },
  { id: 10, name: "Baby Products", slug: "baby", icon: "baby", description: "Care for your little ones" },
  { id: 11, name: "Pet Supplies", slug: "pets", icon: "paw-print", description: "For your furry friends" },
  { id: 12, name: "Health & Wellness", slug: "health", icon: "heart-pulse", description: "Stay healthy and fit" },
  { id: 13, name: "Automotive", slug: "automotive", icon: "car", description: "Car care and accessories" },
  { id: 14, name: "Office Supplies", slug: "office", icon: "briefcase", description: "Productivity essentials" },
  { id: 15, name: "Musical Instruments", slug: "music", icon: "music", description: "Make some music" },
  { id: 16, name: "Gaming", slug: "gaming", icon: "gamepad-2", description: "Level up your play" },
  { id: 17, name: "Furniture", slug: "furniture", icon: "armchair", description: "Comfort for your space" },
  { id: 18, name: "Cameras & Photography", slug: "cameras", icon: "camera", description: "Capture every moment" },
  { id: 19, name: "Mobile Phones", slug: "phones", icon: "smartphone", description: "Stay connected" },
  { id: 20, name: "Laptops & Computers", slug: "computers", icon: "monitor", description: "Power at your fingertips" },
  { id: 21, name: "Audio & Headphones", slug: "audio", icon: "headphones", description: "Premium sound experience" },
  { id: 22, name: "Fashion - Men", slug: "mens-fashion", icon: "user", description: "Style for men" },
  { id: 23, name: "Fashion - Women", slug: "womens-fashion", icon: "user", description: "Style for women" },
  { id: 24, name: "Shoes & Footwear", slug: "shoes", icon: "footprints", description: "Step in style" },
  { id: 25, name: "Bags & Luggage", slug: "bags", icon: "briefcase", description: "Carry in style" },
  { id: 26, name: "Jewellery", slug: "jewellery", icon: "gem", description: "Shine bright" },
  { id: 27, name: "Home Decor", slug: "decor", icon: "lamp", description: "Beautify your space" },
  { id: 28, name: "Garden & Outdoor", slug: "garden", icon: "flower-2", description: "Green thumb essentials" },
  { id: 29, name: "Kitchen & Dining", slug: "kitchen", icon: "chef-hat", description: "Cook like a pro" },
  { id: 30, name: "Fitness Equipment", slug: "fitness", icon: "dumbbell", description: "Home gym essentials" },
  { id: 31, name: "Travel Essentials", slug: "travel", icon: "plane", description: "Pack smart" },
  { id: 32, name: "Stationery", slug: "stationery", icon: "pen-tool", description: "Write and create" },
  { id: 33, name: "Smart Watches", slug: "watches", icon: "watch", description: "Tech on your wrist" },
  { id: 34, name: "Baby Fashion", slug: "kids-fashion", icon: "baby", description: "Cute outfits for kids" },
  { id: 35, name: "Food & Beverages", slug: "food-beverages", icon: "coffee", description: "Treat your taste buds" },
  { id: 36, name: "Sports Equipment", slug: "sports-equipment", icon: "trophy", description: "Pro-grade gear" },
  { id: 37, name: "Smart Home", slug: "smart-home", icon: "wifi", description: "Connected living" }
];

function helper_pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function helper_range(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function helper_discount(price, original) { return Math.round(((original - price) / original) * 100); }

module.exports = { categories, helper_pick, helper_range, helper_discount, fs, path };
