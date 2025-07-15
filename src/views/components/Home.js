import React from 'react';
import '../../App.css';

export const Home = () => {
  const galleryImages = [
    'https://source.unsplash.com/800x600/?projector,home-cinema',
    'https://source.unsplash.com/800x600/?projector,technology',
    'https://source.unsplash.com/800x600/?projector,living-room',
    'https://source.unsplash.com/800x600/?projector,screen',
    'https://source.unsplash.com/800x600/?projector,speaker',
    'https://source.unsplash.com/800x600/?projector,modern',
  ];

  return (
    <div className="home-container">
      {/* HERO SECTION */}
      <section className="hero-section">
        <video className="hero-video" autoPlay muted loop>
          <source src="/Videos/xgimi.mp4" type="video/mp4" />
        </video>
        <div className="hero-content text-center">
          <h1 className="hero-title">Le Projecteur Ultime</h1>
          <p className="hero-subtitle">L'expérience cinéma à domicile réinventée.</p>
          <a href="#features" className="hero-button">Découvrir</a>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features-section" id="features">
        <div className="feature" data-aos="fade-up">
          <div className="feature-text">
            <h2>Design minimaliste</h2>
            <p>Un design épuré qui s'intègre parfaitement à votre espace de vie.</p>
          </div>
          <img src="https://source.unsplash.com/800x600/?projector,design" alt="Design minimaliste" />
        </div>

        <div className="feature reverse" data-aos="fade-up">
          <div className="feature-text">
            <h2>Qualité d'image 4K HDR</h2>
            <p>Des images d'une netteté et d'une profondeur exceptionnelles.</p>
          </div>
          <img src="https://source.unsplash.com/800x600/?projector,4k" alt="Qualité d'image 4K" />
        </div>

        <div className="feature" data-aos="fade-up">
          <div className="feature-text">
            <h2>Son immersif</h2>
            <p>Un son qui vous enveloppe, pour une immersion totale.</p>
          </div>
          <img src="https://source.unsplash.com/800x600/?sound,speaker" alt="Son immersif" />
        </div>
      </section>

      {/* GALLERY SECTION */}
      <section className="gallery-section">
        <h2 data-aos="fade-up">Galerie</h2>
        <div className="gallery-grid">
          {galleryImages.map((src, index) => (
            <div key={index} className="gallery-item" data-aos="zoom-in">
              <img src={src} alt={`Projecteur ${index + 1}`} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
