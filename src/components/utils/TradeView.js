import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import './TradeView.css';
import icons from '../site/icons';
import TradingViewWidgetWrapper from './TradingViewWidgetWrapper';
import { MarketOverview, TickerTape } from 'react-ts-tradingview-widgets';
import TradingViewNews from './TradingViewNews';

// TradingView widgets (embed via iframe or script)
const TradingViewWidget = React.memo(({ symbol, height = 400 }) => (
        <TradingViewWidgetWrapper symbol={symbol} height={height} />
));

const CurrencyInput = ({ value, onChange, className }) => {
    const [focused, setFocused] = useState(false);
    const [cents, setCents] = useState('');

    const handleFocus = () => {
        const numCents = Math.round(Number(value || 0) * 100);
        setCents(numCents > 0 ? String(numCents) : '');
        setFocused(true);
    };

    const handleBlur = () => {
        setFocused(false);
        onChange({ target: { value: String((Number(cents) || 0) / 100) } });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Backspace') {
            e.preventDefault();
            const next = cents.slice(0, -1);
            setCents(next);
            onChange({ target: { value: String((Number(next) || 0) / 100) } });
        } else if (e.key >= '0' && e.key <= '9') {
            e.preventDefault();
            const next = cents + e.key;
            setCents(next);
            onChange({ target: { value: String(Number(next) / 100) } });
        }
    };

    const displayValue = () => {
        if (!focused) {
            const n = Number(value || 0);
            return n > 0 ? `$${n.toFixed(2)}` : '';
        }
        if (!cents) return '';
        const n = Number(cents);
        const dollars = Math.floor(n / 100);
        const pennies = n % 100;
        return `$${dollars}.${String(pennies).padStart(2, '0')}`;
    };

    return (
        <input
            type='text'
            inputMode='numeric'
            value={displayValue()}
            placeholder='$0.00'
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onChange={() => {}}
            className={className}
        />
    );
};

const BelowSpreadPanel = React.memo(({ 
    selected,
    belowSpread,
    selectedSpreadMax,
    selectedSpreadDisabled,
    collapsed,
    onToggle,
    onUpdate,
    onAdjust,
}) => (
    <div className='containerDetail mt-5 below-spread-panel'>
        <div
            className='containerDetail button p-10 flexContainer below-spread-panel-header'
            onClick={() => onToggle('below')}
        >
            <div className='flex1Column size20 color-red'>
                {collapsed ? '▸' : '▾'} Below Spread -${belowSpread.toFixed(2)}
            </div>
        </div>
        {collapsed ? null : (
            <div className='mt-10'>
                <div className='below-spread-panel-body'>
                    <input
                        type='range'
                        min='0'
                        max={selectedSpreadMax}
                        step='0.01'
                        value={belowSpread}
                        disabled={selectedSpreadDisabled}
                        onChange={(e) => onUpdate(selected, e.target.value)}
                        className='width-100-percent mt-10'
                    />
                    <div className='containerDetail flexContainer mt-5 below-spread-panel-controls'>
                        <div className='flex5Column flexContainer'>
                            <div
                                disabled={selectedSpreadDisabled}
                                className='containerDetail flexColumn m-1 button p-10 bg-lite color-yellow flex5Column'
                                onClick={() => onAdjust(selected, 'belowSpread', -1)}
                            >
                                -1
                            </div>
                            <div
                                disabled={selectedSpreadDisabled}
                                className='containerDetail flexColumn m-1 button p-10 bg-lite color-yellow'
                                onClick={() => onAdjust(selected, 'belowSpread', -0.1)}
                            >
                                -.10
                            </div>
                            <div
                                disabled={selectedSpreadDisabled}
                                className='containerDetail flexColumn m-1 button p-10 bg-lite color-yellow'
                                onClick={() => onAdjust(selected, 'belowSpread', -0.01)}
                            >
                                -.01
                            </div>
                        </div>
                        <div className='flex5Column'>
                            <CurrencyInput
                                value={belowSpread}
                                onChange={(e) => onUpdate(selected, e.target.value)}
                                className='containerDetail p-10 width-100-percent color-red bg-dark contentCenter'
                            />
                        </div>
                        <div className='flex5Column ml-5 contentRight flexContainer'>
                            <div
                                disabled={selectedSpreadDisabled}
                                className='containerDetail flexColumn m-1 button p-10 bg-lite color-yellow'
                                onClick={() => onAdjust(selected, 'belowSpread', 0.01)}
                            >
                                +.01
                            </div>
                            <div
                                disabled={selectedSpreadDisabled}
                                className='containerDetail flexColumn m-1 button p-10 bg-lite color-yellow'
                                onClick={() => onAdjust(selected, 'belowSpread', 0.1)}
                            >
                                +.10
                            </div>
                            <div
                                disabled={selectedSpreadDisabled}
                                className='containerDetail flexColumn m-1 button p-10 bg-lite color-yellow'
                                onClick={() => onAdjust(selected, 'belowSpread', 1)}
                            >
                                +1
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
));

const useDebouncedValue = (value, delay = 400) => {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debounced;
};

const normalizeSymbol = (value) => String(value || '').trim().toUpperCase();
const normalizeSearchText = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

let stocksListCache = null;
const EXCLUDED_STOCK_NAME_PATTERNS = [
    /\b(rights?|rt)\b/i,
    /\bwarrants?\b/i,
    /\bunits?\b/i,
    /deposit(?:ary|ory)\s+shares?/i,
    /preferred\s+shares?/i,
    /preferred\s+stock/i,
    /preferred\s+securities/i,
    /preferred\s+class/i,
    /income\s+trust\s+preferred/i,
    /non-cumulative\s+preferred/i,
    /cumulative\s+preferred/i,
    /senior\s+notes?\b/i,
    /subordinated\s+notes?\b/i,
    /\bdebentures?\b/i,
];

const cleanStockName = (value) => String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s*\([^)]*representing[^)]*\)/gi, '')
    .replace(/\s+american\s+deposit(?:ary|ory)\s+shares?(?:\s+class\s+[a-z])?(?:\s+ordinary\s+shares?)?(?:\s*\([^)]*\))?$/i, '')
    .replace(/\s+american\s+deposit(?:ary|ory)\s+shs?(?:\s+class\s+[a-z])?(?:\s+ordinary\s+shares?)?(?:\s*\([^)]*\))?$/i, '')
    .replace(/\s+american\s+deposit(?:ary|ory)\s+receipt(s)?(?:\s*\([^)]*\))?$/i, '')
    .replace(/\s+sponsored\s+adr(?:\s*\([^)]*\))?$/i, '')
    .replace(/\s+class\s+[a-z]\s+common\s+stock(?:\s+new)?(?:\s+nonvoting)?(?:\s+\$?[0-9.]+\s+par\s+value)?(?:\s*\([^)]*\))?$/i, '')
    .replace(/\s+(common\s+stock|common\s+shares?)(?:\s+new)?(?:\s+nonvoting)?(?:\s+\$?[0-9.]+\s+par\s+value)?(?:\s*\([^)]*\))?$/i, '')
    .replace(/\s+ordinary\s+shares?(?:\s*\([^)]*\))?$/i, '')
    .replace(/\s+class\s+[a-z]\s+ordinary\s+shares?(?:\s*\([^)]*\))?$/i, '')
    .replace(/\s+class\s+[a-z](?:\s*\([^)]*\))?$/i, '')
    .replace(/\s+series\s+[a-z](?:\s*\([^)]*\))?$/i, '')
    .replace(/\s+ads$/i, '')
    .replace(/\s+adr\b.*$/i, '')
    .replace(/\s+spon[a-z]+\.?$/i, '')
    .replace(/\s*\(reit\)/gi, '')
    .replace(/\s+reit\s+inc\.?$/i, '')
    .replace(/\s+reit$/i, '')
    .replace(/\s*\([a-z]{2,3}\)$/i, '')
    .replace(/\s+sponsored\s+adr\b.*$/i, '')
    .replace(/\s+shares?\s+of\s+beneficial\s+interest.*$/i, '')
    .replace(/\s+common\s+stock\s+when\s+issued$/i, '')
    .replace(/\s+common\s+stock\s+new$/i, '')
    .replace(/\s+\(the\)$/i, '')
    .replace(/\.$/, '')
    .trim();

const shouldExcludeStockEntry = (symbol, name, type) => {
    if (!symbol || !name) return true;
    if (!/^[A-Z][A-Z0-9.-]{0,14}$/.test(symbol)) return true;
    if (String(type || 'EQUITY').toUpperCase() !== 'ETF' && EXCLUDED_STOCK_NAME_PATTERNS.some((pattern) => pattern.test(name))) {
        return true;
    }
    return false;
};

const normalizeStockEntry = (stock, fallback = {}) => {
    const symbol = normalizeSymbol(stock?.symbol);
    const rawName = String(stock?.name || fallback.name || symbol).trim();
    const name = cleanStockName(rawName);
    const type = String(stock?.type || fallback.type || 'EQUITY').toUpperCase();
    const exchange = String(stock?.exchange || fallback.exchange || '').trim();
    const aliases = [
        ...(Array.isArray(stock?.aliases) ? stock.aliases : []),
        ...(Array.isArray(fallback.aliases) ? fallback.aliases : []),
    ]
        .map((value) => String(value || '').trim())
        .filter(Boolean);

    if (shouldExcludeStockEntry(symbol, rawName, type)) return null;
    if (shouldExcludeStockEntry(symbol, name, type)) return null;

    return {
        symbol,
        name,
        type,
        exchange,
        aliases: Array.from(new Set(aliases)),
    };
};

const getNasdaqStockListUrl = () => {
    const host = window.location.hostname;
    const isDev = host === 'localhost' || host === '127.0.0.1';
    return isDev
        ? '/api/nasdaq/api/screener/stocks?tableonly=true&download=true'
        : 'https://api.nasdaq.com/api/screener/stocks?tableonly=true&download=true';
};

const loadStockSource = async (path, signal) => {
    try {
        const response = await fetch(path, { signal });
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data)
            ? data.map((stock) => normalizeStockEntry(stock)).filter(Boolean)
            : [];
    } catch (err) {
        if (err?.name === 'AbortError') throw err;
        return [];
    }
};

const loadNasdaqStockSource = async (signal) => {
    try {
        const response = await fetch(getNasdaqStockListUrl(), {
            signal,
            headers: {
                accept: 'application/json',
            },
        });
        if (!response.ok) return [];

        const payload = await response.json();
        const rows = Array.isArray(payload?.data?.rows) ? payload.data.rows : [];

        return rows
            .map((row) => normalizeStockEntry({
                symbol: row?.symbol,
                name: row?.name,
                type: 'EQUITY',
                exchange: 'US',
                aliases: [String(row?.sector || '').trim(), String(row?.industry || '').trim()].filter(Boolean),
            }))
            .filter(Boolean);
    } catch (err) {
        if (err?.name === 'AbortError') throw err;
        return [];
    }
};

const mergeStockLists = (lists) => {
    const merged = new Map();

    lists.flat().forEach((stock) => {
        const normalized = normalizeStockEntry(stock);
        if (!normalized) return;

        const existing = merged.get(normalized.symbol) || {};
        const aliases = Array.from(new Set([...(existing.aliases || []), ...(normalized.aliases || [])]));

        merged.set(normalized.symbol, {
            ...existing,
            ...normalized,
            aliases,
        });
    });

    return Array.from(merged.values());
};

