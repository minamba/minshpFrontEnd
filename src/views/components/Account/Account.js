// src/pages/account/Account.jsx
import React, { useMemo, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../../../App.css";

import { UserInformation } from "./UserInformation"; // <- déjà créé
import { Address } from "./Address";                 // <- NOUVEAU

// (tes mocks éventuels)
const mockUser = {
  fullName: "Minamba Camara",
  customerNo: "MI00000852211",
  avatarUrl: "/Images/avatar.png",
};
const mockOrders = [
  { id: "50604210338195V", soldBy: "Materiel.Net", priceTtc: 2348.3, date: "2025-06-04", status: "Retirée en boutique", items: [{ name: "PC Portable Pro 15", qty: 1 }] },
];

const fmtPrice = (n) => new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR"}).format(n);

export const Account = () => {
  const user = mockUser;
  const orders = mockOrders;

  const [activeMenu, setActiveMenu] = useState("orders"); // "profile" | "orders" | "addresses" | ...
  const [period, setPeriod] = useState("6m");
  const [openId, setOpenId] = useState(null);
  const currentCount = 0;

  const filteredOrders = useMemo(() => {
    const now = new Date();
    const minDate = new Date(now);
    if (period === "3m") minDate.setMonth(now.getMonth() - 3);
    else if (period === "6m") minDate.setMonth(now.getMonth() - 6);
    else if (period === "12m") minDate.setFullYear(now.getFullYear() - 1);
    else minDate.setFullYear(1970);
    return (orders || []).filter((o) => new Date(o.date) >= minDate);
  }, [orders, period]);

  const logout = () => alert("Déconnexion");

  return (
    <div className="account-page">
      {/* -------- SIDEBAR -------- */}
      <aside className="account-sidebar">
        <div className="account-user">
          {user?.avatarUrl ? (
            <img className="account-avatar" src={user.avatarUrl} alt={user.fullName} />
          ) : (
            <div className="account-avatar account-avatar--emoji" aria-hidden>👨‍💻</div>
          )}
          <div className="account-identity">
            <div className="account-name">{user?.fullName || "Mon compte"}</div>
            {user?.customerNo && (
              <div className="account-ref">N° de client : <strong>{user.customerNo}</strong></div>
            )}
          </div>
          <button className="account-logout" onClick={logout}>
            <i className="bi bi-power" /> Se déconnecter
          </button>
        </div>

        <nav className="account-nav">
          <button className={`account-nav__item ${activeMenu === "profile" ? "is-active" : ""}`} onClick={() => setActiveMenu("profile")}>
            Mes informations
          </button>
          <button className={`account-nav__item ${activeMenu === "orders" ? "is-active" : ""}`} onClick={() => setActiveMenu("orders")}>
            Mes commandes
          </button>
          <button className={`account-nav__item ${activeMenu === "addresses" ? "is-active" : ""}`} onClick={() => setActiveMenu("addresses")}>
            Mes adresses
          </button>
          {/* <button className={`account-nav__item ${activeMenu === "carts" ? "is-active" : ""}`} onClick={() => setActiveMenu("carts")}>
            Mes paniers
          </button>
          <button className={`account-nav__item ${activeMenu === "credits" ? "is-active" : ""}`} onClick={() => setActiveMenu("credits")}>
            Bons d’achat & Avoirs
          </button>
          <button className={`account-nav__item ${activeMenu === "settings" ? "is-active" : ""}`} onClick={() => setActiveMenu("settings")}>
            Mes paramètres
          </button> */}
        </nav>
      </aside>

      {/* -------- MAIN -------- */}
      <section className="account-main">
        {/* Bandeau compteur */}
        <div className="account-hero">
          <div className="account-counter">
            <div className="account-counter__num">{currentCount}</div>
            <div className="account-counter__label">Commande en cours</div>
          </div>
          <img className="account-hero__img" src="/Images/account-empty.png" alt="" onError={(e)=> (e.currentTarget.style.display="none")} />
        </div>

        {/* === ROUTAGE SECTIONS === */}
        {activeMenu === "orders" && (
          <>
            <header className="orders-header">
              <h2 className="orders-title">Historique de vos commandes</h2>
              <div className="orders-filter">
                <select className="form-select account-select" value={period} onChange={(e)=>setPeriod(e.target.value)}>
                  <option value="3m">Depuis les 3 derniers mois</option>
                  <option value="6m">Depuis les 6 derniers mois</option>
                  <option value="12m">Depuis les 12 derniers mois</option>
                  <option value="all">Toutes les commandes</option>
                </select>
              </div>
            </header>

            <div className="orders-table">
              <div className="orders-head">
                <span>N° commande</span><span>Vendue par</span><span>Prix</span>
                <span>Date</span><span>Statut</span><span className="col-actions">Détails</span>
              </div>

              {filteredOrders.length === 0 && (
                <div className="orders-empty">Aucune commande sur la période sélectionnée.</div>
              )}

              {filteredOrders.map((o) => {
                const open = openId === o.id;
                return (
                  <div key={o.id} className="order-row">
                    <div className="order-grid">
                      <span className="order-id">N° {o.id}</span>
                      <span>{o.soldBy}</span>
                      <span className="order-price">{fmtPrice(o.priceTtc)} TTC</span>
                      <span>{new Date(o.date).toLocaleDateString("fr-FR")}</span>
                      <span className="order-status">{o.status}</span>
                      <button className="order-detail-btn" onClick={()=>setOpenId(open? null : o.id)} aria-expanded={open}>
                        Détails <i className={`bi bi-chevron-${open ? "up" : "down"}`} />
                      </button>
                    </div>

                    {open && (
                      <div className="order-details">
                        {(o.items||[]).map((it,i)=>(
                          <div key={i} className="order-item">
                            <span>{it.name}</span><span>x{it.qty}</span>
                          </div>
                        ))}
                        <div className="order-actions">
                          <button className="gbtn gbtn--light">Télécharger la facture</button>
                          <button className="gbtn gbtn--primary">Commander à nouveau</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeMenu === "profile" && (
          <UserInformation user={user} />
        )}

        {activeMenu === "addresses" && (
          <Address user={user} />
        )}

        {["carts","credits","settings"].includes(activeMenu) && (
          <div className="account-placeholder">
            <p>Section “{activeMenu}” à brancher.</p>
          </div>
        )}
      </section>
    </div>
  );
};
