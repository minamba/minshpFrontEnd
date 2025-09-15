export const actionsOrder = {
    GET_ORDER_REQUEST : "GET_ORDER_REQUEST",
    GET_ORDER_SUCCESS : "GET_ORDER_SUCCESS",
    GET_ORDER_FAILURE : "GET_ORDER_FAILURE",

    UPDATE_ORDER_REQUEST : "UPDATE_ORDER_REQUEST",
    UPDATE_ORDER_SUCCESS : "UPDATE_ORDER_SUCCESS",
    UPDATE_ORDER_FAILURE : "UPDATE_ORDER_FAILURE",

    DELETE_ORDER_REQUEST : "DELETE_ORDER_REQUEST",
    DELETE_ORDER_SUCCESS : "DELETE_ORDER_SUCCESS",
    DELETE_ORDER_FAILURE : "DELETE_ORDER_FAILURE",

    ADD_ORDER_REQUEST : "ADD_ORDER_REQUEST",
    ADD_ORDER_SUCCESS : "ADD_ORDER_SUCCESS",
    ADD_ORDER_FAILURE : "ADD_ORDER_FAILURE",

    DOWNLOAD_ORDER_INVOICE_REQUEST : "DOWNLOAD_ORDER_INVOICE_REQUEST",
    DOWNLOAD_ORDER_INVOICE_SUCCESS : "DOWNLOAD_ORDER_INVOICE_SUCCESS",
    DOWNLOAD_ORDER_INVOICE_FAILURE : "DOWNLOAD_ORDER_INVOICE_FAILURE",
}


//get
export function getOrderRequest() {
    return {
        type: actionsOrder.GET_ORDER_REQUEST,
    }
}

export function getOrderSuccess(orders) {
    return {
        type: actionsOrder.GET_ORDER_SUCCESS,
        payload: orders,
    }
}

export function getOrderFailure(error) {
    return {
        type: actionsOrder.GET_ORDER_FAILURE,
        payload: error,
    }
}


//update
export function updateOrderRequest(order) {
    return {
        type: actionsOrder.UPDATE_ORDER_REQUEST,
        payload: order,
    }
}

export function updateOrderSuccess(order) {
    return {
        type: actionsOrder.UPDATE_ORDER_SUCCESS,
        payload: order,
    }
}

export function updateOrderFailure(error) {
    return {
        type: actionsOrder.UPDATE_ORDER_FAILURE,
        payload: error,
    }
}


//delete
export function deleteOrderRequest(IdOrder) {
    return {
        type: actionsOrder.DELETE_ORDER_REQUEST,
        payload: IdOrder,
    }
}

export function deleteOrderSuccess(IdOrder) {
    return {
        type: actionsOrder.DELETE_ORDER_SUCCESS,
        payload: IdOrder,
    }
}

export function deleteOrderFailure(error) {
    return {
        type: actionsOrder.DELETE_ORDER_FAILURE,
        payload: error,
    }
}


//add
export function addOrderRequest(order) {
    return {
        type: actionsOrder.ADD_ORDER_REQUEST,
        payload: order,
    }
}

export function addOrderSuccess(order) {
    return {
        type: actionsOrder.ADD_ORDER_SUCCESS,
        payload: order,
    }
}

export function addOrderFailure(error) {
    return {
        type: actionsOrder.ADD_ORDER_FAILURE,
        payload: error,
    }
}

//download invoice
export function downloadInvoiceRequest(orderId) {
    return {
        type: actionsOrder.DOWNLOAD_ORDER_INVOICE_REQUEST,
        payload: orderId,
    }
}

export function downloadInvoiceSuccess(orderId) {
    return {
        type: actionsOrder.DOWNLOAD_ORDER_INVOICE_SUCCESS,
        payload: orderId,
    }
}

export function downloadInvoiceFailure(error) {
    return {
        type: actionsOrder.DOWNLOAD_ORDER_INVOICE_FAILURE,
        payload: error,
    }
}

