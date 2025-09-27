import { actionsOrder } from "../actions/OrderActions";

const initialState = {
    orders: [],

    // liste paginée (admin)
    items: [],
    page: 1,
    pageSize: 20,
    totalCount: 0,


    addOrderSuccess: false,
    addOrderError: null,
    updateOrderSuccess: false,
    updateOrderError: null,
    deleteOrderSuccess: false,
    deleteOrderError: null,
    error: null,
}

export default function orderReducer(state = initialState, action) {
    switch (action.type) {
          /* ---------------- PAGES (ADMIN) ---------------- */
            case actionsOrder.GET_ORDER_PAGED_USER_REQUEST:
              return {
                ...state,
                loading: true,
                error: null,
                // reset flags d’édition pour éviter des affichages “fantômes”
                addOrderSuccess: false,
                updateOrderSuccess: false,
                deleteOrderSuccess: false,
                addOrderError: null,
                updateOrderError: null,
                deleteOrderError: null,
                items: [],
                totalCount: 0,
              };
        
            case actionsOrder.GET_ORDER_PAGED_USER_SUCCESS:
              return {
                ...state,
                loading: false,
                items: Array.isArray(action.payload?.items) ? action.payload.items : [],
                totalCount: action.payload?.totalCount ?? 0,
                page: action.payload?.page ?? 1,
                pageSize: action.payload?.pageSize ?? state.pageSize,
                error: null,
              };
        
            case actionsOrder.GET_ORDER_PAGED_USER_FAILURE:
              return {
                ...state,
                loading: false,
                error: action.payload?.error || "Erreur chargement (paged)",
              };


        case actionsOrder.GET_ORDER_SUCCESS:
            return {
                ...state,
                orders: action.payload.orders,
            }

        case actionsOrder.ADD_ORDER_SUCCESS:
            return {...state.orders, ...action.payload.order}
  

        case actionsOrder.UPDATE_ORDER_SUCCESS:
            state.orders.map(order => {
                    if(order.id === action.payload.id)
                        return {...order, ...action.payload.order}
                    else
                        return order
                })

        case actionsOrder.DELETE_ORDER_SUCCESS:
            return state.orders.filter(order => order.id !== action.payload.id)

        case actionsOrder.DOWNLOAD_ORDER_INVOICE_FAILURE:
            return { ...state, error: action.payload };

        default:
            return state
    }
}