// TradingViewWidgetWrapper.js
import React from 'react';
import { 
    AdvancedRealTimeChart, 
    TechnicalAnalysis, 
    SymbolInfo, 
    CompanyProfile,
    FundamentalData
} from 'react-ts-tradingview-widgets';

const TradingViewWidgetWrapper = ({ 
    symbol,
    height
}) => {
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
                <AdvancedRealTimeChart
                    symbol={symbol}
                    width='100%'
                    height={height}
                    locale='en'
                    theme='dark'
                    colorTheme='dark'
                    isTransparent={true}
                    allow_symbol_change={true}
                    calendar={false}
                    details={true}
                    hide_side_toolbar={true}
                    hide_top_toolbar={true}
                    hide_legend={false}
                    hide_volume={true}
                    hotlist={false}
                    interval='D'
                    save_image={true}
                    timezone='Etc/UTC'
                    backgroundColor='#0F0F0F'
                    gridColor='rgba(242, 242, 242, 0.06)'
                    watchlist={[]}
                    withdateranges={false}
                    compareSymbols={[]}
                    studies={[]}
                    autosize={false}
                />
            </div>
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
            {/*
            <div className='containerDetail mb-10 bg-tintedMediumDark'>
                <SymbolOverview
                    symbols={symbol}
                    theme='dark'
                    colorTheme='dark'
                    width='100%'
                    height={height}
                    lineColor='#00FF00'
                    lineWidth={1}
                    lineType={0}
                    chartType='area'
                    fontColor='#DDDDDD'
                    gridLineColor='#555'
                    volumeUpColor='#00FF00'
                    volumeDownColor='#FF0000'
                    backgroundColor='#0F0F0F'
                    widgetFontColor='#DBDBDB'
                    upColor='#00FF00'
                    downColor='#f7525f'
                    borderUpColor='#22ab94'
                    borderDownColor='#f7525f'
                    wickUpColor='#22ab94'
                    wickDownColor='#f7525f'
                    isTransparent={true}
                    locale='en'
                    chartOnly={false}
                    scalePosition='left'
                    scaleMode='Normal'
                    bottomColor='#00ff0007'
                    topColor='#00ff0039'
                />
            </div>
            */}
        </div>
    );
};

export default TradingViewWidgetWrapper;