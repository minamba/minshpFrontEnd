import { actionsSubCategory } from "../actions/SubCategoryActions";

const initialState = {
    subCategories: [],
    addSubCategorySuccess: false,
    addSubCategoryError: null,
    updateSubCategorySuccess: false,
    updateSubCategoryError: null,
    deleteSubCategorySuccess: false,
    deleteSubCategoryError: null,
    error: null,
}

export default function subCategoryReducer(state = initialState, action) {
    switch (action.type) {

        case actionsSubCategory.GET_SUBCATEGORY_SUCCESS:
            return {
                ...state,
                subCategories: action.payload.subCategories,
            }

        case actionsSubCategory.ADD_SUBCATEGORY_SUCCESS:
            return {...state.subCategories, ...action.payload.subCategory}
  

        case actionsSubCategory.UPDATE_SUBCATEGORY_SUCCESS:
            state.subCategories.map(subCategory => {
                    if(subCategory.id === action.payload.id)
                        return {...subCategory, ...action.payload.subCategory}
                    else
                        return subCategory
                })

        case actionsSubCategory.DELETE_SUBCATEGORY_SUCCESS:
            return state.subCategories.filter(subCategory => subCategory.id !== action.payload.id)

        default:
            return state
    }
}