import { actionsOrder } from "../actions/OrderActions";

const initialState = {
    orders: [],
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