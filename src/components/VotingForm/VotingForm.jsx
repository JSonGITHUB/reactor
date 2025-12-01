import React, { useReducer } from 'react';
import { useQueryClient, useMutation, QueryClient, QueryClientProvider } from 'react-query';
import { actionTypes } from './actions';
import { reducer } from './reducer';
import { checkPasswordStrength } from './helpers';

// Create a single query client instance
const queryClient = new QueryClient();

// --- Reducer and state management ---
const initialState = {
    name: '',
    email: '',
    password: '',
    vote: '',
    status: '',
    error: '',
    emailValidation: '',
    passwordStrength: '',
};

// --- Async email validation ---
const validateEmailAPI = async (email) => {
    await new Promise((r) => setTimeout(r, 500)); // simulate latency
    if (email.includes('disposable')) throw new Error('Disposable emails not allowed');
    return { valid: true, message: 'Valid email ✅' };
};

// --- Async submission ---
const submitVoteAPI = async (data) => {
    await new Promise((r) => setTimeout(r, 1000));
    if (!data.name || !data.email || !data.vote) throw new Error('Missing fields');
    return { success: true };
};

// --- Component ---
const VotingFormInner = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const queryClient = useQueryClient();

    const validateEmail = async (email) => {
        if (!email) return;
        dispatch({ type: actionTypes.EMAIL_VALIDATING });
        try {
            const res = await validateEmailAPI(email);
            dispatch({ type: actionTypes.EMAIL_VALIDATED, value: res.message });
        } catch (e) {
            dispatch({ type: actionTypes.EMAIL_VALIDATED, value: e.message });
        }
    };

    const { mutateAsync: submitVote } = useMutation(submitVoteAPI, {
        
        onSuccess: () => {
            dispatch({ type: actionTypes.SUBMIT_SUCCESS });
            queryClient.invalidateQueries('votes');
        },
        onError: (err) => {
            dispatch({ type: actionTypes.SUBMIT_ERROR, error: err.message });
        },
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        dispatch({ type: actionTypes.UPDATE_FIELD, field: name, value });

        if (name === 'password') {
            const strength = checkPasswordStrength(value);
            dispatch({ type: actionTypes.PASSWORD_STRENGTH, value: strength });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await submitVote(state);
    };

    const handleReset = () => dispatch({ type: actionTypes.RESET });

    return (
        <div data-testid='voting-form' className='containerDetail mr-5 ml-5 mt--20 bg-lite color-lite size20 contentLeft'>
            <div data-testid='form-title' className='containerDetail bg-lite p-10 color-yellow size20'>Voting System</div>
            <form onSubmit={handleSubmit}>
                <div className='containerDetail mt-5'>
                    <label>
                        <div className='containerDetail p-10 bg-lite color-yellow size20'>
                            Name:
                        </div>
                        <input
                            data-testid='name-input'
                            type='text'
                            name='name'
                            value={state.name}
                            onChange={handleChange}
                            className='containerDetail mt-5 p-10 bg-tintedMedium color-lite size20 width-100-percent'
                        />
                    </label>
                    <label>
                        <div className='containerDetail mt-5 p-10 bg-lite color-yellow size20'>
                            Email: 
                        </div>    
                        <input
                            data-testid='email-input'
                            type='email'
                            name='email'
                            value={state.email}
                            onBlur={(e) => validateEmail(e.target.value)}
                            onChange={handleChange}
                            className='containerDetail mt-5 p-10 bg-tintedMedium color-lite size20 width-100-percent'
                        />
                    </label>
                    {state.emailValidation && (
                        <small data-testid='email-validation'>{state.emailValidation}</small>
                    )}
                    <label>
                        <div className='containerDetail mt-5 p-10 bg-lite color-yellow size20'>
                            Password:
                        </div>
                        <input
                            data-testid='password-input'
                            type='password'
                            name='password'
                            value={state.password}
                            onChange={handleChange}
                            className='containerDetail mt-5 p-10 bg-tintedMedium color-lite size20 width-100-percent'
                        />
                    </label>
                    {state.passwordStrength && (
                    <small data-testid='password-strength'>{state.passwordStrength}</small>
                )}
                </div>
                <div className='containerDetail mt-5 bg-dkGreen'>
                    <label>
                        <div className='containerDetail p-10 bg-lite color-yellow size20'>
                            Vote Choice:
                        </div>
                        <select
                            data-testid='vote-select'
                            name='vote'
                            value={state.vote}
                            onChange={handleChange}
                            className='containerDetail mt-5 p-10 bg-tintedMedium color-lite size20 width-100-percent'
                        >
                            <option value=''>Select</option>
                            <option value='candidateA'>Candidate A</option>
                            <option value='candidateB'>Candidate B</option>
                        </select>
                    </label>
                    <div className='containerDetail flexContainer mt-5'>
                        <div data-testid='submit-btn' type='submit' className='containerDetail m-5 p-20 bg-green button flex2Column contentCenter'>Submit</div>
                        <div data-testid='reset-btn' type='button' className='containerDetail m-5 bg-green p-20 button flex2Column contentCenter' onClick={handleReset}>Reset</div>
                    </div>
                </div>
            </form>

            {state.status && <div data-testid='submit-success'>{state.status}</div>}
            {state.error && <div data-testid='submit-error'>{state.error}</div>}
        </div>
    );
};

// --- Wrap with provider for React Query v3 ---
const VotingForm = () => (
    <QueryClientProvider client={queryClient}>
        <VotingFormInner />
    </QueryClientProvider>
);

export default VotingForm;