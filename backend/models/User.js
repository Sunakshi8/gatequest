const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: '🎓'
  },
  xp: {
    type: Number,
    default: 0
  },
  badges: [{
    name: { type: String, required: true },
    icon: { type: String, required: true },
    description: { type: String },
    earnedAt: { type: Date, default: Date.now }
  }],
  stats: {
    totalGames: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    totalAnswered: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },
    multiplayerWins: { type: Number, default: 0 },
    bossQuestionsCorrect: { type: Number, default: 0 },
    chaosWins: { type: Number, default: 0 },
    gamesInSession: { type: Number, default: 0 },
    lastPlayedAt: { type: Date },
    subjectStats: {
      type: Map,
      of: {
        correct: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
      },
      default: {}
    }
  },
  lifelines: {
    fiftyFifty: { type: Number, default: 3 },
    skip: { type: Number, default: 2 },
    extraTime: { type: Number, default: 2 },
    lastRefresh: { type: Date, default: Date.now }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual: calculate level from XP
userSchema.virtual('level').get(function() {
  return Math.floor(this.xp / 100) + 1;
});

// Virtual: accuracy percentage
userSchema.virtual('accuracy').get(function() {
  if (this.stats.totalAnswered === 0) return 0;
  return Math.round((this.stats.totalCorrect / this.stats.totalAnswered) * 100);
});

// Virtual: rank title based on level
userSchema.virtual('rankTitle').get(function() {
  const level = this.level;
  if (level >= 50) return 'GATE Legend';
  if (level >= 40) return 'Grand Master';
  if (level >= 30) return 'Master';
  if (level >= 20) return 'Expert';
  if (level >= 15) return 'Advanced';
  if (level >= 10) return 'Intermediate';
  if (level >= 5) return 'Beginner';
  return 'Newbie';
});

// Method: refresh lifelines if 24 hours passed
userSchema.methods.refreshLifelines = function() {
  const now = new Date();
  const lastRefresh = this.lifelines.lastRefresh;
  const hoursSinceRefresh = (now - lastRefresh) / (1000 * 60 * 60);
  
  if (hoursSinceRefresh >= 24) {
    this.lifelines.fiftyFifty = 3;
    this.lifelines.skip = 2;
    this.lifelines.extraTime = 2;
    this.lifelines.lastRefresh = now;
  }
};

module.exports = mongoose.model('User', userSchema);
