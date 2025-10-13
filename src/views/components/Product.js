// src/pages/product/Product.jsx
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductSpecs } from '../../components/index';
import { addToCartRequest, saveCartRequest } from '../../lib/actions/CartActions';
import { GenericModal, ProductMedia } from '../../components/index';
import { toMediaUrl } from '../../lib/utils/mediaUrl';
import { getProductsPagedUserRequest } from "../../lib/actions/ProductActions"; // ✅ pagination
import {
  getFeaturesCategoryByProductRequest,
  clearFeaturesForProduct,
} from "../../lib/actions/FeatureCategoryActions";
import "../../styles/pages/product.css";
import { calculPrice } from '../../lib/utils/Helpers';
import DOMPurify from 'dompurify';

export const Product = () => {
  const { id } = useParams();
  const pid = Number(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [id]);

  useEffect(() => {
    if (!pid) return;
    dispatch(clearFeaturesForProduct(pid));
    dispatch(getFeaturesCategoryByProductRequest(pid));
  }, [dispatch, pid]);

  // ===== Store (✅ compatible pagination) =====
  const prodState       = useSelector((s) => s.products) || {};
  const fullProducts    = Array.isArray(prodState.products) ? prodState.products : [];
  const pagedItems      = Array.isArray(prodState.items)    ? prodState.items    : [];
  const productsAll     = fullProducts.length ? fullProducts : pagedItems;
  let images            = useSelector((s) => s.images?.images) || [];
  let videos            = useSelector((s) => s.videos?.videos) || [];
  const items           = useSelector((s) => s.items?.items) || [];
  const promotionCodes  = useSelector((s) => s.promotionCodes?.promotionCodes) || [];
  const stocks          = useSelector((s) => s.stocks?.stocks) || [];

  images = images.filter((i) => i.display === true && i.position !== 99);
  videos = videos.filter((v) => v.display === true);

  useEffect(() => { dispatch(saveCartRequest(items)); }, [items, dispatch]);

  // ✅ fetch ciblé si produit manquant
  const requestedOnceRef = useRef(null);
  useEffect(() => {
    if (!id) return;
    const found = Array.isArray(productsAll) && productsAll.some((p) => String(p.id) === String(id));
    if (found) return;
    if (requestedOnceRef.current === String(id)) return;
    requestedOnceRef.current = String(id);
    dispatch(getProductsPagedUserRequest({
      page: 1,
      pageSize: 1,
      sort: "CreationDate:desc",
      filter: { Id: id }
    }));
  }, [dispatch, id, productsAll?.length]);

  // Produit courant
  const product = useMemo(
    () => (productsAll || []).find((p) => String(p.id) === String(id)) || null,
    [productsAll, id]
  );

  // Description sécurisée
  const cleanDescriptionHtml = useMemo(() => {
    const raw = product?.description ?? '';
    const fallback = 'Découvrez ce produit au design soigné...';
    const html = raw && String(raw).trim() !== '' ? raw : `<p>${fallback}</p>`;
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p','br','ul','ol','li','b','strong','i','em','u','s',
        'h1','h2','h3','h4','h5','h6','blockquote','span','a',
        'table','thead','tbody','tr','th','td','img'
      ],
      ALLOWED_ATTR: ['href','title','target','rel','class','src','alt','width','height'],
    });
  }, [product?.description]);

  // Promo liée à la catégorie (optionnel)
  const promotion = useMemo(
    () => promotionCodes.find((p) => String(p.id) === String(product?.idPromotionCode)) || null,
    [promotionCodes, product]
  );

  // ===== Images du produit (tri + sélections spéciales) =====
  const productImagesRaw = useMemo(() => {
    if (!product) return [];
    return images.filter((i) => String(i.idProduct) === String(product.id));
  }, [images, product]);

  // Tri par position ASC (assure position 1 en premier si elle existe)
  const productImagesSorted = useMemo(() => {
    const copy = [...productImagesRaw];
    copy.sort((a, b) => {
      const pa = Number(a.position ?? 9999);
      const pb = Number(b.position ?? 9999);
      return pa - pb;
    });
    return copy.length ? copy : [{ url: '/Images/placeholder.jpg', position: 1 }];
  }, [productImagesRaw]);

  // Toujours afficher en premier l'image position 1 dans la galerie/avec le prix
  const firstPos1Index = useMemo(
    () => Math.max(0, productImagesSorted.findIndex(x => Number(x.position) === 1)),
    [productImagesSorted]
  );

  // URLs pour ProductMedia (dans l'ordre trié)
  const imageUrls = useMemo(
    () => (productImagesSorted || []).map(img => toMediaUrl(img.url)),
    [productImagesSorted]
  );

  // ===== Vidéos =====
  const productVideos = useMemo(() => {
    if (!product) return [];
    return (videos || []).filter((v) => String(v.idProduct) === String(product.id) && v.position === 2);
  }, [videos, product]);

  const heroVideo = useMemo(
    () => productVideos.find((v) => v.position === 1) || productVideos[0],
    [productVideos]
  );

  const hasVideo = useMemo(
    () => Boolean(heroVideo?.url && String(heroVideo.url).trim() !== ''),
    [heroVideo]
  );

  // ===== Galerie (état conservé) =====
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => { setCurrentIndex(firstPos1Index); }, [firstPos1Index]);
  const currentImage = productImagesSorted[currentIndex]?.url || '/Images/placeholder.jpg';

  // ===== Lightbox =====
  const [isLightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const openLightbox  = (idx) => { setLightboxIndex(idx); setLightboxOpen(true); };
  const closeLightbox = () => setLightboxOpen(false);
  const prev = () => setLightboxIndex((i) => (i - 1 + productImagesSorted.length) % productImagesSorted.length);
  const next = () => setLightboxIndex((i) => (i + 1) % productImagesSorted.length);

  // Swipe dans la LIGHTBOX (mobile uniquement)
  const lbStartX = useRef(null);
  const lbStartY = useRef(null);
  const lbDeltaX = useRef(0);
  const lbDeltaY = useRef(0);

  // Détection mobile
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(max-width: 768px)').matches
      : false
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e) => setIsMobile(e.matches);
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler);
      else mq.removeListener(handler);
    };
  }, []);

  const lbTouchStart = (e) => {
    if (!isMobile || !isLightboxOpen) return;
    const t = e.touches[0];
    lbStartX.current = t.clientX;
    lbStartY.current = t.clientY;
    lbDeltaX.current = 0;
    lbDeltaY.current = 0;
  };
  const lbTouchMove = (e) => {
    if (lbStartX.current === null || lbStartY.current === null) return;
    const t = e.touches[0];
    lbDeltaX.current = t.clientX - lbStartX.current;
    lbDeltaY.current = t.clientY - lbStartY.current;
  };
  const lbTouchEnd = () => {
    if (lbStartX.current === null || lbStartY.current === null) return;
    const THRESHOLD = 40;
    const absX = Math.abs(lbDeltaX.current);
    const absY = Math.abs(lbDeltaY.current);
    if (absX > absY && absX > THRESHOLD) {
      if (lbDeltaX.current < 0) next(); else prev();
    }
    lbStartX.current = null;
    lbStartY.current = null;
    lbDeltaX.current = 0;
    lbDeltaY.current = 0;
  };

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

  // ===== Prix / promos =====
  const computeBadgeFromProduct = (product, promotionCodes = []) => {
    if (!product) return { badgePct: null, refPriceTtc: null, until: null, source: null };
    const now = new Date();
    const isActive = (end) => !!end && now <= new Date(end);
    const endProd = product?.promotions?.[0]?.endDate;

    const subPromoId =
      product?.subCategoryVm?.promotionCodes?.[0]?.id ??
      product?.subCategoryVm?.idPromotionCode ?? null;

    const catPromoId =
      product?.categoryVm?.promotionCodes?.[0]?.id ??
      product?.categoryVm?.idPromotionCode ?? null;

    const endSub = promotionCodes.find(p => p.id === subPromoId)?.endDate;
    const endCat = promotionCodes.find(p => p.id === catPromoId)?.endDate;

    const baseHt  = typeof product?.price === 'number' ? product.price : parseFloat(product?.price ?? 0);
    const subHt   = product?.priceHtSubCategoryCodePromoted;
    const catHt   = product?.priceHtCategoryCodePromoted;
    const prodHt  = product?.priceHtPromoted;

    const tvaMultiplier = ((product?.tva ?? 0) / 100) + 1;
    const tax = product?.taxWithoutTvaAmount ?? 0;
    const refPriceTtc = (baseHt ?? 0) * tvaMultiplier + tax;

    const pctFrom = (ht) => {
      if (!ht || !baseHt || baseHt <= 0) return null;
      const pct = Math.round((1 - (ht / baseHt)) * 100);
      return Number.isFinite(pct) && pct > 0 ? pct : null;
    };

    if (subHt != null && isActive(endSub)) return { badgePct: pctFrom(subHt), refPriceTtc, until: endSub, source: 'subcategory' };
    if (catHt != null && isActive(endCat)) return { badgePct: pctFrom(catHt), refPriceTtc, until: endCat, source: 'category' };
    if (prodHt != null && isActive(endProd)) return { badgePct: pctFrom(prodHt), refPriceTtc, until: endProd, source: 'product' };
    return { badgePct: null, refPriceTtc: null, until: null, source: 'base' };
  };

  const toNum = (x) => { const n = typeof x === 'number' ? x : parseFloat(x); return Number.isFinite(n) ? n : null; };
  const parseDate = (val) => { if (!val) return null; const d = new Date(val); return Number.isNaN(d.getTime()) ? null : d; };
  const formatEndShort = (val) => { const d = parseDate(val); if (!d) return null; const dd = String(d.getDate()).padStart(2, '0'); const mm = String(d.getMonth() + 1).padStart(2, '0'); return `${dd}/${mm}`; };

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

  const displayPrice = calculPrice(product, promotionCodes);

  const { badgePct, refPriceTtc } = useMemo(
    () => computeBadgeFromProduct(product, promotionCodes),
    [product, promotionCodes]
  );

  const priceRef = useMemo(
    () => (Number.isFinite(refPriceTtc) ? refPriceTtc : toNum(product?.priceTtc) ?? 0),
    [refPriceTtc, product]
  );

  const productPromoPct = activePromo ? Number(activePromo.purcentage) || 0 : 0;
  const discountedPriceProduct = useMemo(() => {
    if (!activePromo) return priceRef;
    const p = toNum(product?.priceHtPromoted);
    if (p != null) return p;
    return +(priceRef * (1 - productPromoPct / 100)).toFixed(2);
  }, [activePromo, product, priceRef, productPromoPct]);

  const hasPrice = Number.isFinite(displayPrice);
  const [eurosStr, centsStr] = hasPrice ? displayPrice.toFixed(2).split('.') : ['0', '00'];
  const euros = eurosStr;
  const cents = centsStr;

  // ===== STOCK =====
  const stockStatusRaw = (product?.stockStatus ?? '').trim();
  const stockIn  = stockStatusRaw.toLowerCase() === 'en stock';
  const stockOutStatus = stockStatusRaw.toLowerCase() === 'en rupture';

  const stockForProduct = useMemo(() => {
    if (!product) return null;
    return stocks.find(
      (st) =>
        String(st?.idProduct ?? st?.Id_product ?? st?.IdProduct) === String(product.id)
    ) || null;
  }, [stocks, product]);

  const availableQty = useMemo(() => {
    const q = Number(
      stockForProduct?.quantity ??
      stockForProduct?.Quantity ??
      stockForProduct?.qty ??
      stockForProduct?.Qty ?? 0
    );
    return Number.isFinite(q) && q > 0 ? q : 0;
  }, [stockForProduct]);

  const isActuallyOut = stockOutStatus || availableQty <= 0;

  const stockStatusLabel =
    stockStatusRaw || (availableQty > 0 ? `Disponibilité limitée` : `En rupture`);
  const stockRowClass = !isActuallyOut && stockIn ? 'stock-in' : isActuallyOut ? 'stock-out' : 'stock-warn';
  const stockDotClass = !isActuallyOut && stockIn ? 'in' : isActuallyOut ? 'out' : 'warn';

  // ===== Achat =====
  const [qty, setQty] = useState(1);
  useEffect(() => {
    if (availableQty <= 0) {
      setQty(1);
    } else if (qty > availableQty) {
      setQty(availableQty);
    } else if (qty < 1) {
      setQty(1);
    }
  }, [availableQty, product?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const [showAdded, setShowAdded] = useState(false);
  const addToCart = () => {
    if (isActuallyOut || !product) return;
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

  // Specs (garde le même contrat pour éviter eslint)
  const { specs } = ProductSpecs(pid, product) || { specs: {} };

  // ===== Vidéo autoplay (si présente) =====
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

  // Construit les options de quantité en fonction du stock
  const qtyOptions = useMemo(() => {
    const max = Math.max(0, availableQty);
    const cap = Math.min(max, 50);
    return Array.from({ length: cap }, (_, i) => i + 1);
  }, [availableQty]);

  // ====== Image Parallax (fallback si pas de vidéo) ======
  // Priorité : position 100 > position 1 > première valide > fallback
  const pickImageByPos = (arr, pos) =>
    arr.find(x => Number(x?.position) === pos && typeof x?.url === 'string' && x.url.trim() !== '');

  const parallaxImgObj = useMemo(() => {
    if (!Array.isArray(productImagesRaw) || productImagesRaw.length === 0) {
      return { url: '/Images/parallax-default.jpg' };
    }
    const pos100 = pickImageByPos(productImagesRaw, 100);
    if (pos100) return pos100;
    const pos1 = pickImageByPos(productImagesRaw, 1);
    if (pos1) return pos1;
    const firstValid = productImagesRaw.find(x => typeof x?.url === 'string' && x.url.trim() !== '');
    return firstValid || { url: '/Images/parallax-default.jpg' };
  }, [productImagesRaw]);

  const parallaxUrl = toMediaUrl(parallaxImgObj?.url) || '/Images/parallax-default.jpg';

  // ===== Parallax (piloté JS, aucun texte) =====
  const parallaxRef = useRef(null);
  useEffect(() => {
    if (hasVideo) return; // activer seulement si pas de vidéo
    const el = parallaxRef.current;
    if (!el) return;

    let rafId = 0;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;
        const progress = (vh - rect.top) / (vh + rect.height); // ~[0..1]
        const strength = 70;
        const offset = (progress - 0.5) * strength;
        el.style.setProperty('--parallax-y', `${offset.toFixed(1)}px`);
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [hasVideo]);

  // Skeleton si pas de produit
  if (!product) {
    return (
      <div className="product-page">
        <div className="product-main">
          <div className="thumbs-col" />
          <div className="product-main-image-wrap">
            <div className="img-skeleton" aria-hidden="true" />
          </div>
          <div className="product-details">
            <p className="product-brand">&nbsp;</p>
            <h1 className="product-title specs-title">Chargement du produit…</h1>
            <div className="details-stack">
              <div className="img-skeleton" style={{ height: 24, width: 180 }} />
              <div className="img-skeleton" style={{ height: 18, width: 260, marginTop: 8 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-page" onContextMenu={handleContextMenu}>
      {/* Zone haute: galerie + infos achat via ProductMedia */}
      <ProductMedia
        images={imageUrls}
        index={currentIndex}                  // ← toujours index sur pos 1 (via useEffect)
        onIndexChange={setCurrentIndex}
        onImageClick={(idx) => openLightbox(idx)}
        isMobile={isMobile}
      >
        {/* ====== DÉTAILS ====== */}
        <p className="product-brand">{product?.brand || ''}</p>

        <h1 className="product-title product-title--center specs-title">
          {product?.brand + ' ' + product?.model || product?.title || 'Produit'}
        </h1>

        <div className="details-stack">
          {Number.isFinite(displayPrice) && (
            <>
              {Number.isFinite(badgePct) && badgePct > 0 && (
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

              <div className="price--big">
                <span className="euros">{displayPrice.toFixed(2).split('.')[0]}€</span>
                <sup className="cents">{displayPrice.toFixed(2).split('.')[1]}</sup>
              </div>

              {activePromo && promoUntil && (
                <div className="promo-until">Jusqu'au {promoUntil} inclus</div>
              )}

              <p className="price-lead">
                <em>{product?.taxWithoutTva}</em>
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
              disabled={isActuallyOut || availableQty <= 0}
            >
              {qtyOptions.length === 0 ? (
                <option value={1}>—</option>
              ) : (
                qtyOptions.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))
              )}
            </select>

            <button
              className="buy-button buy-accent"
              onClick={addToCart}
              disabled={isActuallyOut}
              aria-disabled={isActuallyOut}
              title={isActuallyOut ? "Article en rupture" : "Ajouter au panier"}
            >
              🛍️&nbsp;Ajouter au panier
            </button>
          </div>

          <ul className="trust-list">
            <li><span className="trust-ico" aria-hidden="true">📦</span> Envoi sous 24h</li>
            <li><span className="trust-ico" aria-hidden="true">🚚</span> Livraison rapide et sécurisée</li>
          </ul>
        </div>
      </ProductMedia>

      {/* Lightbox avec SWIPE (mobile) */}
      {isLightboxOpen && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          onClick={closeLightbox}
          onTouchStart={lbTouchStart}
          onTouchMove={lbTouchMove}
          onTouchEnd={lbTouchEnd}
        >
          <button className="lb-close" type="button" aria-label="Fermer" onClick={closeLightbox}>×</button>
          <button className="lb-prev"  type="button" aria-label="Précédent" onClick={(e) => { e.stopPropagation(); prev();  }}>‹</button>
          <img
            className="lb-img"
            src={toMediaUrl(productImagesSorted[lightboxIndex]?.url)}
            alt={`Image ${lightboxIndex + 1} de ${product?.name || 'Produit'}`}
            onClick={(e) => e.stopPropagation()}
          />
          <button className="lb-next"  type="button" aria-label="Suivant" onClick={(e) => { e.stopPropagation(); next(); }}>›</button>
        </div>
      )}

      {/* Description */}
      <section className='mt-5'>
        <h2 className="specs-title">Description</h2>
        <div
          className="product-desc product-description-html mb-3 bg-description"
          dangerouslySetInnerHTML={{ __html: cleanDescriptionHtml }}
        />
      </section>

      {/* Média de mise en avant : vidéo si dispo, sinon PARALLAX (image seule) */}
      {hasVideo ? (
        <section className="product-video-section">
          <video
            ref={videoRef}
            className="product-video"
            src={toMediaUrl(heroVideo.url)}
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
      ) : (
        <section
          ref={parallaxRef}
          className="product-parallax"
          style={{
            // IMPORTANT: on quote l’URL pour éviter les soucis CSS avec ?, & et espaces
            '--parallax-img': `url("${parallaxUrl}")`,
            minHeight: isMobile ? '28vh' : '42vh',   // ← plus petit sur mobile
          }}
          aria-hidden="true"
        />
      )}

      {/* Caractéristiques */}
      <section className="specs-wrap">
        <h2 className="specs-title">Caractéristiques techniques</h2>

        <div className="specs-layout">
          <nav className="specs-nav">
            {Object.keys(specs || {}).map((s) => (
              <a key={s} href={`#${s.replace(/\s+/g, '')}`}>{s}</a>
            ))}
          </nav>

          <div className="specs-content">
            {(Object.entries(specs || {})).map(([section, rows]) => (
              <section key={section} id={section.replace(/\s+/g, '')} className="specs-section">
                <h3>{section}</h3>
                <div className="specs-table">
                  {(Array.isArray(rows) ? rows : []).map((row, i) => {
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
          { label: "Fermer",          variant: "light",   onClick: closeAdded },
          { label: "Voir mon panier", variant: "primary", onClick: goToCart, autoFocus: true },
        ]}
      />
    </div>
  );
};
