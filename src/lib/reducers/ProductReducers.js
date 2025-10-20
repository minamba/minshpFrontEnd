import { actionsProduct } from "../actions/ProductActions";

const initialState = {
  // liste “complète”
  products: [],

  // liste paginée (admin)
  items: [],
  page: 1,
  pageSize: 20,
  totalCount: 0,

  // états
  loading: false,
  error: null,

  addProductSuccess: false,
  addProductError: null,
  updateProductSuccess: false,
  updateProductError: null,
  deleteProductSuccess: false,
  deleteProductError: null,
};

export default function productReducer(state = initialState, action) {
  switch (action.type) {
    /* ---------------- PAGES (ADMIN) ---------------- */
    case actionsProduct.GET_PRODUCT_PAGED_USER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        // reset flags d’édition pour éviter des affichages “fantômes”
        addProductSuccess: false,
        updateProductSuccess: false,
        deleteProductSuccess: false,
        addProductError: null,
        updateProductError: null,
        deleteProductError: null,
        items: [],
        totalCount: 0,
      };

    case actionsProduct.GET_PRODUCT_PAGED_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        items: Array.isArray(action.payload?.items) ? action.payload.items : [],
        totalCount: action.payload?.totalCount ?? 0,
        page: action.payload?.page ?? 1,
        pageSize: action.payload?.pageSize ?? state.pageSize,
        error: null,
      };

    case actionsProduct.GET_PRODUCT_PAGED_USER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload?.error || "Erreur chargement (paged)",
      };

    /* ---------------- LISTE COMPLÈTE ---------------- */
    case actionsProduct.GET_PRODUCT_USER_REQUEST:
      return { ...state, loading: true, error: null };

    case actionsProduct.GET_PRODUCT_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        products: Array.isArray(action.payload?.products)
          ? action.payload.products
          : (Array.isArray(action.payload) ? action.payload : []),
        error: null,
      };

    case actionsProduct.GET_PRODUCT_USER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload?.error || "Erreur chargement (full)",
      };

    /* ---------------- ADD ---------------- */
    case actionsProduct.ADD_PRODUCT_USER_REQUEST:
      return { ...state, addProductSuccess: false, addProductError: null };

    case actionsProduct.ADD_PRODUCT_USER_SUCCESS:
      return {
        ...state,
        products: [
          ...(Array.isArray(state.products) ? state.products : []),
          action.payload?.product,
        ],
        addProductSuccess: true,
        addProductError: null,
      };

    case actionsProduct.ADD_PRODUCT_USER_FAILURE:
      return {
        ...state,
        addProductSuccess: false,
        addProductError: action.payload?.error || "Erreur ajout",
      };

    /* ---------------- UPDATE ---------------- */
    case actionsProduct.UPDATE_PRODUCT_USER_REQUEST:
      return { ...state, updateProductSuccess: false, updateProductError: null };

    case actionsProduct.UPDATE_PRODUCT_USER_SUCCESS: {
      const updated = action.payload?.product || action.payload; // selon ta saga
      const upId = updated?.id;

      return {
        ...state,
        products: (Array.isArray(state.products) ? state.products : []).map((p) =>
          p.id === upId ? { ...p, ...updated } : p
        ),
        items: (Array.isArray(state.items) ? state.items : []).map((p) =>
          p.id === upId ? { ...p, ...updated } : p
        ),
        updateProductSuccess: true,
        updateProductError: null,
      };
    }

    case actionsProduct.UPDATE_PRODUCT_USER_FAILURE:
      return {
        ...state,
        updateProductSuccess: false,
        updateProductError: action.payload?.error || "Erreur mise à jour",
      };

    /* ---------------- DELETE ---------------- */
    case actionsProduct.DELETE_PRODUCT_USER_REQUEST:
      return { ...state, deleteProductSuccess: false, deleteProductError: null };

    case actionsProduct.DELETE_PRODUCT_USER_SUCCESS:
      return {
        ...state,
        products: (Array.isArray(state.products) ? state.products : []).filter(
          (p) => p.id !== action.payload
        ),
        items: (Array.isArray(state.items) ? state.items : []).filter(
          (p) => p.id !== action.payload
        ),
        deleteProductSuccess: true,
        deleteProductError: null,
      };

    case actionsProduct.DELETE_PRODUCT_USER_FAILURE:
      return {
        ...state,
        deleteProductSuccess: false,
        deleteProductError: action.payload?.error || "Erreur suppression",
      };

    /* ---------------- DEFAULT ---------------- */
    default:
      return state;
  }
}
