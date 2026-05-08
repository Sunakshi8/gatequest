import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { getQuestions, submitAnswer, completeGame, useLifeline } from '../services/quizService';

export default function QuizPlay() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { play } = useSound();
  const { subject = 'all', difficulty = 'mixed', questionCount = 10 } = location.state || {};

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [streak, setStreak] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timer, setTimer] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [flashClass, setFlashClass] = useState('');
  const [shaking, setShaking] = useState(false);
  const [eliminated, setEliminated] = useState([]);
  const [jokeData, setJokeData] = useState(null);
  const [xpPopup, setXpPopup] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [lifelines, setLifelines] = useState({
    fiftyFifty: user?.lifelines?.fiftyFifty ?? 3,
    skip: user?.lifelines?.skip ?? 2,
    extraTime: user?.lifelines?.extraTime ?? 2
  });

  // Fetch questions
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getQuestions({ subject, difficulty, count: questionCount });
        setQuestions(data);
        setLoading(false);
        setTimerActive(true);
      } catch (err) {
        alert('Failed to load questions. Make sure you ran: npm run seed');
        navigate('/quiz/setup');
      }
    };
    load();
  }, []);

  // Timer
  useEffect(() => {
    if (!timerActive || timer <= 0) {
      if (timer <= 0 && timerActive && !result) {
        handleTimeout();
      }
      return;
    }
    const interval = setInterval(() => {
      setTimer(t => {
        if (t <= 6) play('tick');
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, timer, result]);

  const getTimerForQuestion = (q) => {
    if (!q) return 30;
    if (q.difficulty === 'hard') return 15;
    if (q.difficulty === 'medium') return 20;
    return 30;
  };

  const handleTimeout = () => {
    setTimerActive(false);
    setResult({ correct: false, correctAnswer: -1, explanation: 'Time is up!' });
    setStreak(0);
    play('wrong');
    setFlashClass('flash-red');
    setShaking(true);
    setJokeData(getLocalJoke());
    setTimeout(() => { setFlashClass(''); setShaking(false); }, 500);
  };

  const handleAnswer = async (index) => {
    if (selected !== null || result) return;
    setSelected(index);
    setTimerActive(false);

    try {
      const q = questions[current];
      const { data } = await submitAnswer({
        questionId: q._id,
        selectedAnswer: index,
        timeRemaining: timer,
        totalTime: getTimerForQuestion(q),
        currentStreak: streak
      });

      setResult(data);

      if (data.correct) {
        play('correct');
        setStreak(data.newStreak);
        setCorrectCount(c => c + 1);
        setTotalXP(x => x + data.xpEarned);
        setFlashClass('flash-green');

        // XP popup
        setXpPopup(`+${data.xpEarned} XP`);
        setTimeout(() => setXpPopup(null), 1500);

        // Confetti on streaks
        if (data.newStreak === 3 || data.newStreak === 5 || data.newStreak === 10 || data.isBossQuestion) {
          confetti({ particleCount: data.newStreak * 30, spread: 70, origin: { y: 0.6 } });
          if (data.isBossQuestion) play('boss');
        }

        // Badge notification
        if (data.newBadges?.length > 0) {
          play('levelup');
          setTimeout(() => confetti({ particleCount: 200, spread: 100 }), 500);
        }
      } else {
        play('wrong');
        setStreak(0);
        setFlashClass('flash-red');
        setShaking(true);
        setJokeData(data.joke || getLocalJoke());
      }

      setTimeout(() => { setFlashClass(''); setShaking(false); }, 500);
      updateUser({ xp: (user?.xp || 0) + (data.xpEarned || 0) });
    } catch (err) {
      console.error('Answer error:', err);
    }
  };

  const nextQuestion = () => {
    if (current >= questions.length - 1) {
      finishGame();
      return;
    }
    setCurrent(c => c + 1);
    setSelected(null);
    setResult(null);
    setJokeData(null);
    setEliminated([]);
    const nextQ = questions[current + 1];
    setTimer(getTimerForQuestion(nextQ));
    setTimerActive(true);
  };

  const finishGame = async () => {
    setGameOver(true);
    try {
      await completeGame({ totalCorrect: correctCount, totalAnswered: questions.length, xpEarned: totalXP, subject });
    } catch (e) {}
    confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
    play('levelup');
    navigate('/results', { state: { correctCount, total: questions.length, totalXP, streak, subject } });
  };

  // Lifeline: 50-50
  const useFiftyFifty = async () => {
    if (lifelines.fiftyFifty <= 0 || result) return;
    try {
      const q = questions[current];
      const { data } = await useLifeline({ type: 'fiftyFifty', questionId: q._id });
      setEliminated(data.eliminateOptions || []);
      setLifelines(l => ({ ...l, fiftyFifty: data.remaining }));
      play('click');
    } catch (e) { alert(e.response?.data?.message || 'Failed'); }
  };

  // Lifeline: Skip
  const useSkip = async () => {
    if (lifelines.skip <= 0 || result) return;
    try {
      await useLifeline({ type: 'skip' });
      setLifelines(l => ({ ...l, skip: l.skip - 1 }));
      play('click');
      nextQuestion();
    } catch (e) { alert(e.response?.data?.message || 'Failed'); }
  };

  // Lifeline: Extra Time
  const useExtraTime = async () => {
    if (lifelines.extraTime <= 0 || result) return;
    try {
      await useLifeline({ type: 'extraTime' });
      setTimer(t => t + 15);
      setLifelines(l => ({ ...l, extraTime: l.extraTime - 1 }));
      play('click');
    } catch (e) { alert(e.response?.data?.message || 'Failed'); }
  };

  const getLocalJoke = () => {
    const jokes = [
      { setup: "Why do programmers prefer dark mode?", punchline: "Because light attracts bugs! 🐛" },
      { joke: "There are only 10 types of people: those who understand binary and those who don't. 🤖" },
      { setup: "Why was the JS developer sad?", punchline: "Because he didn't Node how to Express himself! 😢" },
      { joke: "A SQL query walks into a bar, sees two tables and asks... 'Can I JOIN you?' 🍻" },
      { setup: "What's the object-oriented way to become wealthy?", punchline: "Inheritance! 💰" }
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  };

  if (loading) return <div className="page page-center"><div className="spinner"></div></div>;

  const q = questions[current];
  const isBoss = q?.isBossQuestion;
  const progress = ((current + 1) / questions.length) * 100;

  return (
    <div className={`page container ${flashClass} ${shaking ? 'screen-shake' : ''}`}>
      {/* XP Popup */}
      <AnimatePresence>
        {xpPopup && (
          <motion.div className="xp-popup" initial={{opacity:0,scale:0.5}} animate={{opacity:1,scale:1}} exit={{opacity:0,y:-50}} transition={{duration:0.5}}>
            {xpPopup}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{maxWidth:'800px',margin:'0 auto',padding:'20px 0'}}>
        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
          <div>
            <span style={{color:'var(--text-secondary)',fontSize:'0.9rem'}}>Question {current+1}/{questions.length}</span>
            {streak >= 3 && <span className="badge badge-earned" style={{marginLeft:'12px'}}>🔥 {streak} Streak!</span>}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
            <span style={{color:'var(--accent-gold)',fontWeight:800}}>⭐ {totalXP} XP</span>
            <div className={`timer-ring ${timer <= 5 ? 'danger' : timer <= 10 ? 'warning' : ''}`}>
              {timer}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar" style={{marginBottom:'20px'}}>
          <div className="progress-fill" style={{width:`${progress}%`}}></div>
        </div>

        {/* Boss Banner */}
        {isBoss && <div className="boss-banner">🐉 BOSS ROUND — 3x XP! 🐉</div>}

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{opacity:0,x:50}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-50}} transition={{duration:0.3}}
            className={`card ${isBoss ? 'streak-glow' : ''}`} style={{marginBottom:'20px',padding:'32px'}}>
            <div style={{display:'flex',gap:'8px',marginBottom:'16px',flexWrap:'wrap'}}>
              <span className="badge">{q.subject}</span>
              <span className="badge" style={{background: q.difficulty==='easy' ? 'rgba(34,197,94,0.2)' : q.difficulty==='medium' ? 'rgba(251,191,36,0.2)' : 'rgba(239,68,68,0.2)'}}>
                {q.difficulty === 'easy' ? '🟢' : q.difficulty === 'medium' ? '🟡' : '🔴'} {q.difficulty}
              </span>
            </div>
            <h2 style={{fontSize:'1.3rem',lineHeight:1.5,fontWeight:700}}>{q.question}</h2>
          </motion.div>
        </AnimatePresence>

        {/* Options */}
        <div style={{display:'flex',flexDirection:'column',gap:'12px',marginBottom:'20px'}}>
          {q.options.map((opt, i) => {
            let cls = 'option-btn';
            if (eliminated.includes(i)) cls += ' eliminated';
            if (result) {
              if (i === result.correctAnswer) cls += ' correct';
              else if (i === selected && !result.correct) cls += ' wrong';
            }
            return (
              <motion.button key={i} className={cls} onClick={() => handleAnswer(i)}
                disabled={!!result || eliminated.includes(i)}
                initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:i*0.08}}
                whileHover={!result ? {scale:1.01} : {}}>
                <span style={{fontWeight:800,marginRight:'12px',color:'var(--accent-cyan)'}}>{String.fromCharCode(65+i)}.</span>
                {opt}
              </motion.button>
            );
          })}
        </div>

        {/* Lifelines */}
        {!result && (
          <div style={{display:'flex',gap:'12px',marginBottom:'20px',flexWrap:'wrap'}}>
            <button className="btn btn-secondary" onClick={useFiftyFifty} disabled={lifelines.fiftyFifty<=0}>
              🎯 50-50 ({lifelines.fiftyFifty})
            </button>
            <button className="btn btn-secondary" onClick={useSkip} disabled={lifelines.skip<=0}>
              ⏭️ Skip ({lifelines.skip})
            </button>
            <button className="btn btn-secondary" onClick={useExtraTime} disabled={lifelines.extraTime<=0}>
              ⏰ +15s ({lifelines.extraTime})
            </button>
          </div>
        )}

        {/* Result + Explanation */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
              {/* Explanation */}
              {result.explanation && (
                <div className="card" style={{marginBottom:'16px',borderColor: result.correct ? 'var(--accent-green)' : 'var(--accent-red)'}}>
                  <p style={{fontWeight:700,marginBottom:'4px'}}>{result.correct ? '✅ Correct!' : '❌ Wrong!'}</p>
                  <p style={{color:'var(--text-secondary)',fontSize:'0.95rem'}}>{result.explanation}</p>
                </div>
              )}

              {/* Joke Card (on wrong answer) */}
              {!result.correct && jokeData && (
                <motion.div className="joke-card" initial={{scale:0.8}} animate={{scale:1}}>
                  <div className="joke-emoji">😂</div>
                  {jokeData.joke ? (
                    <p className="joke-punchline">{jokeData.joke}</p>
                  ) : (
                    <>
                      <p className="joke-setup">{jokeData.setup}</p>
                      <p className="joke-punchline">{jokeData.punchline}</p>
                    </>
                  )}
                </motion.div>
              )}

              {/* New Badges */}
              {result.newBadges?.length > 0 && (
                <motion.div className="card" initial={{scale:0.8}} animate={{scale:1}} style={{textAlign:'center',marginTop:'16px',borderColor:'var(--accent-gold)'}}>
                  <h3>🎖️ New Badge Unlocked!</h3>
                  {result.newBadges.map((b,i) => (
                    <div key={i} style={{fontSize:'1.2rem',marginTop:'8px'}}>{b.icon} {b.name}</div>
                  ))}
                </motion.div>
              )}

              {/* Next Button */}
              <motion.button className="btn btn-primary" onClick={nextQuestion} whileTap={{scale:0.95}}
                style={{width:'100%',marginTop:'20px',padding:'16px',fontSize:'1.1rem'}}>
                {current >= questions.length - 1 ? '🏁 See Results' : '➡️ Next Question'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
