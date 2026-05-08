/**
 * XP Calculator — GATEQUEST Scoring Engine
 *
 * Formula:
 *   Base XP = 10 per correct answer
 *   Time Bonus = (timeRemaining / totalTime) * 10  → 0-10 bonus
 *   Streak Multiplier: 3→1.5x, 5→2x, 10→3x
 *   Boss Round = 3x base
 *   Final = (Base + TimeBonus) × StreakMultiplier × BossMultiplier
 */

const calculateXP = ({
  isCorrect,
  timeRemaining = 0,
  totalTime = 30,
  currentStreak = 0,
  isBossQuestion = false,
}) => {
  if (!isCorrect) {
    return {
      baseXP: 0,
      timeBonus: 0,
      streakMultiplier: 1,
      bossMultiplier: 1,
      totalXP: 0,
      streakBroken: true,
    };
  }

  // Base XP
  const baseXP = 10;

  // Time bonus (0-10 XP based on how fast you answered)
  const timeBonus = Math.max(0, Math.round((timeRemaining / totalTime) * 10));

  // Streak multiplier
  let streakMultiplier = 1;
  if (currentStreak >= 10) streakMultiplier = 3;
  else if (currentStreak >= 5) streakMultiplier = 2;
  else if (currentStreak >= 3) streakMultiplier = 1.5;

  // Boss question multiplier
  const bossMultiplier = isBossQuestion ? 3 : 1;

  // Calculate total
  const totalXP = Math.round(
    (baseXP + timeBonus) * streakMultiplier * bossMultiplier,
  );

  return {
    baseXP,
    timeBonus,
    streakMultiplier,
    bossMultiplier,
    totalXP,
    streakBroken: false,
  };
};

// Calculate level from total XP
const getLevel = (xp) => Math.floor(xp / 100) + 1;

// XP needed for next level
const xpForNextLevel = (currentXP) => {
  const currentLevel = getLevel(currentXP);
  return currentLevel * 100 - currentXP;
};

module.exports = { calculateXP, getLevel, xpForNextLevel };
