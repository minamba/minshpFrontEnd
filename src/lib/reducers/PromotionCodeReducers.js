import { actionsPromotionCode } from "../actions/PromotionCodeActions";

const initialState = {
    promotionCodes: [],
    addPromotionCodeSuccess: false,
    addPromotionCodeError: null,
    updatePromotionCodeSuccess: false,
    updatePromotionCodeError: null,
    deletePromotionCodeSuccess: false,
    deletePromotionCodeError: null,
    error: null,
}

export default function promotionCodeReducer(state = initialState, action) {
    switch (action.type) {

        case actionsPromotionCode.GET_PROMOTION_CODE_SUCCESS:
            return {
                ...state,
                promotionCodes: action.payload.promotionCodes,
            }

        case actionsPromotionCode.ADD_PROMOTION_CODE_SUCCESS:
            return {...state.promotionCodes, ...action.payload.promotionCode}
  

        case actionsPromotionCode.UPDATE_PROMOTION_CODE_SUCCESS:
            state.promotionCodes.map(promotionCode => {
                    if(promotionCode.id === action.payload.id)
                        return {...promotionCode, ...action.payload.promotionCode}
                    else
                        return promotionCode
                })

        case actionsPromotionCode.DELETE_PROMOTION_CODE_SUCCESS:
            return state.promotionCodes.filter(promotionCode => promotionCode.id !== action.payload.id)

        default:
            return state
    }
}