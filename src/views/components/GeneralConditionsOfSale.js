import React from 'react';
/**
 * Page CGV – Conditions Générales de Vente
 *
 * - Couleurs : s'aligne automatiquement sur les variables CSS du site si elles existent
 *   --primary, --text, --muted, --bg, --card-bg
 *   (sinon des fallbacks cohérents sont utilisés)
 * - Aucune dépendance externe
 * - Sémantique & accessible (sommaire, ancres, titres hiérarchisés)
 */

export default function GeneralConditionsOfSale() {
  const lastUpdate = new Date().toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });

  return (
    <main className="cgv-page" role="main">
      <style>{`
        .cgv-page{ 
          --primary: var(--primary, #2563eb);
          --text: var(--text, #0f172a);
          --muted: var(--muted, #64748b);
          --bg: var(--bg, #f1f5f9);
          --card-bg: var(--card-bg, #ffffff);
          color: var(--text);
          background: var(--bg);
          padding: 24px 16px; 
        }
        .cgv-container{ max-width: 1100px; margin: 0 auto; }
        .cgv-header{ display:flex; flex-direction:column; gap:12px; margin-bottom:24px; }
        .cgv-badge{ display:inline-flex; align-items:center; gap:8px; font-weight:600; background:rgba(37,99,235,.1); color:var(--primary); padding:6px 10px; border-radius:999px; width:max-content; }
        .cgv-title{ font-size: clamp(28px, 3.5vw, 40px); line-height:1.1; font-weight:800; margin:0; }
        .cgv-sub{ color:var(--muted); margin:0; }
        .cgv-grid{ display:grid; grid-template-columns: 280px 1fr; gap:24px; }
        @media (max-width: 900px){ .cgv-grid{ grid-template-columns: 1fr; } }
        .cgv-aside{ position: sticky; top:16px; align-self:start; }
        .cgv-card{ background:var(--card-bg); border-radius:16px; box-shadow:0 10px 24px rgba(2,8,23,.06); padding:16px; }
        .cgv-toc{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:6px; }
        .cgv-toc a{ display:block; padding:10px 12px; border-radius:10px; color:var(--text); text-decoration:none; font-weight:600; }
        .cgv-toc a:hover{ background:rgba(15,23,42,.06); }
        .cgv-section{ background:var(--card-bg); border-radius:16px; box-shadow:0 10px 24px rgba(2,8,23,.06); padding:24px; }
        .cgv-section + .cgv-section{ margin-top:16px; }
        .cgv-h2{ font-size: clamp(18px, 2vw, 22px); margin:0 0 10px; font-weight:800; }
        .cgv-h3{ font-size: 16px; margin:16px 0 8px; font-weight:700; }
        .cgv-p{ margin:8px 0; line-height:1.6; }
        .cgv-list{ padding-left:18px; margin:8px 0; }
        .cgv-strong{ font-weight:700; }
        .cgv-accent{ color:var(--primary); font-weight:700; }
        .cgv-divider{ height:1px; background:rgba(2,8,23,.08); margin:14px 0; }
        .cgv-footer{ color:var(--muted); font-size:14px; margin-top:24px; }
      `}</style>

      <div className="cgv-container">
        <header className="cgv-header">
          <span className="cgv-badge">🧾 Conditions générales de vente</span>
          <h1 className="cgv-title">Conditions Générales de Vente (CGV)</h1>
          <p className="cgv-sub">Dernière mise à jour : {lastUpdate}</p>
        </header>

        <div className="cgv-grid">
          {/* SOMMAIRE */}
          <aside className="cgv-aside">
            <nav className="cgv-card" aria-label="Sommaire des articles">
              <ul className="cgv-toc">
                <li><a href="#art1">1. Identification du vendeur</a></li>
                <li><a href="#art2">2. Objet</a></li>
                <li><a href="#art3">3. Produits</a></li>
                <li><a href="#art4">4. Prix</a></li>
                <li><a href="#art5">5. Commande</a></li>
                <li><a href="#art6">6. Paiement</a></li>
                <li><a href="#art7">7. Livraison</a></li>
                <li><a href="#art8">8. Droit de rétractation</a></li>
                <li><a href="#art9">9. Garanties légales</a></li>
                <li><a href="#art10">10. Responsabilité</a></li>
                <li><a href="#art11">11. Données personnelles</a></li>
                <li><a href="#art12">12. Droit applicable & litiges</a></li>
              </ul>
            </nav>
          </aside>

          {/* CONTENU */}
          <section>
            <article id="art1" className="cgv-section" aria-labelledby="h-art1">
              <h2 id="h-art1" className="cgv-h2">Article 1 – Identification du vendeur</h2>
              <p className="cgv-p"><span className="cgv-strong">Min’s Shop</span> (minshp.com) est édité par <span className="cgv-strong">MINS CORP</span>.</p>
              <ul className="cgv-list">
                <li>SIRET : 924 291 800 00010</li>
                <li>Siège social : 8 rue André Lalande, 91000 Évry-Courcouronnes, France</li>
                <li>Contact : <a className="cgv-accent" href="mailto:contact@minshp.com">contact@minshp.com</a></li>
              </ul>
            </article>

            <article id="art2" className="cgv-section" aria-labelledby="h-art2">
              <h2 id="h-art2" className="cgv-h2">Article 2 – Objet</h2>
              <p className="cgv-p">Les présentes CGV régissent les ventes de <span className="cgv-strong">produits électroniques et montres</span> réalisées en ligne sur minshp.com à destination de consommateurs situés en <span className="cgv-strong">France métropolitaine</span>. Toute commande implique l’acceptation pleine et entière des présentes CGV.</p>
            </article>

            <article id="art3" className="cgv-section" aria-labelledby="h-art3">
              <h2 id="h-art3" className="cgv-h2">Article 3 – Produits</h2>
              <p className="cgv-p">Les produits sont décrits et présentés avec la plus grande exactitude possible ; les photographies ont une valeur illustrative. Des écarts non substantiels n’engagent pas la responsabilité de MINS CORP.</p>
            </article>

            <article id="art4" className="cgv-section" aria-labelledby="h-art4">
              <h2 id="h-art4" className="cgv-h2">Article 4 – Prix</h2>
              <p className="cgv-p">Les prix sont indiqués en euros, <span className="cgv-strong">TTC</span>. Ils peuvent être modifiés à tout moment, mais les produits sont facturés sur la base des tarifs en vigueur lors de la validation de la commande. Les frais de livraison sont précisés avant la validation finale.</p>
            </article>

            <article id="art5" className="cgv-section" aria-labelledby="h-art5">
              <h2 id="h-art5" className="cgv-h2">Article 5 – Commande</h2>
              <p className="cgv-p">La commande est passée sur minshp.com. Elle vaut acceptation des prix et de la description des produits. Elle devient définitive après confirmation par email de MINS CORP.</p>
            </article>

            <article id="art6" className="cgv-section" aria-labelledby="h-art6">
              <h2 id="h-art6" className="cgv-h2">Article 6 – Paiement</h2>
              <p className="cgv-p">Les paiements sont sécurisés et acceptés par <span className="cgv-strong">carte bancaire</span> et <span className="cgv-strong">PayPal</span>. La commande est effective après confirmation du paiement.</p>
            </article>

            <article id="art7" className="cgv-section" aria-labelledby="h-art7">
              <h2 id="h-art7" className="cgv-h2">Article 7 – Livraison</h2>
              <p className="cgv-p">Livraison en <span className="cgv-strong">France métropolitaine uniquement</span>, sous un délai moyen de <span className="cgv-strong">3 à 5 jours ouvrés</span> à compter de la validation de la commande. Les produits sont livrés à l’adresse indiquée par le client. En cas de retard, MINS CORP informe le client dans les meilleurs délais.</p>
            </article>

            <article id="art8" className="cgv-section" aria-labelledby="h-art8">
              <h2 id="h-art8" className="cgv-h2">Article 8 – Droit de rétractation</h2>
              <p className="cgv-p">Conformément à l’article L.221-18 du Code de la consommation, le client dispose d’un <span className="cgv-strong">délai de 14 jours</span> à compter de la réception pour exercer son droit de rétractation, sans justification.</p>
              <ul className="cgv-list">
                <li><span className="cgv-strong">Frais de retour</span> : à la charge du client.</li>
                <li>Produit <span className="cgv-strong">neuf, complet, non utilisé</span>, dans son emballage d’origine.</li>
                <li>Prendre contact au préalable : <a className="cgv-accent" href="mailto:contact@minshp.com">contact@minshp.com</a>.</li>
                <li>Remboursement sous 14 jours après réception et contrôle du produit retourné.</li>
              </ul>
            </article>

            <article id="art9" className="cgv-section" aria-labelledby="h-art9">
              <h2 id="h-art9" className="cgv-h2">Article 9 – Garanties légales</h2>
              <p className="cgv-p">Les produits bénéficient de la <span className="cgv-strong">garantie légale de conformité</span> (L.217-4 et s. C. conso.) et de la <span className="cgv-strong">garantie des vices cachés</span> (1641 et s. C. civ.). Toute demande : <a className="cgv-accent" href="mailto:contact@minshp.com">contact@minshp.com</a>.</p>
            </article>

            <article id="art10" className="cgv-section" aria-labelledby="h-art10">
              <h2 id="h-art10" className="cgv-h2">Article 10 – Responsabilité</h2>
              <p className="cgv-p">MINS CORP ne saurait être tenue responsable des dommages résultant d’une mauvaise utilisation des produits ou d’inconvénients inhérents à l’usage d’Internet (rupture de service, intrusion extérieure, virus, etc.).</p>
            </article>

            <article id="art11" className="cgv-section" aria-labelledby="h-art11">
              <h2 id="h-art11" className="cgv-h2">Article 11 – Données personnelles</h2>
              <p className="cgv-p">Les données collectées sont traitées conformément au RGPD. Le client dispose d’un droit d’accès, de rectification, d’opposition et d’effacement en écrivant à <a className="cgv-accent" href="mailto:contact@minshp.com">contact@minshp.com</a>. Pour plus d’informations, consulter la politique de confidentialité du site.</p>
            </article>

            <article id="art12" className="cgv-section" aria-labelledby="h-art12">
              <h2 id="h-art12" className="cgv-h2">Article 12 – Droit applicable et litiges</h2>
              <p className="cgv-p">Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera recherchée. À défaut, les tribunaux compétents du ressort du siège social de MINS CORP seront saisis.</p>
              <div className="cgv-divider" />
              <p className="cgv-footer">MINS CORP – 8 rue André Lalande, 91000 Évry-Courcouronnes – SIRET 924 291 800 00010</p>
            </article>
          </section>
        </div>
      </div>
    </main>
  );
}
