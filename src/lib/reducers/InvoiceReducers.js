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

        // liste paginée (admin)
        items: [],
        page: 1,
        pageSize: 20,
        totalCount: 0,
}

export default function invoiceReducer(state = initialState, action) {
    switch (action.type) {


          /* ---------------- PAGES (ADMIN) ---------------- */
            case actionsInvoice.GET_INVOICE_PAGED_USER_REQUEST:
              return {
                ...state,
                loading: true,
                error: null,
                // reset flags d’édition pour éviter des affichages “fantômes”
                addInvoiceSuccess: false,
                updateInvoiceSuccess: false,
                deleteInvoiceSuccess: false,
                addInvoiceError: null,
                updateInvoiceError: null,
                deleteInvoiceError: null,
                items: [],
                totalCount: 0,
              };
        
            case actionsInvoice.GET_INVOICE_PAGED_USER_SUCCESS:
              return {
                ...state,
                loading: false,
                items: Array.isArray(action.payload?.items) ? action.payload.items : [],
                totalCount: action.payload?.totalCount ?? 0,
                page: action.payload?.page ?? 1,
                pageSize: action.payload?.pageSize ?? state.pageSize,
                error: null,
              };
        
            case actionsInvoice.GET_INVOICE_PAGED_USER_FAILURE:
              return {
                ...state,
                loading: false,
                error: action.payload?.error || "Erreur chargement (paged)",
              };

    //Get classique
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