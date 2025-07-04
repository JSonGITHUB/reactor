const memoize = fn => {
    let cache = {};
    return (...args) => {
        let n = args[0];  // just taking one argument here
        if (n in cache) {
            console.log('Fetching from cache');
            return cache[n];
        } else {
            console.log('Fetching from server');
            let result = fn(n);
            cache[n] = result;
            return result;
        }
    }
}
export default memoize;