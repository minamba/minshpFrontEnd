export const actionsPackageProfil = {
    GET_PACKAGE_PROFIL_REQUEST : "GET_PACKAGE_PROFIL_REQUEST",
    GET_PACKAGE_PROFIL_SUCCESS : "GET_PACKAGE_PROFIL_SUCCESS",
    GET_PACKAGE_PROFIL_FAILURE : "GET_PACKAGE_PROFIL_FAILURE",

    UPDATE_PACKAGE_PROFIL_REQUEST : "UPDATE_PACKAGE_PROFIL_REQUEST",
    UPDATE_PACKAGE_PROFIL_SUCCESS : "UPDATE_PACKAGE_PROFIL_SUCCESS",
    UPDATE_PACKAGE_PROFIL_FAILURE : "UPDATE_PACKAGE_PROFIL_FAILURE",

    DELETE_PACKAGE_PROFIL_REQUEST : "DELETE_PACKAGE_PROFIL_REQUEST",
    DELETE_PACKAGE_PROFIL_SUCCESS : "DELETE_PACKAGE_PROFIL_SUCCESS",
    DELETE_PACKAGE_PROFIL_FAILURE : "DELETE_PACKAGE_PROFIL_FAILURE",

    ADD_PACKAGE_PROFIL_REQUEST : "ADD_PACKAGE_PROFIL_REQUEST",
    ADD_PACKAGE_PROFIL_SUCCESS : "ADD_PACKAGE_PROFIL_SUCCESS",
    ADD_PACKAGE_PROFIL_FAILURE : "ADD_PACKAGE_PROFIL_FAILURE",
}


//get
export function getPackageProfilRequest() {
    return {
        type: actionsPackageProfil.GET_PACKAGE_PROFIL_REQUEST,
    }
}

export function getPackageProfilSuccess(packages) {
    return {
        type: actionsPackageProfil.GET_PACKAGE_PROFIL_SUCCESS,
        payload: packages,
    }
}

export function getPackageProfilFailure(error) {
    return {
        type: actionsPackageProfil.GET_PACKAGE_PROFIL_FAILURE,
        payload: error,
    }
}


//update
export function updatePackageProfilRequest(packageprofil) {
    return {
        type: actionsPackageProfil.UPDATE_PACKAGE_PROFIL_REQUEST,
        payload: packageprofil,
    }
}

export function updatePackageProfilSuccess(packageprofil) {
    return {
        type: actionsPackageProfil.UPDATE_PACKAGE_PROFIL_SUCCESS,
        payload: packageprofil,
    }
}

export function updatePackageProfilFailure(error) {
    return {
        type: actionsPackageProfil.UPDATE_PACKAGE_PROFIL_FAILURE,
        payload: error,
    }
}


//delete
export function deletePackageProfilRequest(IdProduct) {
    return {
        type: actionsPackageProfil.DELETE_PACKAGE_PROFIL_REQUEST,
        payload: IdProduct,
    }
}

export function deletePackageProfilSuccess(IdProduct) {
    return {
        type: actionsPackageProfil.DELETE_PACKAGE_PROFIL_SUCCESS,
        payload: IdProduct,
    }
}

export function deletePackageProfilFailure(error) {
    return {
        type: actionsPackageProfil.DELETE_PACKAGE_PROFIL_FAILURE,
        payload: error,
    }
}


//add
export function addPackageProfilRequest(packageprofil) {
    return {
        type: actionsPackageProfil.ADD_PACKAGE_PROFIL_REQUEST,
        payload: packageprofil,
    }
}

export function addPackageProfilSuccess(packageprofil) {
    return {
        type: actionsPackageProfil.ADD_PACKAGE_PROFIL_SUCCESS,
        payload: packageprofil,
    }
}

export function addPackageProfilFailure(error) {
    return {
        type: actionsPackageProfil.ADD_PACKAGE_PROFIL_FAILURE,
        payload: error,
    }
}

