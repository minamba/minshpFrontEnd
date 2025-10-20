import React, { useMemo, useState, useEffect } from "react";
import "../../styles/pages/category.css";
import "../../styles/components/product-card.css";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { addToCartRequest, saveCartRequest } from "../../lib/actions/CartActions";
import { GenericModal } from "../../components";
import { toMediaUrl } from "../../lib/utils/mediaUrl";
import { calculPrice } from "../../lib/utils/Helpers";
import { getProductsPagedUserRequest } from "../../lib/actions/ProductActions";
import { getStockUiByProductId } from "../../lib/utils/stockUi";
import RatingStars from "../../lib/utils/RatingStars";

/* -------------------- Helpers -------------------- */
const parseDate = (val) => {
  if (!val) return null;
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d;
};
const toNumOrNull = (v) => {
  if (v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : null;
};

/* -------------------- Component -------------------- */
export const News = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /* Store */
  const prodState    = useSelector((s) => s.products) || {};
  const fullProducts = Array.isArray(prodState.products) ? prodState.products : [];
  const pagedItems   = Array.isArray(prodState.items)    ? prodState.items    : [];
  const promotionCodes = useSelector((s) => s.promotionCodes?.promotionCodes) || [];
  let productsAll  = fullProducts.length ? fullProducts : pagedItems;
  productsAll = productsAll.filter((p) => p.display === true);

  // respect des flags d’affichage des catégories/sous-catégories
  productsAll.forEach((p) => { if (p.subCategoryVm?.display === false) p.display = false; });
  productsAll.forEach((p) => { if (p.categoryVm?.display === false)    p.display = false; });

  const images = useSelector((s) => s.images?.images) || [];
  const items  = useSelector((s) => s.items?.items) || [];
  const stocks = useSelector((s) => s.stocks?.stocks) || [];

  /* Chargement initial (tri date desc) */
  useEffect(() => {
    dispatch(getProductsPagedUserRequest({
      page: 1,
      pageSize: 24,
      sort: "CreationDate:desc",
    }));
  }, [dispatch]);

  /* Remonter en haut */
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  /* Sauvegarde panier */
  useEffect(() => { dispatch(saveCartRequest(items)); }, [items, dispatch]);

  /* ===== Image vitrine (position 1 prioritaire) ===== */
  const getProductCoverImage = (productId) => {
    const productImages = images.filter((i) => String(i.idProduct) === String(productId));
    if (!productImages.length) return "/Images/placeholder.jpg";

    // 1) priorité à la position 1
    const pos1 = productImages.find((i) => Number(i.position) === 1 && i.url);
    if (pos1?.url) return pos1.url;

    // 2) sinon, plus petite position existante
    const sorted = [...productImages].sort(
      (a, b) => Number(a.position ?? 9999) - Number(b.position ?? 9999)
    );
    const first = sorted.find((i) => !!i.url);
    return first?.url || "/Images/placeholder.jpg";
  };

  /* ---------- Recherche + tri ---------- */
  const [search, setSearch]   = useState("");
  const [sortKey, setSortKey] = useState(""); // placeholder

  const augmented = useMemo(() => {
    return (productsAll || []).map((product, index) => {
      const name =
        [product?.brand, product?.model].filter(Boolean).join(" ") ||
        product?.title ||
        `Produit ${index + 1}`;

      const brand = (product?.brand || "").toString();

      const priceRef =
        toNumOrNull(
          typeof product?.priceTtc === "number" ? product.priceTtc : parseFloat(product?.priceTtc)
        ) ?? 0;

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
      const promotedVal   = toNumOrNull(
        typeof product?.priceHtPromoted === "number"
          ? product.priceHtPromoted
          : parseFloat(product?.priceHtPromoted)
      );
      const productPromoPrice = hasProductPromo
        ? (Number.isFinite(promotedVal) ? promotedVal : computedPromo)
        : null;

      const subCatCodeVal = toNumOrNull(
        typeof product?.priceHtSubCategoryCodePromoted === "number"
          ? product.priceHtSubCategoryCodePromoted
          : parseFloat(product?.priceHtSubCategoryCodePromoted)
      );
      const catCodeVal = toNumOrNull(
        typeof product?.priceHtCategoryCodePromoted === "number"
          ? product.priceHtCategoryCodePromoted
          : parseFloat(product?.priceHtCategoryCodePromoted)
      );

      const codePrice = (subCatCodeVal ?? catCodeVal);
      const displayPrice = calculPrice(product, promotionCodes);
      const hasAnyPromo  = (codePrice != null) || (productPromoPrice != null);

      const discountRate = priceRef > 0 ? (priceRef - displayPrice) / priceRef : 0;
      const creationTs = (() => {
        const d = parseDate(product?.creationDate);
        return d ? d.getTime() : 0;
      })();

      return {
        product,
        name,
        brand,
        priceRef,
        displayPrice,
        hasAnyPromo,
        discountRate,
        creationTs
      };
    });
  }, [productsAll, promotionCodes]);

  const filteredSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = augmented.filter((a) => a.name.toLowerCase().includes(q));

    switch (sortKey) {
      case "name-asc":
        list.sort((a, b) => a.name.localeCompare(b.name, "fr", { sensitivity: "base" }));
        break;
      case "name-desc":
        list.sort((a, b) => b.name.localeCompare(a.name, "fr", { sensitivity: "base" }));
        break;
      case "price-asc":
        list.sort((a, b) => a.displayPrice - b.displayPrice);
        break;
      case "price-desc":
        list.sort((a, b) => b.displayPrice - a.displayPrice);
        break;
      case "brand-asc":
        list.sort((a, b) => a.brand.localeCompare(b.brand, "fr", { sensitivity: "base" }));
        break;
      case "brand-desc":
        list.sort((a, b) => b.brand.localeCompare(a.brand, "fr", { sensitivity: "base" }));
        break;
      case "date-asc":
        list.sort((a, b) => a.creationTs - b.creationTs);
        break;
      case "date-desc":
        list.sort((a, b) => b.creationTs - a.creationTs);
        break;
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
      default:
        break; // laisse l'ordre backend
    }
    return list;
  }, [augmented, search, sortKey]);

  /* ---------- Héros : image vitrine position 1 du plus récent ---------- */
  const heroUrl = useMemo(() => {
    const top = filteredSorted[0]?.product || productsAll[0];
    return top ? getProductCoverImage(top.id) : "/Images/placeholder.jpg";
  }, [filteredSorted, productsAll]);

  /* ---------- Modale panier ---------- */
  const [showAdded, setShowAdded] = useState(false);
  const [lastAdded, setLastAdded] = useState(null);
  const closeAdded = () => setShowAdded(false);
  const goToCart  = () => { setShowAdded(false); navigate("/cart"); };

  /* ---------- Mobile sheet (sans portal) ---------- */
  const [sheetOpen, setSheetOpen] = useState(false);
  useEffect(() => {
    if (sheetOpen) document.body.classList.add("has-sheet-open");
    else document.body.classList.remove("has-sheet-open");
  }, [sheetOpen]);

  const badgeCount = Math.min(filteredSorted.length, 99);

  /* -------------------- Render -------------------- */
  return (
    <div className="category-page">
      {/* HERO */}
      <section className="category-hero" style={{ "--hero-url": `url("${toMediaUrl(heroUrl)}")` }}>
        <h1 className="category-hero__title">Nouveautés</h1>
      </section>

      {/* Toolbar desktop (cachée en mobile via CSS) */}
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

      {/* Grille produits */}
      <section className="new-section" id="news-products">
        <div className="new-grid">
          {filteredSorted.length === 0 && (
            <div style={{ padding: "2rem 0" }}>Aucun produit ne correspond à votre recherche.</div>
          )}

          {filteredSorted.map(({ product, name, priceRef, displayPrice, hasAnyPromo }) => {
            // >>>> image vitrine position 1 (fallback inclus)
            const img = getProductCoverImage(product.id);
            const [euros, cents] = displayPrice.toFixed(2).split(".");

            const { cls: stockCls, label: stockLabel, isOut } = getStockUiByProductId(stocks, product.id);

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
                          name: product.brand + ' ' + product.model,
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

                <h3 className="product-name">
                  {[product.brand, product.model].filter(Boolean).join(" ") || name}
                </h3>

                {product.previewDescription && (
                  <p className="product-preview text-muted" title={product.previewDescription}>
                    {product.previewDescription}
                  </p>
                )}

                <RatingStars
                  value={Number(product.rate) || 0}
                  count={product.numberRate || 0}
                  size="sm"
                />

                {/* === Bloc identique à Category : statut compressible + prix à droite === */}
                <div
                  className="new-price-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1fr) auto",
                    alignItems: "center",
                    columnGap: 8,
                    overflow: "hidden",
                  }}
                >
                  <span className={`card-stock ${stockCls}`} title={stockLabel}>
                    <span className={`card-stock-dot ${stockCls}`} />
                    <span className="card-stock-txt">{stockLabel}</span>
                  </span>

                  <div
                    className={`price-stack ${hasAnyPromo ? "has-promo" : ""}`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 2,
                      lineHeight: 1.15,
                    }}
                  >
                    {hasAnyPromo && (
                      <span className="price-old" style={{ margin: 0, fontSize: ".95rem" }}>
                        {priceRef.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                      </span>
                    )}
                    <div className={`price ${hasAnyPromo ? "price--promo" : ""}`}>
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

      {/* espace pour ne pas masquer le bas par le bouton mobile */}
      <div className="mobile-filter-spacer" />

      {/* ===== Barre mobile + Sheet (sans portal) ===== */}
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
          <button type="button" className="btn btn--primary bg-primary" onClick={() => setSheetOpen(false)}>
            Voir les résultats
          </button>
        </div>
      </div>
      {/* ===== Fin barre mobile ===== */}
    </div>
  );
};
