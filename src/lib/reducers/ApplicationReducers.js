import { actionsApplication } from "../actions/ApplicationActions";

const initialState = {
    applications: [],
    addApplicationSuccess: false,
    addApplicationError: null,
    updateApplicationSuccess: false,
    updateApplicationError: null,
    deleteApplicationSuccess: false,
    deleteApplicationError: null,
    error: null,
}

export default function applicationReducer(state = initialState, action) {
    switch (action.type) {

        case actionsApplication.GET_APPLICATION_SUCCESS:
            return {
                ...state,
                applications: action.payload.applications,
            }

        case actionsApplication.ADD_APPLICATION_SUCCESS:
            return {...state.applications, ...action.payload.application}
  

        case actionsApplication.UPDATE_APPLICATION_SUCCESS:
            state.applications.map(application => {
                    if(application.id === action.payload.id)
                        return {...application, ...action.payload.application}
                    else
                        return application
                })

        case actionsApplication.DELETE_APPLICATION_SUCCESS:
            return state.applications.filter(application => application.id !== action.payload.id)

        default:
            return state
    }
}