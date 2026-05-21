// TradingViewWidgetWrapper.js
import React, { useState } from 'react';
import { 
    MiniChart,
    TechnicalAnalysis, 
    SymbolInfo, 
    CompanyProfile,
    FundamentalData
} from 'react-ts-tradingview-widgets';

const TradingViewWidgetWrapper = ({ 
    symbol,
    height
}) => {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <div className='m-5'>
            <div className='containerDetail mb-5 bg-tintedMediumDark'>
                <SymbolInfo
                    symbol={symbol}
                    colorTheme='dark'
                    locale='en'
                    largeChartUrl=''
                    isTransparent='false'
                    showSymbolLogo='true'
                    displayMode='adaptive'
                    width='100%'
                    height={height}
                />
            </div>
            <div className='containerDetail p-10 bg-tintedMediumDark mb-5'>
                <TechnicalAnalysis
                    symbol={symbol}
                    width='100%'
                    theme='dark'
                    colorTheme='dark'
                    height={300}
                    isTransparent={true}
                    displayMode='single'
                    interval='1m'
                    disableInterval={false}
                    showIntervalTabs={false}
                />
            </div>
            <div className='containerDetail bg-tintedMediumDark mb-5'>
                <MiniChart
                    symbol={symbol?.includes(':') ? symbol : `NASDAQ:${symbol}`}
                    width='100%'
                    height={height}
                    locale='en'
                    theme='dark'
                    colorTheme='dark'
                    isTransparent={true}
                    dateRange='12M'
                />
            </div>
            <div
                className='containerDetail p-10 mb-5 bg-tintedMediumDark button'
                onClick={() => setShowDetails(v => !v)}
                style={{ textAlign: 'center', cursor: 'pointer', color: '#aaa', fontSize: 13 }}
            >
                {showDetails ? '▲ Hide Details' : '▼ Show Details (Profile & Fundamentals)'}
            </div>
            {showDetails && (
            <div className='containerDetail mb-10 bg-tintedMediumDark'>
                <CompanyProfile
                    symbol={symbol}
                    colorTheme='dark'
                    isTransparent='false'
                    locale='en'
                    width='100%'
                    height={height}
                />
            </div>
            )}
            {showDetails && (
            <div className='containerDetail mb-10 bg-tintedMediumDark'>
                <FundamentalData
                    symbol={symbol}
                    colorTheme='dark'
                    isTransparent='false'
                    locale='en'
                    width='100%'
                    height={height}
                />
            </div>
            )}
        </div>
    );
};

export default TradingViewWidgetWrapper;