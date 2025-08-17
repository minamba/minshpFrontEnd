export const actionsTaxe = {
    GET_TAXE_REQUEST : "GET_TAXE_REQUEST",
    GET_TAXE_SUCCESS : "GET_TAXE_SUCCESS",
    GET_TAXE_FAILURE : "GET_TAXE_FAILURE",

    UPDATE_TAXE_REQUEST : "UPDATE_TAXE_REQUEST",
    UPDATE_TAXE_SUCCESS : "UPDATE_TAXE_SUCCESS",
    UPDATE_TAXE_FAILURE : "UPDATE_TAXE_FAILURE",

    DELETE_TAXE_REQUEST : "DELETE_TAXE_REQUEST",
    DELETE_TAXE_SUCCESS : "DELETE_TAXE_SUCCESS",
    DELETE_TAXE_FAILURE : "DELETE_TAXE_FAILURE",

    ADD_TAXE_REQUEST : "ADD_TAXE_REQUEST",
    ADD_TAXE_SUCCESS : "ADD_TAXE_SUCCESS",
    ADD_TAXE_FAILURE : "ADD_TAXE_FAILURE",
}


//get
export function getTaxeRequest() {
    return {
        type: actionsTaxe.GET_TAXE_REQUEST,
    }
}

export function getTaxeSuccess(taxes) {
    return {
        type: actionsTaxe.GET_TAXE_SUCCESS,
        payload: taxes,
    }
}

export function getTaxeFailure(error) {
    return {
        type: actionsTaxe.GET_TAXE_FAILURE,
        payload: error,
    }
}


//update
export function updateTaxeRequest(taxe) {
    return {
        type: actionsTaxe.UPDATE_TAXE_REQUEST,
        payload: taxe,
    }
}

export function updateTaxeSuccess(taxe) {
    return {
        type: actionsTaxe.UPDATE_TAXE_SUCCESS,
        payload: taxe,
    }
}

export function updateTaxeFailure(error) {
    return {
        type: actionsTaxe.UPDATE_TAXE_FAILURE,
        payload: error,
    }
}


//delete
export function deleteTaxeRequest(IdTaxe) {
    return {
        type: actionsTaxe.DELETE_TAXE_REQUEST,
        payload: IdTaxe,
    }
}

export function deleteTaxeSuccess(IdTaxe) {
    return {
        type: actionsTaxe.DELETE_TAXE_SUCCESS,
        payload: IdTaxe,
    }
}

export function deleteTaxeFailure(error) {
    return {
        type: actionsTaxe.DELETE_TAXE_FAILURE,
        payload: error,
    }
}


//add
export function addTaxeRequest(taxe) {
    return {
        type: actionsTaxe.ADD_TAXE_REQUEST,
        payload: taxe,
    }
}

export function addTaxeSuccess(taxe) {
    return {
        type: actionsTaxe.ADD_TAXE_SUCCESS,
        payload: taxe,
    }
}

export function addTaxeFailure(error) {
    return {
        type: actionsTaxe.ADD_TAXE_FAILURE,
        payload: error,
    }
}

