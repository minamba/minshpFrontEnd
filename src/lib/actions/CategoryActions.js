export const actionsCategory = {
    GET_CATEGORY_REQUEST : "GET_CATEGORY_REQUEST",
    GET_CATEGORY_SUCCESS : "GET_CATEGORY_SUCCESS",
    GET_CATEGORY_FAILURE : "GET_CATEGORY_FAILURE",

    UPDATE_CATEGORY_REQUEST : "UPDATE_CATEGORY_REQUEST",
    UPDATE_CATEGORY_SUCCESS : "UPDATE_CATEGORY_SUCCESS",
    UPDATE_CATEGORY_FAILURE : "UPDATE_CATEGORY_FAILURE",

    DELETE_CATEGORY_REQUEST : "DELETE_CATEGORY_REQUEST",
    DELETE_CATEGORY_SUCCESS : "DELETE_CATEGORY_SUCCESS",
    DELETE_CATEGORY_FAILURE : "DELETE_CATEGORY_FAILURE",

    ADD_CATEGORY_REQUEST : "ADD_CATEGORY_REQUEST",
    ADD_CATEGORY_SUCCESS : "ADD_CATEGORY_SUCCESS",
    ADD_CATEGORY_FAILURE : "ADD_CATEGORY_FAILURE",
}


//get
export function getCategoryRequest() {
    return {
        type: actionsCategory.GET_CATEGORY_REQUEST,
    }
}

export function getCategorySuccess(categories) {
    return {
        type: actionsCategory.GET_CATEGORY_SUCCESS,
        payload: categories,
    }
}

export function getCategoryFailure(error) {
    return {
        type: actionsCategory.GET_CATEGORY_FAILURE,
        payload: error,
    }
}


//update
export function updateCategoryRequest(category) {
    return {
        type: actionsCategory.UPDATE_CATEGORY_REQUEST,
        payload: category,
    }
}

export function updateCategorySuccess(category) {
    return {
        type: actionsCategory.UPDATE_CATEGORY_SUCCESS,
        payload: category,
    }
}

export function updateCategoryFailure(error) {
    return {
        type: actionsCategory.UPDATE_CATEGORY_FAILURE,
        payload: error,
    }
}


//delete
export function deleteCategoryRequest(IdCategory) {
    return {
        type: actionsCategory.DELETE_CATEGORY_REQUEST,
        payload: IdCategory,
    }
}

export function deleteCategorySuccess(IdCategory) {
    return {
        type: actionsCategory.DELETE_CATEGORY_SUCCESS,
        payload: IdCategory,
    }
}

export function deleteCategoryFailure(error) {
    return {
        type: actionsCategory.DELETE_CATEGORY_FAILURE,
        payload: error,
    }
}


//add
export function addCategoryRequest(category) {
    return {
        type: actionsCategory.ADD_CATEGORY_REQUEST,
        payload: category,
    }
}

export function addCategorySuccess(category) {
    return {
        type: actionsCategory.ADD_CATEGORY_SUCCESS,
        payload: category,
    }
}

export function addCategoryFailure(error) {
    return {
        type: actionsCategory.ADD_CATEGORY_FAILURE,
        payload: error,
    }
}