const loadStocksList = (signal) => {
    if (stocksListCache) return Promise.resolve(stocksListCache);
    return Promise.all([
        loadNasdaqStockSource(signal),
        loadStockSource('/stocks.json', signal),
        loadStockSource('/stocks-additional.json', signal),
    ])
        .then((lists) => mergeStockLists(lists))
        .then((data) => { stocksListCache = data; return data; })
        .catch((err) => {
            if (err?.name === 'AbortError') throw err;
            stocksListCache = [];
            return [];
        });
};

const scoreSymbolMatch = (stock, query) => {
    const symbol = normalizeSearchText(stock.symbol);
    const name = normalizeSearchText(stock.name);
    const exchange = normalizeSearchText(stock.exchange);
    const aliases = Array.isArray(stock.aliases) ? stock.aliases.map(normalizeSearchText).filter(Boolean) : [];
    const words = name.split(' ').filter(Boolean);

    if (symbol === query) return 0;
    if (symbol.startsWith(query)) return 1;
    if (aliases.some((alias) => alias === query)) return 2;
    if (words.some((word) => word.startsWith(query))) return 3;
    if (aliases.some((alias) => alias.startsWith(query))) return 4;
    if (name.startsWith(query)) return 5;
    if (name.includes(query)) return 6;
    if (exchange.startsWith(query)) return 7;
    return 99;
};

