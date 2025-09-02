import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../../App.css";
import { Link, useNavigate } from "react-router-dom";
import {
  updateCartRequest,
  deleteFromCartRequest,
  saveCartRequest,
  getCartRequest
} from "../../lib/actions/CartActions";
import { GenericModal } from "../../components";
// ❌ On ne marque plus IsUsed ici (ça se fera au paiement)
// import { updatePromotionCodeRequest } from "../../lib/actions/PromotionCodeActions";

// ---------- helpers ----------
const fmt = (n) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" })
    .format(Number.isFinite(n) ? n : 0);

const norm = (s) => String(s ?? "").trim().toUpperCase();

// promo active : start <= now <= end(23:59:59)
const isPromoActive = (p) => {
  const toDate = (v) => {
    if (!v) return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  };
  const now = new Date();
  const start = toDate(p?.startDate);
  const end   = toDate(p?.endDate);
  const endOfDay = end ? new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999) : null;
  if (start && start > now) return false;
  if (endOfDay && endOfDay < now) return false;
  return true;
};

const getCategoryIdFromProduct = (p) =>
  p?.idCategory ?? p?.categoryId ?? p?.idCategorie ?? p?.categorieId ?? p?.category?.id ?? p?.category ?? null;

// MAJ prix d’un item dans le localStorage (items)
const updateLsPrice = (productId, newPrice) => {
  let arr = [];
  try { arr = JSON.parse(localStorage.getItem("items") || "[]"); } catch { arr = []; }
  const next = (Array.isArray(arr) ? arr : []).map((i) =>
    String(i.id) === String(productId) || String(i.productId) === String(productId)
      ? { ...i, price: Number(newPrice) }
      : i
  );
  localStorage.setItem("items", JSON.stringify(next));
};

// Lire les items LS
const readLsItems = () => {
  try { return JSON.parse(localStorage.getItem("items") || "[]"); }
  catch { return []; }
};

// --- nouvelle persistance : code promo appliqué par produit ---
const readPromoMap = () => {
  try { return JSON.parse(localStorage.getItem("promo_map") || "{}"); }
  catch { return {}; }
};
const writePromoMap = (map) =>
  localStorage.setItem("promo_map", JSON.stringify(map));

