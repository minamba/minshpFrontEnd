import React from 'react';
import '../../App.css';

export const Cart = ({ cart, onClose, isOpen }) => {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
      <div className="cart-header">
        <h2>Panier ({cart.reduce((sum, item) => sum + item.quantity, 0)})</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      <div className="cart-items">
        {cart.map((item) => (
          <div className="cart-item" key={item.id}>
            <img src={item.image} alt={item.name} />
            <div>
              <h3>{item.name}</h3>
              <p>{item.price.toLocaleString()} €</p>
              <p>Quantité : {item.quantity}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-total">
        <p>Total : {total.toLocaleString()} €</p>
      </div>
      <div className="cart-actions">
        <button className="cart-button">Panier</button>
        <button className="cart-button">Commander</button>
      </div>
    </div>
  );
};
