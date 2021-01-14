import React, { useEffect } from "react";
import { withRouter } from "react-router-dom";

const ScrollToTop = ({ loc }) => {
    useEffect(() => {
        if (window.location.pathname !== loc.location) {
            console.log(`ScrollToTop =>\nlocation: ${loc.pathname}`);
            window.scrollTo(0, 0);
        }    		
    },[]);

    const resetScroll = () => {
        const body = document.body; // For Safari
        const html = document.documentElement; // Chrome, Firefox, IE and Opera places the overflow at the html level, unless else is specified. Therefore, we use the documentElement property for these browsers
        body.scrollLeft = 0;
        body.scrollTop = 0;
        html.scrollLeft = 0;
        html.scrollTop = 0;
    }
    resetScroll();
    return <span></span>
}

export default withRouter(ScrollToTop)