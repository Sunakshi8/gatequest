const express = require('express');
const router = express.Router();
const { getQuestions, submitAnswer, completeGame, useLifeline, getSubjects } = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

router.get('/questions', protect, getQuestions);
router.post('/answer', protect, submitAnswer);
router.post('/complete', protect, completeGame);
router.post('/lifeline', protect, useLifeline);
router.get('/subjects', protect, getSubjects);

module.exports = router;
