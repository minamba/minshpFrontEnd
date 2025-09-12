// src/pages/checkout/DeliveryPayment.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../../App.css";

import { saveCartRequest } from "../../lib/actions/CartActions";

// Shipping
import {
  getShippingRatesRequest,
  getRelaysByAddressRequest,
} from "../../lib/actions/ShippingActions";

// Delivery addresses
import {
  getDeliveryAddressRequest,
  updateDeliveryAddressRequest,
  addDeliveryAddressRequest,
} from "../../lib/actions/DeliveryAddressActions";

// Billing addresses
import {
  getBillingAddressRequest,
  updateBillingAddressRequest,
  addBillingAddressRequest,
} from "../../lib/actions/BillingAddressActions";

// Stripe (création de session + confirmation UI)
import {
  createCheckoutSessionRequest,
  confirmCheckoutSessionRequest,
} from "../../lib/actions/StripeActions";

/* ------------------------------------------------------------------ */
/* --------------------------- Helpers & UI -------------------------- */
/* ------------------------------------------------------------------ */



const carrierToOperator = (carrier, fallbackNetwork) => {
  const s = String(carrier || "").toLowerCase();
  if (fallbackNetwork && /^[A-Z]{4}$/.test(fallbackNetwork)) return fallbackNetwork;
  if (s.includes("chrono")) return "CHRP";
  if (s.includes("ups")) return "UPSE";
  if (s.includes("mondial")) return "MONR";
  if (s.includes("la poste")) return "POFR";
  return fallbackNetwork || "";
};

const normalizeRelay = (r) => {
  const id =
    r?.id ??
    r?.code ??
    r?.pickupPointCode ??
    r?.PUDO_ID ??
    r?.ident ??
    r?.pickupCode ??
    "";
  return {
    id: String(id),
    code: String(id),
    name: r?.name ?? r?.label ?? r?.shopName ?? "",
    address: r?.address ?? r?.street ?? r?.address1 ?? "",
    zip: String(r?.zipCode ?? r?.postalCode ?? r?.zip ?? ""),
    city: r?.city ?? "",
    network: r?.network ?? null,
    carrier: r?.carrier ?? null,
    schedules: r?.schedules ?? r?.openingHours ?? "",
    distance: r?.distance ?? "",
    raw: r,
  };
};

const fmt = (n) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
    Number(n) || 0
  );

const readLsItems = () => {
  try {
    return JSON.parse(localStorage.getItem("items") || "[]");
  } catch {
    return [];
  }
};
const getPid = (it) => it?.productId ?? it?.id ?? it?.Id ?? null;
const getQty = (it) => Number(it?.qty ?? it?.quantity ?? 1);
const toNum = (v) => (typeof v === "number" ? v : parseFloat(v));
const toNumOrNull = (v) => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  if (s === "" || s === "null" || s === "nan" || s === "undefined") return null;
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : null;
};
const parseDate = (val) => {
  if (!val) return null;
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d;
};

const getActiveProductPromoPrice = (product) => {
  const promo = product?.promotions?.[0];
  if (!promo) return null;
  const pct = Number(promo?.purcentage) || 0;
  if (pct <= 0) return null;
  const start = parseDate(promo?.startDate);
  const end = parseDate(promo?.endDate);
  const now = new Date();
  const endOfDay = end
    ? new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999)
    : null;
  if (start && start > now) return null;
  if (endOfDay && endOfDay < now) return null;
  const base = Number(toNum(product?.priceTtc ?? product?.price)) || 0;
  const promotedField = toNumOrNull(product?.priceTtcPromoted);
  if (promotedField != null) return promotedField;
  return +(base * (1 - pct / 100)).toFixed(2);
};

const getProductUnitPrice = (it, productsFromStore) => {
  const pid = getPid(it);
  const product = productsFromStore.find((p) => String(p?.id) === String(pid));
  if (!product) return Number(toNum(it?.price ?? it?.priceTtc)) || 0;
  const subCatCode = toNumOrNull(product?.priceTtcSubCategoryCodePromoted);
  if (subCatCode != null) return subCatCode;
  const catCode = toNumOrNull(product?.priceTtcCategoryCodePromoted);
  if (catCode != null) return catCode;
  const activePromo = getActiveProductPromoPrice(product);
  if (activePromo != null) return activePromo;
  return Number(toNum(product?.priceTtc ?? product?.price)) || 0;
};

const relayCode = { MondialRelay: "MONR", Ups: "UPSE", Chronopost: "CHRP", LaPoste: "POFR" };
const getRelayLogo = (relay) => {
  switch (relay.network) {
    case relayCode.MondialRelay:
      return "../images/mondialrelay.png";
    case relayCode.Ups:
      return "../images/ups.png";
    case relayCode.Chronopost:
      return "../images/chronopost.png";
    case relayCode.LaPoste:
      return "../images/laposte.png";
    default:
      return relay.logo ? relay.logo : "https://via.placeholder.com/150";
  }
};

