import { actionsFeatureProduct } from "../actions/FeatureProductActions";

const initialState = {
    featureProducts: [],
    addFeatureProductSuccess: false,
    addFeatureProductError: null,
    updateFeatureProductSuccess: false,
    updateFeatureProductError: null,
    deleteFeatureProductSuccess: false,
    deleteFeatureProductError: null,
    error: null,
}

export default function featureProductReducer(state = initialState, action) {
    switch (action.type) {

        case actionsFeatureProduct.GET_FEATURE_PRODUCT_SUCCESS:
            return {
                ...state,
                featureProducts: action.payload.featureProducts,
            }

        case actionsFeatureProduct.ADD_FEATURE_PRODUCT_SUCCESS:
            return {...state.featureProducts, ...action.payload.featureProduct}
  

        case actionsFeatureProduct.UPDATE_FEATURE_PRODUCT_SUCCESS:
            state.featureProducts.map(featureProduct => {
                    if(featureProduct.id === action.payload.id)
                        return {...featureProduct, ...action.payload.featureProduct}
                    else
                        return featureProduct
                })

        case actionsFeatureProduct.DELETE_FEATURE_PRODUCT_SUCCESS:
            return state.featureProducts.filter(featureProduct => featureProduct.id !== action.payload.id)

        default:
            return state
    }
}