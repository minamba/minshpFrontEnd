// src/views/components/OrderAdmin.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import "../../App.css";

import {
  getOrderRequest,
  addOrderRequest,
  updateOrderRequest,
  deleteOrderRequest,
} from "../../lib/actions/OrderActions";
import {
  getOrderCustomerProductRequest,
  addOrderCustomerProductRequest,     // ajout d’un produit
  deleteOrderCustomerProductRequest,  // suppression d’un produit
  updateOrderCustomerProductRequest,  // MAJ quantité
} from "../../lib/actions/OrderCustomerProductActions";
import { getCustomerRequest } from "../../lib/actions/CustomerActions";
import { getProductUserRequest } from "../../lib/actions/ProductActions";

/* ───────── Helpers d’ID ───────── */
const getId = (x) =>
  x?.id ?? x?.Id ?? x?.orderId ?? x?.productId ?? x?.orderProductId ?? null;

const getCustomerId = (c) =>
  c?.id ?? c?.Id ?? c?.customerId ?? c?.CustomerId ?? c?.idCustomer ?? null;

const getOrderIdFromOP = (op) =>
  op?.idOrder ?? op?.orderId ?? op?.IdOrder ?? op?.OrderId ?? null;

const getProductIdFromOP = (op) =>
  op?.idProduct ?? op?.productId ?? op?.IdProduct ?? op?.ProductId ?? null;

const getOcpId = (op) =>
  op?.id ??
  op?.Id ??
  op?.orderProductId ??
  op?.orderCustomerProductId ??
  op?.IdOrderCustomerProduct ??
  null;

/* ───────── Utils ───────── */
const normStr = (v) => (v == null ? "" : String(v));
const safeLower = (s) => normStr(s).toLowerCase();
const clamp = (n, min = 1, max = 999) => Math.max(min, Math.min(max, n || 1));
const unitPrice = (p) => 
  { 
    let price = 0;
    if(p.priceTtcCategoryCodePromoted != null)  return price=p.priceTtcCategoryCodePromoted;
    if(p.priceTtcPromoted != null && p.priceTtcCategoryCodePromoted == null) return price=p.priceTtcPromoted;
    if(p.priceTtc != null && p.priceTtcPromoted == null && p.priceTtcCategoryCodePromoted == null) return price=p.priceTtc;
    return price;
  };
const fmtMoney = (n) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Number(n || 0));

