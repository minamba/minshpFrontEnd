// src/pages/cart/Cart.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../../styles/pages/cart.css";
import { Link, useNavigate } from "react-router-dom";
import {
  updateCartRequest,
  deleteFromCartRequest,
  saveCartRequest,
  getCartRequest,
} from "../../lib/actions/CartActions";
import { GenericModal } from "../../components";
import { getPromotionCodesRequest } from "../../lib/actions/PromotionCodeActions";
import { calculPriceForApplyPromoCode } from "../../lib/utils/Helpers";
import { toMediaUrl } from "../../lib/utils/mediaUrl";

/* ---------- helpers format/ids ---------- */
const fmt = (n) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
    Number.isFinite(n) ? n : 0
  );

const norm = (s) =>
  String(s ?? "")
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

const parseDateLoose = (v) => {
  if (!v) return null;
  if (typeof v === "string") {
    const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/); // DD/MM/YYYY
    if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  }
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

const isPromoActive = (p) => {
  const now = new Date();
  const start = parseDateLoose(p?.startDate);
  const end = parseDateLoose(p?.endDate);
  const endOfDay = end
    ? new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999)
    : null;
  if (start && start > now) return false;
  if (endOfDay && endOfDay < now) return false;
  return true;
};

const getCategoryIdFromProduct = (p) =>
  p?.idCategory ??
  p?.categoryId ??
  p?.idCategorie ??
  p?.categorieId ??
  p?.category?.id ??
  p?.category ??
  null;

const getSubCategoryIdFromProduct = (p) =>
  p?.idSubCategory ?? p?.subCategoryId ?? p?.IdSubCategory ?? null;

/* ---------- LocalStorage helpers ---------- */
const updateLsPrice = (productId, newPrice) => {
  let arr = [];
  try {
    arr = JSON.parse(localStorage.getItem("items") || "[]");
  } catch {
    arr = [];
  }
  const next = (Array.isArray(arr) ? arr : []).map((i) =>
    String(i.id) === String(productId) || String(i.productId) === String(productId)
      ? { ...i, price: Number(newPrice) }
      : i
  );
  localStorage.setItem("items", JSON.stringify(next));
};

const readLsItems = () => {
  try {
    return JSON.parse(localStorage.getItem("items") || "[]");
  } catch {
    return [];
  }
};

const readPromoMap = () => {
  try {
    return JSON.parse(localStorage.getItem("promo_map") || "{}");
  } catch {
    return {};
  }
};
const writePromoMap = (map) => localStorage.setItem("promo_map", JSON.stringify(map));

/* ---------- Component ---------- */
export const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Store
  const reduxItems = useSelector((s) => s?.items?.items) || [];
  const products = useSelector((s) => s?.products?.products) || [];
  const images = useSelector((s) => s?.images?.images) || [];
  const promotionCodes = useSelector((s) => s?.promotionCodes?.promotionCodes) || [];
  const usingRedux = reduxItems.length > 0;
  const promotions = useSelector((s) => s?.promotions?.promotions) || [];
  const categories = useSelector((s) => s?.categories?.categories) || [];
  const subCategories = useSelector((s) => s?.subCategories?.subCategories) || [];
  const stocks = useSelector((s) => s?.stocks?.stocks) || [];

//je recupere le current user 
  const { user } = useSelector((s) => s.account);
  const customers = useSelector((s) => s?.customers?.customers) || [];
  const uid = user?.id || null;
  const currentCustomer = customers.find((c) => c.idAspNetUser === uid);


  const customerPromotionCodes = useSelector((s) => s?.customerPromotionCodes?.customerPromotionCodes) || [];
