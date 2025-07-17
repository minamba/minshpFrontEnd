import { actionsProduct } from "../actions/ProductActions";

const initialState = {
    products: [],
    addProductSuccess: false,
    addProductError: null,
    updateProductSuccess: false,
    updateProductError: null,
    deleteProductSuccess: false,
    deleteProductError: null,
    error: null,
}

export default function productReducer(state = initialState, action) {
    switch (action.type) {

        case actionsProduct.GET_PRODUCT_USER_SUCCESS:
            return {
                ...state,
                products: action.payload.products,
            }

        case actionsProduct.ADD_PRODUCT_USER_SUCCESS:
            return {...state.products, ...action.payload.product}
  

        case actionsProduct.UPDATE_PRODUCT_USER_SUCCESS:
            state.products.map(product => {
                    if(product.id === action.payload.id)
                        return {...product, ...action.payload.product}
                    else
                        return product
                })

        case actionsProduct.DELETE_PRODUCT_USER_SUCCESS:
            return state.products.filter(product => product.id !== action.payload.id)

        default:
            return state
    }
}