// Parse adresse une ligne
export function parseRelayAddress(input, defaults = { countryIso: "FR" }) {
  let s = String(input || "").trim().replace(/\s+/g, " ");
  if (!s)
    return {
      number: undefined,
      street: undefined,
      city: undefined,
      postalCode: undefined,
      countryIsoCode: defaults.countryIso,
    };
  const countryMap = {
    fr: "FR",
    france: "FR",
    be: "BE",
    belgique: "BE",
    ch: "CH",
    suisse: "CH",
  };
  const mCountry = s.match(/\b(france|fr|belgique|be|suisse|ch)\b/i);
  let countryIso = defaults.countryIso;
  if (mCountry) {
    countryIso = countryMap[mCountry[1].toLowerCase()] || defaults.countryIso;
    s = s.replace(mCountry[0], "").trim();
  }
  const zipRe = countryIso === "FR" ? /\b\d{5}\b/ : /\b\d{4}\b/;
  const mZip = s.match(zipRe);
  const postalCode = mZip ? mZip[0] : undefined;
  if (postalCode) s = s.replace(postalCode, "").trim();
  const mNum = s.match(/^\s*(\d+[A-Za-z]?)\b/);
  const number = mNum ? mNum[1] : undefined;
  if (number) s = s.replace(mNum[0], "").trim();
  let street, city, state;
  const parts = s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  if (parts.length >= 2) {
    street = parts.slice(0, -1).join(", ");
    city = parts[parts.length - 1];
  } else {
    const tokens = s.split(" ");
    if (tokens.length > 1) {
      city = tokens[tokens.length - 1];
      street = tokens.slice(0, -1).join(" ");
    } else {
      street = s || undefined;
    }
  }
  return { number, street, city, postalCode, countryIsoCode: countryIso, state };
}

/* ----------------------- Phone helpers / component ----------------------- */

const PHONE_COUNTRIES = [
  { iso: "FR", label: "France", dial: "+33" },
  { iso: "BE", label: "Belgique", dial: "+32" },
  { iso: "ES", label: "Espagne", dial: "+34" },
  { iso: "IT", label: "Italie", dial: "+39" },
  { iso: "DE", label: "Allemagne", dial: "+49" },
  { iso: "IE", label: "Irlande", dial: "+353" },
  { iso: "US", label: "États-Unis", dial: "+1" },
  { iso: "ML", label: "Mali", dial: "+223" },
  { iso: "SN", label: "Sénégal", dial: "+221" },
  { iso: "MA", label: "Maroc", dial: "+212" },
  { iso: "DZ", label: "Algérie", dial: "+213" },
  { iso: "AE", label: "Dubai (EAU)", dial: "+971" },
];
const DEFAULT_DIAL = PHONE_COUNTRIES[0].dial;
function cleanPhoneLocal(s) {
  return String(s || "").replace(/[^\d]/g, "");
}
function PhoneInputWithCountry({ valueDial, valueLocal, onChange }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 8 }}>
      <select
        className="form-control"
        value={valueDial || DEFAULT_DIAL}
        onChange={(e) => onChange({ dial: e.target.value, local: valueLocal })}
      >
        {PHONE_COUNTRIES.map((c) => (
          <option key={c.iso} value={c.dial}>
            {c.label} ({c.dial})
          </option>
        ))}
      </select>
      <input
        className="form-control"
        placeholder="Numéro (ex: 6 12 34 56 78)"
        value={valueLocal || ""}
        onChange={(e) =>
          onChange({
            dial: valueDial || DEFAULT_DIAL,
            local: cleanPhoneLocal(e.target.value),
          })
        }
      />
    </div>
  );
}

