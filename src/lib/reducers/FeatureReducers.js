import { actionsFeature } from "../actions/FeatureActions";

const initialState = {
    features: [],
    addFeatureSuccess: false,
    addFeatureError: null,
    updateFeatureSuccess: false,
    updateFeatureError: null,
    deleteFeatureSuccess: false,
    deleteFeatureError: null,
    error: null,
}

export default function featureReducer(state = initialState, action) {
    switch (action.type) {

        case actionsFeature.GET_FEATURE_SUCCESS:
            return {
                ...state,
                features: action.payload.features,
            }

        case actionsFeature.ADD_FEATURE_SUCCESS:
            return {...state.features, ...action.payload.feature}
  

        case actionsFeature.UPDATE_FEATURE_SUCCESS:
            state.features.map(feature => {
                    if(feature.id === action.payload.id)
                        return {...feature, ...action.payload.feature}
                    else
                        return feature
                })

        case actionsFeature.DELETE_FEATURE_SUCCESS:
            return state.features.filter(feature => feature.id !== action.payload.id)

        default:
            return state
    }
}