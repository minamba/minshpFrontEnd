// reducers/CartReducers.js
import { actionsCart } from "../actions/CartActions";


const saveToLocalStorage = (items) => {
  localStorage.setItem("items", JSON.stringify(items));
};
const initialState = {
  items: JSON.parse(localStorage.getItem("items") || "[]"),
};

export default function cartReducer(state = initialState, action) {
  switch (action.type) {

    case actionsCart.GET_CART_SUCCESS:
      return { ...state, items: action.payload || [] };

    // ------- ADD -------
    case actionsCart.ADD_TO_CART_SUCCESS: {
      const { item, quantity } = action.payload || {};
      const q = Math.max(1, Number(quantity || 1));
      if (!item || !item.id) return state;

      const exists = state.items.find(it => it.id === item.id);
      const nextItems = exists
        ? state.items.map(it =>
            it.id === item.id ? { ...it, qty: (it.qty || 0) + q } : it
          )
        : [
            ...state.items,
            {
              id: item.id,
              title: item.name || item.title || "Produit",
              price: Number(item.price) || 0,
              qty: q,
              image: item.image || item.url || null,
              packageProfil: item.packageProfil,
              containedCode: item.containedCode,
            },
          ];

      return { ...state, items: nextItems };
    }

    // ------- UPDATE QTY -------
    case actionsCart.UPDATE_CART_SUCCESS: {
      const { item, quantity } = action.payload || {};
      const id = item?.id ?? action.payload?.id;
      const q = Math.max(1, Number(quantity || 1));
      const pr = item.price;
      if (!id) return state;

      const nextItems = state.items.map(it =>
        it.id === id ? { ...it, qty: q, price : pr } : it
      );
      return { ...state, items: nextItems };
    }

    // ------- DELETE -------
    case actionsCart.DELETE_FROM_CART_SUCCESS: {
      const id = action.payload?.id ?? action.payload;
      if (!id) return state;
      const nextItems = state.items.filter(it => it.id !== id);
      return { ...state, items: nextItems };
    }

    // ------- SAVE ---------
    case actionsCart.SAVE_CART_SUCCESS: {
     saveToLocalStorage(action.payload)
      return { ...state, items : action.payload || [] };
    }

    default:
      return state;
  }
}