/* ----------------------- Address autocomplete (BAN) ---------------------- */
function AddressAutocomplete({
  value,
  onChangeText,
  onSelect,
  placeholder = "Saisis ton adresse",
}) {
  const [q, setQ] = useState(value || "");
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(-1);
  const [typing, setTyping] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const timerRef = React.useRef(null);
  const abortRef = React.useRef(null);
  const inputRef = React.useRef(null);

  useEffect(() => {
    setQ(value ?? "");
  }, [value]);

  useEffect(() => {
    if (!hasFocus || !typing || !q || q.trim().length < 3) {
      setItems([]);
      setOpen(false);
      return;
    }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
        q
      )}&limit=8&autocomplete=1`;
      try {
        const res = await fetch(url, { signal: ctrl.signal });
        const json = await res.json();
        const list = (json?.features || []).map((f) => {
          const p = f.properties || {};
          return {
            id: f.id || `${p.id}-${p.citycode}-${p.postcode}-${p.name}`,
            label: p.label,
            name: p.name,
            housenumber: p.housenumber,
            street: p.street || p.name,
            postcode: p.postcode,
            city: p.city,
            country: "France (métropolitaine)",
            lat: f.geometry?.coordinates?.[1],
            lon: f.geometry?.coordinates?.[0],
          };
        });
        setItems(list);
        setOpen(list.length > 0);
        setHi(-1);
      } catch (e) {
        if (e.name !== "AbortError") console.error(e);
      }
    }, 250);
    return () => clearTimeout(timerRef.current);
  }, [q, typing, hasFocus]);

  const choose = (it) => {
    setOpen(false);
    setItems([]);
    setHi(-1);
    setTyping(false);
    onChangeText?.(it.label);
    onSelect?.(it);
    if (inputRef.current) inputRef.current.blur();
    setHasFocus(false);
  };

  const onKeyDown = (e) => {
    if (!open || items.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHi((x) => Math.min(items.length - 1, x + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHi((x) => Math.max(0, x - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const it = items[hi] || items[0];
      if (it) choose(it);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <input
        ref={inputRef}
        className="form-control"
        placeholder={placeholder}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setTyping(true);
          onChangeText?.(e.target.value);
        }}
        onFocus={() => {
          setHasFocus(true);
          if (typing && items.length > 0) setOpen(true);
        }}
        onBlur={() => {
          setTimeout(() => {
            setHasFocus(false);
            setOpen(false);
          }, 100);
        }}
        onKeyDown={onKeyDown}
        autoComplete="off"
      />
      {open && items.length > 0 && (
        <div
          style={{
            position: "absolute",
            zIndex: 30,
            top: "100%",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            marginTop: 6,
            boxShadow: "0 8px 24px rgba(0,0,0,.08)",
            maxHeight: 300,
            overflow: "auto",
          }}
        >
          {items.map((it, i) => (
            <div
              key={it.id}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(it)}
              onMouseEnter={() => setHi(i)}
              style={{
                padding: "10px 12px",
                cursor: "pointer",
                background: hi === i ? "#f3f4f6" : "transparent",
              }}
            >
              <div style={{ fontWeight: 600 }}>{it.label}</div>
              <div style={{ color: "#6b7280", fontSize: 12 }}>
                {it.postcode} {it.city}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ----------------------- Form mapping / payload ----------------------- */

const PHONE_DEFAULT_COUNTRY_LABEL = "France (métropolitaine)";
const makeStreetLine = (addr) =>
  `${addr?.housenumber ? `${addr.housenumber} ` : ""}${
    addr?.street || addr?.name || ""
  }`.trim();

const toForm = (a, currentCustomer) => {
  const phoneRaw =
    a?.phone ?? a?.Phone ?? a?.phoneNumber ?? currentCustomer?.phoneNumber ?? "";
  const dial =
    (phoneRaw.startsWith("+") ? phoneRaw.match(/^\+\d{1,3}/)?.[0] : null) ||
    DEFAULT_DIAL;
  const local = phoneRaw.replace(dial, "").replace(/[^\d]/g, "");

  if (!a)
    return {
      id: undefined,
      civ: currentCustomer?.civ || "M.",
      firstName: currentCustomer?.firstName || "",
      lastName: currentCustomer?.lastName || "",
      address1: "",
      address2: "",
      zip: "",
      city: "",
      country: PHONE_DEFAULT_COUNTRY_LABEL,
      phoneDial: dial,
      phoneLocal: local,
      favorite: false,
    };

  return {
    id: a?.id ?? a?.Id ?? a?.deliveryAddressId ?? a?.billingAddressId ?? undefined,
    civ: a?.civ ?? a?.civility ?? a?.Civ ?? currentCustomer?.civ ?? "M.",
    firstName: a?.firstName ?? a?.FirstName ?? currentCustomer?.firstName ?? "",
    lastName: a?.lastName ?? a?.LastName ?? currentCustomer?.lastName ?? "",
    address1: a?.address ?? a?.Address ?? a?.addressLine ?? a?.line1 ?? "",
    address2: a?.complementaryAddress ?? a?.ComplementaryAddress ?? a?.line2 ?? "",
    zip: a?.postalCode ?? a?.PostalCode ?? a?.zip ?? a?.zipCode ?? "",
    city: a?.city ?? a?.City ?? a?.ville ?? "",
    country: a?.country ?? a?.Country ?? PHONE_DEFAULT_COUNTRY_LABEL,
    phoneDial: dial,
    phoneLocal: local,
    favorite: a?.favorite ?? a?.Favorite ?? false,
  };
};

const toPayload = (form, currentCustomer, type) => {
  const fullPhone = `${form.phoneDial || DEFAULT_DIAL}${cleanPhoneLocal(
    form.phoneLocal
  )}`;
  const base = {
    Id: form.id ?? undefined,
    IdCustomer: currentCustomer?.id,
    Civ: form.civ,
    FirstName: type === "billing" ? currentCustomer?.firstName : form.firstName,
    LastName: type === "billing" ? currentCustomer?.lastName : form.lastName,
    Address: form.address1,
    ComplementaryAddress: form.address2,
    PostalCode: form.zip,
    City: form.city,
    Country: form.country,
    Phone: fullPhone,
  };
  return type === "billing" ? base : { ...base, Favorite: !!form.favorite };
};

/* ------------------------------ Mini Modales ------------------------------ */

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
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
              marginTop: 16,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

function AddressFormModal({
  open,
  initial,
  onSave,
  onCancel,
  title = "Adresse",
  type = "delivery",
}) {
  const [form, setForm] = useState(() => initial);
  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const change = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  return (
    <SimpleModal
      open={open}
      onClose={onCancel}
      title={title}
      footer={[
        <button key="cancel" onClick={onCancel} style={lightBtn}>
          Annuler
        </button>,
        <button key="ok" onClick={() => onSave(form)} style={primaryBtn}>
          Valider
        </button>,
      ]}
    >
      {form && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={{ marginBottom: 6, fontWeight: 700 }}>Civilité *</div>
            <div style={{ display: "flex", gap: 16 }}>
              {["M.", "Mme"].map((c) => (
                <label
                  key={c}
                  style={{ display: "inline-flex", gap: 6, alignItems: "center" }}
                >
                  <input
                    type="radio"
                    name={`civ-${type}`}
                    checked={form.civ === c}
                    onChange={() => change("civ", c)}
                  />
                  <span>{c}</span>
                </label>
              ))}
            </div>
          </div>

          <div />

          <Field label="Prénom *">
            <input
              className="form-control"
              value={form.firstName}
              onChange={(e) => change("firstName", e.target.value)}
              disabled={type === "billing"}
            />
          </Field>
          <Field label="Nom *">
            <input
              className="form-control"
              value={form.lastName}
              onChange={(e) => change("lastName", e.target.value)}
              disabled={type === "billing"}
            />
          </Field>

          <Field label="Adresse *">
            <AddressAutocomplete
              value={form.address1}
              onChangeText={(txt) => change("address1", txt)}
              onSelect={(addr) => {
                const streetLine = makeStreetLine(addr);
                change("address1", streetLine);
                change("zip", addr.postcode || "");
                change("city", addr.city || "");
                change("country", addr.country || PHONE_DEFAULT_COUNTRY_LABEL);
              }}
              placeholder="N° et libellé de rue"
            />
          </Field>

          <Field label="Complément d’adresse">
            <input
              className="form-control"
              placeholder="Bâtiment, étage, digicode…"
              value={form.address2}
              onChange={(e) => change("address2", e.target.value)}
            />
          </Field>

          <Field label="Code postal *">
            <input
              className="form-control"
              value={form.zip}
              onChange={(e) => change("zip", e.target.value)}
            />
          </Field>
          <Field label="Ville *">
            <input
              className="form-control"
              value={form.city}
              onChange={(e) => change("city", e.target.value)}
            />
          </Field>

          <Field label="Pays *">
            <select
              className="form-control"
              value={form.country}
              onChange={(e) => change("country", e.target.value)}
            >
              <option>France (métropolitaine)</option>
              <option>Belgique</option>
              <option>Suisse</option>
            </select>
          </Field>

          <div />

          <Field label="Téléphone">
            <PhoneInputWithCountry
              valueDial={form.phoneDial}
              valueLocal={form.phoneLocal}
              onChange={({ dial, local }) => {
                change("phoneDial", dial);
                change("phoneLocal", local);
              }}
            />
          </Field>

          {type === "delivery" && (
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={!!form.favorite}
                onChange={(e) => change("favorite", e.target.checked)}
              />
              <span>Définir comme préférée</span>
            </label>
          )}
        </div>
      )}
    </SimpleModal>
  );
}

function AddressBookModal({ open, addresses, onChoose, onEdit, onClose }) {
  return (
    <SimpleModal open={open} onClose={onClose} title="Carnet d’adresses">
      {addresses.length === 0 && (
        <div style={{ color: "#6b7280" }}>Aucune adresse de livraison.</div>
      )}
      <div style={{ display: "grid", gap: 12 }}>
        {addresses.map((a, idx) => (
          <div key={idx} style={addressCard}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: 6 }}>
                {a.firstName} {a.lastName}
              </div>
              {a.favorite ? <span className="badge bg-primary">Préférée</span> : null}
            </div>
            <div>
              {a.address}
              {a.complementaryAddress ? `, ${a.complementaryAddress}` : ""}
            </div>
            <div>
              {a.postalCode} {a.city}
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
              <button
                style={primaryBtn}
                onClick={() => onChoose(idx)}
                disabled={a.favorite === true}
                title={
                  a.favorite
                    ? "Déjà l’adresse préférée"
                    : "Définir comme préférée"
                }
              >
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
/* ------------------------ Page principale -------------------------- */
/* ------------------------------------------------------------------ */

export const DeliveryPayment = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { state } = location;

  // Lecture slice payment
  const payment = useSelector((s) => s?.payment) || {};
  const paymentConfirmed = !!payment.confirmed;

  const productsFromStore = useSelector((s) => s?.products?.products) || [];
  const { user } = useSelector((s) => s.account);
  const customers = useSelector((s) => s?.customers?.customers) || [];
  const uid = user?.id || null;
  const currentCustomer = customers.find((c) => c.idAspNetUser === uid);

  // 📦 Adresses
  const billingAddresses =
    useSelector((s) => s?.billingAddresses?.billingAddresses || []) || [];
  const deliveryAddresses =
    useSelector((s) => s?.deliveryAddresses?.deliveryAddresses || []) || [];

  const deliveryLst = (deliveryAddresses || []).filter(
    (a) => a?.idCustomer === currentCustomer?.id
  );
  const deliveryFavoriteAddress = deliveryLst.find((a) => a?.favorite);
  const billingAddress = billingAddresses.find(
    (a) => a?.idCustomer === currentCustomer?.id
  );

  // Charger adresses
  useEffect(() => {
    dispatch(getDeliveryAddressRequest?.());
  }, [dispatch]);
  useEffect(() => {
    dispatch(getBillingAddressRequest?.());
  }, [dispatch]);

  // Déclenche la confirmation Stripe si on revient avec session_id (affichage uniquement)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionId = params.get("session_id");
    if (sessionId) {
      dispatch(confirmCheckoutSessionRequest(sessionId));
    }
  }, [location.search, dispatch]);

  // Shipping slice
  const {
    rates = [],
    ratesLoading,
    relays = [],
    relaysLoading,
    relaysByAddress = [],
    relaysByAddressLoading,
  } = useSelector((s) => s?.shipping || {});

  // ⚙️ États UI
  const [showBook, setShowBook] = useState(false);
  const [editShipIdx, setEditShipIdx] = useState(null);
  const [showEditBilling, setShowEditBilling] = useState(false);

  const [deliveryMode, setDeliveryMode] = useState("home"); // "home" | "relay"
  const [selectedRelay, setSelectedRelay] = useState(null);

  // Snapshot du panier
  const [products] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("items") || "[]");
    } catch {
      return [];
    }
  });

  // PREFILL: une ligne depuis la favorite
  const preferredRelayAddress = useMemo(() => {
    if (!deliveryFavoriteAddress) return "";
    const parts = [];
    if (deliveryFavoriteAddress.address) parts.push(deliveryFavoriteAddress.address);
    const cityPart = [deliveryFavoriteAddress.postalCode, deliveryFavoriteAddress.city]
      .filter(Boolean)
      .join(" ");
    if (cityPart) parts.push(cityPart);
    const country = deliveryFavoriteAddress.country || "FR";
    if (country) parts.push(country);
    return parts.join(", ");
  }, [deliveryFavoriteAddress]);

  const [relayFullAddress, setRelayFullAddress] = useState(preferredRelayAddress);
  useEffect(() => {
    if (!relayFullAddress && preferredRelayAddress) {
      setRelayFullAddress(preferredRelayAddress);
    }
  }, [preferredRelayAddress, relayFullAddress]);

  // Tarif sélectionné (à domicile)
  const [selectedRateCode, setSelectedRateCode] = useState(null);

  // Totaux
  const totalCents = state?.totalCents ?? 0;
  const totalFromState = totalCents / 100;

  const lsItemsAmount = useMemo(
    () =>
      readLsItems().reduce(
        (s, it) => s + Number(it?.price ?? it?.priceTtc ?? 0) * getQty(it),
        0
      ),
    []
  );
  const baseTotal = totalFromState > 0 ? totalFromState : lsItemsAmount;

  // Poids panier
  const cartWeightKg = useMemo(() => {
    const items = readLsItems();
    return items.reduce((s, it) => s + (it.weightKg ?? 0.25) * getQty(it), 0);
  }, []);

  // Packages
  const packages = useMemo(
    () =>
      products.flatMap((p) =>
        p.packageProfil
          ? [
              {
                Id: String(p.packageProfil.id ?? ""),
                ContainedCode: String(p.containedCode ?? ""),
                PackageWeight: String(p.packageProfil.weight ?? ""),
                PackageLonger: String(p.packageProfil.longer ?? ""),
                PackageWidth: String(p.packageProfil.width ?? ""),
                PackageHeight: String(p.packageProfil.height ?? ""),
                PackageValue: parseFloat(p.price ?? 0) || null,
                PackageStackable: true,
                Type: "PARCEL",
              },
            ]
          : []
      ),
    [products]
  );

  /* === 1) Tarifs domicile (auto) === */
  const depZip = deliveryFavoriteAddress?.postalCode || billingAddress?.postalCode || null;
  const depCountry = (deliveryFavoriteAddress?.country || "FR").slice(0, 2).toUpperCase();
  const depCity = deliveryFavoriteAddress?.city || billingAddress?.city || null;

  useEffect(() => {
    if (!depZip || !depCity) return;
    dispatch(
      getShippingRatesRequest({
        RecipientZipCode: String(depZip),
        RecipientCountry: depCountry,
        RecipientCity: depCity,
        Packages: packages,
      })
    );
  }, [dispatch, depZip, depCity, depCountry, packages]);

  const normalizedRates = useMemo(
    () =>
      (rates || []).map((r) => ({
        ...r,
        isRelay:
          r?.isRelay ?? String(r?.deliveryTypeCode).toUpperCase() === "PICKUP_POINT",
        operator: r?.operator || r?.carrierCode || null,
        carrier: r?.carrier || r?.labelCarrier || r?.label || "",
        priceTtc: Number(r?.priceTtc ?? r?.price ?? 0),
      })),
    [rates]
  );

  const homeRates = useMemo(() => normalizedRates.filter((r) => !r.isRelay), [normalizedRates]);
  const relayRates = useMemo(() => normalizedRates.filter((r) => r.isRelay), [normalizedRates]);

  useEffect(() => {
    if (ratesLoading || homeRates.length === 0) return;
    setSelectedRateCode((prev) => prev || homeRates[0].code);
  }, [ratesLoading, homeRates]);

  /* === 2) Recherche relais via adresse UNE LIGNE === */
  const fetchRelaysByAddress = () => {
    const parsed = parseRelayAddress(relayFullAddress, { countryIso: "FR" });
    setDeliveryMode("relay");
    dispatch(
      getRelaysByAddressRequest({
        number: parsed.number || undefined,
        street: parsed.street || undefined,
        city: parsed.city || undefined,
        postalCode: parsed.postalCode || undefined,
        state: parsed.state || undefined,
        countryIsoCode: parsed.countryIsoCode || "FR",
        limit: 30,
      })
    );
  };

  const displayedRelaysRaw =
    relaysByAddress && relaysByAddress.length > 0 ? relaysByAddress : relays;
  const displayedRelays = (displayedRelaysRaw || []).map(normalizeRelay);
  const displayedRelaysLoading = relaysByAddressLoading || relaysLoading;

  const relayOperator = selectedRelay?.network || null;
  const selectedRelayRate = useMemo(() => {
    if (!relayRates || relayRates.length === 0) return null;
    if (!relayOperator) return relayRates[0];
    const upper = String(relayOperator).toUpperCase();
    return (
      relayRates.find(
        (r) =>
          (r.operator && String(r.operator).toUpperCase() === upper) ||
          (r.carrier &&
            r.carrier.toLowerCase().includes(
              upper === "MONR"
                ? "mondial"
                : upper === "CHRP"
                ? "chrono"
                : upper === "UPSE"
                ? "ups"
                : "poste"
            ))
      ) || relayRates[0]
    );
  }, [relayRates, relayOperator]);

  const shippingPrice = useMemo(() => {
    if (deliveryMode === "relay") return Number(selectedRelayRate?.priceTtc ?? 0);
    const o = homeRates.find((r) => r.code === selectedRateCode) || homeRates[0];
    return Number(o?.priceTtc ?? 0);
  }, [deliveryMode, selectedRelayRate, homeRates, selectedRateCode]);

  const grandTotal = +(baseTotal + shippingPrice).toFixed(2);

  /* ------------ Choisir une adresse dans le carnet (favorite) ------------ */
  const chooseFromBook = async (idx) => {
    const a = deliveryLst[idx];
    if (!a) return;
    const id = a?.id ?? a?.deliveryAddressId ?? a?.Id ?? null;
    if (!id) return;

    await dispatch(
      updateDeliveryAddressRequest({
        Id: id,
        IdCustomer: currentCustomer?.id,
        Favorite: true,
      })
    );
    await dispatch(getDeliveryAddressRequest());

    try {
      const parts = [];
      if (a?.address) parts.push(a.address);
      const cityPart = [a?.postalCode, a?.city].filter(Boolean).join(" ");
      if (cityPart) parts.push(cityPart);
      const country = a?.country || "FR";
      if (country) parts.push(country);
      const line = parts.join(", ");
      if (line) setRelayFullAddress(line);
    } catch {}
    setShowBook(false);
  };

  /* ------------------------ Edition & sauvegarde ------------------------ */
  const startEditShipping = (idx) => setEditShipIdx(idx);

  const deliveryEditInitial =
    editShipIdx !== null ? toForm(deliveryLst[editShipIdx], currentCustomer) : null;
  const billingEditInitial = toForm(billingAddress, currentCustomer);

  const save = async (form, meta) => {
    const { type, mode } = meta;
    const payload = toPayload(form, currentCustomer, type);

    if (type === "billing") {
      if (mode === "add") await dispatch(addBillingAddressRequest(payload));
      else await dispatch(updateBillingAddressRequest(payload));
      await dispatch(getBillingAddressRequest());
      setShowEditBilling(false);
    } else {
      if (mode === "add") await dispatch(addDeliveryAddressRequest(payload));
      else await dispatch(updateDeliveryAddressRequest(payload));
      await dispatch(getDeliveryAddressRequest());
      setEditShipIdx(null);
    }
  };

  const chosenRate =
  deliveryMode === "relay"
    ? selectedRelayRate || relayRates[0] || null
    : homeRates.find((r) => r.code === selectedRateCode) || homeRates[0] || null;


const operatorCode = carrierToOperator(chosenRate?.carrier, selectedRelay?.network);
const serviceCode = chosenRate?.code || "";
const shippingCodesMissing = !operatorCode || !serviceCode;

const today = new Date().toISOString().slice(0, 10);
const toIsRelay = deliveryMode === "relay";
const toAddressLine = deliveryFavoriteAddress?.address || "";
const toZip = String(deliveryFavoriteAddress?.postalCode || "");
const toCity = deliveryFavoriteAddress?.city || "";
const toCountry = "FR";

const pickupPointCode = toIsRelay ? String(selectedRelay?.id || "") : null;
const declaredValue = Number(baseTotal) || 0;


  /* --------------------------------- STRIPE -------------------------------- */

  const buildCheckoutPayload = () => {

  const currentCustomerId = currentCustomer?.id;
  if (!currentCustomerId) {
    alert("Veuillez vous connecter pour finaliser votre commande.");
    return null;
  }


    const chosenRate =
      deliveryMode === "relay"
        ? selectedRelayRate || relayRates[0] || null
        : homeRates.find((r) => r.code === selectedRateCode) || homeRates[0] || null;

    if (!chosenRate) {
      alert("Veuillez choisir un mode de livraison.");
      return null;
    }
    if (deliveryMode === "relay" && !selectedRelay) {
      alert("Choisissez un point relais.");
      return null;
    }

    return {

      //creation de la commande
      CustomerId: currentCustomerId,
      Amount: Number(grandTotal),
      DeliveryAmount: shippingPrice,
      PaymentMethod: "carte",
      DeliveryMode: deliveryMode,

      //creation de orderProduct
      OperatorCode: operatorCode,
      ServiceCode: serviceCode,
      IsRelay: toIsRelay,
      PickupPointCode: pickupPointCode,
      DropOffPointCode: chosenRate?.dropOffPointCodes?.[0] || null,
      ContentDescription: "Object high tech",
      DeclaredValue: declaredValue,
      Packages: packages,
      
      // Destinataire
      ToType: "particulier",
      ToCivility: currentCustomer?.civilite || null,
      ToLastName: currentCustomer?.lastName || "",
      ToFirstName: currentCustomer?.firstName || "",
      ToEmail: user?.email || null,
      ToPhone: currentCustomer?.phoneNumber || null,
      ToAddress: toAddressLine,
      ToZip: toZip,
      ToCity: toCity,
      ToCountry: toCountry,
      
      TakeOverDate: today,

      OrderCustomerProducts: readLsItems().map((it) => ({
        ProductId: getPid(it),
        CustomerId: Number(currentCustomerId),
        Quantity: getQty(it),
        ProductUnitPrice: getProductUnitPrice(it, productsFromStore),
      })),
    };
  };

  const handleStripePay = () => {
    if (shippingCodesMissing) {
      console.warn("V1: operator/service manquants", { operatorCode, serviceCode, chosenRate, selectedRelay });
      alert("Impossible de déterminer l’opérateur ou le service pour l’expédition.");
      return;
    }
    const payload = buildCheckoutPayload();
    if (!payload) return;
    dispatch(createCheckoutSessionRequest(payload));
  };

  // vider le panier côté front si payment.confirmed (webhook a déjà tout fait côté back)
  useEffect(() => {
    if (paymentConfirmed) {
      dispatch(saveCartRequest([]));
      localStorage.setItem("items", "[]");
    }
  }, [paymentConfirmed, dispatch]);

  /* ===== Hauteur étendue pour la liste de relais ===== */
  const RELAY_LIST_MIN_HEIGHT = 340;
  const RELAY_LIST_MAX_HEIGHT = 540;

  const uniqueHomeRates = useMemo(() => {
    const seen = new Set();
    return (homeRates || []).filter((r) => {
      const k = `${r.carrier}|${r.code}|${r.label}|${r.priceTtc}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [homeRates]);

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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 8,
            }}
          >
            <input
              type="radio"
              name="deliv"
              checked={deliveryMode === "home"}
              onChange={() => {
                setDeliveryMode("home");
                setSelectedRelay(null);
              }}
            />
            <h3 style={{ margin: 0 }}>À domicile</h3>
            <span style={chipMuted}>Tarifs en direct</span>
          </div>

          <div style={smallTitle}>Votre adresse de livraison préférée</div>
          <div style={addressWrap}>
            <div style={{ flex: 1 }}>
              {deliveryFavoriteAddress ? (
                <>
                  <div style={{ fontWeight: 800 }}>
                    {deliveryFavoriteAddress.firstName} {deliveryFavoriteAddress.lastName}
                  </div>
                  <div>{deliveryFavoriteAddress.address}</div>
                  {deliveryFavoriteAddress.complementaryAddress && (
                    <div>{deliveryFavoriteAddress.complementaryAddress}</div>
                  )}
                  <div>
                    {deliveryFavoriteAddress.postalCode} {deliveryFavoriteAddress.city}
                  </div>
                  <div>{deliveryFavoriteAddress.country}</div>
                  {deliveryFavoriteAddress.phone && (
                    <div style={{ color: "#6b7280" }}>
                      {deliveryFavoriteAddress.phone}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ color: "#6b7280" }}>
                  Aucune adresse de livraison préférée.
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button style={lightBtn} onClick={() => setShowBook(true)}>
                Changer
              </button>
              <button style={lightBtn} onClick={() => setEditShipIdx(0)} hidden />
            </div>
          </div>

          {/* Offres domicile */}
          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            {ratesLoading && (
              <div style={{ color: "#6b7280" }}>Chargement des offres…</div>
            )}
            {!ratesLoading && uniqueHomeRates.length === 0 && (
              <div style={{ color: "#6b7280" }}>
                Aucune offre disponible pour cette adresse.
              </div>
            )}
            {!ratesLoading &&
              uniqueHomeRates.map((o, i) => (
                <ShipOption
                  key={`${o.carrier || "carrier"}-${o.code}-${o.label || ""}-${o.priceTtc}-${i}`}
                  value={o.code}
                  price={fmt(o.priceTtc)}
                  label={`${o.carrier} — ${o.label}`}
                  checked={selectedRateCode === o.code && deliveryMode === "home"}
                  onChange={() => {
                    setSelectedRateCode(o.code);
                    setDeliveryMode("home");
                    setSelectedRelay(null);
                  }}
                />
              ))}
          </div>
        </section>

        {/* ----- En point relais ----- */}
        <section className="category-card" style={{ padding: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 8,
            }}
          >
            <input
              type="radio"
              name="deliv"
              checked={deliveryMode === "relay"}
              onChange={() => setDeliveryMode("relay")}
            />
            <h3 style={{ margin: 0 }}>En point relais</h3>
            <span style={chipMuted}>Adresse en une ligne</span>
          </div>

          <div
            style={{
              color: "#2563eb",
              fontWeight: 800,
              fontSize: 12,
              marginBottom: 6,
            }}
          >
            Recherche par adresse
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(350px, 1fr) 60px",
              gap: 12,
              alignItems: "end",
            }}
          >
            <Field label="Adresse complète">
              <AddressAutocomplete
                value={relayFullAddress}
                onChangeText={setRelayFullAddress}
                onSelect={(addr) => {
                  const line = [
                    makeStreetLine(addr),
                    [addr.postcode, addr.city].filter(Boolean).join(" "),
                  ]
                    .filter(Boolean)
                    .join(", ");
                  setRelayFullAddress(line);
                  const parsed = parseRelayAddress(line, { countryIso: "FR" });
                  setDeliveryMode("relay");
                  dispatch(
                    getRelaysByAddressRequest({
                      number: parsed.number || undefined,
                      street: parsed.street || undefined,
                      city: parsed.city || undefined,
                      postalCode: parsed.postalCode || undefined,
                      state: parsed.state || undefined,
                      countryIsoCode: parsed.countryIsoCode || "FR",
                      limit: 30,
                    })
                  );
                }}
                placeholder="ex: 4 bd des Capucines, 75009 Paris"
              />
            </Field>
            <div>
              <button style={lightBtn} onClick={fetchRelaysByAddress}>
                OK
              </button>
            </div>
          </div>

          {displayedRelaysLoading && (
            <div style={{ color: "#6b7280", marginTop: 10 }}>
              Recherche des relais…
            </div>
          )}

          {!displayedRelaysLoading && displayedRelays.length > 0 && (
            <div
              style={{
                marginTop: 12,
                display: "grid",
                gap: 12,
                minHeight: RELAY_LIST_MIN_HEIGHT,
                maxHeight: RELAY_LIST_MAX_HEIGHT,
                overflow: "auto",
                paddingRight: 4,
              }}
            >
              {displayedRelays.map((r) => (
                <label
                  key={r.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: 12,
                    display: "grid",
                    gap: 6,
                    background: "#fff",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setSelectedRelay(r);
                    setDeliveryMode("relay");
                  }}
                >
                  <input
                    type="radio"
                    name="relay"
                    value={r.id}
                    checked={String(selectedRelay?.id || "") === r.id}
                    onChange={() => {
                      setSelectedRelay(r);
                      setDeliveryMode("relay");
                    }}
                  />
                  <span>
                    <img
                      src={getRelayLogo(r)}
                      style={{ width: 45 }}
                      alt={r.carrier || r.network || "relay"}
                    />
                  </span>
                  <strong>
                    {r.name} <span style={{ color: "#6b7280" }}>({r.distance})</span>
                  </strong>
                  <span>{r.address}</span>
                  <span>
                    {r.zip} {r.city}
                  </span>
                  {r.schedules && (
                    <span>
                      <strong>{r.schedules}</strong>
                    </span>
                  )}
                </label>
              ))}
            </div>
          )}

          {selectedRelay && deliveryMode === "relay" && (
            <div style={{ marginTop: 8, fontSize: 12, color: "#2563eb" }}>
              Point relais sélectionné : <b>{selectedRelay.name}</b>
              {selectedRelayRate && (
                <>
                  {" "}
                  — tarif <b>{fmt(selectedRelayRate.priceTtc)}</b>
                </>
              )}
            </div>
          )}
        </section>
      </div>

      {/* ==================== ADRESSE DE FACTURATION ==================== */}
      <div
        className="category-card"
        style={{ padding: 16, marginBottom: 18, display: "grid", gap: 8 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <i className="bi bi-file-earmark-text" aria-hidden="true" />
          <div style={{ fontWeight: 800 }}>Votre adresse de facturation</div>
        </div>

        <div style={addressWrap}>
          <div style={{ flex: 1 }}>
            {billingAddress ? (
              <>
                <div style={{ fontWeight: 800 }}>
                  {currentCustomer.firstName} {currentCustomer.lastName} —{" "}
                  {billingAddress.address}
                  {billingAddress.complementaryAddress
                    ? `, ${billingAddress.complementaryAddress}`
                    : ""}
                </div>
                <div>
                  {billingAddress.postalCode} {billingAddress.city} —{" "}
                  {billingAddress.country}
                </div>
                <div>{currentCustomer.phoneNumber}</div>
              </>
            ) : (
              <div style={{ color: "#6b7280" }}>
                Aucune adresse de facturation.
              </div>
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

      <div
        className="pay-grid"
        style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 18 }}
      >
        {/* Carte bancaire */}
        <section className="category-card" style={{ padding: 16 }}>
          <label className="pay-method" style={payMethodRow}>
            <input type="radio" name="pay" checked readOnly />
            <span style={{ fontWeight: 800 }}>Carte bancaire</span>
            <span aria-hidden="true">💳</span>
          </label>

          <>
            <div style={stripeInfo}>
              Paiement sécurisé via Stripe. Vous serez redirigé pour renseigner
              votre carte.
            </div>
            <button className="dp-pay-btn" onClick={handleStripePay}>
              Payer ma commande
            </button>
          </>

          {paymentConfirmed && (
            <div style={{ marginTop: 10, color: "#16a34a", fontWeight: 700 }}>
              ✅ Paiement confirmé. Votre commande est en cours de préparation !
            </div>
          )}
        </section>

        {/* Récapitulatif */}
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
        addresses={deliveryLst}
        onChoose={chooseFromBook}
        onEdit={startEditShipping}
        onClose={() => setShowBook(false)}
      />

      {/* Édition Livraison */}
      <AddressFormModal
        open={editShipIdx !== null}
        initial={deliveryEditInitial || toForm(null, currentCustomer)}
        title="Modifier l’adresse de livraison"
        type="delivery"
        onSave={(f) => save(f, { type: "delivery", mode: "edit" })}
        onCancel={() => setEditShipIdx(null)}
      />

      {/* Édition Facturation */}
      <AddressFormModal
        open={showEditBilling}
        initial={billingEditInitial}
        title="Modifier l’adresse de facturation"
        type="billing"
        onSave={(f) => save(f, { type: "billing", mode: "edit" })}
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
        background: "#fff",
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
const payMethodRow = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 8,
};
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
