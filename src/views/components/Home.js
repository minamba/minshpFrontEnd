import React, { useMemo, useState } from 'react';
import '../../App.css';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from "react-router-dom";
import { addToCartRequest } from '../../lib/actions/CartActions';
import { GenericModal } from '../../components/index';

export const Home = () => {
  const products = useSelector((state) => state.products.products) || [];
  const images = useSelector((state) => state.images.images) || [];
  const videos = useSelector((state) => state.videos.videos) || [];
  const categoriesFromStore = useSelector((state) => state.categories.categories) || [];
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showAdded, setShowAdded] = useState(false);
  const [lastAdded, setLastAdded] = useState(null);

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
    return productImages.length > 0 ? productImages[0].url : null;
  };

  const getCategoryImage = (idCategory) => {
    const image = images.find((i) => i.idCategory === idCategory);
    return image ? image.url : '/Images/placeholder.jpg';
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
      {/* HERO SECTION */}
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

      {/* FEATURES SECTION */}
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

      {/* CATEGORIES SECTION */}
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
            const img = getProductImage(product.id) || '/Images/placeholder.jpg';
            const raw = product.price;
            const priceNum = typeof raw === 'number' ? raw : parseFloat(raw);
            const hasPrice = Number.isFinite(priceNum);
            const euros = hasPrice ? Math.floor(priceNum) : null;
            const cents = hasPrice ? Math.round((priceNum - Math.floor(priceNum)) * 100).toString().padStart(2,'0') : null;
            const name = product.name || product.title || `Produit ${index + 1}`;

            return (
              <article key={product.id} className="product-card" data-aos="zoom-in">
                <div className="product-thumb">
                  <Link to={`/product/${product.id}`} className="thumb-link">
                    <img src={img} alt={name} />
                  </Link>

                  <div className="thumb-overlay" aria-hidden="true" />

                  <button
                    type="button"
                    className="thumb-add-btn"
                    title="Ajouter au panier"
                    aria-label="Ajouter au panier"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Envoie au store
                      dispatch(addToCartRequest(product, 1));
                      // Mémorise l’article pour le message de la modale
                      setLastAdded({ id: product.id, name });
                      setShowAdded(true);
                    }}
                  >
                    <i className="bi bi-cart-plus" aria-hidden="true"></i>
                  </button>
                </div>

                <h3 className="product-name">{name}</h3>
                {hasPrice && (
                  <div className="product-price">
                    <span className="euros">{euros}€</span>
                    <sup className="cents">{cents}</sup>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* MODALE : confirmation d’ajout au panier */}
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
