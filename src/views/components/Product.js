// src/pages/product/Product.jsx
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductSpecs } from '../../components';
import { addToCartRequest, saveCartRequest } from '../../lib/actions/CartActions';
import { GenericModal } from '../../components';
import { toMediaUrl } from '../../lib/utils/mediaUrl';
import { getProductUserRequest } from '../../lib/actions/ProductActions';
import { getFeaturesCategoryByProductRequest, clearFeaturesForProduct } from '../../lib/actions/FeatureCategoryActions';
import '../../styles/pages/product.css';
import { calculPrice } from '../../lib/utils/Helpers';
import DOMPurify from 'dompurify';
import { getStockUiByProductId } from '../../lib/utils/stockUi';
import RatingStars from '../../lib/utils/RatingStars';
import ProductReviews from '../../components/ProductReviews';

// ➜ actions avis
import {
  addCustomerRateRequest,
  updateCustomerRateRequest,
  getCustomerRateRequest,          // ✅ (refresh après submit)
} from '../../lib/actions/CustomerRateActions';

/* --------- Swipe helpers (lightbox) --------- */
const useSwipe = ({ onSwipeLeft, onSwipeRight, threshold = 40 }) => {
  const startX = useRef(0);
  const lastX = useRef(0);
  const isDown = useRef(false);
  const onStart = (x) => { isDown.current = true; startX.current = x; lastX.current = x; };
  const onMove  = (x) => { if (isDown.current) lastX.current = x; };
  const onEnd   = () => {
    if (!isDown.current) return;
    const delta = lastX.current - startX.current;
    if (delta <= -threshold) onSwipeLeft?.();
    if (delta >=  threshold) onSwipeRight?.();
    isDown.current = false;
  };
  return { onStart, onMove, onEnd };
};

