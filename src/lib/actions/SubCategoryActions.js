export const actionsSubCategory = {
    GET_SUBCATEGORY_REQUEST : "GET_SUBCATEGORY_REQUEST",
    GET_SUBCATEGORY_SUCCESS : "GET_SUBCATEGORY_SUCCESS",
    GET_SUBCATEGORY_FAILURE : "GET_SUBCATEGORY_FAILURE",

    UPDATE_SUBCATEGORY_REQUEST : "UPDATE_SUBCATEGORY_REQUEST",
    UPDATE_SUBCATEGORY_SUCCESS : "UPDATE_SUBCATEGORY_SUCCESS",
    UPDATE_SUBCATEGORY_FAILURE : "UPDATE_SUBCATEGORY_FAILURE",

    DELETE_SUBCATEGORY_REQUEST : "DELETE_SUBCATEGORY_REQUEST",
    DELETE_SUBCATEGORY_SUCCESS : "DELETE_SUBCATEGORY_SUCCESS",
    DELETE_SUBCATEGORY_FAILURE : "DELETE_SUBCATEGORY_FAILURE",

    ADD_SUBCATEGORY_REQUEST : "ADD_SUBCATEGORY_REQUEST",
    ADD_SUBCATEGORY_SUCCESS : "ADD_SUBCATEGORY_SUCCESS",
    ADD_SUBCATEGORY_FAILURE : "ADD_SUBCATEGORY_FAILURE",
}


//get
export function getSubCategoryRequest() {
    return {
        type: actionsSubCategory.GET_SUBCATEGORY_REQUEST,
    }
}

export function getSubCategorySuccess(categories) {
    return {
        type: actionsSubCategory.GET_SUBCATEGORY_SUCCESS,
        payload: categories,
    }
}

export function getSubCategoryFailure(error) {
    return {
        type: actionsSubCategory.GET_SUBCATEGORY_FAILURE,
        payload: error,
    }
}


//update
export function updateSubCategoryRequest(category) {
    return {
        type: actionsSubCategory.UPDATE_SUBCATEGORY_REQUEST,
        payload: category,
    }
}

export function updateSubCategorySuccess(category) {
    return {
        type: actionsSubCategory.UPDATE_SUBCATEGORY_SUCCESS,
        payload: category,
    }
}

export function updateSubCategoryFailure(error) {
    return {
        type: actionsSubCategory.UPDATE_SUBCATEGORY_FAILURE,
        payload: error,
    }
}


//delete
export function deleteSubCategoryRequest(IdCategory) {
    return {
        type: actionsSubCategory.DELETE_SUBCATEGORY_REQUEST,
        payload: IdCategory,
    }
}

export function deleteSubCategorySuccess(IdCategory) {
    return {
        type: actionsSubCategory.DELETE_SUBCATEGORY_SUCCESS,
        payload: IdCategory,
    }
}

export function deleteSubCategoryFailure(error) {
    return {
        type: actionsSubCategory.DELETE_SUBCATEGORY_FAILURE,
        payload: error,
    }
}


//add
export function addSubCategoryRequest(category) {
    return {
        type: actionsSubCategory.ADD_SUBCATEGORY_REQUEST,
        payload: category,
    }
}

export function addSubCategorySuccess(category) {
    return {
        type: actionsSubCategory.ADD_SUBCATEGORY_SUCCESS,
        payload: category,
    }
}

export function addSubCategoryFailure(error) {
    return {
        type: actionsSubCategory.ADD_SUBCATEGORY_FAILURE,
        payload: error,
    }
}

