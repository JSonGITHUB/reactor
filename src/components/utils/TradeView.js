import React, { useState, useEffect, useMemo } from 'react';
import './TradeView.css';
import icons from '../site/icons';
import TradingViewWidgetWrapper from './TradingViewWidgetWrapper';
import { MarketOverview, TickerTape } from 'react-ts-tradingview-widgets';
import TradingViewNews from './TradingViewNews';

// TradingView widgets (embed via iframe or script)
const TradingViewWidget = ({ symbol, height = 400 }) => (
        <TradingViewWidgetWrapper symbol={symbol} height={height} />
);

const useDebouncedValue = (value, delay = 400) => {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debounced;
};
const STOCKS = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corp.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    // Add more as needed
];

const TradeView = () => {
    const [inputValue, setInputValue] = useState('');
    
    const [favorites, setFavorites] = useState(() =>
        JSON.parse(localStorage.getItem('tradeFavorites')) || []
    );
    const [selected, setSelected] = useState(favorites.length ? favorites[0] : STOCKS[0].symbol);

    const debouncedInput = useDebouncedValue(inputValue, 400);

    const filteredStocks = useMemo(() =>
        STOCKS.filter(
            s =>
                s.name.toLowerCase().includes(debouncedInput.toLowerCase()) ||
                s.symbol.toLowerCase().includes(debouncedInput.toLowerCase())
        ),
        [debouncedInput]
    );

    useEffect(() => {
        localStorage.setItem('tradeFavorites', JSON.stringify(favorites));
    }, [favorites]);

    // Add/remove favorites
    const toggleFavorite = (symbol) => {
        setFavorites(favorites.includes(symbol)
            ? favorites.filter(f => f !== symbol)
            : [...favorites, symbol]
        );
    };
    const TradeViewStockList = React.memo(({ filteredStocks, selected, setSelected, favorites, toggleFavorite }) => (
        <div className='tradeview-stock-list containerDetail ml-10 mr-10 mb-10 color-soft size20 bg-dark'>
            {filteredStocks.map(stock => (
                <div 
                    onClick={() => setSelected(stock.symbol)} 
                    key={stock.symbol} 
                    className={`button hover tradeview-stock-item bg-dark${selected === stock.symbol ? ' selected' : ''}`}
                >
                    <span>{stock.name} ({stock.symbol})</span>
                    <button
                        className={`favorite-btn${favorites.includes(stock.symbol) ? ' active' : ''}`}
                        onClick={() => toggleFavorite(stock.symbol)}
                        title={favorites.includes(stock.symbol) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                        ★
                    </button>
                </div>
            ))}
        </div>
    ));

    return (
        <div className='mt--30'>
            <div className=''>
                <div className='color-yellow contentLeft'>
                    <div className='containerDetail m-5 p-20 size20 bg-lite'>
                        {icons.tradeview} Market Watch
                    </div>
                    {/* 
                    <div className='tradeview-widgets'>
                        <div className='containerDetail m-5 color-yellow bg-lite'>
                            <div className='containerDetail p-20 m-5 size20'>Market Overview</div>
                            <TradingViewWidget symbol={selected} height={300} />
                        </div>
                    </div> 
                    */}
                    <div className=''>
                        <div className='containerDetail ml-5 mr-5 mb-5 pt-10 bg-dark'>
                            <div className='ml-5 mr-5'>
                                <TickerTape
                                    symbols={() => STOCKS.map((stock) => stock.symbol)}
                                    theme='dark'
                                    isTransparent={false}
                                    displayMode='adaptive'
                                    showSymbolLogo={true}
                                />
                            </div>
                            <div className='mt--30 ml-5 mr-5'>
                                <TickerTape
                                    symbols={STOCKS.map(stock => ({
                                        proName: `NASDAQ:${stock.symbol}`,
                                        title: stock.name
                                    }))}
                                    theme='dark'
                                    isTransparent={false}
                                    displayMode='adaptive'
                                    showSymbolLogo={true}
                                />
                            </div>
                            <div className='mt--25 mr-5 ml-5'>
                                <MarketOverview
                                    symbols={[
                                        { s: 'NASDAQ:AAPL' },
                                        { s: 'NASDAQ:MSFT' },
                                        { s: 'NASDAQ:GOOGL' }
                                    ]}
                                    theme='dark'
                                    colorTheme='dark'
                                    width='100%'
                                    height={400}
                                    isTransparent={false}
                                    plotLineColorGrowing='#00FF00'
                                    plotLineColorFalling='#FF0000'
                                    gridLineColor='gray'
                                    scaleFontColor='orange'
                                    belowLineFillColorGrowing='#00ff0045'
                                    belowLineFillColorFalling='#ff000030'
                                    symbolActiveColor='#052705'
                                />
                            </div>
                        </div>
                    </div>
                    <div className='containerDetail m-5 bg-lite'>
                        <input
                            type='text'
                            placeholder='Search companies...'
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            className='containerDetail size20 p-10 m-10 width--20 color-yellow bg-dark'
                        />
                        <TradeViewStockList
                            filteredStocks={filteredStocks}
                            selected={selected}
                            setSelected={setSelected}
                            favorites={favorites}
                            toggleFavorite={toggleFavorite}
                        />
                    </div>
                    <div className='containerDetail m-5 color-yellow bg-lite p-5'>
                        <div className='containerDetail p-20 size20 m-5 bg-lite'>Stock Vitals: {selected}</div>
                        <TradingViewWidget symbol={selected} height={400} />
                    </div>
                    <div className='containerDetail color-yellow m-5 bg-lite'>
                        <div className='containerDetail color-yellow p-20 size20 m-5 bg-lite'>
                            Favorites
                        </div>
                        <div className='containerDetail p-10 m-5 size20 color-lite bg-dark'>
                            {favorites.length === 0 && <div className='color-soft'>No favorites selected.</div>}
                            {favorites.map(symbol => {
                                const stock = STOCKS.find(s => s.symbol === symbol);
                                return (
                                    <div key={symbol} className={`tradeview-stock-item button hover mb-5 containerDetail p-10 ${selected === symbol ? ' selected' : ''}`} onClick={() => setSelected(symbol)}>
                                        {stock ? `${stock.name} (${stock.symbol})` : symbol}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className='containerDetail p-10 mt-10 bg-tintedMediumDark'>
                    <TradingViewNews
                        symbol={selected}
                        width='100%'
                        theme='dark'
                        colorTheme='dark'
                        height={400}
                        isTransparent={true}
                    />
                </div>
            </div>
            {
                /*
                <div className='m-10'>
                    <div className='tradeview-news'>
                        <div className='containerDetail bg-lite color-yellow'>
                            <div className='containerDetail color-yellow p-20 size20 m-5 contentLeft bg-lite'>
                                Economic News
                            </div>
                            {getNews()}
                        </div>
                    </div>
                </div>
                */
            }
        </div>
    );
};

export default TradeView;