const Product = () => {
  const { id } = useParams();
  const pid = Number(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); }, [id]);

  useEffect(() => {
    if (!pid) return;
    dispatch(clearFeaturesForProduct(pid));
    dispatch(getFeaturesCategoryByProductRequest(pid));
  }, [dispatch, pid]);

  // ---- STORE ----
  const prodState      = useSelector((s) => s.products) || {};
  const fullProducts   = Array.isArray(prodState.products) ? prodState.products : [];
  const productsAll    = fullProducts;
  const customerState  = useSelector((s) => s.customers.customers) || {};

  const account        = useSelector((s) => s.account) || {};
  const userID         = account?.user?.id;
  const customer       = customerState?.find((c) => c.idAspNetUser === userID);
  const currentCustomerId = customer?.id;

  // Achats (CustomerOrderProduct)
  const orderProductsState = useSelector((s) => s.orderProducts) || {};
  const orderProducts = Array.isArray(orderProductsState.orderProducts)
    ? orderProductsState.orderProducts
    : (Array.isArray(orderProductsState.items) ? orderProductsState.items : []);

  // Avis (CustomerRates)
  const customerRatesState = useSelector((s) => s.customerRates) || {};
  const customerRates = Array.isArray(customerRatesState.customerRates)
    ? customerRatesState.customerRates
    : (Array.isArray(customerRatesState.items) ? customerRatesState.items : []);

  // Divers
  const items          = useSelector((s) => s.items?.items) || [];
  const stocks         = useSelector((s) => s.stocks?.stocks) || [];
  let images           = useSelector((s) => s.images?.images) || [];
  let videos           = useSelector((s) => s.videos?.videos) || [];
  const promotionCodes = useSelector((s) => s.promotionCodes?.promotionCodes) || [];

  images = images.filter((i) => i.display === true && i.position !== 99);
  videos = videos.filter((v) => v.display === true);

  useEffect(() => { dispatch(saveCartRequest(items)); }, [items, dispatch]);

  useEffect(() => {
    if (!fullProducts.length) dispatch(getProductUserRequest());
  }, [dispatch, fullProducts.length]);

  useEffect(() => {
    if (!pid) return;
    const found = Array.isArray(productsAll) && productsAll.some((p) => String(p.id) === String(pid));
    if (!found) dispatch(getProductUserRequest());
  }, [dispatch, pid, productsAll]);

  const product = useMemo(
    () => (productsAll || []).find((p) => String(p.id) === String(pid)) || null,
    [productsAll, pid]
  );

  // Acheté ?
  const hasBought = useMemo(() => {
    if (!currentCustomerId || !product) return false;
    return (orderProducts || []).some(op =>
      String(op.productId ?? op.idProduct) === String(product.id) &&
      String(op.customerId ?? op.idCustomer) === String(currentCustomerId)
    );
  }, [orderProducts, currentCustomerId, product]);

  // Avis existant ?
  const existingRate = useMemo(() => {
    if (!currentCustomerId || !product) return null;
    return (customerRates || []).find(r =>
      String(r.productId ?? r.idProduct) === String(product.id) &&
      String(r.customerId ?? r.idCustomer) === String(currentCustomerId)
    ) || null;
  }, [customerRates, currentCustomerId, product]);

  // Description nettoyée
  const cleanDescriptionHtml = useMemo(() => {
    const raw = product?.description ?? '';
    const fallback = 'Découvrez ce produit au design soigné...';
    const html = raw && String(raw).trim() !== '' ? raw : `<p>${fallback}</p>`;
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p','br','ul','ol','li','b','strong','i','em','u','s','h1','h2','h3','h4','h5','h6','blockquote','span','a','table','thead','tbody','tr','th','td','img'],
      ALLOWED_ATTR: ['href','title','target','rel','class','src','alt','width','height'],
    });
  }, [product?.description]);

  // Images / vidéos
  const productImagesRaw = useMemo(() => {
    if (!product) return [];
    return images.filter((i) => String(i.idProduct) === String(product.id));
  }, [images, product]);

  const productImagesSorted = useMemo(() => {
    const copy = [...productImagesRaw];
    copy.sort((a, b) => (Number(a.position ?? 9999) - Number(b.position ?? 9999)));
    return copy.length ? copy : [{ url: '/Images/placeholder.jpg', position: 1 }];
  }, [productImagesRaw]);

  const imageUrls = useMemo(
    () => (productImagesSorted || []).map((img) => toMediaUrl(img.url)),
    [productImagesSorted]
  );

  const firstPos1Index = useMemo(
    () => Math.max(0, productImagesSorted.findIndex((x) => Number(x.position) === 1)),
    [productImagesSorted]
  );

  const productVideos = useMemo(() => {
    if (!product) return [];
    return (videos || []).filter((v) => String(v.idProduct) === String(product.id) && v.position === 2);
  }, [videos, product]);

  const heroVideo = useMemo(() => productVideos.find((v) => v.position === 1) || productVideos[0], [productVideos]);
  const hasVideo = !!(heroVideo?.url && String(heroVideo.url).trim() !== '');

  // UI states
  const [mainIndex, setMainIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  useEffect(() => { setMainIndex(firstPos1Index); setLightboxIndex(firstPos1Index); }, [firstPos1Index]);
  const currentMainUrl = imageUrls[mainIndex] || '/Images/placeholder.jpg';

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener ? mq.addEventListener('change', handler) : mq.addListener(handler);
    return () => { mq.removeEventListener ? mq.removeEventListener('change', handler) : mq.removeListener(handler); };
  }, []);

  const [isLightboxOpen, setLightboxOpen] = useState(false);
  const openLightbox  = (idx) => { setLightboxIndex(idx); setLightboxOpen(true); };
  const closeLightbox = () => { setLightboxOpen(false); };

  const { onStart, onMove, onEnd } = useSwipe({
    onSwipeLeft: () => setLightboxIndex((i) => (i + 1) % imageUrls.length),
    onSwipeRight: () => setLightboxIndex((i) => (i - 1 + imageUrls.length) % imageUrls.length),
    threshold: 40,
  });

  // Prix / promos
  const toNum = (x) => { const n = typeof x === 'number' ? x : parseFloat(x); return Number.isFinite(n) ? n : null; };
  const parseDate = (val) => { if (!val) return null; const d = new Date(val); return Number.isNaN(d.getTime()) ? null : d; };
  const formatEndShort = (val) => { const d = parseDate(val); if (!d) return null; const dd = String(d.getDate()).padStart(2,'0'); const mm = String(d.getMonth()+1).padStart(2,'0'); return `${dd}/${mm}`; };

  const computeBadgeFromProduct = (product, promotionCodes = []) => {
    if (!product) return { badgePct: null, refPriceTtc: null, until: null, source: null };
    const now = new Date();
    const isActive = (end) => !!end && now <= new Date(end);
    const endProd = product?.promotions?.[0]?.endDate;
    const subPromoId = product?.subCategoryVm?.promotionCodes?.[0]?.id ?? product?.subCategoryVm?.idPromotionCode ?? null;
    const catPromoId = product?.categoryVm?.promotionCodes?.[0]?.id ?? product?.categoryVm?.idPromotionCode ?? null;
    const endSub = promotionCodes.find((p) => p.id === subPromoId)?.endDate;
    const endCat = promotionCodes.find((p) => p.id === catPromoId)?.endDate;
    const baseHt  = typeof product?.price === 'number' ? product.price : parseFloat(product?.price ?? 0);
    const subHt   = product?.priceHtSubCategoryCodePromoted;
    const catHt   = product?.priceHtCategoryCodePromoted;
    const prodHt  = product?.priceHtPromoted;
    const tvaMultiplier = ((product?.tva ?? 0) / 100) + 1;
    const tax = product?.taxWithoutTvaAmount ?? 0;
    const refPriceTtc = (baseHt ?? 0) * tvaMultiplier + tax;
    const pctFrom = (ht) => (!ht || !baseHt || baseHt <= 0) ? null : Math.max(0, Math.round((1 - (ht / baseHt)) * 100)) || null;
    if (subHt != null && isActive(endSub)) return { badgePct: pctFrom(subHt), refPriceTtc, until: endSub, source: 'subcategory' };
    if (catHt   != null && isActive(endCat)) return { badgePct: pctFrom(catHt), refPriceTtc, until: endCat, source: 'category' };
    if (prodHt  != null && isActive(endProd)) return { badgePct: pctFrom(prodHt), refPriceTtc, until: endProd, source: 'product' };
    return { badgePct: null, refPriceTtc: null, until: null, source: 'base' };
  };

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
    if (end && end.getTime()   < startOfToday.getTime()) return null;
    return rawFirstPromo;
  }, [rawFirstPromo]);

  const promoUntil = activePromo?.endDate ? formatEndShort(activePromo.endDate) : null;
  const displayPrice = calculPrice(product, promotionCodes);
  const { badgePct, refPriceTtc } = useMemo(() => computeBadgeFromProduct(product, promotionCodes), [product, promotionCodes]);
  const priceRef = useMemo(() => (Number.isFinite(refPriceTtc) ? refPriceTtc : toNum(product?.priceTtc) ?? 0), [refPriceTtc, product]);

  // Stock
  const { cls: stockCls, label: stockLabel, qty: availableQty = 0, isOut: isActuallyOut } =
    getStockUiByProductId(stocks, product?.id);
  const stockRowClass = stockCls === 'in' ? 'stock-in' : stockCls === 'out' ? 'stock-out' : 'stock-warn';
  const stockDotClass = stockCls;
  const stockStatusLabel = stockLabel;

  // Achat
  const [qty, setQty] = useState(1);
  useEffect(() => {
    if (availableQty <= 0) setQty(1);
    else if (qty > availableQty) setQty(availableQty);
    else if (qty < 1) setQty(1);
  }, [availableQty, product?.id]); // eslint-disable-line

  const [showAdded, setShowAdded] = useState(false);
  const addToCart = () => {
    if (isActuallyOut || !product) return;
    const payloadItem = {
      id: product.id,
      name: product.brand + ' ' + product.model || product.title,
      price: displayPrice,
      image: currentMainUrl,
      packageProfil: product.packageProfil,
      containedCode: product.containedCode,
    };
    dispatch(addToCartRequest(payloadItem, qty));
    setShowAdded(true);
  };
  const closeAdded = () => setShowAdded(false);
  const goToCart = () => { setShowAdded(false); navigate('/cart'); };

  // Vidéo autoplay
  const videoRef = useRef(null);
  useEffect(() => {
    if (!hasVideo || !videoRef.current) return;
    const v = videoRef.current;
    v.muted = true;
    const p = v.play();
    if (p && typeof p.then === 'function') {
      p.catch(() => {
        const onCanPlay = () => { v.play().catch(() => {}); v.removeEventListener('canplay', onCanPlay); };
        v.addEventListener('canplay', onCanPlay);
      });
    }
  }, [hasVideo, heroVideo?.url]);


