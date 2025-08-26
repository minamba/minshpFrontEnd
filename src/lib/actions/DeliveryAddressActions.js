export const actionsDeliveryAddress = {
    GET_DELIVERY_ADDRESS_REQUEST : "GET_DELIVERY_ADDRESS_REQUEST",
    GET_DELIVERY_ADDRESS_SUCCESS : "GET_DELIVERY_ADDRESS_SUCCESS",
    GET_DELIVERY_ADDRESS_FAILURE : "GET_DELIVERY_ADDRESS_FAILURE",

    UPDATE_DELIVERY_ADDRESS_REQUEST : "UPDATE_DELIVERY_ADDRESS_REQUEST",
    UPDATE_DELIVERY_ADDRESS_SUCCESS : "UPDATE_DELIVERY_ADDRESS_SUCCESS",
    UPDATE_DELIVERY_ADDRESS_FAILURE : "UPDATE_DELIVERY_ADDRESS_FAILURE",

    DELETE_DELIVERY_ADDRESS_REQUEST : "DELETE_DELIVERY_ADDRESS_REQUEST",
    DELETE_DELIVERY_ADDRESS_SUCCESS : "DELETE_DELIVERY_ADDRESS_SUCCESS",
    DELETE_DELIVERY_ADDRESS_FAILURE : "DELETE_DELIVERY_ADDRESS_FAILURE",

    ADD_DELIVERY_ADDRESS_REQUEST : "ADD_DELIVERY_ADDRESS_REQUEST",
    ADD_DELIVERY_ADDRESS_SUCCESS : "ADD_DELIVERY_ADDRESS_SUCCESS",
    ADD_DELIVERY_ADDRESS_FAILURE : "ADD_DELIVERY_ADDRESS_FAILURE",
}


//get
export function getDeliveryAddressRequest() {
    return {
        type: actionsDeliveryAddress.GET_DELIVERY_ADDRESS_REQUEST,
    }
}

export function getDeliveryAddressSuccess(deliveryAddress) {
    return {
        type: actionsDeliveryAddress.GET_DELIVERY_ADDRESS_SUCCESS,
        payload: deliveryAddress,
    }
}

export function getDeliveryAddressFailure(error) {
    return {
        type: actionsDeliveryAddress.GET_DELIVERY_ADDRESS_FAILURE,
        payload: error,
    }
}


//update
export function updateDeliveryAddressRequest(deliveryAddress) {
    return {
        type: actionsDeliveryAddress.UPDATE_DELIVERY_ADDRESS_REQUEST,
        payload: deliveryAddress,
    }
}

export function updateDeliveryAddressSuccess(deliveryAddress) {
    return {
        type: actionsDeliveryAddress.UPDATE_DELIVERY_ADDRESS_SUCCESS,
        payload: deliveryAddress,
    }
}

export function updateDeliveryAddressFailure(error) {
    return {
        type: actionsDeliveryAddress.UPDATE_DELIVERY_ADDRESS_FAILURE,
        payload: error,
    }
}


//delete
export function deleteDeliveryAddressRequest(IdDeliveryAddress) {
    return {
        type: actionsDeliveryAddress.DELETE_DELIVERY_ADDRESS_REQUEST,
        payload: IdDeliveryAddress,
    }
}

export function deleteDeliveryAddressSuccess(IdDeliveryAddress) {
    return {
        type: actionsDeliveryAddress.DELETE_DELIVERY_ADDRESS_SUCCESS,
        payload: IdDeliveryAddress,
    }
}

export function deleteDeliveryAddressFailure(error) {
    return {
        type: actionsDeliveryAddress.DELETE_DELIVERY_ADDRESS_FAILURE,
        payload: error,
    }
}


//add
export function addDeliveryAddressRequest(deliveryAddress) {
    return {
        type: actionsDeliveryAddress.ADD_DELIVERY_ADDRESS_REQUEST,
        payload: deliveryAddress,
    }
}

export function addDeliveryAddressSuccess(deliveryAddress) {
    return {
        type: actionsDeliveryAddress.ADD_DELIVERY_ADDRESS_SUCCESS,
        payload: deliveryAddress,
    }
}

export function addDeliveryAddressFailure(error) {
    return {
        type: actionsDeliveryAddress.ADD_DELIVERY_ADDRESS_FAILURE,
        payload: error,
    }
}