// garde TOUS les codes du client dans un tableau
const currentCustomerPromotionCodes = (customerPromotionCodes || []).filter(
  (cp) =>
    String(cp?.idCutomer ?? cp?.idCustomer ?? cp?.IdCustomer) ===
    String(currentCustomer?.id)
);

  const payment = useSelector((s) => s?.payment) || {};
  const paymentConfirmed = !!payment.confirmed;

  // ===== Code promo UI =====
  const [promoInput, setPromoInput] = useState("");
  const [appliedCode, setAppliedCode] = useState(null);
  const [promoModal, setPromoModal] = useState({
    open: false,
    message: "",
    variant: "",
  });
  const closePromoModal = () =>
    setPromoModal({ open: false, message: "", variant: "" });

  // map produit -> code appliqué
  const [promoAppliedMap, setPromoAppliedMap] = useState(() => readPromoMap());
  const clearPromoMap = () => {
    localStorage.removeItem("promo_map");
    setPromoAppliedMap({});
  };

  // Charger panier + codes promos au montage
  useEffect(() => {
    dispatch(getCartRequest());
    dispatch(getPromotionCodesRequest());
  }, [dispatch]);

  // Persister Redux → LS à chaque changement + purge map si panier vide
  useEffect(() => {
    dispatch(saveCartRequest(reduxItems));
    if ((reduxItems?.length ?? 0) === 0) clearPromoMap();
  }, [reduxItems, dispatch]);

  // Purge post-paiement
  useEffect(() => {
    if (paymentConfirmed) {
      clearPromoMap();
      localStorage.setItem("items", "[]");
      dispatch(saveCartRequest([]));
      setAppliedCode(null);
    }
  }, [paymentConfirmed, dispatch]);

  // enrichir lignes (nom, img, prix)
  const enrich = (arr) =>
    (arr || []).map((it) => {
      const pid = it.productId ?? it.id;
      const prod = products.find((p) => String(p.id) === String(pid));
      const name = it.name || it.title || prod?.name || prod?.title || "Produit";
      const img =
        it.image ||
        it.imageUrl ||
        images.find((im) => String(im.idProduct) === String(pid))?.url ||
        "/Images/placeholder.jpg";

      const price =
        it.price != null
          ? Number(it.price)
          : Number(it.priceTtc ?? prod?.priceTtc ?? 0);

      return { id: pid, name, price, qty: Number(it.qty ?? 1), imageUrl: img };
    });

  const [clock, setClock] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setClock(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const [items, setItems] = useState(() =>
    enrich(usingRedux ? reduxItems : readLsItems())
  );

  // Sync affichage avec source (Redux/LS)
  useEffect(() => {
    const src = usingRedux ? reduxItems : readLsItems();
    setItems(enrich(src));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usingRedux, reduxItems, products, images, clock]);

  // Nettoyer promoAppliedMap quand des produits quittent le panier
  useEffect(() => {
    const ids = new Set(items.map((i) => String(i.id)));
    const next = Object.fromEntries(
      Object.entries(promoAppliedMap).filter(([pid]) => ids.has(String(pid)))
    );
    if (JSON.stringify(next) !== JSON.stringify(promoAppliedMap)) {
      setPromoAppliedMap(next);
      writePromoMap(next);
    }
    if (items.length === 0 && Object.keys(promoAppliedMap).length > 0) {
      clearPromoMap();
    }
  }, [items, promoAppliedMap]);

  // Helpers LS-only
  const persistLsItems = (next) => {
    localStorage.setItem(
      "items",
      JSON.stringify(
        next.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          qty: i.qty,
          image: i.imageUrl,
          packageProfil: i.packageProfil,
          containedCode: i.containedCode,
        }))
      )
    );
  };

  const handleQty = (id, q) => {
    if (usingRedux) {
      const item =
        reduxItems.find((i) => String(i.id) === String(id)) || { id, qty: q };
      dispatch(updateCartRequest(item, q));
      return;
    }
    const next = items.map((it) => (it.id === id ? { ...it, qty: q } : it));
    setItems(next);
    persistLsItems(next);
  };

  const removeItem = (id) => {
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
    if (next.length === 0) clearPromoMap();
  };

  // Stock UI (badge)
  const getStockUi = (productId) => {
    const prod = products.find((p) => String(p.id) === String(productId));
    const raw = (prod?.stockStatus ?? "").trim();
    const lower = raw.toLowerCase();
    const isIn = lower === "en stock";
    const isOut = lower === "en rupture";
    const cls = isIn ? "in" : isOut ? "out" : "warn";
    const label = lower.includes("plus que")
      ? "Bientôt en rupture"
      : raw || "Disponibilité limitée";
    return { cls, label, isOut };
  };

  // Stock disponible (quantité)
  const getAvailableQty = (productId) => {
    const st = stocks.find(
      (s) =>
        String(s?.idProduct ?? s?.Id_product ?? s?.IdProduct) === String(productId)
    );
    const q = Number(
      st?.quantity ?? st?.Quantity ?? st?.qty ?? st?.Qty ?? 0
    );
    return Number.isFinite(q) && q > 0 ? q : 0;
  };

  // Clamp auto si stock baisse
  useEffect(() => {
    items.forEach((it) => {
      const available = getAvailableQty(it.id);
      if (available > 0 && it.qty > available) {
        handleQty(it.id, available);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stocks, items.map(i => `${i.id}:${i.qty}`).join("|")]);

  // ======== Appliquer un code promo ========
  const applyPromo = () => {
    const code = norm(promoInput);
    if (!code) return;
  
    // ⛔ Déjà utilisé par ce client ?
    const getPromotionCode = promotionCodes.find((p) => norm(p?.name) === code)

    const isCustomerUsedTheCode = currentCustomerPromotionCodes.find((cp) => cp.idPromotion === getPromotionCode.id)

    console.log("isCustomerUsedTheCode",isCustomerUsedTheCode.isUsed)

    if (isCustomerUsedTheCode.isUsed) {
      setAppliedCode(null);
      setPromoModal({
        open: true,
        variant: "warning",
        message: "Ce code promo a déjà été utilisé !",
      });
      return; // on n'applique pas
    }
  
    if ((promotionCodes?.length ?? 0) === 0) {
      setPromoModal({
        open: true,
        variant: "info",
        message: "Chargement des codes en cours, réessayez dans un instant…",
      });
      return;
    }
  
    // (le reste de ta fonction inchangé)
    const promo =
      promotionCodes.find(
        (p) => norm(p?.name) === code || norm(p?.code) === code || norm(p?.Code) === code
      ) || null;
  
    if (!promo || !isPromoActive(promo)) {
      setAppliedCode(null);
      setPromoModal({
        open: true,
        message: "Code promo invalide ou expiré.",
        variant: "warning",
      });
      return;
    }
  
    const pct = Number(promo.purcentage) || 0;
    if (pct <= 0) {
      setAppliedCode(null);
      setPromoModal({
        open: true,
        message: "Ce code n'a pas de pourcentage valide.",
        variant: "warning",
      });
      return;
    }
  
    const promoId = promo.id ?? promo.idPromotionCode ?? promo.promoId;
    const promoCategoryId =
      promo?.idCategory ?? promo?.IdCategory ?? promo?.categoryId ?? null;
    const promoSubCategoryId =
      promo?.idSubCategory ?? promo?.IdSubCategory ?? promo?.subCategoryId ?? null;
    const promoProductId =
      promo?.idProduct ?? promo?.IdProduct ?? promo?.productId ?? null;
  
    const byCode = products
      .filter((p) => String(p?.idPromotionCode ?? p?.IdPromotionCode) === String(promoId))
      .map((p) => p.id);
  
    const byCategory =
      promoCategoryId != null
        ? products
            .filter((p) => String(getCategoryIdFromProduct(p)) === String(promoCategoryId))
            .map((p) => p.id)
        : [];
  
    const bySubCategory =
      promoSubCategoryId != null
        ? products
            .filter((p) => String(getSubCategoryIdFromProduct(p)) === String(promoSubCategoryId))
            .map((p) => p.id)
        : [];
  
    const byDirectProduct = promoProductId != null ? [String(promoProductId)] : [];
  
    const affectedProductIds = Array.from(
      new Set([...byCode, ...byCategory, ...bySubCategory, ...byDirectProduct].map(String))
    );
  
    if (affectedProductIds.length === 0) {
      setAppliedCode(null);
      setPromoModal({
        open: true,
        message: "Code valide, mais aucun article correspondant dans votre panier.",
        variant: "warning",
      });
      return;
    }
  
    const updatedItems = [...items];
    const changedNames = [];
    const changedIds = [];
  
    for (const it of items) {
      if (!affectedProductIds.includes(String(it.id))) continue;
  
      const product = products.find((p) => String(p.id) === String(it.id));
      const category = categories.find((p) => String(p.name) === String(product?.category));
      const subCategory = subCategories.find((p) => String(p.id) === String(product?.idSubCategory));
  
      let totalPurcentage = calculPriceForApplyPromoCode(
        product,
        promotions,
        promotionCodes,
        category,
        subCategory
      );
      totalPurcentage += pct;
  
      const base = Number(product?.price) || 0;
      let newPrice = base - (base * totalPurcentage) / 100;
      newPrice = newPrice + (newPrice * (product?.tva || 0)) / 100;
      newPrice = newPrice + (product?.taxWithoutTvaAmount || 0);
  
      if (Math.abs((Number(product?.price) || 0) - newPrice) < 0.001) continue;
  
      const idx = updatedItems.findIndex((u) => u.id === it.id);
      if (idx >= 0) updatedItems[idx] = { ...updatedItems[idx], price: newPrice };
  
      if (usingRedux) {
        const orig =
          reduxItems.find((i) => String(i.id) === String(it.id)) || { id: it.id, qty: it.qty };
        const updated = { ...orig, price: newPrice };
        dispatch(updateCartRequest(updated, it.qty));
        updateLsPrice(it.id, newPrice);
      } else {
        const next = items.map((i) => (i.id === it.id ? { ...i, price: newPrice } : i));
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
        open: true,
        message:
          changedNames.length === 1
            ? `Code promo appliqué sur le produit « ${changedNames[0]} ».`
            : `Code promo appliqué sur ${changedNames.length} produits : ${changedNames.join(", ")}.`,
        variant: "success",
      });
  
      const nextMap = { ...promoAppliedMap };
      for (const id of changedIds) nextMap[String(id)] = code;
      setPromoAppliedMap(nextMap);
      writePromoMap(nextMap);
    } else {
      setAppliedCode(null);
      setPromoModal({
        open: true,
        message: "Code valide, mais aucun article correspondant dans votre panier.",
        variant: "warning",
      });
    }
  };
  

  const subTotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const grandTotal = Math.max(0, subTotal);
  const hasItems = items.length > 0;

  // ======== BLOQUE LA COMMANDE SI RUPTURE ========
  const outOfStockList = useMemo(
    () => items.filter((it) => getAvailableQty(it.id) <= 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, stocks.map(s => `${s.IdProduct ?? s.idProduct}:${s.quantity ?? s.Quantity ?? s.qty ?? 0}`).join("|")]
  );
  const hasOutOfStock = outOfStockList.length > 0;

  const canCheckout = hasItems && !hasOutOfStock;

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
          <div className="cart-head d-none-mobile">
            <span className="col-design">Désignation</span>
            <span className="col-qty">Quantité</span>
            <span className="col-sub">Sous-total</span>
          </div>

          {items.length === 0 && <div className="cart-empty text-center fw-bold text-danger">Votre panier est vide.</div>}

          {items.map((it) => {
            const { cls, label, isOut } = getStockUi(it.id);
            const available = getAvailableQty(it.id);
            const codeOnThis = promoAppliedMap[String(it.id)] || null;

            const cap = Math.min(available, 50);
            const qtyOptions =
              cap > 0 ? Array.from({ length: cap }, (_, i) => i + 1) : [];

            const disableSelect = isOut || available <= 0;

            return (
              <div key={it.id} className="cart-line">
                <div className="line-left">
                  {/* media = image seule */}
                  <div className="line-media">
                    <Link to={`/product/${it.id}`}>
                      <img className="cart-thumb" src={toMediaUrl(it.imageUrl)} alt={it.name} />
                    </Link>
                  </div>

                  {/* infos = nom + badge stock (+ messages) */}
                  <div className="line-info">
                    <div className="line-title">
                      <Link className="line-name" to={`/product/${it.id}`}>{it.name}</Link>
                      <span className={`card-stock ${cls}`}>
                        <span className={`card-stock-dot ${cls}`} />
                        {label}
                      </span>
                    </div>

                    {/* {available <= 0 && (
                      <div className="line-alert">Rupture de stock</div>
                    )} */}

                    {codeOnThis && (
                      <span className="line-code">Code appliqué : {codeOnThis}</span>
                    )}
                  </div>
                </div>

                <div className="line-qty">
                  <select
                    value={it.qty}
                    onChange={(e) => handleQty(it.id, Number(e.target.value))}
                    className="qty-select"
                    disabled={disableSelect}
                    aria-disabled={disableSelect}
                    title={disableSelect ? "Article en rupture" : "Changer la quantité"}
                  >
                    {qtyOptions.length === 0
                      ? <option value={it.qty}>—</option>
                      : qtyOptions.map((n) => <option key={n} value={n}>{n}</option>)}
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyPromo();
                }}
              />
              <button className="promo-btn bg-primary" onClick={applyPromo}>
                OK
              </button>
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
          <h3 className="sum-title  ">Montant total</h3>
          <div className="sum-amount">{fmt(grandTotal)}</div>

          {hasOutOfStock && (
            <div
              style={{
                background: "#fee2e2",
                color: "#991b1b",
                border: "1px solid #fecaca",
                borderRadius: 10,
                padding: 10,
                marginBottom: 10,
                fontWeight: 700,
              }}
            >
              Un ou plusieurs articles sont en rupture de stock.
              <br />
              Supprimez-les pour continuer votre commande.
              <ul style={{ margin: "8px 0 0 18px", fontWeight: 600 }}>
                {outOfStockList.map((it) => (
                  <li key={it.id}>
                    {it.name}{" "}
                    <button
                      className="btn btn-light"
                      style={{ marginLeft: 6, padding: "4px 8px" }}
                      onClick={() => removeItem(it.id)}
                    >
                      Retirer
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            className={canCheckout ? "checkout-btn" : "checkout-btn-disabled"}
            disabled={!canCheckout}
            onClick={() =>
              canCheckout &&
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
        actions={[{ label: "OK", variant: "primary", onClick: closePromoModal, autoFocus: true }]}
      />
    </div>
  );
};
