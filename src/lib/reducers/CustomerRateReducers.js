import { actionsCustomerRate } from "../actions/CustomerRateActions";

const initialState = {
    customerRates: [],
    addCustomerRateSuccess: false,
    addCustomerRateError: null,
    updateCustomerRateSuccess: false,
    updateCustomerRateError: null,
    deleteCustomerRateSuccess: false,
    deleteCustomerRateError: null,
    error: null,
}

export default function CustomerRateReducer(state = initialState, action) {
    switch (action.type) {

        case actionsCustomerRate.GET_CUSTOMER_RATE_SUCCESS:
            return {
                ...state,
                customerRates: action.payload.customerRates,
            }

        case actionsCustomerRate.ADD_CUSTOMER_RATE_SUCCESS:
            return {...state.customerRates, ...action.payload.customerRate}
  

        case actionsCustomerRate.UPDATE_CUSTOMER_RATE_SUCCESS:
            state.customerRates.map(customerRate => {
                    if(customerRate.id === action.payload.id)
                        return {...customerRate, ...action.payload.customerRate}
                    else
                        return customerRate
                })

        case actionsCustomerRate.DELETE_CUSTOMER_RATE_SUCCESS:
            return state.customerRates.filter(customerRate => customerRate.id !== action.payload.id)

        default:
            return state
    }
}