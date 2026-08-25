require("dotenv").config();

const dns = require("dns");

dns.setServers(["10.62.251.48"]);

const app = require("./app");
const connectDB = require("./config/db");
const { startReminderScheduler } = require("./services/reminderService");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`HealthSaathi backend running on port ${PORT}`);
      // ⏰ Start automated medication & appointment reminder scheduler (Backend Member 3)
      startReminderScheduler();
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();