import { actionsPackageProfil } from "../actions/PackageProfilActions";

const initialState = {
    packageProfils: [],
    addPackageProfilSuccess: false,
    addPackageProfilError: null,
    updatePackageProfilSuccess: false,
    updatePackageProfilError: null,
    deletePackageProfilSuccess: false,
    deletePackageProfilError: null,
    error: null,
}

export default function packageprofilReducer(state = initialState, action) {
    switch (action.type) {

        case actionsPackageProfil.GET_PACKAGE_PROFIL_SUCCESS:
            return {
                ...state,
                packageProfils: action.payload.packageProfils,
            }

        case actionsPackageProfil.ADD_PACKAGE_PROFIL_SUCCESS:
            return {...state.packageProfils, ...action.payload}
  

        case actionsPackageProfil.UPDATE_PACKAGE_PROFIL_SUCCESS:
            state.packageProfils.map(packageprofil => {
                    if(packageprofil.id === action.payload.id)
                        return {...packageprofil, ...action.payload}
                    else
                        return packageprofil
                })

        case actionsPackageProfil.DELETE_PACKAGE_PROFIL_SUCCESS:
            return state.packageProfils.filter(packageprofil => packageprofil.id !== action.payload)

        default:
            return state
    }
}