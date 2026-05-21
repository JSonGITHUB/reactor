// src/components/VotingForm/reducer.js
import { actionTypes } from './actions';

export const initialState = {
    form: {
        email: '',
        password: '',
        voterName: '',
        voteChoice: '',
    },
    passwordMeta: { score: 0, label: '', ok: false },
    emailValidation: { loading: false, valid: null, message: '' },
    submitting: false,
    submitSuccess: false,
    submitError: null,
};

export const reducer = (state, action) => {
    switch (action.type) {
        case actionTypes.UPDATE_FIELD:
            return { ...state, [action.field]: action.value };
        case actionTypes.EMAIL_VALIDATING:
            return { ...state, emailValidation: 'Checking email...' };
        case actionTypes.EMAIL_VALIDATED:
            return { ...state, emailValidation: action.value };
        case actionTypes.PASSWORD_STRENGTH:
            return { ...state, passwordStrength: action.value };
        case actionTypes.SUBMIT_SUCCESS:
            return { ...initialState, status: 'Submitted successfully!' };
        case actionTypes.SUBMIT_ERROR:
            return { ...state, status: '', error: action.error };
        case actionTypes.RESET:
            return initialState;
        default:
            return state;
    }
};