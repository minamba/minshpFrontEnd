import React, { useMemo, useState, useEffect, useRef } from "react";
// import ReactDOM from "react-dom"; // plus nécessaire
import "../../styles/pages/category.css";
import { useSelector, useDispatch } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import { addToCartRequest, saveCartRequest } from "../../lib/actions/CartActions";
import { GenericModal } from "../../components";
import { toMediaUrl } from "../../lib/utils/mediaUrl";
import { calculPrice } from "../../lib/utils/Helpers";
import { getProductsPagedUserRequest } from "../../lib/actions/ProductActions";
import { ScrollHint } from "../../components";


/* -------------------- Helpers (définis ici) -------------------- */
const parseDate = (val) => {
  if (!val) return null;
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d;
};

const buildCategoryNameToId = (categories) => {
  const map = new Map();
  (categories || []).forEach((c) => {
    const id = c?.id ?? c?.categoryId ?? c?.idCategorie ?? c?.categorieId;
    const name = (c?.name ?? c?.title ?? "").toString().trim().toLowerCase();
    if (id != null && name) map.set(name, String(id));
  });
  return map;
};

const getCategoryIdFromProduct = (product, categories) => {
  const direct =
    product?.idCategory ??
    product?.categoryId ??
    product?.idCategorie ??
    product?.categorieId ??
    product?.category?.id ??
    product?.category;

  if (direct != null && (typeof direct === "number" || /^\d+$/.test(String(direct)))) {
    return String(direct);
  }

  const name = (product?.categoryName ?? product?.category ?? product?.categorie ?? "")
    .toString()
    .trim()
    .toLowerCase();
  if (!name) return null;

  const map = buildCategoryNameToId(categories);
  return map.get(name) ?? null;
};

