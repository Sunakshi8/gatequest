import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { correctCount = 0, total = 0, totalXP = 0, streak = 0, subject = 'all' } = location.state || {};
  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  useEffect(() => {
    if (accuracy >= 70) {
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
    }
  }, []);

  const grade = accuracy >= 90 ? { emoji: '🏆', text: 'LEGENDARY!', color: '#fbbf24' }
    : accuracy >= 70 ? { emoji: '🌟', text: 'EXCELLENT!', color: '#22c55e' }
    : accuracy >= 50 ? { emoji: '👍', text: 'GOOD JOB!', color: '#3b82f6' }
    : { emoji: '💪', text: 'KEEP TRYING!', color: '#f97316' };

  return (
    <div className="page container page-center">
      <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} transition={{duration:0.5}} style={{maxWidth:'600px',width:'100%'}}>
        <div className="card" style={{textAlign:'center',padding:'48px 32px'}}>
          <motion.div style={{fontSize:'5rem',marginBottom:'16px'}} animate={{y:[0,-15,0]}} transition={{duration:1.5,repeat:Infinity}}>
            {grade.emoji}
          </motion.div>
          <h1 style={{color:grade.color,fontFamily:'Orbitron',marginBottom:'8px'}}>{grade.text}</h1>
          <p style={{color:'var(--text-secondary)',marginBottom:'32px'}}>Quest Complete!</p>

          <div className="grid-2" style={{marginBottom:'32px'}}>
            <div className="stat-card card">
              <div className="stat-value">{correctCount}/{total}</div>
              <div className="stat-label">Correct Answers</div>
            </div>
            <div className="stat-card card">
              <div className="stat-value">{accuracy}%</div>
              <div className="stat-label">Accuracy</div>
            </div>
            <div className="stat-card card">
              <div className="stat-value" style={{color:'var(--accent-gold)'}}>+{totalXP}</div>
              <div className="stat-label">XP Earned</div>
            </div>
            <div className="stat-card card">
              <div className="stat-value" style={{color:'var(--accent-orange)'}}>🔥 {streak}</div>
              <div className="stat-label">Best Streak</div>
            </div>
          </div>

          <div style={{display:'flex',gap:'12px',flexDirection:'column'}}>
            <Link to="/quiz/setup"><button className="btn btn-primary" style={{width:'100%'}}>🔄 Play Again</button></Link>
            <Link to="/dashboard"><button className="btn btn-secondary" style={{width:'100%'}}>📊 View Dashboard</button></Link>
            <Link to="/"><button className="btn btn-secondary" style={{width:'100%'}}>🏠 Home</button></Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
