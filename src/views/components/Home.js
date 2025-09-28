import React, { useMemo, useState, useEffect } from 'react';
import "../../styles/components/product-card.css";
import "../../styles/pages/home.css";
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from "react-router-dom";
import { addToCartRequest, saveCartRequest } from '../../lib/actions/CartActions';
import { GenericModal } from '../../components';
import { calculPrice } from '../../lib/utils/Helpers';
import { toMediaUrl } from '../../lib/utils/mediaUrl';
import { getProductsPagedUserRequest } from '../../lib/actions/ProductActions';

export const Home = () => {
  const prodState     = useSelector((s) => s.products) || {};
  const fullProducts  = Array.isArray(prodState.products) ? prodState.products : [];
  const pagedItems    = Array.isArray(prodState.items)    ? prodState.items    : [];
  let allProducts   = fullProducts.length ? fullProducts : pagedItems;

  allProducts = allProducts.filter((p) => p.display === true);

  const images    = useSelector((state) => state.images.images) || [];
  const videos    = useSelector((state) => state.videos.videos) || [];
  const categoriesFromStore = useSelector((state) => state.categories.categories) || [];
  const items     = useSelector((state) => state.items.items) || [];
  const promotionCodes = useSelector((state) => state.promotionCodes.promotionCodes) || [];

  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const [showAdded, setShowAdded] = useState(false);
  const [lastAdded, setLastAdded] = useState(null);
  const [isMobile, setIsMobile]   = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(max-width: 768px)').matches
      : false
  );


  useEffect(() => {
    if (!fullProducts.length && !pagedItems.length) {
      dispatch(getProductsPagedUserRequest({
        page: 1,
        pageSize: 4,
        sort: "CreationDate:desc",
      }));
    }
  }, [dispatch, fullProducts.length, pagedItems.length]);


  useEffect(() => {
    const mm = window.matchMedia('(max-width: 768px)');
    const handler = (e) => setIsMobile(e.matches);
    if (mm.addEventListener) mm.addEventListener('change', handler);
    else mm.addListener(handler);
    return () => {
      if (mm.removeEventListener) mm.removeEventListener('change', handler);
      else mm.removeListener(handler);
    };
  }, []);

  useEffect(() => { dispatch(saveCartRequest(items)); }, [items, dispatch]);

  const NEW_MAX = 4;

  const mainProduct      = allProducts.find((p) => p.main === true) || null;
  const galleryProducts  = allProducts.filter((p) => p.id !== mainProduct?.id);

  // --- Media du produit principal ---
  const mainProductImages = mainProduct
    ? images.filter((i) => String(i.idProduct) === String(mainProduct.id))
    : [];

  const mainProductVideos = mainProduct
    ? videos.filter((v) => String(v.idProduct) === String(mainProduct.id))
    : [];

  // Vidéo "hero" (position 1)
  const heroVideo = mainProductVideos.find((vid) => Number(vid.position) === 1);

  // Image "hero" fallback (position 99)
  const heroImage99 = mainProductImages.find((img) => Number(img.position) === 99);

  // Bleu foncé fallback (SVG data URI)
  // const BLUE_FALLBACK =
  //   'data:image/svg+xml;utf8,' +
  //   encodeURIComponent(
  //     `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900">
  //        <rect width="100%" height="100%" fill="#0B1B3A"/>
  //      </svg>`
  //   );

  const IMAGE_FALLBACK = "/Images//background_fallback.png";


  const getProductImage = (id) => {
    const productImages = images.filter((i) => String(i.idProduct) === String(id));
    return productImages.length > 0 ? productImages[0].url : '/Images/placeholder.jpg';
  };

  const getCategoryImage = (idCategory) => {
    const image = images.find((i) => String(i.idCategory) === String(idCategory));
    return image ? image.url : '/Images/placeholder.jpg';
  };

  const parseDate = (val) => {
    if (!val) return null;
    const d = new Date(val);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const newestProducts = useMemo(() => {
    return [...allProducts]
      .sort((a, b) => (Date.parse(b?.creationDate || 0) - Date.parse(a?.creationDate || 0)))
      .slice(0, NEW_MAX);
  }, [allProducts]);

  const closeAdded = () => setShowAdded(false);
  const goToCart = () => { setShowAdded(false); navigate('/cart'); };

  // --- HERO: logique d’affichage ---
  const shouldShowVideo = !!heroVideo?.url && !isMobile;
  const heroImageSrc = heroImage99?.url
    ? toMediaUrl(heroImage99.url)
    : IMAGE_FALLBACK;

  return (
    <div className="home-container">
      {/* ===================== HERO ===================== */}
      <section className="hero-section">
        {shouldShowVideo ? (
          <video className="hero-video" autoPlay muted loop playsInline>
            <source src={toMediaUrl(heroVideo.url)} type="video/mp4" />
          </video>
        ) : (
          <img
            className="hero-image"
            src={heroImageSrc}
            alt={heroImage99?.title || 'Hero'}
          />
        )}

        <div className="hero-content text-center">
          <h1 className="hero-title">
            {heroVideo?.title || heroImage99?.title || 'Titre manquant'}
          </h1>
          <p className="hero-subtitle">
            {heroVideo?.description || heroImage99?.description || 'Description manquante'}
          </p>
          <a href="#features" className="hero-button">Découvrir</a>
        </div>
      </section>

      {/* ===================== FEATURES ===================== */}
      {mainProductImages.length > 0 && (
        <section className="features-section" id="features">
          {mainProductImages
            .filter((image) => image && Number(image.position) !== 99) // on évite de re-afficher la 99 ici
            .sort((a, b) => Number(a.position) - Number(b.position))
            .map((image, index) => (
              <div
                key={image.position}
                className={`feature ${index % 2 === 1 ? 'reverse' : ''}`}
                data-aos="fade-up"
              >
                <div className="feature-text">
                  <h2>{image.title || 'Titre manquant'}</h2>
                  <p>{image.description || 'Description manquante'}</p>
                </div>
                <img
                  src={toMediaUrl(image.url) || '/Images/placeholder.jpg'}
                  alt={image.title || `Image ${image.position}`}
                />
              </div>
            ))}

          <div className="features-cta">
            {mainProduct && (
              <Link to={`/product/${mainProduct.id}`} className="btn-pill btn-primary">
                En savoir plus
              </Link>
            )}
          </div>
        </section>
      )}

      {/* ===================== CATEGORIES ===================== */}
      {categoriesFromStore.length > 0 && (
        <section className="categories-section section-alt bg-light" id="categories">
          <div className="new-header">
            <h2 className="new-title">Catégories</h2>
          </div>

          <div
            className="categories-grid categories-carousel"
            role="list"
            aria-label="Catégories (balayez pour voir plus)"
          >
            {categoriesFromStore.map((cat) => (
              <article key={cat.id} className="category-card" data-aos="zoom-in">
                <h3 className="category-title">{cat.name}</h3>
                <img
                  src={toMediaUrl(getCategoryImage(cat.id))}
                  alt={`Catégorie ${cat.name}`}
                  className="category-image"
                  onClick={() => navigate(`/category/${cat.id}`)}
                />
              </article>
            ))}
          </div>

          {/* Indice “balayez” (visible en mobile via CSS) */}
          <div className="swipe-indicator" aria-hidden="true">
            <span className="chev">‹</span>
            <span className="swipe-text">Balayez</span>
            <span className="chev">›</span>
          </div>
        </section>
      )}

      {/* ===================== NOUVEAUTÉS ===================== */}
      <section className="new-section" id="nouveautes">
        <div className="new-header">
          <h2 className="new-title">Nouveautés</h2>
          <div className="new-actions">
            <button
              type="button"
              className="icon-btn bg-primary text-white fw-bold"
              aria-label="Voir plus"
              onClick={() => navigate('/news')}
            >
              +
            </button>
          </div>
        </div>

        <div className="new-grid" {...(isMobile ? { 'data-aos': 'fade-up', 'data-aos-once': 'true' } : {})}>
          {newestProducts.map((product, index) => {
            const img = getProductImage(product.id);
            const name =
              (product.brand ? `${product.brand} ` : '') +
              (product.model || product.title || `Produit ${index + 1}`);

            // Prix de référence
            const priceRef =
              Number(
                typeof product.priceTtc === 'number'
                  ? product.priceTtc
                  : parseFloat(product.priceTtc)
              ) || 0;

            // ==== PROMO PRODUIT (dates inclusives, fin à 23:59:59) ====
            const p0 = product?.promotions?.[0];
            const hasProductPromo = (() => {
              if (!p0) return false;
              const pct = Number(p0.purcentage) || 0;
              if (pct <= 0) return false;
              const start = parseDate(p0.startDate);
              const end = parseDate(p0.endDate);
              const now = new Date();
              const endOfDay = end
                ? new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999)
                : null;
              if (start && start > now) return false;
              if (endOfDay && endOfDay < now) return false;
              return true;
            })();

            const discountPct = hasProductPromo ? Number(p0.purcentage) : 0;
            const computedPromo = +(priceRef * (1 - discountPct / 100)).toFixed(2);
            const promotedVal = Number(
              typeof product.priceHtPromoted === 'number'
                ? product.priceHtPromoted
                : parseFloat(product.priceHtPromoted)
            );

            // Prix promo “produit” uniquement si la promo est ACTIVE
            const productPromoPrice = hasProductPromo
              ? (Number.isFinite(promotedVal) ? promotedVal : computedPromo)
              : null;

            // ==== PROMO PAR CODES (priorité sous-cat puis cat) ====
            const subCatCodeVal = Number(
              typeof product.priceHtSubCategoryCodePromoted === 'number'
                ? product.priceHtSubCategoryCodePromoted
                : parseFloat(product.priceHtSubCategoryCodePromoted)
            );
            const catCodeVal = Number(
              typeof product.priceHtCategoryCodePromoted === 'number'
                ? product.priceHtCategoryCodePromoted
                : parseFloat(product.priceHtCategoryCodePromoted)
            );

            const codePrice =
              Number.isFinite(subCatCodeVal)
                ? subCatCodeVal
                : (Number.isFinite(catCodeVal) ? catCodeVal : null);

            // ==== Prix affiché & indicateurs UI ====
            const displayPrice = calculPrice(product, promotionCodes);
            const hasAnyPromo = (codePrice != null) || (productPromoPrice != null);

            const [euros, cents] = displayPrice.toFixed(2).split('.');

            // Statut stock
            const raw = (product?.stockStatus ?? '').trim();
            const lower = raw.toLowerCase();
            const isIn = lower === 'en stock';
            const isOut = lower === 'en rupture';
            const stockCls = isIn ? 'in' : isOut ? 'out' : 'warn';
            const stockLabel =
              lower.includes('plus que') ? 'Bientôt en rupture' :
              raw || 'Disponibilité limitée';

            // 👉 Animation par carte : seulement desktop
            const cardAosProps = isMobile ? {} : { 'data-aos': 'zoom-in' };

            return (
              <article
                key={product.id}
                className="product-card"
                {...cardAosProps}
              >
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

                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', lineHeight:1.1 }}>
                  {hasAnyPromo && (
                    <span className="price-old">
                      {priceRef.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>
                  )}
                  <div className={`price ${hasAnyPromo ? 'price--promo' : ''}`}>
                    <span className="euros">{euros}€</span>
                    <sup className="cents">{cents}</sup>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>


        {/* Bouton “+” en bas sur mobile */}
        <div className="new-actions new-actions--mobile">
          <button
            type="button"
            className="icon-btn bg-primary text-white fw-bold"
            aria-label="Voir plus"
            onClick={() => navigate('/news')}
          >
            +
          </button>
        </div>
      </section>

      {/* ===================== MODALE ajout panier ===================== */}
      <GenericModal
        open={showAdded}
        onClose={closeAdded}
        variant="success"
        title="Ajouté au panier"
        message={
          lastAdded?.name
            ? `${lastAdded.name} a bien été ajouté au panier.`
            : 'Cet article a bien été ajouté au panier.'
        }
        actions={[
          { label: "Continuer mes achats", variant: "light", onClick: closeAdded },
          { label: "Voir mon panier", variant: "primary", onClick: goToCart, autoFocus: true },
        ]}
      />
    </div>
  );
};
