// src/pages/account/Address.jsx
import React, { useMemo, useState, useEffect } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../../../App.css";
import { useDispatch, useSelector } from "react-redux";

// 👉 adapte les imports si besoin
import {
  getBillingAddressRequest,
  addBillingAddressRequest,
  updateBillingAddressRequest,
} from "../../../lib/actions/BillingAddressActions";
import {
  getDeliveryAddressRequest,
  addDeliveryAddressRequest,
  updateDeliveryAddressRequest,
  deleteDeliveryAddressRequest, // <-- suppression adresse livraison
} from "../../../lib/actions/DeliveryAddressActions";

/* ========= Styles (inline) ========= */
const S = {
  formVertical: { display: "flex", flexDirection: "column", gap: 12 },
  formRow: { display: "flex", flexDirection: "column", gap: 6 },
  radioRow: { display: "flex", alignItems: "center", gap: 16 },
  checkboxInline: { display: "inline-flex", alignItems: "center", gap: 8 },
  actions: { display: "flex", justifyContent: "center", marginTop: 8 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 16,
  },
  miniCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  miniHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  miniActions: { display: "flex", gap: 10 },
  lightBtn: {
    border: "1px solid #d1d5db",
    background: "transparent",
    borderRadius: 999,
    padding: "8px 14px",
  },
};

