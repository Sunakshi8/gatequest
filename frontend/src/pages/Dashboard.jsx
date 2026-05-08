import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile } from '../services/authService';
import { getUserRank } from '../services/quizService';
import { motion } from 'framer-motion';

const ALL_BADGES = [
  { name:'First Blood', icon:'🩸', description:'Complete first quiz' },
  { name:'Speed Demon', icon:'⚡', description:'Earn 500+ XP' },
  { name:'Perfectionist', icon:'💎', description:'90%+ accuracy (50+ answers)' },
  { name:'Streak Master', icon:'🔥', description:'5-correct streak' },
  { name:'Inferno', icon:'🌋', description:'10-correct streak' },
  { name:'Subject Master', icon:'🧠', description:'90%+ in any subject (20+ Qs)' },
  { name:'Boss Slayer', icon:'🐉', description:'5 boss questions correct' },
  { name:'Comeback King', icon:'👑', description:'Recover to 5-streak' },
  { name:'Quiz Addict', icon:'🎮', description:'Play 50 games' },
  { name:'XP Millionaire', icon:'💰', description:'Earn 10,000 XP' },
  { name:'Social Butterfly', icon:'🦋', description:'Win 10 multiplayer games' },
  { name:'Survivor', icon:'🏆', description:'Win a knockout tournament' },
  { name:'Chaos Champion', icon:'🌪️', description:'Win 5 chaos mode games' },
  { name:'Night Owl', icon:'🦉', description:'Play between 12-5 AM' },
  { name:'Marathon Runner', icon:'🏃', description:'Play 5 games in one session' }
];

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [rank, setRank] = useState(null);

  useEffect(() => {
    getProfile().then(r => setProfile(r.data)).catch(() => {});
    if (user?._id) getUserRank(user._id).then(r => setRank(r.data)).catch(() => {});
  }, []);

  const p = profile || user;
  const level = Math.floor((p?.xp || 0) / 100) + 1;
  const xpInLevel = (p?.xp || 0) % 100;
  const accuracy = p?.stats?.totalAnswered > 0 ? Math.round((p.stats.totalCorrect / p.stats.totalAnswered) * 100) : 0;
  const earnedNames = (p?.badges || []).map(b => b.name);

  // Subject stats
  const subjectEntries = [];
  if (p?.stats?.subjectStats) {
    const map = p.stats.subjectStats instanceof Map ? p.stats.subjectStats : new Map(Object.entries(p.stats.subjectStats || {}));
    for (const [name, data] of map) {
      const acc = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
      subjectEntries.push({ name, correct: data.correct, total: data.total, accuracy: acc });
    }
  }

  return (
    <div className="page container">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
        <h1 style={{textAlign:'center',margin:'40px 0 12px'}}>📊 Dashboard</h1>
        <p style={{textAlign:'center',color:'var(--text-secondary)',marginBottom:'40px'}}>Your GATE journey at a glance</p>

        {/* Profile Card */}
        <div className="card" style={{display:'flex',alignItems:'center',gap:'24px',marginBottom:'24px',flexWrap:'wrap'}}>
          <div style={{fontSize:'4rem'}}>{p?.avatar || '🎓'}</div>
          <div style={{flex:1}}>
            <h2>{p?.username}</h2>
            <p style={{color:'var(--text-secondary)'}}>Level {level} • {p?.rankTitle || 'Newbie'}</p>
            <div style={{marginTop:'8px'}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.85rem',marginBottom:'4px'}}>
                <span>Level {level}</span>
                <span>{xpInLevel}/100 XP</span>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{width:`${xpInLevel}%`}}></div></div>
            </div>
          </div>
          {rank && (
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:'2.5rem',fontWeight:900,color:'var(--accent-gold)'}}>#{rank.rank}</div>
              <div style={{color:'var(--text-secondary)',fontSize:'0.85rem'}}>Top {100-rank.percentile}%</div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid-4" style={{marginBottom:'24px'}}>
          {[
            { icon:'⭐', value: p?.xp || 0, label:'Total XP' },
            { icon:'🎯', value: `${accuracy}%`, label:'Accuracy' },
            { icon:'🎮', value: p?.stats?.totalGames || 0, label:'Games' },
            { icon:'🔥', value: p?.stats?.bestStreak || 0, label:'Best Streak' }
          ].map((s,i) => (
            <motion.div key={i} className="card stat-card" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.1}}>
              <div style={{fontSize:'1.5rem'}}>{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Subject Performance */}
        {subjectEntries.length > 0 && (
          <div className="card" style={{marginBottom:'24px'}}>
            <h3 style={{marginBottom:'16px'}}>📖 Subject Performance</h3>
            {subjectEntries.map((s,i) => (
              <div key={i} className="chart-bar-container">
                <div className="chart-bar-label">
                  <span>{s.name}</span>
                  <span>{s.accuracy}% ({s.correct}/{s.total})</span>
                </div>
                <div className="chart-bar"><div className="chart-bar-fill" style={{width:`${s.accuracy}%`}}></div></div>
              </div>
            ))}
          </div>
        )}

        {/* Badges */}
        <div className="card" style={{marginBottom:'40px'}}>
          <h3 style={{marginBottom:'16px'}}>🎖️ Badges ({earnedNames.length}/{ALL_BADGES.length})</h3>
          <div className="grid-3">
            {ALL_BADGES.map((b,i) => {
              const earned = earnedNames.includes(b.name);
              return (
                <motion.div key={i} className={`badge-card card ${earned ? '' : ''}`}
                  style={{textAlign:'center',padding:'16px',opacity:earned?1:0.4,filter:earned?'none':'grayscale(1)'}}
                  whileHover={{scale:earned?1.05:1}}>
                  <div style={{fontSize:'2rem',marginBottom:'4px'}}>{b.icon}</div>
                  <div style={{fontWeight:700,fontSize:'0.85rem'}}>{b.name}</div>
                  <div style={{color:'var(--text-muted)',fontSize:'0.75rem',marginTop:'4px'}}>{b.description}</div>
                  {earned && <div style={{color:'var(--accent-green)',fontSize:'0.75rem',marginTop:'4px'}}>✅ Earned!</div>}
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
