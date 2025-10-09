// src/pages/auth/Register.jsx
import React, { useMemo, useState, useEffect } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { registerRequest, registerClear } from "../../../lib/actions/AccountActions";
import { getCustomerRequest } from "../../../lib/actions/CustomerActions";

/* ========= Phone helpers (indicatifs + formatage E.164) ========= */
const PHONE_COUNTRIES = [
  // { iso: "AE", label: "Dubaï (EAU)", dial: "+971", trunk: "0" },
  // { iso: "DE", label: "Allemagne",    dial: "+49",  trunk: "0" },
  // { iso: "DZ", label: "Algérie",      dial: "+213", trunk: "0" },
  // { iso: "SA", label: "Arabie saoudite", dial: "+966", trunk: "0" },
  // { iso: "BE", label: "Belgique",     dial: "+32",  trunk: "0" },
  // { iso: "CA", label: "Canada",       dial: "+1",   trunk: ""  },
  // { iso: "ES", label: "Espagne",      dial: "+34",  trunk: "0" },
  // { iso: "US", label: "États-Unis",   dial: "+1",   trunk: ""  },
  { iso: "FR", label: "France",       dial: "+33",  trunk: "0" },
  // { iso: "IE", label: "Irlande",      dial: "+353", trunk: "0" },
  // { iso: "IT", label: "Italie",       dial: "+39",  trunk: "0" },
  // { iso: "LU", label: "Luxembourg",   dial: "+352", trunk: ""  },
  // { iso: "MA", label: "Maroc",        dial: "+212", trunk: "0" },
  // { iso: "ML", label: "Mali",         dial: "+223", trunk: ""  },
  // { iso: "SN", label: "Sénégal",      dial: "+221", trunk: ""  },
  // { iso: "CH", label: "Suisse",       dial: "+41",  trunk: "0" },
];

const PHONE_COUNTRIES_SORTED = [...PHONE_COUNTRIES].sort((a, b) =>
  a.label.localeCompare(b.label, "fr", { sensitivity: "base" })
);
const DEFAULT_DIAL =
  PHONE_COUNTRIES.find((c) => c.iso === "FR")?.dial || PHONE_COUNTRIES[0].dial;
const byDial = Object.fromEntries(PHONE_COUNTRIES.map((c) => [c.dial, c]));
const cleanDigits = (s) => String(s || "").replace(/[^\d]/g, "");

function composeE164(dial, local) {
  if (!local) return "";
  const meta = byDial[dial] || { trunk: "" };
  let loc = cleanDigits(local);
  if (meta.trunk && loc.startsWith(meta.trunk)) loc = loc.slice(meta.trunk.length);
  return `${dial}${loc}`;
}

