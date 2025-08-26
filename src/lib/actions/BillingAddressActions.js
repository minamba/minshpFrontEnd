export const actionsBillingAddress = {
    GET_BILLING_ADDRESS_REQUEST : "GET_BILLING_ADDRESS_REQUEST",
    GET_BILLING_ADDRESS_SUCCESS : "GET_BILLING_ADDRESS_SUCCESS",
    GET_BILLING_ADDRESS_FAILURE : "GET_BILLING_ADDRESS_FAILURE",

    UPDATE_BILLING_ADDRESS_REQUEST : "UPDATE_BILLING_ADDRESS_REQUEST",
    UPDATE_BILLING_ADDRESS_SUCCESS : "UPDATE_BILLING_ADDRESS_SUCCESS",
    UPDATE_BILLING_ADDRESS_FAILURE : "UPDATE_BILLING_ADDRESS_FAILURE",

    DELETE_BILLING_ADDRESS_REQUEST : "DELETE_BILLING_ADDRESS_REQUEST",
    DELETE_BILLING_ADDRESS_SUCCESS : "DELETE_BILLING_ADDRESS_SUCCESS",
    DELETE_BILLING_ADDRESS_FAILURE : "DELETE_BILLING_ADDRESS_FAILURE",

    ADD_BILLING_ADDRESS_REQUEST : "ADD_BILLING_ADDRESS_REQUEST",
    ADD_BILLING_ADDRESS_SUCCESS : "ADD_BILLING_ADDRESS_SUCCESS",
    ADD_BILLING_ADDRESS_FAILURE : "ADD_BILLING_ADDRESS_FAILURE",
}


//get
export function getBillingAddressRequest() {
    return {
        type: actionsBillingAddress.GET_BILLING_ADDRESS_REQUEST,
    }
}

export function getBillingAddressSuccess(billingAddress) {
    return {
        type: actionsBillingAddress.GET_BILLING_ADDRESS_SUCCESS,
        payload: billingAddress,
    }
}

export function getBillingAddressFailure(error) {
    return {
        type: actionsBillingAddress.GET_BILLING_ADDRESS_FAILURE,
        payload: error,
    }
}


//update
export function updateBillingAddressRequest(billingAddress) {
    return {
        type: actionsBillingAddress.UPDATE_BILLING_ADDRESS_REQUEST,
        payload: billingAddress,
    }
}

export function updateBillingAddressSuccess(billingAddress) {
    return {
        type: actionsBillingAddress.UPDATE_BILLING_ADDRESS_SUCCESS,
        payload: billingAddress,
    }
}

export function updateBillingAddressFailure(error) {
    return {
        type: actionsBillingAddress.UPDATE_BILLING_ADDRESS_FAILURE,
        payload: error,
    }
}


//delete
export function deleteBillingAddressRequest(IdBillingAddress) {
    return {
        type: actionsBillingAddress.DELETE_BILLING_ADDRESS_REQUEST,
        payload: IdBillingAddress,
    }
}

export function deleteBillingAddressSuccess(IdBillingAddress) {
    return {
        type: actionsBillingAddress.DELETE_BILLING_ADDRESS_SUCCESS,
        payload: IdBillingAddress,
    }
}

export function deleteBillingAddressFailure(error) {
    return {
        type: actionsBillingAddress.DELETE_BILLING_ADDRESS_FAILURE,
        payload: error,
    }
}


//add
export function addBillingAddressRequest(billingAddress) {
    return {
        type: actionsBillingAddress.ADD_BILLING_ADDRESS_REQUEST,
        payload: billingAddress,
    }
}

export function addBillingAddressSuccess(billingAddress) {
    return {
        type: actionsBillingAddress.ADD_BILLING_ADDRESS_SUCCESS,
        payload: billingAddress,
    }
}

export function addBillingAddressFailure(error) {
    return {
        type: actionsBillingAddress.ADD_BILLING_ADDRESS_FAILURE,
        payload: error,
    }
}

