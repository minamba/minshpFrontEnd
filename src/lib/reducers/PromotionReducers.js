import { actionsPromotion } from "../actions/PromotionActions";

const initialState = {
    promotions: [],
    addPromotionSuccess: false,
    addPromotionError: null,
    updatePromotionSuccess: false,
    updatePromotionError: null,
    deletePromotionSuccess: false,
    deletePromotionError: null,
    error: null,
}

export default function promotionReducer(state = initialState, action) {
    switch (action.type) {

        case actionsPromotion.GET_PROMOTION_SUCCESS:
            return {
                ...state,
                promotions: action.payload.promotions,
            }

        case actionsPromotion.ADD_PROMOTION_SUCCESS:
            return {...state.promotions, ...action.payload.promotion}
  

        case actionsPromotion.UPDATE_PROMOTION_SUCCESS:
            state.promotions.map(promotion => {
                    if(promotion.id === action.payload.id)
                        return {...promotion, ...action.payload.promotion}
                    else
                        return promotion
                })

        case actionsPromotion.DELETE_PROMOTION_SUCCESS:
            return state.promotions.filter(promotion => promotion.id !== action.payload.id)

        default:
            return state
    }
}