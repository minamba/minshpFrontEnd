import React from "react";

/**
 * Deux pages : Mentions Légales & Politique de Confidentialité (RGPD)
 *
 * - Style cohérent avec la page CGV (variables CSS : --primary, --text, --muted, --bg, --card-bg)
 * - Accessibles (sommaire, ancres, titres hiérarchisés)
 * - Zéro dépendance
 * - Exporte 2 composants nommés : <MentionsLegales /> et <PolitiqueConfidentialite />
 */

/* ===================== STYLES COMMUNS ===================== */
const CommonStyle = () => (
  <style>{`
    .legal-page{ 
      --primary: var(--primary, #2563eb);
      --text: var(--text, #0f172a);
      --muted: var(--muted, #64748b);
      --bg: var(--bg, #f1f5f9);
      --card-bg: var(--card-bg, #ffffff);
      color: var(--text);
      background: var(--bg);
      padding: 24px 16px;
    }
    .legal-container{ max-width: 1100px; margin: 0 auto; }
    .legal-header{ display:flex; flex-direction:column; gap:12px; margin-bottom:24px; }
    .legal-badge{ display:inline-flex; align-items:center; gap:8px; font-weight:600; background:rgba(37,99,235,.1); color:var(--primary); padding:6px 10px; border-radius:999px; width:max-content; }
    .legal-title{ font-size: clamp(28px, 3.5vw, 40px); line-height:1.1; font-weight:800; margin:0; }
    .legal-sub{ color:var(--muted); margin:0; }
    .legal-grid{ display:grid; grid-template-columns: 280px 1fr; gap:24px; }
    @media (max-width: 900px){ .legal-grid{ grid-template-columns: 1fr; } }
    .legal-aside{ position: sticky; top:16px; align-self:start; }
    .legal-card{ background:var(--card-bg); border-radius:16px; box-shadow:0 10px 24px rgba(2,8,23,.06); padding:16px; }
    .legal-toc{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:6px; }
    .legal-toc a{ display:block; padding:10px 12px; border-radius:10px; color:var(--text); text-decoration:none; font-weight:600; }
    .legal-toc a:hover{ background:rgba(15,23,42,.06); }
    .legal-section{ background:var(--card-bg); border-radius:16px; box-shadow:0 10px 24px rgba(2,8,23,.06); padding:24px; }
    .legal-section + .legal-section{ margin-top:16px; }
    .legal-h2{ font-size: clamp(18px, 2vw, 22px); margin:0 0 10px; font-weight:800; }
    .legal-h3{ font-size: 16px; margin:16px 0 8px; font-weight:700; }
    .legal-p{ margin:8px 0; line-height:1.6; }
    .legal-list{ padding-left:18px; margin:8px 0; }
    .legal-strong{ font-weight:700; }
    .legal-accent{ color:var(--primary); font-weight:700; }
    .legal-divider{ height:1px; background:rgba(2,8,23,.08); margin:14px 0; }
    .legal-footer{ color:var(--muted); font-size:14px; margin-top:24px; }
  `}</style>
);

const formatDate = () => new Date().toLocaleDateString("fr-FR", {
  year: "numeric", month: "long", day: "2-digit",
});

