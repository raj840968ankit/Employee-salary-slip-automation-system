const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing in environment variables");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
  } catch (error) {
    if (error.message.includes("bad auth") || error.message.includes("Authentication failed")) {
      throw new Error(
        "MongoDB authentication failed. Check your Atlas database username, password, and whether special characters in the password are URL-encoded."
      );
    }

    throw error;
  }
};

module.exports = connectDB;
