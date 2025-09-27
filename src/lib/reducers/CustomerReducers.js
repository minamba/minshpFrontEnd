// src/lib/reducers/customers.js
import { actionsCustomer } from "../actions/CustomerActions";

const initialState = {
  // plein (non paginé)
  customers: [],

  // paginé (admin)
  items: [],
  totalCount: 0,
  page: 1,
  pageSize: 20,

  // critères courants pour re-fetch après mutation
  paging: { page: 1, pageSize: 20, search: "", sort: "LastName:asc", filter: {} },

  // flags
  loading: false,
  error: null,

  addCustomerSuccess: false,
  addCustomerError: null,
  updateCustomerSuccess: false,
  updateCustomerError: null,
  deleteCustomerSuccess: false,
  deleteCustomerError: null,

  // tick pour forcer le rendu si référence identique
  rev: 0,
};

export default function customerReducer(state = initialState, action) {
  switch (action.type) {
    /* ========== PLEIN (non paginé) ========== */
    case actionsCustomer.GET_CUSTOMER_REQUEST:
      return { ...state, loading: true, error: null };

    case actionsCustomer.GET_CUSTOMER_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        customers: Array.isArray(action.payload?.customers) ? action.payload.customers.slice() : [],
        rev: state.rev + 1,
      };

    case actionsCustomer.GET_CUSTOMER_FAILURE:
      return { ...state, loading: false, error: action.payload || "Erreur de chargement (plein)" };

    /* ========== PAGINÉ (admin) ========== */
    case actionsCustomer.GET_PAGED_CUSTOMER_REQUEST: {
      const req = action.payload || {};
      return {
        ...state,
        loading: true,
        error: null,
        paging: { ...state.paging, ...req }, // mémorise les critères demandés
      };
    }

    case actionsCustomer.GET_PAGED_CUSTOMER_SUCCESS: {
      const { items, totalCount, page, pageSize, paging } = action.payload || {};
      return {
        ...state,
        loading: false,
        error: null,
        items: Array.isArray(items) ? items.slice() : [],
        totalCount: Number(totalCount || 0),
        page: Number(page || state.page),
        pageSize: Number(pageSize || state.pageSize),
        paging: paging ? { ...paging } : state.paging,
        rev: state.rev + 1,
      };
    }

    case actionsCustomer.GET_PAGED_CUSTOMER_FAILURE:
      return { ...state, loading: false, error: action.payload || "Erreur paginée" };

    /* ========== ADD ========== */
    case actionsCustomer.ADD_CUSTOMER_REQUEST:
      return { ...state, addCustomerSuccess: false, addCustomerError: null, loading: true };

    case actionsCustomer.ADD_CUSTOMER_SUCCESS: {
      // Optionnel: tu rafraîchis via saga derrière → pas besoin d’injecter ici.
      // On met juste le flag à true.
      return { ...state, loading: false, addCustomerSuccess: true, addCustomerError: null };
    }

    case actionsCustomer.ADD_CUSTOMER_FAILURE:
      return { ...state, loading: false, addCustomerSuccess: false, addCustomerError: action.payload };

    /* ========== UPDATE ========== */
    case actionsCustomer.UPDATE_CUSTOMER_REQUEST:
      return { ...state, updateCustomerSuccess: false, updateCustomerError: null, loading: true };

    case actionsCustomer.UPDATE_CUSTOMER_SUCCESS: {
      // Comme ta saga re-fetch, on ne “patch” pas localement.
      return { ...state, loading: false, updateCustomerSuccess: true, updateCustomerError: null };
    }

    case actionsCustomer.UPDATE_CUSTOMER_FAILURE:
      return { ...state, loading: false, updateCustomerSuccess: false, updateCustomerError: action.payload };

    /* ========== DELETE ========== */
    case actionsCustomer.DELETE_CUSTOMER_REQUEST:
      return { ...state, deleteCustomerSuccess: false, deleteCustomerError: null, loading: true };

    case actionsCustomer.DELETE_CUSTOMER_SUCCESS: {
      // Idem: saga re-fetch derrière.
      return { ...state, loading: false, deleteCustomerSuccess: true, deleteCustomerError: null };
    }

    case actionsCustomer.DELETE_CUSTOMER_FAILURE:
      return { ...state, loading: false, deleteCustomerSuccess: false, deleteCustomerError: action.payload };

    default:
      return state;
  }
}
