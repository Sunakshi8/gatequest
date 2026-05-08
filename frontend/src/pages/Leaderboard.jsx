import { useState, useEffect } from 'react';
import { getLeaderboard } from '../services/quizService';
import { motion } from 'framer-motion';

export default function Leaderboard() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard({ limit: 50 }).then(r => { setPlayers(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const medals = ['🥇','🥈','🥉'];

  return (
    <div className="page container">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
        <h1 style={{textAlign:'center',margin:'40px 0 12px'}}>🏆 Leaderboard</h1>
        <p style={{textAlign:'center',color:'var(--text-secondary)',marginBottom:'40px'}}>Top GATE Warriors</p>

        {loading ? <div className="page-center"><div className="spinner"></div></div> : (
          <div className="card" style={{overflowX:'auto'}}>
            <table className="leaderboard-table">
              <thead>
                <tr><th>Rank</th><th>Player</th><th>XP</th><th>Level</th><th>Accuracy</th><th>Streak</th><th>Badges</th></tr>
              </thead>
              <tbody>
                {players.map((p, i) => (
                  <motion.tr key={p._id} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}}>
                    <td style={{fontWeight:900,fontSize:'1.2rem'}}>{medals[i] || `#${p.rank}`}</td>
                    <td><span style={{marginRight:'8px',fontSize:'1.3rem'}}>{p.avatar}</span><strong>{p.username}</strong></td>
                    <td style={{color:'var(--accent-gold)',fontWeight:800}}>⭐ {p.xp}</td>
                    <td>Lv.{p.level}</td>
                    <td>{p.accuracy}%</td>
                    <td>🔥 {p.bestStreak}</td>
                    <td>🎖️ {p.badgeCount}</td>
                  </motion.tr>
                ))}
                {players.length === 0 && <tr><td colSpan="7" style={{textAlign:'center',padding:'40px',color:'var(--text-muted)'}}>No players yet. Be the first! 🚀</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
