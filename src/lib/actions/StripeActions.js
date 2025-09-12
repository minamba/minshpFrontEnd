export const actionsStripe = {
    CREATE_CHECKOUT_SESSION_REQUEST : "CREATE_CHECKOUT_SESSION_REQUEST",
    CREATE_CHECKOUT_SESSION_SUCCESS : "CREATE_CHECKOUT_SESSION_SUCCESS",
    CREATE_CHECKOUT_SESSION_FAILURE : "CREATE_CHECKOUT_SESSION_FAILURE",

    CONFIRM_CHECKOUT_REQUEST : "CONFIRM_CHECKOUT_REQUEST",
    CONFIRM_CHECKOUT_SUCCESS : "CONFIRM_CHECKOUT_SUCCESS",
    CONFIRM_CHECKOUT_FAILURE : "CONFIRM_CHECKOUT_FAILURE",
}


//create 
export function createCheckoutSessionRequest(payload) {
    return {
        type: actionsStripe.CREATE_CHECKOUT_SESSION_REQUEST,
        payload: payload,
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
export function confirmCheckoutSessionRequest(sessionId) {
    return {
        type: actionsStripe.CONFIRM_CHECKOUT_REQUEST,
        payload: sessionId,
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

