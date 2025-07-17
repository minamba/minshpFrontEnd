import { actionsCustomer } from "../actions/CustomerActions";

const initialState = {
    customers: [],
    addCustomerSuccess: false,
    addCustomerError: null,
    updateCustomerSuccess: false,
    updateCustomerError: null,
    deleteCustomerSuccess: false,
    deleteCustomerError: null,
    error: null,
}

export default function customerReducer(state = initialState, action) {
    switch (action.type) {

        case actionsCustomer.GET_CUSTOMER_SUCCESS:
            return {
                ...state,
                customers: action.payload.customers,
            }

        case actionsCustomer.ADD_CUSTOMER_SUCCESS:
            return {...state.customers, ...action.payload.customer}
  

        case actionsCustomer.UPDATE_CUSTOMER_SUCCESS:
            state.customers.map(customer => {
                    if(customer.id === action.payload.id)
                        return {...customer, ...action.payload.customer}
                    else
                        return customer
                })

        case actionsCustomer.DELETE_CUSTOMER_SUCCESS:
            return state.customers.filter(customer => customer.id !== action.payload.id)

        default:
            return state
    }
}