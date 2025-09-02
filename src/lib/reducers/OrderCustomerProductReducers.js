import { actionsOrderCustomerProduct } from "../actions/OrderCustomerProductActions";

const initialState = {
    orderProducts: [],
    addOrderCustomerProductSuccess: false,
    addOrderCustomerProductError: null,
    updateOrderCustomerProductSuccess: false,
    updateOrderCustomerProductError: null,
    deleteOrderCustomerProductSuccess: false,
    deleteOrderCustomerProductError: null,
    error: null,
}

export default function orderCustomerProductReducer(state = initialState, action) {
    switch (action.type) {

        case actionsOrderCustomerProduct.GET_ORDER_CUSTOMER_PRODUCT_SUCCESS:
            return {
                ...state,
                orderProducts: action.payload.orderProducts,
            }

        case actionsOrderCustomerProduct.ADD_ORDER_CUSTOMER_PRODUCT_SUCCESS:
            return {...state.orderProducts, ...action.payload.orderProduct}
  

        case actionsOrderCustomerProduct.UPDATE_ORDER_CUSTOMER_PRODUCT_SUCCESS:
            state.orderProducts.map(orderProduct => {
                    if(orderProduct.id === action.payload.id)
                        return {...orderProduct, ...action.payload.orderProduct}
                    else
                        return orderProduct
                })

        case actionsOrderCustomerProduct.DELETE_ORDER_CUSTOMER_PRODUCT_SUCCESS:
            return state.orderProducts.filter(orderProduct => orderProduct.id !== action.payload.orderProduct.id)

        default:
            return state
    }
}