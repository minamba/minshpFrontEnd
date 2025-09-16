import React, { useMemo, useState, useEffect } from 'react';
import '../../App.css';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from "react-router-dom";
import { addToCartRequest, saveCartRequest } from '../../lib/actions/CartActions';
import { GenericModal } from '../../components/index';
import { calculPrice } from '../../lib/utils/Helpers';

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

  const NEW_MAX = 4;

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
    return [...galleryProducts]
      .sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate))
      .slice(0, NEW_MAX);
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

        <div className="new-grid">
          {newestProducts.map((product, index) => {
            const img = getProductImage(product.id);
            const name = product.brand + " " + product.model || product.title || `Produit ${index + 1}`;

            // Prix de référence
            const priceRef = Number(
              typeof product.priceTtc === 'number' ? product.priceTtc : parseFloat(product.priceTtc)
            ) || 0;

            // ==== PROMO PRODUIT (dates inclusives, fin à 23:59:59) ====
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

            const discountPct   = hasProductPromo ? Number(p0.purcentage) : 0;
            const computedPromo = +(priceRef * (1 - discountPct / 100)).toFixed(2);
            const promotedVal   = Number(
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
              Number.isFinite(subCatCodeVal) ? subCatCodeVal :
              (Number.isFinite(catCodeVal) ? catCodeVal : null);

            // ==== Prix affiché & indicateurs UI ====
            const displayPrice = calculPrice(product);
            const hasAnyPromo  = (codePrice != null) || (productPromoPrice != null);

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
                      const payloadItem = { id: product.id, name, price: displayPrice, image: img, packageProfil: product.packageProfil, containedCode: product.containedCode };
                      dispatch(addToCartRequest(payloadItem, 1));
                      setLastAdded({ id: product.id, name });
                      setShowAdded(true);
                    }}
                  >
                    <i className="bi bi-cart-plus" aria-hidden="true"></i>
                  </button>
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
