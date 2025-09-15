// src/hooks/useCartPriceSync.js
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateCartRequest, getCartRequest } from "../lib/actions/CartActions";
import { calculPrice } from "../lib/utils/Helpers";

const nearlyEqual = (a, b, eps = 1e-3) => Math.abs(Number(a) - Number(b)) <= eps;

export default function useCartPriceSync() {
  const dispatch = useDispatch();
  const products = useSelector((s) => s.products?.products) || [];
  const items    = useSelector((s) => s.items?.items)       || [];

  useEffect(() => {
    const ls = JSON.parse(localStorage.getItem("items") || "[]");
    if (!Array.isArray(ls) || ls.length === 0) return;

    const byId = new Map(items.map(i => [String(i.id ?? i.productId), i]));
    let changed = false;

    for (const it of ls) {
      const pid  = it.productId ?? it.id;
      const prod = products.find(p => String(p.id) === String(pid));
      if (!prod) continue;

      const newPrice = Number(calculPrice(prod));
      if (!nearlyEqual(it.price, newPrice)) {
        changed = true;
        const inStore = byId.get(String(pid));
        if (inStore) {
          const qty = inStore?.qty ?? 1;
          dispatch(updateCartRequest({ ...inStore, id: inStore.id ?? inStore.productId, price: newPrice }, qty));
        }
        it.price = newPrice; // update LS copy
      }
    }

    if (changed) {
      localStorage.setItem("items", JSON.stringify(ls));
      dispatch(getCartRequest());
    }
  }, [products, dispatch]);
}
