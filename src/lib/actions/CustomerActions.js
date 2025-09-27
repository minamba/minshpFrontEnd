export const actionsCustomer = {
    GET_CUSTOMER_REQUEST : "GET_CUSTOMER_REQUEST",
    GET_CUSTOMER_SUCCESS : "GET_CUSTOMER_SUCCESS",
    GET_CUSTOMER_FAILURE : "GET_CUSTOMER_FAILURE",

    GET_PAGED_CUSTOMER_REQUEST : "GET_PAGED_CUSTOMER_REQUEST",
    GET_PAGED_CUSTOMER_SUCCESS : "GET_PAGED_CUSTOMER_SUCCESS",
    GET_PAGED_CUSTOMER_FAILURE : "GET_PAGED_CUSTOMER_FAILURE",

    UPDATE_CUSTOMER_REQUEST : "UPDATE_CUSTOMER_REQUEST",
    UPDATE_CUSTOMER_SUCCESS : "UPDATE_CUSTOMER_SUCCESS",
    UPDATE_CUSTOMER_FAILURE : "UPDATE_CUSTOMER_FAILURE",

    DELETE_CUSTOMER_REQUEST : "DELETE_CUSTOMER_REQUEST",
    DELETE_CUSTOMER_SUCCESS : "DELETE_CUSTOMER_SUCCESS",
    DELETE_CUSTOMER_FAILURE : "DELETE_CUSTOMER_FAILURE",

    ADD_CUSTOMER_REQUEST : "ADD_CUSTOMER_REQUEST",
    ADD_CUSTOMER_SUCCESS : "ADD_CUSTOMER_SUCCESS",
    ADD_CUSTOMER_FAILURE : "ADD_CUSTOMER_FAILURE",
}


//get
export function getCustomerRequest() {
    return {
        type: actionsCustomer.GET_CUSTOMER_REQUEST,
    }
}

export function getCustomerSuccess(customers) {
    return {
        type: actionsCustomer.GET_CUSTOMER_SUCCESS,
        payload: customers,
    }
}

export function getCustomerFailure(error) {
    return {
        type: actionsCustomer.GET_CUSTOMER_FAILURE,
        payload: error,
    }
}


//get paged
export function getPagedCustomerRequest(payload) {
    return { type: actionsCustomer.GET_PAGED_CUSTOMER_REQUEST, payload };
  }
  export function getPagedCustomerSuccess(pageResult) {
    return { type: actionsCustomer.GET_PAGED_CUSTOMER_SUCCESS, payload: pageResult };
  }
  export function getPagedCustomerFailure(error) {
    return { type: actionsCustomer.GET_PAGED_CUSTOMER_FAILURE, payload: { error } };
  }


//update
export function updateCustomerRequest(customer) {
    return {
        type: actionsCustomer.UPDATE_CUSTOMER_REQUEST,
        payload: customer,
    }
}

export function updateCustomerSuccess(customer) {
    return {
        type: actionsCustomer.UPDATE_CUSTOMER_SUCCESS,
        payload: customer,
    }
}

export function updateCustomerFailure(error) {
    return {
        type: actionsCustomer.UPDATE_CUSTOMER_FAILURE,
        payload: error,
    }
}


//delete
export function deleteCustomerRequest(IdCustomer) {
    return {
        type: actionsCustomer.DELETE_CUSTOMER_REQUEST,
        payload: IdCustomer,
    }
}

export function deleteCustomerSuccess(IdCustomer) {
    return {
        type: actionsCustomer.DELETE_CUSTOMER_SUCCESS,
        payload: IdCustomer,
    }
}

export function deleteCustomerFailure(error) {
    return {
        type: actionsCustomer.DELETE_CUSTOMER_FAILURE,
        payload: error,
    }
}


//add
export function addCustomerRequest(customer) {
    return {
        type: actionsCustomer.ADD_CUSTOMER_REQUEST,
        payload: customer,
    }
}

export function addCustomerSuccess(customer) {
    return {
        type: actionsCustomer.ADD_CUSTOMER_SUCCESS,
        payload: customer,
    }
}

export function addCustomerFailure(error) {
    return {
        type: actionsCustomer.ADD_CUSTOMER_FAILURE,
        payload: error,
    }
}

