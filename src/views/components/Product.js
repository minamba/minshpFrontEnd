import React, { useMemo, useState, useEffect, useRef } from 'react';
import '../../App.css';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductSpecs } from '../../components/index';
import { addToCartRequest, saveCartRequest } from '../../lib/actions/CartActions';
import { GenericModal } from '../../components/index';

export const Product = () => {
  const { id } = useParams();
  const pid = Number(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [id]);

  // Store
  const products        = useSelector((s) => s.products.products) || [];
  const images          = useSelector((s) => s.images.images) || [];
  const videos          = useSelector((s) => s.videos?.videos) || [];
  const items           = useSelector((s) => s.items.items) || [];
  const promotionCodes  = useSelector((s) => s.promotionCodes.promotionCodes) || [];

  // Save cart
  useEffect(() => {
    dispatch(saveCartRequest(items));
  }, [items, dispatch]);

  // Produit courant
  const product = useMemo(
    () => products.find((p) => String(p.id) === String(id)) || products[0],
    [products, id]
  );

  // (optionnel) promo liée à la catégorie si tu en as besoin ailleurs
  const promotion = useMemo(
    () => promotionCodes.find((p) => String(p.id) === String(product?.idPromotionCode)) || null,
    [promotionCodes, product]
  );

  // Images
  const productImages = useMemo(() => {
    if (!product) return [];
    const list = images.filter((i) => i.idProduct === product.id);
    return list.length ? list : [{ url: '/Images/placeholder.jpg', position: 1 }];
  }, [images, product]);

  // Vidéos
  const productVideos = useMemo(() => {
    if (!product) return [];
    return (videos || []).filter((v) => v.idProduct === product.id && v.position === 2);
  }, [videos, product]);

  const heroVideo = useMemo(
    () => productVideos.find((v) => v.position === 1) || productVideos[0],
    [productVideos]
  );

  const hasVideo = useMemo(
    () => Boolean(heroVideo?.url && String(heroVideo.url).trim() !== ''),
    [heroVideo]
  );

  // Galerie
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentImage = productImages[currentIndex]?.url || '/Images/placeholder.jpg';
  const [mainLoaded, setMainLoaded] = useState(false);
  useEffect(() => setMainLoaded(false), [currentImage]);

  // Lightbox
  const [isLightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const openLightbox  = (idx) => { setLightboxIndex(idx); setLightboxOpen(true); };
  const closeLightbox = () => setLightboxOpen(false);
  const prev = () => setLightboxIndex((i) => (i - 1 + productImages.length) % productImages.length);
  const next = () => setLightboxIndex((i) => (i + 1) % productImages.length);

  useEffect(() => {
    if (!isLightboxOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isLightboxOpen]);

  // ===== PROMO / PRIX =====
  const toNum = (x) => {
    const n = typeof x === 'number' ? x : parseFloat(x);
    return Number.isFinite(n) ? n : null;
  };

  const priceRef = useMemo(() => toNum(product?.priceTtc) ?? 0, [product]);

  const parseDate = (val) => {
    if (!val) return null;
    const d = new Date(val);
    return Number.isNaN(d.getTime()) ? null : d;
  };
  const formatEndShort = (val) => {
    const d = parseDate(val);
    if (!d) return null;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}`;
  };

  // Promo PRODUIT (première active)
  const rawFirstPromo = product?.promotions?.[0] ?? null;
  const activePromo = useMemo(() => {
    if (!rawFirstPromo) return null;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const start = parseDate(rawFirstPromo.startDate);
    const end   = parseDate(rawFirstPromo.endDate);
    const pct   = Number(rawFirstPromo.purcentage) || 0;
    if (pct <= 0) return null;
    if (start && start.getTime() > now.getTime()) return null;
    if (end && end.getTime() < startOfToday.getTime()) return null;
    return rawFirstPromo;
  }, [rawFirstPromo]);

  const promoUntil = activePromo?.endDate ? formatEndShort(activePromo.endDate) : null;

  // ---- RÈGLE DEMANDÉE ----
  // 1) Si priceTtcCategoryCodePromoted est défini => on l’affiche
  const priceFromCategoryCode = toNum(product?.priceTtcCategoryCodePromoted);

  // 2) Si priceTtcSubCategoryCodePromoted est défini => on l’affiche
  const priceFromSubCategoryCode = toNum(product?.priceTtcSubCategoryCodePromoted);

  // 2) Si purcentageCodePromoted est défini => le badge affiche ce pourcentage
  const pctFromCategoryCode = product?.purcentageCodePromoted != null && product.purcentageCodePromoted !== ''
    ? Number(product.purcentageCodePromoted)
    : null;

  // Fallbacks
  const productPromoPct = activePromo ? Number(activePromo.purcentage) || 0 : 0;

  // Prix si promo produit uniquement
  const discountedPriceProduct = useMemo(() => {
    if (!activePromo) return priceRef;
    const p = toNum(product?.priceTtcPromoted);
    if (p != null) return p;
    return +(priceRef * (1 - productPromoPct / 100)).toFixed(2);
  }, [activePromo, product, priceRef, productPromoPct]);

  // Prix affiché (priorité au prix de code catégorie s’il existe)
  const displayPrice = useMemo(() => {
    if (priceFromSubCategoryCode != null) return priceFromSubCategoryCode;
    if (priceFromCategoryCode != null && priceFromSubCategoryCode == null) return priceFromCategoryCode;
    return discountedPriceProduct;
  }, [priceFromCategoryCode, discountedPriceProduct]);

  // Pourcentage affiché sur le badge (priorité au % de code catégorie s’il existe)
  const badgePct = pctFromCategoryCode ?? productPromoPct;
  const showBadge = Number.isFinite(badgePct) && badgePct > 0;

  const hasPrice = Number.isFinite(displayPrice);
  const [eurosStr, centsStr] = hasPrice ? displayPrice.toFixed(2).split('.') : ['0', '00'];
  const euros = eurosStr;
  const cents = centsStr;

  // ===== STOCK =====
  const stockStatusRaw = (product?.stockStatus ?? '').trim();
  const stockIn  = stockStatusRaw.toLowerCase() === 'en stock';
  const stockOut = stockStatusRaw.toLowerCase() === 'en rupture';
  const stockStatusLabel = stockStatusRaw || 'Disponibilité limitée';
  const stockRowClass = stockIn ? 'stock-in' : stockOut ? 'stock-out' : 'stock-warn';
  const stockDotClass = stockIn ? 'in' : stockOut ? 'out' : 'warn';

  // Achat
  const [qty, setQty] = useState(1);
  const [showAdded, setShowAdded] = useState(false);
  const addToCart = () => {
    if (!product) return;
    const payloadItem = {
      id: product.id,
      name: product.name || product.title,
      price: displayPrice,
      image: currentImage,
      packageProfil: product.packageProfil,
      containedCode: product.containedCode,
    };
    dispatch(addToCartRequest(payloadItem, qty));
    setShowAdded(true);
  };
  const closeAdded = () => setShowAdded(false);
  const goToCart = () => { setShowAdded(false); navigate('/cart'); };

  // Specs
  const specs = ProductSpecs(pid);

  // Vidéo autoplay
  const videoRef = useRef(null);
  useEffect(() => {
    if (!hasVideo || !videoRef.current) return;
    const v = videoRef.current;
    v.muted = true;
    const tryPlay = v.play();
    if (tryPlay && typeof tryPlay.then === 'function') {
      tryPlay.catch(() => {
        const onCanPlay = () => {
          v.play().catch(() => {});
          v.removeEventListener('canplay', onCanPlay);
        };
        v.addEventListener('canplay', onCanPlay);
      });
    }
  }, [hasVideo, heroVideo?.url]);

  const handleContextMenu = (e) => e.preventDefault();

  return (
    <div className="product-page" onContextMenu={handleContextMenu}>
      {/* Zone haute: galerie + infos achat */}
      <div className="product-main">
        {/* Vignettes */}
        <div className="thumbs-col">
          {productImages.map((img, idx) => (
            <button
              key={img.position || idx}
              className="thumb"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Voir image ${idx + 1}`}
              type="button"
            >
              <img loading="lazy" src={img.url} alt={`Miniature ${idx + 1} de ${product?.name || 'Produit'}`} />
            </button>
          ))}
        </div>

        {/* Image principale */}
        <div className="product-main-image-wrap" onClick={() => openLightbox(currentIndex)} role="button" tabIndex={0}>
          {!mainLoaded && <div className="img-skeleton" aria-hidden="true" />}
          <img
            className={`product-main-image ${mainLoaded ? 'is-loaded' : ''}`}
            src={currentImage}
            alt={product?.name || 'Produit'}
            onLoad={() => setMainLoaded(true)}
          />
        </div>

        {/* Détails */}
        <div className="product-details">
          <p className="product-brand">{product?.brand || ''}</p>

          <h1 className="product-title product-title--center">
            {product?.brand + ' ' + product?.model || product?.title || 'Produit'}
          </h1>

          <div className="details-stack">
            {hasPrice && (
              <>
                {/* Prix de référence + badge : on affiche le badge si un pourcentage est disponible */}
                {showBadge && (
                  <div className="refprice-wrap">
                    <div className="refprice-label">Prix de référence</div>
                    <div className="refprice-row">
                      <span className="refprice-old">
                        {priceRef.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </span>
                      <span className="refprice-badge">-{badgePct}%</span>
                    </div>
                  </div>
                )}

                {/* Prix affiché (priorité prix de code catégorie si présent) */}
                <div className="product-price">
                  <span className="euros">{euros}€</span>
                  <sup className="cents">{cents}</sup>
                </div>

                {/* Jusqu’au … inclus : on garde l’info uniquement pour la promo produit */}
                {activePromo && promoUntil && (
                  <div className="promo-until">
                    Jusqu'au {promoUntil} inclus
                  </div>
                )}

                <p className="price-lead">
                  <em>{product?.taxWithoutTvaAmount}</em>
                </p>

                <p className="product-description">
                  Taxes incluses&nbsp;–&nbsp;Frais de livraison calculés lors du paiement.
                </p>
              </>
            )}

            {/* Statut de stock */}
            <div className={`stock-row ${stockRowClass}`}>
              <span className={`stock-dot ${stockDotClass}`} /> <span>{stockStatusLabel}</span>
            </div>

            <div className="buy-row">
              <select
                className="qty-select"
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                aria-label="Quantité"
              >
                {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>

              <button className="buy-button buy-accent" onClick={addToCart}>
                🛍️&nbsp;Ajouter au panier
              </button>
            </div>

            <ul className="trust-list">
              <li><span className="trust-ico" aria-hidden="true">📦</span> Envoi sous 24h</li>
              <li><span className="trust-ico" aria-hidden="true">🚚</span> Livraison rapide et sécurisée</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={closeLightbox}>
          <button className="lb-close" type="button" aria-label="Fermer" onClick={closeLightbox}>×</button>
          <button className="lb-prev"  type="button" aria-label="Précédent" onClick={(e) => { e.stopPropagation(); prev();  }}>‹</button>
          <img
            className="lb-img"
            src={productImages[lightboxIndex]?.url}
            alt={`Image ${lightboxIndex + 1} de ${product?.name || 'Produit'}`}
            onClick={(e) => e.stopPropagation()}
          />
          <button className="lb-next"  type="button" aria-label="Suivant" onClick={(e) => { e.stopPropagation(); next(); }}>›</button>
        </div>
      )}

      {/* Description */}
      <section className="product-desc">
        <h2>Description</h2>
        <p>
          {product?.description ||
            'Découvrez ce produit au design soigné et aux performances solides. Idéal pour un usage quotidien comme pour les usages intensifs.'}
        </p>
      </section>

      {/* Vidéo */}
      {hasVideo && (
        <section className="product-video-section">
          <video
            ref={videoRef}
            className="product-video"
            src={heroVideo.url}
            autoPlay
            muted
            playsInline
            controls
            preload="metadata"
            controlsList="nodownload noplaybackrate noremoteplayback"
            disablePictureInPicture
            onContextMenu={(e) => e.preventDefault()}
          />
        </section>
      )}

      {/* Caractéristiques */}
      <section className="specs-wrap">
        <h2 className="specs-title">Caractéristiques techniques : {product?.name}</h2>

        <div className="specs-layout">
          <nav className="specs-nav">
            {Object.keys(ProductSpecs(pid)).map((s) => (
              <a key={s} href={`#${s.replace(/\s+/g, '')}`}>{s}</a>
            ))}
          </nav>

          <div className="specs-content">
            {Object.entries(ProductSpecs(pid)).map(([section, rows]) => (
              <section key={section} id={section.replace(/\s+/g, '')} className="specs-section">
                <h3>{section}</h3>
                <div className="specs-table">
                  {rows.map((row, i) => {
                    const value = row.value === undefined || row.value === null || row.value === '' ? '—' : row.value;
                    return (
                      <div key={i} className="specs-row">
                        <div className="specs-label">{row.label}</div>
                        <div className="specs-line" aria-hidden="true" />
                        <div className="specs-value">{value}</div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      {/* Modale ajout panier */}
      <GenericModal
        open={showAdded}
        onClose={closeAdded}
        variant="success"
        title="Ajouté au panier"
        message="Cet article a bien été ajouté au panier."
        actions={[
          { label: "Fermer", variant: "light", onClick: closeAdded },
          { label: "Voir mon panier", variant: "primary", onClick: goToCart, autoFocus: true },
        ]}
      />
    </div>
  );
};
