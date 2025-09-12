import { actionsInvoice } from "../actions/InvoiceActions";

const initialState = {
    invoices: [],
    addInvoiceSuccess: false,
    addInvoiceError: null,
    updateInvoiceSuccess: false,
    updateInvoiceError: null,
    deleteInvoiceSuccess: false,
    deleteInvoiceError: null,
    error: null,
}

export default function invoiceReducer(state = initialState, action) {
    switch (action.type) {

        case actionsInvoice.GET_INVOICE_SUCCESS:
            return {
                ...state,
                invoices: action.payload.invoices,
            }

        case actionsInvoice.ADD_INVOICE_SUCCESS:
            return {...state.invoices, ...action.payload.invoice}
  

        case actionsInvoice.UPDATE_INVOICE_SUCCESS:
            state.invoices.map(invoice => {
                    if(invoice.id === action.payload.id)
                        return {...invoice, ...action.payload.invoice}
                    else
                        return invoice
                })

        case actionsInvoice.DELETE_INVOICE_SUCCESS:
            return state.invoices.filter(invoice => invoice.id !== action.payload.id)

        default:
            return state
    }
}