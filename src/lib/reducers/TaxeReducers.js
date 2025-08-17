import { actionsTaxe } from "../actions/TaxeActions";

const initialState = {
    taxes: [],
    addTaxeSuccess: false,
    addTaxeError: null,
    updateStockSuccess: false,
    updateStockError: null,
    deleteStockSuccess: false,
    deleteStockError: null,
    error: null,
}

export default function TaxeReducer(state = initialState, action) {
    switch (action.type) {

        case actionsTaxe.GET_TAXE_SUCCESS:
            return {
                ...state,
                taxes: action.payload.taxes,
            }

        case actionsTaxe.ADD_TAXE_SUCCESS:
            return {...state.taxes, ...action.payload.taxe}
  

        case actionsTaxe.UPDATE_TAXE_SUCCESS:
            state.taxes.map(taxe => {
                    if(taxe.id === action.payload.id)
                        return {...taxe, ...action.payload.taxe}
                    else
                        return taxe
                })

        case actionsTaxe.DELETE_TAXE_SUCCESS:
            return state.taxes.filter(taxe => taxe.id !== action.payload.id)

        default:
            return state
    }
}