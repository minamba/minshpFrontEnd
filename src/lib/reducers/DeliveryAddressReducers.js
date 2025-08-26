import { actionsDeliveryAddress } from "../actions/DeliveryAddressActions";

const initialState = {
    deliveryAddresses: [],
    addDeliveryAddressSuccess: false,
    addDeliveryAddressError: null,
    updateDeliveryAddressSuccess: false,
    updateDeliveryAddressError: null,
    deleteDeliveryAddressSuccess: false,
    deleteDeliveryAddressError: null,
    error: null,
}

export default function deliveryAddressReducer(state = initialState, action) {
    switch (action.type) {

        case actionsDeliveryAddress.GET_DELIVERY_ADDRESS_SUCCESS:
            return {
                ...state,
                deliveryAddresses: action.payload.deliveryAddresses,
            }

        case actionsDeliveryAddress.ADD_DELIVERY_ADDRESS_SUCCESS:
            return {...state.deliveryAddresses, ...action.payload.deliveryAddress}
  

        case actionsDeliveryAddress.UPDATE_DELIVERY_ADDRESS_SUCCESS:
            state.deliveryAddresses.map(deliveryAddress => {
                    if(deliveryAddress.id === action.payload.id)
                        return {...deliveryAddress, ...action.payload.deliveryAddress}
                    else
                        return deliveryAddress
                })

        case actionsDeliveryAddress.DELETE_DELIVERY_ADDRESS_SUCCESS:
            return state.deliveryAddresses.filter(deliveryAddress => deliveryAddress.id !== action.payload.id)

        default:
            return state
    }
}