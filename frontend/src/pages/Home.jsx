import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function Home() {
  const { user } = useAuth();
  const level = Math.floor((user?.xp || 0) / 100) + 1;

  return (
    <div className="page container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Hero */}
        <div style={{ textAlign: "center", padding: "60px 0 40px" }}>
          <motion.div
            style={{ fontSize: "4rem", marginBottom: "16px" }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎮
          </motion.div>
          <h1
            style={{
              fontSize: "3rem",
              fontFamily: "Orbitron",
              marginBottom: "12px",
            }}
          >
            <span
              style={{
                background: "var(--gradient-main)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Welcome, {user?.username}!
            </span>
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "1.2rem",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Level {level} • {user?.rankTitle || "Newbie"} • {user?.xp || 0} XP
          </p>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "1rem",
              maxWidth: "600px",
              margin: "8px auto 0",
              fontStyle: "italic",
            }}
          >
            Where Brain.exe Goes to Crash 😂
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid-4" style={{ marginBottom: "40px" }}>
          {[
            {
              icon: "🎯",
              value: user?.stats?.totalGames || 0,
              label: "Games Played",
            },
            { icon: "✅", value: `${user?.accuracy || 0}%`, label: "Accuracy" },
            {
              icon: "🔥",
              value: user?.stats?.bestStreak || 0,
              label: "Best Streak",
            },
            { icon: "🏅", value: user?.badges?.length || 0, label: "Badges" },
          ].map((s, i) => (
            <motion.div
              key={i}
              className="card stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "8px" }}>
                {s.icon}
              </div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Game Modes */}
        <h2 style={{ marginBottom: "24px", textAlign: "center" }}>
          🕹️ Choose Your Battle
        </h2>
        <div className="grid-3" style={{ marginBottom: "40px" }}>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link to="/quiz/setup" style={{ textDecoration: "none" }}>
              <div
                className="card"
                style={{
                  textAlign: "center",
                  padding: "40px 24px",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🎯</div>
                <h3 style={{ marginBottom: "8px" }}>Single Player</h3>
                <p
                  style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}
                >
                  Practice GATE topics at your own pace with XP, streaks &
                  badges
                </p>
                <div className="btn btn-primary" style={{ marginTop: "16px" }}>
                  Play Solo →
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link to="/multiplayer" style={{ textDecoration: "none" }}>
              <div
                className="card"
                style={{
                  textAlign: "center",
                  padding: "40px 24px",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "12px" }}>⚔️</div>
                <h3 style={{ marginBottom: "8px" }}>Multiplayer</h3>
                <p
                  style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}
                >
                  1v1 Duel, 4-Player Battle, or Knockout Tournament!
                </p>
                <div
                  className="btn btn-primary"
                  style={{
                    marginTop: "16px",
                    background: "var(--gradient-fire)",
                  }}
                >
                  Battle Now →
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link to="/dashboard" style={{ textDecoration: "none" }}>
              <div
                className="card"
                style={{
                  textAlign: "center",
                  padding: "40px 24px",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "12px" }}>📊</div>
                <h3 style={{ marginBottom: "8px" }}>Dashboard</h3>
                <p
                  style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}
                >
                  View your stats, badges, subject-wise performance & rank
                </p>
                <div
                  className="btn btn-secondary"
                  style={{ marginTop: "16px" }}
                >
                  View Stats →
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Lifelines Status */}
        <div className="card" style={{ marginBottom: "40px" }}>
          <h3 style={{ marginBottom: "16px" }}>❤️ Your Lifelines</h3>
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            <div className="badge badge-earned">
              🎯 50-50: {user?.lifelines?.fiftyFifty ?? 3} left
            </div>
            <div className="badge badge-earned">
              ⏭️ Skip: {user?.lifelines?.skip ?? 2} left
            </div>
            <div className="badge badge-earned">
              ⏰ Extra Time: {user?.lifelines?.extraTime ?? 2} left
            </div>
          </div>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.8rem",
              marginTop: "8px",
            }}
          >
            Lifelines refresh every 24 hours
          </p>
        </div>
      </motion.div>
    </div>
  );
}