// 🔒 Lock total de la page quand la lightbox est ouverte (desktop + mobile + iOS)
useEffect(() => {
  if (!isLightboxOpen) return;

  // 1) Mémoriser l’état courant
  const scrollY = window.scrollY || window.pageYOffset || 0;
  const html = document.documentElement;
  const body = document.body;

  const prevHtmlOverflow = html.style.overflow;
  const prevHtmlTouch    = html.style.touchAction;
  const prevHtmlHeight   = html.style.height;

  const prevBodyOverflow = body.style.overflow;
  const prevBodyTouch    = body.style.touchAction;
  const prevBodyPos      = body.style.position;
  const prevBodyTop      = body.style.top;
  const prevBodyWidth    = body.style.width;
  const prevBodyHeight   = body.style.height;

  // 2) Appliquer le lock
  html.classList.add('scroll-lock');
  body.classList.add('scroll-lock');

  html.style.overflow    = 'hidden';
  html.style.touchAction = 'none';
  html.style.height      = '100%';

  body.style.overflow    = 'hidden';
  body.style.touchAction = 'none';
  body.style.position    = 'fixed';        // fige la page
  body.style.top         = `-${scrollY}px`; // garde le viewport au bon endroit
  body.style.width       = '100%';
  body.style.height      = '100%';

  // 3) Bloquer molette/gestes/clavier (PageUp, PageDown, Space, Arrows, Home/End)
  const prevent = (e) => e.preventDefault();
  const preventKeys = (e) => {
    const keys = new Set([32,33,34,35,36,37,38,39,40]); // space, pgup/dn, end/home, arrows
    if (keys.has(e.keyCode)) e.preventDefault();
  };
  window.addEventListener('wheel',     prevent, { passive: false });
  window.addEventListener('touchmove', prevent, { passive: false });
  window.addEventListener('keydown',   preventKeys, { passive: false });

  // 4) Cleanup : restauration styles + position
  return () => {
    window.removeEventListener('wheel',     prevent);
    window.removeEventListener('touchmove', prevent);
    window.removeEventListener('keydown',   preventKeys);

    html.style.overflow    = prevHtmlOverflow;
    html.style.touchAction = prevHtmlTouch;
    html.style.height      = prevHtmlHeight;

    body.style.overflow = prevBodyOverflow;
    body.style.touchAction = prevBodyTouch;
    body.style.position = prevBodyPos;
    body.style.top      = prevBodyTop;
    body.style.width    = prevBodyWidth;
    body.style.height   = prevBodyHeight;

    html.classList.remove('scroll-lock');
    body.classList.remove('scroll-lock');

    // remettre le scroll à la même place
    const y = Math.abs(parseInt(prevBodyTop || '0', 10)) || scrollY;
    window.scrollTo(0, y);
  };
}, [isLightboxOpen]);


  // Parallax
  const parallaxRef = useRef(null);
  const pickImageByPos = (arr, pos) => arr.find((x) => Number(x?.position) === pos && typeof x?.url === 'string' && x.url.trim() !== '');
  const parallaxImgObj = useMemo(() => {
    if (!Array.isArray(productImagesRaw) || productImagesRaw.length === 0) return { url: '/Images/parallax-default.jpg' };
    const pos100 = pickImageByPos(productImagesRaw, 100);
    if (pos100) return pos100;
    const pos1 = pickImageByPos(productImagesRaw, 1);
    if (pos1) return pos1;
    const firstValid = productImagesRaw.find((x) => typeof x?.url === 'string' && x.url.trim() !== '');
    return firstValid || { url: '/Images/parallax-default.jpg' };
  }, [productImagesRaw]);
  const parallaxUrl = toMediaUrl(parallaxImgObj?.url) || '/Images/parallax-default.jpg';

  useEffect(() => {
    if (hasVideo) return;
    const el = parallaxRef.current; if (!el) return;
    let rafId = 0;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;
        const progress = (vh - rect.top) / (vh + rect.height);
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

  /* -------- Specs -------- */
  const { specs = {} } = (ProductSpecs(pid, product) || {});

  /* ===================== AVIS : Modales ===================== */
  // 1) Modale “vous devez acheter”
  const [isNotBuyerOpen, setNotBuyerOpen] = useState(false);

  // 2) Modale d’avis
  const [isRateOpen, setRateOpen] = useState(false);
  const [rateValue, setRateValue] = useState(existingRate?.rate ?? existingRate?.note ?? 0);
  const [rateTitle, setRateTitle] = useState(existingRate?.title ?? '');
  const [rateMsg, setRateMsg]     = useState(existingRate?.message ?? '');

  // ✅ 3) Modale de confirmation (NOUVEAU)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const openRateModal = () => {
    if (!hasBought) {
      setNotBuyerOpen(true);
      return;
    }
    setRateValue(existingRate?.rate ?? existingRate?.note ?? 0);
    setRateTitle(existingRate?.title ?? '');
    setRateMsg(existingRate?.message ?? '');
    setRateOpen(true);
  };
  const closeRate = () => setRateOpen(false);

  const submitRate = async (e) => {
    e.preventDefault();
    if (!currentCustomerId || !product) return;

    const payload = {
      Id: existingRate?.id || null,
      IdCustomer: currentCustomerId,
      IdProduct: product.id,
      Rate: Number(rateValue) || 0,
      Title: (rateTitle || '').trim(),
      Message: (rateMsg || '').trim(),
    };

    if (existingRate?.id) {
      await dispatch(updateCustomerRateRequest(payload));
      setConfirmText('Votre avis a bien été modifié');   // ✅ message update
    } else {
      await dispatch(addCustomerRateRequest(payload));
      setConfirmText('Votre avis a bien été ajouté');     // ✅ message add
    }

    setRateOpen(false);
    setConfirmOpen(true);                                 // ✅ affiche la modale
    dispatch(getCustomerRateRequest());                   // refresh des avis
  };

  // Skeleton
  if (!product) {
    return (
      <div className="product-page">
        <div className="product-main">
          <div className="thumbs-col" />
          <div className="product-main-image-wrap"><div className="img-skeleton" aria-hidden="true" /></div>
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

  const handleContextMenu = (e) => e.preventDefault();
  const goToReviews = () => {
    const el = document.getElementById('reviews');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /* ------------------------------ Rendu ------------------------------ */
  return (
    <div className={`product-page ${isLightboxOpen ? 'is-locked' : ''}`} onContextMenu={handleContextMenu}>
      <div className="product-main">
        {/* Vignettes */}
        <div className="thumbs-col">
          {imageUrls.map((src, i) => (
            <button
              key={i}
              className="thumb"
              onClick={() => { if (isMobile) openLightbox(i); else setMainIndex(i); }}
              aria-label={`Sélectionner l'image ${i + 1}`}
            >
              <img src={src} alt={`Miniature ${i + 1}`} loading="lazy" />
            </button>
          ))}
        </div>

        {/* Image principale */}
        <div className="product-main-image-wrap">
          <img
            className="product-main-image"
            src={currentMainUrl}
            alt={product?.name || product?.title || 'Image produit'}
            onClick={() => openLightbox(mainIndex)}
            role="button"
            style={{ cursor: 'zoom-in' }}
            draggable={false}
          />
        </div>

        {/* Colonne détails */}
        <div className="product-details">
          <p className="product-brand">{product?.brand || ''}</p>
          <h1 className="product-title product-title--center specs-title">
            {product?.brand + ' ' + product?.model || product?.title || 'Produit'}
          </h1>

          {/* Étoiles + compteur cliquable */}
          <div className="product-rating-center">
            <RatingStars
              value={Number(product.rate) || 0}
              count={product.numberRate || 0}
              size="sm"
              className="rating--no-count"
            />
            {Number(product.numberRate) > 0 && (
              <button
                type="button"
                className="rating-jump-link"
                onClick={goToReviews}
                aria-label="Voir les avis"
              >
                {product.numberRate} {product.numberRate > 1 ? 'avis' : 'avis'}
              </button>
            )}
          </div>

          {/* Prix & stock */}
          <div className="details-stack" style={{ marginTop: 12 }}>
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
                {activePromo && promoUntil && (<div className="promo-until">Jusqu'au {promoUntil} inclus</div>)}
                <p className="price-lead"><em>{product?.taxWithoutTva}</em></p>
                <p className="product-description">Taxes incluses — Frais de livraison calculés lors du paiement.</p>
              </>
            )}

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
                {Array.from({ length: Math.min(Math.max(0, availableQty), 50) }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>

              <button
                className="buy-button buy-accent"
                onClick={addToCart}
                disabled={isActuallyOut}
                aria-disabled={isActuallyOut}
                title={isActuallyOut ? 'Article en rupture' : 'Ajouter au panier'}
              >
                🛍️ Ajouter au panier
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
        <div
          className="lb-overlay"
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target.classList.contains('lb-overlay')) closeLightbox(); }}
        >
          <div
            className="lb-content"
            onMouseDown={(e) => onStart(e.clientX)}
            onMouseMove={(e) => onMove(e.clientX)}
            onMouseUp={onEnd}
            onMouseLeave={onEnd}
            onTouchStart={(e) => onStart(e.touches[0].clientX)}
            onTouchMove={(e) => onMove(e.touches[0].clientX)}
            onTouchEnd={onEnd}
          >
            <div className="lb-topbar">
              <div className="lb-counter">{lightboxIndex + 1} / {imageUrls.length}</div>
              <button className="lb-btn lb-close" onClick={closeLightbox} aria-label="Fermer">×</button>
            </div>

            <div className="lb-stage">
              {imageUrls.length > 1 && (
                <button className="lb-btn lb-arrow lb-prev" onClick={() => setLightboxIndex((i)=> (i-1+imageUrls.length)%imageUrls.length)} aria-label="Précédent">‹</button>
              )}

              <div className="lb-fit" onClick={(e) => e.stopPropagation()} style={{ position: 'relative', width: '100%', height: '100%' }}>
                <div
                  className="lb-bgi"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    margin: 'auto',
                    backgroundImage: `url(${imageUrls[lightboxIndex]})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundSize: 'contain',
                    maxWidth: '100%',
                    maxHeight: '100%',
                  }}
                />
              </div>

              {imageUrls.length > 1 && (
                <button className="lb-btn lb-arrow lb-next" onClick={() => setLightboxIndex((i)=> (i+1)%imageUrls.length)} aria-label="Suivant">›</button>
              )}
            </div>

            {imageUrls.length > 1 && (
              <div className="lb-thumbs">
                {imageUrls.map((src, i) => (
                  <button
                    key={i}
                    className={`lb-thumb ${i === lightboxIndex ? 'is-active' : ''}`}
                    onClick={() => setLightboxIndex(i)}
                    aria-label={`Aller à l'image ${i + 1}`}
                  >
                    <img src={src} alt={`Miniature ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Description */}
      <section className="mt-5">
        <h2 className="specs-title">Description</h2>
        <div
          className="product-desc product-description-html mb-3 bg-description"
          dangerouslySetInnerHTML={{ __html: cleanDescriptionHtml }}
        />
      </section>

      {/* Vidéo / Parallax */}
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
          style={{ '--parallax-img': `url("${parallaxUrl}")`, minHeight: isMobile ? '28vh' : '42vh' }}
          aria-hidden="true"
        />
      )}

      {/* Caractéristiques techniques */}
      <section className="specs-wrap">
        <h2 className="specs-title">Caractéristiques techniques</h2>
        <div className="specs-layout">
          <nav className="specs-nav">
            {Object.keys(specs).map((s) => (
              <a key={s} href={`#${s.replace(/\s+/g, '')}`}>{s}</a>
            ))}
          </nav>
          <div className="specs-content">
            {Object.entries(specs).map(([section, rows]) => (
              <section key={section} id={section.replace(/\s+/g, '')} className="specs-section">
                <h3>{section}</h3>
                <div className="specs-table">
                  {(Array.isArray(rows) ? rows : []).map((row, i) => (
                    <div key={i} className="specs-row">
                      <div className="specs-label">{row.label}</div>
                      <div className="specs-line" aria-hidden="true" />
                      <div className="specs-value text-muted">{row.value ?? '—'}</div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      {/* Avis clients */}
      <section id="reviews" className="reviews-wrap mt-5">
        <h2 className="specs-title">Avis clients</h2>
        <ProductReviews
          productId={product.id}
          average={Number(product?.rate) || undefined}
          totalCount={product?.numberRate || undefined}
          onAddReview={openRateModal}  // ➜ Ouvre la bonne modale selon hasBought/existingRate
        />
      </section>

      {/* Modale ajout panier */}
      <GenericModal
        open={showAdded}
        onClose={closeAdded}
        variant="success"
        title="Ajouté au panier"
        message="Cet article a bien été ajouté au panier."
        actions={[
          { label: 'Fermer',          variant: 'light',   onClick: closeAdded },
          { label: 'Voir mon panier', variant: 'primary', onClick: goToCart, autoFocus: true },
        ]}
      />

      {/* Modale « vous devez avoir acheté » */}
      <GenericModal
        open={isNotBuyerOpen}
        onClose={() => setNotBuyerOpen(false)}
        variant="warning"
        title="Avis réservé aux acheteurs"
        message="Vous devez avoir acheté ce produit pour donner un avis. Cela nous permet de garantir des retours authentiques."
        actions={[
          { label: 'OK', variant: 'primary', onClick: () => setNotBuyerOpen(false), autoFocus: true },
        ]}
      />

      {/* Modale Avis */}
      {isRateOpen && (
        <>
          {/* Backdrop */}
          <div className="app-backdrop" onClick={closeRate} />
          {/* Dialog */}
          <div className="app-modal" role="dialog" aria-modal="true">
            <div className="app-modal__dialog">
              <div className="app-modal__header">
                <h5 className="app-modal__title">
                  {existingRate ? "Modifier mon avis" : "Donner mon avis"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeRate}
                  aria-label="Fermer"
                />
              </div>

              <form onSubmit={submitRate} className="rate-form">
                <div className="app-modal__body">
                  {/* Note */}
                  <div className="mb-3">
                    <label className="form-label">
                      <strong>Sélectionnez votre note *</strong>
                    </label>
                    <div className="rate-stars">
                      {[1,2,3,4,5].map((n) => {
                        const on = n <= (Number(rateValue) || 0);
                        return (
                          <button
                            key={n}
                            type="button"
                            className={`star-btn ${on ? 'is-on' : ''}`}
                            onClick={() => setRateValue(n)}
                            aria-label={`Note ${n}`}
                            title={`${n} ${n>1?'étoiles':'étoile'}`}
                          >
                            {on ? '★' : '☆'}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Titre */}
                  <div className="mb-3">
                    <label className="form-label">
                      <strong>Titre de votre commentaire *</strong> <small>(0/100 max)</small>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={rateTitle}
                      maxLength={100}
                      onChange={(e) => setRateTitle(e.target.value)}
                      required
                    />
                  </div>

                  {/* Message */}
                  <div className="mb-2">
                    <label className="form-label">
                      <strong>Commentaire détaillé *</strong> <small>(30 caractères min)</small>
                    </label>
                    <textarea
                      className="form-control"
                      rows={6}
                      placeholder="Pourquoi avez-vous donné cette note ? Détaillez ce que vous avez apprécié ou non, et votre usage du produit."
                      value={rateMsg}
                      onChange={(e) => setRateMsg(e.target.value)}
                      minLength={30}
                      required
                    />
                  </div>
                </div>

                <div className="app-modal__footer">
                  <button type="button" className="btn btn-light" onClick={closeRate}>
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {existingRate ? "Mettre à jour" : "Publier l’avis"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* ✅ Modale de confirmation après ajout/modification d'avis */}
      <GenericModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        variant="success"
        title="Merci !"
        message={confirmText}
        actions={[
          { label: 'OK', variant: 'primary', onClick: () => setConfirmOpen(false), autoFocus: true },
        ]}
      />
    </div>
  );
};

export default Product;
