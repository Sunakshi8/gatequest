require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db");
const { setupSocket, getActiveRooms } = require("./socket/socketHandler");
const { errorHandler } = require("./middleware/errorHandler");
const { getAllBadges } = require("./utils/badgeChecker");
const { getRandomJokes } = require("./utils/jokeCards");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});

// Connect to MongoDB Atlas
connectDB();

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "🎮 GATEQUEST API is running!" });
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/quiz", require("./routes/quizRoutes"));
app.use("/api/leaderboard", require("./routes/leaderboardRoutes"));

// Extra endpoints
app.get("/api/rooms", (req, res) => res.json(getActiveRooms()));
app.get("/api/badges/all", (req, res) => res.json(getAllBadges()));
app.get("/api/jokes", (req, res) => res.json(getRandomJokes(5)));

// Error handler
app.use(errorHandler);

// Socket.IO
setupSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🎮 GATEQUEST Server running on port ${PORT}`);
  console.log(`📡 Socket.IO ready for multiplayer`);
  console.log(`🌐 API: http://localhost:${PORT}/api/health\n`);
});
