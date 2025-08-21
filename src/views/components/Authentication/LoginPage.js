// src/pages/auth/LoginPage.jsx
import React, { useEffect, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../../../App.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginRequest } from "../../../lib/actions/LoginActions";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPwd, setShowPwd]   = useState(false);

  // 🔹 Lis l'état global
  const { loading, error, isAuth } = useSelector((s) => s.login);

  useEffect(() => {
    const saved = localStorage.getItem("remember_email");
    if (saved) setEmail(saved);
  }, []);

  // 🔹 Si déjà loggé, redirige
  useEffect(() => {
    if (isAuth) navigate("/", { replace: true });
  }, [isAuth, navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(loginRequest({ email, password, remember, navigate }));
  };

  return (
    <div className="auth-page auth-page--photo">
      <div className="auth-card" role="dialog" aria-labelledby="login-title">
        <h1 id="login-title" className="auth-title">Connexion</h1>

        <form onSubmit={handleLogin} className="auth-form">
          <label className="auth-field">
            <span>Email</span>
            <input
              className="auth-input"
              type="email"
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </label>

          <label className="auth-field">
            <span>Mot de passe</span>
            <div className="auth-pass-wrap">
              <input
                className="auth-input"
                type={showPwd ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-pass"
                onClick={() => setShowPwd((s) => !s)}
                aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                <i className={`bi ${showPwd ? "bi-eye-slash" : "bi-eye"}`} />
              </button>
            </div>
          </label>

          <div className="auth-actions">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Se souvenir de moi</span>
            </label>
            <a className="auth-link" href="/forgot">Mot de passe oublié&nbsp;?</a>
          </div>

          {/* 🔹 Affiche l'erreur Redux */}
          {error && <div className="auth-error" role="alert">{error}</div>}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="btn-spinner" aria-hidden="true" /> : "Se connecter"}
          </button>
        </form>

        <div className="auth-bottom">
          Pas de compte ? <a className="auth-link" href="/register">Créer un compte</a>
        </div>
      </div>
    </div>
  );
}
