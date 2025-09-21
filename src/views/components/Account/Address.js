// src/pages/account/Address.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../../../App.css";
import { useDispatch, useSelector } from "react-redux";

import {
  getBillingAddressRequest,
  addBillingAddressRequest,
  updateBillingAddressRequest,
} from "../../../lib/actions/BillingAddressActions";
import {
  getDeliveryAddressRequest,
  addDeliveryAddressRequest,
  updateDeliveryAddressRequest,
  deleteDeliveryAddressRequest,
} from "../../../lib/actions/DeliveryAddressActions";

/* =================== Phone helpers =================== */
const PHONE_COUNTRIES = [
  { iso: "FR", label: "France",        dial: "+33",  trunk: "0" },
  { iso: "BE", label: "Belgique",      dial: "+32",  trunk: "0" },
  { iso: "ES", label: "Espagne",       dial: "+34",  trunk: "0" },
  { iso: "IT", label: "Italie",        dial: "+39",  trunk: "0" },
  { iso: "DE", label: "Allemagne",     dial: "+49",  trunk: "0" },
  { iso: "IE", label: "Irlande",       dial: "+353", trunk: "0" },
  { iso: "US", label: "États-Unis",    dial: "+1",   trunk: ""  },
  { iso: "ML", label: "Mali",          dial: "+223", trunk: ""  },
  { iso: "SN", label: "Sénégal",       dial: "+221", trunk: ""  },
  { iso: "MA", label: "Maroc",         dial: "+212", trunk: "0" },
  { iso: "DZ", label: "Algérie",       dial: "+213", trunk: "0" },
  { iso: "AE", label: "Dubaï (EAU)",   dial: "+971", trunk: "0" },
];
const DEFAULT_DIAL = PHONE_COUNTRIES[0].dial;
const byDial = Object.fromEntries(PHONE_COUNTRIES.map((c) => [c.dial, c]));
const cleanDigits = (s) => String(s || "").replace(/[^\d]/g, "");

function composeE164(dial, local) {
  const meta = byDial[dial] || { trunk: "" };
  let loc = cleanDigits(local);
  if (meta.trunk && loc.startsWith(meta.trunk)) loc = loc.slice(meta.trunk.length);
  return `${dial}${loc}`;
}
function splitPhoneSmart(phone, fallbackDial = DEFAULT_DIAL) {
  let raw = String(phone || "").trim();
  if (!raw) return { dial: fallbackDial, local: "" };
  if (raw.startsWith("00")) raw = `+${raw.slice(2)}`;
  if (raw.startsWith("+")) {
    const match = PHONE_COUNTRIES
      .sort((a, b) => b.dial.length - a.dial.length)
      .find((c) => raw.startsWith(c.dial));
    if (match) {
      let rest = cleanDigits(raw.slice(match.dial.length));
      if (match.trunk && rest && !rest.startsWith(match.trunk)) rest = `${match.trunk}${rest}`;
      return { dial: match.dial, local: rest };
    }
    return { dial: fallbackDial, local: cleanDigits(raw.replace(/^\+/, "")) };
  }
  return { dial: fallbackDial, local: cleanDigits(raw) };
}

/* Petite aide pour déduire un dial selon le pays affiché */
function dialFromCountry(countryName) {
  const s = String(countryName || "").toLowerCase();
  if (s.includes("fr")) return "+33";
  if (s.includes("belg")) return "+32";
  if (s.includes("lux")) return "+352";
  if (s.includes("suisse") || s.includes("swiss") || s.includes(" ch")) return "+41";
  if (s.includes("espagne") || s.includes("spain") || s.includes(" es")) return "+34";
  if (s.includes("allemagne") || s.includes("germany") || s.includes(" de")) return "+49";
  return DEFAULT_DIAL;
}

/* =================== Styles (inline) =================== */
const S = {
  formVertical: { display: "flex", flexDirection: "column", gap: 12 },
  formRow: { display: "flex", flexDirection: "column", gap: 6 },
  radioRow: { display: "flex", alignItems: "center", gap: 16 },
  checkboxInline: { display: "inline-flex", alignItems: "center", gap: 8 },
  actions: { display: "flex", justifyContent: "center", marginTop: 8 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 },
  miniCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 10 },
  miniHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  miniActions: { display: "flex", gap: 10 },
  lightBtn: { border: "1px solid rgb(43, 113, 218)", background: "transparent", borderRadius: 999, padding: "8px 14px", color: "rgb(252, 253, 253)", backgroundColor: "rgb(57, 133, 247)" },
};

