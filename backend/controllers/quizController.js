const Question = require('../models/Question');
const User = require('../models/User');
const { calculateXP } = require('../utils/xpCalculator');
const { checkBadges } = require('../utils/badgeChecker');

// @route   GET /api/quiz/questions
// @desc    Get quiz questions by subject and difficulty
const getQuestions = async (req, res) => {
  try {
    const { subject, difficulty, count = 10 } = req.query;
    
    const query = {};
    if (subject && subject !== 'all') query.subject = subject;
    if (difficulty && difficulty !== 'mixed') query.difficulty = difficulty;

    // Get random questions
    const questions = await Question.aggregate([
      { $match: query },
      { $sample: { size: parseInt(count) } }
    ]);

    if (questions.length === 0) {
      return res.status(404).json({ message: 'No questions found for these criteria' });
    }

    // Don't send correct answers to client
    const sanitized = questions.map(q => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      subject: q.subject,
      difficulty: q.difficulty,
      isBossQuestion: q.isBossQuestion,
      tags: q.tags
    }));

    res.json(sanitized);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/quiz/answer
// @desc    Submit an answer and get result
const submitAnswer = async (req, res) => {
  try {
    const { questionId, selectedAnswer, timeRemaining, totalTime, currentStreak } = req.body;
    
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const isCorrect = question.correctAnswer === selectedAnswer;
    
    // Calculate XP
    const xpResult = calculateXP({
      isCorrect,
      timeRemaining,
      totalTime,
      currentStreak: isCorrect ? currentStreak + 1 : 0,
      isBossQuestion: question.isBossQuestion
    });

    // Update user stats
    if (req.user) {
      const user = await User.findById(req.user._id);
      if (user) {
        user.stats.totalAnswered += 1;
        if (isCorrect) {
          user.stats.totalCorrect += 1;
          user.xp += xpResult.totalXP;
          if (question.isBossQuestion) {
            user.stats.bossQuestionsCorrect += 1;
          }
        }
        
        // Update subject stats
        const subjectStats = user.stats.subjectStats.get(question.subject) || { correct: 0, total: 0 };
        subjectStats.total += 1;
        if (isCorrect) subjectStats.correct += 1;
        user.stats.subjectStats.set(question.subject, subjectStats);
        
        // Update best streak
        const newStreak = isCorrect ? currentStreak + 1 : 0;
        if (newStreak > user.stats.bestStreak) {
          user.stats.bestStreak = newStreak;
        }

        await user.save();

        // Check for new badges
        const newBadges = await checkBadges(user);

        return res.json({
          correct: isCorrect,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          xpEarned: xpResult.totalXP,
          xpBreakdown: xpResult,
          newStreak: isCorrect ? currentStreak + 1 : 0,
          newBadges,
          isBossQuestion: question.isBossQuestion
        });
      }
    }

    res.json({
      correct: isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      xpEarned: xpResult.totalXP,
      xpBreakdown: xpResult,
      newStreak: isCorrect ? currentStreak + 1 : 0,
      isBossQuestion: question.isBossQuestion
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/quiz/complete
// @desc    Mark a game as complete and update stats
const completeGame = async (req, res) => {
  try {
    const { totalCorrect, totalAnswered, xpEarned, subject, bestStreak, wasAccurate } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.stats.totalGames += 1;
    user.stats.gamesInSession += 1;
    user.stats.lastPlayedAt = new Date();
    
    await user.save();

    // Check for new badges after game completion
    const newBadges = await checkBadges(user);

    res.json({
      message: 'Game completed!',
      totalXP: user.xp,
      level: user.level,
      rankTitle: user.rankTitle,
      newBadges,
      stats: user.stats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/quiz/lifeline
// @desc    Use a lifeline
const useLifeline = async (req, res) => {
  try {
    const { type, questionId } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.refreshLifelines();

    // Check if lifeline is available
    if (type === 'fiftyFifty' && user.lifelines.fiftyFifty <= 0) {
      return res.status(400).json({ message: 'No 50-50 lifelines remaining' });
    }
    if (type === 'skip' && user.lifelines.skip <= 0) {
      return res.status(400).json({ message: 'No skip lifelines remaining' });
    }
    if (type === 'extraTime' && user.lifelines.extraTime <= 0) {
      return res.status(400).json({ message: 'No extra time lifelines remaining' });
    }

    // Decrement lifeline
    user.lifelines[type] -= 1;
    await user.save();

    let result = { remaining: user.lifelines[type] };

    // For 50-50, return which options to eliminate
    if (type === 'fiftyFifty' && questionId) {
      const question = await Question.findById(questionId);
      if (question) {
        const wrongOptions = [0, 1, 2, 3].filter(i => i !== question.correctAnswer);
        // Remove 2 random wrong options
        const shuffled = wrongOptions.sort(() => Math.random() - 0.5);
        result.eliminateOptions = shuffled.slice(0, 2);
      }
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/quiz/subjects
// @desc    Get list of available subjects with question counts
const getSubjects = async (req, res) => {
  try {
    const subjects = await Question.aggregate([
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    res.json(subjects.map(s => ({ name: s._id, count: s.count })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getQuestions, submitAnswer, completeGame, useLifeline, getSubjects };
