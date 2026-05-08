const mongoose = require("mongoose");

const gameSessionSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
    },
    mode: {
      type: String,
      required: true,
      enum: ["1v1", "4player", "knockout"],
      default: "1v1",
    },
    subject: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      default: "mixed",
    },
    chaosMode: {
      type: Boolean,
      default: false,
    },
    players: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        username: String,
        avatar: String,
        score: { type: Number, default: 0 },
        xpEarned: { type: Number, default: 0 },
        streak: { type: Number, default: 0 },
        bestStreak: { type: Number, default: 0 },
        correctAnswers: { type: Number, default: 0 },
        totalAnswered: { type: Number, default: 0 },
        eliminated: { type: Boolean, default: false },
        answers: [
          {
            questionIndex: Number,
            selectedAnswer: Number,
            correct: Boolean,
            timeMs: Number,
          },
        ],
      },
    ],
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    currentQuestion: {
      type: Number,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      default: 10,
    },
    status: {
      type: String,
      enum: ["waiting", "starting", "playing", "finished"],
      default: "waiting",
    },
    winner: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      username: String,
    },
    chaosEvents: [
      {
        type: { type: String },
        questionIndex: Number,
        timestamp: Date,
      },
    ],
  },
  {
    timestamps: true,
  },
);

gameSessionSchema.index({ status: 1 });

module.exports = mongoose.model("GameSession", gameSessionSchema);
