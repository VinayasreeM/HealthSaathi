require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

let cleanMongoUri = MONGO_URI ? MONGO_URI.trim() : null;
if (cleanMongoUri) {
  cleanMongoUri = cleanMongoUri.replace(/^(MONGO_URI|MONGODB_URI)=\s*/i, "").trim();
  cleanMongoUri = cleanMongoUri.replace(/<([^>]+)>/g, "$1");
}

if (cleanMongoUri && cleanMongoUri.startsWith("mongodb")) {
  mongoose
    .connect(cleanMongoUri)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err.message));
} else {
  console.log("No valid MongoDB URI configured. Running in memory / stateless mode.");
}

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`HealthSaathi backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
  }
};

startServer();