// src/pages/auth/LoginPage.jsx
import React, { useEffect, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../../../App.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginRequest } from "../../../lib/actions/AccountActions";

const FORGOT_URL = "https://localhost:7183/api/auth/forgot-password"; // <-- adapte l'URL si besoin

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPwd, setShowPwd]   = useState(false);

  // --- Forgot modal state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotDone, setForgotDone] = useState(false);

  // Redux
  const { loading, error, isAuth } = useSelector((s) => s.account);

  useEffect(() => {
    const saved = localStorage.getItem("remember_email");
    if (saved) setEmail(saved);
  }, []);

  useEffect(() => {
    if (isAuth) navigate("/", { replace: true });
  }, [isAuth, navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(loginRequest({ email, password, remember, navigate }));
  };

  // ---------- Forgot password ----------
  const openForgot = (e) => {
    e?.preventDefault?.();
    setForgotError("");
    setForgotDone(false);
    setForgotEmail(email || "");
    setForgotOpen(true);
  };
  const closeForgot = () => {
    setForgotOpen(false);
    setForgotLoading(false);
    setForgotError("");
    setForgotDone(false);
  };

  const sendForgot = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotDone(false);

    const isMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail);
    if (!isMail) {
      setForgotError("Veuillez saisir une adresse email valide.");
      return;
    }

    setForgotLoading(true);
    try {
      // Appel API simple – adapte l’URL et le payload selon ton backend
      const res = await fetch(FORGOT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      // On ne révèle pas si l'email existe : message générique
      if (!res.ok) {
        // on garde un message neutre
      }
      setForgotDone(true);
    } catch {
      // message neutre aussi en cas d’erreur réseau
      setForgotDone(true);
    } finally {
      setForgotLoading(false);
    }
  };

  // Fermer la modale sur ESC
  useEffect(() => {
    if (!forgotOpen) return;
    const onKey = (e) => e.key === "Escape" && closeForgot();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [forgotOpen]);

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

            {/* lien -> ouverture modale */}
            <a href="#" className="auth-link" onClick={openForgot}>
              Mot de passe oublié&nbsp;?
            </a>
          </div>

          {error && <div className="auth-error" role="alert">{error}</div>}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="btn-spinner" aria-hidden="true" /> : "Se connecter"}
          </button>
        </form>

        <div className="auth-bottom">
          Pas de compte ? <a className="auth-link" href="/register">Créer un compte</a>
        </div>
      </div>

      {/* --------- MODALE "Mot de passe oublié" --------- */}
      {forgotOpen && (
        <div
          className="gmodal-backdrop"
          role="presentation"
          onClick={closeForgot}
        >
          <div
            className="gmodal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="forgot-title"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 560, textAlign: "left" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <h3 id="forgot-title" className="gmodal-title" style={{ margin: 0 }}>
                Réinitialisation du mot de passe
              </h3>
              <button
                aria-label="Fermer"
                onClick={closeForgot}
                className="gbtn gbtn--light"
                style={{ padding: "6px 10px" }}
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <form onSubmit={sendForgot}>
              <div style={{ marginTop: 10 }}>
                <label className="auth-field">
                  <span>Email</span>
                  <input
                    className="auth-input"
                    type="email"
                    placeholder="Email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </label>

                <p style={{ margin: "8px 0 14px", color: "#374151" }}>
                  Saisissez l’adresse email que vous avez utilisée pour créer votre compte client afin
                  de recevoir un lien de réinitialisation de mot de passe.
                </p>

                {/* Petit placeholder style "captcha" */}
                <div
                  style={{
                    borderRadius: 6,
                    background: "#0f0f0f",
                    color: "#fff",
                    padding: 10,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <input type="checkbox" id="fake-captcha" style={{ width: 18, height: 18 }} />
                  <label htmlFor="fake-captcha" style={{ margin: 0, cursor: "pointer" }}>
                    Verify you are human
                  </label>
                </div>

                {forgotError && (
                  <div className="auth-error" role="alert" style={{ marginTop: 6 }}>
                    {forgotError}
                  </div>
                )}
                {forgotDone && (
                  <div
                    role="status"
                    style={{
                      background: "#e7f8ee",
                      color: "#137a41",
                      border: "1px solid #b8ebcd",
                      borderRadius: 12,
                      padding: "10px 12px",
                      fontWeight: 700,
                      marginTop: 6,
                    }}
                  >
                    Si un compte existe pour cet email, un lien de réinitialisation vous a été envoyé.
                  </div>
                )}
              </div>

              <div className="gmodal-actions" style={{ marginTop: 12, justifyContent: "flex-end" }}>
                <button type="submit" className="gbtn gbtn--primary" disabled={forgotLoading}>
                  {forgotLoading ? "Envoi..." : "Envoyer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
