import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getActiveRooms } from '../services/quizService';
import { connectSocket } from '../services/socketService';
import { motion } from 'framer-motion';

export default function MultiplayerLobby() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState('1v1');
  const [subject, setSubject] = useState('all');
  const [chaosMode, setChaosMode] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    getActiveRooms().then(r => setRooms(r.data)).catch(() => {});
    const interval = setInterval(() => {
      getActiveRooms().then(r => setRooms(r.data)).catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const createRoom = () => {
    setCreating(true);
    const socket = connectSocket();
    socket.emit('create-room', {
      userId: user._id, username: user.username, avatar: user.avatar,
      mode, subject, difficulty: 'mixed', chaosMode, questionCount: 10
    });
    socket.on('room-created', (data) => {
      navigate('/multiplayer/game', { state: { roomCode: data.roomCode, isHost: true, ...data } });
    });
    socket.on('error', (err) => { alert(err.message); setCreating(false); });
  };

  const joinRoom = (code) => {
    const socket = connectSocket();
    socket.emit('join-room', { roomCode: code || joinCode, userId: user._id, username: user.username, avatar: user.avatar });
    socket.on('player-joined', (data) => {
      navigate('/multiplayer/game', { state: { roomCode: code || joinCode, isHost: false } });
    });
    socket.on('error', (err) => alert(err.message));
  };

  return (
    <div className="page container">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
        <h1 style={{textAlign:'center',margin:'40px 0 12px'}}>👥 Multiplayer Arena</h1>
        <p style={{textAlign:'center',color:'var(--text-secondary)',marginBottom:'40px'}}>Battle other GATE warriors in real-time!</p>

        <div className="grid-2" style={{marginBottom:'32px'}}>
          {/* Create Room */}
          <div className="card" style={{padding:'32px'}}>
            <h3 style={{marginBottom:'20px'}}>🏠 Create Room</h3>
            
            <label style={{display:'block',marginBottom:'6px',fontWeight:600,fontSize:'0.9rem',color:'var(--text-secondary)'}}>Mode</label>
            <div style={{display:'flex',gap:'8px',marginBottom:'16px'}}>
              {[{v:'1v1',l:'⚔️ 1v1'},{v:'4player',l:'👥 4P Battle'},{v:'knockout',l:'🏆 Knockout'}].map(m => (
                <button key={m.v} className={`btn ${mode===m.v?'btn-primary':'btn-secondary'}`} onClick={()=>setMode(m.v)} style={{flex:1,fontSize:'0.85rem',padding:'10px 8px'}}>{m.l}</button>
              ))}
            </div>

            <label style={{display:'block',marginBottom:'6px',fontWeight:600,fontSize:'0.9rem',color:'var(--text-secondary)'}}>Subject</label>
            <select className="input" value={subject} onChange={e=>setSubject(e.target.value)} style={{marginBottom:'16px'}}>
              <option value="all">All Subjects</option>
              <option value="Operating Systems">OS</option>
              <option value="DBMS">DBMS</option>
              <option value="Computer Networks">Networks</option>
              <option value="Algorithms">Algorithms</option>
              <option value="Data Structures">Data Structures</option>
            </select>

            <label style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'20px',cursor:'pointer'}}>
              <input type="checkbox" checked={chaosMode} onChange={e=>setChaosMode(e.target.checked)} style={{width:'18px',height:'18px'}} />
              <span style={{fontWeight:600}}>🌪️ Chaos Mode</span>
              <span style={{color:'var(--text-muted)',fontSize:'0.8rem'}}>(random events!)</span>
            </label>

            <button className="btn btn-primary" onClick={createRoom} disabled={creating} style={{width:'100%'}}>
              {creating ? 'Creating...' : '🚀 Create Room'}
            </button>
          </div>

          {/* Join Room */}
          <div className="card" style={{padding:'32px'}}>
            <h3 style={{marginBottom:'20px'}}>🔗 Join Room</h3>
            <input className="input" placeholder="Enter Room Code (e.g. ABC123)" value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} style={{marginBottom:'16px',fontFamily:'Orbitron',textAlign:'center',fontSize:'1.2rem',letterSpacing:'0.1em'}} maxLength={6} />
            <button className="btn btn-primary" onClick={()=>joinRoom()} disabled={joinCode.length<4} style={{width:'100%'}}>🎮 Join Room</button>

            {/* Active Rooms */}
            <h4 style={{marginTop:'28px',marginBottom:'12px',color:'var(--text-secondary)'}}>🔥 Active Rooms</h4>
            {rooms.length === 0 ? (
              <p style={{color:'var(--text-muted)',fontSize:'0.9rem'}}>No rooms available. Create one!</p>
            ) : rooms.map((r,i) => (
              <div key={i} className="player-card" style={{marginBottom:'8px',cursor:'pointer'}} onClick={()=>joinRoom(r.roomCode)}>
                <div>
                  <div style={{fontWeight:700}}>{r.roomCode}</div>
                  <div style={{fontSize:'0.8rem',color:'var(--text-secondary)'}}>{r.mode} • {r.subject} {r.chaosMode?'🌪️':''}</div>
                </div>
                <div style={{marginLeft:'auto',fontSize:'0.9rem'}}>{r.playerCount}/{r.maxPlayers} 👤</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
