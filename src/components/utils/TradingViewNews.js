// TradingViewWidget.jsx
import React, { useEffect, useRef, memo } from 'react';

function TradingViewWidget({
    symbol
}) {
    const container = useRef();
    console.log(`TradingViewWidget => symbol: ${symbol}`);

    useEffect(
        () => {
            const script = document.createElement("script");
            script.src = "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js";
            script.type = "text/javascript";
            script.async = true;
            script.innerHTML = `
        {
          "displayMode": "regular",
          "feedMode": "symbol",
          "symbol": "NASDAQ:${symbol}",
          "colorTheme": "dark",
          "theme": "dark",
          "isTransparent": false,
          "locale": "en",
          "width": "100%",
          "height": "100%"        
        }`;
            container.current.appendChild(script);
        },[symbol]);

    return (
        <div className="tradingview-widget-container" ref={container}>
            <div className="tradingview-widget-container__widget"></div>
            <div className="tradingview-widget-copyright"><a href="https://www.tradingview.com/news/top-providers/tradingview/" rel="noreferrer noopener nofollow" target="_blank"><span className="blue-text">Top stories</span></a><span className="trademark"> by TradingView</span></div>
        </div>
    );
}

export default memo(TradingViewWidget);