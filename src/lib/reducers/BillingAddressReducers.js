import { actionsBillingAddress } from "../actions/BillingAddressActions";

const initialState = {
    billingAddresses: [],
    addBillingAddressSuccess: false,
    addBillingAddressError: null,
    updateBillingAddressSuccess: false,
    updateBillingAddressError: null,
    deleteBillingAddressSuccess: false,
    deleteBillingAddressError: null,
    error: null,
}

export default function billingAddressReducer(state = initialState, action) {
    switch (action.type) {

        case actionsBillingAddress.GET_BILLING_ADDRESS_SUCCESS:
            return {
                ...state,
                billingAddresses: action.payload.billingAddresses,
            }

        case actionsBillingAddress.ADD_BILLING_ADDRESS_SUCCESS:
            return {...state.billingAddresses, ...action.payload.billingAddress}
  

        case actionsBillingAddress.UPDATE_BILLING_ADDRESS_SUCCESS:
            state.billingAddresses.map(billingAddress => {
                    if(billingAddress.id === action.payload.id)
                        return {...billingAddress, ...action.payload.billingAddress}
                    else
                        return billingAddress
                })

        case actionsBillingAddress.DELETE_BILLING_ADDRESS_SUCCESS:
            return state.billingAddresses.filter(billingAddress => billingAddress.id !== action.payload.id)

        default:
            return state
    }
}