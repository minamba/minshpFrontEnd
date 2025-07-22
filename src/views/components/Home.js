import React from 'react';
import '../../App.css';
import { useSelector } from 'react-redux';

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
          {[1, 2, 3].map((position, index) => {
            const image = mainProductImages.find((img) => img.position === position);
            if (!image) return null;

            return (
              <div
                key={position}
                className={`feature ${index === 1 ? 'reverse' : ''}`}
                data-aos="fade-up"
              >
                <div className="feature-text">
                  <h2>{image.title || 'Titre manquant'}</h2>
                  <p>{image.description || 'Description manquante'}</p>
                </div>

                <img
                  src={image.url || '/Images/placeholder.jpg'}
                  alt={image.title || `Image ${position}`}
                />
              </div>
            );
          })}
        </section>
      )}

      {/* GALLERY SECTION */}
      <section className="gallery-section">
        <h2 data-aos="fade-up">Galerie</h2>
        <div className="gallery-grid">
          {galleryProducts.map((product, index) => (
            <div key={product.id} className="gallery-item" data-aos="zoom-in">
              <img src={getProductImage(product.id)} alt={`Projecteur ${index + 1}`} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
