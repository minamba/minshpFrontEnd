import React, { useMemo, useState, useEffect } from 'react';
import '../../App.css';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from "react-router-dom";
import { addToCartRequest, saveCartRequest } from '../../lib/actions/CartActions';
import { GenericModal } from '../../components/index';

export const Home = () => {
  const products  = useSelector((state) => state.products.products) || [];
  const images    = useSelector((state) => state.images.images) || [];
  const videos    = useSelector((state) => state.videos.videos) || [];
  const categoriesFromStore = useSelector((state) => state.categories.categories) || [];
  const items     = useSelector((state) => state.items.items) || [];
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const [showAdded, setShowAdded] = useState(false);
  const [lastAdded, setLastAdded] = useState(null);

  useEffect(() => { dispatch(saveCartRequest(items)); }, [items, dispatch]);

  const mainProduct = products.find((p) => p.main === true);
  const galleryProducts = products.filter((p) => p.id !== mainProduct?.id);

  const mainProductImages = mainProduct
    ? images.filter((i) => i.idProduct === mainProduct.id)
    : [];

  const mainProductVideos = mainProduct
    ? videos.filter((v) => v.idProduct === mainProduct.id)
    : [];

  const heroVideo = mainProductVideos.find((vid) => vid.position === 1);

  const getProductImage = (id) => {
    const productImages = images.filter((i) => i.idProduct === id);
    return productImages.length > 0 ? productImages[0].url : '/Images/placeholder.jpg';
  };

  const getCategoryImage = (idCategory) => {
    const image = images.find((i) => i.idCategory === idCategory);
    return image ? image.url : '/Images/placeholder.jpg';
  };

  const parseDate = (val) => {
    if (!val) return null;
    const d = new Date(val);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const newestEightProducts = useMemo(() => {
    return [...galleryProducts]
      .sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate))
      .slice(0, 8);
  }, [galleryProducts]);

  const closeAdded = () => setShowAdded(false);
  const goToCart = () => { setShowAdded(false); navigate('/cart'); };

  return (
    <div className="home-container">
      {/* HERO */}
      <section className="hero-section">
        {heroVideo?.url ? (
          <video className="hero-video" autoPlay muted loop>
            <source src={heroVideo.url} type="video/mp4" />
          </video>
        ) : (
          <p>Vidéo manquante</p>
        )}

        <div className="hero-content text-center">
          <h1 className="hero-title">{heroVideo?.title || 'Titre manquant'}</h1>
          <p className="hero-subtitle">{heroVideo?.description || 'Description manquante'}</p>
          <a href="#features" className="hero-button">Découvrir</a>
        </div>
      </section>

      {/* FEATURES */}
      {mainProductImages.length > 0 && (
        <section className="features-section" id="features">
          {mainProductImages.map((image, index) => {
            if (!image) return null;
            return (
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
                  src={image.url || '/Images/placeholder.jpg'}
                  alt={image.title || `Image ${image.position}`}
                />
              </div>
            );
          })}

          <div className="features-cta">
            {mainProduct && (
              <Link to={`/product/${mainProduct.id}`} className="btn-pill btn-primary">
                En savoir plus
              </Link>
            )}
          </div>
        </section>
      )}

      {/* CATEGORIES */}
      {categoriesFromStore.length > 0 && (
        <section className="categories-section section-alt bg-light" id="categories">
          <div className="new-header">
            <h2 className="new-title">Catégories</h2>
          </div>

          <div className="categories-grid">
            {categoriesFromStore.map((cat) => (
              <article key={cat.name} className="category-card" data-aos="zoom-in">
                <h3 className="category-title">{cat.name}</h3>
                <img
                  src={getCategoryImage(cat.id)}
                  alt={`Catégorie ${cat.name}`}
                  className="category-image"
                  onClick={() => navigate(`/category/${cat.id}`)}
                />
              </article>
            ))}
          </div>
        </section>
      )}

      {/* NOUVEAUTÉS */}
      <section className="new-section" id="nouveautes">
        <div className="new-header">
          <h2 className="new-title">Nouveautés</h2>
          <div className="new-actions">
            <button type="button" className="icon-btn" aria-label="Précédent">‹</button>
            <button type="button" className="icon-btn" aria-label="Voir plus">+</button>
          </div>
        </div>

        <div className="new-grid">
          {newestEightProducts.map((product, index) => {
            const img = getProductImage(product.id);
            const name = product.brand + " " + product.model || product.title || `Produit ${index + 1}`;

            // Prix de référence
            const priceRef = Number(
              typeof product.priceTtc === 'number' ? product.priceTtc : parseFloat(product.priceTtc)
            ) || 0;

            // Promo PRODUIT (prend la 1ère et vérifie dates)
            const p0 = product?.promotions?.[0];
            const hasProductPromo = (() => {
              if (!p0) return false;
              const pct = Number(p0.purcentage) || 0;
              if (pct <= 0) return false;
              const start = parseDate(p0.startDate);
              const end   = parseDate(p0.endDate);
              const now = new Date();
              const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0,0,0,0);
              if (start && start.getTime() > now.getTime()) return false;
              if (end && end.getTime() < startOfToday.getTime()) return false;
              return true;
            })();

            const discountPct   = hasProductPromo ? Number(p0.purcentage) : 0;
            const computedPromo = +(priceRef * (1 - discountPct / 100)).toFixed(2);
            const promoted      = Number(
              typeof product.priceTtcPromoted === 'number'
                ? product.priceTtcPromoted
                : parseFloat(product.priceTtcPromoted)
            );

            // 👉 Promo par CODE CATEGORIE : si définie, on l’utilise comme prix promo
            const priceCat = (() => {
              const v = typeof product.priceTtcCategoryCodePromoted === 'number'
                ? product.priceTtcCategoryCodePromoted
                : parseFloat(product.priceTtcCategoryCodePromoted);
              return Number.isFinite(v) ? v : null;
            })();
            const hasCategoryPromo = priceCat !== null;

            // Prix affiché
            const displayPrice = hasCategoryPromo
              ? priceCat
              : (hasProductPromo ? (Number.isFinite(promoted) ? promoted : computedPromo) : priceRef);

            // Pour l’UI (pastille + ancien prix en barré)
            const hasAnyPromo = hasCategoryPromo || hasProductPromo;

            const [euros, cents] = displayPrice.toFixed(2).split('.');

            // Statut stock
            const raw = (product?.stockStatus ?? '').trim();
            const lower = raw.toLowerCase();
            const isIn   = lower === 'en stock';
            const isOut  = lower === 'en rupture';
            const stockCls = isIn ? 'in' : isOut ? 'out' : 'warn';
            const stockLabel =
              lower.includes('plus que') ? 'Bientôt en rupture' :
              raw || 'Disponibilité limitée';

            return (
              <article key={product.id} className="product-card" data-aos="zoom-in">
                <div className="product-thumb">
                  <Link to={`/product/${product.id}`} className="thumb-link">
                    <img src={img} alt={name} />
                  </Link>

                  {hasAnyPromo && <span className="promo-pill">Promotion</span>}

                  <div className="thumb-overlay" aria-hidden="true" />
                  <button
                    type="button"
                    className="thumb-add-btn"
                    title="Ajouter au panier"
                    aria-label="Ajouter au panier"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const payloadItem = { id: product.id, name, price: displayPrice, image: img };
                      dispatch(addToCartRequest(payloadItem, 1));
                      setLastAdded({ id: product.id, name });
                      setShowAdded(true);
                    }}
                  >
                    <i className="bi bi-cart-plus" aria-hidden="true"></i>
                  </button>
                </div>

                <h3 className="product-name">{name}</h3>

                {/* Statut + prix (pile à droite) */}
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
                    <div className={`product-price ${hasAnyPromo ? 'product-price--promo' : ''}`}>
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
