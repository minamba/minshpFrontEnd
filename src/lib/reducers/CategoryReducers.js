import { actionsCategory } from "../actions/CategoryActions";

const initialState = {
    categories: [],
    addCategorySuccess: false,
    addCategoryError: null,
    updateCategorySuccess: false,
    updateCategoryError: null,
    deleteCategorySuccess: false,
    deleteCategoryError: null,
    error: null,
}

export default function categoryReducer(state = initialState, action) {
    switch (action.type) {

        case actionsCategory.GET_CATEGORY_SUCCESS:
            return {
                ...state,
                categories: action.payload.categories,
            }

        case actionsCategory.ADD_CATEGORY_SUCCESS:
            return {...state.categories, ...action.payload.category}
  

        case actionsCategory.UPDATE_CATEGORY_SUCCESS:
            state.categories.map(category => {
                    if(category.id === action.payload.id)
                        return {...category, ...action.payload.category}
                    else
                        return category
                })

        case actionsCategory.DELETE_CATEGORY_SUCCESS:
            return state.categories.filter(category => category.id !== action.payload.id)

        default:
            return state
    }
}