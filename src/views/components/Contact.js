import React from "react";
import "../../styles/pages/contact.css";

export const Contact = () => {
  return (
    <main className="contact-page">
      {/* --- HERO pleine largeur --- */}
      <section
        className="contact-hero full-bleed"
        // Remplace l'URL ci-dessous par une image de ton CDN / médias
        style={{ "--hero-img": "url('/Imgs/contact_bg.png')" }}
        aria-label="Bannière de la page contact"
      >
        <div className="contact-hero__overlay">
          <h1 className="contact-hero__title">Contactez-nous</h1>
        </div>
      </section>

      <div className="contact-container">
        {/* --- Cartes de contact --- */}
        <section className="contact-cards" aria-label="Moyens de contact">
          {/* Téléphone */}
          <article className="contact-card">
            <header className="contact-card__header">
              <span className="contact-card__icon" aria-hidden="true">
                {/* icône téléphone (SVG inline, pas de lib externe) */}
                <svg viewBox="0 0 24 24" width="28" height="28">
                  <path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1.5 1.5 0 011.5-.37c1.62.54 3.37.84 5.15.84.83 0 1.5.67 1.5 1.5V21a3 3 0 01-3 3C9.85 24 0 14.15 0 3A3 3 0 013 0h2.83c.83 0 1.5.67 1.5 1.5 0 1.78.3 3.53.84 5.15.16.51.03 1.07-.37 1.47L6.6 10.8z" />
                </svg>
              </span>
              <h2 className="contact-card__title">Téléphone</h2>
            </header>

            <p className="contact-card__highlight">
              <a href="tel:0240929191" className="link-strong">09 73 22 32 50</a>
            </p>

            <p className="contact-card__text">
              Nous sommes joignables du lundi au vendredi de 9h à 18h. <br />
            </p>
          </article>

          {/* Mail */}
          <article className="contact-card">
            <header className="contact-card__header">
              <span className="contact-card__icon" aria-hidden="true">
                {/* icône mail */}
                <svg viewBox="0 0 24 24" width="28" height="28">
                  <path d="M2 4h20a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V6a2 2 0 012-2zm0 2l10 6L22 6H2zm20 12V8l-10 6L2 8v10h20z" />
                </svg>
              </span>
              <h2 className="contact-card__title">Mail</h2>
            </header>

            <ul className="contact-list">
              <li>
                Service clientèle :{" "}
                <a href="mailto:support@minshp.com" className="link-strong">
                  support@minshp.com
                </a>
              </li>
            </ul>
          </article>
        </section>


        {/* --- Infos services --- */}
        <section className="contact-infos">
          <article>
            <h3>Service clientèle</h3>
            <p>
              Une question sur une commande, un suivi de livraison ou une information produit ? Notre équipe
              est à votre écoute. N’hésitez pas à nous solliciter.
            </p>
          </article>

          <article>
            <h3>Support</h3>
            <p>
              Besoin d’un conseil avant achat, d’une compatibilité ou d’un diagnostic ? Nos techniciens vous
              accompagnent pour résoudre vos problématiques et assurer le bon fonctionnement de votre matériel.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
};
