import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/authService";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await loginUser({ email, password });
      login(data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div className="page page-center" style={{ minHeight: "100vh" }}>
      <motion.div
        className="auth-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="card" style={{ padding: "40px" }}>
          <h1
            style={{
              textAlign: "center",
              marginBottom: "8px",
              fontFamily: "Orbitron",
            }}
          >
            <span
              style={{
                background: "var(--gradient-main)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              ⚡ QUIZARENA
            </span>
          </h1>
          <p
            style={{
              textAlign: "center",
              color: "var(--text-secondary)",
              marginBottom: "32px",
            }}
          >
            Login to start your quiz journey!
          </p>

          {error && (
            <div
              style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid var(--accent-red)",
                padding: "12px",
                borderRadius: "var(--radius)",
                marginBottom: "16px",
                color: "var(--accent-red)",
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  color: "var(--text-secondary)",
                }}
              >
                Email
              </label>
              <input
                className="input"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  color: "var(--text-secondary)",
                }}
              >
                Password
              </label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
              style={{ width: "100%", padding: "14px", fontSize: "1rem" }}
            >
              {loading ? "Logging in..." : "🚀 Login"}
            </button>
          </form>
          <p
            style={{
              textAlign: "center",
              marginTop: "20px",
              color: "var(--text-secondary)",
            }}
          >
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