/* ========= Modal générique d’adresse ========= */
function AddressModal({
  open,
  type = "shipping",        // "shipping" | "billing"
  mode = "add",             // "add" | "edit"
  currentCustomer,          // pour billing (civilité, nom, prénom)
  initial,                  // valeurs existantes en mode edit
  onClose,
  onSave,
}) {
  const defaults = useMemo(() => {
    return {
      id: null,
      civ: currentCustomer?.civ || "M",
      firstName: type === "billing" ? (currentCustomer?.firstName || "") : "",
      lastName:  type === "billing" ? (currentCustomer?.lastName  || "") : "",
      address1: "",
      address2: "",
      zip: "",
      city: "",
      country: "France",
      phone: type === "billing" ? (currentCustomer?.phoneNumber || "") : "",
      preferred: false, // alias "favorite"
    };
  }, [currentCustomer, type]);

  const [form, setForm] = useState(defaults);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initial) {
      setForm({
        id: initial.id ?? null,
        civ: type === "billing"
          ? (currentCustomer?.civ || "M")
          : (initial.civ ?? currentCustomer?.civ ?? "M"),
        firstName: type === "billing"
          ? (currentCustomer?.firstName ?? "")
          : (initial.firstName ?? ""),
        lastName: type === "billing"
          ? (currentCustomer?.lastName ?? "")
          : (initial.lastName ?? ""),
        address1: initial.address1 ?? "",
        address2: initial.address2 ?? "",
        zip: initial.zip ?? "",
        city: initial.city ?? "",
        country: initial.country ?? "France",
        // 🔧 phone : on normalise toutes les variantes possibles
        phone:
          (initial.phoneNumber ?? initial.phone ?? currentCustomer?.phoneNumber ?? ""),
        preferred: Boolean(
          initial.preferred ??
          initial.favorite ??
          initial.isPreferred ??
          initial.Preferred ??
          initial.Favorite
        ),
      });
    } else {
      setForm(defaults);
    }
  }, [open, mode, initial, defaults, currentCustomer, type]);

  if (!open) return null;

  const title =
    mode === "add"
      ? type === "billing"
        ? "Ajouter une adresse de facturation"
        : "Ajouter une adresse de livraison"
      : type === "billing"
      ? "Adresse de facturation"
      : "Adresse de livraison";

  const handle = (e) => {
    const { name, value, type: t, checked } = e.target;
    setForm((p) => ({ ...p, [name]: t === "checkbox" ? checked : value }));
  };

  const submit = (e) => {
    e.preventDefault();
    onSave?.(form, { type, mode });
  };

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
          {/* Civilité */}
          <div style={S.formRow}>
            <label className="form-label">Civilité <b>*</b></label>
            {type === "billing" ? (
              <input className="form-control" value={form.civ === "Mme" ? "Madame" : "Monsieur"} disabled />
            ) : (
              <div style={S.radioRow}>
                <label>
                  <input type="radio" name="civ" value="M" checked={form.civ === "M"} onChange={handle} /> M.
                </label>
                <label>
                  <input type="radio" name="civ" value="Mme" checked={form.civ === "Mme"} onChange={handle} /> Mme
                </label>
              </div>
            )}
          </div>

          {/* Prénom / Nom */}
          <div style={S.formRow}>
            <label className="form-label">Prénom <b>*</b></label>
            <input
              className="form-control"
              name="firstName"
              value={form.firstName}
              onChange={type === "shipping" ? handle : undefined}
              disabled={type === "billing"}
              placeholder={type === "shipping" && mode === "add" ? "Votre prénom" : undefined}
            />
          </div>

          <div style={S.formRow}>
            <label className="form-label">Nom <b>*</b></label>
            <input
              className="form-control"
              name="lastName"
              value={form.lastName}
              onChange={type === "shipping" ? handle : undefined}
              disabled={type === "billing"}
              placeholder={type === "shipping" && mode === "add" ? "Votre nom" : undefined}
            />
          </div>

          {/* Adresse */}
          <div style={S.formRow}>
            <label className="form-label">Adresse <b>*</b></label>
            <input className="form-control" name="address1" value={form.address1} onChange={handle} required placeholder="N° et libellé de rue" />
          </div>

          <div style={S.formRow}>
            <label className="form-label">Complément d’adresse</label>
            <input className="form-control" name="address2" value={form.address2} onChange={handle} placeholder="N°bât, étage, appt, digicode…" />
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
            <select className="form-control" name="country" value={form.country} onChange={handle} required autoComplete="country-name">
              <option>France</option>
              <option>Belgique</option>
              <option>Luxembourg</option>
              <option>Suisse</option>
            </select>
          </div>

          {/* 🔒 Téléphone (disabled uniquement pour EDIT billing) */}
          <div style={S.formRow}>
            <label className="form-label">Téléphone portable</label>
            <input
              className="form-control"
              name="phone"
              value={form.phone}
              onChange={handle}
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="06 12 34 56 78"
              disabled={type === "billing" && mode === "edit"}
            />
          </div>

          {/* Checkbox préférée (shipping uniquement) */}
          {type !== "billing" && (
            <div style={S.formRow}>
              <label style={S.checkboxInline}>
                <input type="checkbox" name="preferred" checked={form.preferred} onChange={handle} />{" "}
                Enregistrez comme adresse préférée
              </label>
            </div>
          )}

          <div style={S.actions}>
            <button type="submit" className="btn btn-primary" style={{ width: 160 }}>
              Valider
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ========= Carte d’adresse (grandes cartes du haut) ========= */
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
          {onEdit && (
            <button className="btn btn-light" onClick={onEdit} title="Modifier">
              <i className="bi bi-pencil" />
            </button>
          )}
          {onDelete && (
            <button className="btn btn-light" onClick={onDelete} title="Supprimer">
              <i className="bi bi-trash" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ========= Section Mes adresses ========= */
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

  // ---- Normalisation pour l'affichage
  const toView = (a) => {
    if (!a) return null;
    return {
      id: a?.id ?? a?.billingAddressId ?? a?.deliveryAddressId ?? a?.Id ?? null,
      civ: a?.civ ?? a?.Civ ?? "M",
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

  // Vues
  const billingView = toView(pickFavorite(billingList));
  const deliveryViews = (deliveryList || []).map(toView).filter(Boolean);
  const shippingView = deliveryViews.find((v) => v.favorite) || deliveryViews[0] || null;
  const shippingOthers = deliveryViews.filter((v) => v.id !== shippingView?.id);

  // ---- Modale
  const [modal, setModal] = useState({ open: false, type: "shipping", mode: "add", initial: null });

  const openAdd = () => setModal({ open: true, type: "shipping", mode: "add", initial: null });
  const openAddBilling = () => setModal({ open: true, type: "billing", mode: "add", initial: null });
  const editBilling = () => setModal({ open: true, type: "billing", mode: "edit", initial: billingView });
  const editShipping = (addrView = shippingView) =>
    setModal({ open: true, type: "shipping", mode: "edit", initial: addrView });
  const close = () => setModal((m) => ({ ...m, open: false }));

  // ---- Helpers payload
  const toPayload = (form, currentCustomer, type) => {
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
      Phone: form.phone,
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

  // ---- Choisir une autre adresse (définir favorite)
  const chooseAsFavorite = async (addrView) => {
    if (!addrView?.id) return;
    await dispatch(updateDeliveryAddressRequest(toPayload({ ...addrView, favorite: true }, currentCustomer, "shipping")));
    if (shippingView && shippingView.id !== addrView.id) {
      await dispatch(updateDeliveryAddressRequest(toPayload({ ...shippingView, favorite: false }, currentCustomer, "shipping")));
    }
    await dispatch(getDeliveryAddressRequest());
  };

  // ---- Supprimer une adresse de livraison
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

      {/* === Cartes principales === */}
      <div className="d-flex" style={{ flexDirection: "column", gap: 12 }}>
        {/* Facturation */}
        <AddressCard
          tone="neutral"
          title="Adresse de facturation"
          icon="bi-file-earmark-text"
          favorite={!!billingView?.favorite}
          onEdit={billingView ? editBilling : undefined}
        >
          {billingView ? (
            <p className="addr-block" style={{ margin: 0 }}>
              {displayName(billingView)}<br />
              {billingView.address1}<br />
              {billingView.address2 && (<>{billingView.address2}<br/></>)}
              {billingView.zip} {billingView.city}<br />
              {billingView.country}<br />
              {currentCustomer?.phoneNumber}
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

        {/* Livraison (principale) */}
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
              {[shippingView.mobile, shippingView.phone].filter(Boolean).join(" • ")}
            </p>
          ) : (
            <p className="addr-block" style={{ margin: 0, color: "#6b7280" }}>
              Aucune adresse de livraison enregistrée.
            </p>
          )}
        </AddressCard>
      </div>

      {/* Bouton ajouter livraison */}
      <div className="mt-3">
        <button className="btn btn-primary" style={{ width: 320 }} onClick={openAdd}>
          Ajouter une adresse de livraison
        </button>
      </div>

      {/* === Autres adresses de livraison === */}
      {shippingOthers.length > 0 && (
        <>
          <h3 style={{ marginTop: 20, marginBottom: 8 }}>Choisissez une autre adresse de livraison</h3>
          <div style={S.grid}>
            {shippingOthers.map((addr) => (
              <div key={addr.id} style={S.miniCard}>
                <div style={S.miniHeader}>
                  <div style={{ fontWeight: 600 }}>
                    {addr.civ === "Mme" ? "Mme" : "M."} {addr.firstName} {addr.lastName}
                  </div>
                  <div style={S.miniActions}>
                    <button className="btn btn-light" title="Modifier" onClick={() => editShipping(addr)}>
                      <i className="bi bi-pencil" />
                    </button>
                    <button className="btn btn-light" title="Supprimer" onClick={() => deleteShipping(addr)}>
                      <i className="bi bi-trash" />
                    </button>
                  </div>
                </div>

                <div style={{ color: "#374151", lineHeight: 1.4 }}>
                  {addr.address1}<br />
                  {addr.address2 && (<>{addr.address2}<br /></>)}
                  {addr.zip} {addr.city}<br />
                  {addr.country}
                </div>

                {(addr.phone || addr.mobile) && (
                  <div style={{ color: "#6b7280" }}>
                    {(addr.phone || addr.mobile)}
                  </div>
                )}

                <div>
                  <button style={S.lightBtn} onClick={() => chooseAsFavorite(addr)}>
                    Choisir cette adresse
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modale */}
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
