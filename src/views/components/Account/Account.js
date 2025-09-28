// src/pages/account/Account.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../../../styles/pages/account.css";

import { UserInformation } from "./UserInformation";
import { Address } from "./Address";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";

import { logout } from "../../../lib/actions/AccountActions";
import { downloadInvoiceRequest, getOrderPagedUserRequest } from "../../../lib/actions/OrderActions";
import { getOrderCustomerProductRequest } from "../../../lib/actions/OrderCustomerProductActions";
import { getProductUserRequest } from "../../../lib/actions/ProductActions";
import { toMediaUrl } from "../../../lib/utils/mediaUrl";

/* ===== Helpers ===== */
const getId = (x) => x?.id ?? x?.Id ?? x?.orderId ?? x?.OrderId ?? x?.orderID ?? null;
const getOrderIdFromOP = (op) => op?.idOrder ?? op?.orderId ?? op?.OrderId ?? op?.IdOrder ?? null;
const getProductIdFromOP = (op) => op?.idProduct ?? op?.productId ?? op?.ProductId ?? op?.IdProduct ?? null;

const getCustomerIdFromOrder = (o) => {
  const root = o?.idCustomer ?? o?.IdCustomer ?? o?.customerId ?? o?.CustomerId ?? o?.CustomerID ?? null;
  if (root != null) return root;
  const c = o?.customer ?? o?.Customer ?? o?.customerNavigation ?? o?.CustomerNavigation ?? null;
  if (c) return c.id ?? c.Id ?? c.customerId ?? c.CustomerId ?? c.customerID ?? c.CustomerID ?? null;
  const uc = o?.user?.customer ?? o?.User?.Customer ?? null;
  if (uc) return uc.id ?? uc.Id ?? uc.customerId ?? uc.CustomerId ?? null;
  return null;
};

