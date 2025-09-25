import { actionsNewLetter } from "../actions/NewLetterActions";

const initialState = {
    newsletters: [],
    addNewsletterSuccess: false,
    addNewsletterError: null,
    updateNewsletterSuccess: false,
    updateNewsletterError: null,
    deleteNewsletterSuccess: false,
    deleteNewsletterError: null,
    error: null,
    successMessage: null,
    errorMessage: null,
}

export default function newLetterReducer (state = initialState, action) {
    switch (action.type) {


        case actionsNewLetter.GET_NEWSLETTER_REQUEST:
            return { ...state, error: null, successMessage: null, errorMessage: null };

        case actionsNewLetter.GET_NEWSLETTER_SUCCESS:
            return { ...state, newsletters: action.payload.newsletters, error: null, successMessage: null, errorMessage: null };

        case actionsNewLetter.GET_NEWSLETTER_FAILURE:
            return { ...state, error: action.payload.error, errorMessage: action.payload.errorMessage, successMessage: null };
          
          case actionsNewLetter.ADD_NEWSLETTER_SUCCESS:
            return { ...state, successMessage: action.payload.successMessage, error: null, errorMessage: null };
          
          case actionsNewLetter.ADD_NEWSLETTER_FAILURE:
            return { ...state, error: action.payload.error, errorMessage: action.payload.errorMessage, successMessage: null };

        case actionsNewLetter.UPDATE_NEWSLETTER_SUCCESS:
            state.newsletters.map(newsletter => {
                    if(newsletter.id === action.payload.id)
                        return {...newsletter, ...action.payload.newsletter}
                    else
                        return newsletter
                })



        case actionsNewLetter.DELETE_NEWSLETTER_SUCCESS:
            return state.newsletters.filter(newsletter => newsletter.id !== action.payload.id)

        default:
            return state
    }
}