import React, { useEffect, useState } from "react";
import "../../styles/components/cookie-consent.css";
/** Storage key + simple helpers */
export const COOKIE_PREFS_KEY = "cookie_prefs_v1";

export const getCookiePrefs = () => {
  try {
    const raw = localStorage.getItem(COOKIE_PREFS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveCookiePrefs = (prefs) => {
  const payload = {
    ...prefs,
    updatedAt: new Date().toISOString(),
    version: 1,
  };
  localStorage.setItem(COOKIE_PREFS_KEY, JSON.stringify(payload));
  return payload;
};

/** quick helper used elsewhere (analytics, etc.) */
export const hasConsent = (key /* "functional" | "analytics" | "marketing" */) => {
  const p = getCookiePrefs();
  if (!p) return false;
  if (key === "necessary") return true;
  return !!p[key];
};

const defaultPrefs = {
  necessary: true, // always true (non-toggleable)
  functional: false,
  analytics: false,
  marketing: false,
};

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [prefs, setPrefs] = useState(defaultPrefs);

  // On mount, read prefs
  useEffect(() => {
    const stored = getCookiePrefs();
    if (stored) {
      setPrefs({ ...defaultPrefs, ...stored }); // keep necessary: true
      setShowBanner(false);
    } else {
      setShowBanner(true);
    }
  }, []);

  // Lock body scroll when panel open
  useEffect(() => {
    if (showPanel) document.body.classList.add("body--locked");
    else document.body.classList.remove("body--locked");
    return () => document.body.classList.remove("body--locked");
  }, [showPanel]);

  const acceptAll = () => {
    const all = { ...defaultPrefs, functional: true, analytics: true, marketing: true };
    saveCookiePrefs(all);
    setPrefs(all);
    setShowPanel(false);
    setShowBanner(false);
  };

  const rejectAll = () => {
    const none = { ...defaultPrefs, functional: false, analytics: false, marketing: false };
    saveCookiePrefs(none);
    setPrefs(none);
    setShowPanel(false);
    setShowBanner(false);
  };

  const saveSelection = () => {
    saveCookiePrefs(prefs);
    setShowPanel(false);
    setShowBanner(false);
  };

  if (!showBanner && !showPanel) return null;

  return (
    <>
      {/* Bottom banner (compact) */}
      {showBanner && !showPanel && (
        <div className="cc-banner" role="dialog" aria-live="polite">
          <div className="cc-text">
            <span className="cc-emoji" aria-hidden>🍪</span>
            Nous utilisons des cookies pour vous offrir une expérience optimale et des mesures d’audience.
            <button
              className="cc-link"
              onClick={() => setShowPanel(true)}
              aria-expanded={showPanel}
            >
              Voir plus
            </button>
            <button className="cc-link" onClick={acceptAll}>Accepter</button>
          </div>
          <button className="cc-cta" onClick={acceptAll}>J’ai compris</button>
        </div>
      )}

      {/* Full preferences panel */}
      {showPanel && (
        <div className="cc-modal" role="dialog" aria-modal="true" aria-label="Préférences cookies">
          <div className="cc-panel">
            <div className="cc-panel-head">
              <div className="cc-title">Préférences de confidentialité</div>
              <button className="cc-close" onClick={() => setShowPanel(false)} aria-label="Fermer">✕</button>
            </div>

            <div className="cc-section">
              <label className="cc-row cc-row--locked">
                <input type="checkbox" checked readOnly />
                <div className="cc-col">
                  <div className="cc-row-title">Nécessaire</div>
                  <div className="cc-row-desc">
                    Indispensables au fonctionnement du site (sécurité, panier, navigation). Toujours actifs.
                  </div>
                </div>
              </label>

              <label className="cc-row">
                <input
                  type="checkbox"
                  checked={prefs.functional}
                  onChange={(e) => setPrefs((p) => ({ ...p, functional: e.target.checked }))}
                />
                <div className="cc-col">
                  <div className="cc-row-title">Fonctionnel</div>
                  <div className="cc-row-desc">
                    Mémorisation de vos préférences (langue, filtres, etc.) pour améliorer le confort d’usage.
                  </div>
                </div>
              </label>

              <label className="cc-row">
                <input
                  type="checkbox"
                  checked={prefs.analytics}
                  onChange={(e) => setPrefs((p) => ({ ...p, analytics: e.target.checked }))}
                />
                <div className="cc-col">
                  <div className="cc-row-title">Analytique</div>
                  <div className="cc-row-desc">
                    Mesure d’audience (pages vues, performances) pour améliorer le site.
                  </div>
                </div>
              </label>

              <label className="cc-row">
                <input
                  type="checkbox"
                  checked={prefs.marketing}
                  onChange={(e) => setPrefs((p) => ({ ...p, marketing: e.target.checked }))}
                />
                <div className="cc-col">
                  <div className="cc-row-title">Marketing</div>
                  <div className="cc-row-desc">
                    Personnalisation de contenu/annonces et limites de répétition (si vous utilisez de la pub).
                  </div>
                </div>
              </label>
            </div>

            <div className="cc-actions">
              <button className="cc-btn cc-btn--ghost" onClick={rejectAll}>Tout refuser</button>
              <button className="cc-btn cc-btn--light" onClick={acceptAll}>Tout accepter</button>
              <button className="cc-btn cc-btn--primary" onClick={saveSelection}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
