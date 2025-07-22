import React from 'react';
import '../../App.css';
import { useSelector } from 'react-redux';

export const Home = () => {
const prodductsfromStore = useSelector((state) => state.products.products) || [];
const imagesfromStore = useSelector((state) => state.images.images) || [];
const videosfromStore = useSelector((state) => state.videos.videos) || [];
const mainProduct = prodductsfromStore.find((p) => p.main === true);

const mainProductImages = mainProduct
    ? imagesfromStore.filter((i) => i.idProduct === mainProduct.id)
    : [];

const mainProductVideos = mainProduct
    ? videosfromStore.filter((v) => v.idProduct === mainProduct.id)
    : [];

console.log("prodductsfromStore blabla : ", prodductsfromStore);
console.log("imagesfromStore blabla : ", imagesfromStore);
console.log("videosfromStore blabla : ", videosfromStore);
console.log("mainProduct : ", mainProduct);
console.log("mainProductImages: ", mainProductImages);
console.log("mainProductVideos : ", mainProductVideos);


const getProductImage = (id) => {
    const product = prodductsfromStore.find((p) => p.id === id);
    const images = imagesfromStore.filter((i) => i.idProduct === id);
    return images.length > 0 ? images[0].url : null;
};

  return (
    <div className="home-container">
      {/* HERO SECTION */}
      <section className="hero-section">
      {mainProductVideos.length > 0 && mainProductVideos[0].url ? (
          <video className="hero-video" autoPlay muted loop>
            <source src={mainProductVideos[0].url} type="video/mp4" />
          </video>
        ) : (
          <p>Vidéo manquante</p>
        )}
        <div className="hero-content text-center">
          <h1 className="hero-title">{mainProductVideos[0]?.title || 'Titre manquant'}</h1>
          <p className="hero-subtitle">{mainProductVideos[0]?.description || 'Description manquante'}</p>
          <a href="#features" className="hero-button">Découvrir</a>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features-section" id="features">
        <div className="feature" data-aos="fade-up">
          <div className="feature-text">
            <h2>{mainProductImages[0]?.title || 'Titre manquant'}</h2>
            <p>{mainProductImages[0]?.description || 'Description manquante'}</p>
          </div>
          <img src={mainProductImages[0]?.url || '/Images/placeholder.jpg'} alt="Design minimaliste" />
        </div>

        <div className="feature reverse" data-aos="fade-up">
          <div className="feature-text">
            <h2>{mainProductImages[1]?.title || 'Titre manquant'}</h2>
            <p>{mainProductImages[1]?.description || 'Description manquante'}</p>
          </div>
          <img src={mainProductImages[1]?.url || '/Images/placeholder.jpg'} alt="Qualité d'image 4K" />
        </div>

        <div className="feature" data-aos="fade-up">
          <div className="feature-text">
            <h2>{mainProductImages[2]?.title || 'Titre manquant'}</h2>
            <p>{mainProductImages[2]?.description || 'Description manquante'}</p>
          </div>
          <img src={mainProductImages[2]?.url || '/Images/placeholder.jpg'} alt="Son immersif" />
        </div>
      </section>

      {/* GALLERY SECTION */}
      <section className="gallery-section">
        <h2 data-aos="fade-up">Galerie</h2>
        <div className="gallery-grid">
          {prodductsfromStore.map((p, index) => (
            <div key={index} className="gallery-item" data-aos="zoom-in">
              <img src={getProductImage(p.id)} alt={`Projecteur ${index + 1}`} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
