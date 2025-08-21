// src/pages/account/Address.jsx
import React, { useMemo, useState, useEffect } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../../../App.css";

/* ========= Modal générique d’adresse ========= */
function AddressModal({
  open,
  type = "shipping",         // "shipping" | "billing"
  mode = "add",              // "add" | "edit"
  user,                      // { fullName, firstName, lastName, civility? } optionnel
  initial,                   // valeurs existantes quand mode = "edit"
  onClose,
  onSave,
}) {
  // déduis prénom/nom depuis user.fullName si fourni
  const defaults = useMemo(() => {
    let first = "", last = "";
    if (user?.fullName) {
      const parts = user.fullName.trim().split(/\s+/);
      first = parts[0] || "";
      last = parts.slice(1).join(" ") || "";
    }
    return {
      civ: "M",                 // M ou Mme
      firstName: user?.firstName || first,
      lastName: user?.lastName || last,
      company: "",
      address1: "",
      address2: "",
      zip: "",
      city: "",
      country: "France (métropolitaine)",
      mobile: "",
      phone: "",
      preferred: false,
    };
  }, [user]);

  const [form, setForm] = useState(defaults);

  useEffect(() => {
    if (mode === "edit" && initial) {
      setForm({
        civ: initial.civ ?? "M",
        firstName: initial.firstName ?? "",
        lastName: initial.lastName ?? "",
        company: initial.company ?? "",
        address1: initial.address1 ?? "",
        address2: initial.address2 ?? "",
        zip: initial.zip ?? "",
        city: initial.city ?? "",
        country: initial.country ?? "France (métropolitaine)",
        mobile: initial.mobile ?? "",
        phone: initial.phone ?? "",
        preferred: !!initial.preferred,
      });
    }
    if (mode === "add") {
      setForm(defaults);
    }
  }, [mode, initial, defaults]);

  if (!open) return null;

  const title =
    mode === "add"
      ? "Ajouter une adresse"
      : type === "billing"
      ? "Adresse de facturation"
      : "Adresse de livraison";

  const handle = (e) => {
    const { name, value, type: t, checked } = e.target;
    setForm((p) => ({ ...p, [name]: t === "checkbox" ? checked : value }));
  };

  const submit = (e) => {
    e.preventDefault();
    onSave?.({ ...form, kind: type });
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

        <form onSubmit={submit} className="grid-2 gap-12">
          {/* Civilité */}
          <div className="form-col">
            <span> Civilité <b>*</b></span>
            <div className="radio-row">
              <label><input type="radio" name="civ" value="M" checked={form.civ === "M"} onChange={handle}/> M.</label>
              <label><input type="radio" name="civ" value="Mme" checked={form.civ === "Mme"} onChange={handle}/> Mme</label>
            </div>
          </div>

          {/* vide pour aligner */}
          <div />

          <div className="form-col">
            <span>Prénom <b>*</b></span>
            <input className="form-control" name="firstName" value={form.firstName} onChange={handle} required />
          </div>
          <div className="form-col">
            <span>Nom <b>*</b></span>
            <input className="form-control" name="lastName" value={form.lastName} onChange={handle} required />
          </div>

          <div className="form-col">
            <span>Nom de la société</span>
            <input className="form-control" name="company" value={form.company} onChange={handle} />
          </div>
          <div />

          <div className="form-col">
            <span>Adresse <b>*</b></span>
            <input className="form-control" name="address1" value={form.address1} onChange={handle} required placeholder="N° et libellé de rue" />
          </div>
          <div className="form-col">
            <span>Complément d’adresse</span>
            <input className="form-control" name="address2" value={form.address2} onChange={handle} placeholder="N°bât, étage, appt, digicode…" />
          </div>

          <div className="form-col">
            <span>Code postal <b>*</b></span>
            <input className="form-control" name="zip" value={form.zip} onChange={handle} required />
          </div>
          <div className="form-col">
            <span>Ville <b>*</b></span>
            <input className="form-control" name="city" value={form.city} onChange={handle} required />
          </div>

          <div className="form-col">
            <span>Pays <b>*</b></span>
            <select className="form-control" name="country" value={form.country} onChange={handle} required>
              <option>France (métropolitaine)</option>
              <option>Belgique</option>
              <option>Luxembourg</option>
              <option>Suisse</option>
            </select>
          </div>
          <div />

          <div className="form-col">
            <span>Téléphone portable</span>
            <input className="form-control" name="mobile" value={form.mobile} onChange={handle} placeholder="Renseignez au moins un numéro" />
          </div>
          <div className="form-col">
            <span>Téléphone fixe</span>
            <input className="form-control" name="phone" value={form.phone} onChange={handle} />
          </div>

          <div className="form-col" style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" name="preferred" checked={form.preferred} onChange={handle} />
              Enregistrez comme adresse préférée
            </label>
          </div>

            <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "center" }}>
              <button type="submit" className="btn btn-primary" style={{ width: 160 }}>
                Valider
              </button>
            </div>
        </form>

        <p style={{ fontSize: 12, color: "#6b7280", marginTop: 12 }}>
          Les informations recueillies servent à la gestion de votre compte client et peuvent être utilisées pour la relation client-prospect et aux opérations associées.
          <br />
          <a href="#" onClick={(e) => e.preventDefault()}>Pour en savoir plus sur la gestion de vos données et vos droits.</a>
        </p>
      </div>
    </div>
  );
}

