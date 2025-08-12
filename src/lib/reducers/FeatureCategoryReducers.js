import { actionsFeatureCategory } from "../actions/FeatureCategoryActions";

const initialState = {
    featureCategories: [],
    featuresCategoryByProduct: [],
    addFeatureCategorySuccess: false,
    addFeatureCategoryError: null,
    updateFeatureCategorySuccess: false,
    updateFeatureCategoryError: null,
    deleteFeatureCategorySuccess: false,
    deleteFeatureCategoryError: null,
    error: null,
}

export default function featureCategoryReducer(state = initialState, action) {
    switch (action.type) {

        case actionsFeatureCategory.GET_FEATURE_CATEGORY_SUCCESS:
            return {
                ...state,
                featureCategories: action.payload.featureCategories,
            }

        case actionsFeatureCategory.ADD_FEATURE_CATEGORY_SUCCESS:
            return {...state.featureCategories, ...action.payload.featureCategory}
  

        case actionsFeatureCategory.UPDATE_FEATURE_CATEGORY_SUCCESS:
            state.featureCategories.map(featureCategory => {
                    if(featureCategory.id === action.payload.id)
                        return {...featureCategory, ...action.payload.featureCategory}
                    else
                        return featureCategory
                })

        case actionsFeatureCategory.DELETE_FEATURE_CATEGORY_SUCCESS:
            return state.featureCategories.filter(featureCategory => featureCategory.id !== action.payload.id)

        case actionsFeatureCategory.GET_FEATURE_CATEGORY_BY_PRODUCT_SUCCESS:
            return {
                ...state,
                featuresCategoryByProduct: action.payload.featuresCategoryByProduct,
            }

        default:
            return state
    }
}