const toNumOrNull = (v) => {
  if (v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : null;
};

/* id parent d'une sous-catégorie (tolérant) */
const getSubcatParentId = (sc) =>
  sc?.parentCategoryId ??
  sc?.idCategory ??
  sc?.categoryId ??
  sc?.idCategorie ??
  sc?.categorieId ??
  sc?.parentId ??
  sc?.idParent ??
  null;

const getSubcatName = (sc) => (sc?.name ?? sc?.title ?? `Sous-catégorie ${sc?.id ?? ""}`).toString();
const getCatName   = (c)  => (c?.name ?? c?.title ?? "Catégorie").toString();

/* -------------------- Component -------------------- */
export const Category = () => {
  const { id: routeCategoryId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /* Store */
  // ----- products can be in 'products' (full) or 'items' (paged)
  const prodState    = useSelector((s) => s.products) || {};
  const fullProducts = Array.isArray(prodState.products) ? prodState.products : [];
  const pagedItems   = Array.isArray(prodState.items)    ? prodState.items    : [];
  let productsAll  = fullProducts.length ? fullProducts : pagedItems;
  const promotionCodes = useSelector((s) => s.promotionCodes?.promotionCodes) || [];
  const loading      = !!prodState.loading;

  productsAll = productsAll.filter((p) => p.display === true);
  

  const images     = useSelector((s) => s.images?.images) || [];
  const items      = useSelector((s) => s.items?.items) || [];
  const categories = useSelector((s) => s.categories?.categories) || [];
  const subcategories = useSelector((s) => s.subCategories?.subCategories) || [];



  useEffect(() => {
    if (!routeCategoryId) return;
    dispatch(getProductsPagedUserRequest({
      page: 1,
      pageSize: 24,
      sort: "CreationDate:desc",
      filter: { IdCategory: routeCategoryId },
    }));
  }, [dispatch, routeCategoryId]);



    useEffect(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, [routeCategoryId]);

  /* Sauvegarde panier */
  useEffect(() => { dispatch(saveCartRequest(items)); }, [items, dispatch]);

  /* Catégorie courante + bannière */
  const currentCategory = useMemo(
    () => (categories || []).find((c) => String(c.id) === String(routeCategoryId)) || null,
    [categories, routeCategoryId]
  );

  const categoryBannerUrl = useMemo(() => {
    const byCat = images.find((i) => String(i.idCategory) === String(routeCategoryId));
    return byCat?.url || "/Images/placeholder.jpg";
  }, [images, routeCategoryId]);

  /* Image principale produit */
  const getProductImage = (productId) => {
    const productImages = images.filter((i) => String(i.idProduct) === String(productId));
    return productImages.length > 0 ? productImages[0].url : "/Images/placeholder.jpg";
  };

  /* Produits de la catégorie */
  const categoryProducts = useMemo(() => {
    if (!routeCategoryId) return [];
    return (productsAll || []).filter(
      (p) => String(getCategoryIdFromProduct(p, categories)) === String(routeCategoryId)
    );
  }, [productsAll, categories, routeCategoryId]);

  /* ---------- Recherche + tri ---------- */
  const [search, setSearch]   = useState("");
  const [sortKey, setSortKey] = useState(""); // placeholder

  const augmented = useMemo(() => {
    return categoryProducts.map((product, index) => {
      const name  = product.name || product.title || `Produit ${index + 1}`;
      const brand = (product.brand || "").toString();

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
        const endOfDay = end ? new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23,59,59,999) : null;
        if (start && start > now) return false;
        if (endOfDay && endOfDay < now) return false;
        return true;
      })();

      const productPct    = hasProductPromo ? Number(p0.purcentage) : 0;
      const computedPromo = +(priceRef * (1 - productPct / 100)).toFixed(2);
      const promotedVal   = toNumOrNull(
        typeof product.priceHtPromoted === "number"
          ? product.priceHtPromoted
          : parseFloat(product.priceHtPromoted)
      );
      const productPromoPrice = hasProductPromo
        ? (Number.isFinite(promotedVal) ? promotedVal : computedPromo)
        : null;

      const subCatCodeVal = toNumOrNull(
        typeof product.priceHtSubCategoryCodePromoted === "number"
          ? product.priceHtSubCategoryCodePromoted
          : parseFloat(product.priceHtSubCategoryCodePromoted)
      );
      const catCodeVal = toNumOrNull(
        typeof product.priceHtCategoryCodePromoted === "number"
          ? product.priceHtCategoryCodePromoted
          : parseFloat(product.priceHtCategoryCodePromoted)
      );

      const codePrice = (subCatCodeVal ?? catCodeVal);

      const displayPrice = calculPrice(product, promotionCodes);
      const hasAnyPromo  = (codePrice != null) || (productPromoPrice != null);

      const discountRate = priceRef > 0 ? (priceRef - displayPrice) / priceRef : 0;
      const discountPct  = +(discountRate * 100).toFixed(2);

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
        discountPct,
        creationTs
      };
    });
  }, [categoryProducts]);

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
        break;
    }
    return list;
  }, [augmented, search, sortKey]);

  /* ---------- Barre sous-catégories ---------- */
  const visibleSubcats = useMemo(() => {
    if (!routeCategoryId) return [];
    return (subcategories || []).filter(
      (sc) => String(getSubcatParentId(sc)) === String(routeCategoryId)
    );
  }, [subcategories, routeCategoryId]);

  const pills = useMemo(() => {
    const head = currentCategory
      ? [{ id: String(currentCategory.id), name: getCatName(currentCategory), type: "category" }]
      : [];
    const subs = visibleSubcats.map((sc) => ({
      id: String(sc.id),
      name: getSubcatName(sc),
      type: "sub",
    }));
    return [...head, ...subs];
  }, [currentCategory, visibleSubcats]);

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

  /* ---------- Modale “ajouté au panier” ---------- */
  const [showAdded, setShowAdded] = useState(false);
  const [lastAdded, setLastAdded] = useState(null);
  const closeAdded = () => setShowAdded(false);
  const goToCart  = () => { setShowAdded(false); navigate("/cart"); };

  /* ---------- Mobile sheet state (sans portal) ---------- */
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
      <section
        className="category-hero"
        style={{ "--hero-url": `url("${toMediaUrl(categoryBannerUrl)}")` }}
      >
        <h1 className="category-hero__title">{getCatName(currentCategory)}</h1>
      </section>

      {/* PILLS sous-catégories */}
      {pills.length > 0 && (
        <div className="subcat-bar">
          <button
            type="button"
            className={`pill-nav pill-nav--left ${canScrollLeft ? "" : "is-disabled"}`}
            onClick={() => scrollPills("left")}
            aria-label="Défiler vers la gauche"
          >
            ‹
          </button>

          <div className="pill-scroll" ref={pillsRef}>
            <ul className="pill-list" role="tablist" aria-label="Sous-catégories">
              {pills.map((p) => {
                const isCategoryPill = p.type === "category";
                const active = isCategoryPill && String(p.id) === String(routeCategoryId);
                return (
                  <li key={`${p.type}-${p.id}`} className="pill-item">
                    <button
                      type="button"
                      className={`pill ${active ? "pill--active" : ""}`}
                      onClick={() => {
                        if (isCategoryPill) {
                          if (!active) navigate(`/category/${p.id}`);
                        } else {
                          navigate(`/subcategory/${p.id}`);
                        }
                      }}
                    >
                      {p.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <button
            type="button"
            className={`pill-nav pill-nav--right ${canScrollRight ? "" : "is-disabled"}`}
            onClick={() => scrollPills("right")}
            aria-label="Défiler vers la droite"
          >
            ›
          </button>
        </div>
      )}

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
      <section className="new-section" id="category-products">
        <div className="new-grid">
          {filteredSorted.length === 0 && (
            <div style={{ padding: "2rem 0" }}>Aucun produit ne correspond à votre recherche.</div>
          )}

          {filteredSorted.map(({ product, name, priceRef, displayPrice, hasAnyPromo }) => {
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

      {/* ===== Barre mobile + Sheet (rendu direct, sans portal) ===== */}
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

      <ScrollHint />
    </div>
  );
};
