// src/pages/checkout/DeliveryPayment.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import { useLocation } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../../App.css";

import { getOrderRequest, addOrderRequest } from "../../lib/actions/OrderActions";
import {
  addOrderCustomerProductRequest,
  getOrderCustomerProductRequest,
} from "../../lib/actions/OrderCustomerProductActions";
import { saveCartRequest } from "../../lib/actions/CartActions";

// 👇 Actions Redux/Saga pour Boxtal
import {
  getShippingRatesRequest,
  getRelaysRequest,              // (par ZIP) — conservé si tu veux garder l’ancien bouton
  getRelaysByAddressRequest,     // (par adresse) — NOUVEAU
  createShipmentRequest,
} from "../../lib/actions/ShippingActions";

/* ------------------------------------------------------------------ */
/* --------------------------- Mini Modales -------------------------- */
/* ------------------------------------------------------------------ */

function SimpleModal({ open, title, children, onClose, footer }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(720px, 94vw)",
          background: "#fff",
          borderRadius: 14,
          boxShadow: "0 20px 60px rgba(0,0,0,.18)",
          padding: 20,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <h3 style={{ margin: 0, fontWeight: 800 }}>{title}</h3>
          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{
              border: 0,
              background: "transparent",
              cursor: "pointer",
              fontSize: 20,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginTop: 12 }}>{children}</div>

        {footer && (
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

function AddressFormModal({ open, initial, onSave, onCancel, title = "Adresse" }) {
  const [form, setForm] = useState(() => ({
    civility: initial?.civility ?? "M.",
    firstName: initial?.firstName ?? "Minamba",
    lastName: initial?.lastName ?? "Camara",
    company: initial?.company ?? "",
    street: initial?.street ?? "",
    extra: initial?.extra ?? "",
    zip: initial?.zip ?? "",
    city: initial?.city ?? "",
    country: initial?.country ?? "France (métropolitaine)",
    phone: initial?.phone ?? "",
    phoneFix: initial?.phoneFix ?? "",
  }));

  const change = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const save = () => {
    if (!String(form.firstName).trim() || !String(form.lastName).trim()) return;
    onSave(form);
  };

  return (
    <SimpleModal
      open={open}
      onClose={onCancel}
      title={title}
      footer={[
        <button key="cancel" onClick={onCancel} style={lightBtn}>
          Annuler
        </button>,
        <button key="ok" onClick={save} style={primaryBtn}>
          Valider
        </button>,
      ]}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <div style={{ marginBottom: 6, fontWeight: 700 }}>Civilité *</div>
          <div style={{ display: "flex", gap: 16 }}>
            {["M.", "Mme"].map((c) => (
              <label key={c} style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                <input type="radio" name="civ" checked={form.civility === c} onChange={() => change("civility", c)} />
                <span>{c}</span>
              </label>
            ))}
          </div>
        </div>

        <div />

        <Field label="Prénom *">
          <input className="form-control" value={form.firstName} onChange={(e) => change("firstName", e.target.value)} />
        </Field>

        <Field label="Nom *">
          <input className="form-control" value={form.lastName} onChange={(e) => change("lastName", e.target.value)} />
        </Field>

        <Field label="Nom de la société">
          <input className="form-control" value={form.company} onChange={(e) => change("company", e.target.value)} />
        </Field>

        <div />

        <Field label="Adresse *">
          <input
            className="form-control"
            placeholder="N° et libellé de rue"
            value={form.street}
            onChange={(e) => change("street", e.target.value)}
          />
        </Field>

        <Field label="Complément d’adresse">
          <input
            className="form-control"
            placeholder="N°bât, étage, appt, digicode…"
            value={form.extra}
            onChange={(e) => change("extra", e.target.value)}
          />
        </Field>

        <Field label="Code postal *">
          <input className="form-control" value={form.zip} onChange={(e) => change("zip", e.target.value)} />
        </Field>

        <Field label="Ville *">
          <input className="form-control" value={form.city} onChange={(e) => change("city", e.target.value)} />
        </Field>

        <Field label="Pays *">
          <select className="form-control" value={form.country} onChange={(e) => change("country", e.target.value)}>
            <option>France (métropolitaine)</option>
            <option>Belgique</option>
            <option>Suisse</option>
          </select>
        </Field>

        <div />

        <Field label="Téléphone portable">
          <input className="form-control" value={form.phone} onChange={(e) => change("phone", e.target.value)} />
        </Field>

        <Field label="Téléphone fixe">
          <input className="form-control" value={form.phoneFix} onChange={(e) => change("phoneFix", e.target.value)} />
        </Field>
      </div>
    </SimpleModal>
  );
}

function AddressBookModal({ open, addresses, onChoose, onEdit, onClose }) {
  return (
    <SimpleModal open={open} onClose={onClose} title="Carnet d’adresses">
      {addresses.length === 0 && <div style={{ color: "#6b7280" }}>Aucune adresse enregistrée.</div>}
      <div style={{ display: "grid", gap: 12 }}>
        {addresses.map((a, idx) => (
          <div key={idx} style={addressCard}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>
              {a.firstName} {a.lastName}
            </div>
            <div>
              {a.street}
              {a.extra ? `, ${a.extra}` : ""}
            </div>
            <div>
              {a.zip} {a.city}
            </div>
            <div>{a.country}</div>
            {(a.phone || a.phoneFix) && (
              <div style={{ color: "#6b7280" }}>
                {a.phone || a.phoneFix}
                {a.phone && a.phoneFix ? " • " : ""}
                {a.phoneFix}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button style={lightBtn} onClick={() => onEdit(idx)}>
                Modifier
              </button>
              <button style={primaryBtn} onClick={() => onChoose(idx)}>
                Choisir
              </button>
            </div>
          </div>
        ))}
      </div>
    </SimpleModal>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontWeight: 700 }}>{label}</span>
      {children}
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* --------------------------- Helpers divers ------------------------ */
/* ------------------------------------------------------------------ */

const fmt = (n) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Number(n) || 0);

const readLsItems = () => {
  try {
    return JSON.parse(localStorage.getItem("items") || "[]");
  } catch {
    return [];
  }
};
const getPid = (it) => it?.productId ?? it?.id ?? it?.Id ?? null;
const getQty = (it) => Number(it?.qty ?? it?.quantity ?? 1);
const getProductUnitPrice = (it, productsFromStore) => {
  let price = 0;
  var product = productsFromStore.find((p) => String(p.id) === String(it.id));
  if (product?.priceTtcCategoryCodePromoted != null) return (price = product.priceTtcCategoryCodePromoted);
  if (product?.priceTtcPromoted != null && product?.priceTtcCategoryCodePromoted == null) return (price = product.priceTtcPromoted);
  if (product?.priceTtc != null && product?.priceTtcPromoted == null && product?.priceTtcCategoryCodePromoted == null) return (price = product.priceTtc);
  return price;
};

// util orders
const getOrderEntityId = (o) => o?.id ?? o?.Id ?? o?.orderId ?? null;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const waitForNewOrderId = async (dispatch, store, customerId, beforeIds, { attempts = 25, delay = 200 } = {}) => {
  const beforeSet = new Set((beforeIds || []).map(String));
  for (let i = 0; i < attempts; i++) {
    await dispatch(getOrderRequest?.());
    await sleep(delay);
    const state = store.getState();
    const allOrders = state?.orders?.orders || [];
    const forCustomer = allOrders.filter(
      (o) => String(o?.idCustomer ?? o?.customerId ?? o?.CustomerId ?? o?.customer?.id ?? "") === String(customerId)
    );
    const ids = forCustomer.map(getOrderEntityId).filter(Boolean).map(String);
    const newId = ids.find((id) => !beforeSet.has(id));
    if (newId) return newId;
  }
  return null;
};


const relayCode = {
  MondialRelay: "MONR",
  Ups: "UPSE",
  Chronopost: "CHRP"
};

const getRelayLogo = (relay) => {
switch(relay.network){
  case relayCode.MondialRelay: return "../images/mondialrelay.png";
  case relayCode.Ups: return "../images/ups.png";
  case relayCode.Chronopost: return "../images/chronopost.png";
}

  const logo = relay.logo;
  return logo ? logo : "https://via.placeholder.com/150";
};


/* ------------------------------------------------------------------ */
/* ------------------------ Page principale -------------------------- */
/* ------------------------------------------------------------------ */

export const DeliveryPayment = () => {
  const dispatch = useDispatch();
  const store = useStore();

  const { state } = useLocation();
  const totalCents = state?.totalCents ?? 0;
  const totalFromState = totalCents / 100;

  const productsFromStore = useSelector((s) => s?.products?.products) || [];

  const { user } = useSelector((s) => s.account);
  const customers = useSelector((s) => s?.customers?.customers) || [];
  const uid = user?.id || null;
  const currentCustomer = customers.find((c) => c.idAspNetUser === uid);

  const billingAddresses = useSelector((s) => s?.billingAddresses?.billingAddresses || []);
  const deliveryAddresses = useSelector((s) => s?.deliveryAddresses?.deliveryAddresses || []);

  const billingLst = billingAddresses.filter((a) => a?.idCustomer === currentCustomer?.id);
  const deliveryLst = deliveryAddresses.filter((a) => a?.idCustomer === currentCustomer?.id);
  const deliveryFavoriteAddress = deliveryAddresses.find(
    (a) => a?.idCustomer === currentCustomer?.id && a?.favorite
  );
  const billingAddress = billingAddresses.find((a) => a?.idCustomer === currentCustomer?.id);

  const orders = useSelector((s) => s?.orders?.orders) || [];
  useEffect(() => {
    dispatch(getOrderRequest?.());
  }, [dispatch]);

  // 👉 état Shipping depuis Redux
  const {
    rates = [],
    ratesLoading,
    relays = [],
    relaysLoading,
    relaysByAddress = [],
    relaysByAddressLoading,
  } = useSelector((s) => s?.shipping || {});

  const [addresses, setAddresses] = useState([...billingLst, ...deliveryLst]);
  const [shippingIndex, setShippingIndex] = useState(0);
  const [billing, setBilling] = useState(addresses[0]);

  const [showBook, setShowBook] = useState(false);
  const [showAddShip, setShowAddShip] = useState(false);
  const [editShipIdx, setEditShipIdx] = useState(null);
  const [showEditBilling, setShowEditBilling] = useState(false);

  const [deliveryMode, setDeliveryMode] = useState("home"); // "home" | "relay"
  const [selectedRelay, setSelectedRelay] = useState(null);

  // ---- Champs de recherche relais par adresse (Boxtal v3.1) ----
  const [relayNumber, setRelayNumber] = useState("");       // ex: "4"
  const [relayStreet, setRelayStreet] = useState("");       // ex: "boulevard des capucines"
  const [relayCity, setRelayCity] = useState("");           // ex: "Paris"
  const [relayZip, setRelayZip] = useState("75001");        // postalCode
  const [relayState, setRelayState] = useState("");         // optionnel
  const [relayCountryIso, setRelayCountryIso] = useState("FR");

  // Tarifs sélectionnés
  const [selectedRateCode, setSelectedRateCode] = useState(null);

  // Paiement
  const [payMethod, setPayMethod] = useState("card");
  const [acceptTosCard, setAcceptTosCard] = useState(false);
  const [acceptTosPaypal, setAcceptTosPaypal] = useState(false);

  // Totaux
  const lsItemsAmount = useMemo(
    () => readLsItems().reduce((s, it) => s + Number(it?.price ?? it?.priceTtc ?? 0) * getQty(it), 0),
    []
  );
  const baseTotal = totalFromState > 0 ? totalFromState : lsItemsAmount;

  // Poids panier (fallback 0.25 kg / article)
  const cartWeightKg = useMemo(() => {
    const items = readLsItems();
    return items.reduce((s, it) => s + (it.weightKg ?? 0.25) * getQty(it), 0);
  }, []);

  const declaredValue = baseTotal;

  // === 1) Charger les tarifs (à domicile) selon l'adresse de livraison ===
  useEffect(() => {
    const zip = deliveryFavoriteAddress?.postalCode || billingAddress?.postalCode;
    const country = (deliveryFavoriteAddress?.country || "FR").slice(0, 2).toUpperCase();
    if (!zip) return;

    dispatch(
      getShippingRatesRequest({
        toZip: zip,
        country,
        weightKg: cartWeightKg,
        value: declaredValue,
      })
    );
  }, [deliveryFavoriteAddress, billingAddress, cartWeightKg, declaredValue, dispatch]);

  // === 2) Recharger les tarifs si on choisit un relais ===
  useEffect(() => {
    if (deliveryMode !== "relay" || !selectedRelay) return;
    dispatch(
      getShippingRatesRequest({
        toZip: selectedRelay.zip,
        country: "FR",
        weightKg: cartWeightKg,
        value: declaredValue,
      })
    );
  }, [deliveryMode, selectedRelay, cartWeightKg, declaredValue, dispatch]);

  // === 3) Recherche des relais ===

  // a) Recherche par adresse (NOUVEAU)
  const fetchRelaysByAddress = () => {
    dispatch(
      getRelaysByAddressRequest({
        number: relayNumber || undefined,
        street: relayStreet || undefined,
        city: relayCity || undefined,
        postalCode: relayZip || undefined,
        state: relayState || undefined,
        countryIsoCode: relayCountryIso || "FR",
        // searchNetworks: ["MONR","CHRP"], // si tu veux filtrer par transporteurs
        limit: 30,
      })
    );
    setDeliveryMode("relay");
  };

  // b) Ancienne recherche par ZIP (si tu veux la garder)
  const fetchRelaysByZip = () => {
    dispatch(getRelaysRequest({ zip: relayZip, country: "FR" }));
    setDeliveryMode("relay");
  };

  // Liste à afficher : priorité aux résultats “par adresse”
  const displayedRelays = (relaysByAddress && relaysByAddress.length > 0) ? relaysByAddress : relays;
  const displayedRelaysLoading = relaysByAddressLoading || relaysLoading;

  // Prix en fonction de la sélection
  const shippingPrice = useMemo(() => {
    if (deliveryMode === "relay") {
      const relayOffer = rates.find((r) => r.isRelay) || rates[0];
      return relayOffer ? Number(relayOffer.priceTtc) : 0;
    }
    const o = rates.find((r) => r.code === selectedRateCode);
    return o ? Number(o.priceTtc) : 0;
  }, [deliveryMode, rates, selectedRateCode]);

  const grandTotal = +(baseTotal + shippingPrice).toFixed(2);

  const chooseFromBook = (idx) => {
    setShippingIndex(idx);
    setShowBook(false);
  };
  const addShippingAddress = (payload) => {
    setAddresses((arr) => {
      const next = [...arr, payload];
      setShippingIndex(next.length - 1);
      return next;
    });
    setShowAddShip(false);
  };
  const startEditShipping = (idx) => setEditShipIdx(idx);
  const saveEditShipping = (payload) => {
    setAddresses((arr) => arr.map((a, i) => (i === editShipIdx ? payload : a)));
    setEditShipIdx(null);
  };

  /* ---- Création de la commande + lignes depuis LS + (ex) création d'envoi Boxtal ---- */
  const createOrderFromCart = async (paymentMethodLabel) => {
    if (!currentCustomer?.id) {
      alert("Veuillez vous connecter pour finaliser votre commande.");
      return;
    }

    if (deliveryMode === "relay" && !selectedRelay) {
      alert("Choisissez un point relais avant de continuer.");
      return;
    }

    const beforeIds = (orders || [])
      .filter(
        (o) =>
          String(o?.idCustomer ?? o?.customerId ?? o?.CustomerId ?? o?.customer?.id ?? "") ===
          String(currentCustomer.id)
      )
      .map(getOrderEntityId)
      .filter(Boolean);

    const chosenRate =
      deliveryMode === "relay"
        ? rates.find((r) => r.isRelay) || rates.find((r) => r.code === selectedRateCode)
        : rates.find((r) => r.code === selectedRateCode);

    // 1) créer la commande
    await dispatch(
      addOrderRequest({
        CustomerId: Number(currentCustomer.id),
        PaymentMethod: paymentMethodLabel, // "Carte" | "PayPal"
        Status: "En attente",
        Amount: Number(grandTotal),
        DeliveryAmount: Number(shippingPrice),

        // 👉 Infos transport
        DeliveryMode: deliveryMode,
        DeliveryCarrier: chosenRate?.carrier || "Boxtal",
        DeliveryMethodCode: chosenRate?.code || "",
        DeliveryPointId: deliveryMode === "relay" ? selectedRelay?.id ?? null : null,
        DeliveryPointLabel: deliveryMode === "relay" ? selectedRelay?.name ?? null : null,
      })
    );

    // 2) récupérer l'ID créé
    const newOrderId = await waitForNewOrderId(dispatch, store, currentCustomer.id, beforeIds);
    if (!newOrderId) {
      alert("Commande créée mais identifiant introuvable pour l’instant. Réessayez ou actualisez.");
      return;
    }

    // 3) ajouter les lignes depuis le localStorage
    const items = readLsItems();
    for (const it of items) {
      const pid = getPid(it);
      const qty = getQty(it);
      const unitPriceWhenOrder = getProductUnitPrice(it, productsFromStore);
      if (!pid || qty <= 0) continue;

      await dispatch(
        addOrderCustomerProductRequest({
          OrderId: Number(newOrderId),
          CustomerId: Number(currentCustomer.id),
          ProductId: Number(pid),
          Quantity: Number(qty),
          IdOrder: Number(newOrderId),
          IdProduct: Number(pid),
          ProductUnitPrice: unitPriceWhenOrder,
        })
      );
    }

    // 4) (exemple) créer l'expédition Boxtal côté backend via Saga
    try {
      const body = {
        serviceCode: chosenRate?.code || "",
        isRelay: deliveryMode === "relay",
        relayId: deliveryMode === "relay" ? selectedRelay?.id ?? null : null,
        toFirstName: currentCustomer?.firstName ?? "",
        toLastName: currentCustomer?.lastName ?? "",
        toStreet: deliveryFavoriteAddress?.address ?? "",
        toExtra: deliveryFavoriteAddress?.complementaryAddress ?? "",
        toZip:
          deliveryMode === "relay" ? selectedRelay?.zip ?? "" : deliveryFavoriteAddress?.postalCode ?? "",
        toCity:
          deliveryMode === "relay" ? selectedRelay?.city ?? "" : deliveryFavoriteAddress?.city ?? "",
        toCountry: "FR",
        weightKg: cartWeightKg,
        declaredValue: baseTotal,
      };
      // ⚠️ En prod, lance plutôt après succès du paiement
      dispatch(createShipmentRequest(newOrderId, body));
    } catch (e) {
      console.error("Create shipment error:", e);
    }

    // 5) refresh
    await Promise.all([dispatch(getOrderRequest?.()), dispatch(getOrderCustomerProductRequest?.())]);

    // 6) vider le panier (Redux + LS)
    await dispatch(saveCartRequest([]));
    localStorage.setItem("items", "[]");

    alert("Votre commande a été enregistrée.");
  };

  const handleStripePay = async () => {
    if (!acceptTosCard) return;
    await createOrderFromCart("Carte");
  };

  const handlePayPal = async () => {
    if (!acceptTosPaypal) return;
    await createOrderFromCart("PayPal");
  };

  const shipAddr = addresses[shippingIndex];

  return (
    <div className="product-page dp-page" style={{ maxWidth: 1200 }}>
      {/* ==================== SECTION LIVRAISON ==================== */}
      <h2 className="section-title" style={{ textAlign: "left" }}>
        Livraison
      </h2>

      <div
        className="new-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 18,
        }}
      >
        {/* ----- À domicile ----- */}
        <section className="category-card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <input type="radio" name="deliv" checked={deliveryMode === "home"} onChange={() => setDeliveryMode("home")} />
            <h3 style={{ margin: 0 }}>À domicile</h3>
            <span style={chipMuted}>Tarifs en direct</span>
          </div>

          <div style={smallTitle}>Votre adresse de livraison</div>
          <div style={addressWrap}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800 }}>
                {currentCustomer?.firstName} {currentCustomer?.lastName}
              </div>
              {deliveryFavoriteAddress ? (
                <>
                  <div>{deliveryFavoriteAddress.address}</div>
                  {deliveryFavoriteAddress.complementaryAddress && (
                    <div>{deliveryFavoriteAddress.complementaryAddress}</div>
                  )}
                  <div>
                    {deliveryFavoriteAddress.postalCode} {deliveryFavoriteAddress.city}
                  </div>
                  <div>{deliveryFavoriteAddress.country}</div>
                  {deliveryFavoriteAddress.phone && (
                    <div style={{ color: "#6b7280" }}>{deliveryFavoriteAddress.phone}</div>
                  )}
                </>
              ) : (
                <div style={{ color: "#6b7280" }}>Aucune adresse de livraison favorite.</div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button style={lightBtn} onClick={() => setShowBook(true)}>
                Changer
              </button>
              <button style={lightBtn} onClick={() => setShowAddShip(true)}>
                Ajouter
              </button>
            </div>
          </div>

          {/* Offres Boxtal */}
          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            {ratesLoading && <div style={{ color: "#6b7280" }}>Chargement des offres…</div>}
            {!ratesLoading &&
              rates.map((o) => (
                <ShipOption
                  key={o.code}
                  value={o.code}
                  price={fmt(o.priceTtc)}
                  label={`${o.carrier} — ${o.label}`}
                  checked={selectedRateCode === o.code && deliveryMode === "home"}
                  onChange={() => {
                    setSelectedRateCode(o.code);
                    setDeliveryMode("home");
                  }}
                />
              ))}
          </div>
        </section>

        {/* ----- En point relais ----- */}
        <section className="category-card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <input type="radio" name="deliv" checked={deliveryMode === "relay"} onChange={() => setDeliveryMode("relay")} />
            <h3 style={{ margin: 0 }}>En point relais</h3>
            <span style={chipMuted}>Choisissez un relais</span>
          </div>

          <div style={{ color: "#2563eb", fontWeight: 800, fontSize: 12, marginBottom: 6 }}>Recherche par adresse</div>

          {/* Formulaire adresse Boxtal v3.1 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1fr 1fr 100px", gap: 8, alignItems: "end" }}>
            <Field label="N°">
              <input className="form-control" value={relayNumber} onChange={(e) => setRelayNumber(e.target.value)} />
            </Field>
            <Field label="Rue">
              <input className="form-control" value={relayStreet} onChange={(e) => setRelayStreet(e.target.value)} />
            </Field>
            <Field label="Ville">
              <input className="form-control" value={relayCity} onChange={(e) => setRelayCity(e.target.value)} />
            </Field>
            <Field label="Code postal">
              <input className="form-control" value={relayZip} onChange={(e) => setRelayZip(e.target.value)} />
            </Field>
            <div>
              <button style={lightBtn} onClick={fetchRelaysByAddress}>OK</button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 8 }}>
            <Field label="État (optionnel)">
              <input className="form-control" value={relayState} onChange={(e) => setRelayState(e.target.value)} />
            </Field>
            <Field label="Pays (ISO 2)">
              <input className="form-control" value={relayCountryIso} onChange={(e) => setRelayCountryIso(e.target.value.toUpperCase())} />
            </Field>
            <div />
          </div>

          <div style={{ margin: "10px 0", textAlign: "center", color: "#6b7280" }}>ou</div>

          {/* Ancien bouton ZIP (optionnel) */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "center" }}>
            <input className="form-control" style={{ maxWidth: 140 }} value={relayZip} onChange={(e) => setRelayZip(e.target.value)} />
            <button style={lightBtn} onClick={fetchRelaysByZip}>
              Chercher par CP
            </button>
          </div>

          {displayedRelaysLoading && <div style={{ color: "#6b7280", marginTop: 10 }}>Recherche des relais…</div>}

          {!displayedRelaysLoading && displayedRelays.length > 0 && (
            <div style={{ marginTop: 12, display: "grid", gap: 10, maxHeight: 260, overflow: "auto" }}>
              {displayedRelays.map((r) => (
                <label
                  key={r.id}
                  style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 10, display: "grid", gap: 4 }}
                >
                  <input
                    type="radio"
                    name="relay"
                    checked={selectedRelay?.id === r.id}
                    onChange={() => {
                      setSelectedRelay(r);
                      setDeliveryMode("relay");
                    }}
                  />
                  <span><img src={getRelayLogo(r)} style={{width: 45}} alt={r.carrier} /></span>
                  <strong>{r.name}  <span style={{color: "#6b7280"}}>({r.distance})</span></strong>
                  <span>{r.address}</span>
                  <span>{r.zipCode} {r.city}</span>
                  <span><strong>{r.schedules}</strong></span>
                </label>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ==================== ADRESSE DE FACTURATION ==================== */}
      <div className="category-card" style={{ padding: 16, marginBottom: 18, display: "grid", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <i className="bi bi-file-earmark-text" aria-hidden="true" />
          <div style={{ fontWeight: 800 }}>Votre adresse de facturation</div>
        </div>

        <div style={addressWrap}>
          <div style={{ flex: 1 }}>
            {billingAddress ? (
              <>
                <div style={{ fontWeight: 800 }}>
                  {currentCustomer?.firstName} {currentCustomer?.lastName} — {billingAddress.address}
                  {billingAddress.complementaryAddress ? `, ${billingAddress.complementaryAddress}` : ""}
                </div>
                <div>
                  {billingAddress.postalCode} {billingAddress.city} — {billingAddress.country}
                </div>
              </>
            ) : (
              <div style={{ color: "#6b7280" }}>Aucune adresse de facturation.</div>
            )}
          </div>

          <button style={lightBtn} onClick={() => setShowEditBilling(true)}>
            Modifier
          </button>
        </div>
      </div>

      {/* ==================== PAIEMENT + RÉCAP ==================== */}
      <h2 className="section-title" style={{ textAlign: "left" }}>
        Paiement
      </h2>

      <div className="pay-grid" style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 18 }}>
        {/* ====== Carte bancaire (Stripe) ====== */}
        <section className="category-card" style={{ padding: 16 }}>
          <label className="pay-method" style={payMethodRow}>
            <input type="radio" name="pay" checked={payMethod === "card"} onChange={() => setPayMethod("card")} />
            <span style={{ fontWeight: 800 }}>Carte bancaire</span>
            <span aria-hidden="true">💳</span>
          </label>

          {payMethod === "card" && (
            <>
              <div style={stripeInfo}>
                Paiement sécurisé via Stripe. Vous serez redirigé pour renseigner votre carte.
              </div>

              <label className="tos-row" style={tosRow}>
                <input type="checkbox" checked={acceptTosCard} onChange={(e) => setAcceptTosCard(e.target.checked)} />
                <span>J’accepte les conditions générales de vente.</span>
              </label>

              <button className="dp-pay-btn" disabled={!acceptTosCard} onClick={handleStripePay}>
                Payer ma commande
              </button>
            </>
          )}

          <div style={{ height: 10 }} />

          {/* ====== PayPal ====== */}
          <label className="pay-method" style={payMethodRow}>
            <input type="radio" name="pay" checked={payMethod === "paypal"} onChange={() => setPayMethod("paypal")} />
            <span style={{ fontWeight: 800 }}>PayPal</span>
          </label>

          {payMethod === "paypal" && (
            <>
              <div style={stripeInfo}>Vous serez redirigé vers PayPal pour finaliser le paiement.</div>

              <label className="tos-row" style={tosRow}>
                <input
                  type="checkbox"
                  checked={acceptTosPaypal}
                  onChange={(e) => setAcceptTosPaypal(e.target.checked)}
                />
                <span>J’accepte les conditions générales de vente.</span>
              </label>

              <button className="dp-pay-btn" disabled={!acceptTosPaypal} onClick={handlePayPal}>
                Payer avec PayPal
              </button>
            </>
          )}
        </section>

        {/* ====== Récapitulatif ====== */}
        <aside className="cart-summary" style={summaryCard}>
          <h3 style={{ margin: 0, fontWeight: 800 }}>Récapitulatif</h3>

          <div style={sumRow}>
            <span>Montant de vos produits</span>
            <strong>{fmt(baseTotal)}</strong>
          </div>

          <div style={sumRow}>
            <span>Livraison</span>
            <strong>{fmt(shippingPrice)}</strong>
          </div>

          <hr style={{ border: 0, borderTop: "1px solid #eee" }} />

          <div style={{ ...sumRow, fontSize: "1.25rem" }}>
            <span>Total TTC</span>
            <strong>{fmt(grandTotal)}</strong>
          </div>

          <div style={{ marginTop: 10, color: "#6b7280", fontSize: ".9rem" }}>
            Livraison {deliveryMode === "relay" ? "en point relais" : "à domicile"}.
          </div>
        </aside>
      </div>

      {/* ==================== POPUPS ==================== */}
      <AddressBookModal
        open={showBook}
        addresses={addresses}
        onChoose={chooseFromBook}
        onEdit={startEditShipping}
        onClose={() => setShowBook(false)}
      />

      <AddressFormModal
        open={showAddShip}
        initial={null}
        title="Adresse de livraison"
        onSave={addShippingAddress}
        onCancel={() => setShowAddShip(false)}
      />

      <AddressFormModal
        open={editShipIdx !== null}
        initial={editShipIdx !== null ? addresses[editShipIdx] : null}
        title="Adresse de livraison"
        onSave={saveEditShipping}
        onCancel={() => setEditShipIdx(null)}
      />

      <AddressFormModal
        open={showEditBilling}
        initial={billing}
        title="Adresse de facturation"
        onSave={(p) => {
          setBilling(p);
          setShowEditBilling(false);
        }}
        onCancel={() => setShowEditBilling(false)}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* ------------------------------ UI -------------------------------- */
/* ------------------------------------------------------------------ */

function ShipOption({ value, label, sub, price, checked, onChange }) {
  return (
    <label
      htmlFor={`op-${value}`}
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gap: 10,
        alignItems: "center",
        padding: "10px 12px",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        cursor: "pointer",
      }}
    >
      <input id={`op-${value}`} type="radio" name="shipopt" checked={checked} onChange={onChange} />
      <div>
        <div style={{ fontWeight: 700 }}>{label}</div>
        {sub && <div style={{ color: "#6b7280", fontSize: ".95rem" }}>{sub}</div>}
      </div>
      <div style={{ fontWeight: 800 }}>{price}</div>
    </label>
  );
}

const addressWrap = {
  display: "flex",
  gap: 14,
  alignItems: "flex-start",
  padding: 10,
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  background: "#fafafa",
};
const chipMuted = {
  fontSize: 12,
  background: "#eef2ff",
  color: "#374151",
  padding: "3px 8px",
  borderRadius: 999,
  fontWeight: 700,
};
const smallTitle = { fontWeight: 700, color: "#374151", marginBottom: 6 };
const lightBtn = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  background: "#fff",
  cursor: "pointer",
  fontWeight: 700,
};
const primaryBtn = {
  padding: "10px 14px",
  borderRadius: 10,
  border: 0,
  background: "linear-gradient(135deg, #3b79ff, #2c5dff)",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 800,
};
const addressCard = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 12,
  background: "#fff",
};
const stripeInfo = {
  background: "#f8fafc",
  border: "1px dashed #cfe1ff",
  color: "#0f172a",
  borderRadius: 12,
  padding: 12,
  margin: "8px 0 12px",
  fontWeight: 600,
};
const payMethodRow = { display: "flex", alignItems: "center", gap: 10, marginBottom: 8 };
const tosRow = { display: "flex", alignItems: "center", gap: 10, margin: "8px 0 12px" };
const summaryCard = {
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 8px 24px rgba(0,0,0,.06)",
  padding: 18,
  alignSelf: "start",
  position: "sticky",
  top: 110,
};
const sumRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  margin: "8px 0",
};
