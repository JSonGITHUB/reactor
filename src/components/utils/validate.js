const validate = (variable) => {
    try {
        if (typeof variable === 'undefined') return null;
        if (variable === undefined) return null;
        if (variable === null) return null;
        if (variable === 'null') return null;
        return variable;
    } catch (error) {
        return null;
    }
}

export default validate;