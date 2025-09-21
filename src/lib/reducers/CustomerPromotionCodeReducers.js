import { actionsCustomerPromotionCode } from "../actions/CustomerPromotionCodeActions";

const initialState = {
    customerPromotionCodes: [],
    addCustomerPromotionCodeSuccess: false,
    addCustomerPromotionCodeError: null,
    updateCustomerPromotionCodeSuccess: false,
    updateCustomerPromotionCodeError: null,
    deleteCustomerPromotionCodeSuccess: false,
    deleteCustomerPromotionCodeError: null,
    error: null,
}

export default function customerPromotionCodeReducer(state = initialState, action) {
    switch (action.type) {

        case actionsCustomerPromotionCode.GET_CUSTOMER_PROMOTION_CODE_SUCCESS:
            return {
                ...state,
                customerPromotionCodes: action.payload.customerPromotionCodes,
            }

        case actionsCustomerPromotionCode.ADD_CUSTOMER_PROMOTION_CODE_SUCCESS:
            return {...state.customerPromotionCodes, ...action.payload.customerPromotionCode}
  

        case actionsCustomerPromotionCode.UPDATE_CUSTOMER_PROMOTION_CODE_SUCCESS:
            state.customerPromotionCodes.map(customerPromotionCode => {
                    if(customerPromotionCode.id === action.payload.id)
                        return {...customerPromotionCode, ...action.payload.customerPromotionCode}
                    else
                        return customerPromotionCode
                })

        case actionsCustomerPromotionCode.DELETE_CUSTOMER_PROMOTION_CODE_SUCCESS:
            return state.customerPromotionCodes.filter(customerPromotionCode => customerPromotionCode.id !== action.payload.id)

        default:
            return state
    }
}