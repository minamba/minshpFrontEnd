// src/pages/product/Product.jsx
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductSpecs } from '../../components/index';
import { addToCartRequest, saveCartRequest } from '../../lib/actions/CartActions';
import { GenericModal } from '../../components/index';
import { toMediaUrl } from '../../lib/utils/mediaUrl';
import { getProductsPagedUserRequest } from "../../lib/actions/ProductActions"; // ✅ pagination
import {
  getFeaturesCategoryByProductRequest,
  clearFeaturesForProduct,   // ou clearFeaturesAll()
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
  // nettoie l'entrée (évite de montrer l'ancien jeu pendant 1 tick)
  dispatch(clearFeaturesForProduct(pid)); // ou clearFeaturesAll()
  // récupère les specs du produit courant
  dispatch(getFeaturesCategoryByProductRequest(pid));
}, [dispatch, pid]);

  // ===== Store (✅ compatible pagination) =====
  const prodState       = useSelector((s) => s.products) || {};
  const fullProducts    = Array.isArray(prodState.products) ? prodState.products : [];
  const pagedItems      = Array.isArray(prodState.items)    ? prodState.items    : [];
  const productsAll     = fullProducts.length ? fullProducts : pagedItems; // ✅
  let images          = useSelector((s) => s.images?.images) || [];
  let videos          = useSelector((s) => s.videos?.videos) || [];
  const items           = useSelector((s) => s.items?.items) || [];
  const promotionCodes  = useSelector((s) => s.promotionCodes?.promotionCodes) || [];
  const stocks          = useSelector((s) => s.stocks?.stocks) || [];

  images = images.filter((i) => i.display === true &&  i.position !== 99);
  videos = videos.filter((v) => v.display === true);

  // Sauvegarde panier
  useEffect(() => { dispatch(saveCartRequest(items)); }, [items, dispatch]);

  // ✅ Si le produit n'est pas trouvé en mémoire, on lance un fetch ciblé
  const requestedOnceRef = useRef(null);
  useEffect(() => {
    if (!id) return;
    const found = Array.isArray(productsAll) && productsAll.some((p) => String(p.id) === String(id));
    if (found) return;
    // évite les redemandes en boucle (array recréé, StrictMode, etc.)
    if (requestedOnceRef.current === String(id)) return;
    requestedOnceRef.current = String(id);
    dispatch(getProductsPagedUserRequest({
      page: 1,
      pageSize: 1,
      sort: "CreationDate:desc",
      filter: { Id: id } // <-- adapte si ton API attend un autre champ
    }));
  }, [dispatch, id, productsAll?.length]); // <- on dépend de la taille, pas de la référence

  // Produit courant (✅ cherche dans full OU items)
  const product = useMemo(
    () => (productsAll || []).find((p) => String(p.id) === String(id)) || null,
    [productsAll, id]
  );



  const cleanDescriptionHtml = useMemo(() => {
    const raw = product?.description ?? '';
    const fallback = 'Découvrez ce produit au design soigné...';
    const html = raw && String(raw).trim() !== '' ? raw : `<p>${fallback}</p>`;
  
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p','br','ul','ol','li',
        'b','strong','i','em','u','s',
        'h1','h2','h3','h4','h5','h6',
        'blockquote','span','a',
        'table','thead','tbody','tr','th','td',
        'img'
      ],
      ALLOWED_ATTR: ['href','title','target','rel','class','src','alt','width','height'],
    });
  }, [product?.description]);


  // Promo liée à la catégorie (optionnel)
  const promotion = useMemo(
    () => promotionCodes.find((p) => String(p.id) === String(product?.idPromotionCode)) || null,
    [promotionCodes, product]
  );

  // Images
  const productImages = useMemo(() => {
    if (!product) return [{ url: '/Images/placeholder.jpg', position: 1 }];
    const list = images.filter((i) => String(i.idProduct) === String(product.id));
    return list.length ? list : [{ url: '/Images/placeholder.jpg', position: 1 }];
  }, [images, product]);

  // Vidéos — NE PAS TOUCHER
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

  // ===== Galerie =====
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentImage = productImages[currentIndex]?.url || '/Images/placeholder.jpg';
  const [mainLoaded, setMainLoaded] = useState(false);
  useEffect(() => setMainLoaded(false), [currentImage]);

  // ===== Lightbox =====
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

  // ===== (NOUVEAU) Détection mobile
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


  const computeBadgeFromProduct = (product, promotionCodes = []) => {
    if (!product) return { badgePct: null, refPriceTtc: null, until: null, source: null };
  
    const now = new Date();
    const isActive = (end) => !!end && now <= new Date(end);
  
    // End dates (mêmes règles que calculPrice)
    const endProd = product?.promotions?.[0]?.endDate;
  
    const subPromoId =
      product?.subCategoryVm?.promotionCodes?.[0]?.id ??
      product?.subCategoryVm?.idPromotionCode ??
      null;
  
    const catPromoId =
      product?.categoryVm?.promotionCodes?.[0]?.id ??
      product?.categoryVm?.idPromotionCode ??
      null;
  
    const endSub = promotionCodes.find(p => p.id === subPromoId)?.endDate;
    const endCat = promotionCodes.find(p => p.id === catPromoId)?.endDate;
  
    // Base/ref prices en HT pour calcul du %
    const baseHt  = typeof product?.price === 'number' ? product.price : parseFloat(product?.price ?? 0);
    const subHt   = product?.priceHtSubCategoryCodePromoted;
    const catHt   = product?.priceHtCategoryCodePromoted;
    const prodHt  = product?.priceHtPromoted;
  
    // Pour l’affichage du prix barré, on repasse en TTC
    const tvaMultiplier = ((product?.tva ?? 0) / 100) + 1;
    const tax = product?.taxWithoutTvaAmount ?? 0;
    const refPriceTtc = (baseHt ?? 0) * tvaMultiplier + tax;
  
    const pctFrom = (ht) => {
      if (!ht || !baseHt || baseHt <= 0) return null;
      const pct = Math.round((1 - (ht / baseHt)) * 100);
      return Number.isFinite(pct) && pct > 0 ? pct : null;
    };
  
    // Même priorité que calculPrice
    if (subHt != null && isActive(endSub)) {
      return { badgePct: pctFrom(subHt), refPriceTtc, until: endSub, source: 'subcategory' };
    }
    if (catHt != null && isActive(endCat)) {
      return { badgePct: pctFrom(catHt), refPriceTtc, until: endCat, source: 'category' };
    }
    if (prodHt != null && isActive(endProd)) {
      return { badgePct: pctFrom(prodHt), refPriceTtc, until: endProd, source: 'product' };
    }
    return { badgePct: null, refPriceTtc: null, until: null, source: 'base' };
  };
  



  // ===== Helpers prix/promo =====
  const toNum = (x) => {
    const n = typeof x === 'number' ? x : parseFloat(x);
    return Number.isFinite(n) ? n : null;
  };

  //const priceRef = useMemo(() => toNum(product?.priceTtc) ?? 0, [product]);


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

  // Promo produit (première active)
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

  // Règles de prix
  const priceFromCategoryCode    = toNum(product?.priceHtCategoryCodePromoted);
  const priceFromSubCategoryCode = toNum(product?.priceHtSubCategoryCodePromoted);
  const priceHtPromoted          = toNum(product?.priceHtPromoted);
  const price                    = toNum(product?.price);

  const pctFromCategoryCode = product?.purcentageCodePromoted != null && product.purcentageCodePromoted !== ''
    ? Number(product.purcentageCodePromoted)
    : null;

  const productPromoPct = activePromo ? Number(activePromo.purcentage) || 0 : 0;


  const displayPrice = calculPrice(product, promotionCodes);

