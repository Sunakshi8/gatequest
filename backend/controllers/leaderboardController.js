const User = require('../models/User');

// @route   GET /api/leaderboard
// @desc    Get global leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const { limit = 20, subject } = req.query;

    const users = await User.find()
      .select('username avatar xp stats badges')
      .sort({ xp: -1 })
      .limit(parseInt(limit));

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      _id: user._id,
      username: user.username,
      avatar: user.avatar,
      xp: user.xp,
      level: user.level,
      accuracy: user.accuracy,
      rankTitle: user.rankTitle,
      totalGames: user.stats.totalGames,
      bestStreak: user.stats.bestStreak,
      badgeCount: user.badges.length
    }));

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/leaderboard/rank/:userId
// @desc    Get a user's rank
const getUserRank = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const rank = await User.countDocuments({ xp: { $gt: user.xp } }) + 1;
    const totalUsers = await User.countDocuments();

    res.json({
      rank,
      totalUsers,
      percentile: Math.round(((totalUsers - rank) / totalUsers) * 100)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLeaderboard, getUserRank };
