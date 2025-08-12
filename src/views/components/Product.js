import React, { useMemo, useState } from 'react';
import '../../App.css';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import {ProductSpecs} from '../../components/index';

export const Product = () => {
  const { id } = useParams(); // /product/:id
  const pid = Number(id);
  const dispatch = useDispatch();

  // --- Sélecteurs (adapte les paths si besoin)
  const products = useSelector((s) => s.products.products) || [];
  const images = useSelector((s) => s.images.images) || [];

  // --- Produit courant
  const product = useMemo(
    () => products.find((p) => String(p.id) === String(id)) || products[0],
    [products, id]
  );

  // --- Images du produit (fallback placeholder)
  const productImages = useMemo(() => {
    if (!product) return [];
    const list = images.filter((i) => i.idProduct === product.id);
    return list.length ? list : [{ url: '/Images/placeholder.jpg', position: 1 }];
  }, [images, product]);

  // --- Galerie
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentImage = productImages[currentIndex]?.url || '/Images/placeholder.jpg';

  // --- Prix (euros + centimes)
  const priceNum = typeof product?.price === 'number' ? product.price : parseFloat(product?.price);
  const hasPrice = Number.isFinite(priceNum);
  const euros = hasPrice ? Math.floor(priceNum) : 0;
  const cents = hasPrice ? Math.round((priceNum - Math.floor(priceNum)) * 100).toString().padStart(2, '0') : '00';

  // --- Quantité
  const [qty, setQty] = useState(1);

  const addToCart = () => {
    // Si tu as un slice cart:
    // dispatch(cartActions.addItem({ productId: product.id, qty }));
    console.log('ADD TO CART ->', { productId: product?.id, qty });
    alert('Produit ajouté au panier (exemple)');
  };

  // --- Caractéristiques
  const specs = ProductSpecs(pid);

  const sections = Object.keys(specs);

  return (
    <div className="product-page">
      {/* Zone haute: galerie + infos achat */}
      <div className="product-main">
        {/* Thumbnails verticales */}
        <div className="thumbs-col">
          {productImages.map((img, idx) => (
            <button
              key={img.position || idx}
              className={`thumb ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Voir image ${idx + 1}`}
              type="button"
            >
              <img src={img.url} alt={`Aperçu ${idx + 1}`} />
            </button>
          ))}
        </div>

        {/* Image principale */}
        <img className="product-main-image" src={currentImage} alt={product?.name || 'Produit'} />

        {/* Détails / achat */}
        <div className="product-details">
          <p className="product-brand">{product?.brand || ''}</p>
          <h1>{product?.name || product?.title || 'Produit'}</h1>

          <p className="product-description">
            {product?.description ||
              'Description du produit. Texte court présentant les points forts et le positionnement.'}
          </p>

          {hasPrice && (
            <div className="product-price">
              <span className="euros">{euros}€</span>
              <sup className="cents">{cents}</sup>
            </div>
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
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>

            <button className="buy-button buy-accent" onClick={addToCart}>
              🛍️&nbsp;Ajouter au panier
            </button>
          </div>
        </div>
      </div>

      {/* Caractéristiques techniques */}
      <section className="specs-wrap">
        <h2 className="specs-title">Caractéristiques techniques : {product?.name}</h2>

        <div className="specs-layout">
          {/* Sidebar des ancres */}
          <nav className="specs-nav">
            {sections.map((s) => (
              <a key={s} href={`#${s.replace(/\s+/g, '')}`}>{s}</a>
            ))}
          </nav>

            {/* Contenu des sections */}
            <div className="specs-content">
              {sections.map((s) => (
                <section key={s} id={s.replace(/\s+/g, '')} className="specs-section">
                  <h3>{s}</h3>
                  <div className="specs-table">
                    {specs[s].map((row, i) => {
                      const value =
                        row.value === undefined || row.value === null || row.value === "" ? "—" : row.value;
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
