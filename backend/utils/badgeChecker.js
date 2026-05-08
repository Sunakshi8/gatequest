const User = require('../models/User');

// All available badges with unlock conditions
const BADGE_DEFINITIONS = [
  {
    name: 'First Blood',
    icon: '🩸',
    description: 'Complete your first quiz',
    check: (user) => user.stats.totalGames >= 1
  },
  {
    name: 'Speed Demon',
    icon: '⚡',
    description: 'Earn 500+ XP in speed bonuses',
    check: (user) => user.xp >= 500
  },
  {
    name: 'Perfectionist',
    icon: '💎',
    description: 'Achieve 90%+ accuracy with 50+ answers',
    check: (user) => user.stats.totalAnswered >= 50 && user.accuracy >= 90
  },
  {
    name: 'Streak Master',
    icon: '🔥',
    description: 'Achieve a 5-correct streak',
    check: (user) => user.stats.bestStreak >= 5
  },
  {
    name: 'Inferno',
    icon: '🌋',
    description: 'Achieve a 10-correct streak',
    check: (user) => user.stats.bestStreak >= 10
  },
  {
    name: 'Subject Master',
    icon: '🧠',
    description: '90%+ accuracy in any subject (20+ questions)',
    check: (user) => {
      for (const [, stats] of user.stats.subjectStats) {
        if (stats.total >= 20 && (stats.correct / stats.total) >= 0.9) return true;
      }
      return false;
    }
  },
  {
    name: 'Boss Slayer',
    icon: '🐉',
    description: 'Get 5 boss questions correct',
    check: (user) => user.stats.bossQuestionsCorrect >= 5
  },
  {
    name: 'Comeback King',
    icon: '👑',
    description: 'Recover from wrong answer to 5-streak (tracked via bestStreak)',
    check: (user) => user.stats.bestStreak >= 5 && user.stats.totalAnswered > user.stats.totalCorrect
  },
  {
    name: 'Quiz Addict',
    icon: '🎮',
    description: 'Play 50 games',
    check: (user) => user.stats.totalGames >= 50
  },
  {
    name: 'XP Millionaire',
    icon: '💰',
    description: 'Earn 10,000 total XP',
    check: (user) => user.xp >= 10000
  },
  {
    name: 'Social Butterfly',
    icon: '🦋',
    description: 'Win 10 multiplayer games',
    check: (user) => user.stats.multiplayerWins >= 10
  },
  {
    name: 'Survivor',
    icon: '🏆',
    description: 'Win a knockout tournament',
    check: (user) => user.stats.multiplayerWins >= 1
  },
  {
    name: 'Chaos Champion',
    icon: '🌪️',
    description: 'Win 5 chaos mode games',
    check: (user) => user.stats.chaosWins >= 5
  },
  {
    name: 'Night Owl',
    icon: '🦉',
    description: 'Play between 12-5 AM',
    check: () => {
      const hour = new Date().getHours();
      return hour >= 0 && hour < 5;
    }
  },
  {
    name: 'Marathon Runner',
    icon: '🏃',
    description: 'Play 5 games in one session',
    check: (user) => user.stats.gamesInSession >= 5
  }
];

/**
 * Check all badges and award any newly earned ones
 * @returns Array of newly earned badge objects
 */
const checkBadges = async (user) => {
  const earnedBadgeNames = user.badges.map(b => b.name);
  const newBadges = [];

  for (const badge of BADGE_DEFINITIONS) {
    if (!earnedBadgeNames.includes(badge.name) && badge.check(user)) {
      const newBadge = {
        name: badge.name,
        icon: badge.icon,
        description: badge.description,
        earnedAt: new Date()
      };
      user.badges.push(newBadge);
      newBadges.push(newBadge);
    }
  }

  if (newBadges.length > 0) {
    await user.save();
  }

  return newBadges;
};

// Get all badge definitions (for showing locked badges)
const getAllBadges = () => {
  return BADGE_DEFINITIONS.map(b => ({
    name: b.name,
    icon: b.icon,
    description: b.description
  }));
};

module.exports = { checkBadges, getAllBadges, BADGE_DEFINITIONS };
