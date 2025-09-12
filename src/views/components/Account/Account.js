// src/pages/account/Account.jsx
import React, { useMemo, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../../../App.css";

import { UserInformation } from "./UserInformation";
import { Address } from "./Address";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../../lib/actions/AccountActions";
import { Link } from "react-router-dom";

/* ===== Helpers ===== */

const getId = (x) =>
  x?.id ?? x?.Id ?? x?.orderId ?? x?.OrderId ?? x?.orderID ?? null;

const getOrderIdFromOP = (op) =>
  op?.idOrder ?? op?.orderId ?? op?.OrderId ?? op?.IdOrder ?? null;

const getProductIdFromOP = (op) =>
  op?.idProduct ?? op?.productId ?? op?.ProductId ?? op?.IdProduct ?? null;

const getQtyFromOP = (op) => Number(op?.quantity ?? op?.qty ?? op?.Quantity ?? 1);

const labelForProduct = (p) => {
  const brand = p?.brand || "";
  const model = p?.model || "";
  const base = [brand, model].filter(Boolean).join(" ");
  return base || p?.name || p?.title || `#${getId(p)}`;
};

const fmtPrice = (n) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Number(n || 0));

const parseDate = (d) => {
  if (!d) return null;
  if (d instanceof Date) return isNaN(d.getTime()) ? null : d;
  const t = Date.parse(String(d));
  return isNaN(t) ? null : new Date(t);
};

const orderRawDate = (o) =>
  o?.date ?? o?.orderDate ?? o?.createdAt ?? o?.created_on ?? o?.createdOn ?? o?.timestamp ?? null;

const orderDate = (o) => parseDate(orderRawDate(o));

const orderDateFR = (o) => {
  const d = orderDate(o);
  return d
    ? d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "—";
};

const orderNumber = (o) =>
  o?.orderNumber ?? o?.orderNo ?? o?.number ?? o?.reference ?? `#${getId(o)}`;

const orderStatus = (o) => o?.status ?? o?.orderStatus ?? "—";

/* === Normalisation pour tester "livré" (sans accent / insensible à la casse) === */
const norm = (s) =>
  String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

/* === Est-ce livré ? on couvre "livré", "delivré/delivre", et "delivered" === */
const isDelivered = (status) => {
  const n = norm(status);
  return n.includes("livre") || n.includes("delivre") || n.includes("delivered") || n.includes("effectuee") ;
};

