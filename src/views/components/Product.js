import React, { useState } from 'react';
import { CartDrawer } from './CartDrawer';
import '../../App.css';

export const Product = () => {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const product = {
    id: 1,
    name: 'Projecteur Ultime 4K HDR',
    price: 4990,
    color: 'Black',
    image: 'https://source.unsplash.com/1000x800/?projector',
  };

  const handleAddToCart = () => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      setCart(cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    setCartOpen(true);
  };

  const sortedProducts = [...productsFromStore].sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    return nameA.localeCompare(nameB);
  });

  return (
    <div className="product-page">
      <div className="product-main">
        <img src={product.image} alt={product.name} className="product-main-image" />
        <div className="product-details">
          <h1>{product.name}</h1>
          <p className="product-description">
            Transformez votre salon en cinéma avec une qualité 4K HDR et un son immersif.
          </p>
          <p className="product-price">{product.price.toLocaleString()} €</p>
          <button className="buy-button" onClick={handleAddToCart}>Ajouter au panier</button>
          <div className="product-characteristics">
            <h2>Caractéristiques</h2>
            <ul>
              <li>Résolution native 4K (4096x2160)</li>
              <li>Technologie HDR10 / HLG</li>
              <li>Luminosité 2000 lumens</li>
              <li>Compatibilité HDMI 2.1</li>
            </ul>
          </div>
        </div>
      </div>
      <CartDrawer cart={cart} onClose={() => setCartOpen(false)} isOpen={cartOpen} />
    </div>
  );
};
