import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const SUBJECTS = [
  { name: 'all', icon: '📚', label: 'All Subjects' },
  { name: 'Operating Systems', icon: '🖥️', label: 'OS' },
  { name: 'DBMS', icon: '🗄️', label: 'DBMS' },
  { name: 'Computer Networks', icon: '🌐', label: 'Networks' },
  { name: 'Algorithms', icon: '⚙️', label: 'Algorithms' },
  { name: 'Data Structures', icon: '🌲', label: 'DS' },
  { name: 'Theory of Computation', icon: '🤖', label: 'TOC' },
  { name: 'Compiler Design', icon: '🔧', label: 'Compilers' },
  { name: 'Computer Organization', icon: '💻', label: 'COA' },
  { name: 'Digital Logic', icon: '🔌', label: 'Digital Logic' },
  { name: 'Engineering Mathematics', icon: '📐', label: 'Maths' },
  { name: 'General Aptitude', icon: '🧠', label: 'Aptitude' }
];

export default function QuizSetup() {
  const [subject, setSubject] = useState('all');
  const [difficulty, setDifficulty] = useState('mixed');
  const [questionCount, setQuestionCount] = useState(10);
  const navigate = useNavigate();

  const startQuiz = () => {
    navigate('/quiz/play', { state: { subject, difficulty, questionCount } });
  };

  return (
    <div className="page container">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
        <h1 style={{textAlign:'center',margin:'40px 0 12px'}}>🎮 Quiz Setup</h1>
        <p style={{textAlign:'center',color:'var(--text-secondary)',marginBottom:'40px'}}>Choose your battlefield</p>

        {/* Subject Selection */}
        <h3 style={{marginBottom:'16px'}}>📖 Select Subject</h3>
        <div className="grid-4" style={{marginBottom:'32px'}}>
          {SUBJECTS.map(s => (
            <div key={s.name} className={`subject-card ${subject === s.name ? 'selected' : ''}`} onClick={() => setSubject(s.name)}>
              <div className="subject-icon">{s.icon}</div>
              <div className="subject-name">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Difficulty */}
        <h3 style={{marginBottom:'16px'}}>⚡ Difficulty</h3>
        <div style={{display:'flex',gap:'12px',marginBottom:'32px',flexWrap:'wrap'}}>
          {[{v:'mixed',l:'🎲 Mixed'},{v:'easy',l:'🟢 Easy'},{v:'medium',l:'🟡 Medium'},{v:'hard',l:'🔴 Hard'}].map(d => (
            <button key={d.v} className={`btn ${difficulty===d.v ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setDifficulty(d.v)} style={{flex:1,minWidth:'120px'}}>
              {d.l}
            </button>
          ))}
        </div>

        {/* Question Count */}
        <h3 style={{marginBottom:'16px'}}>📝 Questions: {questionCount}</h3>
        <div style={{display:'flex',gap:'12px',marginBottom:'40px'}}>
          {[5,10,15,20].map(n => (
            <button key={n} className={`btn ${questionCount===n ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setQuestionCount(n)} style={{flex:1}}>
              {n}
            </button>
          ))}
        </div>

        {/* Start Button */}
        <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} className="btn btn-primary" onClick={startQuiz}
          style={{width:'100%',padding:'18px',fontSize:'1.2rem',fontFamily:'Orbitron'}}>
          🚀 START QUEST
        </motion.button>
      </motion.div>
    </div>
  );
}
