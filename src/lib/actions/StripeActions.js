export const actionsStripe = {
    CREATE_CHECKOUT_SESSION_REQUEST : "CREATE_CHECKOUT_SESSION_REQUEST",
    CREATE_CHECKOUT_SESSION_SUCCESS : "CREATE_CHECKOUT_SESSION_SUCCESS",
    CREATE_CHECKOUT_SESSION_FAILURE : "CREATE_CHECKOUT_SESSION_FAILURE",

    CONFIRM_CHECKOUT_REQUEST : "CONFIRM_CHECKOUT_REQUEST",
    CONFIRM_CHECKOUT_SUCCESS : "CONFIRM_CHECKOUT_SUCCESS",
    CONFIRM_CHECKOUT_FAILURE : "CONFIRM_CHECKOUT_FAILURE",
}


//create 
export function createCheckoutSessionRequest() {
    return {
        type: actionsStripe.CREATE_CHECKOUT_SESSION_REQUEST,
    }
}

export function createCheckoutSessionSuccess(PaymentData) {
    return {
        type: actionsStripe.CREATE_CHECKOUT_SESSION_SUCCESS,
        payload: PaymentData,
    }
}

export function createCheckoutSessionFailure(error) {
    return {
        type: actionsStripe.CREATE_CHECKOUT_SESSION_FAILURE,
        payload: error,
    }
}


//confirm
export function confirmCheckoutSessionRequest() {
    return {
        type: actionsStripe.CONFIRM_CHECKOUT_REQUEST,
    }
}

export function confirmCheckoutSessionSuccess(PaymentData) {
    return {
        type: actionsStripe.CONFIRM_CHECKOUT_SUCCESS,
        payload: PaymentData,
    }
}

export function confirmCheckoutSessionFailure(error) {
    return {
        type: actionsStripe.CONFIRM_CHECKOUT_FAILURE,
        payload: error,
    }
}