const useSymbolSearch = (query, enabled = true) => {
    const [allStocksList, setAllStocksList] = useState(stocksListCache || []);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(!stocksListCache);
    const [loadError, setLoadError] = useState(false);
    const debounced = useDebouncedValue((query || '').trim(), 150);

    useEffect(() => {
        if (!enabled) {
            setLoading(false);
            setLoadError(false);
            setResults([]);
            return;
        }

        if (stocksListCache) {
            setLoading(false);
            return;
        }

        let cancelled = false;
        const controller = new AbortController();
        setLoading(true);
        loadStocksList(controller.signal)
            .then((data) => {
                if (cancelled) return;
                setAllStocksList(Array.isArray(data) ? data : []);
                setLoadError(false);
            })
            .catch(() => {
                if (cancelled) return;
                setLoadError(true);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [enabled]);

    useEffect(() => {
        if (!enabled) {
            setResults([]);
            return;
        }
        if (!debounced) { setResults([]); return; }
        const q = normalizeSearchText(debounced);
        const seen = new Set();
        const matches = allStocksList
            .filter((stock) => {
                const haystacks = [
                    normalizeSearchText(stock.symbol),
                    normalizeSearchText(stock.name),
                    normalizeSearchText(stock.exchange),
                    ...(Array.isArray(stock.aliases) ? stock.aliases.map(normalizeSearchText) : []),
                ];
                return haystacks.some((value) => value.includes(q));
            })
            .filter((stock) => {
                const symbol = normalizeSymbol(stock.symbol);
                if (!symbol || seen.has(symbol)) return false;
                seen.add(symbol);
                return true;
            })
            .sort((a, b) => {
                const scoreDiff = scoreSymbolMatch(a, q) - scoreSymbolMatch(b, q);
                if (scoreDiff !== 0) return scoreDiff;
                return a.symbol.localeCompare(b.symbol);
            });
        setResults(matches.slice(0, 16));
    }, [debounced, allStocksList, enabled]);

    return { results, loading, loadError };
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

const TradeViewStockList = React.memo(function TradeViewStockList({
    filteredStocks,
    selected,
    setSelected,
    favorites,
    toggleFavorite,
    customStocks,
    removeCustomCompany,
}) {
    return (
        <div className='tradeview-stock-list containerDetail ml-5 mr-5 mb-10 color-soft size20 bg-dark'>
            {filteredStocks.map((stock) => {
                const isCustom = customStocks.some((c) => c.symbol === stock.symbol);
                return (
                    <div
                        onClick={() => setSelected(stock.symbol)}
                        key={stock.symbol}
                        className={`button flexContainer hover tradeview-stock-item bg-dark${selected === stock.symbol ? ' selected' : ''}`}
                    >
                        <div className='flex2Column contentLeft'>{stock.name} ({stock.symbol})</div>
                        <button
                            className={`flex2Column contentRight favorite-btn${favorites.includes(stock.symbol) ? ' active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(stock.symbol); }}
                            title={favorites.includes(stock.symbol) ? 'Remove from favorites' : 'Add to favorites'}
                        >
                            ★
                        </button>
                        {isCustom && (
                            <div
                                className='button m-5 button'
                                onClick={(e) => { e.stopPropagation(); removeCustomCompany(stock.symbol); }}
                                title='Remove custom company'
                            >
                                🗑️
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
});

const POSITION_STORAGE_KEY = 'tradeViewPositions';
const ALERT_THRESHOLD_STORAGE_KEY = 'tradeViewAlertThresholds';
const ALERT_BEHAVIOR_STORAGE_KEY = 'tradeViewAlertBehavior';
const BUY_QTY_STORAGE_KEY = 'tradeViewBuyQty';
const SELL_QTY_STORAGE_KEY = 'tradeViewSellQty';
const CUSTOM_STOCKS_STORAGE_KEY = 'tradeViewCustomStocks';
const COLLAPSE_STORAGE_KEY = 'tradeViewCollapsed';
const SPREAD_PANEL_COLLAPSE_STORAGE_KEY = 'tradeViewSpreadPanelCollapsed';
const PRICE_CACHE_STORAGE_KEY = 'tradeViewPrices';
const NETWORK_ENABLED_STORAGE_KEY = 'tradeViewNetworkEnabled';
const OVERALL_SPREAD_GLOBAL_STORAGE_KEY = 'tradeViewOverallSpreadGlobal';

const createMapFromStocks = (stocks, factory) => stocks.reduce((acc, stock) => {
    acc[stock.symbol] = factory(stock.symbol);
    return acc;
}, {});

const DEFAULT_POSITIONS = createMapFromStocks(STOCKS, () => ({ quantity: 0, avgCost: 0, datePurchased: null, dateSold: null }));
const DEFAULT_ALERT_BEHAVIOR = createMapFromStocks(STOCKS, () => ({ cooldownMs: 60000, hysteresisPct: 0.25 }));
const DEFAULT_ALERT_THRESHOLDS = createMapFromStocks(STOCKS, () => ({ above: 0, below: 0 }));
const DEFAULT_BUY_QTY = createMapFromStocks(STOCKS, () => '1');
const DEFAULT_SELL_QTY = createMapFromStocks(STOCKS, () => '1');

const loadJson = (key, fallback) => {
    try {
        const parsed = JSON.parse(localStorage.getItem(key) || 'null');
        return parsed || fallback;
    } catch {
        return fallback;
    }
};

const mergeWithDefaults = (defaults, stored) => {
    const merged = { ...defaults };
    Object.keys(defaults).forEach((key) => {
        const entry = stored?.[key];
        if (entry && typeof entry === 'object') {
            merged[key] = { ...defaults[key], ...entry };
        } else if (entry !== undefined && typeof defaults[key] !== 'object') {
            merged[key] = entry;
        }
    });
    Object.keys(stored || {}).forEach((key) => {
        if (merged[key] !== undefined) return;
        const entry = stored[key];
        if (entry === undefined) return;
        merged[key] = entry;
    });
    return merged;
};

const todayIsoDate = () => new Date().toISOString().slice(0, 10);
const formatDate = (value) => (value
    ? new Date(value).toLocaleDateString(undefined, { year: '2-digit', month: 'numeric', day: 'numeric' })
    : '—');

const TradeView = () => {
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    const isLocalDev = host === 'localhost' || host === '127.0.0.1' || host === '::1';
    const [inputValue, setInputValue] = useState('');
    const [symbolSearchQuery, setSymbolSearchQuery] = useState('');
    const [showSymbolDropdown, setShowSymbolDropdown] = useState(false);
    const [activeSymbolSearchIndex, setActiveSymbolSearchIndex] = useState(-1);
    const [networkEnabled, setNetworkEnabled] = useState(() => loadJson(NETWORK_ENABLED_STORAGE_KEY, true) !== false);
    const { results: symbolSearchResults, loading: symbolSearchLoading, loadError: symbolSearchLoadError } = useSymbolSearch(symbolSearchQuery, networkEnabled);
    const activeSearchItemRef = useRef(null);
    const [customStocks, setCustomStocks] = useState(() => {
        const stored = loadJson(CUSTOM_STOCKS_STORAGE_KEY, []);
        if (!Array.isArray(stored)) return [];
        const map = new Map();
        stored.forEach((stock) => {
            const symbol = normalizeSymbol(stock?.symbol);
            if (!symbol) return;
            map.set(symbol, { symbol, name: String(stock?.name || symbol).trim() || symbol });
        });
        return Array.from(map.values());
    });

    const allStocks = useMemo(() => {
        const map = new Map();
        [...STOCKS, ...customStocks].forEach((stock) => {
            const symbol = normalizeSymbol(stock.symbol);
            if (!symbol) return;
            map.set(symbol, { symbol, name: stock.name || symbol });
        });
        return Array.from(map.values());
    }, [customStocks]);

    const tickerProSymbols = useMemo(
        () => allStocks.slice(0, 20).map((stock) => ({ proName: `NASDAQ:${stock.symbol}`, title: stock.name })),
        [allStocks]
    );

    const marketOverviewSymbols = useMemo(
        () => allStocks.slice(0, 6).map((stock) => ({ s: `NASDAQ:${stock.symbol}` })),
        [allStocks]
    );

    const [favorites, setFavorites] = useState(() =>
        JSON.parse(localStorage.getItem('tradeFavorites')) || []
    );
    const [selected, setSelected] = useState(favorites.length ? favorites[0] : STOCKS[0].symbol);
    const [prices, setPrices] = useState(() => loadJson(PRICE_CACHE_STORAGE_KEY, {}));
    const [priceUpdatedAt, setPriceUpdatedAt] = useState({});
    const [quoteStatus, setQuoteStatus] = useState('connecting');
    const [quoteSource, setQuoteSource] = useState('');
    const [quoteIssueReason, setQuoteIssueReason] = useState('');
    const [alerts, setAlerts] = useState([]);
    const [positions, setPositions] = useState(() =>
        mergeWithDefaults(DEFAULT_POSITIONS, loadJson(POSITION_STORAGE_KEY, DEFAULT_POSITIONS))
    );
    const [alertThresholds, setAlertThresholds] = useState(() =>
        mergeWithDefaults(DEFAULT_ALERT_THRESHOLDS, loadJson(ALERT_THRESHOLD_STORAGE_KEY, DEFAULT_ALERT_THRESHOLDS))
    );
    const [alertBehavior, setAlertBehavior] = useState(() =>
        mergeWithDefaults(DEFAULT_ALERT_BEHAVIOR, loadJson(ALERT_BEHAVIOR_STORAGE_KEY, DEFAULT_ALERT_BEHAVIOR))
    );
    const [buyQtyBySymbol, setBuyQtyBySymbol] = useState(() =>
        mergeWithDefaults(DEFAULT_BUY_QTY, loadJson(BUY_QTY_STORAGE_KEY, DEFAULT_BUY_QTY))
    );
    const [sellQtyBySymbol, setSellQtyBySymbol] = useState(() =>
        mergeWithDefaults(DEFAULT_SELL_QTY, loadJson(SELL_QTY_STORAGE_KEY, DEFAULT_SELL_QTY))
    );
    const [alertSpreadBySymbol, setAlertSpreadBySymbol] = useState({});
    const [overallSpreadGlobal, setOverallSpreadGlobal] = useState(() => {
        const saved = loadJson(OVERALL_SPREAD_GLOBAL_STORAGE_KEY, {});
        return {
            enabled: saved?.enabled === true,
            overallSpread: Math.round((Math.max(0, Number(saved?.overallSpread) || 0)) * 100) / 100,
        };
    });
    const [manualPriceBySymbol, setManualPriceBySymbol] = useState({});
    const [orderFeedback, setOrderFeedback] = useState(null);
    const [collapseState, setCollapseState] = useState(() => {
        const saved = loadJson(COLLAPSE_STORAGE_KEY, {});
        return {
            portfolio: saved.portfolio ?? false,
            alerts: saved.alerts ?? false,
            position: saved.position ?? false,
            behavior: saved.behavior ?? false,
            order: saved.order ?? false,
        };
    });
    const [spreadCollapseState, setSpreadCollapseState] = useState(() => {
        const saved = loadJson(SPREAD_PANEL_COLLAPSE_STORAGE_KEY, {});
        return {
            overall: saved.overall ?? false,
            above: saved.above ?? false,
            below: saved.below ?? false,
        };
    });
    const portfolioCollapsed = collapseState.portfolio;
    const alertsCollapsed    = collapseState.alerts;
    const positionCollapsed  = collapseState.position;
    const behaviorCollapsed  = collapseState.behavior;
    const orderCollapsed     = collapseState.order;
    const toggleCollapse = (key) =>
        setCollapseState((prev) => {
            const next = { ...prev, [key]: !prev[key] };
            localStorage.setItem(COLLAPSE_STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    const toggleSpreadPanel = useCallback((key) =>
        setSpreadCollapseState((prev) => {
            const next = { ...prev, [key]: !prev[key] };
            localStorage.setItem(SPREAD_PANEL_COLLAPSE_STORAGE_KEY, JSON.stringify(next));
            return next;
        }), []);

    const lastPriceRef = useRef({});
    const thresholdRef = useRef(alertThresholds);
    const behaviorRef = useRef(alertBehavior);
    const fetchInFlightRef = useRef(false);
    const relayCooldownUntilRef = useRef(0);
    const activeNetworkControllersRef = useRef(new Set());
    const gatesRef = useRef(createMapFromStocks(STOCKS, () => ({
        aboveArmed: true,
        belowArmed: true,
        lastAboveAlertAt: 0,
        lastBelowAlertAt: 0,
    })));

    const defaultPositions = useMemo(
        () => createMapFromStocks(allStocks, () => ({ quantity: 0, avgCost: 0, datePurchased: null, dateSold: null })),
        [allStocks]
    );
    const defaultAlertThresholds = useMemo(
        () => createMapFromStocks(allStocks, () => ({ above: 0, below: 0 })),
        [allStocks]
    );
    const defaultAlertBehavior = useMemo(
        () => createMapFromStocks(allStocks, () => ({ cooldownMs: 60000, hysteresisPct: 0.25 })),
        [allStocks]
    );
    const defaultBuyQty = useMemo(
        () => createMapFromStocks(allStocks, () => '1'),
        [allStocks]
    );
    const defaultSellQty = useMemo(
        () => createMapFromStocks(allStocks, () => '1'),
        [allStocks]
    );

    const debouncedInput = useDebouncedValue(inputValue, 400);

    const filteredStocks = useMemo(() =>
        allStocks.filter(
            s =>
                s.name.toLowerCase().includes(debouncedInput.toLowerCase()) ||
                s.symbol.toLowerCase().includes(debouncedInput.toLowerCase())
        ),
        [allStocks, debouncedInput]
    );

    const allSymbolsSet = useMemo(
        () => new Set(allStocks.map((stock) => stock.symbol)),
        [allStocks]
    );

    const quoteSymbols = useMemo(() => {
        const held = Object.keys(positions).filter((symbol) => Number(positions[symbol]?.quantity) > 0);
        const merged = [selected, ...favorites, ...held].filter(Boolean);
        return Array.from(new Set(merged));
    }, [selected, favorites, positions]);

    const widgetsEnabled = networkEnabled && !isLocalDev;

    useEffect(() => {
        localStorage.setItem('tradeFavorites', JSON.stringify(favorites));
    }, [favorites]);

    useEffect(() => {
        localStorage.setItem(CUSTOM_STOCKS_STORAGE_KEY, JSON.stringify(customStocks));
    }, [customStocks]);

    useEffect(() => {
        const storedPositions = loadJson(POSITION_STORAGE_KEY, {});
        setPositions((prev) => {
            const merged = mergeWithDefaults(defaultPositions, prev);
            // Restore persisted positions for custom stocks not present in prev
            // (dropped from initial state because DEFAULT_POSITIONS only covers built-in stocks)
            Object.keys(defaultPositions).forEach((key) => {
                if (prev[key] === undefined && storedPositions[key] && typeof storedPositions[key] === 'object') {
                    merged[key] = { ...defaultPositions[key], ...storedPositions[key] };
                }
            });
            return merged;
        });
    }, [defaultPositions]);

    useEffect(() => {
        setAlertThresholds((prev) => mergeWithDefaults(defaultAlertThresholds, prev));
    }, [defaultAlertThresholds]);

    useEffect(() => {
        setAlertBehavior((prev) => mergeWithDefaults(defaultAlertBehavior, prev));
    }, [defaultAlertBehavior]);

    useEffect(() => {
        setBuyQtyBySymbol((prev) => mergeWithDefaults(defaultBuyQty, prev));
    }, [defaultBuyQty]);

    useEffect(() => {
        setSellQtyBySymbol((prev) => mergeWithDefaults(defaultSellQty, prev));
    }, [defaultSellQty]);

    useEffect(() => {
        if (!allStocks.length) return;
        if (!allStocks.some((stock) => stock.symbol === selected)) {
            setSelected(allStocks[0].symbol);
        }
    }, [allStocks, selected]);

    useEffect(() => {
        if (!showSymbolDropdown || !symbolSearchQuery.trim() || symbolSearchResults.length === 0) {
            setActiveSymbolSearchIndex(-1);
            return;
        }
        setActiveSymbolSearchIndex(0);
    }, [showSymbolDropdown, symbolSearchQuery, symbolSearchResults]);

    useEffect(() => {
        activeSearchItemRef.current?.scrollIntoView({ block: 'nearest' });
    }, [activeSymbolSearchIndex]);

    useEffect(() => {
        const next = { ...gatesRef.current };
        allStocks.forEach((stock) => {
            if (!next[stock.symbol]) {
                next[stock.symbol] = {
                    aboveArmed: true,
                    belowArmed: true,
                    lastAboveAlertAt: 0,
                    lastBelowAlertAt: 0,
                };
            }
        });
        gatesRef.current = next;
    }, [allStocks]);

    useEffect(() => {
        localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(positions));
    }, [positions]);

    useEffect(() => {
        thresholdRef.current = alertThresholds;
        localStorage.setItem(ALERT_THRESHOLD_STORAGE_KEY, JSON.stringify(alertThresholds));
    }, [alertThresholds]);

    useEffect(() => {
        behaviorRef.current = alertBehavior;
        localStorage.setItem(ALERT_BEHAVIOR_STORAGE_KEY, JSON.stringify(alertBehavior));
    }, [alertBehavior]);

    useEffect(() => {
        localStorage.setItem(BUY_QTY_STORAGE_KEY, JSON.stringify(buyQtyBySymbol));
    }, [buyQtyBySymbol]);

    useEffect(() => {
        localStorage.setItem(SELL_QTY_STORAGE_KEY, JSON.stringify(sellQtyBySymbol));
    }, [sellQtyBySymbol]);

    useEffect(() => {
        localStorage.setItem(PRICE_CACHE_STORAGE_KEY, JSON.stringify(prices));
    }, [prices]);

    useEffect(() => {
        localStorage.setItem(NETWORK_ENABLED_STORAGE_KEY, JSON.stringify(networkEnabled));
    }, [networkEnabled]);

    useEffect(() => {
        localStorage.setItem(OVERALL_SPREAD_GLOBAL_STORAGE_KEY, JSON.stringify(overallSpreadGlobal));
    }, [overallSpreadGlobal]);

    useEffect(() => {
        if (networkEnabled) return;

        activeNetworkControllersRef.current.forEach((controller) => controller.abort());
        activeNetworkControllersRef.current.clear();
        fetchInFlightRef.current = false;
        relayCooldownUntilRef.current = 0;
        setQuoteStatus((prev) => (prev === 'disabled' ? prev : 'disabled'));
        setQuoteSource((prev) => (prev === '' ? prev : ''));
        setQuoteIssueReason((prev) => (prev === 'Network kill switch enabled' ? prev : 'Network kill switch enabled'));
        setShowSymbolDropdown(false);
    }, [networkEnabled]);

    const evaluateAlert = useCallback((symbol, currentPrice, now) => {
        const previousPrice = lastPriceRef.current[symbol];
        const gate = gatesRef.current[symbol];
        const thresholds = thresholdRef.current[symbol] || { above: 0, below: 0 };
        const behavior = behaviorRef.current[symbol] || { cooldownMs: 60000, hysteresisPct: 0.25 };

        const above = Number(thresholds.above) || 0;
        const below = Number(thresholds.below) || 0;
        const cooldownMs = Math.max(0, Number(behavior.cooldownMs) || 0);
        const hysteresisPct = Math.max(0, Number(behavior.hysteresisPct) || 0) / 100;

        if (above > 0 && !gate.aboveArmed && currentPrice <= above * (1 - hysteresisPct)) {
            gate.aboveArmed = true;
        }
        if (below > 0 && !gate.belowArmed && currentPrice >= below * (1 + hysteresisPct)) {
            gate.belowArmed = true;
        }

        const crossedAbove = above > 0 && currentPrice >= above && (previousPrice == null || previousPrice < above);
        const crossedBelow = below > 0 && currentPrice <= below && (previousPrice == null || previousPrice > below);

        if (crossedAbove && gate.aboveArmed && now - gate.lastAboveAlertAt >= cooldownMs) {
            gate.aboveArmed = false;
            gate.lastAboveAlertAt = now;
            setAlerts((prev) => [{ symbol, direction: 'above', threshold: above, price: currentPrice, time: now }, ...prev].slice(0, 50));
        }

        if (crossedBelow && gate.belowArmed && now - gate.lastBelowAlertAt >= cooldownMs) {
            gate.belowArmed = false;
            gate.lastBelowAlertAt = now;
            setAlerts((prev) => [{ symbol, direction: 'below', threshold: below, price: currentPrice, time: now }, ...prev].slice(0, 50));
        }

        lastPriceRef.current[symbol] = currentPrice;
    }, []);

    const fetchWithTimeout = async (url, ms = 5000) => {
        const controller = new AbortController();
        activeNetworkControllersRef.current.add(controller);
        const timer = setTimeout(() => controller.abort(), ms);
        try {
            const resp = await fetch(url, { signal: controller.signal });
            return resp;
        } finally {
            clearTimeout(timer);
            activeNetworkControllersRef.current.delete(controller);
        }
    };

    const getStooqQuoteUrls = (symbol) => {
        const stooqUrl = `https://stooq.com/q/l/?s=${symbol.toLowerCase()}.us&f=sd2t2ohlcv&h&e=csv`;
        const proxiedForDev = `/api/stooq/q/l/?s=${symbol.toLowerCase()}.us&f=sd2t2ohlcv&h&e=csv`;
        const jinaRelay = `https://r.jina.ai/http://stooq.com/q/l/?s=${symbol.toLowerCase()}.us&f=sd2t2ohlcv&h&e=csv`;
        const relayAllowed = Date.now() >= relayCooldownUntilRef.current;

        // Local dev should stay proxy-only to avoid noisy third-party failures.
        if (isLocalDev) {
            return [proxiedForDev];
        }

        return relayAllowed
            ? [jinaRelay, stooqUrl]
            : [stooqUrl];
    };

    const parseStooqClose = (text) => {
        const lines = String(text || '').trim().split('\n');
        // Plain CSV response
        if (lines.length >= 2 && /Symbol,Date,Time,Open,High,Low,Close,Volume/i.test(lines[0])) {
            const cols = lines[1].split(',');
            const close = Number(cols[6]);
            if (Number.isFinite(close) && close > 0) return close;
        }

        // r.jina.ai markdown wrapper: find the first CSV-looking quote line
        const csvLike = lines.find((line) => /\.US,\d{4}-\d{2}-\d{2},\d{2}:\d{2}:\d{2},/.test(line));
        if (csvLike) {
            const cols = csvLike.split(',');
            const close = Number(cols[6]);
            if (Number.isFinite(close) && close > 0) return close;
        }

        return null;
    };

    const fetchStooqPrice = async (symbol) => {
        const urls = getStooqQuoteUrls(symbol);
        let lastErr;
        for (const url of urls) {
            try {
                const resp = await fetchWithTimeout(url, 5000);
                if (url.includes('r.jina.ai') && resp.status === 429) {
                    // Cool down relay retries briefly when rate-limited.
                    relayCooldownUntilRef.current = Date.now() + 2 * 60 * 1000;
                }
                if (!resp.ok) throw new Error(`stooq ${resp.status}`);
                const text = await resp.text();
                const close = parseStooqClose(text);
                if (!Number.isFinite(close) || close <= 0) throw new Error('stooq bad price');
                return close;
            } catch (err) {
                lastErr = err;
            }
        }
        throw lastErr || new Error('stooq unavailable');
    };

    const classifyQuoteError = (err) => {
        if (!err) return 'Quote provider unavailable';
        if (err.name === 'AbortError') return 'Request timed out';
        const msg = String(err.message || err);
        if (msg.includes('429')) return 'Provider rate-limited';
        if (msg.includes('403') || msg.includes('401')) return 'Provider rejected request';
        if (msg.includes('stooq bad price')) return 'Invalid quote payload';
        if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) return 'Network request failed';
        return 'Quote provider unavailable';
    };

    const fetchQuotes = useCallback(async () => {
        if (!networkEnabled) {
            setQuoteStatus((prev) => (prev === 'disabled' ? prev : 'disabled'));
            setQuoteSource((prev) => (prev === '' ? prev : ''));
            setQuoteIssueReason((prev) => (prev === 'Network kill switch enabled' ? prev : 'Network kill switch enabled'));
            return;
        }
        if (fetchInFlightRef.current) return;
        fetchInFlightRef.current = true;
        const now = Date.now();
        setQuoteStatus((prev) => (prev === 'connecting' ? 'connecting' : prev));

        let nextPrices = {};
        let nextUpdatedAt = {};
        let stooqOk = false;
        const errorReasonCounts = {};

        try {
            // Query quotes in small batches to avoid upstream rate-limit spikes.
            const BATCH_SIZE = 6;
            for (let i = 0; i < quoteSymbols.length; i += BATCH_SIZE) {
                const batch = quoteSymbols.slice(i, i + BATCH_SIZE);
                await Promise.allSettled(
                    batch.map(async (symbol) => {
                        try {
                            const price = await fetchStooqPrice(symbol);
                            stooqOk = true;
                            if (lastPriceRef.current[symbol] === price) return;
                            nextPrices[symbol] = price;
                            nextUpdatedAt[symbol] = now;
                            evaluateAlert(symbol, price, now);
                        } catch (err) {
                            const reason = classifyQuoteError(err);
                            errorReasonCounts[reason] = (errorReasonCounts[reason] || 0) + 1;
                            // leave symbol at last known price
                        }
                    })
                );
            }

            if (Object.keys(nextPrices).length) {
                setPrices((prev) => {
                    let changed = false;
                    const merged = { ...prev };
                    Object.keys(nextPrices).forEach((symbol) => {
                        if (prev[symbol] !== nextPrices[symbol]) {
                            merged[symbol] = nextPrices[symbol];
                            changed = true;
                        }
                    });
                    return changed ? merged : prev;
                });

                // Pre-fill manual price input with live quote when no manual value has been entered
                setManualPriceBySymbol((prev) => {
                    const next = { ...prev };
                    Object.keys(nextPrices).forEach((symbol) => {
                        if (!prev[symbol] && nextPrices[symbol] > 0) {
                            next[symbol] = String(nextPrices[symbol]);
                        }
                    });
                    return next;
                });

                setPriceUpdatedAt((prev) => {
                    let changed = false;
                    const merged = { ...prev };
                    Object.keys(nextUpdatedAt).forEach((symbol) => {
                        if (prev[symbol] !== nextUpdatedAt[symbol]) {
                            merged[symbol] = nextUpdatedAt[symbol];
                            changed = true;
                        }
                    });
                    return changed ? merged : prev;
                });

                setQuoteStatus((prev) => {
                    const next = 'live';
                    return prev === next ? prev : next;
                });
                setQuoteSource((prev) => (prev === 'Stooq' ? prev : 'Stooq'));
                setQuoteIssueReason((prev) => (prev === '' ? prev : ''));
            } else if (stooqOk) {
                setQuoteStatus((prev) => {
                    const next = 'live';
                    return prev === next ? prev : next;
                });
                setQuoteSource((prev) => (prev === 'Stooq' ? prev : 'Stooq'));
                setQuoteIssueReason((prev) => (prev === '' ? prev : ''));
            } else {
                const topReason = Object.entries(errorReasonCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([reason]) => reason)[0] || 'Quote provider unavailable';
                setQuoteStatus((prev) => (prev === 'error' ? prev : 'error'));
                setQuoteSource((prev) => (prev === '' ? prev : ''));
                setQuoteIssueReason((prev) => (prev === topReason ? prev : topReason));
            }
        } finally {
            fetchInFlightRef.current = false;
        }
    }, [evaluateAlert, networkEnabled, quoteSymbols]);

    useEffect(() => {
        if (!networkEnabled) return undefined;
        fetchQuotes();
        const id = setInterval(fetchQuotes, 60000);
        return () => clearInterval(id);
    }, [fetchQuotes, networkEnabled]);

    const updatePositionField = (symbol, field, value) => {
        const parsed = Number(value);
        if (!Number.isFinite(parsed)) return;
        setPositions((prev) => ({
            ...prev,
            [symbol]: {
                ...prev[symbol],
                [field]: Math.max(0, parsed),
            },
        }));
    };

    const updateAlertThreshold = (symbol, field, value) => {
        const parsed = Number(value);
        if (!Number.isFinite(parsed)) return;
        setAlertThresholds((prev) => ({
            ...prev,
            [symbol]: {
                ...prev[symbol],
                [field]: Math.max(0, parsed),
            },
        }));
    };

    const updateAlertBehavior = (symbol, field, value) => {
        const parsed = Number(value);
        if (!Number.isFinite(parsed)) return;
        setAlertBehavior((prev) => ({
            ...prev,
            [symbol]: {
                ...prev[symbol],
                [field]: field === 'cooldownMs' ? Math.max(0, Math.round(parsed)) : Math.max(0, parsed),
            },
        }));
    };

    const showOrderFeedback = (type, message) => {
        setOrderFeedback({ type, message });
        setTimeout(() => setOrderFeedback(null), 4000);
    };

    const executeBuy = () => {
        const livePrice = Number(prices[selected]);
        const manualPrice = Number(manualPriceBySymbol[selected]);
        const effectivePrice = manualPrice > 0 ? manualPrice : livePrice;
        const qty = Number(buyQtyBySymbol[selected]);
        if (!Number.isFinite(effectivePrice) || effectivePrice <= 0) {
            setOrderFeedback({ type: 'error', message: 'Enter a price before buying.' });
            setTimeout(() => setOrderFeedback(null), 4000);
            return;
        }
        if (!Number.isFinite(qty) || qty <= 0) {
            setOrderFeedback({ type: 'error', message: 'Enter a valid buy quantity.' });
            setTimeout(() => setOrderFeedback(null), 4000);
            return;
        }

        setPositions((prev) => {
            const current = prev[selected] || { quantity: 0, avgCost: 0, datePurchased: null, dateSold: null };
            const totalQty = current.quantity + qty;
            const totalCost = (current.quantity * current.avgCost) + (qty * effectivePrice);
            const openingNewPosition = Number(current.quantity) <= 0;
            return {
                ...prev,
                [selected]: {
                    quantity: totalQty,
                    avgCost: totalQty > 0 ? (totalCost / totalQty) : 0,
                    datePurchased: openingNewPosition ? todayIsoDate() : (current.datePurchased || todayIsoDate()),
                    dateSold: null,
                },
            };
        });
        showOrderFeedback('buy', `Bought ${qty} share${qty !== 1 ? 's' : ''} of ${selected} @ $${effectivePrice.toFixed(2)}`);
    };

    const executeSell = () => {
        const livePrice = Number(prices[selected]);
        const manualPrice = Number(manualPriceBySymbol[selected]);
        const effectivePrice = manualPrice > 0 ? manualPrice : livePrice;
        const qty = Number(sellQtyBySymbol[selected]);
        const heldQty = Number(positions[selected]?.quantity) || 0;
        if (!Number.isFinite(effectivePrice) || effectivePrice <= 0) {
            setOrderFeedback({ type: 'error', message: 'Enter a price before selling.' });
            setTimeout(() => setOrderFeedback(null), 4000);
            return;
        }
        if (!Number.isFinite(qty) || qty <= 0) {
            setOrderFeedback({ type: 'error', message: 'Enter a valid sell quantity.' });
            setTimeout(() => setOrderFeedback(null), 4000);
            return;
        }
        if (qty > heldQty) {
            setOrderFeedback({ type: 'error', message: 'Sell quantity exceeds shares held.' });
            setTimeout(() => setOrderFeedback(null), 4000);
            return;
        }

        setPositions((prev) => {
            const current = prev[selected] || { quantity: 0, avgCost: 0, datePurchased: null, dateSold: null };
            const nextQty = Math.max(0, current.quantity - qty);
            const fullySold = nextQty === 0;
            return {
                ...prev,
                [selected]: {
                    ...current,
                    quantity: nextQty,
                    avgCost: fullySold ? 0 : current.avgCost,
                    dateSold: fullySold ? todayIsoDate() : null,
                },
            };
        });
        showOrderFeedback('sell', `Sold ${qty} share${qty !== 1 ? 's' : ''} of ${selected} @ $${effectivePrice.toFixed(2)}`);
    };

    const clearAlerts = () => setAlerts([]);

    const removeCustomCompany = useCallback((symbol) => {
        setCustomStocks((prev) => prev.filter((c) => c.symbol !== symbol));
        setFavorites((prev) => prev.filter((f) => f !== symbol));
        setSelected((prev) => {
            if (prev !== symbol) return prev;
            const remaining = allStocks.filter((s) => s.symbol !== symbol);
            return remaining.length ? remaining[0].symbol : STOCKS[0].symbol;
        });
    }, [allStocks]);

    const addCompanyByValues = useCallback((symbol, name) => {
        const sym = normalizeSymbol(symbol);
        if (!sym || !/^[A-Z][A-Z0-9.-]{0,14}$/.test(sym)) return;
        if (allStocks.some((s) => s.symbol === sym)) {
            setSelected(sym);
            setSymbolSearchQuery('');
            setShowSymbolDropdown(false);
            return;
        }
        setCustomStocks((prev) => [...prev, { symbol: sym, name: name || sym }]);
        setSelected(sym);
        setInputValue('');
        setSymbolSearchQuery('');
        setShowSymbolDropdown(false);
    }, [allStocks]);

    const handleSelectSearchResult = useCallback((stock) => {
        addCompanyByValues(stock.symbol, stock.name);
    }, [addCompanyByValues]);

    const handleSymbolSearchKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setShowSymbolDropdown(true);
            setActiveSymbolSearchIndex((prev) => {
                if (!symbolSearchResults.length) return -1;
                return prev < 0 ? 0 : Math.min(prev + 1, symbolSearchResults.length - 1);
            });
            return;
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setShowSymbolDropdown(true);
            setActiveSymbolSearchIndex((prev) => {
                if (!symbolSearchResults.length) return -1;
                return prev <= 0 ? 0 : prev - 1;
            });
            return;
        }

        if (e.key === 'Escape') {
            e.preventDefault();
            setShowSymbolDropdown(false);
            setActiveSymbolSearchIndex(-1);
            return;
        }

        if (e.key === 'Enter') {
            if (showSymbolDropdown && symbolSearchResults.length > 0) {
                e.preventDefault();
                const nextSelection = symbolSearchResults[activeSymbolSearchIndex] || symbolSearchResults[0];
                if (nextSelection) {
                    handleSelectSearchResult(nextSelection);
                }
            }
        }
    };

    const handleManualAdd = () => {
        const sym = normalizeSymbol(symbolSearchQuery);
        if (!sym) {
            window.alert('Enter a stock symbol.');
            return;
        }
        if (!/^[A-Z][A-Z0-9.-]{0,14}$/.test(sym)) {
            window.alert('Use a valid stock symbol (letters, numbers, dot, or dash).');
            return;
        }
        addCompanyByValues(sym, sym);
    };

    // Add/remove favorites
    const toggleFavorite = (symbol) => {
        setFavorites(favorites.includes(symbol)
            ? favorites.filter(f => f !== symbol)
            : [...favorites, symbol]
        );
    };

    const roundMoney = (value) => Math.round((Math.max(0, Number(value) || 0)) * 100) / 100;

    const buildOverallSpreadConfig = useCallback((value) => {
        const overallSpread = roundMoney(value);
        const half = roundMoney(overallSpread / 2);
        return {
            overallSpread,
            aboveSpread: half,
            belowSpread: half,
            isOverride: false,
        };
    }, []);

    const applyOverallSpreadToSymbols = useCallback((symbols, value) => {
        const config = buildOverallSpreadConfig(value);
        setAlertSpreadBySymbol((prev) => {
            const next = { ...prev };
            symbols.forEach((symbol) => {
                next[symbol] = { ...config };
            });
            return next;
        });
    }, [buildOverallSpreadConfig]);

    const getSpreadConfigForSymbol = useCallback((symbol) => {
        const avgCost = Number(positions[symbol]?.avgCost) || 0;
        const aboveThreshold = Number(alertThresholds[symbol]?.above) || 0;
        const belowThreshold = Number(alertThresholds[symbol]?.below) || 0;

        const derivedAbove = roundMoney(Math.max(0, aboveThreshold - avgCost));
        const derivedBelow = roundMoney(Math.max(0, avgCost - belowThreshold));
        const derivedOverall = roundMoney(derivedAbove + derivedBelow);
        const derivedOverride = Math.abs(derivedAbove - derivedBelow) > 0.0001;

        return alertSpreadBySymbol[symbol] || {
            overallSpread: derivedOverall,
            aboveSpread: derivedAbove,
            belowSpread: derivedBelow,
            isOverride: derivedOverride,
        };
    }, [alertSpreadBySymbol, alertThresholds, positions]);

    const updateOverallSpread = useCallback((symbol, value) => {
        if (overallSpreadGlobal.enabled) {
            const trackedSymbols = allStocks.map((stock) => stock.symbol);
            applyOverallSpreadToSymbols(trackedSymbols, value);
            setOverallSpreadGlobal((prev) => ({
                ...prev,
                overallSpread: roundMoney(value),
            }));
            return;
        }

        const config = buildOverallSpreadConfig(value);
        setAlertSpreadBySymbol((prev) => ({
            ...prev,
            [symbol]: config,
        }));
    }, [allStocks, applyOverallSpreadToSymbols, buildOverallSpreadConfig, overallSpreadGlobal.enabled]);

    const updateAboveSpread = useCallback((symbol, value) => {
        const current = getSpreadConfigForSymbol(symbol);
        const aboveSpread = roundMoney(value);
        const belowSpread = roundMoney(current.belowSpread);
        setAlertSpreadBySymbol((prev) => ({
            ...prev,
            [symbol]: {
                overallSpread: roundMoney(aboveSpread + belowSpread),
                aboveSpread,
                belowSpread,
                isOverride: true,
            },
        }));
    }, [getSpreadConfigForSymbol]);

    const updateBelowSpread = useCallback((symbol, value) => {
        const current = getSpreadConfigForSymbol(symbol);
        const aboveSpread = roundMoney(current.aboveSpread);
        const belowSpread = roundMoney(value);
        setAlertSpreadBySymbol((prev) => ({
            ...prev,
            [symbol]: {
                overallSpread: roundMoney(aboveSpread + belowSpread),
                aboveSpread,
                belowSpread,
                isOverride: true,
            },
        }));
    }, [getSpreadConfigForSymbol]);

    const adjustSpread = useCallback((symbol, field, delta) => {
        const current = getSpreadConfigForSymbol(symbol);
        const next = roundMoney((Number(current[field]) || 0) + delta);
        if (field === 'overallSpread') {
            updateOverallSpread(symbol, next);
            return;
        }
        if (field === 'aboveSpread') {
            updateAboveSpread(symbol, next);
            return;
        }
        updateBelowSpread(symbol, next);
    }, [getSpreadConfigForSymbol, updateAboveSpread, updateBelowSpread, updateOverallSpread]);

    const toggleOverallSpreadApplyAll = useCallback((event) => {
        event.stopPropagation();

        if (!overallSpreadGlobal.enabled) {
            const currentOverall = roundMoney(getSpreadConfigForSymbol(selected).overallSpread);
            const trackedSymbols = allStocks.map((stock) => stock.symbol);
            applyOverallSpreadToSymbols(trackedSymbols, currentOverall);
            setOverallSpreadGlobal({ enabled: true, overallSpread: currentOverall });
            return;
        }

        setOverallSpreadGlobal((prev) => ({ ...prev, enabled: false }));
    }, [allStocks, applyOverallSpreadToSymbols, getSpreadConfigForSymbol, overallSpreadGlobal.enabled, selected]);

    useEffect(() => {
        if (!overallSpreadGlobal.enabled) return;
        if (!allStocks.length) return;

        const trackedSymbols = allStocks.map((stock) => stock.symbol);
        applyOverallSpreadToSymbols(trackedSymbols, overallSpreadGlobal.overallSpread);
    }, [allStocks, applyOverallSpreadToSymbols, overallSpreadGlobal.enabled, overallSpreadGlobal.overallSpread]);

    const applySpreadToAlertThresholds = (symbol) => {
        const avgCost = Number(positions[symbol]?.avgCost) || 0;
        if (avgCost <= 0) {
            window.alert('Set Avg Cost greater than 0 before applying spread-based alerts.');
            return;
        }

        const spread = getSpreadConfigForSymbol(symbol);
        const nextAbove = roundMoney(avgCost + (Number(spread.aboveSpread) || 0));
        const nextBelow = roundMoney(Math.max(0, avgCost - (Number(spread.belowSpread) || 0)));
        updateAlertThreshold(symbol, 'above', nextAbove);
        updateAlertThreshold(symbol, 'below', nextBelow);
    };

    const selectedPrice = Number(prices[selected]) || 0;
    const selectedPosition = positions[selected] || { quantity: 0, avgCost: 0, datePurchased: null, dateSold: null };
    const selectedSpreadConfig = getSpreadConfigForSymbol(selected);
    const selectedAvgCost = Number(selectedPosition.avgCost) || 0;
    const selectedSpreadDisabled = selectedAvgCost <= 0;
    const selectedSpreadMax = Math.max(10, roundMoney(selectedAvgCost * 2 || 10));
    const selectedMarketValue = selectedPosition.quantity * selectedPrice;
    const selectedCostBasis = selectedPosition.quantity * selectedPosition.avgCost;
    const selectedPnl = selectedMarketValue - selectedCostBasis;
    const selectedPnlPct = selectedCostBasis > 0 ? (selectedPnl / selectedCostBasis) * 100 : 0;
    const selectedUpdatedAt = priceUpdatedAt[selected];
    const hasCachedQuoteForSelected = Boolean(selectedUpdatedAt);
    const isUsingCachedQuotes = (quoteStatus === 'error' || quoteStatus === 'disabled') && hasCachedQuoteForSelected;
    const quoteFeedLabel = quoteStatus === 'disabled'
        ? 'Disabled'
        : quoteStatus === 'live'
        ? `Live (${quoteSource || 'source'})`
        : isUsingCachedQuotes
            ? 'Degraded (cached)'
            : quoteStatus === 'error'
                ? 'Unavailable'
                : 'Connecting...';
    const quoteFeedHint = quoteStatus === 'disabled'
        ? hasCachedQuoteForSelected
            ? 'Network activity disabled. Showing last cached quote only.'
            : 'Network activity disabled. Live quotes and external widgets are paused.'
        : isUsingCachedQuotes
        ? relayCooldownUntilRef.current > Date.now()
            ? 'Provider throttled. Retrying relay soon.'
            : `Live fetch failed (${quoteIssueReason || 'provider unavailable'}). Showing last successful quote.`
        : '';
    const quoteBadgeLabel = quoteStatus === 'disabled'
        ? 'off'
        : quoteStatus === 'live'
        ? 'live'
        : isUsingCachedQuotes
            ? 'cached'
            : quoteStatus === 'error'
                ? 'offline'
                : 'sync';
    const quoteBadgeClass = quoteStatus === 'disabled'
        ? 'bg-red color-yellow'
        : quoteStatus === 'live'
        ? 'bg-green color-yellow'
        : isUsingCachedQuotes
            ? 'bg-yellow color-dark'
            : quoteStatus === 'error'
                ? 'bg-red color-yellow'
                : 'bg-tinted color-soft';
    const quoteBadgeTitle = quoteStatus === 'disabled'
        ? 'All TradeView network activity is disabled.'
        : quoteStatus === 'live'
        ? 'Live quotes updating normally.'
        : isUsingCachedQuotes
            ? `Using cached quote: ${quoteIssueReason || 'live feed unavailable'}`
            : quoteStatus === 'error'
                ? `Quote feed unavailable: ${quoteIssueReason || 'unknown issue'}`
                : 'Syncing latest quotes...';

    const portfolioHoldings = useMemo(() => {
        return allStocks
            .map((stock) => {
                const symbol = stock.symbol;
                const position = positions[symbol] || { quantity: 0, avgCost: 0, datePurchased: null, dateSold: null };
                const shares = Number(position.quantity) || 0;
                const avgCost = Number(position.avgCost) || 0;
                const price = Number(prices[symbol]) || 0;
                const cost = shares * avgCost;
                const value = shares * price;
                const pnl = value - cost;
                return {
                    symbol,
                    shares,
                    cost,
                    value,
                    pnl,
                    datePurchased: position.datePurchased || null,
                    dateSold: position.dateSold || null,
                };
            })
            .filter((row) => row.shares > 0 || row.dateSold)
            .sort((a, b) => a.symbol.localeCompare(b.symbol));
            }, [allStocks, positions, prices]);

    const portfolioSnapshot = useMemo(() => {
        return portfolioHoldings.reduce((acc, row) => {
            acc.value += row.value;
            acc.cost += row.cost;
            return acc;
        }, { value: 0, cost: 0 });
    }, [portfolioHoldings]);

    const portfolioPnl = portfolioSnapshot.value - portfolioSnapshot.cost;
    const portfolioPnlPct = portfolioSnapshot.cost > 0
        ? (portfolioPnl / portfolioSnapshot.cost) * 100
        : 0;

    return (
        <div className='mt--30'>
            <div className=''>
                <div className='color-yellow contentLeft'>
                    <div className='containerDetail m-5 p-20 size20 bg-lite'>
                        {icons.tradeview} Market Watch
                    </div>
                    <div className='containerDetail m-5 p-10 bg-dark flexContainer'>
                        <div className='flex2Column color-soft size12'>
                            Network Kill Switch
                        </div>
                        <div className='flex2Column contentRight'>
                            <button
                                type='button'
                                className={`containerDetail button p-10 ${networkEnabled ? 'bg-green color-yellow' : 'bg-red color-yellow'}`}
                                onClick={() => setNetworkEnabled((prev) => !prev)}
                                title={networkEnabled ? 'Disable all TradeView network activity' : 'Re-enable TradeView network activity'}
                            >
                                {networkEnabled ? 'ON' : 'OFF'}
                            </button>
                        </div>
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
                        {widgetsEnabled ? (
                            <div className='containerDetail ml-5 mr-5 mb-5 pt-10 bg-dark'>
                                <div className='ml-5 mr-5'>
                                    <TickerTape
                                        symbols={tickerProSymbols}
                                        theme='dark'
                                        isTransparent={false}
                                        displayMode='adaptive'
                                        showSymbolLogo={true}
                                    />
                                </div>
                                <div className='mt--30 ml-5 mr-5'>
                                    <TickerTape
                                        symbols={tickerProSymbols}
                                        theme='dark'
                                        isTransparent={false}
                                        displayMode='adaptive'
                                        showSymbolLogo={true}
                                    />
                                </div>
                                <div className='mt--25 mr-5 ml-5'>
                                    <MarketOverview
                                        symbols={marketOverviewSymbols}
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
                        ) : (
                            <div className='containerDetail ml-5 mr-5 mb-5 p-20 bg-dark color-soft'>
                                {isLocalDev
                                    ? 'External market widgets are disabled during local development.'
                                    : 'External market widgets disabled by network kill switch.'}
                            </div>
                        )}
                    </div>
                    <div className='containerDetail m-5 bg-lite'>
                        <input
                            type='text'
                            placeholder='Search companies...'
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            className='containerDetail size20 p-10 m-10 width--20 color-yellow bg-dark'
                        />
                        <div className='ml-5 mr-5 mb-10 symbol-search-container'>
                            <input
                                type='text'
                                placeholder='Search by name or ticker to add...'
                                value={symbolSearchQuery}
                                disabled={!networkEnabled}
                                onChange={(e) => { setSymbolSearchQuery(e.target.value); setShowSymbolDropdown(true); }}
                                onFocus={() => setShowSymbolDropdown(true)}
                                onBlur={() => setTimeout(() => setShowSymbolDropdown(false), 200)}
                                onKeyDown={handleSymbolSearchKeyDown}
                                className='containerDetail p-10 color-yellow bg-dark width-100-percent'
                                aria-expanded={showSymbolDropdown}
                                aria-autocomplete='list'
                                aria-controls='tradeview-symbol-search-results'
                            />
                            {!networkEnabled ? (
                                <div className='containerDetail p-10 mt-5 color-soft bg-dark'>
                                    Network kill switch is on. Company lookup and remote widgets are paused.
                                </div>
                            ) : null}
                            {showSymbolDropdown && symbolSearchQuery.trim() && (
                                <div className='symbol-search-dropdown' id='tradeview-symbol-search-results'>
                                    {symbolSearchLoading && (
                                        <div className='symbol-search-state color-soft'>Loading stock list...</div>
                                    )}
                                    {!symbolSearchLoading && symbolSearchLoadError && (
                                        <div className='symbol-search-state color-red'>Search list unavailable. You can still add an exact ticker.</div>
                                    )}
                                    {symbolSearchResults.map((q, index) => (
                                        <div
                                            key={q.symbol}
                                            ref={index === activeSymbolSearchIndex ? activeSearchItemRef : null}
                                            className={`symbol-search-item${index === activeSymbolSearchIndex ? ' active' : ''}`}
                                            onMouseDown={() => handleSelectSearchResult(q)}
                                        >
                                            <div className='symbol-search-copy'>
                                                <div className='symbol-search-header'>
                                                    <span className='symbol-search-symbol color-yellow'>{q.symbol}</span>
                                                    <div className='symbol-search-badges'>
                                                        {q.exchange ? <span className='symbol-search-badge'>{q.exchange}</span> : null}
                                                        <span className='symbol-search-badge'>{q.type === 'ETF' ? 'ETF' : 'Stock'}</span>
                                                        {allSymbolsSet.has(q.symbol) ? <span className='symbol-search-badge symbol-search-badge-added'>Added</span> : null}
                                                    </div>
                                                </div>
                                                <div className='symbol-search-name color-soft'>{q.name}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {!symbolSearchLoading && !symbolSearchLoadError && symbolSearchResults.length === 0 && (
                                        <div className='symbol-search-state color-soft'>No matches found. Press Add to use the exact ticker you typed.</div>
                                    )}
                                </div>
                            )}
                            <div
                                className='containerDetail p-10 button bg-green color-yellow mt-5 contentCenter'
                                onClick={handleManualAdd}
                                title='Add company by ticker'
                            >
                                Add
                            </div>
                        </div>
                        <TradeViewStockList
                            filteredStocks={filteredStocks}
                            selected={selected}
                            setSelected={setSelected}
                            favorites={favorites}
                            toggleFavorite={toggleFavorite}
                            customStocks={customStocks}
                            removeCustomCompany={removeCustomCompany}
                        />
                    </div>
                    <div className='containerDetail'>
                        <div
                            className='containerDetail button p-10 bg-tinted contentLeft size20'
                            onClick={() => toggleCollapse('portfolio')}
                        >
                            {portfolioCollapsed ? '▸' : '▾'} Portfolio Snapshot
                        </div>
                        {portfolioCollapsed ? null : (
                            <div className='containerDetail mt-5'>
                                <div className='containerDetail m-5'>
                                    <div className='flexContainer mt-20 ml-5 mr-5'>
                                        <div className='flex3Column color-yellow'>Value</div>
                                        <div className='flex3Column contentRight color-neogreen'>${portfolioSnapshot.value.toFixed(2)}</div>
                                    </div>
                                    <div className='flexContainer mt-5 ml-5 mr-5'>
                                        <div className='flex3Column color-yellow'>Cost</div>
                                        <div className='flex3Column contentRight color-red'>${portfolioSnapshot.cost.toFixed(2)}</div>
                                    </div>
                                    <div className='flexContainer mt-5 ml-5 mr-5'>
                                        <div className='flex3Column color-yellow'>P/L</div>
                                        <div className={`flex3Column contentRight ${portfolioPnl >= 0 ? 'color-neogreen' : 'color-red'}`}>
                                            {portfolioPnl >= 0 ? '+' : ''}${portfolioPnl.toFixed(2)} ({portfolioPnlPct.toFixed(2)}%)
                                        </div>
                                    </div>
                                </div>

                                    <div className='flexContainer size12 color-soft mt-20 ml-10 mr-20'>
                                        <div className='flex6Column'>Stock</div>
                                        <div className='flex8Column contentLeftt'>Dates</div>
                                        <div className='flex9Column contentRight'>Shares</div>
                                        <div className='flex6Column contentRight'>Cost</div>
                                        <div className='flex6Column contentRight'>Value</div>
                                        <div className='flex6Column contentRight'>P/L</div>
                                    </div>
                                    <div className='containerDetail ht-100 scroll mt-5'>
                                        {portfolioHoldings.length === 0 ? (
                                            <div className='containerDetail p-10 mt-5 color-soft bg-dark'>No stocks owned yet.</div>
                                        ) : portfolioHoldings.map((row) => (
                                            <div key={row.symbol} className='flexContainer ml-5 mr-5'>
                                                <div className='flex6Column color-yellow'>{row.symbol}</div>
                                                <div className='flex8Column contentLeft color-soft copyright'>
                                                    {
                                                        (row.datePurchased) && (
                                                            <div className='color-neogreen'>{formatDate(row.datePurchased)} {`>`}</div>
                                                        )
                                                    }
                                                    {
                                                        (row.dateSold) && (
                                                            <div className='mt--10 color-dkRed'>S: {formatDate(row.dateSold)} {`<`}</div>
                                                        )
                                                    }
                                                </div>
                                                <div className='flex9Column contentRight color-lite'>{row.shares.toFixed(1)}</div>
                                                <div className='flex6Column contentRight color-red'>${row.cost.toFixed(2)}</div>
                                                <div className='flex6Column contentRight color-neogreen'>${row.value.toFixed(2)}</div>
                                                <div className={`flex6Column contentRight ${row.pnl >= 0 ? 'color-neogreen' : 'color-red'}`}>
                                                    {row.pnl >= 0 ? '+' : ''}${row.pnl.toFixed(2)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                            </div>
                        )}

                        <div
                            className='containerDetail button p-10 bg-tinted contentLeft size20 mt-5'
                            onClick={() => toggleCollapse('alerts')}
                        >
                            {alertsCollapsed ? '▸' : '▾'} Alerts
                        </div>
                        {alertsCollapsed ? null : (
                            <div className='containerDetail bg-dark p-10 mt-5'>
                                <div className='contentRight mb-5'>
                                    <button
                                        className='containerDetail p-10 color-yellow bg-lite'
                                        onClick={clearAlerts}
                                    >
                                        Clear Alerts
                                    </button>
                                </div>
                                {alerts.length === 0 ? (
                                    <div className='color-soft'>No alerts yet</div>
                                ) : (
                                    <>
                                        <div className='flexContainer mb-10'>
                                            <div className='flex9Column contentLeftt color-yellow size12 mr-1 mb-5'>Symbol</div>
                                            <div className='flex2Column contentLeft color-yellow size12 ml-10 mb-5'>Time</div>
                                            <div className='flex2Column contentRight color-yellow size12 mr-1 mb-5'>Threshold</div>
                                            <div className='flex2Column contentRight color-yellow size12 mr-10 mb-5'>Value</div>
                                            <div className='flex2Column contentRight color-yellow size12 mb-5'>Gain/Loss</div>
                                        </div>
                                        {alerts.map((a, idx) => {
                                            const gainLoss = a.price - a.threshold;
                                            const gainLossColor = gainLoss > 0 ? 'color-neogreen' : gainLoss < 0 ? 'color-red' : 'color-soft';
                                            return (
                                                <div key={`${a.symbol}-${a.time}-${idx}`} className='flexContainer mb-5'>
                                                    <div className='flex9Column color-yellow'>{a.symbol}</div>
                                                    <div className='flex5Column contentRight color-soft'>
                                                        {new Date(a.time).toLocaleTimeString()}
                                                    </div>
                                                    <div className={`flex5Column contentRight ${a.direction === 'above' ? 'color-neogreen' : 'color-red'}`}>
                                                        {a.direction === 'above' ? '▲' : '▼'} ${a.threshold.toFixed(2)}
                                                    </div>
                                                    <div className={`flex5Column contentRight ${a.direction === 'above' ? 'color-neogreen' : 'color-red'}`}>
                                                        ${a.price.toFixed(2)}
                                                    </div>
                                                    <div className={`flex4Column contentRight ${gainLossColor}`}>
                                                        {gainLoss > 0 ? '+' : ''}{gainLoss.toFixed(2)} ({((gainLoss / a.threshold) * 100).toFixed(2)}%)
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </>
                                )}
                            </div>
                        )}

                        <div
                            className='containerDetail button p-10 bg-tinted contentLeft size20 mt-5'
                            onClick={() => toggleCollapse('position')}
                        >
                            {positionCollapsed ? '▸' : '▾'} Position ({selected})
                        </div>
                        {positionCollapsed ? null : (
                            <div className='containerDetail bg-dark p-10 mt-5'>
                                <div className='flexContainer'>
                                    <div className='flex2Column color-yellow'>Qty</div>
                                    <div className='flex2Column contentRight color-neogreen'>{selectedPosition.quantity.toFixed(4)}</div>
                                </div>
                                <div className='flexContainer mt-5'>
                                    <div className='flex2Column color-yellow'>Avg Cost</div>
                                    <div className='flex2Column contentRight color-yellow'>${selectedPosition.avgCost.toFixed(2)}</div>
                                </div>
                                <div className='flexContainer mt-5'>
                                    <div className='flex2Column color-yellow'>Market Value</div>
                                    <div className={`flex2Column contentRight ${selectedPnl >= 0 ? 'color-neogreen' : 'color-red'}`}>${selectedMarketValue.toFixed(2)}</div>
                                </div>
                                <div className='flexContainer mt-5'>
                                    <div className='flex2Column color-yellow'>P/L</div>
                                    <div className={`flex2Column contentRight ${selectedPnl >= 0 ? 'color-neogreen' : 'color-red'}`}>
                                        {selectedPnl >= 0 ? '+' : ''}${selectedPnl.toFixed(2)} ({selectedPnlPct.toFixed(2)}%)
                                    </div>
                                </div>
                                <div className='flexContainer mt-10'>
                                    <div className='flex2Column'>
                                        <div className='size12 color-soft mb-5'>Quantity</div>
                                        <input
                                            type='number'
                                            min='0'
                                            step='0.0001'
                                            value={selectedPosition.quantity}
                                            onChange={(e) => updatePositionField(selected, 'quantity', e.target.value)}
                                            className='containerDetail p-10 width-100-percent color-yellow bg-tinted'
                                        />
                                    </div>
                                    <div className='flex2Column ml-5'>
                                        <div className='size12 color-soft mb-5'>Avg Cost</div>
                                        <input
                                            type='number'
                                            min='0'
                                            step='0.01'
                                            value={selectedPosition.avgCost}
                                            onChange={(e) => updatePositionField(selected, 'avgCost', e.target.value)}
                                            className='containerDetail p-10 width-100-percent color-yellow bg-tinted'
                                        />
                                    </div>
                                </div>
                                <div className='flexContainer mt-5'>
                                    <div className='flex2Column color-soft'>Purchased</div>
                                    <div className='flex2Column contentRight color-soft'>{formatDate(selectedPosition.datePurchased)}</div>
                                </div>
                                <div className='flexContainer mt-5'>
                                    <div className='flex2Column color-soft'>Sold</div>
                                    <div className='flex2Column contentRight color-soft'>{formatDate(selectedPosition.dateSold)}</div>
                                </div>
                            </div>
                        )}

                        <div
                            className='containerDetail button bg-tinted contentLeft size20 mt-5'
                            onClick={() => toggleCollapse('behavior')}
                        >
                            {behaviorCollapsed ? '▸' : '▾'} Alert Behaviour ({selected})
                        </div>
                        {behaviorCollapsed ? null : (
                            <div className='containerDetail bg-dark mt-5'>
                                <div className=''>
                                    <div className='containerDetail bg-dkYellow'>
                                        <div
                                            className='containerDetail button flexContainer bg-lite p-10 bg-dkYellow brdr-yellow'
                                            onClick={() => toggleSpreadPanel('overall')}
                                        >
                                            <div className='flex1Column size20 color-yellow'>
                                                {spreadCollapseState.overall ? '▸' : '▾'} Overall Spread ${selectedSpreadConfig.overallSpread.toFixed(2)}
                                                {selectedSpreadConfig.isOverride ? <span className='ml-5 color-red'>(overridden)</span> : ''}
                                            </div>
                                            <div className='contentRight'>
                                                <button
                                                    type='button'
                                                    className={`containerDetail button p-5 size12 ${overallSpreadGlobal.enabled ? 'bg-green color-yellow' : 'bg-lite color-soft'}`}
                                                    onClick={toggleOverallSpreadApplyAll}
                                                    title={overallSpreadGlobal.enabled
                                                        ? 'Applied to all tracked offerings and new offerings.'
                                                        : 'Apply to all tracked offerings and new offerings.'}
                                                >
                                                    {overallSpreadGlobal.enabled ? 'Applied to All' : 'Apply to All'}
                                                </button>
                                            </div>
                                        </div>
                                        {spreadCollapseState.overall ? null : (
                                            <div className='mt-10'>
                                                <div className='width-100-percent'>
                                                    <input
                                                        type='range'
                                                        min='0'
                                                        max={selectedSpreadMax}
                                                        step='0.01'
                                                        value={selectedSpreadConfig.overallSpread}
                                                        disabled={selectedSpreadDisabled}
                                                        onChange={(e) => updateOverallSpread(selected, e.target.value)}
                                                        className='width-100-percent mt-10'
                                                    />
                                                    <div className='containerDetail flexContainer mt-5 brdr-yellow bg-dkYellow'>
                                                        <div className='flex5Column flexContainer'>
                                                            <div
                                                                disabled={selectedSpreadDisabled}
                                                                className='containerDetail flexColumn m-1 button p-10 bg-lite color-yellow flex5Column'
                                                                onClick={() => adjustSpread(selected, 'overallSpread', -1)}
                                                            >
                                                                -1
                                                            </div>
                                                            <div
                                                                disabled={selectedSpreadDisabled}
                                                                className='containerDetail flexColumn m-1 button p-10 bg-lite color-yellow'
                                                                onClick={() => adjustSpread(selected, 'overallSpread', -0.1)}
                                                            >
                                                                -.10
                                                            </div>
                                                            <div
                                                                disabled={selectedSpreadDisabled}
                                                                className='containerDetail flexColumn m-1 button p-10 bg-lite color-yellow'
                                                                onClick={() => adjustSpread(selected, 'overallSpread', -0.01)}
                                                            >
                                                                -.01
                                                            </div>
                                                        </div>
                                                        <div className='flex5Column'>
                                                            <CurrencyInput
                                                                value={selectedSpreadConfig.overallSpread}
                                                                onChange={(e) => updateOverallSpread(selected, e.target.value)}
                                                                className='containerDetail p-10 width-100-percent color-yellow bg-dark contentCenter'
                                                            />
                                                        </div>
                                                        <div className='flex5Column ml-5 contentRight flexContainer'>
                                                            <div
                                                                disabled={selectedSpreadDisabled}
                                                                className='containerDetail flexColumn m-1 button p-10 bg-lite color-yellow'
                                                                onClick={() => adjustSpread(selected, 'overallSpread', 0.01)}
                                                            >
                                                                +.01
                                                            </div>
                                                            <div
                                                                disabled={selectedSpreadDisabled}
                                                                className='containerDetail flexColumn m-1 button p-10 bg-lite color-yellow'
                                                                onClick={() => adjustSpread(selected, 'overallSpread', 0.1)}
                                                            >
                                                                +.10
                                                            </div>
                                                            <div
                                                                disabled={selectedSpreadDisabled}
                                                                className='containerDetail flexColumn m-1 button p-10 bg-lite color-yellow'
                                                                onClick={() => adjustSpread(selected, 'overallSpread', 1)}
                                                            >
                                                                +1
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className='mt-5'>
                                            <div className='containerDetail bg-dkGreen'>
                                                <div
                                                    className='containerDetail button p-10 flexContainer bg-dkGreen brdr-green'
                                                    onClick={() => toggleSpreadPanel('above')}
                                                >
                                                    <div className='flex1Column size20 color-neogreen'>
                                                        {spreadCollapseState.above ? '▸' : '▾'} Above Spread +${selectedSpreadConfig.aboveSpread.toFixed(2)}
                                                    </div>
                                                </div>
                                                {spreadCollapseState.above ? null : (
                                                    <div className='mt-10'>
                                                        <input
                                                            type='range'
                                                            min='0'
                                                            max={selectedSpreadMax}
                                                            step='0.01'
                                                            value={selectedSpreadConfig.aboveSpread}
                                                            disabled={selectedSpreadDisabled}
                                                            onChange={(e) => updateAboveSpread(selected, e.target.value)}
                                                            className='width-100-percent'
                                                        />
                                                        <div className='containerDetail bg-dkGreen flexContainer brdr-green mt-5'>
                                                            <div className='flex5Column flexContainer'>
                                                                <div
                                                                    disabled={selectedSpreadDisabled}
                                                                    className='containerDetail flexColumn m-1 button p-10 bg-lite color-yellow flex5Column'
                                                                    onClick={() => adjustSpread(selected, 'aboveSpread', -1)}
                                                                >
                                                                    -1
                                                                </div>
                                                                <div
                                                                    disabled={selectedSpreadDisabled}
                                                                    className='containerDetail flexColumn m-1 button p-10 bg-lite color-yellow'
                                                                    onClick={() => adjustSpread(selected, 'aboveSpread', -0.1)}
                                                                >
                                                                    -.10
                                                                </div>
                                                                <div
                                                                    disabled={selectedSpreadDisabled}
                                                                    className='containerDetail flexColumn m-1 button p-10 bg-lite color-yellow'
                                                                    onClick={() => adjustSpread(selected, 'aboveSpread', -0.01)}
                                                                >
                                                                    -.01
                                                                </div>
                                                            </div>
                                                            <div className='flex5Column'>
                                                                <CurrencyInput
                                                                    value={selectedSpreadConfig.aboveSpread}
                                                                    onChange={(e) => updateAboveSpread(selected, e.target.value)}
                                                                    className='containerDetail p-10 width-100-percent color-neogreen bg-dark contentCenter'
                                                                />
                                                            </div>
                                                            <div className='flex5Column ml-5 contentRight flexContainer'>
                                                                <div
                                                                    disabled={selectedSpreadDisabled}
                                                                    className='containerDetail flexColumn m-1 button p-10 bg-lite color-yellow'
                                                                    onClick={() => adjustSpread(selected, 'aboveSpread', 0.01)}
                                                                >
                                                                    +.01
                                                                </div>
                                                                <div
                                                                    disabled={selectedSpreadDisabled}
                                                                    className='containerDetail flexColumn m-1 button p-10 bg-lite color-yellow'
                                                                    onClick={() => adjustSpread(selected, 'aboveSpread', 0.1)}
                                                                >
                                                                    +.10
                                                                </div>
                                                                <div
                                                                    disabled={selectedSpreadDisabled}
                                                                    className='containerDetail flexColumn m-1 button p-10 bg-lite color-yellow'
                                                                    onClick={() => adjustSpread(selected, 'aboveSpread', 1)}
                                                                >
                                                                    +1
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <BelowSpreadPanel
                                                selected={selected}
                                                belowSpread={selectedSpreadConfig.belowSpread}
                                                selectedSpreadMax={selectedSpreadMax}
                                                selectedSpreadDisabled={selectedSpreadDisabled}
                                                collapsed={spreadCollapseState.below}
                                                onToggle={toggleSpreadPanel}
                                                onUpdate={updateBelowSpread}
                                                onAdjust={adjustSpread}
                                            />
                                        </div>
                                    </div>
                                    <div className='size12 color-soft mt-5'>
                                        Basis: Avg Cost ${selectedAvgCost.toFixed(2)}
                                        {selectedSpreadDisabled ? ' (set Avg Cost first)' : ''}
                                    </div>
                                    <div
                                        className={`containerDetail mt-10 mb-10 width-100-percent button p-10 size12 contentCenter ${selectedSpreadDisabled ? 'bg-tinted color-soft' : 'bg-yellow color-dark'}`}
                                        onClick={() => applySpreadToAlertThresholds(selected)}
                                    >
                                        APPLY
                                    </div>
                                </div>
                                <div className='flexContainer'>
                                    <div className='flex2Column'>
                                        <div className='size12 color-neogreen mb-5'>Alert Above</div>
                                        <CurrencyInput
                                            value={alertThresholds[selected]?.above || 0}
                                            onChange={(e) => updateAlertThreshold(selected, 'above', e.target.value)}
                                            className='containerDetail p-10 width-100-percent color-neogreen bg-tinted'
                                        />
                                    </div>
                                    <div className='flex2Column ml-5'>
                                        <div className='size12 color-red mb-5'>Alert Below</div>
                                        <CurrencyInput
                                            value={alertThresholds[selected]?.below || 0}
                                            onChange={(e) => updateAlertThreshold(selected, 'below', e.target.value)}
                                            className='containerDetail p-10 width-100-percent color-red bg-tinted'
                                        />
                                    </div>
                                </div>
                                <div className='flexContainer mt-10'>
                                    <div className='flex2Column'>
                                        <div className='size12 color-soft mb-5'>Cooldown (ms)</div>
                                        <input
                                            type='number'
                                            min='0'
                                            step='1000'
                                            value={alertBehavior[selected]?.cooldownMs || 0}
                                            onChange={(e) => updateAlertBehavior(selected, 'cooldownMs', e.target.value)}
                                            className='containerDetail p-10 width-100-percent color-yellow bg-tinted'
                                        />
                                    </div>
                                    <div className='flex2Column ml-5'>
                                        <div className='size12 color-soft mb-5'>Hysteresis %</div>
                                        <input
                                            type='number'
                                            min='0'
                                            step='0.05'
                                            value={alertBehavior[selected]?.hysteresisPct || 0}
                                            onChange={(e) => updateAlertBehavior(selected, 'hysteresisPct', e.target.value)}
                                            className='containerDetail p-10 width-100-percent color-yellow bg-tinted'
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div
                            className='containerDetail button p-10 bg-tinted contentLeft size20 mt-5'
                            onClick={() => toggleCollapse('order')}
                        >
                            {orderCollapsed ? '▸' : '▾'} Buy / Sell ({selected})
                        </div>
                        {orderCollapsed ? null : (
                            <div className='containerDetail mt-5 p-10'>
                                <div className='flexContainer'>
                                    <div className='flex2Column color-yellow'>Live Price</div>
                                    <div className='flex2Column contentRight color-neogreen'>
                                        {selectedPrice > 0 ? `$${selectedPrice.toFixed(2)}` : 'Fetching...'}
                                        <span className={`containerDetail p-5 ml-5 size12 ${quoteBadgeClass}`} title={quoteBadgeTitle}>
                                            {quoteBadgeLabel}
                                        </span>
                                    </div>
                                </div>
                                <div className='size12 mt-5 color-soft'>
                                    Quote feed: {quoteFeedLabel}
                                </div>
                                {quoteFeedHint ? (
                                    <div className='size12 mt-5 color-yellow'>
                                        {quoteFeedHint}
                                    </div>
                                ) : null}
                                <div className='flexContainer mt-5'>
                                    <div className='flex2Column color-yellow'>
                                        Last Update
                                    </div>
                                    <div className='flex2Column contentRight color-soft'>
                                        {selectedUpdatedAt ? new Date(selectedUpdatedAt).toLocaleTimeString() : '—'}
                                    </div>
                                </div>
                                <div className='flexContainer mt-10'>
                                    <div className='flex1Column'>
                                        <div className='size12 color-soft mb-5'>Price Override</div>
                                        <CurrencyInput
                                            value={manualPriceBySymbol[selected] || ''}
                                            onChange={(e) => setManualPriceBySymbol((prev) => ({ ...prev, [selected]: e.target.value }))}
                                            className='containerDetail p-10 width-100-percent color-neogreen bg-tinted'
                                        />
                                    </div>
                                </div>
                                {orderFeedback && (
                                    <div className={`containerDetail mt-10 p-10 size14 ${
                                        orderFeedback.type === 'buy' ? 'bg-green color-yellow' :
                                        orderFeedback.type === 'sell' ? 'bg-red color-yellow' :
                                        'bg-tinted color-red'
                                    }`}>
                                        {orderFeedback.message}
                                    </div>
                                )}
                                <div className='containerDetail mt-10 bg-lite'>
                                    <div className='containerDetail flexContainer bg-lite'>
                                        <div className='flex2Column'>
                                            <div className='size12 color-soft mb-5'>Buy Quantity</div>
                                            <input
                                                type='number'
                                                min='0'
                                                step='0.0001'
                                                value={buyQtyBySymbol[selected] || '1'}
                                                onChange={(e) => setBuyQtyBySymbol((prev) => ({ ...prev, [selected]: e.target.value }))}
                                                className='containerDetail p-10 width-100-percent color-yellow bg-tinted'
                                            />
                                        </div>
                                        <div className='flex2Column ml-5 contentRight'>
                                            <div className='size12 color-soft mb-5'>Est. Cost</div>
                                            <div className='containerDetail p-10 color-lite bg-tinted'>
                                                ${((Number(buyQtyBySymbol[selected]) || 0) * (Number(manualPriceBySymbol[selected]) || selectedPrice)).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className='containerDetail mt-5 button p-20 bg-green color-yellow size20' onClick={executeBuy}>
                                        Buy {selected}
                                    </div>
                                </div>
                                <div className='containerDetail mt-10 bg-lite'>
                                    <div className='containerDetail flexContainer bg-lite'>
                                        <div className='flex2Column'>
                                            <div className='size12 color-soft mb-5'>Sell Quantity</div>
                                            <input
                                                type='number'
                                                min='0'
                                                step='0.0001'
                                                value={sellQtyBySymbol[selected] || '1'}
                                                onChange={(e) => setSellQtyBySymbol((prev) => ({ ...prev, [selected]: e.target.value }))}
                                                className='containerDetail p-10 width-100-percent color-yellow bg-tinted'
                                            />
                                        </div>
                                        <div className='flex2Column ml-5 contentRight'>
                                            <div className='size12 color-soft mb-5'>Est. Proceeds</div>
                                            <div className='containerDetail p-10 color-lite bg-tinted'>
                                                ${((Number(sellQtyBySymbol[selected]) || 0) * (Number(manualPriceBySymbol[selected]) || selectedPrice)).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className='containerDetail mt-5 button p-20 bg-red color-yellow size20' onClick={executeSell}>
                                        Sell {selected}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className='containerDetail m-5 color-yellow bg-lite p-5'>
                        <div className='containerDetail p-20 size20 m-5 bg-lite'>Stock Vitals: {selected}</div>
                        {widgetsEnabled ? (
                            <TradingViewWidget symbol={selected} height={400} />
                        ) : (
                            <div className='containerDetail p-20 m-5 bg-dark color-soft'>
                                {isLocalDev
                                    ? 'Stock chart is disabled during local development.'
                                    : 'Stock chart disabled by network kill switch.'}
                            </div>
                        )}
                    </div>
                    <div className='containerDetail color-yellow m-5 bg-lite'>
                        <div className='containerDetail color-yellow p-20 size20 m-5 bg-lite'>
                            Favorites
                        </div>
                        <div className='containerDetail p-10 m-5 size20 color-lite bg-dark'>
                            {favorites.length === 0 && <div className='color-soft'>No favorites selected.</div>}
                            {favorites.map(symbol => {
                                const stock = allStocks.find(s => s.symbol === symbol);
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
                    {widgetsEnabled ? (
                        <TradingViewNews
                            symbol={selected}
                            width='100%'
                            theme='dark'
                            colorTheme='dark'
                            height={400}
                            isTransparent={true}
                        />
                    ) : (
                        <div className='containerDetail p-20 bg-dark color-soft'>
                            {isLocalDev
                                ? 'Market news is disabled during local development.'
                                : 'Market news disabled by network kill switch.'}
                        </div>
                    )}
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