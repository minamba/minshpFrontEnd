export const actionsInvoice = {
    GET_INVOICE_REQUEST : "GET_INVOICE_REQUEST",
    GET_INVOICE_SUCCESS : "GET_INVOICE_SUCCESS",
    GET_INVOICE_FAILURE : "GET_INVOICE_FAILURE",

    UPDATE_INVOICE_REQUEST : "UPDATE_INVOICE_REQUEST",
    UPDATE_INVOICE_SUCCESS : "UPDATE_INVOICE_SUCCESS",
    UPDATE_INVOICE_FAILURE : "UPDATE_INVOICE_FAILURE",

    DELETE_INVOICE_REQUEST : "DELETE_INVOICE_REQUEST",
    DELETE_INVOICE_SUCCESS : "DELETE_INVOICE_SUCCESS",
    DELETE_INVOICE_FAILURE : "DELETE_INVOICE_FAILURE",

    ADD_INVOICE_REQUEST : "ADD_INVOICE_REQUEST",
    ADD_INVOICE_SUCCESS : "ADD_INVOICE_SUCCESS",
    ADD_INVOICE_FAILURE : "ADD_INVOICE_FAILURE",
}


//get
export function getInvoiceRequest() {
    return {
        type: actionsInvoice.GET_INVOICE_REQUEST,
    }
}

export function getInvoiceSuccess(invoices) {
    return {
        type: actionsInvoice.GET_INVOICE_SUCCESS,
        payload: invoices,
    }
}

export function getInvoiceFailure(error) {
    return {
        type: actionsInvoice.GET_INVOICE_FAILURE,
        payload: error,
    }
}


//update
export function updateInvoiceRequest(invoice) {
    return {
        type: actionsInvoice.UPDATE_INVOICE_REQUEST,
        payload: invoice,
    }
}

export function updateInvoiceSuccess(invoice) {
    return {
        type: actionsInvoice.UPDATE_INVOICE_SUCCESS,
        payload: invoice,
    }
}

export function updateInvoiceFailure(error) {
    return {
        type: actionsInvoice.UPDATE_INVOICE_FAILURE,
        payload: error,
    }
}


//delete
export function deleteInvoiceRequest(data) {
    return {
        type: actionsInvoice.DELETE_INVOICE_REQUEST,
        payload: data,
    }
}

export function deleteInvoiceSuccess(IdInvoice) {
    return {
        type: actionsInvoice.DELETE_INVOICE_SUCCESS,
        payload: IdInvoice,
    }
}

export function deleteInvoiceFailure(error) {
    return {
        type: actionsInvoice.DELETE_INVOICE_FAILURE,
        payload: error,
    }
}


//add
export function addInvoiceRequest(invoice) {
    return {
        type: actionsInvoice.ADD_INVOICE_REQUEST,
        payload: invoice,
    }
}

export function addInvoiceSuccess(invoice) {
    return {
        type: actionsInvoice.ADD_INVOICE_SUCCESS,
        payload: invoice,
    }
}

export function addInvoiceFailure(error) {
    return {
        type: actionsInvoice.ADD_INVOICE_FAILURE,
        payload: error,
    }
}