/* =================== Address Autocomplete (BAN) =================== */
function AddressAutocomplete({ value, onChangeText, onSelect, placeholder = "N° et rue" }) {
  const [q, setQ] = useState(value || "");
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(-1);
  const [focused, setFocused] = useState(false);
  const timerRef = useRef(null);
  const abortRef = useRef(null);
  const inputRef = useRef(null);

  // sync externe
  useEffect(() => {
    setQ(value || "");
  }, [value]);

  // fetch BAN quand focus + q >= 2
  useEffect(() => {
    if (!focused || !q || q.trim().length < 2) {
      setItems([]);
      setOpen(false);
      return;
    }

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        if (abortRef.current) abortRef.current.abort();
        const ctrl = new AbortController();
        abortRef.current = ctrl;

        const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=8&autocomplete=1&type=housenumber`;
        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        const list = (json?.features || []).map((f) => {
          const p = f.properties || {};
          return {
            id: f.id || `${p.id}-${p.citycode}-${p.postcode}-${p.name}`,
            label: p.label,
            housenumber: p.housenumber,
            street: p.street || p.name || "",
            postcode: p.postcode,
            city: p.city,
            country: "France",
          };
        });

        setItems(list);
        setOpen(focused && list.length > 0);
        setHi(-1);
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error("[BAN] autocomplete error:", e);
          setItems([]);
          setOpen(false);
        }
      }
    }, 250);

    return () => clearTimeout(timerRef.current);
  }, [q, focused]);

  const choose = (it) => {
    const streetLine = [it.housenumber, it.street].filter(Boolean).join(" ").trim();
    setQ(streetLine);
    onChangeText?.(streetLine);
    onSelect?.(it); // le parent mettra zip/city/country
    setOpen(false);
    setItems([]);
    setHi(-1);
    if (inputRef.current) inputRef.current.blur(); // ferme sur mobile
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
          onChangeText?.(e.target.value);
        }}
        onFocus={() => {
          setFocused(true);
          if (items.length > 0) setOpen(true);
        }}
        onBlur={() => {
          setTimeout(() => {
            setFocused(false);
            setOpen(false);
          }, 120);
        }}
        onKeyDown={onKeyDown}
        autoComplete="off"
      />
      {open && items.length > 0 && (
        <div
          style={{
            position: "absolute",
            zIndex: 9999,
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
              onMouseDown={(e) => e.preventDefault()} // évite blur avant click
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

/* =================== Phone input =================== */
function PhoneInput({ dial, local, onChange, disabled = false }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 8 }}>
      <select
        className="form-control"
        value={dial || DEFAULT_DIAL}
        onChange={(e) => onChange({ dial: e.target.value, local })}
        disabled={disabled}
      >
        {PHONE_COUNTRIES.map((c) => (
          <option key={c.iso} value={c.dial}>
            {c.label} ({c.dial})
          </option>
        ))}
      </select>
      <input
        className="form-control"
        placeholder="n° national (ex: 06 24 95 75 58)"
        value={local || ""}
        onChange={(e) => onChange({ dial, local: cleanDigits(e.target.value) })}
        inputMode="tel"
        autoComplete="tel-national"
        disabled={disabled}
      />
    </div>
  );
}

/* =================== Modal d’adresse =================== */
function AddressModal({
  open,
  type = "shipping",
  mode = "add",
  currentCustomer,
  initial,
  onClose,
  onSave,
}) {
  const defaults = useMemo(() => {
    // source phone : pour billing, on priorise customer si l’adresse ne l’a pas
    const countryForDial =
      initial?.country ||
      (type === "billing" ? currentCustomer?.country : null) ||
      "France";
    const fallbackDial = dialFromCountry(countryForDial);

    const srcFromInitial = (initial && (initial.phoneNumber || initial.phone)) || "";
    const sourcePhone =
      type === "billing"
        ? (srcFromInitial || currentCustomer?.phoneNumber || "")
        : srcFromInitial;

    const { dial, local } = splitPhoneSmart(sourcePhone, fallbackDial);

    return {
      id: initial?.id ?? null,
      civilite: type === "billing" ? (currentCustomer?.civilite || "M") : (initial?.civilite || "M"),
      firstName: type === "billing" ? (currentCustomer?.firstName || "") : (initial?.firstName || ""),
      lastName:  type === "billing" ? (currentCustomer?.lastName  || "") : (initial?.lastName  || ""),
      address1: initial?.address1 || initial?.address || "",
      address2: initial?.address2 || initial?.complementaryAddress || "",
      zip:      initial?.zip || initial?.postalCode || "",
      city:     initial?.city || "",
      country:  initial?.country || "France",
      phoneDial: dial,
      phoneLocal: local,
      preferred: Boolean(initial?.preferred ?? initial?.favorite ?? initial?.isPreferred ?? initial?.Preferred ?? initial?.Favorite),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial, currentCustomer, type]);

  const [form, setForm] = useState(defaults);
  useEffect(() => { if (open) setForm(defaults); }, [open, defaults]);

  if (!open) return null;

  const title =
    mode === "add"
      ? type === "billing" ? "Ajouter une adresse de facturation" : "Ajouter une adresse de livraison"
      : type === "billing" ? "Adresse de facturation" : "Adresse de livraison";

  const handle = (e) => {
    const { name, value, type: t, checked } = e.target;
    setForm((p) => ({ ...p, [name]: t === "checkbox" ? checked : value }));
  };

  const submit = (e) => {
    e.preventDefault();
    onSave?.(form, { type, mode });
  };

  const phoneReadonly = type === "billing";

  return (
    <div className="admin-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="admin-modal-panel"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 680 }}
      >
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button aria-label="Fermer" className="btn btn-light" onClick={onClose}>
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <form onSubmit={submit} style={S.formVertical}>
          {/* civiliteilité */}
          <div style={S.formRow}>
            <label className="form-label">Civilité <b>*</b></label>
            {type === "billing" ? (
              <input className="form-control" value={form.civilite === "Mme" ? "Madame" : "Monsieur"} disabled />
            ) : (
              <div style={S.radioRow}>
                <label><input type="radio" name="civilite" value="M"  checked={form.civilite === "M"}  onChange={handle} /> M.</label>
                <label><input type="radio" name="civilite" value="Mme" checked={form.civilite === "Mme"} onChange={handle} /> Mme</label>
              </div>
            )}
          </div>

          {/* Prénom / Nom */}
          <div style={S.formRow}>
            <label className="form-label">Prénom <b>*</b></label>
            <input className="form-control" name="firstName" value={form.firstName} onChange={type === "shipping" ? handle : undefined} disabled={type === "billing"} required />
          </div>
          <div style={S.formRow}>
            <label className="form-label">Nom <b>*</b></label>
            <input className="form-control" name="lastName" value={form.lastName} onChange={type === "shipping" ? handle : undefined} disabled={type === "billing"} required />
          </div>

          {/* Adresse (avec autocomplétion) */}
          <div style={S.formRow}>
            <label className="form-label">Adresse <b>*</b></label>
            <AddressAutocomplete
              value={form.address1}
              onChangeText={(txt) => setForm((p) => ({ ...p, address1: txt }))}
              onSelect={(addr) => {
                // n'afficher que n° + rue dans le champ
                const streetLine = [addr.housenumber, addr.street].filter(Boolean).join(" ").trim();
                setForm((p) => ({
                  ...p,
                  address1: streetLine,
                  // remplir automatiquement CP / ville / pays
                  zip: addr.postcode || p.zip,
                  city: addr.city || p.city,
                  country: addr.country || p.country,
                }));
              }}
              placeholder="N° et libellé de rue"
            />
          </div>

          <div style={S.formRow}>
            <label className="form-label">Complément d’adresse</label>
            <input className="form-control" name="address2" value={form.address2} onChange={handle} placeholder="N° bât, étage, appt, digicode…" autoComplete="address-line2" />
          </div>
          <div style={S.formRow}>
            <label className="form-label">Code postal <b>*</b></label>
            <input className="form-control" name="zip" value={form.zip} onChange={handle} required inputMode="numeric" autoComplete="postal-code" />
          </div>
          <div style={S.formRow}>
            <label className="form-label">Ville <b>*</b></label>
            <input className="form-control" name="city" value={form.city} onChange={handle} required autoComplete="address-level2" />
          </div>
          <div style={S.formRow}>
            <label className="form-label">Pays <b>*</b></label>
            <select className="form-control" name="country" value={form.country} onChange={(e) => {
              const country = e.target.value;
              const newDial = dialFromCountry(country);
              setForm((p) => ({
                ...p,
                country,
                // si billing (readonly phone), on ne change rien,
                // sinon on aligne l'indicatif avec le pays
                phoneDial: phoneReadonly ? p.phoneDial : newDial
              }));
            }} required autoComplete="country-name">
              <option>France</option>
              <option>Belgique</option>
              <option>Luxembourg</option>
              <option>Suisse</option>
            </select>
          </div>

          {/* Téléphone (pré-rempli ; non modifiable en facturation) */}
          <div style={S.formRow}>
            <label className="form-label">Téléphone portable</label>
            <PhoneInput
              dial={form.phoneDial}
              local={form.phoneLocal}
              onChange={({ dial, local }) => setForm((p) => ({ ...p, phoneDial: dial, phoneLocal: local }))}
              disabled={phoneReadonly}
            />
            {phoneReadonly ? (
              <small style={{ color: "#6b7280" }}>Le téléphone de facturation est renseigné et non modifiable ici.</small>
            ) : (
              <small style={{ color: "#6b7280" }}>Exemple FR : tapez <b>06…</b> — sera enregistré <b>+336…</b></small>
            )}
          </div>

          {/* Checkbox préférée (shipping uniquement) */}
          {type !== "billing" && (
            <div style={S.formRow}>
              <label style={S.checkboxInline}>
                <input type="checkbox" name="preferred" checked={form.preferred} onChange={handle} /> Enregistrer comme adresse préférée
              </label>
            </div>
          )}

          <div style={S.actions}>
            <button type="submit" className="btn btn-primary" style={{ width: 160 }}>Valider</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =================== Carte d’adresse =================== */
function AddressCard({ tone = "neutral", title, icon, children, onEdit, onDelete, favorite }) {
  const bg = tone === "neutral" ? "#f7f7f8" : tone === "soft" ? "#eef8fb" : "#fff";
  return (
    <div className="addr-item" style={{ background: bg, border: "none" }}>
      <div className="d-flex align-items-start justify-content-between">
        <div style={{ display: "flex", gap: 14 }}>
          <div className="addr-ico" style={{ width: 42, height: 42, borderRadius: 10, display: "grid", placeItems: "center", background: "#111", color: "#fff" }}>
            <i className={`bi ${icon}`} />
          </div>
          <div>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>{title}</div>
            {favorite && <span className="addr-badge">Adresse préférée</span>}
            {children}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {onEdit && (<button className="btn btn-light" onClick={onEdit} title="Modifier"><i className="bi bi-pencil" /></button>)}
          {onDelete && (<button className="btn btn-light" onClick={onDelete} title="Supprimer"><i className="bi bi-trash" /></button>)}
        </div>
      </div>
    </div>
  );
}

/* =================== Page Mes adresses =================== */
export const Address = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.account);
  const customers = useSelector((s) => s?.customers?.customers) || [];
  const uid = user?.id || null;
  const currentCustomer = customers.find((c) => c.idAspNetUser === uid);

  const billingAddresses = useSelector((s) => s?.billingAddresses?.billingAddresses || []);
  const deliveryAddresses = useSelector((s) => s?.deliveryAddresses?.deliveryAddresses || []);

  const billingLst = billingAddresses.filter((a) => a?.idCustomer === currentCustomer?.id);
  const deliveryLst = deliveryAddresses.filter((a) => a?.idCustomer === currentCustomer?.id);

  const billingList = useMemo(() => {
    if (Array.isArray(billingLst)) return billingLst;
    if (Array.isArray(billingLst?.billingAddresses)) return billingLst.billingAddresses;
    return [];
  }, [billingLst]);

  const deliveryList = useMemo(() => {
    if (Array.isArray(deliveryLst)) return deliveryLst;
    if (Array.isArray(deliveryLst?.deliveryAddresses)) return deliveryLst.deliveryAddresses;
    return [];
  }, [deliveryLst]);

  useEffect(() => {
    dispatch(getBillingAddressRequest());
    dispatch(getDeliveryAddressRequest());
  }, [dispatch]);

  const pickFavorite = (arr) => arr.find((a) => a?.favorite || a?.preferred || a?.Preferred || a?.Favorite) || arr[0] || null;

  const toView = (a) => {
    if (!a) return null;
    return {
      id: a?.id ?? a?.billingAddressId ?? a?.deliveryAddressId ?? a?.Id ?? null,
      civilite: a?.civilite ?? a?.civilite ?? "M",
      firstName: a?.firstName ?? a?.FirstName ?? "",
      lastName: a?.lastName ?? a?.LastName ?? "",
      address1: a?.address ?? a?.Address ?? a?.addressLine ?? a?.line1 ?? "",
      address2: a?.complementaryAddress ?? a?.ComplementaryAddress ?? a?.line2 ?? "",
      zip: a?.postalCode ?? a?.PostalCode ?? a?.zip ?? a?.zipCode ?? "",
      city: a?.city ?? a?.City ?? "",
      country: a?.country ?? a?.Country ?? "France",
      phone: a?.phone ?? a?.Phone ?? "",
      favorite: Boolean(a?.favorite ?? a?.preferred ?? a?.isFavorite ?? a?.isPreferred ?? a?.Favorite ?? a?.Preferred),
    };
  };

  const billingView   = toView(pickFavorite(billingList));
  const deliveryViews = (deliveryList || []).map(toView).filter(Boolean);
  const shippingView  = deliveryViews.find((v) => v.favorite) || deliveryViews[0] || null;
  const shippingOthers = deliveryViews.filter((v) => v.id !== shippingView?.id);

  const [modal, setModal] = useState({ open: false, type: "shipping", mode: "add", initial: null });
  const openAdd = () => setModal({ open: true, type: "shipping", mode: "add", initial: null });
  const openAddBilling = () => setModal({ open: true, type: "billing", mode: "add", initial: null });
  const editBilling = () => setModal({ open: true, type: "billing", mode: "edit", initial: billingView });
  const editShipping = (addrView = shippingView) => setModal({ open: true, type: "shipping", mode: "edit", initial: addrView });
  const close = () => setModal((m) => ({ ...m, open: false }));

  // Payload helpers
  const toPayload = (form, currentCustomer, type) => {
    const phoneE164 = composeE164(form.phoneDial || DEFAULT_DIAL, form.phoneLocal || "");
    const base = {
      Id: form.id ?? undefined,
      IdCustomer: currentCustomer?.id,
      Civilite: form.civilite,
      FirstName: type === "billing" ? currentCustomer?.firstName : form.firstName,
      LastName:  type === "billing" ? currentCustomer?.lastName  : form.lastName,
      Address: form.address1,
      ComplementaryAddress: form.address2,
      PostalCode: form.zip,
      City: form.city,
      Country: form.country,
      Phone: phoneE164,
    };
    return type === "billing" ? base : { ...base, Favorite: !!form.favorite || !!form.preferred };
  };

  const save = async (form, meta) => {
    const { type, mode } = meta;
    const payload = toPayload(form, currentCustomer, type);
    if (type === "billing") {
      if (mode === "add") await dispatch(addBillingAddressRequest(payload));
      else await dispatch(updateBillingAddressRequest(payload));
      await dispatch(getBillingAddressRequest());
    } else {
      if (mode === "add") await dispatch(addDeliveryAddressRequest(payload));
      else await dispatch(updateDeliveryAddressRequest(payload));
      await dispatch(getDeliveryAddressRequest());
    }
    close();
  };

  const displayName = (addr) => {
    if (!addr) return "";
    const fn = addr.firstName || currentCustomer?.firstName || "";
    const ln = addr.lastName || currentCustomer?.lastName || "";
    return `${fn} ${ln}`.trim();
  };

  // ✅ Correctif : ne plus écraser l’adresse (et le phone) quand on définit la préférée.
  // On n’envoie que l’id + Favorite: true, le backend garde le reste identique.
  const chooseAsFavorite = async (addrView) => {
    if (!addrView?.id) return;
    await dispatch(updateDeliveryAddressRequest({ Id: addrView.id, IdCustomer: currentCustomer?.id, Favorite: true }));
    if (shippingView && shippingView.id !== addrView.id) {
      await dispatch(updateDeliveryAddressRequest({ Id: shippingView.id, IdCustomer: currentCustomer?.id, Favorite: false }));
    }
    await dispatch(getDeliveryAddressRequest());
  };

  const deleteShipping = async (addrView) => {
    if (!addrView?.id) return;
    const ok = window.confirm("Supprimer cette adresse de livraison ?");
    if (!ok) return;
    await dispatch(deleteDeliveryAddressRequest(addrView.id));
    await dispatch(getDeliveryAddressRequest());
  };

  return (
    <div>
      <h2 className="orders-title" style={{ marginBottom: 8 }}>Carnet d’adresses</h2>
      <p style={{ marginTop: 0, color: "#555" }}>
        Retrouvez ici les adresses enregistrées lors de vos précédents achats sur notre site.
        <br />
        <b>Vous pouvez sélectionner votre adresse préférée</b> pour gagner du temps lors de vos prochaines commandes.
      </p>

      {/* Cartes principales */}
      <div className="d-flex" style={{ flexDirection: "column", gap: 12 }}>
        {/* Facturation */}
        <AddressCard tone="neutral" title="Adresse de facturation" icon="bi-file-earmark-text" favorite={!!billingView?.favorite} onEdit={billingView ? editBilling : undefined}>
          {billingView ? (
            <p className="addr-block" style={{ margin: 0 }}>
              {displayName(billingView)}<br />
              {billingView.address1}<br />
              {billingView.address2 && (<>{billingView.address2}<br/></>)}
              {billingView.zip} {billingView.city}<br />
              {billingView.country}<br />
              {billingView.phone || currentCustomer?.phoneNumber}
            </p>
          ) : (
            <p className="addr-block" style={{ margin: 0, color: "#6b7280" }}>
              Aucune adresse de facturation enregistrée.
            </p>
          )}
        </AddressCard>

        {!billingView && (
          <div>
            <button className="btn btn-primary" style={{ width: 320 }} onClick={openAddBilling}>
              Ajouter une adresse de facturation
            </button>
          </div>
        )}

        {/* Livraison */}
        <AddressCard
          tone="soft"
          title="Adresse de livraison"
          icon="bi-truck"
          favorite={!!shippingView?.favorite}
          onEdit={shippingView ? () => editShipping(shippingView) : undefined}
          onDelete={shippingView ? () => deleteShipping(shippingView) : undefined}
        >
          {shippingView ? (
            <p className="addr-block" style={{ margin: 0 }}>
              {displayName(shippingView)}<br />
              {shippingView.address1}<br />
              {shippingView.address2 && (<>{shippingView.address2}<br/></>)}
              {shippingView.zip} {shippingView.city}<br />
              {shippingView.country}<br />
              {shippingView.phone}
            </p>
          ) : (
            <p className="addr-block" style={{ margin: 0, color: "#6b7280" }}>
              Aucune adresse de livraison enregistrée.
            </p>
          )}
        </AddressCard>
      </div>

      <div className="mt-3">
        <button className="btn btn-primary" style={{ width: 320 }} onClick={openAdd}>
          Ajouter une adresse de livraison
        </button>
      </div>

      {/* Autres adresses de livraison */}
      {shippingOthers.length > 0 && (
        <>
          <h3 style={{ marginTop: 20, marginBottom: 8 }}>Choisissez une autre adresse de livraison</h3>
          <div style={S.grid}>
            {shippingOthers.map((addr) => (
              <div key={addr.id} style={S.miniCard}>
                <div style={S.miniHeader}>
                  <div style={{ fontWeight: 600 }}>
                    {addr.civilite === "Mme" ? "Mme" : "M."} {addr.firstName} {addr.lastName}
                  </div>
                  <div style={S.miniActions}>
                    <button className="btn btn-light" title="Modifier" onClick={() => editShipping(addr)}><i className="bi bi-pencil" /></button>
                    <button className="btn btn-light" title="Supprimer" onClick={() => deleteShipping(addr)}><i className="bi bi-trash" /></button>
                  </div>
                </div>

                <div style={{ color: "#374151", lineHeight: 1.4 }}>
                  {addr.address1}<br />
                  {addr.address2 && (<>{addr.address2}<br /></>)}
                  {addr.zip} {addr.city}<br />
                  {addr.country}
                </div>

                {addr.phone && <div style={{ color: "#6b7280" }}>{addr.phone}</div>}

                <div>
                  <button className="btn btn-primary" style={S.lightBtn} onClick={() => chooseAsFavorite(addr)}>
                    Choisir cette adresse
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <AddressModal
        open={modal.open}
        type={modal.type}
        mode={modal.mode}
        currentCustomer={currentCustomer}
        initial={modal.initial}
        onClose={close}
        onSave={save}
      />
    </div>
  );
};
