export const actionsShipping = {
    GET_RATES_REQUEST : "GET_RATES_REQUEST",
    GET_RATES_SUCCESS : "GET_RATES_SUCCESS",
    GET_RATES_FAILURE : "GET_RATES_FAILURE",

    GET_RELAYS_REQUEST : "GET_RELAYS_REQUEST",
    GET_RELAYS_SUCCESS : "GET_RELAYS_SUCCESS",
    GET_RELAYS_FAILURE : "GET_RELAYS_FAILURE",

    GET_RELAYS_BY_ADDRESS_REQUEST : "GET_RELAYS_BY_ADDRESS_REQUEST",
    GET_RELAYS_BY_ADDRESS_SUCCESS : "GET_RELAYS_BY_ADDRESS_SUCCESS",
    GET_RELAYS_BY_ADDRESS_FAILURE : "GET_RELAYS_BY_ADDRESS_FAILURE",

    CREATE_SHIPMENT_REQUEST : "CREATE_SHIPMENT_REQUEST",
    CREATE_SHIPMENT_SUCCESS : "CREATE_SHIPMENT_SUCCESS",
    CREATE_SHIPMENT_FAILURE : "CREATE_SHIPMENT_FAILURE"
}


export function getShippingRatesRequest(params) {
    return {
        type: actionsShipping.GET_RATES_REQUEST,
        payload: params,
    }
}

export function getShippingRatesSuccess(rates) {
    return {
        type: actionsShipping.GET_RATES_SUCCESS,
        payload: rates,
    }
}

export function getShippingRatesFailure(error) {
    return {
        type: actionsShipping.GET_RATES_FAILURE,
        payload: error,
    }
}

export function getRelaysRequest(params) {
    return {
        type: actionsShipping.GET_RELAYS_REQUEST,
        payload: params,
    }
}

export function getRelaysSuccess(relays) {
    return {
        type: actionsShipping.GET_RELAYS_SUCCESS,
        payload: relays,
    }
}

export function getRelaysFailure(error) {
    return {
        type: actionsShipping.GET_RELAYS_FAILURE,
        payload: error,
    }
}

export function createShipmentRequest(orderId, body) {
    return {
        type: actionsShipping.CREATE_SHIPMENT_REQUEST,
        payload: { orderId, body },
    }


}

export function createShipmentSuccess(shipment) {
    return {
        type: actionsShipping.CREATE_SHIPMENT_SUCCESS,
        payload: shipment,
    }
}

export function createShipmentFailure(error) {
    return {
        type: actionsShipping.CREATE_SHIPMENT_FAILURE,
        payload: error,
    }
}

export function getRelaysByAddressRequest(params) {
    return {
        type: actionsShipping.GET_RELAYS_BY_ADDRESS_REQUEST,
        payload: params,
    }
}

export function getRelaysByAddressSuccess(relays) {
    return {
        type: actionsShipping.GET_RELAYS_BY_ADDRESS_SUCCESS,
        payload: relays,
    }
}

export function getRelaysByAddressFailure(error) {
    return {
        type: actionsShipping.GET_RELAYS_BY_ADDRESS_FAILURE,
        payload: error,
    }
}

