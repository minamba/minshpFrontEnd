// src/views/components/SubCategory.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import { addToCartRequest, saveCartRequest } from "../../lib/actions/CartActions";
import { GenericModal } from "../../components";
import { calculPrice } from "../../lib/utils/Helpers";
import { toMediaUrl } from "../../lib/utils/mediaUrl";
import { getProductsPagedUserRequest } from "../../lib/actions/ProductActions";

/* -------- Helpers -------- */
const parseDate = (v) => (v ? (isNaN(new Date(v)) ? null : new Date(v)) : null);
const toNumOrNull = (v) => {
  if (v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : null;
};

// ✅ Robust booleans (some APIs send string "true"/"false")
const toBool = (v) => {
  if (typeof v === "string") {
    const t = v.trim().toLowerCase();
    if (t === "true" || t === "1" || t === "yes" || t === "oui") return true;
    if (t === "false" || t === "0" || t === "no" || t === "non") return false;
  }
  return Boolean(v);
};

// ✅ Robust ID normalizers (handle id/Id/idProduct/IdProduct, etc.)
const getProductId = (p) =>
  Number(p?.id ?? p?.Id ?? p?.productId ?? p?.ProductId ?? NaN);

const getImageProductId = (img) =>
  Number(img?.idProduct ?? img?.IdProduct ?? img?.productId ?? img?.ProductId ?? NaN);

const getImageSubCategoryId = (img) =>
  Number(img?.idSubCategory ?? img?.IdSubCategory ?? img?.subCategoryId ?? img?.SubCategoryId ?? NaN);

const getSubCategoryIdFromProduct = (p) =>
  p?.idSubCategory ?? p?.subCategoryId ?? p?.IdSubCategory ?? p?.subcategoryId ?? p?.subCategory?.id ?? null;

const getSubcatParentId = (sc) =>
  sc?.parentCategoryId ?? sc?.idCategory ?? sc?.categoryId ?? sc?.idCategorie ?? sc?.categorieId ?? sc?.parentId ?? sc?.idParent ?? null;

// ✅ Display flag on products (display/Display/published/Published)
const getDisplayFromProduct = (p) => toBool(p?.display ?? p?.Display ?? p?.published ?? p?.Published);

/* -------- Component -------- */
export const SubCategory = () => {
  const { id: routeSubCategoryId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [routeSubCategoryId]);

  // --- Store produits: full (products) OU paginé (items)
  const prodState    = useSelector((s) => s.products) || {};
  const fullProducts = Array.isArray(prodState.products) ? prodState.products : [];
  const pagedItems   = Array.isArray(prodState.items)    ? prodState.items    : [];

  let productsAll  = fullProducts.length ? fullProducts : pagedItems;
  const loading    = !!prodState.loading;

  // ✅ Montre uniquement les produits réellement affichables
  productsAll = productsAll.filter((p) => getDisplayFromProduct(p) === true);

  const images        = useSelector((s) => s.images?.images) || [];
  const items         = useSelector((s) => s.items?.items) || [];
  const subCategories = useSelector((s) => s.subCategories?.subCategories) || [];
  const categories    = useSelector((s) => s.categories?.categories) || [];

  // Sauvegarde panier
  useEffect(() => { dispatch(saveCartRequest(items)); }, [items, dispatch]);

  // ---------- (Re)fetch quand l’onglet change ----------
  useEffect(() => {
    if (!routeSubCategoryId) return;

    const isSub = subCategories.some((sc) => String(sc.id) === String(routeSubCategoryId));
    const isCat = categories.some((c) => String(c.id) === String(routeSubCategoryId));

    dispatch(
      getProductsPagedUserRequest({
        page: 1,
        pageSize: 24,
        sort: "CreationDate:desc",
        filter: isSub
          ? { IdSubCategory: routeSubCategoryId }
          : isCat
          ? { IdCategory: routeSubCategoryId }
          : undefined,
      })
    );
  }, [dispatch, routeSubCategoryId, categories, subCategories]);

  // ---------- Sous-catégorie / parent / pills ----------
  const currentSubCategory =
    (subCategories || []).find((sc) => String(sc.id) === String(routeSubCategoryId)) || null;

  const parentCategory = useMemo(() => {
    if (!currentSubCategory) return null;
    const pid = getSubcatParentId(currentSubCategory);
    if (pid == null) return null;
    return (categories || []).find((c) => String(c.id) === String(pid)) || null;
  }, [currentSubCategory, categories]);

  const siblingSubcats = useMemo(() => {
    if (!currentSubCategory) return [];
    const parentId = getSubcatParentId(currentSubCategory);
    return (subCategories || []).filter((sc) => String(getSubcatParentId(sc)) === String(parentId));
  }, [subCategories, currentSubCategory]);

  const pills = useMemo(() => {
    if (!currentSubCategory) return [];
    const res = [];
    if (parentCategory) {
      res.push({ id: String(parentCategory.id), name: parentCategory.name || parentCategory.title || "Catégorie", type: "category" });
    }
    res.push({ id: String(currentSubCategory.id), name: currentSubCategory.name || currentSubCategory.title || "Sous-catégorie", type: "sub" });
    for (const sc of siblingSubcats) {
      if (String(sc.id) !== String(currentSubCategory.id)) {
        res.push({ id: String(sc.id), name: sc.name || sc.title || `Sous-catégorie ${sc.id}`, type: "sub" });
      }
    }
    return res;
  }, [parentCategory, currentSubCategory, siblingSubcats]);

  // Scroll pills
  const pillsRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const updatePillScrollState = () => {
    const el = pillsRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };
  useEffect(() => { updatePillScrollState(); }, [pills.length]);
  useEffect(() => {
    const el = pillsRef.current;
    if (!el) return;
    el.addEventListener("scroll", updatePillScrollState, { passive: true });
    window.addEventListener("resize", updatePillScrollState);
    return () => {
      el.removeEventListener("scroll", updatePillScrollState);
      window.removeEventListener("resize", updatePillScrollState);
    };
  }, []);
  const scrollPills = (dir) => {
    const el = pillsRef.current;
    if (!el) return;
    const delta = Math.round(el.clientWidth * 0.8) * (dir === "right" ? 1 : -1);
    el.scrollBy({ left: delta, behavior: "smooth" });
  };
  const goTo = (p) => navigate(p.type === "category" ? `/category/${p.id}` : `/subcategory/${p.id}`);

  // ✅ Bannière — robust idSubCategory + placeholder en minuscule
  const subCategoryBannerUrl = useMemo(() => {
    const bySubCat = images.find((i) => getImageSubCategoryId(i) === Number(routeSubCategoryId));
    return bySubCat?.url || "/images/placeholder.jpg";
  }, [images, routeSubCategoryId]);

  // ✅ Image produit — robust idProduct + placeholder en minuscule
  const getProductImage = (productId) => {
    const pid = Number(productId);
    const first = images.find((i) => getImageProductId(i) === pid);
    return first?.url || "/images/placeholder.jpg";
  };

  const promotionCodes  = useSelector((s) => s.promotionCodes?.promotionCodes) || [];

  // ---------- Sélection produits ----------
  const subCategoryProducts = useMemo(() => {
    if (!routeSubCategoryId) return [];

    const isSub = subCategories.some((sc) => String(sc.id) === String(routeSubCategoryId));
    const isCat = categories.some((c) => String(c.id) === String(routeSubCategoryId));

    if (!productsAll.length) return [];

    return productsAll.filter((p) => {
      const subId = getSubCategoryIdFromProduct(p);
      const catId = p?.idCategory ?? p?.categoryId;

      if (isSub) return String(subId) === String(routeSubCategoryId);

      if (isCat) {
        const subIds = subCategories
          .filter((sc) => String(getSubcatParentId(sc)) === String(routeSubCategoryId))
          .map((sc) => String(sc.id));
        return String(catId) === String(routeSubCategoryId) || subIds.includes(String(subId));
      }
      return false;
    });
  }, [productsAll, routeSubCategoryId, categories, subCategories]);

  /* ---------- Recherche + tri ---------- */
  const [search, setSearch]   = useState("");
  const [sortKey, setSortKey] = useState("");

  const augmented = useMemo(() => {
    return subCategoryProducts.map((product, index) => {
      const name  = product.name || product.title || `Produit ${index + 1}`;
      const brand = (product.brand || "").toString();

      const priceRef =
        toNumOrNull(typeof product.priceTtc === "number" ? product.priceTtc : parseFloat(product.priceTtc)) ?? 0;

      const p0 = product?.promotions?.[0];
      const hasProductPromo = (() => {
        if (!p0) return false;
        const pct = Number(p0.purcentage) || 0;
        if (pct <= 0) return false;
        const start = parseDate(p0.startDate);
        const end   = parseDate(p0.endDate);
        const now   = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0,0,0,0);
        if (start && start.getTime() > now.getTime()) return false;
        if (end && end.getTime() < startOfToday.getTime()) return false;
        return true;
      })();

      const priceCat = (() => {
        const { priceHtSubCategoryCodePromoted, priceHtCategoryCodePromoted, priceHtPromoted } = product;
        let dPrice = null;
        if (priceHtSubCategoryCodePromoted !== null) dPrice = priceHtSubCategoryCodePromoted;
        if (priceHtCategoryCodePromoted !== null && priceHtSubCategoryCodePromoted == null) dPrice = priceHtCategoryCodePromoted;
        if (priceHtPromoted !== null && priceHtCategoryCodePromoted == null && priceHtSubCategoryCodePromoted == null) dPrice = priceHtPromoted;
        return toNumOrNull(dPrice);
      })();

      const displayPrice = calculPrice(product, promotionCodes);
      const hasAnyPromo  = priceCat != null || hasProductPromo;

      const creationTs = (() => {
        const d = parseDate(product?.creationDate);
        return d ? d.getTime() : 0;
      })();

      const discountRate = priceRef > 0 ? (priceRef - displayPrice) / priceRef : 0;
      const discountPct  = +(discountRate * 100).toFixed(2);

      return { product, name, brand, priceRef, displayPrice, hasAnyPromo, discountRate, discountPct, creationTs };
    });
  }, [subCategoryProducts, promotionCodes]);

  const filteredSorted = useMemo(() => {
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
      case "date-desc":  list.sort((a, b) => b.creationTs - a.creationTs); break;
      case "promo-first":
        list.sort((a, b) =>
          (Number(b.hasAnyPromo) - Number(a.hasAnyPromo)) ||
          (b.discountRate - a.discountRate) ||
          (b.creationTs - a.creationTs)
        ); break;
      case "discount-desc":
        list.sort((a, b) => (b.discountRate - a.discountRate) || (b.creationTs - a.creationTs)); break;
      default: break;
    }
    return list;
  }, [augmented, search, sortKey]);

  /* ---------- Modal panier ---------- */
  const [showAdded, setShowAdded] = useState(false);
  const [lastAdded, setLastAdded] = useState(null);
  const closeAdded = () => setShowAdded(false);
  const goToCart   = () => { setShowAdded(false); navigate("/cart"); };

  /* ---------- Mobile sheet ---------- */
  const [sheetOpen, setSheetOpen] = useState(false);
  useEffect(() => {
    if (sheetOpen) document.body.classList.add("has-sheet-open");
    else document.body.classList.remove("has-sheet-open");
  }, [sheetOpen]);

  const badgeCount = Math.min(filteredSorted.length, 99);

  return (
    <div className="category-page">
      {/* Bannière */}
      <section
        className="category-hero"
        style={{ "--hero-url": `url("${toMediaUrl(subCategoryBannerUrl)}")` }}
      >
        <h1 className="category-hero__title">
          {currentSubCategory?.name || currentSubCategory?.title || "Sous-catégorie"}
        </h1>
      </section>

      {/* Pills */}
      {pills.length > 0 && (
        <div className="subcat-bar" style={{ marginBottom: 16 }}>
          <button type="button" className={`pill-nav pill-nav--left ${canScrollLeft ? "" : "is-disabled"}`} onClick={() => scrollPills("left")} aria-label="Défiler vers la gauche">‹</button>
          <div className="pill-scroll" ref={pillsRef}>
            <ul className="pill-list" role="tablist" aria-label="Navigation sous-catégories">
              {pills.map((p) => {
                const isActive = p.type === "sub" && String(p.id) === String(routeSubCategoryId);
                return (
                  <li key={`${p.type}-${p.id}`} className="pill-item">
                    <button type="button" className={`pill ${isActive ? "pill--active" : ""}`} onClick={() => goTo(p)} title={p.name}>
                      {p.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <button type="button" className={`pill-nav pill-nav--right ${canScrollRight ? "" : "is-disabled"}`} onClick={() => scrollPills("right")} aria-label="Défiler vers la droite">›</button>
        </div>
      )}

      {/* Toolbar */}
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
        >
          <option value="" disabled>Trier les produits</option>
          <option value="date-desc">Nouveautés</option>
          <option value="date-asc">Plus ancien</option>
          <option value="name-asc">Nom (A→Z)</option>
          <option value="name-desc">Nom (Z→A)</option>
          <option value="price-asc">Prix (croissant)</option>
          <option value="price-desc">Prix (décroissant)</option>
          <option value="brand-asc">Marque (A→Z)</option>
          <option value="brand-desc">Marque (Z→A)</option>
          <option value="promo-first">Promotion d’abord</option>
          <option value="discount-desc">Réduction forte→faible</option>
        </select>
      </div>

      {/* Grille */}
      <section className="new-section" id="subcategory-products">
        <div className="new-grid">
          {loading && !productsAll.length && (
            <div style={{ padding: "2rem 0" }}>Chargement…</div>
          )}

          {!loading && filteredSorted.length === 0 && (
            <div style={{ padding: "2rem 0" }}>Aucun produit ne correspond à votre recherche.</div>
          )}

          {filteredSorted.map(({ product, name, priceRef, displayPrice, hasAnyPromo }) => {
            const pid = getProductId(product);
            const img = getProductImage(pid);
            const [euros, cents] = displayPrice.toFixed(2).split(".");
            const raw = (product?.stockStatus ?? "").trim();
            const lower = raw.toLowerCase();
            const isIn  = lower === "en stock";
            const isOut = lower === "en rupture";
            const stockCls = isIn ? "in" : isOut ? "out" : "warn";
            const stockLabel = lower.includes("plus que") ? "Bientôt en rupture" : raw || "Disponibilité limitée";

            return (
              <article key={pid} className="product-card" data-aos="zoom-in">
                <div className="product-thumb">
                  <Link to={`/product/${pid}`} className="thumb-link">
                    <img src={toMediaUrl(img)} alt={name} />
                  </Link>
                  {hasAnyPromo && <span className="promo-pill">Promotion</span>}
                  <div className="thumb-overlay" />
                  {!isOut && (
                    <button
                      type="button"
                      className="thumb-add-btn"
                      onClick={(e) => {
                        e.preventDefault(); e.stopPropagation();
                        const payloadItem = { id: pid, name, price: displayPrice, image: img, packageProfil: product.packageProfil, containedCode: product.containedCode };
                        dispatch(addToCartRequest(payloadItem, 1));
                        setLastAdded({ id: pid, name });
                        setShowAdded(true);
                      }}
                    >
                      <i className="bi bi-cart-plus" />
                    </button>
                  )}
                </div>
                <h3 className="product-name">{product.brand + " " + product.model}</h3>

                {product.previewDescription && (
                  <p className="product-desc text-muted" title={product.previewDescription}>
                    {product.previewDescription}
                  </p>
                )}
                <div className="new-price-row">
                  <span className={`card-stock ${stockCls}`}>
                    <span className={`card-stock-dot ${stockCls}`} />
                    {stockLabel}
                  </span>
                  <div className={`price-stack ${hasAnyPromo ? "has-promo" : ""}`}>
                    {hasAnyPromo && (
                      <span className="price-old">
                        {priceRef.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                      </span>
                    )}
                    <div className={`price ${hasAnyPromo ? "product-price--promo" : ""}`}>
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

      {/* Modal panier */}
      <GenericModal
        open={showAdded}
        onClose={closeAdded}
        variant="success"
        title="Ajouté au panier"
        message={lastAdded?.name ? `${lastAdded.name} a bien été ajouté au panier.` : "Ajouté au panier."}
        actions={[
          { label: "Continuer mes achats", variant: "light", onClick: closeAdded },
          { label: "Voir mon panier", variant: "primary", onClick: goToCart, autoFocus: true },
        ]}
      />

      <div className="mobile-filter-spacer" />

      {/* Barre mobile */}
      <div className="mobile-filter-bar" role="presentation">
        <button type="button" className="mfb-btn" onClick={() => setSheetOpen(true)} aria-label="Affinez votre recherche">
          Affinez votre recherche
          <span className="mfb-badge">{badgeCount}</span>
        </button>
      </div>

      <div className={`mfb-overlay ${sheetOpen ? "is-open" : ""}`} onClick={() => setSheetOpen(false)} />
      <div className={`mfb-sheet ${sheetOpen ? "is-open" : ""}`} role="dialog" aria-modal="true">
        <div className="mfb-sheet__handle" />
        <div className="mfb-sheet__title">Filtrer / Trier</div>
        <div className="sheet-fields">
          <input className="form-control" placeholder="Rechercher un produit…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className={`form-select ${sortKey === "" ? "is-placeholder" : ""}`} value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
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
          <button type="button" className="btn btn--light" onClick={() => { setSearch(""); setSortKey(""); }}>
            Réinitialiser
          </button>
          <button type="button" className="btn btn--primary bg-primary" onClick={() => setSheetOpen(false)}>
            Voir les résultats
          </button>
        </div>
      </div>
    </div>
  );
};
