import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../../App.css";
import { useDispatch } from "react-redux";
import { updateCartRequest, deleteFromCartRequest } from "../../lib/actions/CartActions";

const PROMOS = {
  PROMO5: 0.05,
  PROMO10: 0.1,
  WELCOME10: 0.1,
};

const fmt = (n) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
    Number.isFinite(n) ? n : 0
  );

export const Cart = () => {
  const dispatch = useDispatch();
  // 1) Sources possibles
  const reduxItems = useSelector((s) => s?.items?.items) || [];
  const products = useSelector((s) => s?.products?.products) || [];
  const images = useSelector((s) => s?.images?.images) || [];
  const usingRedux = reduxItems.length > 0;

  // Fallback localStorage si pas de slice cart
  const lsRaw = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("cart") || "[]");
    } catch {
      return [];
    }
  }, []);

  // 2) Enrichissement (nom, prix, image) à partir du catalogue
  const enrich = (arr) =>
    (arr || []).map((it) => {
      const pid = it.productId ?? it.id;
      const prod = products.find((p) => String(p.id) === String(pid));
      const price = Number(prod?.price ?? it.price ?? 0);
      const name = prod?.name || prod?.title || it.name || "Produit";
      const img =
        images.find((im) => String(im.idProduct) === String(prod?.id))?.url ||
        it.imageUrl ||
        "/Images/placeholder.jpg";

      return {
        id: pid,
        name,
        price,
        qty: Number(it.qty ?? 1),
        imageUrl: img,
      };
    });

  const [items, setItems] = useState(enrich(usingRedux ? reduxItems : lsRaw));

  // resynchronise l'UI dès que le store (ou le catalogue) change
  useEffect(() => {
    const source = usingRedux ? reduxItems : lsRaw;
    setItems(enrich(source));
  }, [usingRedux, reduxItems, lsRaw, products, images]);

  // 3) Gestion locale (quantité, suppression)
  const updateLocalStorage = (next) =>
    localStorage.setItem(
      "cart",
      JSON.stringify(next.map((i) => ({ productId: i.id, qty: i.qty })))
    );

    //gestion locale (quantité, suppression)
    const handleQty = (id, q) => {
      if (usingRedux) {
        const item = reduxItems.find((i) => i.id === id) || { id };
        dispatch(updateCartRequest(item, q));   // <-- met à jour le store ⇒ badge maj
        return;
      }
      const next = items.map((it) => (it.id === id ? { ...it, qty: q } : it));
      setItems(next);
      updateLocalStorage(next);
    };

    //suppression
    const removeItem = (id) => {
      if (usingRedux) {
        dispatch(deleteFromCartRequest(id));   // <-- met à jour le store ⇒ badge maj
        return;
      }
      const next = items.filter((it) => it.id !== id);
      setItems(next);
      updateLocalStorage(next);
    };

  // 4) Promo
  const [promoInput, setPromoInput] = useState("");
  const [appliedCode, setAppliedCode] = useState(null);
  const discountRate = PROMOS[appliedCode] || 0;

  const applyPromo = () => {
    const code = (promoInput || "").trim().toUpperCase();
    if (PROMOS[code]) {
      setAppliedCode(code);
    } else {
      setAppliedCode(null);
      alert("Code promo invalide.");
    }
  };

  // 5) Totaux
  const subTotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const discount = subTotal * discountRate;
  const grandTotal = Math.max(0, subTotal - discount);

  // 6) UX: remonter en haut quand on arrive sur la page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="cart-page">
      <h1 className="cart-title">
        Votre panier : {items.length} produit{items.length > 1 ? "s" : ""}
      </h1>

      <div className="cart-grid">
        {/* Colonne gauche: lignes */}
        <div className="cart-lines">
          {/* En-têtes */}
          <div className="cart-head">
            <span className="col-design">Désignation</span>
            <span className="col-qty">Quantité</span>
            <span className="col-sub">Sous-total</span>
          </div>

          {/* Lignes */}
          {items.length === 0 && (
            <div className="cart-empty">Votre panier est vide.</div>
          )}

          {items.map((it) => (
            <div key={it.id} className="cart-line">
              <div className="line-left">
                <img className="cart-thumb" src={it.imageUrl} alt={it.name} />
                <div className="line-info">
                  <a className="line-name" href={`/product/${it.id}`}>
                    {it.name}
                  </a>
                  <div className="line-stock">
                    <span className="stock-dot in" /> En stock
                  </div>
                </div>
              </div>

              <div className="line-qty">
                <select
                  value={it.qty}
                  onChange={(e) => handleQty(it.id, Number(e.target.value))}
                  className="qty-select"
                >
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div className="line-sub">{fmt(it.price * it.qty)}</div>

              <button
                className="line-remove"
                onClick={() => removeItem(it.id)}
                title="Supprimer"
                aria-label="Supprimer"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>
          ))}

          {/* Code promo */}
          <div className="cart-promo">
            <div className="promo-title">Vous avez un code promo ?</div>
            <div className="promo-row">
              <input
                className="promo-input"
                placeholder="Renseignez votre code ici"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
              />
              <button className="promo-btn" onClick={applyPromo}>
                OK
              </button>
            </div>
            {appliedCode && (
              <div className="promo-applied">
                Code <strong>{appliedCode}</strong> appliqué (-
                {Math.round(discountRate * 100)}%)
              </div>
            )}
          </div>
        </div>

        {/* Colonne droite: récap */}
        <aside className="cart-summary">
          <h3 className="sum-title">Montant total de vos produits</h3>

          <div className="sum-amount">{fmt(grandTotal)}</div>

          {discountRate > 0 && (
            <div className="sum-discount">
              Remise {Math.round(discountRate * 100)}% : −{fmt(discount)}
            </div>
          )}

          <button className="checkout-btn">Passer commande</button>

          <p className="sum-note">
            Prix TTC, TVA appliquée sur la base du pays : France (métropolitaine)
          </p>
        </aside>
      </div>
    </div>
  );
};
