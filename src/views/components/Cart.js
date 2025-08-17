import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../../App.css";
import { Link } from "react-router-dom";
import { updateCartRequest, deleteFromCartRequest, saveCartRequest, getCartRequest } from "../../lib/actions/CartActions";

const PROMOS = {
  PROMO5: 0.05,
  PROMO10: 0.1,
  WELCOME10: 0.1,
};

const fmt = (n) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" })
    .format(Number.isFinite(n) ? n : 0);

export const Cart = () => {
  const dispatch = useDispatch();

  // Source principale : Redux (persisté en "items")
  const reduxItems = useSelector((s) => s?.items?.items) || [];
  const products   = useSelector((s) => s?.products?.products) || [];
  const images     = useSelector((s) => s?.images?.images) || [];
  const usingRedux = reduxItems.length > 0;

  // Fallback localStorage uniquement si Redux est vide
  const lsItems = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("items") || "[]"); }
    catch { return []; }
  }, []);

  // Charger le panier au montage (réhydratation Redux depuis LS si besoin)
  useEffect(() => {
    dispatch(getCartRequest());
  }, [dispatch]);

  // Sauvegarder dès que Redux change (couvre UPDATE/DELETE/etc.)
  useEffect(() => {
    if (usingRedux) {
      dispatch(saveCartRequest(reduxItems));
    }
  }, [usingRedux, reduxItems, dispatch]);

  // Enrichit juste les infos manquantes (nom, image), **ne recalcul PAS le prix**
  const enrich = (arr) =>
    (arr || []).map((it) => {
      const pid  = it.productId ?? it.id;
      const prod = products.find((p) => String(p.id) === String(pid));
      const name = it.name || it.title || prod?.name || prod?.title || "Produit";
      const img =
        it.image || it.imageUrl ||
        images.find((im) => String(im.idProduct) === String(pid))?.url ||
        "/Images/placeholder.jpg";

      // >>> prix : on fait confiance au panier (Redux/LS) <<<
      const price =
        it.price != null
          ? Number(it.price)
          : Number(it.priceTtc ?? prod?.priceTtc ?? 0);

      return {
        id: pid,
        name,
        price,
        qty: Number(it.qty ?? 1),
        imageUrl: img,
      };
    });

  // Tick pour rafraîchir l’UI si besoin (ex: tu veux des effets temporels)
  const [clock, setClock] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setClock(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const sourceItems = usingRedux ? reduxItems : lsItems;
  const [items, setItems] = useState(enrich(sourceItems));

  // Resync UI quand la source (Redux/LS) ou le catalogue change
  useEffect(() => {
    setItems(enrich(usingRedux ? reduxItems : lsItems));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usingRedux, reduxItems, lsItems, products, images, clock]);

  // Gestion locale pour mode "LS only" (quand Redux est vide)
  const persistLsItems = (next) => {
    localStorage.setItem("items", JSON.stringify(
      next.map(i => ({
        id: i.id,
        name: i.name,
        price: i.price,
        qty: i.qty,
        image: i.imageUrl,
      }))
    ));
  };

  const handleQty = (id, q) => {
    if (usingRedux) {
      const item = reduxItems.find((i) => String(i.id) === String(id)) || { id };
      dispatch(updateCartRequest(item, q));
      return;
    }
    const next = items.map((it) => (it.id === id ? { ...it, qty: q } : it));
    setItems(next);
    persistLsItems(next);
  };

  const removeItem = (id) => {
    if (usingRedux) {
      dispatch(deleteFromCartRequest(id));
      return;
    }
    const next = items.filter((it) => it.id !== id);
    setItems(next);
    persistLsItems(next);
  };

  // Code promo panier (optionnel)
  const [promoInput, setPromoInput] = useState("");
  const [appliedCode, setAppliedCode] = useState(null);
  const discountRate = PROMOS[appliedCode] || 0;

  const applyPromo = () => {
    const code = (promoInput || "").trim().toUpperCase();
    if (PROMOS[code]) setAppliedCode(code);
    else { setAppliedCode(null); alert("Code promo invalide."); }
  };

  // Totaux
  const subTotal   = items.reduce((s, it) => s + it.price * it.qty, 0);
  const discount   = subTotal * discountRate;
  const grandTotal = Math.max(0, subTotal - discount);

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
          <div className="cart-head">
            <span className="col-design">Désignation</span>
            <span className="col-qty">Quantité</span>
            <span className="col-sub">Sous-total</span>
          </div>

          {items.length === 0 && (
            <div className="cart-empty">Votre panier est vide.</div>
          )}

          {items.map((it) => (
            <div key={it.id} className="cart-line">
              <div className="line-left">
                <Link to={`/product/${it.id}`}>
                <img className="cart-thumb" src={it.imageUrl} alt={it.name} />
                </Link>
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

          {/* Code promo panier */}
          <div className="cart-promo">
            <div className="promo-title">Vous avez un code promo ?</div>
            <div className="promo-row">
              <input
                className="promo-input"
                placeholder="Renseignez votre code ici"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
              />
              <button className="promo-btn" onClick={applyPromo}>OK</button>
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