/* ===================== MENTIONS LÉGALES ===================== */
export function LegalNotices(){
  const lastUpdate = formatDate();
  return (
    <main className="legal-page" role="main">
      <CommonStyle />
      <div className="legal-container">
        <header className="legal-header">
          <span className="legal-badge">📄 Mentions légales</span>
          <h1 className="legal-title">Mentions légales</h1>
          <p className="legal-sub">Dernière mise à jour : {lastUpdate}</p>
        </header>

        <div className="legal-grid">
          <aside className="legal-aside">
            <nav className="legal-card" aria-label="Sommaire Mentions Légales">
              <ul className="legal-toc">
                <li><a href="#ml-1">1. Éditeur du site</a></li>
                <li><a href="#ml-2">2. Hébergement</a></li>
                <li><a href="#ml-3">3. Contact</a></li>
                <li><a href="#ml-4">4. Propriété intellectuelle</a></li>
                <li><a href="#ml-5">5. Responsabilités</a></li>
              </ul>
            </nav>
          </aside>

          <section>
            <article id="ml-1" className="legal-section" aria-labelledby="h-ml-1">
              <h2 id="h-ml-1" className="legal-h2">1. Éditeur du site</h2>
              <p className="legal-p"><span className="legal-strong">Min’s Shop</span> (minshp.com) est édité par <span className="legal-strong">MINS CORP</span>.</p>
              <ul className="legal-list">
                <li>Forme : Entreprise (MINS CORP)</li>
                <li>SIRET : 924 291 800 00010</li>
                <li>Siège social : 2 rue Jules Vallès, 91000 Évry-Courcouronnes, France</li>
                <li>Directeur de la publication : le représentant légal de MINS CORP</li>
              </ul>
            </article>

            <article id="ml-2" className="legal-section" aria-labelledby="h-ml-2">
                <h2 id="h-ml-2" className="legal-h2">2. Hébergement</h2>
                <p className="legal-p">Le site est hébergé par : <span className="legal-strong">LWS (Ligne Web Services SARL)</span>.</p>
                <ul className="legal-list">
                <li>Adresse : 10 Rue de Penthièvre, 75008 Paris, France</li>
                <li>Site web : <a className="legal-accent" href="https://www.lws.fr">www.lws.fr</a></li>
                </ul>
            </article>

            <article id="ml-3" className="legal-section" aria-labelledby="h-ml-3">
              <h2 id="h-ml-3" className="legal-h2">3. Contact</h2>
              <ul className="legal-list">
                <li>Email : <a className="legal-accent" href="mailto:contact@minshp.com">contact@minshp.com</a></li>
                {/* <li>Téléphone : 06 24 95 75 58</li> */}
              </ul>
            </article>

            <article id="ml-4" className="legal-section" aria-labelledby="h-ml-4">
              <h2 id="h-ml-4" className="legal-h2">4. Propriété intellectuelle</h2>
              <p className="legal-p">L’ensemble des éléments du site (textes, images, logos, chartes graphiques, vidéos, bases de données, etc.) est protégé par le droit d’auteur et les droits de propriété intellectuelle. Toute reproduction, représentation, modification ou adaptation, totale ou partielle, est interdite sans autorisation écrite préalable de MINS CORP.</p>
            </article>

            <article id="ml-5" className="legal-section" aria-labelledby="h-ml-5">
              <h2 id="h-ml-5" className="legal-h2">5. Responsabilités</h2>
              <p className="legal-p">MINS CORP ne saurait être tenue responsable des dommages indirects résultant de l’utilisation du site ou de l’accès à des sites tiers via des liens hypertextes. L’utilisateur est seul responsable de la compatibilité de son équipement et de la protection de ses données.</p>
              <div className="legal-divider" />
              <p className="legal-footer">MINS CORP – 8 rue Adnré Lalande, 91000 Évry-Courcouronnes – SIRET 924 291 800 00010</p>
            </article>
          </section>
        </div>
      </div>
    </main>
  );
}