/* ========= Carte d’adresse ========= */
function AddressCard({ tone = "neutral", title, icon, children, onEdit, preferred }) {
  const bg =
    tone === "neutral" ? "#f7f7f8" :
    tone === "soft"    ? "#eef8fb" : "#fff";
  return (
    <div className="addr-item" style={{ background: bg, border: "none" }}>
      <div className="d-flex align-items-start justify-content-between">
        <div style={{ display:"flex", gap:14 }}>
          <div className="addr-ico" style={{
            width:42,height:42,borderRadius:10,display:"grid",placeItems:"center",
            background:"#111",color:"#fff"
          }}>
            <i className={`bi ${icon}`} />
          </div>
          <div>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>{title}</div>
            {preferred && (
              <span className="addr-badge">Adresse préférée</span>
            )}
            {children}
          </div>
        </div>
        <button className="btn btn-light" onClick={onEdit} title="Modifier">
          <i className="bi bi-pencil" />
        </button>
      </div>
    </div>
  );
}

/* ========= Section Mes adresses ========= */
export const Address = ({ user }) => {
  // données “maquettes”
  const [billing, setBilling] = useState({
    civ: "M", firstName: "M. Camara", lastName: "Minamba",
    address1: "rue andre lalande", address2: "8,",
    zip: "91000", city: "Evry", country: "France (métropolitaine)",
    mobile: "0160784679 - 0624957558",
  });

  const [shipping, setShipping] = useState({
    civ: "M", firstName: "M. Camara", lastName: "Minamba",
    address1: "rue andre lalande", address2: "8,",
    zip: "91000", city: "Evry", country: "France (métropolitaine)",
    mobile: "0160784679 - 0624957558",
    preferred: true,
  });

  const [modal, setModal] = useState({
    open: false,
    type: "shipping", // "shipping" | "billing"
    mode: "add",      // "add" | "edit"
    initial: null,
  });

  const openAdd = () =>
    setModal({ open: true, type: "shipping", mode: "add", initial: null });

  const editBilling = () =>
    setModal({ open: true, type: "billing", mode: "edit", initial: billing });

  const editShipping = () =>
    setModal({ open: true, type: "shipping", mode: "edit", initial: shipping });

  const close = () => setModal((m) => ({ ...m, open: false }));

  const save = (data) => {
    if (data.kind === "billing") setBilling(data);
    else setShipping(data);
    close();
  };

  return (
    <div>
      <h2 className="orders-title" style={{ marginBottom: 8 }}>Carnet d’adresses</h2>
      <p style={{ marginTop: 0, color: "#555" }}>
        Retrouvez ici les adresses enregistrées lors de vos précédents achats sur notre site.
        <br />
        <b>Vous pouvez sélectionner votre adresse préférée</b> pour gagner du temps lors de vos prochaines commandes.
      </p>

      {/* Bloc adresses */}
      <div className="d-flex" style={{ flexDirection: "column", gap: 12 }}>
        <AddressCard
          tone="neutral"
          title="Adresse de facturation"
          icon="bi-file-earmark-text"
          onEdit={editBilling}
        >
          <p className="addr-block" style={{ margin: 0 }}>
            {billing?.firstName} {billing?.lastName}<br />
            {billing?.address1}<br />
            {billing?.address2 && (<>{billing.address2}<br/></>)}
            {billing?.zip} {billing?.city}<br />
            {billing?.country}<br />
            {billing?.mobile}
          </p>
        </AddressCard>

        <AddressCard
          tone="soft"
          title="Adresse de livraison"
          icon="bi-truck"
          preferred={shipping?.preferred}
          onEdit={editShipping}
        >
          <p className="addr-block" style={{ margin: 0 }}>
            {shipping?.firstName} {shipping?.lastName}<br />
            {shipping?.address1}<br />
            {shipping?.address2 && (<>{shipping.address2}<br/></>)}
            {shipping?.zip} {shipping?.city}<br />
            {shipping?.country}<br />
            {shipping?.mobile}
          </p>
        </AddressCard>
      </div>

      <div className="mt-3">
        <button className="btn btn-primary" style={{ width: 240 }} onClick={openAdd}>
          Ajouter une adresse
        </button>
      </div>

      <AddressModal
        open={modal.open}
        type={modal.type}
        mode={modal.mode}
        user={user}
        initial={modal.initial}
        onClose={close}
        onSave={save}
      />
    </div>
  );
};
