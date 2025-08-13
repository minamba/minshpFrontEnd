import React, { useMemo, useState, useEffect, useRef } from 'react';
import '../../App.css';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductSpecs } from '../../components/index';
import { addToCartRequest } from '../../lib/actions/CartActions';
import { GenericModal } from '../../components/index';

export const Product = () => {
  const { id } = useParams();
  const pid = Number(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ⬆️ remonte en haut à chaque arrivée/changement d'id
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [id]);

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

  // --- Achat + modale "Ajouté au panier"
  const [qty, setQty] = useState(1);
  const [showAdded, setShowAdded] = useState(false);

  const addToCart = () => {
    if (!product) return;
    const payloadItem = {
      id: product.id,
      name: product.name || product.title,
      price: priceNum,
      image: currentImage,
    };
    dispatch(addToCartRequest(payloadItem, qty));
    setShowAdded(true); // ouverture de la modale
  };

  // fermer modale / aller au panier
  const closeAdded = () => setShowAdded(false);
  const goToCart = () => {
    setShowAdded(false);
    navigate('/cart');
  };

  // --- Specs
  const specs = ProductSpecs(pid);
  const sections = Object.keys(specs);

  // --- Autoplay vidéo + blocage téléchargement / clic droit
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

          <h1 className="product-title product-title--center">
            {product?.name || product?.title || 'Produit'}
          </h1>

          <div className="details-stack">
            {hasPrice && (
              <>
                <div className="product-price">
                  <span className="euros">{euros}€</span>
                  <sup className="cents">{cents}</sup>
                </div>
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

      {/* ===== Description ===== */}
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

      {/* ===== Caractéristiques ===== */}
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

      {/* ===== Modale d'ajout au panier ===== */}
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