function PhoneInput({ dial, local, onChange, disabled = false, required = false }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 8 }}>
      <select
        className="form-control"
        value={dial || DEFAULT_DIAL}
        onChange={(e) => onChange({ dial: e.target.value, local })}
        disabled={disabled}
      >
        {PHONE_COUNTRIES_SORTED.map((c) => (
          <option key={c.iso} value={c.dial}>
            {c.label} ({c.dial})
          </option>
        ))}
      </select>
      <input
        className="form-control"
        placeholder="N° national"
        value={local || ""}
        onChange={(e) => onChange({ dial, local: cleanDigits(e.target.value) })}
        inputMode="tel"
        autoComplete="tel-national"
        disabled={disabled}
        required={required}
      />
    </div>
  );
}

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
    birthdate: "",
    phoneDial: DEFAULT_DIAL,
    phoneLocal: "",
  });

  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  // ✅ En cas de succès, on ne redirige pas. On nettoie juste d’éventuelles erreurs.
  useEffect(() => {
    if (successRegister) {
      dispatch(registerClear());
    }
  }, [successRegister, dispatch]);

  const onChange = (e) => {
    const { name, value, type } = e.target;
    setForm((f) => ({ ...f, [name]: type === "radio" ? value : value }));
    if (errorRegister) dispatch(registerClear());
  };

  const handlePhoneChange = ({ dial, local }) => {
    setForm((f) => ({ ...f, phoneDial: dial, phoneLocal: local }));
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
    if (!cleanDigits(form.phoneLocal)) return "Le numéro de téléphone est requis.";
    return "";
  };

  const disabled =
    !form.firstName ||
    !form.lastName ||
    !form.email ||
    !form.password ||
    !form.confirm ||
    !form.birthdate ||
    cleanDigits(form.phoneLocal).length === 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      alert(v);
      return;
    }

    const phoneE164 = composeE164(form.phoneDial, form.phoneLocal);

    dispatch(
      registerRequest({
        Civility: form.civility,
        FirstName: form.firstName.trim(),
        LastName: form.lastName.trim(),
        Email: form.email.trim(),
        Password: form.password,
        Phone: phoneE164,
        Birthdate: form.birthdate || null,
      })
    );
  };

  dispatch(getCustomerRequest());

  // const exampleNote = useMemo(
  //   () => (
  //     <small style={{ color: "#6b7280" }}>
  //       Exemple FR : tapez <b>06…</b> — sera enregistré <b>+336…</b>
  //     </small>
  //   ),
  //   []
  // );

  return (
    <div className="auth-page auth-page--photo">
      <div className="auth-card" role="dialog" aria-labelledby="reg-title">
        <h1 id="reg-title" className="auth-title">Créer un compte</h1>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* civilité */}
          <div className="auth-row" style={{ gap: 12 }}>
            <label className="auth-remember">
              <input
                type="radio"
                name="civility"
                value="M"
                checked={form.civility === "M"}
                onChange={onChange}
              />
              <span className="ms-2">M.</span>
            </label>
            <label className="auth-remember ms-3">
              <input
                type="radio"
                name="civility"
                value="Mme"
                checked={form.civility === "Mme"}
                onChange={onChange}
              />
              <span className="ms-2">Mme</span>
            </label>
          </div>

          {/* prénom / nom */}
          <label className="auth-field mt-4">
            <span>Prénom *</span>
            <input
              className="auth-input"
              name="firstName"
              value={form.firstName}
              onChange={onChange}
              required
            />
          </label>

          <label className="auth-field">
            <span>Nom *</span>
            <input
              className="auth-input"
              name="lastName"
              value={form.lastName}
              onChange={onChange}
              required
            />
          </label>

          {/* email */}
          <label className="auth-field">
            <span>Email *</span>
            <input
              className="auth-input"
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="vous@exemple.com"
              autoComplete="email"
              required
            />
          </label>

          {/* date de naissance */}
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
              max={new Date().toISOString().slice(0, 10)}
            />
          </label>

          {/* mot de passe */}
          <label className="auth-field">
            <span>Mot de passe *</span>
            <div className="auth-pass-wrap">
              <input
                className="auth-input"
                type={showPwd ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={onChange}
                autoComplete="new-password"
                required
                placeholder="Min. 6 caractères"
              />
              <button
                type="button"
                className="toggle-pass"
                onClick={() => setShowPwd((s) => !s)}
              >
                <i className={`bi ${showPwd ? "bi-eye-slash" : "bi-eye"}`} />
              </button>
            </div>
          </label>

          {/* confirmation */}
          <label className="auth-field">
            <span>Confirmer le mot de passe *</span>
            <div className="auth-pass-wrap">
              <input
                className="auth-input"
                type={showPwd2 ? "text" : "password"}
                name="confirm"
                value={form.confirm}
                onChange={onChange}
                autoComplete="new-password"
                required
                placeholder="Retapez le mot de passe"
              />
              <button
                type="button"
                className="toggle-pass"
                onClick={() => setShowPwd2((s) => !s)}
              >
                <i className={`bi ${showPwd2 ? "bi-eye-slash" : "bi-eye"}`} />
              </button>
            </div>
          </label>

          {/* téléphone obligatoire */}
          <label className="auth-field">
            <span>Téléphone *</span>
            <PhoneInput
              dial={form.phoneDial}
              local={form.phoneLocal}
              onChange={handlePhoneChange}
              required
            />
            {/* {exampleNote} */}
          </label>

          {/* erreurs / succès */}
          {errorRegister && !successRegister && (
            <div className="auth-error" role="alert">
              {errorRegister}
            </div>
          )}
          {successRegister && (
            <div
              role="status"
              style={{
                background: "#e7f8ee",
                color: "#137a41",
                border: "1px solid #b8ebcd",
                borderRadius: 12,
                padding: "10px 12px",
                fontWeight: 700,
              }}
            >
              Compte créé avec succès.
            </div>
          )}

          <button
            type="submit"
            className="auth-btn bg-primary"
            disabled={loadingRegister || disabled}
          >
            {loadingRegister ? "Création…" : "Créer mon compte"}
          </button>

          {/* Lien Se connecter */}
          <p style={{ marginTop: 10, textAlign: "center" }}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
              style={{ color: "#2563eb", textDecoration: "none" }}
            >
              Se connecter
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};
