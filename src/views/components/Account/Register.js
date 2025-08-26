// src/pages/auth/Register.jsx
import React, { useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../../../App.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { actionsAccount, registerRequest, registerClear } from "../../../lib/actions/AccountActions";

export const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loadingRegister, errorRegister, successRegister } = useSelector((s) => s.account);

  const [form, setForm] = useState({
    civility: "M",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
    phone: "",
    birthdate: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  const onChange = (e) => {
    const { name, value, type } = e.target;
    setForm((f) => ({ ...f, [name]: type === "radio" ? value : value }));
    if (errorRegister) dispatch(registerClear());
  };

  const validate = () => {
    if (!form.firstName.trim()) return "Le prénom est requis.";
    if (!form.lastName.trim()) return "Le nom est requis.";
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!emailOk) return "Adresse email invalide.";
    if (!form.password) return "Le mot de passe est requis.";
    if (form.password.length < 6) return "Le mot de passe doit contenir au moins 6 caractères.";
    if (form.confirm !== form.password) return "Les mots de passe ne correspondent pas.";
    return "";
  };

  const disabled = !form.firstName || !form.lastName || !form.email || !form.password || !form.confirm || !form.birthdate;

  const handleSubmit = (e) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      // affiche une erreur locale sans passer par redux si tu veux
      alert(v);
      return;
    }

    dispatch(registerRequest({
      Civility: form.civility,
      FirstName: form.firstName,
      LastName: form.lastName,
      Email: form.email,
      Password: form.password,
      Phone: form.phone || null,
      Birthdate: form.birthdate || null,
      navigate, // pour rediriger depuis la saga
    }));
  };

  return (
    <div className="auth-page auth-page--photo">
      <div className="auth-card" role="dialog" aria-labelledby="reg-title">
        <h1 id="reg-title" className="auth-title">Créer un compte</h1>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* civilité */}
          <div className="auth-row" style={{ gap: 12 }}>
            <label className="auth-remember">
              <input type="radio" name="civility" value="M"
                     checked={form.civility === "M"} onChange={onChange}/>
              <span>M.</span>
            </label>
            <label className="auth-remember">
              <input type="radio" name="civility" value="Mme"
                     checked={form.civility === "Mme"} onChange={onChange}/>
              <span>Mme</span>
            </label>
          </div>

          {/* prénom / nom */}
          <label className="auth-field">
            <span>Prénom *</span>
            <input className="auth-input" name="firstName" value={form.firstName} onChange={onChange} required/>
          </label>

          <label className="auth-field">
            <span>Nom *</span>
            <input className="auth-input" name="lastName" value={form.lastName} onChange={onChange} required/>
          </label>

          {/* email */}
          <label className="auth-field">
            <span>Email *</span>
            <input className="auth-input" type="email" name="email" value={form.email}
                   onChange={onChange} placeholder="vous@exemple.com" autoComplete="email" required/>
          </label>

          {/* date de naissance (si utilisée côté API) */}
          <label className="auth-field">
            <span>Date de naissance *</span>
            <input
              className="auth-input"
              type="date"
              name="birthdate"
              value={form.birthdate}
              onChange={onChange}
              autoComplete="bday"
              required
              max={new Date().toISOString().slice(0,10)}   // pas de date future
            />
          </label>

          {/* mot de passe */}
          <label className="auth-field">
            <span>Mot de passe *</span>
            <div className="auth-pass-wrap">
              <input className="auth-input" type={showPwd ? "text" : "password"} name="password"
                     value={form.password} onChange={onChange} autoComplete="new-password" required/>
              <button type="button" className="toggle-pass"
                      onClick={() => setShowPwd((s) => !s)}>
                <i className={`bi ${showPwd ? "bi-eye-slash" : "bi-eye"}`} />
              </button>
            </div>
          </label>

          {/* confirmation */}
          <label className="auth-field">
            <span>Confirmer le mot de passe *</span>
            <div className="auth-pass-wrap">
              <input className="auth-input" type={showPwd2 ? "text" : "password"} name="confirm"
                     value={form.confirm} onChange={onChange} autoComplete="new-password" required/>
              <button type="button" className="toggle-pass"
                      onClick={() => setShowPwd2((s) => !s)}>
                <i className={`bi ${showPwd2 ? "bi-eye-slash" : "bi-eye"}`} />
              </button>
            </div>
          </label>

          {/* téléphone */}
          <label className="auth-field">
            <span>Téléphone (optionnel)</span>
            <input className="auth-input" type="tel" name="phone"
                   value={form.phone} onChange={onChange} autoComplete="tel"/>
          </label>

          {/* erreurs / succès */}
          {errorRegister && <div className="auth-error" role="alert">{errorRegister}</div>}
          {successRegister && (
            <div role="status" style={{
              background:"#e7f8ee", color:"#137a41", border:"1px solid #b8ebcd",
              borderRadius:12, padding:"10px 12px", fontWeight:700
            }}>
              Compte créé. Connexion en cours…
            </div>
          )}

            <button type="submit" className="auth-btn" disabled={loadingRegister || disabled}>
              {loadingRegister ? "Création…" : "Créer mon compte"}
            </button>
        </form>
      </div>
    </div>
  );
};
