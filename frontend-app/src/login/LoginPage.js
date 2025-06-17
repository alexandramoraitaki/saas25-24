import React, { useState } from "react";
import axios from "axios";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("http://localhost:8080/users/login", { email, password });
      localStorage.setItem("email", res.data.email);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("full_name", res.data.full_name);

      if (res.data.role === "teacher") {
        navigate("/teacher");
      } else {
        navigate("/student");
      }
    } catch {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <img
          src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2601.png"
          alt="cloud"
          className="logo"
        />
        <h1 className="title">clearSKY</h1>
        <p className="subtitle">Cloud Grade Management Platform</p>

        <form onSubmit={handleLogin} className="form">
          <div className="form-group">
            <label htmlFor="email" className="label">E-mail</label>
            <div className="input-wrapper">
              <Mail className="icon" size={22} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="label">Password</label>
            <div className="input-wrapper">
              <Lock className="icon" size={22} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
                className="input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="btn-submit">Sign In</button>
        </form>

        <p className="footer-text">
          Don't have an account?{" "}
          <a href="/register" className="register-link">Register</a>
        </p>
      </div>
    </div>
  );
} 