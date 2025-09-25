// src/views/pages/News.jsx
import React, { useMemo, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { addToCartRequest, saveCartRequest } from "../../lib/actions/CartActions";
import { GenericModal } from "../../components";
import { calculPrice } from "../../lib/utils/Helpers";
import { toMediaUrl } from "../../lib/utils/mediaUrl";
import "../../styles/pages/category.css";

// Helpers
const parseDate = (val) => {
  if (!val) return null;
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d;
};
const toNum = (v) => (typeof v === "number" ? v : parseFloat(v));

export const News = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Store (robuste)
  const products = useSelector((s) => s?.products?.products ?? []);
  const images   = useSelector((s) => s?.images?.images ?? []);
  const items    = useSelector((s) => s?.items?.items ?? []);
  const applications = useSelector((s) => s?.applications?.applications ?? []);

  // Limite d’affichage (depuis param app)
  const limit = useMemo(() => applications[0]?.displayNewProductNumber ?? Infinity, [applications]);

  // Sauvegarde panier
  useEffect(() => { dispatch(saveCartRequest(items)); }, [items, dispatch]);

  // Image principale d’un produit
  const getProductImage = (id) => {
    const productImages = images.filter((i) => String(i.idProduct) === String(id));
    return productImages.length > 0 ? productImages[0].url : "/Images/placeholder.jpg";
  };

  /* ---------- Recherche + tri ---------- */
  const [search, setSearch]   = useState("");
  const [sortKey, setSortKey] = useState(""); // placeholder

  // Liste augmentée (prix, promos, dates…)
  const augmented = useMemo(() => {
    return (products || []).map((product, index) => {
      const name =
        [product?.brand, product?.model].filter(Boolean).join(" ") ||
        product?.title ||
        `Produit ${index + 1}`;

      const priceRef = Number(toNum(product?.priceTtc)) || 0;

      const p0 = product?.promotions?.[0];
      const hasProductPromo = (() => {
        if (!p0) return false;
        const pct = Number(p0?.purcentage) || 0;
        if (pct <= 0) return false;
        const start = parseDate(p0?.startDate);
        const end   = parseDate(p0?.endDate);
        const now   = new Date();
        const endOfDay = end ? new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23,59,59,999) : null;
        if (start && start > now) return false;
        if (endOfDay && endOfDay < now) return false;
        return true;
      })();

      const productPct    = hasProductPromo ? Number(p0?.purcentage) : 0;
      const computedPromo = +(priceRef * (1 - productPct / 100)).toFixed(2);
      const promotedBE    = Number(toNum(product?.priceHtPromoted));
      const productPromoPrice = hasProductPromo
        ? (Number.isFinite(promotedBE) ? promotedBE : computedPromo)
        : null;

      const subCatCodeVal = Number(toNum(product?.priceHtSubCategoryCodePromoted));
      const catCodeVal    = Number(toNum(product?.priceHtCategoryCodePromoted));
      const codePrice = Number.isFinite(subCatCodeVal)
        ? subCatCodeVal
        : (Number.isFinite(catCodeVal) ? catCodeVal : null);

      const displayPrice = calculPrice(product);
      const hasAnyPromo  = (codePrice != null) || (productPromoPrice != null);

      return {
        product,
        name,
        brand: String(product?.brand ?? ""),
        priceRef,
        displayPrice,
        hasAnyPromo,
        discountRate: priceRef > 0 ? (priceRef - displayPrice) / priceRef : 0,
        creationTs: parseDate(product?.creationDate)?.getTime() ?? 0,
      };
    });
  }, [products]);

  // Filtre + tri (par défaut = nouveautés)
  const filteredSortedAll = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = augmented.filter((a) => a.name.toLowerCase().includes(q));

    switch (sortKey) {
      case "name-asc":   list.sort((a, b) => a.name.localeCompare(b.name, "fr", { sensitivity: "base" })); break;
      case "name-desc":  list.sort((a, b) => b.name.localeCompare(a.name, "fr", { sensitivity: "base" })); break;
      case "price-asc":  list.sort((a, b) => a.displayPrice - b.displayPrice); break;
      case "price-desc": list.sort((a, b) => b.displayPrice - a.displayPrice); break;
      case "brand-asc":  list.sort((a, b) => a.brand.localeCompare(b.brand, "fr", { sensitivity: "base" })); break;
      case "brand-desc": list.sort((a, b) => b.brand.localeCompare(a.brand, "fr", { sensitivity: "base" })); break;
      case "date-asc":   list.sort((a, b) => a.creationTs - b.creationTs); break;
      case "promo-first":
        list.sort((a, b) =>
          (Number(b.hasAnyPromo) - Number(a.hasAnyPromo)) ||
          (b.discountRate - a.discountRate) ||
          (b.creationTs - a.creationTs)
        );
        break;
      case "discount-desc":
        list.sort((a, b) => (b.discountRate - a.discountRate) || (b.creationTs - a.creationTs));
        break;
      case "":
      default:
        list.sort((a, b) => b.creationTs - a.creationTs); // RÉCENT → ANCIEN
        break;
    }
    return list;
  }, [augmented, search, sortKey]);

  // Limite après filtre + tri
  const filteredLimited = useMemo(
    () => filteredSortedAll.slice(0, limit),
    [filteredSortedAll, limit]
  );

  // Banniere : image du produit le plus récent
  const heroUrl = useMemo(() => {
    const top = filteredSortedAll[0]?.product;
    return top ? getProductImage(top.id) : "/Images/placeholder.jpg";
  }, [filteredSortedAll]);

  // Modale “ajout au panier”
  const [showAdded, setShowAdded] = useState(false);
  const [lastAdded, setLastAdded] = useState(null);
  const closeAdded = () => setShowAdded(false);
  const goToCart = () => { setShowAdded(false); navigate("/cart"); };

  /* ---------- Barre filtre mobile (bouton sticky + sheet) ---------- */
  const [sheetOpen, setSheetOpen] = useState(false);
  const [portalNode, setPortalNode] = useState(null);

  useEffect(() => {
    const node = document.createElement("div");
    node.id = "mfb-portal-root";
    document.body.appendChild(node);
    setPortalNode(node);
    return () => { document.body.removeChild(node); };
  }, []);

  useEffect(() => {
    if (sheetOpen) document.body.classList.add("has-sheet-open");
    else document.body.classList.remove("has-sheet-open");
  }, [sheetOpen]);

  const badgeCount = Math.min(filteredLimited.length, 99);

  const MobileFilterPortal = portalNode
    ? ReactDOM.createPortal(
        <>
          <div className="mobile-filter-bar" role="presentation">
            <button
              type="button"
              className="mfb-btn"
              onClick={() => setSheetOpen(true)}
              aria-label="Affinez votre recherche"
            >
              Affinez votre recherche
              <span className="mfb-badge">{badgeCount}</span>
            </button>
          </div>

          <div
            className={`mfb-overlay ${sheetOpen ? "is-open" : ""}`}
            onClick={() => setSheetOpen(false)}
          />
          <div className={`mfb-sheet ${sheetOpen ? "is-open" : ""}`} role="dialog" aria-modal="true">
            <div className="mfb-sheet__handle" />
            <div className="mfb-sheet__title">Filtrer / Trier</div>

            <div className="sheet-fields">
              <input
                className="form-control"
                placeholder="Rechercher un produit…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className={`form-select ${sortKey === "" ? "is-placeholder" : ""}`}
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
              >
                <option value="" disabled>Trier les produits</option>
                <option value="date-desc">Nouveautés (récent → ancien)</option>
                <option value="date-asc">Plus ancien → récent</option>
                <option value="name-asc">Nom (A → Z)</option>
                <option value="name-desc">Nom (Z → A)</option>
                <option value="price-asc">Prix (moins cher → plus cher)</option>
                <option value="price-desc">Prix (plus cher → moins cher)</option>
                <option value="brand-asc">Marque (A → Z)</option>
                <option value="brand-desc">Marque (Z → A)</option>
                <option value="promo-first">Promotion (d’abord)</option>
                <option value="discount-desc">Réduction (forte → faible)</option>
              </select>
            </div>

            <div className="mfb-actions">
              <button
                type="button"
                className="btn btn--light"
                onClick={() => { setSearch(""); setSortKey(""); }}
              >
                Réinitialiser
              </button>
              <button type="button" className="btn btn--primary" onClick={() => setSheetOpen(false)}>
                Voir les résultats
              </button>
            </div>
          </div>
        </>,
        portalNode
      )
    : null;

  return (
    <div className="category-page">
      {/* HERO */}
      <section className="category-hero" style={{ "--hero-url": `url("${toMediaUrl(heroUrl)}")` }}>
        <h1 className="category-hero__title">Nouveautés</h1>
      </section>

      {/* Toolbar desktop (cachée en mobile via CSS existant) */}
      <div className="category-toolbar">
        <input
          className="form-control category-search"
          placeholder="Rechercher un produit…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={`form-select category-sort ${sortKey === "" ? "is-placeholder" : ""}`}
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
          title="Trier"
        >
          <option value="" disabled>Trier les produits</option>
          <option value="date-desc">Nouveautés (récent → ancien)</option>
          <option value="date-asc">Plus ancien → récent</option>
          <option value="name-asc">Nom (A → Z)</option>
          <option value="name-desc">Nom (Z → A)</option>
          <option value="price-asc">Prix (moins cher → plus cher)</option>
          <option value="price-desc">Prix (plus cher → moins cher)</option>
          <option value="brand-asc">Marque (A → Z)</option>
          <option value="brand-desc">Marque (Z → A)</option>
          <option value="promo-first">Promotion (d’abord)</option>
          <option value="discount-desc">Réduction (forte → faible)</option>
        </select>
      </div>

      {/* GRILLE */}
      <section className="new-section" id="news-products">
        <div className="new-grid">
          {filteredLimited.length === 0 && (
            <div style={{ padding: "2rem 0" }}>
              Aucun produit ne correspond à votre recherche.
            </div>
          )}

          {filteredLimited.map(({ product, name, priceRef, displayPrice, hasAnyPromo }) => {
            const img = getProductImage(product.id);
            const [euros, cents] = displayPrice.toFixed(2).split(".");

            const raw = (product?.stockStatus ?? "").trim();
            const lower = raw.toLowerCase();
            const isIn  = lower === "en stock";
            const isOut = lower === "en rupture";
            const stockCls = isIn ? "in" : isOut ? "out" : "warn";
            const stockLabel =
              lower.includes("plus que") ? "Bientôt en rupture" : raw || "Disponibilité limitée";

            return (
              <article key={product.id} className="product-card" data-aos="zoom-in">
                <div className="product-thumb">
                  <Link to={`/product/${product.id}`} className="thumb-link">
                    <img src={toMediaUrl(img)} alt={name} />
                  </Link>

                  {hasAnyPromo && <span className="promo-pill">Promotion</span>}

                  <div className="thumb-overlay" aria-hidden="true" />
                  {!isOut && (
                    <button
                      type="button"
                      className="thumb-add-btn"
                      title="Ajouter au panier"
                      aria-label="Ajouter au panier"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const payloadItem = {
                          id: product.id,
                          name,
                          price: displayPrice,
                          image: img,
                          packageProfil: product.packageProfil,
                          containedCode: product.containedCode
                        };
                        dispatch(addToCartRequest(payloadItem, 1));
                        setLastAdded({ id: product.id, name });
                        setShowAdded(true);
                      }}
                    >
                      <i className="bi bi-cart-plus" aria-hidden="true"></i>
                    </button>
                  )}
                </div>

                <h3 className="product-name">{name}</h3>

                <div className="new-price-row">
                  <span className={`card-stock ${stockCls}`}>
                    <span className={`card-stock-dot ${stockCls}`} />
                    {stockLabel}
                  </span>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", lineHeight: 1.1 }}>
                    {hasAnyPromo && (
                      <span className="price-old">
                        {priceRef.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                      </span>
                    )}
                    <div className={`product-price ${hasAnyPromo ? "product-price--promo" : ""}`}>
                      <span className="euros">{euros}€</span>
                      <sup className="cents">{cents}</sup>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Espace pour ne pas masquer le bas par le bouton mobile */}
      <div className="mobile-filter-spacer" />

      {/* Portail mobile (bouton + sheet) */}
      {MobileFilterPortal}

      {/* MODALE ajout panier */}
      <GenericModal
        open={showAdded}
        onClose={closeAdded}
        variant="success"
        title="Ajouté au panier"
        message={
          lastAdded?.name
            ? `${lastAdded.name} a bien été ajouté au panier.`
            : "Cet article a bien été ajouté au panier."
        }
        actions={[
          { label: "Continuer mes achats", variant: "light", onClick: closeAdded },
          { label: "Voir mon panier", variant: "primary", onClick: goToCart, autoFocus: true },
        ]}
      />
    </div>
  );
};
