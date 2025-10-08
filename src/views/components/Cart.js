// src/pages/cart/Cart.jsx
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
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
const writePromoMap = (map) =>
  localStorage.setItem("promo_map", JSON.stringify(map));

/** id numérique (string) non-collisant pour le code "panier" */
const genPromoId = (mapObj) => {
  let k = String(Date.now());
  while (mapObj && Object.prototype.hasOwnProperty.call(mapObj, k)) {
    k = String(Number(k) + 1);
  }
  return k;
};

/* ---------- Component ---------- */
export const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Store
  const reduxItems = useSelector((s) => s?.items?.items) || [];
  const products = useSelector((s) => s?.products?.products) || [];
  const images = useSelector((s) => s?.images?.images) || [];
  const promotionCodes =
    useSelector((s) => s?.promotionCodes?.promotionCodes) || [];
  const usingRedux = reduxItems.length > 0;
  const promotions = useSelector((s) => s?.promotions?.promotions) || [];
  const categories = useSelector((s) => s?.categories?.categories) || [];
  const subCategories =
    useSelector((s) => s?.subCategories?.subCategories) || [];
  const stocks = useSelector((s) => s?.stocks?.stocks) || [];

  // current user / customer
  const { user } = useSelector((s) => s.account);
  const customers = useSelector((s) => s?.customers?.customers) || [];
  const uid = user?.id || null;
  const currentCustomer = customers.find((c) => c.idAspNetUser === uid);

  // customer promotion codes
  const customerPromotionCodes =
    useSelector((s) => s?.customerPromotionCodes?.customerPromotionCodes) || [];
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

  // map produit -> code appliqué (et on y ajoutera une entrée "panier" avec id généré)
  const [promoAppliedMap, setPromoAppliedMap] = useState(() => readPromoMap());

  // ⚠️ idempotent : ne change l'état que si non vide → vide
  const clearPromoMap = useCallback(() => {
    setPromoAppliedMap((prev) => {
      if (!prev || Object.keys(prev).length === 0) return prev;
      localStorage.removeItem("promo_map");
      return {};
    });
  }, []);

  // montant de remise panier à appliquer (calculé dynamiquement)
  const [totalFixedDiscount, setTotalFixedDiscount] = useState(0);

  // Charger panier + codes promos au montage
  useEffect(() => {
    dispatch(getCartRequest());
    dispatch(getPromotionCodesRequest());
  }, [dispatch]);

  /* ===== Sauvegarde serveur dédupliquée (anti-boucle) ===== */
  const lastSavedSigRef = useRef("");
  useEffect(() => {
    if (!usingRedux) return;
    const sig = JSON.stringify(
      [...reduxItems]
        .map((i) => ({
          id: String(i.id ?? i.productId),
          qty: Number(i.qty ?? 1),
          price: Number(i.price ?? i.priceTtc ?? 0),
        }))
        .sort((a, b) => a.id.localeCompare(b.id))
    );
    if (sig === lastSavedSigRef.current) return;
    lastSavedSigRef.current = sig;
    dispatch(saveCartRequest(reduxItems));
  }, [usingRedux, reduxItems, dispatch]);

  // Purge post-paiement
  useEffect(() => {
    if (paymentConfirmed) {
      clearPromoMap();
      localStorage.setItem("items", "[]");
      dispatch(saveCartRequest([]));
      setAppliedCode((prev) => (prev ? null : prev));
      setTotalFixedDiscount((prev) => (prev !== 0 ? 0 : prev));
    }
  }, [paymentConfirmed, dispatch, clearPromoMap]);

  // enrichir lignes (nom, img, prix)
  const enrich = useCallback(
    (arr) =>
      (arr || []).map((it) => {
        const pid = it.productId ?? it.id;
        const prod = products.find((p) => String(p.id) === String(pid));
        const name =
          it.name || it.title || prod?.name || prod?.title || "Produit";
        const img =
          it.image ||
          it.imageUrl ||
          images.find((im) => String(im.idProduct) === String(pid))?.url ||
          "/Images/placeholder.jpg";

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
      }),
    [products, images]
  );

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
  }, [usingRedux, reduxItems, enrich, clock]);

  // Nettoyer promoAppliedMap quand des produits quittent le panier (sans boucle)
  useEffect(() => {
    if (!promotionCodes || promotionCodes.length === 0) return;

    const ids = new Set(items.map((i) => String(i.id)));
    const next = Object.fromEntries(
      Object.entries(promoAppliedMap).filter(([pid, val]) => {
        if (ids.has(String(pid))) return true;
        const p = promotionCodes.find((x) => norm(x?.name) === norm(val));
        const isCartCode =
          p &&
          (Number(p?.purcentage || 0) <= 0) &&
          Number(p?.generalCartAmount || 0) > 0 &&
          isPromoActive(p);
        return isCartCode;
      })
    );

    const changed =
      Object.keys(next).length !== Object.keys(promoAppliedMap).length ||
      Object.keys(next).some((k) => promoAppliedMap[k] !== next[k]);

    if (changed) {
      setPromoAppliedMap(next);
      writePromoMap(next);
    }

    // purge uniquement si on passe à vide
    if (items.length === 0 && Object.keys(next).length === 0) {
      clearPromoMap(); // idempotent
      if (appliedCode) setAppliedCode(null);
      if (totalFixedDiscount !== 0) setTotalFixedDiscount(0);
    }
  }, [
    items,
    promotionCodes,
    promoAppliedMap,
    clearPromoMap,
    appliedCode,
    totalFixedDiscount,
  ]);

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
    if (next.length === 0) {
      setAppliedCode(null);
      setTotalFixedDiscount(0);
    }
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
        String(s?.idProduct ?? s?.Id_product ?? s?.IdProduct) === String(
          productId
        )
    );
    const q = Number(
      st?.quantity ?? st?.Quantity ?? st?.qty ?? st?.Qty ?? 0
    );
    return Number.isFinite(q) && q > 0 ? q : 0;
  };

  // Clamp auto si stock baisse
  const stocksSig = stocks
    .map(
      (s) =>
        `${s.IdProduct ?? s.idProduct}:${s.quantity ?? s.Quantity ?? s.qty ?? 0}`
    )
    .join("|");

  useEffect(() => {
    items.forEach((it) => {
      const available = getAvailableQty(it.id);
      if (available > 0 && it.qty > available) {
        handleQty(it.id, available);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stocksSig, items.map((i) => `${i.id}:${i.qty}`).join("|")]);

  // ======== Appliquer un code promo ========
  const applyPromo = () => {
    const code = norm(promoInput);
    if (!code) return;

    // ⛔ Déjà utilisé par ce client ?
    const getPromotionCode = promotionCodes.find((p) => norm(p?.name) === code);
    const isCustomerUsedTheCode = currentCustomerPromotionCodes.find(
      (cp) => String(cp.idPromotion) === String(getPromotionCode?.id)
    );
    if (isCustomerUsedTheCode?.isUsed) {
      setAppliedCode(null);
      setPromoModal({
        open: true,
        variant: "warning",
        message: "Ce code promo a déjà été utilisé !",
      });
      return;
    }

    if ((promotionCodes?.length ?? 0) === 0) {
      setPromoModal({
        open: true,
        variant: "info",
        message: "Chargement des codes en cours, réessayez dans un instant…",
      });
      return;
    }

    const promo =
      promotionCodes.find(
        (p) =>
          norm(p?.name) === code ||
          norm(p?.code) === code ||
          norm(p?.Code) === code
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
    const fixed = Number(promo?.generalCartAmount ?? 0);
    const hasFixed = Number.isFinite(fixed) && fixed > 0;

    // === CAS REMISE PANIER (pas de %) ===
    if (pct <= 0 && hasFixed) {
      const sub = items.reduce((s, it) => s + it.price * it.qty, 0);
      if (sub <= 0) {
        setAppliedCode(null);
        setPromoModal({
          open: true,
          variant: "warning",
          message:
            "Votre panier est vide, la remise ne peut pas être appliquée.",
        });
        return;
      }

      // supprime un éventuel ancien code PANIER du promo_map (mais conserve les codes produits)
      const cleanMap = { ...(promoAppliedMap || {}) };
      for (const [idKey, val] of Object.entries(cleanMap)) {
        const p = promotionCodes.find((x) => norm(x?.name) === norm(val));
        if (
          p &&
          (Number(p?.purcentage || 0) <= 0) &&
          Number(p?.generalCartAmount || 0) > 0
        ) {
          delete cleanMap[idKey];
        }
      }

      // ajoute l'entrée panier "id généré" -> "CODE"
      const newId = genPromoId(cleanMap);
      const nextMap = { ...cleanMap, [newId]: code };
      setPromoAppliedMap(nextMap);
      writePromoMap(nextMap);

      // calcule et affiche la remise (clamp pour éviter négatif)
      const toApply = Math.min(fixed, sub);
      setAppliedCode(code);
      setTotalFixedDiscount(toApply);
      setPromoModal({
        open: true,
        variant: "success",
        message: `Code promo appliqué sur le montant total : -${fmt(
          toApply
        )}.`,
      });
      return;
    }

    // === CAS % produit/catégorie/sous-catégorie ===
    if (pct <= 0 && !hasFixed) {
      setAppliedCode(null);
      setPromoModal({
        open: true,
        message: "Ce code n'a ni pourcentage ni montant panier valide.",
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
      .filter(
        (p) =>
          String(p?.idPromotionCode ?? p?.IdPromotionCode) === String(promoId)
      )
      .map((p) => p.id);

    const byCategory =
      promoCategoryId != null
        ? products
            .filter(
              (p) =>
                String(getCategoryIdFromProduct(p)) === String(promoCategoryId)
            )
            .map((p) => p.id)
        : [];

    const bySubCategory =
      promoSubCategoryId != null
        ? products
            .filter(
              (p) =>
                String(getSubCategoryIdFromProduct(p)) ===
                String(promoSubCategoryId)
            )
            .map((p) => p.id)
        : [];

    const byDirectProduct =
      promoProductId != null ? [String(promoProductId)] : [];

    const affectedProductIds = Array.from(
      new Set(
        [...byCode, ...byCategory, ...bySubCategory, ...byDirectProduct].map(
          String
        )
      )
    );

    if (affectedProductIds.length === 0) {
      setAppliedCode(null);
      setPromoModal({
        open: true,
        message:
          "Code valide, mais aucun article correspondant dans votre panier.",
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
      const category = categories.find(
        (p) => String(p.name) === String(product?.category)
      );
      const subCategory = subCategories.find(
        (p) => String(p.id) === String(product?.idSubCategory)
      );

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
          reduxItems.find((i) => String(i.id) === String(it.id)) || {
            id: it.id,
            qty: it.qty,
          };
        const updated = { ...orig, price: newPrice };
        dispatch(updateCartRequest(updated, it.qty));
        updateLsPrice(it.id, newPrice);
      } else {
        const next = items.map((i) =>
          i.id === it.id ? { ...i, price: newPrice } : i
        );
        setItems(next);
        persistLsItems(next);
      }

      changedNames.push(it.name);
      changedIds.push(it.id);
    }

    if (!usingRedux) {
      setItems(updatedItems);
      persistLsItems(updatedItems);
    }

    if (changedNames.length > 0) {
      setAppliedCode(code);
      setPromoModal({
        open: true,
        message:
          changedNames.length === 1
            ? `Code promo appliqué sur le produit « ${changedNames[0]} ».`
            : `Code promo appliqué sur ${changedNames.length} produits : ${changedNames.join(
                ", "
              )}.`,
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
        message:
          "Code valide, mais aucun article correspondant dans votre panier.",
        variant: "warning",
      });
    }
  };

  /* ---------- REHYDRATATION anti-boucle ---------- */
  const rehydrateSigRef = useRef("");

  // 1) Recalcule les prix unitaires d’après promo_map (hors remise panier)
  useEffect(() => {
    if (!items.length) return;
    if (!promotionCodes.length) return;

    const sig = JSON.stringify({
      items: items.map((i) => [String(i.id), +i.price, +i.qty]),
      promoMap: promoAppliedMap,
      codes: promotionCodes.map((p) => [
        String(p.id ?? p.Id ?? p.idPromotionCode ?? ""),
        +p.purcentage || 0,
        +p.generalCartAmount || 0,
        p.startDate ?? null,
        p.endDate ?? null,
      ]),
    });
    if (rehydrateSigRef.current === sig) return;
    rehydrateSigRef.current = sig;

    let anyChange = false;
    const updated = [...items];

    for (const it of items) {
      const codeOnThis = promoAppliedMap[String(it.id)];
      if (!codeOnThis) continue;

      const promo =
        promotionCodes.find((p) => norm(p?.name) === norm(codeOnThis)) || null;
      if (!promo || !isPromoActive(promo)) continue;

      const pct = Number(promo?.purcentage) || 0;
      if (pct <= 0 && Number(promo?.generalCartAmount || 0) > 0) continue; // remise panier → pas ici

      const product = products.find((p) => String(p.id) === String(it.id));
      if (!product) continue;

      const category = categories.find(
        (p) => String(p.name) === String(product?.category)
      );
      const subCategory = subCategories.find(
        (p) => String(p.id) === String(product?.idSubCategory)
      );

      let totalPct = calculPriceForApplyPromoCode(
        product,
        promotions,
        promotionCodes,
        category,
        subCategory
      );
      totalPct += pct;

      const base = Number(product?.price) || 0;
      let newPrice = base - (base * totalPct) / 100;
      newPrice = newPrice + (newPrice * (product?.tva || 0)) / 100;
      newPrice = newPrice + (product?.taxWithoutTvaAmount || 0);

      if (Math.abs(Number(it.price) - newPrice) <= 0.001) continue;

      if (usingRedux) {
        const orig =
          reduxItems.find((i) => String(i.id) === String(it.id)) || {
            id: it.id,
            qty: it.qty,
          };
        const upd = { ...orig, price: newPrice };
        dispatch(updateCartRequest(upd, it.qty));
        updateLsPrice(it.id, newPrice);
      } else {
        anyChange = true;
        const idx = updated.findIndex((u) => u.id === it.id);
        if (idx >= 0) updated[idx] = { ...updated[idx], price: newPrice };
      }
    }

    if (!usingRedux && anyChange) {
      setItems(updated);
      persistLsItems(updated);
    }
  }, [
    items.map((i) => `${i.id}:${i.price}:${i.qty}`).join("|"),
    promoAppliedMap,
    promotionCodes,
    products,
    categories,
    subCategories,
    promotions,
    usingRedux,
    // pas de reduxItems ni dispatch ici → anti-boucle
  ]);

  // 2) Recalcule la remise panier (montant fixe) depuis promo_map
  const subTotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  useEffect(() => {
    if (!promotionCodes.length) return;

    let cartCode = null;
    let cartAmount = 0;

    for (const val of Object.values(promoAppliedMap || {})) {
      const promo = promotionCodes.find((p) => norm(p?.name) === norm(val));
      if (
        promo &&
        Number(promo?.purcentage || 0) <= 0 &&
        Number(promo?.generalCartAmount || 0) > 0 &&
        isPromoActive(promo)
      ) {
        cartCode = val;
        cartAmount = Number(promo.generalCartAmount) || 0;
      }
    }

    if (!cartCode || cartAmount <= 0) {
      setTotalFixedDiscount((prev) => (prev !== 0 ? 0 : prev));
      return;
    }

    setAppliedCode(cartCode);
    setTotalFixedDiscount(Math.min(cartAmount, subTotal));
  }, [promoAppliedMap, promotionCodes, subTotal]);

  const effectiveDiscount = Math.min(totalFixedDiscount, subTotal);
  const grandTotal = Math.max(0, subTotal - effectiveDiscount);
  const hasItems = items.length > 0;

  // ======== BLOQUE LA COMMANDE SI RUPTURE ========
  const outOfStockList = useMemo(
    () => items.filter((it) => getAvailableQty(it.id) <= 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, stocksSig]
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

          {items.length === 0 && (
            <div className="cart-empty text-center fw-bold text-danger">
              Votre panier est vide.
            </div>
          )}

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
                  <div className="line-media">
                    <Link to={`/product/${it.id}`}>
                      <img
                        className="cart-thumb"
                        src={toMediaUrl(it.imageUrl)}
                        alt={it.name}
                      />
                    </Link>
                  </div>

                  <div className="line-info">
                    <div className="line-title">
                      <Link className="line-name" to={`/product/${it.id}`}>
                        {it.name}
                      </Link>
                      <span className={`card-stock ${cls}`}>
                        <span className={`card-stock-dot ${cls}`} />
                        {label}
                      </span>
                    </div>

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
                    title={
                      disableSelect
                        ? "Article en rupture"
                        : "Changer la quantité"
                    }
                  >
                    {qtyOptions.length === 0 ? (
                      <option value={it.qty}>—</option>
                    ) : (
                      qtyOptions.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))
                    )}
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
          <h3 className="sum-title">Montant total</h3>

          <div className="sum-amount">{fmt(grandTotal)}</div>

          {effectiveDiscount > 0 && (
            <div style={{ fontWeight: 700, marginTop: 6, fontSize: 14 }}>
              Remise panier : -{fmt(effectiveDiscount)}
            </div>
          )}

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
        actions={[
          {
            label: "OK",
            variant: "primary",
            onClick: closePromoModal,
            autoFocus: true,
          },
        ]}
      />
    </div>
  );
};
