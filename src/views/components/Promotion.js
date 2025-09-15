import React, { useMemo, useState, useEffect } from "react";
import "../../App.css";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  addToCartRequest,
  saveCartRequest,
  updateCartRequest,
  getCartRequest,
} from "../../lib/actions/CartActions";
import { GenericModal } from "../../components";

/* ---------- Helpers ---------- */
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
const nearlyEqual = (a, b, eps = 1e-3) => Math.abs(Number(a) - Number(b)) <= eps;

/* ---------- Component ---------- */
export const Promotion = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Store
  const products = useSelector((s) => s.products?.products) || [];
  const images   = useSelector((s) => s.images?.images)     || [];
  const items    = useSelector((s) => s.items?.items)       || [];

  // Sauvegarde panier Redux -> LS à chaque changement
  useEffect(() => { dispatch(saveCartRequest(items)); }, [items, dispatch]);

  // Image principale du produit
  const getProductImage = (productId) => {
    const productImages = images.filter((i) => String(i.idProduct) === String(productId));
    return productImages.length > 0 ? productImages[0].url : "/Images/placeholder.jpg";
  };

  // ==== Calcul du prix affiché (même logique que la grille) ====
  const computeDisplayPrice = (product) => {
    if (!product) return 0;

    const priceRef =
      toNumOrNull(
        typeof product.priceTtc === "number" ? product.priceTtc : parseFloat(product.priceTtc)
      ) ?? 0;

    const p0 = product?.promotions?.[0];
    const hasProductPromo = (() => {
      if (!p0) return false;
      const pct = Number(p0.purcentage) || 0;
      if (pct <= 0) return false;
      const start = parseDate(p0.startDate);
      const end   = parseDate(p0.endDate);
      const now   = new Date();
      const endOfDay = end ? new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999) : null;
      if (start && start > now) return false;
      if (endOfDay && endOfDay < now) return false;
      return true;
    })();

    const productPct    = hasProductPromo ? Number(p0?.purcentage) : 0;
    const computedPromo = +(priceRef * (1 - productPct / 100)).toFixed(2);
    const promoted      = toNumOrNull(
      typeof product.priceTtcPromoted === "number"
        ? product.priceTtcPromoted
        : parseFloat(product.priceTtcPromoted)
    );

    const priceSubCat = toNumOrNull(
      typeof product.priceTtcSubCategoryCodePromoted === "number"
        ? product.priceTtcSubCategoryCodePromoted
        : parseFloat(product.priceTtcSubCategoryCodePromoted)
    );
    const priceCat = toNumOrNull(
      typeof product.priceTtcCategoryCodePromoted === "number"
        ? product.priceTtcCategoryCodePromoted
        : parseFloat(product.priceTtcCategoryCodePromoted)
    );

    let base = null;
    if (priceSubCat != null) base = priceSubCat;
    else if (priceCat != null) base = priceCat;
    else if (hasProductPromo) base = Number.isFinite(promoted) ? promoted : computedPromo;
    else base = priceRef;

    const displayPrice = base * (product.tva / 100 + 1) + product.taxWithoutTvaAmount;
    return +displayPrice.toFixed(2);
  };

  // ======= Sync LS + Redux quand les produits/promos changent =======
  const writeCartPriceToLocalStorage = (productId, newPrice) => {
    const ls = JSON.parse(localStorage.getItem("items") || "[]");
    const next = (Array.isArray(ls) ? ls : []).map((it) =>
      String(it.id) === String(productId) || String(it.productId) === String(productId)
        ? { ...it, price: Number(newPrice) }
        : it
    );
    localStorage.setItem("items", JSON.stringify(next));
    return next;
  };

  const syncCartPrice = (productId, newPrice) => {
    const inStore = (items || []).find(
      (ci) => String(ci.id) === String(productId) || String(ci.productId) === String(productId)
    );
    const qty = inStore?.qty ?? 1;

    if (inStore) {
      const updated = { ...inStore, id: inStore.id ?? inStore.productId, price: Number(newPrice) };
      dispatch(updateCartRequest(updated, qty));
    }
    writeCartPriceToLocalStorage(productId, newPrice);
    dispatch(getCartRequest());
  };

  useEffect(() => {
    // Recalcule tous les items du LS en fonction du store (produits/promos)
    const ls = JSON.parse(localStorage.getItem("items") || "[]");
    if (!Array.isArray(ls) || ls.length === 0) return;

    ls.forEach((it) => {
      const productId = it.productId ?? it.id;
      const prod = products.find((p) => String(p.id) === String(productId));
      if (!prod) return;

      const newPrice = computeDisplayPrice(prod);
      if (!nearlyEqual(it.price, newPrice)) {
        syncCartPrice(productId, newPrice);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]); // à chaque mise à jour produits/promos depuis le store

  /* ---------- Recherche + tri ---------- */
  const [search, setSearch]   = useState("");
  const [sortKey, setSortKey] = useState(""); // placeholder “Trier les produits”

  // Pré-calculs (prix/promo) puis filtre: on ne garde QUE les produits en promo
  const augmented = useMemo(() => {
    return (products || [])
      .map((product, index) => {
        const name  =
          product.name ||
          product.title ||
          `${product.brand || ""} ${product.model || ""}`.trim() ||
          `Produit ${index + 1}`;
        const brand = (product.brand || "").toString();

        const priceRef =
          toNumOrNull(
            typeof product.priceTtc === "number" ? product.priceTtc : parseFloat(product.priceTtc)
          ) ?? 0;

        // On réutilise le calcul unique pour le prix d’affichage
        const displayPrice = computeDisplayPrice(product);

        // Produit en promo si prix affiché < prix de référence
        const hasAnyPromo = displayPrice < priceRef - 1e-6;

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
          discountRate,     // 0..1
          creationTs,
        };
      })
      .filter((a) => a.hasAnyPromo); // seulement les produits en promo
  }, [products]);

  // Recherche + tri
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
      case "discount-desc":
        list.sort((a, b) => (b.discountRate - a.discountRate) || (b.creationTs - a.creationTs));
        break;
      case "": // placeholder : pas de tri
      default:
        break;
    }
    return list;
  }, [augmented, search, sortKey]);

  // Bannière (essaie de prendre l’image du 1er produit en promo, sinon placeholder)
  const bannerUrl = useMemo(() => {
    const firstPromo = filteredSorted[0]?.product;
    if (firstPromo) return getProductImage(firstPromo.id);
    return "/Images/placeholder.jpg";
  }, [filteredSorted, images]);

  /* ---------- Modal “ajouté au panier” ---------- */
  const [showAdded, setShowAdded] = useState(false);
  const [lastAdded, setLastAdded] = useState(null);
  const closeAdded = () => setShowAdded(false);
  const goToCart   = () => { setShowAdded(false); navigate("/cart"); };

  return (
    <div className="category-page">
      {/* BANNIÈRE — noir & blanc via CSS (::before + --hero-url) */}
      <section className="category-hero" style={{ "--hero-url": `url("${bannerUrl}")` }}>
        <h1 className="category-hero__title">Promotions</h1>
        <div className="category-hero__count">
          {filteredSorted.length} produit{filteredSorted.length > 1 ? "s" : ""}
        </div>
      </section>

      {/* BARRE D'OUTILS : recherche + tri (centrés) */}
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

      {/* GRILLE PRODUITS (style “Nouveautés”) */}
      <section className="new-section" id="promo-products">
        <div className="new-grid">
          {filteredSorted.length === 0 && (
            <div style={{ padding: "2rem 0" }}>Aucun produit en promotion pour le moment.</div>
          )}

          {filteredSorted.map(({ product, name, priceRef, displayPrice }) => {
            const img = getProductImage(product.id);
            const [euros, cents] = displayPrice.toFixed(2).split(".");

            const raw   = (product?.stockStatus ?? "").trim();
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
                    <img src={img} alt={name} />
                  </Link>

                  <span className="promo-pill">Promotion</span>

                  <div className="thumb-overlay" aria-hidden="true" />
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
                </div>

                <h3 className="product-name">{(product.brand || "") + " " + (product.model || name)}</h3>

                <div className="new-price-row">
                  <span className={`card-stock ${stockCls}`}>
                    <span className={`card-stock-dot ${stockCls}`} />
                    {stockLabel}
                  </span>

                  <div className="price-stack has-promo">
                    <span className="price-old">
                      {priceRef.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                    </span>
                    <div className="product-price product-price--promo">
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
    </div>
  );
};
