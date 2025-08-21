// src/pages/checkout/DeliveryPayment.jsx
import React, { useMemo, useState } from "react";

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

/** Formulaire d’adresse (création / modification).
 *  - initial: valeurs pré-remplies (null -> ajout, sinon modif)
 *  - onSave(payload) + onCancel()
 */
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
    // validations minimales
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
                <input
                  type="radio"
                  name="civ"
                  checked={form.civility === c}
                  onChange={() => change("civility", c)}
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
          />
        </Field>

        <Field label="Nom *">
          <input
            className="form-control"
            value={form.lastName}
            onChange={(e) => change("lastName", e.target.value)}
          />
        </Field>

        <Field label="Nom de la société">
          <input
            className="form-control"
            value={form.company}
            onChange={(e) => change("company", e.target.value)}
          />
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

        <Field label="Téléphone portable">
          <input
            className="form-control"
            value={form.phone}
            onChange={(e) => change("phone", e.target.value)}
          />
        </Field>

        <Field label="Téléphone fixe">
          <input
            className="form-control"
            value={form.phoneFix}
            onChange={(e) => change("phoneFix", e.target.value)}
          />
        </Field>
      </div>
    </SimpleModal>
  );
}

/** Carnet d’adresses (liste + choisir / modifier) */
function AddressBookModal({ open, addresses, onChoose, onEdit, onClose }) {
  return (
    <SimpleModal open={open} onClose={onClose} title="Carnet d’adresses">
      {addresses.length === 0 && (
        <div style={{ color: "#6b7280" }}>Aucune adresse enregistrée.</div>
      )}
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
/* ------------------------ Page principale -------------------------- */
/* ------------------------------------------------------------------ */

const fmt = (n) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
    Number(n) || 0
  );

export const DeliveryPayment = () => {
  /* ---- Adresses mock (remplace par ton store/APIs) ---- */
  const [addresses, setAddresses] = useState([
    {
      civility: "M.",
      firstName: "Minamba",
      lastName: "Camara",
      street: "rue andre lalande",
      extra: "8,",
      zip: "91000",
      city: "Evry",
      country: "France (métropolitaine)",
      phone: "0624957558",
      phoneFix: "0160784679",
    },
  ]);
  const [shippingIndex, setShippingIndex] = useState(0); // adresse de livraison choisie
  const [billing, setBilling] = useState(addresses[0]); // adresse de facturation

  /* ---- Popups ---- */
  const [showBook, setShowBook] = useState(false);
  const [showAddShip, setShowAddShip] = useState(false);
  const [editShipIdx, setEditShipIdx] = useState(null);

  const [showEditBilling, setShowEditBilling] = useState(false);

  /* ---- Livraison ---- */
  const [deliveryMode, setDeliveryMode] = useState("home"); // "home" | "relay"
  const [relayZip, setRelayZip] = useState("91000");
  const [shipOption, setShipOption] = useState("std");

  /* ---- Paiement ---- */
  const [payMethod, setPayMethod] = useState("card"); // "card" | "paypal"
  const [acceptTosCard, setAcceptTosCard] = useState(false);
  const [acceptTosPaypal, setAcceptTosPaypal] = useState(false);

  /* ---- Totaux mock ---- */
  const itemsTotal = 24.95;
  const shippingPrice = useMemo(() => {
    if (deliveryMode === "relay") return 1.95;
    switch (shipOption) {
      case "std":
        return 1.95;
      case "chrono-ex":
        return 8.95;
      case "chrono-rdv":
        return 12.95;
      case "chronopost":
        return 7.95;
      default:
        return 1.95;
    }
  }, [deliveryMode, shipOption]);

  const grandTotal = +(itemsTotal + shippingPrice).toFixed(2);

  /* ---- Handlers popups ---- */
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

  const startEditShipping = (idx) => {
    setEditShipIdx(idx);
  };
  const saveEditShipping = (payload) => {
    setAddresses((arr) => arr.map((a, i) => (i === editShipIdx ? payload : a)));
    setEditShipIdx(null);
  };

  /* ---- Paiement actions ---- */
  const handleStripePay = () => {
    if (!acceptTosCard) return;
    // TODO: intégrer Stripe (Checkout / Payment Element)
    alert("[Stripe] Paiement déclenché (mock)");
  };
  const handlePayPal = () => {
    if (!acceptTosPaypal) return;
    // TODO: intégrer le flow PayPal
    alert("[PayPal] Paiement déclenché (mock)");
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
            <input
              type="radio"
              name="deliv"
              checked={deliveryMode === "home"}
              onChange={() => setDeliveryMode("home")}
            />
            <h3 style={{ margin: 0 }}>À domicile</h3>
            <span style={chipMuted}>À partir de 1€95</span>
          </div>

          <div style={smallTitle}>Votre adresse de livraison</div>
          <div style={addressWrap}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800 }}>
                {shipAddr.firstName} {shipAddr.lastName}
              </div>
              <div>{shipAddr.street}</div>
              {shipAddr.extra && <div>{shipAddr.extra}</div>}
              <div>
                {shipAddr.zip} {shipAddr.city}
              </div>
              <div>{shipAddr.country}</div>
              {(shipAddr.phone || shipAddr.phoneFix) && (
                <div style={{ color: "#6b7280" }}>
                  {shipAddr.phone || shipAddr.phoneFix}
                  {shipAddr.phone && shipAddr.phoneFix ? " • " : ""}
                  {shipAddr.phoneFix}
                </div>
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

          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            <ShipOption
              value="std"
              price="1€95"
              label="Livraison standard"
              checked={shipOption === "std"}
              onChange={() => setShipOption("std")}
            />
            <ShipOption
              value="chrono-ex"
              price="8€95"
              label="Livraison Chronopost Express (avant 10h)"
              sub="Livré demain avant 10h"
              checked={shipOption === "chrono-ex"}
              onChange={() => setShipOption("chrono-ex")}
            />
            <ShipOption
              value="chrono-rdv"
              price="12€95"
              label="Livraison Chronopost Rendez-Vous"
              sub="Livré dans la journée"
              checked={shipOption === "chrono-rdv"}
              onChange={() => setShipOption("chrono-rdv")}
            />
            <ShipOption
              value="chronopost"
              price="7€95"
              label="Livraison Chronopost"
              checked={shipOption === "chronopost"}
              onChange={() => setShipOption("chronopost")}
            />
          </div>
        </section>

        {/* ----- En point relais ----- */}
        <section className="category-card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <input
              type="radio"
              name="deliv"
              checked={deliveryMode === "relay"}
              onChange={() => setDeliveryMode("relay")}
            />
            <h3 style={{ margin: 0 }}>En point relais</h3>
            <span style={chipMuted}>1€95</span>
          </div>

          <div style={{ color: "#2563eb", fontWeight: 800, fontSize: 12, marginBottom: 6 }}>
            Nouveau
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              className="form-control"
              style={{ maxWidth: 140 }}
              value={relayZip}
              onChange={(e) => setRelayZip(e.target.value)}
            />
            <span>✔</span>
            <button style={lightBtn}>OK</button>
          </div>

          <div style={{ margin: "10px 0", textAlign: "center", color: "#6b7280" }}>ou</div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <button style={lightBtn}>Localisez-moi</button>
          </div>
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
            <div style={{ fontWeight: 800 }}>
              {billing.firstName} {billing.lastName} — {billing.street}, {billing.extra}
            </div>
            <div>
              {billing.zip} {billing.city} — {billing.country}
            </div>
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
        {/* ====== Carte bancaire (Stripe) ====== */}
        <section className="category-card" style={{ padding: 16 }}>
          <label className="pay-method" style={payMethodRow}>
            <input
              type="radio"
              name="pay"
              checked={payMethod === "card"}
              onChange={() => setPayMethod("card")}
            />
            <span style={{ fontWeight: 800 }}>Carte bancaire</span>
            <span aria-hidden="true">💳</span>
          </label>

          {payMethod === "card" && (
            <>
              <div style={stripeInfo}>
                Paiement sécurisé via Stripe. Vous serez redirigé pour renseigner votre carte.
              </div>

              <label className="tos-row" style={tosRow}>
                <input
                  type="checkbox"
                  checked={acceptTosCard}
                  onChange={(e) => setAcceptTosCard(e.target.checked)}
                />
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
            <input
              type="radio"
              name="pay"
              checked={payMethod === "paypal"}
              onChange={() => setPayMethod("paypal")}
            />
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
            <strong>{fmt(itemsTotal)}</strong>
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
      <input
        id={`op-${value}`}
        type="radio"
        name="shipopt"
        checked={checked}
        onChange={onChange}
      />
      <div>
        <div style={{ fontWeight: 700 }}>{label}</div>
        {sub && <div style={{ color: "#6b7280", fontSize: ".95rem" }}>{sub}</div>}
      </div>
      <div style={{ fontWeight: 800 }}>{price}</div>
    </label>
  );
}

/* ---- tiny UI tokens ---- */
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

const ctaBtn = {
  width: "100%",
  border: 0,
  borderRadius: 12,
  padding: "12px 16px",
  fontWeight: 800,
  color: "#fff",
  cursor: "pointer",
  background: "linear-gradient(135deg, #3b79ff, #2c5dff)",
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
