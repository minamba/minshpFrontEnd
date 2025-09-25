export const actionsNewLetter = {
    GET_NEWSLETTER_REQUEST : "GET_NEWSLETTER_REQUEST",
    GET_NEWSLETTER_SUCCESS : "GET_NEWSLETTER_SUCCESS",
    GET_NEWSLETTER_FAILURE : "GET_NEWSLETTER_FAILURE",

    UPDATE_NEWSLETTER_REQUEST : "UPDATE_NEWSLETTER_REQUEST",
    UPDATE_NEWSLETTER_SUCCESS : "UPDATE_NEWSLETTER_SUCCESS",
    UPDATE_NEWSLETTER_FAILURE : "UPDATE_NEWSLETTER_FAILURE",

    DELETE_NEWSLETTER_REQUEST : "DELETE_NEWSLETTER_REQUEST",
    DELETE_NEWSLETTER_SUCCESS : "DELETE_NEWSLETTER_SUCCESS",
    DELETE_NEWSLETTER_FAILURE : "DELETE_NEWSLETTER_FAILURE",

    ADD_NEWSLETTER_REQUEST : "ADD_NEWSLETTER_REQUEST",
    ADD_NEWSLETTER_SUCCESS : "ADD_NEWSLETTER_SUCCESS",
    ADD_NEWSLETTER_FAILURE : "ADD_NEWSLETTER_FAILURE",
}


//get
export function getNewsletterRequest() {
    return {
        type: actionsNewLetter.GET_NEWSLETTER_REQUEST,
    }
}

export function getNewsletterSuccess(newsletters) {
    return {
        type: actionsNewLetter.GET_NEWSLETTER_SUCCESS,
        payload: newsletters,
    }
}

export function getNewsletterFailure(error) {
    return {
        type: actionsNewLetter.GET_NEWSLETTER_FAILURE,
        payload: error,
    }
}


//update
export function updateNewsletterRequest(newsletter) {
    return {
        type: actionsNewLetter.UPDATE_NEWSLETTER_REQUEST,
        payload: newsletter,
    }
}

export function updateNewsletterSuccess(newsletter) {
    return {
        type: actionsNewLetter.UPDATE_NEWSLETTER_SUCCESS,
        payload: newsletter,
    }
}

export function updateNewsletterFailure(error) {
    return {
        type: actionsNewLetter.UPDATE_NEWSLETTER_FAILURE,
        payload: error,
    }
}


//delete
export function deleteNewsletterRequest(IdNewsletter) {
    return {
        type: actionsNewLetter.DELETE_NEWSLETTER_REQUEST,
        payload: IdNewsletter,
    }
}

export function deleteNewsletterSuccess(IdNewsletter) {
    return {
        type: actionsNewLetter.DELETE_NEWSLETTER_SUCCESS,
        payload: IdNewsletter,
    }
}

export function deleteNewsletterFailure(error) {
    return {
        type: actionsNewLetter.DELETE_NEWSLETTER_FAILURE,
        payload: error,
    }
}


//add
export function addNewsletterRequest(newsletter) {
    return {
        type: actionsNewLetter.ADD_NEWSLETTER_REQUEST,
        payload: newsletter,
    }
}

export function addNewsletterSuccess(successMessage) {
    return {
        type: actionsNewLetter.ADD_NEWSLETTER_SUCCESS,
        payload: { successMessage }, // objet, pas string brut
    }
}

export function addNewsletterFailure(errorMessage, error) {
    return {
        type: actionsNewLetter.ADD_NEWSLETTER_FAILURE,
        payload: { errorMessage, error }, // objet
    }
}