export const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Store
  const reduxItems     = useSelector((s) => s?.items?.items) || [];
  const products       = useSelector((s) => s?.products?.products) || [];
  const images         = useSelector((s) => s?.images?.images) || [];
  const promotionCodes = useSelector((s) => s?.promotionCodes?.promotionCodes) || [];
  const usingRedux     = reduxItems.length > 0;

  // ===== Code promo UI =====
  const [promoInput, setPromoInput] = useState("");
  const [appliedCode, setAppliedCode] = useState(null); // pour feedback
  const [promoModal, setPromoModal] = useState({ open: false, message: "", variant: "" });
  const closePromoModal = () => setPromoModal({ open: false, message: "", variant: "" });

  // ===== Map produit -> code appliqué (pour bloquer la ressaisie) =====
  const [promoAppliedMap, setPromoAppliedMap] = useState(() => readPromoMap());

  // Charger le panier Redux au montage
  useEffect(() => { dispatch(getCartRequest()); }, [dispatch]);

  // Persister Redux → LS à chaque changement
  useEffect(() => { dispatch(saveCartRequest(reduxItems)); }, [reduxItems, dispatch]);

  // enrichir lignes (nom, img, prix)
  const enrich = (arr) =>
    (arr || []).map((it) => {
      const pid  = it.productId ?? it.id;
      const prod = products.find((p) => String(p.id) === String(pid));
      const name = it.name || it.title || prod?.name || prod?.title || "Produit";
      const img =
        it.image || it.imageUrl ||
        images.find((im) => String(im.idProduct) === String(pid))?.url ||
        "/Images/placeholder.jpg";

      const price =
        it.price != null ? Number(it.price)
        : Number(it.priceTtc ?? prod?.priceTtc ?? 0);

      return { id: pid, name, price, qty: Number(it.qty ?? 1), imageUrl: img };
    });

  // tick pour maj auto si besoin
  const [clock, setClock] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setClock(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const [items, setItems] = useState(() => enrich(usingRedux ? reduxItems : readLsItems()));

  // Sync affichage avec source (Redux/LS)
  useEffect(() => {
    const src = usingRedux ? reduxItems : readLsItems();
    setItems(enrich(src));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usingRedux, reduxItems, products, images, clock]);

  // Nettoyer promoAppliedMap quand des produits quittent le panier
  useEffect(() => {
    const ids = new Set(items.map(i => String(i.id)));
    const next = Object.fromEntries(
      Object.entries(promoAppliedMap).filter(([pid]) => ids.has(String(pid)))
    );
    // éviter setState en boucle
    if (JSON.stringify(next) !== JSON.stringify(promoAppliedMap)) {
      setPromoAppliedMap(next);
      writePromoMap(next);
    }
  }, [items, promoAppliedMap]);

  // Helpers LS-only
  const persistLsItems = (next) => {
    localStorage.setItem("items", JSON.stringify(
      next.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, image: i.imageUrl }))
    ));
  };

  const handleQty = (id, q) => {
    if (usingRedux) {
      const item = reduxItems.find((i) => String(i.id) === String(id)) || { id };
      dispatch(updateCartRequest(item, q));
      return;
    }
    const next = items.map((it) => (it.id === id ? { ...it, qty: q } : it));
    setItems(next); persistLsItems(next);
  };

  const removeItem = (id) => {
    // supprimer l’association produit->code pour débloquer la ressaisie
    const pid = String(id);
    if (promoAppliedMap[pid]) {
      const nextMap = { ...promoAppliedMap };
      delete nextMap[pid];
      setPromoAppliedMap(nextMap);
      writePromoMap(nextMap);
    }

    if (usingRedux) {
      dispatch(deleteFromCartRequest(id));
      return;
    }
    const next = items.filter((it) => it.id !== id);
    setItems(next);
    persistLsItems(next);
  };

  // Statut stock (même style que Home)
  const getStockUi = (productId) => {
    const prod  = products.find((p) => String(p.id) === String(productId));
    const raw   = (prod?.stockStatus ?? "").trim();
    const lower = raw.toLowerCase();
    const isIn  = lower === "en stock";
    const isOut = lower === "en rupture";
    const cls   = isIn ? "in" : isOut ? "out" : "warn";
    const label = lower.includes("plus que") ? "Bientôt en rupture" : raw || "Disponibilité limitée";
    return { cls, label };
  };

  const applyPromo = () => {
    const code = norm(promoInput);
    if (!code) return;

    // 🔒 Bloquer si ce code est déjà appliqué à AU MOINS un produit actuellement présent
    const alreadyAppliedSomewhere = items.some(it => promoAppliedMap[String(it.id)] === code);
    if (alreadyAppliedSomewhere) {
      setPromoModal({
        open: true,
        variant: "info",
        message:
          "Ce code a déjà été appliqué à un produit de votre panier."
      });
      return;
    }

    const promo = promotionCodes.find(p => norm(p?.name) === code) || null;
    if (!promo || !isPromoActive(promo)) {
      setAppliedCode(null);
      setPromoModal({ open:true, message: "Code promo invalide ou expiré.", variant: "warning" });
      return;
    }

    const pct = Number(promo.purcentage) || 0;
    if (pct <= 0) {
      setAppliedCode(null);
      setPromoModal({ open:true, message: "Ce code n'a pas de pourcentage valide.", variant: "warning" });
      return;
    }

    const promoId = promo.id ?? promo.idPromotionCode ?? promo.promoId;
    const byCode = products
      .filter(p => String(p?.idPromotionCode) === String(promoId))
      .map(p => p.id);

    const byCategory = promo?.idCategory != null
      ? products
          .filter(p => String(getCategoryIdFromProduct(p)) === String(promo.idCategory))
          .map(p => p.id)
      : [];

    const affectedProductIds = Array.from(new Set([...byCode, ...byCategory]));
    if (affectedProductIds.length === 0) {
      setAppliedCode(null);
      setPromoModal({ open:true, message: "Code valide, mais aucun article correspondant dans votre panier.", variant: "warning" });
      return;
    }

    const updatedItems = [...items];
    const changedNames = [];
    const changedIds   = [];

    for (const it of items) {
      if (!affectedProductIds.includes(it.id)) continue;

      const base = Number(it.price) || 0;                 // empile les remises
      const newPrice = +(base * (1 - pct/100)).toFixed(2);

      if (Math.abs((Number(it.price) || 0) - newPrice) < 0.001) continue;

      const idx = updatedItems.findIndex(u => u.id === it.id);
      if (idx >= 0) updatedItems[idx] = { ...updatedItems[idx], price: newPrice };

      if (usingRedux) {
        const orig = reduxItems.find(i => String(i.id) === String(it.id)) || { id: it.id, qty: it.qty };
        const updated = { ...orig, price: newPrice };
        dispatch(updateCartRequest(updated, it.qty));
        updateLsPrice(it.id, newPrice);                   // patch immédiat LS
      } else {
        const next = items.map(i => i.id === it.id ? { ...i, price: newPrice } : i);
        setItems(next);
        persistLsItems(next);
      }

      changedNames.push(it.name);
      changedIds.push(it.id);
    }

    setItems(updatedItems);

    if (changedNames.length > 0) {
      setAppliedCode(code);
      setPromoModal({
        open:true,
        message: changedNames.length === 1
          ? `Code promo appliqué sur le produit « ${changedNames[0]} ».`
          : `Code promo appliqué sur ${changedNames.length} produits : ${changedNames.join(", ")}.`,
        variant: "success"
      });

      // ✅ marquer localement quels produits portent ce code
      const nextMap = { ...promoAppliedMap };
      for (const id of changedIds) nextMap[String(id)] = code;
      setPromoAppliedMap(nextMap);
      writePromoMap(nextMap);

      // ❌ ne plus marquer IsUsed ici (on le fera au paiement)
      // dispatch(updatePromotionCodeRequest({ Id: promo.id, IsUsed: true }));
    } else {
      setAppliedCode(null);
      setPromoModal({ open:true, message: "Code valide, mais aucun article correspondant dans votre panier." });
    }
  };

  const subTotal   = items.reduce((s, it) => s + it.price * it.qty, 0);
  const grandTotal = Math.max(0, subTotal);
  const hasItems   = items.length > 0;  

  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, []);

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

          {items.map((it) => {
            const { cls, label } = getStockUi(it.id);
            const codeOnThis = promoAppliedMap[String(it.id)] || null;
            return (
              <div key={it.id} className="cart-line">
                <div className="line-left">
                  <Link to={`/product/${it.id}`}>
                    <img className="cart-thumb" src={it.imageUrl} alt={it.name} />
                  </Link>
                  <div className="line-info">
                    <Link className="line-name" to={`/product/${it.id}`}>{it.name}</Link>
                    <span className={`card-stock ${cls}`}>
                      <span className={`card-stock-dot ${cls}`} />
                      {label}
                    </span>
                    {codeOnThis && (
                      <span style={{display:"inline-block", marginTop:4, fontWeight:700, fontSize:".85rem", color:"#1569e6"}}>
                        Code appliqué : {codeOnThis}
                      </span>
                    )}
                  </div>
                </div>

                <div className="line-qty">
                  <select
                    value={it.qty}
                    onChange={(e) => handleQty(it.id, Number(e.target.value))}
                    className="qty-select"
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
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
            );
          })}

          {/* Code promo panier */}
          <div className="cart-promo">
            <div className="promo-title">Vous avez un code promo ?</div>
            <div className="promo-row">
              <input
                className="promo-input"
                placeholder="Renseignez votre code ici"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") applyPromo(); }}
              />
              <button className="promo-btn" onClick={applyPromo}>OK</button>
            </div>

            {appliedCode && (
              <div className="promo-applied">
                Code <strong>{appliedCode}</strong> appliqué.
              </div>
            )}
          </div>
        </div>

        {/* Colonne droite: récap */}
        <aside className="cart-summary">
          <h3 className="sum-title">Montant total de vos produits</h3>
          <div className="sum-amount">{fmt(grandTotal)}</div>

          <button
            className= {hasItems ? "checkout-btn" : "checkout-btn-disabled"}
            disabled={!hasItems}                                  // ✅ grisé si panier vide
            onClick={() =>
              hasItems &&                                         // ✅ sécurité côté JS
              navigate("/deliveryPayment", {
                state: { totalCents: Math.round(grandTotal * 100) },
              })
            }
          >
            Passer commande
          </button>

          <p className="sum-note">
            Prix TTC, TVA appliquée sur la base du pays : France (métropolitaine)
          </p>
        </aside>
      </div>

      {/* Modal code promo */}
      <GenericModal
        open={promoModal.open}
        onClose={closePromoModal}
        variant={promoModal.variant}
        title="Code promo"
        message={promoModal.message}
        actions={[
          { label: "OK", variant: "primary", onClick: closePromoModal, autoFocus: true },
        ]}
      />
    </div>
  );
};
