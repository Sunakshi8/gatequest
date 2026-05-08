import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { getSocket } from '../services/socketService';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function MultiplayerGame() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { play } = useSound();
  const { roomCode, isHost } = location.state || {};

  const [status, setStatus] = useState('waiting'); // waiting, playing, finished
  const [players, setPlayers] = useState([]);
  const [question, setQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [timer, setTimer] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [chaosEvent, setChaosEvent] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const [flashClass, setFlashClass] = useState('');

  const socket = getSocket();

  useEffect(() => {
    if (!socket || !roomCode) { navigate('/multiplayer'); return; }

    socket.on('player-joined', (data) => {
      setPlayers(data.players);
    });

    socket.on('player-left', (data) => {
      setPlayers(data.players);
    });

    socket.on('new-question', (data) => {
      setStatus('playing');
      setQuestion({ question: data.question, options: data.options, subject: data.subject, difficulty: data.difficulty, isBossQuestion: data.isBossQuestion });
      setQuestionIndex(data.questionIndex);
      setTotalQuestions(data.totalQuestions);
      setTimer(data.timer);
      setTimerActive(true);
      setSelected(null);
      setResult(null);
      setPlayers(data.players);
      setChaosEvent(data.chaosEvent);
      if (data.chaosEvent) play('boss');
      if (data.isBossQuestion) play('boss');
    });

    socket.on('answer-result', (data) => {
      setResult(data);
      setTimerActive(false);
      if (data.correct) {
        play('correct');
        setFlashClass('flash-green');
        if (data.newStreak >= 3) confetti({ particleCount: 50, spread: 60 });
      } else {
        play('wrong');
        setFlashClass('flash-red');
      }
      setTimeout(() => setFlashClass(''), 500);
    });

    socket.on('score-update', (data) => {
      setPlayers(data.players);
    });

    socket.on('time-up', (data) => {
      setTimerActive(false);
      if (!result) setResult({ correct: false, correctAnswer: data.correctAnswer, explanation: data.explanation });
    });

    socket.on('player-eliminated', (data) => {
      play('wrong');
    });

    socket.on('game-over', (data) => {
      setStatus('finished');
      setGameResult(data);
      if (data.winner.username === user.username) {
        confetti({ particleCount: 300, spread: 120, origin: { y: 0.4 } });
        play('levelup');
      }
    });

    socket.on('error', (err) => alert(err.message));

    return () => {
      socket.off('player-joined');
      socket.off('player-left');
      socket.off('new-question');
      socket.off('answer-result');
      socket.off('score-update');
      socket.off('time-up');
      socket.off('player-eliminated');
      socket.off('game-over');
      socket.off('error');
    };
  }, [socket, roomCode]);

  // Timer countdown
  useEffect(() => {
    if (!timerActive || timer <= 0) return;
    const interval = setInterval(() => {
      setTimer(t => {
        if (t <= 6) play('tick');
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  const handleAnswer = (index) => {
    if (selected !== null || result) return;
    setSelected(index);
    socket.emit('submit-answer', { roomCode, selectedAnswer: index, timeRemaining: timer, totalTime: 30 });
  };

  const startGame = () => {
    socket.emit('start-game', { roomCode });
  };

  // WAITING LOBBY
  if (status === 'waiting') {
    return (
      <div className="page container page-center">
        <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} style={{maxWidth:'500px',width:'100%'}}>
          <div className="card" style={{textAlign:'center',padding:'40px'}}>
            <h2 style={{marginBottom:'8px'}}>⚔️ Battle Lobby</h2>
            <p style={{color:'var(--text-secondary)',marginBottom:'24px'}}>Share this code with friends:</p>
            <div className="room-code" style={{marginBottom:'24px'}}>{roomCode}</div>
            
            <h4 style={{marginBottom:'12px'}}>Players ({players.length})</h4>
            {players.map((p,i) => (
              <div key={i} className="player-card" style={{marginBottom:'8px'}}>
                <span className="player-avatar">{p.avatar}</span>
                <span className="player-name">{p.username}</span>
                {i === 0 && <span className="badge" style={{marginLeft:'auto'}}>👑 Host</span>}
              </div>
            ))}

            {isHost && (
              <button className="btn btn-primary" onClick={startGame} disabled={players.length < 2}
                style={{width:'100%',marginTop:'20px',padding:'16px',fontSize:'1.1rem'}}>
                {players.length < 2 ? 'Waiting for players...' : '🚀 START BATTLE!'}
              </button>
            )}
            {!isHost && <p style={{marginTop:'20px',color:'var(--text-muted)'}}>Waiting for host to start...</p>}
          </div>
        </motion.div>
      </div>
    );
  }

  // GAME OVER
  if (status === 'finished' && gameResult) {
    return (
      <div className="page container page-center">
        <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} style={{maxWidth:'600px',width:'100%'}}>
          <div className="card" style={{textAlign:'center',padding:'40px'}}>
            <motion.div style={{fontSize:'4rem',marginBottom:'12px'}} animate={{y:[0,-10,0]}} transition={{duration:1.5,repeat:Infinity}}>🏆</motion.div>
            <h1 style={{fontFamily:'Orbitron',marginBottom:'4px'}}>
              {gameResult.winner.username === user.username ? '🎉 YOU WIN!' : `${gameResult.winner.username} Wins!`}
            </h1>
            <p style={{color:'var(--text-secondary)',marginBottom:'24px'}}>{gameResult.winner.avatar} {gameResult.winner.username} — {gameResult.winner.score} XP</p>

            {gameResult.rankings.map((p,i) => (
              <div key={i} className="player-card" style={{marginBottom:'8px',opacity:p.eliminated?0.5:1}}>
                <span style={{fontWeight:900,fontSize:'1.2rem',width:'32px'}}>
                  {i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}
                </span>
                <span className="player-avatar">{p.avatar}</span>
                <span className="player-name">{p.username} {p.eliminated?'(eliminated)':''}</span>
                <span className="player-score">⭐ {p.score}</span>
              </div>
            ))}

            <div style={{display:'flex',gap:'12px',marginTop:'24px'}}>
              <button className="btn btn-primary" onClick={()=>navigate('/multiplayer')} style={{flex:1}}>🔄 Play Again</button>
              <button className="btn btn-secondary" onClick={()=>navigate('/')} style={{flex:1}}>🏠 Home</button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // PLAYING
  const progress = ((questionIndex + 1) / totalQuestions) * 100;

  return (
    <div className={`page container ${flashClass}`}>
      <div style={{maxWidth:'900px',margin:'0 auto'}}>
        {/* Chaos Event Banner */}
        {chaosEvent && <div className="chaos-banner">{chaosEvent.name}</div>}
        
        {/* Boss Banner */}
        {question?.isBossQuestion && <div className="boss-banner">🐉 BOSS ROUND — 3x XP! 🐉</div>}

        <div style={{display:'flex',gap:'24px',flexWrap:'wrap'}}>
          {/* Main Quiz Area */}
          <div style={{flex:2,minWidth:'400px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
              <span style={{color:'var(--text-secondary)'}}>Q {questionIndex+1}/{totalQuestions}</span>
              <div className={`timer-ring ${timer<=5?'danger':timer<=10?'warning':''}`}>{timer}</div>
            </div>

            <div className="progress-bar" style={{marginBottom:'16px'}}><div className="progress-fill" style={{width:`${progress}%`}}></div></div>

            {question && (
              <AnimatePresence mode="wait">
                <motion.div key={questionIndex} initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}}>
                  <div className="card" style={{marginBottom:'16px',padding:'24px'}}>
                    <div style={{display:'flex',gap:'8px',marginBottom:'12px'}}>
                      <span className="badge">{question.subject}</span>
                      <span className="badge">{question.difficulty}</span>
                    </div>
                    <h2 style={{fontSize:'1.2rem',lineHeight:1.5}}>{question.question}</h2>
                  </div>

                  <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                    {question.options.map((opt,i) => {
                      let cls = 'option-btn';
                      if (result) {
                        if (i === result.correctAnswer) cls += ' correct';
                        else if (i === selected && !result.correct) cls += ' wrong';
                      }
                      return (
                        <button key={i} className={cls} onClick={()=>handleAnswer(i)} disabled={!!result}>
                          <span style={{fontWeight:800,marginRight:'10px',color:'var(--accent-cyan)'}}>{String.fromCharCode(65+i)}.</span>{opt}
                        </button>
                      );
                    })}
                  </div>

                  {result && result.explanation && (
                    <div className="card" style={{marginTop:'12px',borderColor:result.correct?'var(--accent-green)':'var(--accent-red)'}}>
                      <p style={{fontWeight:700}}>{result.correct?'✅ Correct!':'❌ Wrong!'}</p>
                      <p style={{color:'var(--text-secondary)',fontSize:'0.9rem'}}>{result.explanation}</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Scoreboard Sidebar */}
          <div style={{flex:1,minWidth:'200px'}}>
            <div className="card">
              <h4 style={{marginBottom:'12px'}}>📊 Scoreboard</h4>
              {[...players].sort((a,b)=>b.score-a.score).map((p,i) => (
                <div key={i} className="player-card" style={{marginBottom:'8px',opacity:p.eliminated?0.4:1}}>
                  <span style={{fontSize:'1.3rem'}}>{p.avatar}</span>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:'0.9rem'}}>{p.username}</div>
                    <div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>
                      {p.streak>=3?`🔥${p.streak}`:''} {p.answered?'✓':'⏳'} {p.eliminated?'💀':''}
                    </div>
                  </div>
                  <span style={{fontWeight:800,color:'var(--accent-gold)',fontSize:'0.9rem'}}>{p.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
