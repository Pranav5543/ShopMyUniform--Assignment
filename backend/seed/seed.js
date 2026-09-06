/**
 * Seeds the database with sample schools, products, policies and a demo user
 * so the app and the AI agent have real data to work with out of the box.
 *
 * Run with: npm run seed  (from the backend/ directory)
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const School = require("../models/School");
const Product = require("../models/Product");
const Policy = require("../models/Policy");
const User = require("../models/User");

const GRADES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

async function seed() {
  await connectDB();

  console.log("Clearing existing data...");
  await Promise.all([
    School.deleteMany({}),
    Product.deleteMany({}),
    Policy.deleteMany({}),
    User.deleteMany({}),
  ]);

  console.log("Creating schools...");
  const schools = await School.insertMany([
    {
      name: "Green Valley High School",
      city: "Hyderabad",
      grades: GRADES,
      imageUrl: "/assets/Green Valley High School.png",
      logoUrl: "/assets/Green Valley High School.png",
    },
    {
      name: "Sunrise International School",
      city: "Bengaluru",
      grades: GRADES,
      imageUrl: "/assets/Sunrise International School.png",
      logoUrl: "/assets/Sunrise International School.png",
    },
    {
      name: "St. Xavier's Public School",
      city: "Mumbai",
      grades: GRADES,
      imageUrl: "/assets/St. Xavier's Public School.png",
      logoUrl: "/assets/St. Xavier's Public School.png",
    },
  ]);

  const [greenValley, sunrise, stXaviers] = schools;

  const shirtSizes = (base) => [
    { size: "22", stock: base },
    { size: "24", stock: base + 5 },
    { size: "26", stock: base + 2 },
    { size: "28", stock: base },
    { size: "30", stock: base - 2 > 0 ? base - 2 : 0 },
    { size: "32", stock: base + 3 },
  ];

  console.log("Creating products...");
  const products = [];

  products.push({
    name: "Green Valley White Half-Sleeve Shirt",
    description: "Standard-issue white cotton half-sleeve shirt for Green Valley High School.",
    category: "shirt",
    school: greenValley._id,
    gradeLevels: ["6", "7", "8"],
    gender: "boy",
    color: "white",
    price: 449,
    images: ["/assets/Green Valley White Half-Sleeve Shirt.png"],
    sizes: shirtSizes(10),
  });

  products.push({
    name: "Green Valley White Full-Sleeve Shirt (Winter)",
    description: "Warm full-sleeve white shirt, ideal for winter months, Green Valley High School.",
    category: "shirt",
    school: greenValley._id,
    gradeLevels: ["6", "7", "8", "9", "10"],
    gender: "boy",
    color: "white",
    price: 549,
    images: ["/assets/Green Valley White Full-Sleeve Shirt (Winter).png"],
    sizes: shirtSizes(6),
  });

  products.push({
    name: "Green Valley Navy Blue Trousers",
    description: "Durable navy blue school trousers for Green Valley High School.",
    category: "pant",
    school: greenValley._id,
    gradeLevels: ["6", "7", "8", "9", "10"],
    gender: "boy",
    color: "navy blue",
    price: 599,
    images: ["/assets/Green Valley Navy Blue Trousers.png"],
    sizes: shirtSizes(8),
  });

  products.push({
    name: "Green Valley Pinafore (Girls)",
    description: "Checked pinafore dress for junior grades, Green Valley High School.",
    category: "skirt",
    school: greenValley._id,
    gradeLevels: ["1", "2", "3", "4", "5"],
    gender: "girl",
    color: "blue check",
    price: 649,
    images: ["/assets/Green Valley Pinafore (Girls).png"],
    sizes: shirtSizes(7),
  });

  products.push({
    name: "Green Valley House Tie",
    description: "Official house-colour tie for Green Valley High School.",
    category: "tie",
    school: greenValley._id,
    gradeLevels: GRADES,
    gender: "unisex",
    color: "maroon-striped",
    price: 149,
    images: ["/assets/Green Valley House Tie.png"],
    sizes: [{ size: "Standard", stock: 40 }],
  });

  products.push({
    name: "Sunrise International Sky Blue Shirt",
    description: "Sky blue cotton-poly shirt for Sunrise International School.",
    category: "shirt",
    school: sunrise._id,
    gradeLevels: ["1", "2", "3", "4", "5", "6", "7"],
    gender: "unisex",
    color: "sky blue",
    price: 479,
    images: ["/assets/Sunrise International Sky Blue Shirt.png"],
    sizes: shirtSizes(9),
  });

  products.push({
    name: "Sunrise International Grey Trousers",
    description: "Grey formal trousers for Sunrise International School, senior grades.",
    category: "pant",
    school: sunrise._id,
    gradeLevels: ["8", "9", "10"],
    gender: "boy",
    color: "grey",
    price: 629,
    images: ["/assets/Sunrise International Grey Trousers.png"],
    sizes: shirtSizes(5),
  });

  products.push({
    name: "Sunrise International Sports Kit",
    description: "T-shirt and shorts combo for PE/sports days, Sunrise International School.",
    category: "sports-kit",
    school: sunrise._id,
    gradeLevels: GRADES,
    gender: "unisex",
    color: "royal blue",
    price: 799,
    images: ["/assets/Sunrise International Sports Kit.png"],
    sizes: shirtSizes(12),
  });

  products.push({
    name: "St. Xavier's White Shirt",
    description: "Classic white shirt for St. Xavier's Public School, all grades.",
    category: "shirt",
    school: stXaviers._id,
    gradeLevels: GRADES,
    gender: "unisex",
    color: "white",
    price: 459,
    images: ["/assets/St.Xavier's White Shirt.png"],
    sizes: shirtSizes(0), // deliberately low/zero stock on some sizes to test AI stock answers
  });

  products.push({
    name: "St. Xavier's Black Formal Shoes",
    description: "Black lace-up formal shoes, St. Xavier's Public School uniform standard.",
    category: "shoes",
    school: stXaviers._id,
    gradeLevels: GRADES,
    gender: "unisex",
    color: "black",
    price: 899,
    images: ["/assets/St.Xavier's Black Formal Shoes.png"],
    sizes: [
      { size: "3", stock: 4 },
      { size: "4", stock: 6 },
      { size: "5", stock: 6 },
      { size: "6", stock: 3 },
      { size: "7", stock: 0 },
    ],
  });

  const inserted = await Product.insertMany(products);
  console.log(`Inserted ${inserted.length} products.`);

  console.log("Creating policies (used by the AI agent for delivery/returns questions)...");
  await Policy.insertMany([
    {
      key: "delivery",
      title: "Delivery Timelines",
      content:
        "Standard delivery takes 4-6 business days across India. Metro cities (Hyderabad, Bengaluru, " +
        "Mumbai, Delhi, Chennai) typically receive orders within 3-4 business days. Orders placed before " +
        "2 PM are processed the same day. Free shipping applies on orders above INR 999; a flat INR 49 " +
        "shipping fee applies below that. Delivery partners: BlueDart and Delhivery. Tracking updates are " +
        "sent via SMS and email once the order is shipped.",
    },
    {
      key: "returns",
      title: "Returns & Exchanges",
      content:
        "Uniforms can be exchanged for a different size within 7 days of delivery, provided the item is " +
        "unused, unwashed, and has original tags attached. To start an exchange: go to 'My Orders', open " +
        "the relevant order, and click 'Request Exchange', or ask this chat assistant to help. Refunds " +
        "(instead of exchange) are only offered for damaged or incorrect items and are processed within " +
        "5-7 business days after the returned item is received at our warehouse. Innerwear, socks, and " +
        "customized/embroidered items are not eligible for return or exchange.",
    },
    {
      key: "sizing-guide",
      title: "Sizing Guide",
      content:
        "Shirt and trouser sizes are numbered by chest/waist measurement in inches (e.g., size 26 fits " +
        "roughly a 26-inch chest, typically ages 8-9). If a student is between two sizes, we recommend " +
        "sizing up since uniforms are worn for a full academic year. Shoe sizes follow UK/India standard " +
        "sizing.",
    },
    {
      key: "payment",
      title: "Payment Options",
      content:
        "We accept Cash on Delivery (COD), major debit/credit cards, and UPI. Payment is only captured " +
        "(for card/UPI) once the order is confirmed; COD orders are paid at the time of delivery.",
    },
  ]);

  // Create default admin user
  await User.create({
    name: "Admin",
    email: "admin@shopmyuniform.com",
    password: "admin123",
    role: "admin"
  });

// Demo parent user creation removed per user request; no parent credentials are seeded.

// Admin user creation removed per user request; credentials documented in README.md
  console.log("Seed complete.");
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
