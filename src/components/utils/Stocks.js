import React from 'react';
import TradingViewWidgetWrapper from './TradingViewWidgetWrapper';

const Stocks = () => {
    return (
        <div>
            <h1>TradingView Widget Example</h1>
            <TradingViewWidgetWrapper symbol="BTCUSD" height={600} />
        </div>
    );
};

export default Stocks;