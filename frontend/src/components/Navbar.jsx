import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSound } from "../context/SoundContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { soundEnabled, toggle } = useSound();
  const location = useLocation();

  const isActive = (path) => (location.pathname === path ? "active" : "");

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        ⚡ QUIZARENA
      </Link>
      <div className="navbar-links">
        <Link to="/" className={isActive("/")}>
          🏠 Home
        </Link>
        <Link to="/quiz/setup" className={isActive("/quiz/setup")}>
          🎮 Play
        </Link>
        <Link to="/multiplayer" className={isActive("/multiplayer")}>
          👥 Multiplayer
        </Link>
        <Link to="/dashboard" className={isActive("/dashboard")}>
          📊 Dashboard
        </Link>
        <Link to="/leaderboard" className={isActive("/leaderboard")}>
          🏆 Leaderboard
        </Link>
      </div>
      <div className="navbar-user">
        <button
          onClick={toggle}
          className="btn btn-secondary"
          style={{ padding: "6px 12px", fontSize: "0.85rem" }}
        >
          {soundEnabled ? "🔊" : "🔇"}
        </button>
        <span className="navbar-xp">⭐ {user?.xp || 0} XP</span>
        <span className="navbar-avatar">{user?.avatar || "🎓"}</span>
        <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>
          {user?.username}
        </span>
        <button
          onClick={logout}
          className="btn btn-secondary"
          style={{ padding: "6px 14px", fontSize: "0.85rem" }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
