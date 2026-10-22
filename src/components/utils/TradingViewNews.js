import React, { memo } from 'react';
import { Timeline } from 'react-ts-tradingview-widgets';

function TradingViewWidget({
    symbol,
    width = '100%',
    height = 400,
    isTransparent = true,
    colorTheme = 'dark'
}) {
    const tvSymbol = symbol?.includes(':') ? symbol : `NASDAQ:${symbol}`;

    return (
        <div className='tradingview-widget-container'>
            <Timeline
                feedMode='symbol'
                symbol={tvSymbol}
                colorTheme={colorTheme}
                isTransparent={isTransparent}
                width={width}
                height={height}
                locale='en'
                displayMode='regular'
            />
        </div>
    );
}

export default memo(TradingViewWidget);