const getQtyFromOP = (op) => Number(op?.quantity ?? op?.qty ?? op?.Quantity ?? 1);
const labelForProduct = (p) => {
  const brand = p?.brand || p?.Brand || "";
  const model = p?.model || p?.Model || "";
  const base = [brand, model].filter(Boolean).join(" ");
  return base || p?.name || p?.Name || p?.title || `#${getId(p)}`;
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

const norm = (s) =>
  String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const isDelivered = (status) => {
  const n = norm(status);
  return n.includes("livre") || n.includes("delivre") || n.includes("delivered") || n.includes("effectuee");
};

const toNum = (v) => (typeof v === "number" ? v : parseFloat(v)) || 0;

/* ===== Component ===== */
export const Account = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Store
  const { user } = useSelector((s) => s.account);
  const customers = useSelector((s) => s?.customers?.customers) || [];

  // Produits (paged-aware)
  const productsSlice = useSelector((s) => s?.products) || {};
  const products = useMemo(() => {
    const full = Array.isArray(productsSlice.products) ? productsSlice.products : null;
    const paged = Array.isArray(productsSlice.items) ? productsSlice.items : null;
    return (full && full.length) ? full : (paged || []);
  }, [productsSlice]);

  const orderProducts = useSelector((s) => s?.orderProducts?.orderProducts) || [];
  const images = useSelector((s) => s?.images?.images) || [];

  // Orders (paged)
  const orderSlice = useSelector((s) => s?.orders) || {};
  const pagedOrders = Array.isArray(orderSlice.items) ? orderSlice.items : [];
  const totalCount = Number(orderSlice.totalCount ?? 0);
  const loading = !!orderSlice.loading;

  // Courant
  const uid = user?.id || null;
  const currentCustomer = customers.find((c) => c.idAspNetUser === uid) || null;

  // UI
  const [activeMenu, setActiveMenu] = useState("orders");
  const [period, setPeriod] = useState("6m");
  const [openId, setOpenId] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Période -> minDate ISO
  const minDateISO = useMemo(() => {
    const now = new Date();
    const d = new Date(now);
    if (period === "3m") d.setMonth(now.getMonth() - 3);
    else if (period === "6m") d.setMonth(now.getMonth() - 6);
    else if (period === "12m") d.setFullYear(now.getFullYear() - 1);
    else d.setFullYear(1970);
    return d.toISOString();
  }, [period]);

  // === Fix F5 : charge PIVOTS + PRODUITS dès le montage
  useEffect(() => {
    dispatch(getOrderCustomerProductRequest());
    dispatch(getProductUserRequest());
  }, [dispatch]);

  // Fetch paginé des commandes (filtré client + période)
  const lastQueryRef = useRef("");
  useEffect(() => {
    if (!currentCustomer || activeMenu !== "orders") return;

    const payload = {
      page,
      pageSize,
      sort: "CreationDate:desc",
      filter: {
        IdCustomer: currentCustomer.id,
        CustomerId: currentCustomer.id,
        "Customer.Id": currentCustomer.id,
        MinDate: minDateISO,
        minDate: minDateISO,
      },
    };

    const sig = JSON.stringify(payload);
    if (lastQueryRef.current === sig) return;
    lastQueryRef.current = sig;

    dispatch(getOrderPagedUserRequest(payload));
    setOpenId(null);
  }, [dispatch, currentCustomer, activeMenu, page, pageSize, minDateISO]);

  // Filtre local (safety)
  const currentOrders = useMemo(() => {
    if (!currentCustomer) return [];
    const list = Array.isArray(pagedOrders) ? pagedOrders : [];
    const hasCustomerField = list.some((o) => getCustomerIdFromOrder(o) != null);
    const byClient = hasCustomerField
      ? list.filter((o) => String(currentCustomer.id) === String(getCustomerIdFromOrder(o)))
      : list;
    const min = new Date(minDateISO).getTime();
    return byClient.filter((o) => {
      const t = orderDate(o)?.getTime();
      return t == null || t >= min;
    });
  }, [pagedOrders, currentCustomer?.id, minDateISO]);

  // Compteur “en cours”
  const currentCount = useMemo(
    () => currentOrders.filter((o) => !isDelivered(orderStatus(o))).length,
    [currentOrders]
  );

  // Maps
  const productsById = useMemo(() => {
    const m = new Map();
    for (const p of products) {
      const pid = getId(p);
      if (pid != null) m.set(String(pid), p);
    }
    return m;
  }, [products]);

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

  // Détails: n’EMPÊCHE PAS le rendu si un produit manque.
  const itemsForOrder = (order) => {
    const oid = String(getId(order));

    // 1) pivots (source principale)
    const pivots = opByOrder.get(oid) || [];
    if (pivots.length > 0) {
      return pivots.map((l) => {
        const pid = String(getProductIdFromOP(l));
        const prod = productsById.get(pid);
        const qty = getQtyFromOP(l);
        const unit = toNum(l?.productUnitPrice ?? l?.price ?? l?.priceTtc ?? prod?.priceTtc ?? prod?.price);

        return {
          name: prod ? labelForProduct(prod) : `Article #${pid}`,
          qty,
          productId: prod?.id ?? prod?.Id ?? Number(pid),
          price: unit,
        };
      });
    }

    // 2) fallback: produits *inline* (si un jour la page renvoie les produits)
    const inline = Array.isArray(order?.products)
      ? order.products
      : Array.isArray(order?.Products)
      ? order.Products
      : [];
    return inline.map((p) => ({
      name: labelForProduct(p),
      qty: toNum(p?.quantity ?? p?.Quantity) || 1,
      productId: p?.id ?? p?.Id,
      price: toNum(p?.priceTtc ?? p?.PriceTtc ?? p?.price ?? p?.Price),
    }));
  };

  const amountForOrder = (order) => (order?.amount != null ? Number(order.amount) : 0);

  // Image avec fallbacks (placeholder si rien)
  const getImage = (id) => {
    const pid = String(id);

    const imgRec = images.find(
      (i) => String(i?.idProduct ?? i?.IdProduct ?? i?.productId ?? i?.ProductId ?? "") === pid
    );

    const prod = productsById.get(pid);
    const prodUrl =
      prod?.images?.[0]?.url ??
      prod?.Images?.[0]?.url ??
      prod?.image ??
      prod?.Image ??
      null;

    const url = imgRec?.url ?? prodUrl ?? "/Images/placeholder.jpg";
    return toMediaUrl(url);
  };

  // Pagination
  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / pageSize));
  const startIdx = totalCount ? (page - 1) * pageSize + 1 : (page - 1) * pageSize + 1;
  const endIdx = totalCount ? Math.min(totalCount, page * pageSize) : (page - 1) * pageSize + currentOrders.length;

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const windowSize = 5;
    let start = Math.max(1, page - Math.floor(windowSize / 2));
    let end = Math.min(totalPages, start + windowSize - 1);
    if (end - start + 1 < windowSize) start = Math.max(1, end - windowSize + 1);
    const pages = [];
    for (let p = start; p <= end; p++) pages.push(p);
    return (
      <nav className="orders-pagination" aria-label="Pagination des commandes">
        <button className="pg-btn" disabled={page <= 1 || loading} onClick={() => setPage((x) => Math.max(1, x - 1))}>
          ← Précédente
        </button>
        {pages.map((p) => (
          <button key={p} className={`pg-btn ${p === page ? "is-active" : ""}`} onClick={() => setPage(p)} disabled={loading}>
            {p}
          </button>
        ))}
        <button className="pg-btn" disabled={page >= totalPages || loading} onClick={() => setPage((x) => Math.min(totalPages, x + 1))}>
          Suivante →
        </button>
      </nav>
    );
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
            <i className="bi bi-power text-danger fw-bold" aria-hidden="true" />
            <span>Se déconnecter</span>
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
                  onChange={(e) => {
                    setPeriod(e.target.value);
                    setPage(1);
                  }}
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

              {loading && <div className="orders-empty">Chargement…</div>}

              {!loading && currentOrders.length === 0 && (
                <div className="orders-empty">Aucune commande sur la période sélectionnée.</div>
              )}

              {!loading &&
                currentOrders.map((o) => {
                  const oid = String(getId(o));
                  const open = openId === oid;
                  const items = itemsForOrder(o);
                  const amount = amountForOrder(o);

                  return (
                    <div key={oid} className="order-row pb-2 ">
                      <div className="order-grid">
                        <span className="order-id">N° {orderNumber(o)}</span>
                        <span className="order-price">{fmtPrice(amount)} TTC</span>
                        <span>{orderDateFR(o)}</span>
                        <span className="order-status ">{orderStatus(o)}</span>
                        <button
                          className="order-detail-btn"
                          onClick={() => setOpenId(open ? null : oid)}
                          aria-expanded={open}
                        >
                          Détails <i className={`bi bi-chevron-${open ? "up" : "down"}`} />
                        </button>
                      </div>

                      {open && (
                        <div className="order-details">
                          {items.length === 0 ? (
                            <div className="orders-empty">Aucun article pour cette commande.</div>
                          ) : (
                            items.map((it, i) => (
                              <React.Fragment key={`${oid}-${it.productId}-${i}`}>
                                <div className="order-item lineBackgroundColor">
                                  <span>
                                    <Link to={`/product/${it.productId}`}>
                                      <img
                                        src={getImage(it.productId)}
                                        alt={it.name}
                                        width={60}
                                        onError={(e) => {
                                          e.currentTarget.src = "/Images/placeholder.jpg";
                                        }}
                                      />
                                    </Link>
                                    <span className="fw-bold">{it.name}</span>
                                  </span>
                                  <span className="text-dark fw-bold">{fmtPrice(it.price * it.qty)}</span>
                                  <span>x{it.qty}</span>
                                </div>
                                <hr />
                              </React.Fragment>
                            ))
                          )}

                          <div className="order-item order-item--shipping lineBackgroundColor">
                            <span className="shipping-label text-success">Prix de Livraison</span>
                            <span className="text-dark fw-bold">
                              {fmtPrice(Number(o?.deliveryAmount ?? o?.shippingAmount ?? o?.shipping ?? 0))}
                            </span>
                            <span className="order-item__qty" aria-hidden="true">&nbsp;</span>
                          </div>
                          <hr />
                          <div className="order-item order-item--shipping lineBackgroundColor">
                            <span className="shipping-label text-success">N° de suivi</span>
                            <span className="text-dark fw-bold">
                              <a href={o?.trackingLink} target="_blank" rel="">
                                {o?.trackingNumber}
                              </a>
                            </span>
                            <span className="order-item__qty" aria-hidden="true">&nbsp;</span>
                          </div>
                          <hr />

                          <div className="order-actions">
                            <button
                              className="gbtn gbtn--primary"
                              onClick={() => dispatch(downloadInvoiceRequest(o.id))}
                            >
                              Télécharger la facture
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Pagination (style mobile) */}
            {renderPagination()}

            {/* Infos + page size */}
            <div className="d-flex align-items-center gap-3 mt-2">
              <span className="ms-auto">
                {startIdx}–{endIdx} {totalCount ? `sur ${totalCount}` : ""}
              </span>
              <select
                className="form-select"
                style={{ width: 110 }}
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                {[5, 10, 20].map((n) => (
                  <option key={n} value={n}>
                    {n} / page
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {activeMenu === "profile" && <UserInformation user={user} />}
        {activeMenu === "addresses" && (
          <Address user={user} enableAddressAutocomplete={true} preservePhoneOnFavorite={true} />
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
