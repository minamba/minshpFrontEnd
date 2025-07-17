export const actionsStock = {
    GET_STOCK_REQUEST : "GET_STOCK_REQUEST",
    GET_STOCK_SUCCESS : "GET_STOCK_SUCCESS",
    GET_STOCK_FAILURE : "GET_STOCK_FAILURE",

    UPDATE_STOCK_REQUEST : "UPDATE_STOCK_REQUEST",
    UPDATE_STOCK_SUCCESS : "UPDATE_STOCK_SUCCESS",
    UPDATE_STOCK_FAILURE : "UPDATE_STOCK_FAILURE",

    DELETE_STOCK_REQUEST : "DELETE_STOCK_REQUEST",
    DELETE_STOCK_SUCCESS : "DELETE_STOCK_SUCCESS",
    DELETE_STOCK_FAILURE : "DELETE_STOCK_FAILURE",

    ADD_STOCK_REQUEST : "ADD_STOCK_REQUEST",
    ADD_STOCK_SUCCESS : "ADD_STOCK_SUCCESS",
    ADD_STOCK_FAILURE : "ADD_STOCK_FAILURE",
}


//get
export function getStockRequest() {
    return {
        type: actionsStock.GET_STOCK_REQUEST,
    }
}

export function getStockSuccess(stocks) {
    return {
        type: actionsStock.GET_STOCK_SUCCESS,
        payload: stocks,
    }
}

export function getStockFailure(error) {
    return {
        type: actionsStock.GET_STOCK_FAILURE,
        payload: error,
    }
}


//update
export function updateStockRequest(stock) {
    return {
        type: actionsStock.UPDATE_STOCK_REQUEST,
        payload: stock,
    }
}

export function updateStockSuccess(stock) {
    return {
        type: actionsStock.UPDATE_STOCK_SUCCESS,
        payload: stock,
    }
}

export function updateStockFailure(error) {
    return {
        type: actionsStock.UPDATE_STOCK_FAILURE,
        payload: error,
    }
}


//delete
export function deleteStockRequest(IdStock) {
    return {
        type: actionsStock.DELETE_STOCK_REQUEST,
        payload: IdStock,
    }
}

export function deleteStockSuccess(IdStock) {
    return {
        type: actionsStock.DELETE_STOCK_SUCCESS,
        payload: IdStock,
    }
}

export function deleteStockFailure(error) {
    return {
        type: actionsStock.DELETE_STOCK_FAILURE,
        payload: error,
    }
}


//add
export function addStockRequest(stock) {
    return {
        type: actionsStock.ADD_STOCK_REQUEST,
        payload: stock,
    }
}

export function addStockSuccess(stock) {
    return {
        type: actionsStock.ADD_STOCK_SUCCESS,
        payload: stock,
    }
}

export function addStockFailure(error) {
    return {
        type: actionsStock.ADD_STOCK_FAILURE,
        payload: error,
    }
}

