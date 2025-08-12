import React, { useMemo, useState, useEffect, useRef } from 'react';
import '../../App.css';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { ProductSpecs } from '../../components/index';

export const Product = () => {
  const { id } = useParams();
  const pid = Number(id);
  const dispatch = useDispatch();

  // --- Store
  const products = useSelector((s) => s.products.products) || [];
  const images   = useSelector((s) => s.images.images) || [];
  const videos   = useSelector((s) => s.videos?.videos) || [];

  // --- Produit
  const product = useMemo(
    () => products.find((p) => String(p.id) === String(id)) || products[0],
    [products, id]
  );

  // --- Images
  const productImages = useMemo(() => {
    if (!product) return [];
    const list = images.filter((i) => i.idProduct === product.id);
    return list.length ? list : [{ url: '/Images/placeholder.jpg', position: 1 }];
  }, [images, product]);

  // --- Vidéos
  const productVideos = useMemo(() => {
    if (!product) return [];
    return (videos || []).filter((v) => v.idProduct === product.id);
  }, [videos, product]);

  const heroVideo = useMemo(
    () => productVideos.find((v) => v.position === 1) || productVideos[0],
    [productVideos]
  );

  const hasVideo = useMemo(
    () => Boolean(heroVideo?.url && String(heroVideo.url).trim() !== ''),
    [heroVideo]
  );

  // --- Galerie
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentImage = productImages[currentIndex]?.url || '/Images/placeholder.jpg';

  const [mainLoaded, setMainLoaded] = useState(false);
  useEffect(() => setMainLoaded(false), [currentImage]);

  // --- Lightbox
  const [isLightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const openLightbox = (idx) => { setLightboxIndex(idx); setLightboxOpen(true); };
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

  // --- Prix
  const priceNum = typeof product?.price === 'number' ? product.price : parseFloat(product?.price);
  const hasPrice = Number.isFinite(priceNum);
  const euros = hasPrice ? Math.floor(priceNum) : 0;
  const cents = hasPrice ? Math.round((priceNum - Math.floor(priceNum)) * 100).toString().padStart(2, '0') : '00';

  // --- Achat
  const [qty, setQty] = useState(1);
  const addToCart = () => {
    console.log('ADD TO CART ->', { productId: product?.id, qty });
    alert('Produit ajouté au panier (exemple)');
  };

  // --- Specs
  const specs = ProductSpecs(pid);
  const sections = Object.keys(specs);

  // --- Autoplay vidéo + blocage téléchargement / clic droit
  const videoRef = useRef(null);

  useEffect(() => {
    if (!hasVideo || !videoRef.current) return;
    const v = videoRef.current;
    v.muted = true; // requis pour autoplay
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
    <div
      className="product-page"
      onContextMenu={handleContextMenu}
      style={{ WebkitTouchCallout: 'none', userSelect: 'none' }}
    >
      {/* Zone haute: galerie + infos achat */}
      <div className="product-main">
        {/* Thumbnails */}
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
        <div className="product-details" style={{ position: 'sticky', top: '1rem', alignSelf: 'flex-start' }}>
          <p className="product-brand">{product?.brand || ''}</p>

          {/* Titre CENTRÉ */}
          <h1 className="product-title product-title--center">
            {product?.name || product?.title || 'Produit'}
          </h1>

          {/* Contenu aligné à droite du titre (comme avant) */}
          <div className="details-stack">
            {/* (description sous le titre SUPPRIMÉE) */}

            {hasPrice && (
              <>
                <div className="product-price">
                  <span className="euros">{euros}€</span>
                  <sup className="cents">{cents}</sup>
                </div>

                {/* Nouvelle ligne sous le prix (même style que la description) */}
                <p className="product-description" style={{ marginTop: '.25rem' }}>
                  Taxes incluses&nbsp;–&nbsp;Frais de livraison calculés lors du paiement.
                </p>
              </>
            )}

            <div className="stock-row">
              <span className="stock-dot in" /> <span>En stock</span>
            </div>

            <div className="buy-row">
              <select
                className="qty-select"
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                aria-label="Quantité"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>

              <button className="buy-button buy-accent" onClick={addToCart}>
                🛍️&nbsp;Ajouter au panier
              </button>
            </div>

            {/* Infos livraison */}
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

      {/* ===== Description globale (section sous le bloc achat) — tu peux la garder ou la retirer si doublon ===== */}
      <section className="product-desc">
        <h2>Description</h2>
        <p>
          {product?.description ||
            'Découvrez ce produit au design soigné et aux performances solides. Idéal pour un usage quotidien comme pour les usages intensifs.'}
        </p>
      </section>

      {/* ===== Vidéo ===== */}
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

      {/* ===== Caractéristiques techniques ===== */}
      <section className="specs-wrap">
        <h2 className="specs-title">Caractéristiques techniques : {product?.name}</h2>

        <div className="specs-layout">
          <nav className="specs-nav">
            {sections.map((s) => (
              <a key={s} href={`#${s.replace(/\s+/g, '')}`}>{s}</a>
            ))}
          </nav>

          <div className="specs-content">
            {sections.map((s) => (
              <section key={s} id={s.replace(/\s+/g, '')} className="specs-section">
                <h3>{s}</h3>
                <div className="specs-table">
                  {specs[s].map((row, i) => {
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
    </div>
  );
};
