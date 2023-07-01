const DebouncerType = (callBack, term) => {

    const timerId = setTimeout(() => {
        callBack(term);
    }, 1000);

    return () => {
        clearTimeout(timerId);
    };

}

export default DebouncerType;