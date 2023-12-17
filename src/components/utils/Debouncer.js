//Debounce is great for any repetitve or time regulated events
//Resize, Scroll inView and Reactive Textfield 

const debounce = (func, wait, immediate) => {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};
//every quarter of a second
//window.addEventListener('resize', debounce(this.setIt, 250));

export default debounce;