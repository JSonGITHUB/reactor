import { createPolicy, deletePolicy, createClaim } from './ActionCreator.js'
import { accounting, claimsHistory, policies } from './Reducer';
import { createStore, combineReducers } from 'redux';

const departments = combineReducers({
    accounting: accounting,
    claimsHistory: claimsHistory,
    policies: policies
})

const store = createStore(departments);

const action = createPolicy('Alex', 20);

store.dispatch(action);
store.dispatch(createPolicy('Jim', 20));
store.dispatch(createPolicy('Billy', 20));

store.dispatch(createClaim('Alex', 120));
store.dispatch(createClaim('Jim', 50));

store.dispatch(deletePolicy('Billy'));

console.log(store.getState());