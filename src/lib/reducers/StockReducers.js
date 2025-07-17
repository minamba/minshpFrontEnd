import { actionsStock } from "../actions/StockActions";

const initialState = {
    stocks: [],
    addStockSuccess: false,
    addStockError: null,
    updateStockSuccess: false,
    updateStockError: null,
    deleteStockSuccess: false,
    deleteStockError: null,
    error: null,
}

export default function stockReducer(state = initialState, action) {
    switch (action.type) {

        case actionsStock.GET_STOCK_SUCCESS:
            return {
                ...state,
                stocks: action.payload.stocks,
            }

        case actionsStock.ADD_STOCK_SUCCESS:
            return {...state.stocks, ...action.payload.stock}
  

        case actionsStock.UPDATE_STOCK_SUCCESS:
            state.stocks.map(stock => {
                    if(stock.id === action.payload.id)
                        return {...stock, ...action.payload.stock}
                    else
                        return stock
                })

        case actionsStock.DELETE_STOCK_SUCCESS:
            return state.stocks.filter(stock => stock.id !== action.payload.id)

        default:
            return state
    }
}