/* helpers async */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const OrderAdmin = () => {
  const dispatch = useDispatch();
  const store = useStore();

  /* ───────── Store ───────── */
  const products      = useSelector((s) => s?.products?.products) || [];
  const orderProducts = useSelector((s) => s?.orderProducts?.orderProducts) || [];
  const customers     = useSelector((s) => s?.customers?.customers) || [];
  const orders        = useSelector((s) => s?.orders?.orders) || [];

  useEffect(() => {
    dispatch(getOrderRequest?.());
    dispatch(getOrderCustomerProductRequest?.());
    dispatch(getCustomerRequest?.());
    dispatch(getProductUserRequest?.());
  }, [dispatch]);

  const productsById = useMemo(() => {
    const map = new Map();
    for (const p of products) {
      const pid = getId(p);
      if (pid != null) map.set(String(pid), p);
    }
    return map;
  }, [products]);

  const customersById = useMemo(() => {
    const map = new Map();
    for (const c of customers) {
      const cid = getCustomerId(c);
      if (cid != null) map.set(String(cid), c);
    }
    return map;
  }, [customers]);

  const opByOrder = useMemo(() => {
    const map = new Map();
    for (const op of orderProducts) {
      const oid = String(getOrderIdFromOP(op));
      if (!map.has(oid)) map.set(oid, []);
      map.get(oid).push(op);
    }
    return map;
  }, [orderProducts]);

  const computeTotal = (order) => {
    const oid = String(getId(order));
    const lines = opByOrder.get(oid) || [];
    return lines.reduce((sum, l) => {
      const pid = String(getProductIdFromOP(l));
      const prod = productsById.get(pid);
      const qty = Number(l?.quantity ?? l?.qty ?? 1);
      const linePrice = l?.price ?? l?.priceTtc ?? prod?.priceTtc ?? prod?.price ?? 0;
      return sum + Number(linePrice) * qty;
    }, 0);
  };

  const labelForProduct = (p) => {
    const brand = p?.brand || "";
    const model = p?.model || "";
    const base = [brand, model].filter(Boolean).join(" ");
    return base || p?.name || p?.title || `#${getId(p)}`;
  };

  const productsListForOrder = (order) => {
    const oid = String(getId(order));
    const lines = opByOrder.get(oid) || [];
    return lines
      .map((l) => productsById.get(String(getProductIdFromOP(l))))
      .filter(Boolean)
      .map(labelForProduct);
  };

  const categories = useMemo(() => {
    const set = new Set();
    for (const p of products) {
      const c = p?.category || p?.categoryName || p?.Category || p?.category?.name || "";
      if (c) set.add(c);
    }
    return ["Toutes les catégories", ...Array.from(set)];
  }, [products]);

  /* ───────── Modales ───────── */
  const [modal, setModal] = useState({ open: false, mode: "add", order: null });
  const openAdd = () => setModal({ open: true, mode: "add", order: null });
  const openEdit = (o) => setModal({ open: true, mode: "edit", order: o });
  const close    = () => setModal((m) => ({ ...m, open: false }));

  /* ───────── États UI ───────── */
  const [searchCust, setSearchCust] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(""); // string ID client
  const [payMethod, setPayMethod] = useState("Carte");
  const [status, setStatus]       = useState("En attente");
  const [cat, setCat]             = useState("Toutes les catégories");
  const [searchProd, setSearchProd] = useState("");

  // Sélection & Quantités
  const [selectedProducts, setSelectedProducts] = useState(new Set()); // Set<string>
  const [quantities, setQuantities] = useState(new Map());             // Map<string, number>

  // Reset / Pré-remplissage
  useEffect(() => {
    if (!modal.open) return;

    if (modal.mode === "add") {
      setSearchCust("");
      setSelectedCustomer("");
      setPayMethod("Carte");
      setStatus("En attente");
      setCat("Toutes les catégories");
      setSearchProd("");
      setSelectedProducts(new Set());
      setQuantities(new Map());
    } else if (modal.mode === "edit" && modal.order) {
      const oid = String(getId(modal.order));
      const lines = opByOrder.get(oid) || [];

      setSelectedCustomer(
        String(
          modal.order?.idCustomer ??
            modal.order?.customerId ??
            modal.order?.CustomerId ??
            modal.order?.customer?.id ??
            ""
        )
      );
      setPayMethod(modal.order?.payment ?? modal.order?.paymentMethod ?? "Carte");
      setStatus(modal.order?.status ?? modal.order?.orderStatus ?? "En cours");
      setCat("Toutes les catégories");
      setSearchProd("");

      const ids = new Set();
      const qmap = new Map();
      for (const l of lines) {
        const pid = String(getProductIdFromOP(l));
        if (!pid) continue;
        ids.add(pid);
        const q = Number(l?.quantity ?? l?.qty ?? 1);
        qmap.set(pid, clamp(q));
      }
      setSelectedProducts(ids);
      setQuantities(qmap);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal.open, modal.mode, modal.order]);

  /* ───────── Filtres ───────── */
  const filteredCustomers = useMemo(() => {
    const q = safeLower(searchCust);
    if (!q) return customers.slice(0, 30);
    return customers.filter((c) => {
      const mail = safeLower(c?.email ?? c?.mail);
      const tel  = safeLower(c?.phone ?? c?.tel ?? c?.phoneNumber);
      const name = safeLower([c?.firstName, c?.lastName, c?.fullName].filter(Boolean).join(" "));
      return mail.includes(q) || tel.includes(q) || name.includes(q);
    });
  }, [customers, searchCust]);

  const filteredProducts = useMemo(() => {
    const q = safeLower(searchProd);
    const all = products.filter((p) => {
      if (cat !== "Toutes les catégories") {
        const c = p?.category || p?.categoryName || p?.Category || p?.category?.name || "";
        if (c !== cat) return false;
      }
      return true;
    });
    if (!q) return all.slice(0, 200);
    return all.filter((p) =>
      safeLower([p?.brand, p?.model, p?.name, p?.title].join(" ")).includes(q)
    );
  }, [products, cat, searchProd]);

  /* ───────── Sélection produit ───────── */
  const toggleProduct = async (pid) => {
    const id = String(pid);
    const willSelect = !selectedProducts.has(id);

    if (modal.mode === "edit" && modal.order) {
      const orderId =
        modal.order?.id ?? modal.order?.Id ?? modal.order?.orderId ?? getId(modal.order);
      const customerId =
        modal.order?.idCustomer ??
        modal.order?.customerId ??
        modal.order?.CustomerId ??
        modal.order?.customer?.id ??
        null;

      if (willSelect) {
        const qty = quantities.get(id) ?? 1;

        await dispatch(
          addOrderCustomerProductRequest({
            // champs demandés
            OrderId: orderId,
            CustomerId: customerId,
            ProductId: pid,
            Quantity: qty,
            // fallbacks éventuels
            IdOrder: orderId,
            IdProduct: pid,
          })
        );

        await dispatch(getOrderCustomerProductRequest?.());
        setSelectedProducts((s) => new Set(s).add(id));
        setQuantities((m) => {
          const n = new Map(m);
          if (!n.has(id)) n.set(id, 1);
          return n;
        });
      } else {
        await dispatch(
          deleteOrderCustomerProductRequest({
            OrderId: orderId,
            CustomerId: customerId,
            ProductId: pid,
          })
        );

        await dispatch(getOrderCustomerProductRequest?.());
        setSelectedProducts((s) => {
          const n = new Set(s);
          n.delete(id);
          return n;
        });
        setQuantities((m) => {
          const n = new Map(m);
          n.delete(id);
          return n;
        });
      }
      return;
    }

    // Création : uniquement local
    setSelectedProducts((prev) => {
      const n = new Set(prev);
      if (willSelect) n.add(id);
      else n.delete(id);
      return n;
    });
    setQuantities((m) => {
      const n = new Map(m);
      if (willSelect && !n.has(id)) n.set(id, 1);
      if (!willSelect) n.delete(id);
      return n;
    });
  };

  const changeQty = async (pid, next) => {
    const id = String(pid);
    const qty = clamp(parseInt(next, 10));

    setQuantities((m) => {
      const n = new Map(m);
      n.set(id, qty);
      return n;
    });

    if (!selectedProducts.has(id) && modal.mode === "add") {
      setSelectedProducts((s) => new Set(s).add(id));
    }

    if (modal.mode === "edit" && modal.order) {
      const orderId =
        modal.order?.id ?? modal.order?.Id ?? modal.order?.orderId ?? getId(modal.order);
      const customerId =
        modal.order?.idCustomer ??
        modal.order?.customerId ??
        modal.order?.CustomerId ??
        modal.order?.customer?.id ??
        null;

      const lines = opByOrder.get(String(orderId)) || [];
      const line  = lines.find((l) => String(getProductIdFromOP(l)) === id);
      const ocpId = getOcpId(line);

      if (!ocpId) {
        await dispatch(
          addOrderCustomerProductRequest({
            IdOrder: orderId,
            IdProduct: pid,
            Quantity: qty,
          })
        );
        await dispatch(getOrderCustomerProductRequest?.());
        setSelectedProducts((s) => new Set(s).add(id));
        return;
      }

      await dispatch(
        updateOrderCustomerProductRequest({
          orderId,
          OrderId: orderId,
          customerId,
          CustomerId: customerId,
          productId: pid,
          ProductID: pid,
          quantity: qty,
          Quantity: qty,
          orderCustomerProductId: ocpId,
          OrderCustomerProductId: ocpId,
          IdOrderCustomerProduct: ocpId,
        })
      );
      await dispatch(getOrderCustomerProductRequest?.());
    }
  };

  /* ───────── Montant de la modale ───────── */
  const calcModalAmount = () => {
    let sum = 0;
    for (const pid of Array.from(selectedProducts)) {
      const p = productsById.get(String(pid));
      const qty = clamp(quantities.get(String(pid)) ?? 1);
      sum += unitPrice(p) * qty;
    }
    return Number(sum.toFixed(2));
  };

  /* ───────── Attente de l'ID commande créé (polling store) ───────── */
  const waitForNewOrderId = async (customerId, beforeIdsSet, { attempts = 20, delay = 200 } = {}) => {
    for (let i = 0; i < attempts; i++) {
      // rafraîchit la liste côté store (au cas où ton add ne pousse pas directement la success en reducer)
      await dispatch(getOrderRequest?.());
      await sleep(delay);

      const state = store.getState();
      const allOrders = state?.orders?.orders || [];
      const afterForCustomer = allOrders.filter((o) => {
        const cid =
          o?.idCustomer ?? o?.customerId ?? o?.CustomerId ?? o?.customer?.id ?? null;
        return String(cid ?? "") === String(customerId ?? "");
      });

      // IDs actuels pour ce client
      const currentIds = afterForCustomer
        .map((o) => getId(o))
        .filter((x) => x != null)
        .map(String);

      // cherche un ID qui n'existait pas avant
      const newOne = currentIds.find((id) => !beforeIdsSet.has(String(id)));
      if (newOne) return newOne;
    }
    return null;
  };

  /* ───────── Création ───────── */
  const submitAdd = async (e) => {
    e.preventDefault();

    const chosen = new Set(selectedProducts);
    if (chosen.size === 0) {
      for (const [pid, q] of quantities.entries()) {
        if (Number(q) > 0) chosen.add(String(pid));
      }
    }

    if (!selectedCustomer || chosen.size === 0) {
      alert("Sélectionnez un client et au moins un produit.");
      return;
    }

    // snapshot des IDs de commandes EXISTANTS pour ce client
    const beforeOrdersForCustomer = orders.filter((o) => {
      const cid =
        o?.idCustomer ?? o?.customerId ?? o?.CustomerId ?? o?.customer?.id ?? null;
      return String(cid ?? "") === String(selectedCustomer);
    });
    const beforeIdsSet = new Set(
      beforeOrdersForCustomer.map((o) => String(getId(o))).filter(Boolean)
    );

    // montant prévu (pour l’order)
    const amount = Array.from(chosen).reduce((sum, pid) => {
      const p = productsById.get(String(pid));
      const qty = clamp(quantities.get(String(pid)) ?? 1);
      return sum + unitPrice(p) * qty;
    }, 0);

    // 1) créer l’order (ne retourne pas l’id côté composant)
    await dispatch(
      addOrderRequest({
        CustomerId: Number(selectedCustomer),
        PaymentMethod: payMethod,
        Status: status,
        Amount: Number(amount.toFixed(2)),
      })
    );

    // 2) attendre l’apparition de la nouvelle commande dans le store
    const newOrderId = await waitForNewOrderId(Number(selectedCustomer), beforeIdsSet, {
      attempts: 25,
      delay: 200,
    });

    if (!newOrderId) {
      alert("La commande a été créée mais son identifiant n’a pas été détecté. Rafraîchis la page et réessaie.");
      return;
    }

    // 3) ajouter les lignes avec l’ID détecté
    for (const pid of Array.from(chosen)) {
      const qty = clamp(quantities.get(String(pid)) ?? 1);
      await dispatch(
        addOrderCustomerProductRequest({
          OrderId: Number(newOrderId),
          CustomerId: Number(selectedCustomer),
          ProductId: Number(pid),
          Quantity: qty,
          // fallbacks
          IdOrder: Number(newOrderId),
          IdProduct: Number(pid),
        })
      );
    }

    await Promise.all([
      dispatch(getOrderRequest?.()),
      dispatch(getOrderCustomerProductRequest?.()),
    ]);
    close();
  };

  /* ───────── Édition commande (paiement/statut/montant) ───────── */
  const submitEdit = async (e) => {
    e.preventDefault();
    if (!modal.order) return;

    const orderId =
      modal.order?.id ?? modal.order?.Id ?? modal.order?.orderId ?? getId(modal.order);
    const customerId =
      modal.order?.idCustomer ??
      modal.order?.customerId ??
      modal.order?.CustomerId ??
      modal.order?.customer?.id ??
      null;

    const amount = calcModalAmount();

    await dispatch(
      updateOrderRequest({
        OrderId: orderId,
        CustomerId: customerId,
        Status: status,
        PaymentMethod: payMethod,
        Amount: amount,
        // fallbacks
        Id: orderId,
        Payment: payMethod,
        Total: amount,
      })
    );

    await dispatch(getOrderRequest?.());
    close();
  };

  /* ───────── Suppression commande ───────── */
  const handleDelete = async (order) => {
    if (!order) return;
    const label = order?.orderNo ?? order?.orderNumber ?? `#${getId(order)}`;
    if (!window.confirm(`Supprimer la commande ${label} ?`)) return;

    await dispatch(deleteOrderRequest(getId(order)));
    await Promise.all([
      dispatch(getOrderRequest?.()),
      dispatch(getOrderCustomerProductRequest?.()),
    ]);
  };

  /* ───────── Lignes du tableau (email corrigé) ───────── */
  const rows = useMemo(() => {
    return [...orders].map((o) => {
      const oid = String(getId(o));

      const cidFromOrder =
        o?.idCustomer ??
        o?.customerId ??
        o?.CustomerId ??
        getCustomerId(o?.customer);

      const customerFromMap =
        cidFromOrder != null ? customersById.get(String(cidFromOrder)) : undefined;

      const email =
        o?.customer?.email ??
        customerFromMap?.email ??
        o?.customerEmail ??
        o?.email ??
        "—";

      const num =
        o?.orderNo ?? o?.orderNumber ?? o?.number ?? o?.reference ?? `#${oid}`;
      const pay = o?.payment ?? o?.paymentMethod ?? "—";
      const st  = o?.status ?? o?.orderStatus ?? "—";
      const total = computeTotal(o);
      const prods = productsListForOrder(o);
      const date = new Date(o.date).toLocaleDateString();
      const amount = o?.amount;

      return { _raw: o, oid, email, num, pay, st, total, prods, date, amount };
    });
  }, [orders, customersById, computeTotal, productsListForOrder]);

  /* ───────── UI ───────── */
  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Commandes</h2>
        <button className="btn btn-success mt-5" onClick={openAdd}>
          Ajouter une commande
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>Client (email)</th>
              <th>N° commande</th>
              <th>Paiement</th>
              <th>Statut</th>
              <th>Montant</th>
              <th>Date</th>
              <th>Produits</th>
              <th style={{ width: 180 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center">Aucune commande.</td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.oid}>
                  <td>{r.email}</td>
                  <td>{r.num}</td>
                  <td>{r.pay}</td>
                  <td>{r.st}</td>
                  <td className="text-success fw-bold">{fmtMoney(r.amount)}</td>
                  <td>{r.date}</td>
                  <td style={{ whiteSpace: "pre-wrap" }}>
                    {r.prods.length ? r.prods.join(", ") : "—"}
                  </td>
                  <td className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => openEdit(r._raw)}
                      title="Modifier"
                    >
                      <i className="bi bi-pencil" />
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(r._raw)}
                      title="Supprimer"
                    >
                      <i className="bi bi-trash" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ─────────── Modal ─────────── */}
      {modal.open && (
        <div className="admin-modal-backdrop" role="presentation" onClick={close}>
          <div
            className="admin-modal-panel"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 980 }}
          >
            <h3 className="mb-3">
              {modal.mode === "add" ? "Ajouter une commande" : "Modifier la commande"}
            </h3>

            <form onSubmit={modal.mode === "add" ? submitAdd : submitEdit}>
              {/* Client */}
              <div className="mb-3">
                <label className="form-label">Client</label>
                {modal.mode === "add" ? (
                  <>
                    <input
                      className="form-control mb-2"
                      placeholder="Recherche (email / téléphone / nom)"
                      value={searchCust}
                      onChange={(e) => setSearchCust(e.target.value)}
                    />
                    <select
                      className="form-select"
                      value={String(selectedCustomer ?? "")}
                      onChange={(e) => setSelectedCustomer(e.target.value || "")}
                      required
                    >
                      <option value="">— Sélectionner —</option>
                      {filteredCustomers.map((c) => {
                        const cid = String(getCustomerId(c));
                        const label = (c?.email ?? c?.mail) || "email inconnu";
                        const phone = c?.phone ? ` • ${c.phone}` : "";
                        return (
                          <option key={cid} value={cid}>
                            {label}{phone}
                          </option>
                        );
                      })}
                    </select>
                  </>
                ) : (
                  <input
                    className="form-control"
                    disabled
                    value={modal.order?.customer?.email || "—"}
                  />
                )}
              </div>

              {/* Paiement + Statut */}
              <div className="row g-3">
                <div className="col-sm-6">
                  <label className="form-label">Mode de paiement</label>
                  <select
                    className="form-select"
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                  >
                    <option>Carte</option>
                    <option>PayPal</option>
                    <option>Virement</option>
                    <option>À la livraison</option>
                  </select>
                </div>
                <div className="col-sm-6">
                  <label className="form-label">Statut</label>
                  <select
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option>En attente</option>
                    <option>En cours</option>
                    <option>Expédiée</option>
                    <option>Livrée</option>
                    <option>Annulée</option>
                  </select>
                </div>
              </div>

              {/* Produits + Quantités */}
              <div className="mt-4">
                <div className="d-flex gap-2 align-items-end mb-2">
                  <div style={{ flex: 1 }}>
                    <label className="form-label">Catégorie</label>
                    <select
                      className="form-select"
                      value={cat}
                      onChange={(e) => setCat(e.target.value)}
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="form-label">Recherche produit</label>
                    <input
                      className="form-control"
                      placeholder="Nom/Marque/Modèle…"
                      value={searchProd}
                      onChange={(e) => setSearchProd(e.target.value)}
                    />
                  </div>
                </div>

                <div className="border rounded p-2" style={{ maxHeight: 380, overflow: "auto" }}>
                  {filteredProducts.length === 0 && (
                    <div className="text-muted">Aucun produit.</div>
                  )}

                  {filteredProducts.map((p) => {
                    const pid   = String(getId(p));
                    const checked = selectedProducts.has(pid);
                    const qty   = quantities.get(pid) ?? 1;
                    const u     = unitPrice(p);
                    const total = u * qty;

                    return (
                      <div
                        key={pid}
                        className="d-flex align-items-center justify-content-between py-1"
                        style={{ gap: 12 }}
                      >
                        <label
                          className="d-flex align-items-center"
                          style={{ cursor: "pointer", gap: 8, flex: 1 }}
                        >
                          <input
                            type="checkbox"
                            className="form-check-input me-2"
                            checked={checked}
                            onChange={() => toggleProduct(pid)}
                          />
                          <span>
                            {labelForProduct(p)}{" "}
                            {u > 0 && <small className="text-muted">— {fmtMoney(u)}</small>}
                          </span>
                        </label>

                        <div className="d-flex align-items-center" style={{ gap: 8 }}>
                          <input
                            type="number"
                            min={1}
                            className="form-control"
                            value={qty}
                            onChange={(e) => changeQty(pid, e.target.value)}
                            style={{ width: 90 }}
                          />
                          <div style={{ minWidth: 110, textAlign: "right", fontWeight: 700 }}>
                            {fmtMoney(total)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {modal.mode === "edit" && (
                  <p className="text-muted mt-1" style={{ fontSize: 12 }}>
                    Décocher un produit le supprime immédiatement de la commande.
                    Modifier la quantité met à jour la ligne instantanément.
                  </p>
                )}
              </div>

              <div className="d-flex justify-content-end mt-3">
                <button type="button" className="btn btn-secondary me-2" onClick={close}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-dark">
                  {modal.mode === "add" ? "Créer la commande" : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
