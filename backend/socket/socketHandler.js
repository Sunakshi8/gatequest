const Question = require('../models/Question');
const User = require('../models/User');
const GameSession = require('../models/GameSession');
const { calculateXP } = require('../utils/xpCalculator');
const { getRandomJoke } = require('../utils/jokeCards');

// Active rooms stored in memory for fast access
const activeRooms = new Map();

// Chaos mode event types
const CHAOS_EVENTS = [
  { type: 'doubleXP', name: '⚡ DOUBLE XP ROUND!', duration: 1 },
  { type: 'reverseScoring', name: '🔄 REVERSE SCORING!', duration: 1 },
  { type: 'suddenDeath', name: '💀 SUDDEN DEATH!', duration: 1 },
  { type: 'speedRound', name: '🏎️ SPEED ROUND! (5s timer)', duration: 1 },
  { type: 'mysteryBox', name: '🎁 MYSTERY BOX!', duration: 0 }
];

const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Player connected: ${socket.id}`);

    // CREATE ROOM
    socket.on('create-room', async (data) => {
      try {
        const { userId, username, avatar, mode, subject, difficulty, chaosMode, questionCount } = data;
        const roomCode = generateRoomCode();

        // Fetch questions
        const query = {};
        if (subject && subject !== 'all') query.subject = subject;
        if (difficulty && difficulty !== 'mixed') query.difficulty = difficulty;

        const questions = await Question.aggregate([
          { $match: query },
          { $sample: { size: questionCount || 10 } }
        ]);

        const maxPlayers = mode === '1v1' ? 2 : mode === '4player' ? 4 : 8;

        const room = {
          roomCode,
          mode,
          subject: subject || 'all',
          difficulty: difficulty || 'mixed',
          chaosMode: chaosMode || false,
          maxPlayers,
          questions,
          currentQuestion: 0,
          status: 'waiting',
          players: [{
            socketId: socket.id,
            userId,
            username,
            avatar: avatar || '🎓',
            score: 0,
            xpEarned: 0,
            streak: 0,
            bestStreak: 0,
            correctAnswers: 0,
            totalAnswered: 0,
            eliminated: false,
            answered: false
          }],
          answeredCount: 0,
          timer: null,
          chaosEvents: [],
          activeChaosEvent: null
        };

        activeRooms.set(roomCode, room);
        socket.join(roomCode);

        socket.emit('room-created', {
          roomCode,
          mode,
          maxPlayers,
          subject: room.subject,
          difficulty: room.difficulty,
          chaosMode: room.chaosMode,
          questionCount: questions.length,
          players: room.players.map(p => ({
            username: p.username,
            avatar: p.avatar,
            score: p.score
          }))
        });

        console.log(`🏠 Room ${roomCode} created by ${username} (${mode})`);
      } catch (error) {
        socket.emit('error', { message: 'Failed to create room: ' + error.message });
      }
    });

    // JOIN ROOM
    socket.on('join-room', (data) => {
      const { roomCode, userId, username, avatar } = data;
      const room = activeRooms.get(roomCode);

      if (!room) {
        return socket.emit('error', { message: 'Room not found' });
      }
      if (room.status !== 'waiting') {
        return socket.emit('error', { message: 'Game already in progress' });
      }
      if (room.players.length >= room.maxPlayers) {
        return socket.emit('error', { message: 'Room is full' });
      }

      const player = {
        socketId: socket.id,
        userId,
        username,
        avatar: avatar || '🎓',
        score: 0,
        xpEarned: 0,
        streak: 0,
        bestStreak: 0,
        correctAnswers: 0,
        totalAnswered: 0,
        eliminated: false,
        answered: false
      };

      room.players.push(player);
      socket.join(roomCode);

      const playerList = room.players.map(p => ({
        username: p.username,
        avatar: p.avatar,
        score: p.score
      }));

      io.to(roomCode).emit('player-joined', {
        username,
        avatar: player.avatar,
        players: playerList,
        playerCount: room.players.length,
        maxPlayers: room.maxPlayers
      });

      console.log(`👤 ${username} joined room ${roomCode}`);
    });

    // START GAME
    socket.on('start-game', (data) => {
      const { roomCode } = data;
      const room = activeRooms.get(roomCode);

      if (!room) return socket.emit('error', { message: 'Room not found' });
      if (room.players.length < 2) {
        return socket.emit('error', { message: 'Need at least 2 players' });
      }

      room.status = 'playing';
      room.currentQuestion = 0;

      // Send first question
      sendQuestion(io, room);
    });

    // SUBMIT ANSWER (multiplayer)
    socket.on('submit-answer', (data) => {
      const { roomCode, selectedAnswer, timeRemaining, totalTime } = data;
      const room = activeRooms.get(roomCode);

      if (!room || room.status !== 'playing') return;

      const player = room.players.find(p => p.socketId === socket.id);
      if (!player || player.answered || player.eliminated) return;

      player.answered = true;
      room.answeredCount++;

      const question = room.questions[room.currentQuestion];
      const isCorrect = question.correctAnswer === selectedAnswer;

      if (isCorrect) {
        player.streak++;
        player.correctAnswers++;
        if (player.streak > player.bestStreak) player.bestStreak = player.streak;

        // Calculate XP with chaos mode modifiers
        let xpResult = calculateXP({
          isCorrect: true,
          timeRemaining,
          totalTime,
          currentStreak: player.streak,
          isBossQuestion: question.isBossQuestion
        });

        // Chaos mode: Double XP
        if (room.activeChaosEvent?.type === 'doubleXP') {
          xpResult.totalXP *= 2;
        }
        // Chaos mode: Reverse Scoring
        if (room.activeChaosEvent?.type === 'reverseScoring') {
          xpResult.totalXP = -Math.abs(xpResult.totalXP);
        }

        player.score += xpResult.totalXP;
        player.xpEarned += Math.max(0, xpResult.totalXP);
      } else {
        // Chaos mode: Reverse Scoring — wrong answer gives points
        if (room.activeChaosEvent?.type === 'reverseScoring') {
          player.score += 10;
          player.xpEarned += 10;
        }
        // Chaos mode: Sudden Death
        if (room.activeChaosEvent?.type === 'suddenDeath') {
          player.eliminated = true;
          io.to(roomCode).emit('player-eliminated', {
            username: player.username,
            avatar: player.avatar
          });
        }
        player.streak = 0;
      }

      player.totalAnswered++;

      // Send result to the player
      socket.emit('answer-result', {
        correct: isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        xpEarned: isCorrect ? calculateXP({
          isCorrect, timeRemaining, totalTime,
          currentStreak: player.streak,
          isBossQuestion: question.isBossQuestion
        }).totalXP : 0,
        newStreak: player.streak,
        joke: !isCorrect ? getRandomJoke() : null,
        isBossQuestion: question.isBossQuestion
      });

      // Broadcast scores to all
      io.to(roomCode).emit('score-update', {
        players: room.players.map(p => ({
          username: p.username,
          avatar: p.avatar,
          score: p.score,
          streak: p.streak,
          eliminated: p.eliminated,
          answered: p.answered
        }))
      });

      // Check if all players answered
      const activePlayers = room.players.filter(p => !p.eliminated);
      const allAnswered = activePlayers.every(p => p.answered);

      if (allAnswered) {
        // Move to next question after a delay
        setTimeout(() => nextQuestion(io, room), 3000);
      }
    });

    // CHAT MESSAGE
    socket.on('chat-message', (data) => {
      const { roomCode, message, username } = data;
      io.to(roomCode).emit('chat-message', { username, message, timestamp: Date.now() });
    });

    // DISCONNECT
    socket.on('disconnect', () => {
      console.log(`🔌 Player disconnected: ${socket.id}`);

      // Find and handle player leaving rooms
      for (const [roomCode, room] of activeRooms) {
        const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
        if (playerIndex !== -1) {
          const player = room.players[playerIndex];
          room.players.splice(playerIndex, 1);

          io.to(roomCode).emit('player-left', {
            username: player.username,
            players: room.players.map(p => ({
              username: p.username,
              avatar: p.avatar,
              score: p.score
            }))
          });

          // Clean up empty rooms
          if (room.players.length === 0) {
            if (room.timer) clearTimeout(room.timer);
            activeRooms.delete(roomCode);
            console.log(`🗑️ Room ${roomCode} deleted (empty)`);
          }
          break;
        }
      }
    });
  });
};

// Send current question to all players in room
function sendQuestion(io, room) {
  const question = room.questions[room.currentQuestion];
  if (!question) {
    return endGame(io, room);
  }

  // Reset answered flags
  room.players.forEach(p => { p.answered = false; });
  room.answeredCount = 0;

  // Determine timer based on difficulty
  let timerSeconds = 30;
  if (question.difficulty === 'medium') timerSeconds = 20;
  if (question.difficulty === 'hard') timerSeconds = 15;

  // Chaos mode: Speed Round
  if (room.activeChaosEvent?.type === 'speedRound') {
    timerSeconds = 5;
  }

  // Maybe trigger chaos event
  let chaosEvent = null;
  if (room.chaosMode && room.currentQuestion > 0 && Math.random() < 0.35) {
    chaosEvent = CHAOS_EVENTS[Math.floor(Math.random() * CHAOS_EVENTS.length)];
    room.activeChaosEvent = chaosEvent;
    room.chaosEvents.push({
      type: chaosEvent.type,
      questionIndex: room.currentQuestion,
      timestamp: new Date()
    });
  } else {
    room.activeChaosEvent = null;
  }

  io.to(room.roomCode).emit('new-question', {
    questionIndex: room.currentQuestion,
    totalQuestions: room.questions.length,
    question: question.question,
    options: question.options,
    subject: question.subject,
    difficulty: question.difficulty,
    isBossQuestion: question.isBossQuestion,
    timer: timerSeconds,
    chaosEvent: chaosEvent ? { type: chaosEvent.type, name: chaosEvent.name } : null,
    players: room.players.map(p => ({
      username: p.username,
      avatar: p.avatar,
      score: p.score,
      streak: p.streak,
      eliminated: p.eliminated
    }))
  });

  // Auto-advance after timer expires
  room.timer = setTimeout(() => {
    // Mark unanswered players
    room.players.forEach(p => {
      if (!p.answered && !p.eliminated) {
        p.answered = true;
        p.totalAnswered++;
        p.streak = 0;
        if (room.activeChaosEvent?.type === 'suddenDeath') {
          p.eliminated = true;
          io.to(room.roomCode).emit('player-eliminated', {
            username: p.username,
            avatar: p.avatar
          });
        }
      }
    });

    io.to(room.roomCode).emit('time-up', {
      correctAnswer: question.correctAnswer,
      explanation: question.explanation
    });

    setTimeout(() => nextQuestion(io, room), 3000);
  }, (timerSeconds + 1) * 1000);
}

// Move to next question
function nextQuestion(io, room) {
  if (room.timer) clearTimeout(room.timer);

  room.currentQuestion++;

  // Knockout mode: eliminate lowest scorer each round
  if (room.mode === 'knockout' && room.currentQuestion % 3 === 0) {
    const activePlayers = room.players.filter(p => !p.eliminated);
    if (activePlayers.length > 2) {
      const lowest = activePlayers.reduce((min, p) => p.score < min.score ? p : min);
      lowest.eliminated = true;
      io.to(room.roomCode).emit('player-eliminated', {
        username: lowest.username,
        avatar: lowest.avatar,
        reason: 'Knocked out! Lowest score this round.'
      });
    }
  }

  // Check if game should end
  const activePlayers = room.players.filter(p => !p.eliminated);
  if (room.currentQuestion >= room.questions.length || activePlayers.length <= 1) {
    return endGame(io, room);
  }

  sendQuestion(io, room);
}

// End game and determine winner
async function endGame(io, room) {
  if (room.timer) clearTimeout(room.timer);
  room.status = 'finished';

  // Determine winner
  const activePlayers = room.players.filter(p => !p.eliminated);
  const sorted = [...room.players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  // Update user stats in database
  for (const player of room.players) {
    try {
      const user = await User.findById(player.userId);
      if (user) {
        user.xp += Math.max(0, player.xpEarned);
        user.stats.totalGames += 1;
        user.stats.totalCorrect += player.correctAnswers;
        user.stats.totalAnswered += player.totalAnswered;
        if (player.bestStreak > user.stats.bestStreak) {
          user.stats.bestStreak = player.bestStreak;
        }
        if (player === winner) {
          user.stats.multiplayerWins += 1;
          if (room.chaosMode) user.stats.chaosWins += 1;
        }
        await user.save();
      }
    } catch (e) {
      console.error(`Failed to update stats for ${player.username}:`, e.message);
    }
  }

  io.to(room.roomCode).emit('game-over', {
    winner: {
      username: winner.username,
      avatar: winner.avatar,
      score: winner.score
    },
    rankings: sorted.map((p, i) => ({
      rank: i + 1,
      username: p.username,
      avatar: p.avatar,
      score: p.score,
      xpEarned: Math.max(0, p.xpEarned),
      correctAnswers: p.correctAnswers,
      totalAnswered: p.totalAnswered,
      bestStreak: p.bestStreak,
      eliminated: p.eliminated
    })),
    chaosEvents: room.chaosEvents
  });

  // Clean up room after 30 seconds
  setTimeout(() => {
    activeRooms.delete(room.roomCode);
  }, 30000);
}

// Get active rooms list for lobby
const getActiveRooms = () => {
  const rooms = [];
  for (const [code, room] of activeRooms) {
    if (room.status === 'waiting') {
      rooms.push({
        roomCode: code,
        mode: room.mode,
        subject: room.subject,
        difficulty: room.difficulty,
        chaosMode: room.chaosMode,
        playerCount: room.players.length,
        maxPlayers: room.maxPlayers,
        host: room.players[0]?.username || 'Unknown'
      });
    }
  }
  return rooms;
};

module.exports = { setupSocket, getActiveRooms };