// ⬇️ nouveau calcul du badge + prix de référence (aligné avec calculPrice)
const { badgePct, refPriceTtc, until: promoUntilDate } = useMemo(
  () => computeBadgeFromProduct(product, promotionCodes),
  [product, promotionCodes]
);


// ancien priceRef -> devient refPriceTtc si dispo, sinon ton fallback
const priceRef = useMemo(
  () => (Number.isFinite(refPriceTtc) ? refPriceTtc : toNum(product?.priceTtc) ?? 0),
  [refPriceTtc, product]
);


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
      stockForProduct?.Qty ??
      0
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

  // Specs
  const { specs } = ProductSpecs(pid, product) || { specs: {} };

  // Vidéo autoplay — NE PAS TOUCHER
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

  // ⛑️ garde un état minimal si le produit n'est pas encore chargé
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
      {/* Zone haute: galerie + infos achat */}
      <div className="product-main">
        {/* Vignettes */}
        <div className="thumbs-col">
          {productImages.map((img, idx) => (
            <button
              key={img.position || idx}
              className="thumb"
              onClick={() => {
                if (isMobile) {
                  openLightbox(idx);
                } else {
                  setCurrentIndex(idx);
                }
              }}
              aria-label={`Voir image ${idx + 1}`}
              type="button"
            >
              <img loading="lazy" src={toMediaUrl(img.url)} alt={`Miniature ${idx + 1} de ${product?.name || 'Produit'}`} />
            </button>
          ))}
        </div>

        {/* Image principale */}
        <div className="product-main-image-wrap bg-white" onClick={() => openLightbox(currentIndex)} role="button" tabIndex={0}>
          {!mainLoaded && <div className="img-skeleton" aria-hidden="true" />}
          <img
            className={`product-main-image ${mainLoaded ? 'is-loaded' : ''}`}
            src={toMediaUrl(currentImage)}
            alt={product?.name || 'Produit'}
            onLoad={() => setMainLoaded(true)}
          />
        </div>

        {/* Détails */}
        <div className="product-details">
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
                  <div className="promo-until">
                    Jusqu'au {promoUntil} inclus
                  </div>
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
        </div>
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={closeLightbox}>
          <button className="lb-close" type="button" aria-label="Fermer" onClick={closeLightbox}>×</button>
          <button className="lb-prev"  type="button" aria-label="Précédent" onClick={(e) => { e.stopPropagation(); prev();  }}>‹</button>
          <img
            className="lb-img"
            src={toMediaUrl(productImages[lightboxIndex]?.url)}
            alt={`Image ${lightboxIndex + 1} de ${product?.name || 'Produit'}`}
            onClick={(e) => e.stopPropagation()}
          />
          <button className="lb-next"  type="button" aria-label="Suivant" onClick={(e) => { e.stopPropagation(); next(); }}>›</button>
        </div>
      )}

      {/* Description */}
      {/* <hr className="section-divider" aria-hidden="true" /> */}


      <section className='mt-5'>
      <h2 className="specs-title">Description</h2>

          <div
            className="product-desc product-description-html mb-3 bg-description"
            // ⬇️ injection contrôlée (sanitized)
            dangerouslySetInnerHTML={{ __html: cleanDescriptionHtml }}
          />
      </section>
      {/* Vidéo — NE PAS TOUCHER */}
      {hasVideo && (
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
      )}

{/* <hr className="section-divider " aria-hidden="true" /> */}
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
          { label: "Fermer", variant: "light", onClick: closeAdded },
          { label: "Voir mon panier", variant: "primary", onClick: goToCart, autoFocus: true },
        ]}
      />
    </div>
  );
};