/* ===== Component ===== */
export const Account = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((s) => s.account);
  const customers = useSelector((s) => s?.customers?.customers) || [];
  const orders = useSelector((s) => s?.orders?.orders) || [];
  const products = useSelector((s) => s?.products?.products) || [];
  const orderProducts = useSelector((s) => s?.orderProducts?.orderProducts) || [];

  const uid = user?.id || null;
  const currentCustomer = customers.find((c) => c.idAspNetUser === uid);

  const currentOrders = (orders || []).filter(
    (o) => o?.customer?.id === currentCustomer?.id
  );

  /* Compteur des commandes en cours = hors "livré" */
  const ongoingOrders = currentOrders.filter((o) => !isDelivered(orderStatus(o)));
  const [activeMenu, setActiveMenu] = useState("orders"); // "profile" | "orders" | "addresses"
  const [period, setPeriod] = useState("6m");
  const [openId, setOpenId] = useState(null);
  const currentCount = ongoingOrders.length;

  /* Maps utiles */
  const productsById = useMemo(() => {
    const m = new Map();
    for (const p of products) {
      const pid = getId(p);
      if (pid != null) m.set(String(pid), p);
    }
    return m;
  }, [products]);

  // orderId -> [pivot lines]
  const opByOrder = useMemo(() => {
    const m = new Map();
    for (const op of orderProducts) {
      const oid = String(getOrderIdFromOP(op));
      if (!oid) continue;
      if (!m.has(oid)) m.set(oid, []);
      m.get(oid).push(op);
    }
    return m;
  }, [orderProducts]);

  /* Filtrage période (via date robuste) */
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const minDate = new Date(now);
    if (period === "3m") minDate.setMonth(now.getMonth() - 3);
    else if (period === "6m") minDate.setMonth(now.getMonth() - 6);
    else if (period === "12m") minDate.setFullYear(now.getFullYear() - 1);
    else minDate.setFullYear(1970);

    return (currentOrders || []).filter((o) => {
      const d = orderDate(o);
      return d ? d >= minDate : true; // si pas de date, on montre quand même
    });
  }, [currentOrders, period]);

  /* Construit les items (nom + quantité) pour une commande */
  const itemsForOrder = (order) => {
    const oid = String(getId(order));
    const lines = opByOrder.get(oid) || [];
    return lines
      .map((l) => {
        const pid = String(getProductIdFromOP(l));
        const prod = productsById.get(pid);
        if (!prod) return null;
        // note: on pourrait retourner productId si tu veux lier au produit
        return { name: labelForProduct(prod), qty: getQtyFromOP(l), productId: prod.id, price: priceForItem(prod, order) };
      })
      .filter(Boolean);
  };

  /* Montant: priorité à o.amount, sinon 0 (on peut additionner les lignes si besoin) */
  const amountForOrder = (order) => {
    if (order?.amount != null) return Number(order.amount);
    return 0;
  };

  const priceForItem = (item, order) => {
    const line = orderProducts.find(
      (op) => op.productId === item.id && op.orderId === order.id
    );
    const unitPriceWhenOrder = line?.productUnitPrice;
    return unitPriceWhenOrder ?? 0;
  };

  const deconnect = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <div className="account-page">
      {/* -------- SIDEBAR -------- */}
      <aside className="account-sidebar">
        <div className="account-user">
          {currentCustomer ? (
            <img
              className="account-avatar"
              src={currentCustomer.civilite === "M" ? "/Images/man_avatar.png" : "/Images/women_avatar.png"}
              alt={user?.fullName || "Avatar"}
            />
          ) : (
            <div className="account-avatar account-avatar--emoji" aria-hidden>
              👨‍💻
            </div>
          )}
          <div className="account-identity">
            <div className="account-name">
              {currentCustomer?.pseudo
                ? currentCustomer.pseudo
                : currentCustomer?.firstName
                ? currentCustomer.firstName
                : "Mon compte"}
            </div>
            {currentCustomer?.clientNumber && (
              <div className="account-ref">
                N° de client : <strong>{currentCustomer.clientNumber}</strong>
              </div>
            )}
          </div>
          <button className="account-logout" onClick={deconnect}>
            <i className="bi bi-power" /> Se déconnecter
          </button>
        </div>

        <nav className="account-nav">
          <button
            className={`account-nav__item ${activeMenu === "profile" ? "is-active" : ""}`}
            onClick={() => setActiveMenu("profile")}
          >
            Mes informations
          </button>
          <button
            className={`account-nav__item ${activeMenu === "orders" ? "is-active" : ""}`}
            onClick={() => setActiveMenu("orders")}
          >
            Mes commandes
          </button>
          <button
            className={`account-nav__item ${activeMenu === "addresses" ? "is-active" : ""}`}
            onClick={() => setActiveMenu("addresses")}
          >
            Mes adresses
          </button>
        </nav>
      </aside>

      {/* -------- MAIN -------- */}
      <section className="account-main">
        <div className="account-hero">
          <div className="account-counter">
            <div className="account-counter__num">{currentCount}</div>
            <div className="account-counter__label">Commande en cours</div>
          </div>
          {currentCustomer && (
            <img
              className="account-hero__img"
              src={"/Images/account-empty.png"}
              alt=""
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          )}
        </div>

        {activeMenu === "orders" && (
          <>
            <header className="orders-header">
              <h2 className="orders-title">Historique de vos commandes</h2>
              <div className="orders-filter">
                <select
                  className="form-select account-select"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  <option value="3m">Depuis les 3 derniers mois</option>
                  <option value="6m">Depuis les 6 derniers mois</option>
                  <option value="12m">Depuis les 12 derniers mois</option>
                  <option value="all">Toutes les commandes</option>
                </select>
              </div>
            </header>

            <div className="orders-table">
              <div className="orders-head">
                <span>N° commande</span>
                <span>Prix</span>
                <span>Date</span>
                <span>Statut</span>
                <span className="col-actions">Détails</span>
              </div>

              {filteredOrders.length === 0 && (
                <div className="orders-empty">Aucune commande sur la période sélectionnée.</div>
              )}

              {filteredOrders.map((o) => {
                const open = openId === o.id || openId === getId(o);
                const items = itemsForOrder(o);
                const amount = amountForOrder(o);

                return (
                  <div key={getId(o) ?? o.id} className="order-row">
                    <div className="order-grid">
                      <span className="order-id">N° {orderNumber(o)}</span>
                      <span className="order-price">{fmtPrice(amount)} TTC</span>
                      <span>{orderDateFR(o)}</span>
                      <span className="order-status">{orderStatus(o)}</span>
                      <button
                        className="order-detail-btn"
                        onClick={() => setOpenId(open ? null : (getId(o) ?? o.id))}
                        aria-expanded={open}
                      >
                        Détails <i className={`bi bi-chevron-${open ? "up" : "down"}`} />
                      </button>
                    </div>

                    {open && (
                      <div className="order-details">
                        {items.map((it, i) => (
                          <div key={i} className="order-item">
                            <span>
                              <Link to={`/product/${it.productId}`}>{it.name}</Link>
                            </span>
                            <span className="text-dark fw-bold">{fmtPrice(it.price * it.qty)}</span>
                            <span>x{it.qty}</span>
                          </div>
                        ))}

                        <div className="order-item order-item--shipping">
                          <span className="shipping-label">Prix de Livraison</span>
                          <span className="text-dark fw-bold">
                            {fmtPrice(Number(o?.deliveryAmount ?? o?.shippingAmount ?? o?.shipping ?? 0))}
                          </span>
                          <span className="order-item__qty" aria-hidden="true">&nbsp;</span>
                        </div>

                        <div className="order-item order-item--shipping">
                          <span className="shipping-label">N° de suivi</span>
                          <span className="text-dark fw-bold">
                            <a
                              href={o?.trackingLink}
                              target="_blank"
                              rel=""
                            >
                              {o?.trackingNumber}
                            </a>
                          </span>
                          <span className="order-item__qty" aria-hidden="true">&nbsp;</span>
                        </div>

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

        {activeMenu === "profile" && <UserInformation user={user} />}

        {/* ✅ On passe des props à Address :
            - enableAddressAutocomplete : pour activer l’auto-complétion dans la popup (à implémenter dans Address.jsx)
            - preservePhoneOnFavorite   : pour que la bascule d’adresse préférée n’écrase pas le Phone (mise à jour minimale)
         */}
        {activeMenu === "addresses" && (
          <Address
            user={user}
            enableAddressAutocomplete={true}
            preservePhoneOnFavorite={true}
          />
        )}

        {["carts", "credits", "settings"].includes(activeMenu) && (
          <div className="account-placeholder">
            <p>Section “{activeMenu}” à brancher.</p>
          </div>
        )}
      </section>
    </div>
  );
};
