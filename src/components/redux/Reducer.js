const claimsHistory = (oldListOfClaims = [], action) => {
    if (action.type === 'CREATE_CLAIM') {
        return [...oldListOfClaims, action.payload];
    }
    return oldListOfClaims;
}
const accounting = (bagOfMoney = 100, action) => {
    if (action.type === 'CREATE_CLAIM') {
        return bagOfMoney - action.payload.amount;
    } else if (action.type === 'CREATE_POLICY') {
        return bagOfMoney + action.payload.amount;
    }
    return bagOfMoney;
}
const policies = (policies = [], action) => {
    if (action.type === 'CREATE_POLICY') {
        return [...policies, action.payload.name];
    } else if (action.type === 'DELETE_POLICY') {
        return policies.filter(name => name !== action.payload.name);
    }
    return policies;
}
export { claimsHistory, accounting, policies }