/* ============== POLITIQUE DE CONFIDENTIALITÉ (RGPD) ============== */
export function PrivacyPolicy(){
  const lastUpdate = formatDate();
  return (
    <main className="legal-page" role="main">
      <CommonStyle />
      <div className="legal-container">
        <header className="legal-header">
          <span className="legal-badge">🔐 Politique de confidentialité</span>
          <h1 className="legal-title">Politique de confidentialité</h1>
          <p className="legal-sub">Dernière mise à jour : {lastUpdate}</p>
        </header>

        <div className="legal-grid">
          <aside className="legal-aside">
            <nav className="legal-card" aria-label="Sommaire Confidentialité">
              <ul className="legal-toc">
                <li><a href="#pc-1">1. Responsable de traitement</a></li>
                <li><a href="#pc-2">2. Données collectées</a></li>
                <li><a href="#pc-3">3. Finalités & bases légales</a></li>
                <li><a href="#pc-4">4. Durées de conservation</a></li>
                <li><a href="#pc-5">5. Destinataires</a></li>
                <li><a href="#pc-6">6. Vos droits RGPD</a></li>
                <li><a href="#pc-7">7. Sécurité</a></li>
                <li><a href="#pc-8">8. Cookies</a></li>
                <li><a href="#pc-9">9. Transferts hors UE</a></li>
                <li><a href="#pc-10">10. Contact DCP</a></li>
              </ul>
            </nav>
          </aside>

          <section>
            <article id="pc-1" className="legal-section" aria-labelledby="h-pc-1">
              <h2 id="h-pc-1" className="legal-h2">1. Responsable de traitement</h2>
              <p className="legal-p"><span className="legal-strong">MINS CORP</span> – 2 rue Jules Vallès, 91000 Évry-Courcouronnes – est responsable du traitement des données collectées via minshp.com. Contact : <a className="legal-accent" href="mailto:contact@minshp.com">contact@minshp.com</a>.</p>
            </article>

            <article id="pc-2" className="legal-section" aria-labelledby="h-pc-2">
              <h2 id="h-pc-2" className="legal-h2">2. Données collectées</h2>
              <ul className="legal-list">
                <li>Données d’identité : nom, prénom, email, téléphone, adresses.</li>
                <li>Données de commande & livraison : produits, montants, numéro de suivi.</li>
                <li>Données de paiement : via prestataires (carte/PayPal). Aucune donnée complète de carte n’est stockée par MINS CORP.</li>
                <li>Données techniques : logs, adresse IP, navigateur, cookies nécessaires.</li>
              </ul>
            </article>

            <article id="pc-3" className="legal-section" aria-labelledby="h-pc-3">
              <h2 id="h-pc-3" className="legal-h2">3. Finalités & bases légales</h2>
              <ul className="legal-list">
                <li><span className="legal-strong">Gestion des commandes</span> (exécution du contrat).</li>
                <li><span className="legal-strong">Paiement & lutte contre la fraude</span> (obligation légale/intérêt légitime).</li>
                <li><span className="legal-strong">Livraison & service client</span> (exécution du contrat/intérêt légitime).</li>
                <li><span className="legal-strong">Comptabilité</span> (obligations légales).</li>
                <li><span className="legal-strong">Marketing</span> : emails d’information avec votre consentement (opt‑in) ; désinscription possible à tout moment.</li>
              </ul>
            </article>

            <article id="pc-4" className="legal-section" aria-labelledby="h-pc-4">
              <h2 id="h-pc-4" className="legal-h2">4. Durées de conservation</h2>
              <ul className="legal-list">
                <li>Prospects (newsletter) : 3 ans après le dernier contact.</li>
                <li>Comptes clients : pendant la relation + 3 ans après la dernière activité.</li>
                <li>Commandes & factures : 10 ans (obligation comptable).</li>
                <li>Cookies nécessaires : durée technique ; cookies de mesure/marketing selon bandeau d’acceptation.</li>
              </ul>
            </article>

            <article id="pc-5" className="legal-section" aria-labelledby="h-pc-5">
              <h2 id="h-pc-5" className="legal-h2">5. Destinataires</h2>
              <p className="legal-p">Prestataires intervenant pour le compte de MINS CORP :</p>
              <ul className="legal-list">
                <li>Paiement : établissements de paiement (carte) et <span className="legal-strong">PayPal</span>.</li>
                <li>Logistique : transporteurs pour la livraison en France métropolitaine.</li>
                <li>Hébergement & maintenance : hébergeur du site et prestataires techniques.</li>
              </ul>
            </article>

            <article id="pc-6" className="legal-section" aria-labelledby="h-pc-6">
              <h2 id="h-pc-6" className="legal-h2">6. Vos droits RGPD</h2>
              <p className="legal-p">Vous disposez des droits d’accès, rectification, effacement, limitation, opposition, portabilité. Vous pouvez aussi définir des directives post‑mortem.</p>
              <p className="legal-p">Exercice des droits : <a className="legal-accent" href="mailto:contact@minshp.com">contact@minshp.com</a>. En cas de difficulté, vous pouvez saisir la CNIL (cnil.fr).</p>
            </article>

            <article id="pc-7" className="legal-section" aria-labelledby="h-pc-7">
              <h2 id="h-pc-7" className="legal-h2">7. Sécurité</h2>
              <p className="legal-p">MINS CORP met en œuvre des mesures techniques et organisationnelles adaptées pour protéger vos données (chiffrement des échanges, contrôle d’accès, sauvegardes, journalisation).</p>
            </article>

            <article id="pc-8" className="legal-section" aria-labelledby="h-pc-8">
              <h2 id="h-pc-8" className="legal-h2">8. Cookies</h2>
              <p className="legal-p">Des cookies nécessaires au fonctionnement du site sont déposés. Sous réserve de votre consentement, des cookies de mesure d’audience et/ou marketing peuvent être utilisés. Vous pouvez gérer vos préférences via le bandeau cookies.</p>
            </article>

            <article id="pc-9" className="legal-section" aria-labelledby="h-pc-9">
              <h2 id="h-pc-9" className="legal-h2">9. Transferts hors UE</h2>
              <p className="legal-p">Si certains prestataires sont situés hors Union européenne, des garanties appropriées sont mises en place (clauses contractuelles types, pays adéquats, etc.).</p>
            </article>

            <article id="pc-10" className="legal-section" aria-labelledby="h-pc-10">
              <h2 id="h-pc-10" className="legal-h2">10. Contact données personnelles</h2>
              <p className="legal-p">Pour toute question relative à cette politique ou à vos données, contactez‑nous à <a className="legal-accent" href="mailto:contact@minshp.com">contact@minshp.com</a>.</p>
              <div className="legal-divider" />
              <p className="legal-footer">MINS CORP – 8 rue Adnré Lalande, 91000 Évry-Courcouronnes – SIRET 924 291 800 00010</p>
            </article>
          </section>
        </div>
      </div>
    </main>
  );
}

/* ===================== NOTES D’INTÉGRATION =====================

// Router exemple :
// import { MentionsLegales, PolitiqueConfidentialite } from "./Mentions & Confidentialité";
// <Route path="/mentions-legales" element={<MentionsLegales />} />
// <Route path="/confidentialite" element={<PolitiqueConfidentialite />} />

// Si tu préfères 2 fichiers séparés, copie/colle chaque composant dans un fichier dédié
// MentionsLegales.jsx et PolitiqueConfidentialite.jsx (garde CommonStyle ou factorise).

=============================================================== */
