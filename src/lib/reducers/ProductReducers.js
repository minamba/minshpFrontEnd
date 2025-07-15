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
            return {
                ...state,
                products : [...state.products, action.payload]
            }
  

        case actionsProduct.UPDATE_PRODUCT_USER_SUCCESS:
            return {
                ...state,
                products : state.products.map(product => product.id === action.payload.id ? {...product, ...action.payload} : product)

            }


        case actionsProduct.DELETE_PRODUCT_USER_SUCCESS:
            return {
                ...state,
                products : state.products.filter(product => product.id !== action.payload.id)
            }

        default:
            return state
    }
}