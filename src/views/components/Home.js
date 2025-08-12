import React from 'react';
import '../../App.css';
import { useSelector } from 'react-redux';
import { Link } from "react-router-dom";

export const Home = () => {
  const products = useSelector((state) => state.products.products) || [];
  const images = useSelector((state) => state.images.images) || [];
  const videos = useSelector((state) => state.videos.videos) || [];

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

  // Catégories (nom + 1 image)
  const categories = React.useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      const key = p.category || 'Autres';
      if (!map.has(key)) {
        map.set(key, {
          name: key,
          image: getProductImage(p.id) || '/Images/placeholder.jpg',
        });
      }
    });
    return Array.from(map.values());
  }, [products, images]);

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

          {/* Bouton sous la features section */}
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
          {categories.length > 0 && (
            <section className="categories-section section-alt" id="categories">
              <div className="new-header">
                <h2 className="new-title">Catégories</h2>
              </div>

              <div className="categories-grid">
                {categories.map((cat) => (
                  <article key={cat.name} className="category-card" data-aos="zoom-in">
                    <h3 className="category-title">{cat.name}</h3>
                    <img
                      src={cat.image}
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

            {/* Petites actions à droite (maquettes) */}
            <div className="new-actions">
              <button type="button" className="icon-btn" aria-label="Précédent">‹</button>
              <button type="button" className="icon-btn" aria-label="Voir plus">+</button>
            </div>
          </div>

          <div className="new-grid">
            {(galleryProducts || []).slice(0, 8).map((product, index) => {
              const img = getProductImage(product.id) || '/Images/placeholder.jpg';

              // prix : supporte number (699.95) ou string "699.95"
              const raw = product.price;
              const priceNum = typeof raw === 'number' ? raw : parseFloat(raw);
              const hasPrice = Number.isFinite(priceNum);
              const euros = hasPrice ? Math.floor(priceNum) : null;
              const cents = hasPrice
                ? Math.round((priceNum - Math.floor(priceNum)) * 100)
                    .toString()
                    .padStart(2, '0')
                : null;

              const name = product.name || product.title || `Produit ${index + 1}`;

              return (
                <article key={product.id} className="product-card" data-aos="zoom-in">
                  <div className="product-thumb">
                    <Link to={`/product/${product.id}`}>
                      <img src={img} alt={name} />
                    </Link>
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

    </div>
  );
};
