const createPolicy = (name, amount) => {
    return {
        type: 'CREATE_POLICY',
        payload: {
            name,
            amount
        }
    };
};
const deletePolicy = (name, amount) => {
    return {
        type: 'DELETE_POLICY',
        payload: {
            name
        }
    };
};
const createClaim = (name, amount) => {
    return {
        type: 'CREATE_CLAIM',
        payload: {
            name,
            amount
        }
    };
};
export { createPolicy, deletePolicy, createClaim };