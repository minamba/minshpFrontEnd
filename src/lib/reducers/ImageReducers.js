import { actionsImage } from "../actions/ImageActions";

const initialState = {
    images: [],
    addImageSuccess: false,
    addImageError: null,
    updateImageSuccess: false,
    updateImageError: null,
    deleteImageSuccess: false,
    deleteImageError: null,
    error: null,
}

export default function imageReducer(state = initialState, action) {
    switch (action.type) {

        case actionsImage.GET_IMAGE_SUCCESS:
            return {
                ...state,
                images: action.payload.images,
            }

        case actionsImage.ADD_IMAGE_SUCCESS:
            return {...state.images, ...action.payload.image}
  

        case actionsImage.UPDATE_IMAGE_SUCCESS:
            state.images.map(image => {
                    if(image.id === action.payload.id)
                        return {...image, ...action.payload.image}
                    else
                        return image
                })

        case actionsImage.DELETE_IMAGE_SUCCESS:
            return state.images.filter(image => image.id !== action.payload.id)

        default:
            return state
    }
}