import { useEffect, useRef, useState, useCallback, ChangeEvent } from 'react';
import ToggleCollapse from './CollapseToggleButton';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
} from 'recharts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Pair = 'XBT/USD' | 'ETH/USD' | 'SOL/USD';
type WsStatus = 'connecting' | 'live' | 'error';
type AlertDirection = 'above' | 'below';

interface TradeTick {
    price: number;
    time: number;
}

interface AlertRecord {
    pair: Pair;
    price: number;
    time: number;
    threshold: number;
    direction: AlertDirection;
}

interface ChartPoint {
    time: string;
    price: number;
    ma5: number;
    ma12: number;
}

interface PairThresholds {
    above: number;
    below: number;
}

interface PairPosition {
    quantity: number;
    avgCost: number;
}

interface PairAlertGate {
    aboveArmed: boolean;
    belowArmed: boolean;
    lastAboveAlertAt: number;
    lastBelowAlertAt: number;
}

interface PairAlertBehavior {
    cooldownMs: number;
    hysteresisPct: number;
}

type TradesState = Partial<Record<Pair, TradeTick[]>>;
type BufferState = Partial<Record<Pair, TradeTick[]>>;
type AlertThresholds = Record<Pair, PairThresholds>;
type PositionsState = Record<Pair, PairPosition>;
type AlertBehaviorState = Record<Pair, PairAlertBehavior>;
type PairCollapseState = Record<Pair, boolean>;

// Kraken v1 trade message shape:
// [channelId, [[price, volume, time, side, orderType, misc], ...], 'trade', 'ETH/USD']
type KrakenTradeEntry = [string, string, string, string, string, string];
type KrakenTradeMessage = [number, KrakenTradeEntry[], 'trade', Pair];

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WS_URL = 'wss://ws.kraken.com';

const PAIRS: Pair[] = ['XBT/USD', 'ETH/USD', 'SOL/USD'];

const PAIR_LABELS: Record<Pair, string> = {
    'XBT/USD': 'BTC/USD',
    'ETH/USD': 'ETH/USD',
    'SOL/USD': 'SOL/USD',
};

const ALERT_RULES: AlertThresholds = {
    'XBT/USD': { above: 80000, below: 65000 },
    'ETH/USD': { above: 4500, below: 3000 },
    'SOL/USD': { above: 150, below: 80 },
};

const ALERT_OPTIONS: Record<Pair, number[]> = {
    'XBT/USD': [35000, 40000, 45000, 50000, 55000, 60000, 65000, 70000, 75000, 80000, 85000, 90000, 95000, 100000, 105000],
    'ETH/USD': [500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500],
    'SOL/USD': [10, 20, 30, 40, 50, 60, 80, 90, 100, 125, 150, 175, 200, 225, 250, 275, 300, 325, 350, 375, 400, 425, 450, 475, 500],
};

const ALERT_STORAGE_KEY = 'traderAlertThresholds2';
const POSITION_STORAGE_KEY = 'traderPositions';
const ALERT_BEHAVIOR_STORAGE_KEY = 'traderAlertBehavior';
const AUTO_REORDER_STORAGE_KEY = 'traderAutoReorder';

const DEFAULT_POSITIONS: PositionsState = {
    'XBT/USD': { quantity: 0, avgCost: 0 },
    'ETH/USD': { quantity: 0, avgCost: 0 },
    'SOL/USD': { quantity: 0, avgCost: 0 },
};

const DEFAULT_ALERT_BEHAVIOR: AlertBehaviorState = {
    'XBT/USD': { cooldownMs: 60_000, hysteresisPct: 0.0025 },
    'ETH/USD': { cooldownMs: 60_000, hysteresisPct: 0.0025 },
    'SOL/USD': { cooldownMs: 60_000, hysteresisPct: 0.0025 },
};

const COOLDOWN_PRESETS_SEC: number[] = [0, 15, 30, 60, 120, 300];
const HYSTERESIS_PRESETS_PCT: number[] = [0.05, 0.1, 0.25, 0.5, 1, 2];

const SUBSCRIBE_MSG = JSON.stringify({
    event: 'subscribe',
    pair: PAIRS,
    subscription: { name: 'trade' },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadThresholds(): AlertThresholds {
    try {
        const saved = JSON.parse(
            localStorage.getItem(ALERT_STORAGE_KEY) ?? 'null'
        ) as Record<string, unknown> | null;
        if (!saved) return ALERT_RULES;
        const merged: AlertThresholds = { ...ALERT_RULES };
        (Object.keys(ALERT_RULES) as Pair[]).forEach((pair) => {
            const entry = saved[pair] as Record<string, unknown> | undefined;
            if (entry && typeof entry === 'object') {
                const above = Number(entry['above']);
                const below = Number(entry['below']);
                merged[pair] = {
                    above: Number.isFinite(above) ? above : ALERT_RULES[pair].above,
                    below: Number.isFinite(below) ? below : ALERT_RULES[pair].below,
                };
            }
        });
        return merged;
    } catch {
        return ALERT_RULES;
    }
}

function isKrakenTradeMessage(msg: unknown): msg is KrakenTradeMessage {
    return (
        Array.isArray(msg) &&
        msg.length === 4 &&
        msg[2] === 'trade' &&
        Array.isArray(msg[1])
    );
}

function loadPositions(): PositionsState {
    try {
        const saved = JSON.parse(
            localStorage.getItem(POSITION_STORAGE_KEY) ?? 'null'
        ) as Record<string, unknown> | null;
        if (!saved) return DEFAULT_POSITIONS;

        const merged: PositionsState = { ...DEFAULT_POSITIONS };
        (Object.keys(DEFAULT_POSITIONS) as Pair[]).forEach((pair) => {
            const entry = saved[pair] as Record<string, unknown> | undefined;
            if (entry && typeof entry === 'object') {
                const quantity = Number(entry['quantity']);
                const avgCost = Number(entry['avgCost']);
                merged[pair] = {
                    quantity: Number.isFinite(quantity) ? Math.max(0, quantity) : 0,
                    avgCost: Number.isFinite(avgCost) ? Math.max(0, avgCost) : 0,
                };
            }
        });
        return merged;
    } catch {
        return DEFAULT_POSITIONS;
    }
}

function createInitialAlertGates(): Record<Pair, PairAlertGate> {
    return PAIRS.reduce((acc, pair) => {
        acc[pair] = {
            aboveArmed: true,
            belowArmed: true,
            lastAboveAlertAt: 0,
            lastBelowAlertAt: 0,
        };
        return acc;
    }, {} as Record<Pair, PairAlertGate>);
}

function loadAlertBehavior(): AlertBehaviorState {
    try {
        const saved = JSON.parse(
            localStorage.getItem(ALERT_BEHAVIOR_STORAGE_KEY) ?? 'null'
        ) as Record<string, unknown> | null;
        if (!saved) return DEFAULT_ALERT_BEHAVIOR;

        const merged: AlertBehaviorState = { ...DEFAULT_ALERT_BEHAVIOR };
        (Object.keys(DEFAULT_ALERT_BEHAVIOR) as Pair[]).forEach((pair) => {
            const entry = saved[pair] as Record<string, unknown> | undefined;
            if (entry && typeof entry === 'object') {
                const cooldownMs = Number(entry['cooldownMs']);
                const hysteresisPct = Number(entry['hysteresisPct']);
                merged[pair] = {
                    cooldownMs:
                        Number.isFinite(cooldownMs) && cooldownMs >= 0
                            ? Math.round(cooldownMs)
                            : DEFAULT_ALERT_BEHAVIOR[pair].cooldownMs,
                    hysteresisPct:
                        Number.isFinite(hysteresisPct) && hysteresisPct >= 0
                            ? hysteresisPct
                            : DEFAULT_ALERT_BEHAVIOR[pair].hysteresisPct,
                };
            }
        });
        return merged;
    } catch {
        return DEFAULT_ALERT_BEHAVIOR;
    }
}

function createPairCollapseState(collapsedByDefault: boolean): PairCollapseState {
    return PAIRS.reduce((acc, pair) => {
        acc[pair] = collapsedByDefault;
        return acc;
    }, {} as PairCollapseState);
}

function loadAutoReorder(): boolean {
    try {
        const saved = localStorage.getItem(AUTO_REORDER_STORAGE_KEY);
        if (saved == null) return true;
        return saved === 'true';
    } catch {
        return true;
    }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Crypto(): JSX.Element {
    const [trades, setTrades] = useState<TradesState>({});
    const [alerts, setAlerts] = useState<AlertRecord[]>([]);
    const [wsStatus, setWsStatus] = useState<WsStatus>('connecting');
    const [alertThresholds, setAlertThresholds] = useState<AlertThresholds>(loadThresholds);
    const [positions, setPositions] = useState<PositionsState>(loadPositions);
    const [alertBehavior, setAlertBehavior] = useState<AlertBehaviorState>(loadAlertBehavior);
    const [positionCollapsedByPair, setPositionCollapsedByPair] = useState<PairCollapseState>(() => createPairCollapseState(true));
    const [behaviorCollapsedByPair, setBehaviorCollapsedByPair] = useState<PairCollapseState>(() => createPairCollapseState(true));
    const [chartCollapsedByPair, setChartCollapsedByPair] = useState<PairCollapseState>(() => createPairCollapseState(true));
    const [portfolioCollapsed, setPortfolioCollapsed] = useState<boolean>(false);
    const [autoReorder, setAutoReorder] = useState<boolean>(loadAutoReorder);

    const socketRef = useRef<WebSocket | null>(null);
    const bufferRef = useRef<BufferState>({});
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const failCountRef = useRef<number>(0);
    const alertThresholdsRef = useRef<AlertThresholds>(alertThresholds);
    const alertBehaviorRef = useRef<AlertBehaviorState>(alertBehavior);
    const lastPriceRef = useRef<Partial<Record<Pair, number>>>({});
    const alertGatesRef = useRef<Record<Pair, PairAlertGate>>(createInitialAlertGates());

    // Keep ref in sync and persist to localStorage whenever thresholds change
    useEffect(() => {
        alertThresholdsRef.current = alertThresholds;
        localStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify(alertThresholds));
    }, [alertThresholds]);

    useEffect(() => {
        localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(positions));
    }, [positions]);

    useEffect(() => {
        alertBehaviorRef.current = alertBehavior;
        localStorage.setItem(ALERT_BEHAVIOR_STORAGE_KEY, JSON.stringify(alertBehavior));
    }, [alertBehavior]);

    useEffect(() => {
        localStorage.setItem(AUTO_REORDER_STORAGE_KEY, String(autoReorder));
    }, [autoReorder]);

    const connect = useCallback((): void => {
        setWsStatus('connecting');

        let ws: WebSocket;
        try {
            ws = new WebSocket(WS_URL);
        } catch {
            setWsStatus('error');
            return;
        }
        socketRef.current = ws;

        ws.onopen = (): void => {
            failCountRef.current = 0;
            setWsStatus('live');
            ws.send(SUBSCRIBE_MSG);
        };

        ws.onmessage = (event: MessageEvent<string>): void => {
            try {
                const msg: unknown = JSON.parse(event.data);
                if (!isKrakenTradeMessage(msg)) return;

                const pair = msg[3];
                const rawTrades = msg[1];
                const now = Date.now();

                rawTrades.forEach(([price]) => {
                    const parsedPrice = parseFloat(price);
                    if (!Number.isFinite(parsedPrice)) return;

                    if (!bufferRef.current[pair]) bufferRef.current[pair] = [];
                    bufferRef.current[pair]!.push({ price: parsedPrice, time: now });

                    const previousPrice = lastPriceRef.current[pair];
                    const { above: aboveThreshold, below: belowThreshold } = alertThresholdsRef.current[pair];
                    const { cooldownMs, hysteresisPct } = alertBehaviorRef.current[pair];
                    const gates = alertGatesRef.current[pair];

                    const aboveResetLevel = aboveThreshold * (1 - hysteresisPct);
                    const belowResetLevel = belowThreshold * (1 + hysteresisPct);

                    if (!gates.aboveArmed && parsedPrice <= aboveResetLevel) {
                        gates.aboveArmed = true;
                    }
                    if (!gates.belowArmed && parsedPrice >= belowResetLevel) {
                        gates.belowArmed = true;
                    }

                    const crossedAbove =
                        Number.isFinite(aboveThreshold) &&
                        parsedPrice >= aboveThreshold &&
                        (previousPrice == null || previousPrice < aboveThreshold);
                    const crossedBelow =
                        Number.isFinite(belowThreshold) &&
                        parsedPrice <= belowThreshold &&
                        (previousPrice == null || previousPrice > belowThreshold);

                    const aboveCooldownPassed = now - gates.lastAboveAlertAt >= cooldownMs;
                    const belowCooldownPassed = now - gates.lastBelowAlertAt >= cooldownMs;

                    if (crossedAbove && gates.aboveArmed && aboveCooldownPassed) {
                        gates.aboveArmed = false;
                        gates.lastAboveAlertAt = now;
                        setAlerts((prev) => [
                            { pair, price: parsedPrice, time: now, threshold: aboveThreshold, direction: 'above' },
                            ...prev.slice(0, 20),
                        ]);
                    }
                    if (crossedBelow && gates.belowArmed && belowCooldownPassed) {
                        gates.belowArmed = false;
                        gates.lastBelowAlertAt = now;
                        setAlerts((prev) => [
                            { pair, price: parsedPrice, time: now, threshold: belowThreshold, direction: 'below' },
                            ...prev.slice(0, 20),
                        ]);
                    }

                    lastPriceRef.current[pair] = parsedPrice;
                });
            } catch {
                // silently discard malformed frames
            }
        };

        ws.onclose = (): void => {
            failCountRef.current += 1;
            setWsStatus('connecting');
            const delay = Math.min(2000 * failCountRef.current, 10_000);
            reconnectRef.current = setTimeout(() => connect(), delay);
        };

        ws.onerror = (): void => ws.close();
    }, []);

    useEffect(() => {
        connect();
        return () => {
            if (socketRef.current) {
                socketRef.current.onclose = null;
                socketRef.current.close();
            }
            if (intervalRef.current != null) clearInterval(intervalRef.current);
            if (reconnectRef.current != null) clearTimeout(reconnectRef.current);
        };
    }, [connect]);

    // Flush buffer to state every 500 ms
    useEffect(() => {
        intervalRef.current = setInterval(() => {
            const buf = bufferRef.current;
            const keys = Object.keys(buf) as Pair[];
            if (keys.length === 0) return;

            setTrades((prev) => {
                const updated = { ...prev };
                keys.forEach((pair) => {
                    const incoming = buf[pair];
                    if (incoming && incoming.length > 0) {
                        updated[pair] = [...incoming, ...(prev[pair] ?? [])].slice(0, 50);
                        buf[pair] = [];
                    }
                });
                return updated;
            });
        }, 500);
        return () => {
            if (intervalRef.current != null) clearInterval(intervalRef.current);
        };
    }, []);

    const updateAlertThreshold = useCallback((pair: Pair, direction: AlertDirection, nextValue: string): void => {
        const parsed = Number(nextValue);
        if (!Number.isFinite(parsed)) return;
        setAlertThresholds((prev) => ({
            ...prev,
            [pair]: { ...prev[pair], [direction]: parsed },
        }));
    }, []);

    const updatePositionField = useCallback(
        (pair: Pair, field: keyof PairPosition, nextValue: string): void => {
            const parsed = Number(nextValue);
            if (!Number.isFinite(parsed)) return;

            setPositions((prev) => ({
                ...prev,
                [pair]: {
                    ...prev[pair],
                    [field]: Math.max(0, parsed),
                },
            }));
        },
        [],
    );

    const updateAlertBehaviorField = useCallback(
        (pair: Pair, field: keyof PairAlertBehavior, nextValue: string): void => {
            const parsed = Number(nextValue);
            if (!Number.isFinite(parsed)) return;

            setAlertBehavior((prev) => {
                const current = prev[pair];
                if (field === 'cooldownMs') {
                    const cooldownSec = Math.max(0, parsed);
                    return {
                        ...prev,
                        [pair]: {
                            ...current,
                            cooldownMs: Math.round(cooldownSec * 1000),
                        },
                    };
                }

                const hysteresisPct = Math.max(0, Math.min(10, parsed)) / 100;
                return {
                    ...prev,
                    [pair]: {
                        ...current,
                        hysteresisPct,
                    },
                };
            });
        },
        [],
    );

    const resetAlertBehaviorForPair = useCallback((pair: Pair): void => {
        setAlertBehavior((prev) => ({
            ...prev,
            [pair]: { ...DEFAULT_ALERT_BEHAVIOR[pair] },
        }));

        alertGatesRef.current[pair] = {
            aboveArmed: true,
            belowArmed: true,
            lastAboveAlertAt: 0,
            lastBelowAlertAt: 0,
        };
    }, []);

    const clearAlerts = useCallback((): void => {
        setAlerts([]);
    }, []);

    const getSeriesWithMovingAverages = useCallback(
        (pairTrades: TradeTick[] | undefined): ChartPoint[] => {
            const chronological = (pairTrades ?? []).slice().reverse();
            return chronological.map((trade, index, series) => {
                const ma5Window = series.slice(Math.max(0, index - 4), index + 1);
                const ma12Window = series.slice(Math.max(0, index - 11), index + 1);
                const ma5 = ma5Window.reduce((sum, t) => sum + t.price, 0) / ma5Window.length;
                const ma12 = ma12Window.reduce((sum, t) => sum + t.price, 0) / ma12Window.length;
                return {
                    time: new Date(trade.time).toLocaleTimeString(),
                    price: trade.price,
                    ma5,
                    ma12,
                };
            });
        },
        [],
    );

    const statusColor =
        wsStatus === 'live' ? '#00c853' : wsStatus === 'error' ? '#d50000' : '#aaa';

    const latestPrices: Partial<Record<Pair, number>> = PAIRS.reduce((acc, pair) => {
        const latest = trades[pair]?.[0]?.price;
        if (latest != null) acc[pair] = latest;
        return acc;
    }, {} as Partial<Record<Pair, number>>);

    const portfolioMetrics = PAIRS.reduce(
        (acc, pair) => {
            const price = latestPrices[pair] ?? 0;
            const { quantity, avgCost } = positions[pair];
            const marketValue = price * quantity;
            const costBasis = avgCost * quantity;
            acc.totalValue += marketValue;
            acc.totalCost += costBasis;
            return acc;
        },
        { totalValue: 0, totalCost: 0 },
    );

    const portfolioPnl = portfolioMetrics.totalValue - portfolioMetrics.totalCost;
    const portfolioPnlPct =
        portfolioMetrics.totalCost > 0
            ? (portfolioPnl / portfolioMetrics.totalCost) * 100
            : 0;

    const nowMs = Date.now();
    const getUrgencyScore = (pair: Pair): number => {
        const pairTrades = trades[pair] ?? [];
        const latestTime = pairTrades[0]?.time;
        const tickAgeSec = latestTime != null ? (nowMs - latestTime) / 1000 : Number.POSITIVE_INFINITY;
        const isStale = tickAgeSec > 15;

        let score = 0;
        if (isStale) score += 100;

        const recentAlert = alerts.find((a) => a.pair === pair);
        if (recentAlert) {
            const alertAgeSec = (nowMs - recentAlert.time) / 1000;
            if (alertAgeSec <= 600) {
                score += Math.max(0, 60 - alertAgeSec / 10);
            }
        }

        const latest = pairTrades[0]?.price;
        const baseline = pairTrades[Math.min(pairTrades.length - 1, 19)]?.price;
        if (latest != null && baseline != null && baseline > 0) {
            const movePct = Math.abs((latest - baseline) / baseline) * 100;
            score += Math.min(movePct * 3, 50);
        }

        return score;
    };

    const orderedPairs = autoReorder
        ? PAIRS.slice().sort((a, b) => getUrgencyScore(b) - getUrgencyScore(a))
        : PAIRS;

    const getTooltipSeriesColor = (seriesName: string): string => {
        if (seriesName === 'price') return '#f5b400';
        if (seriesName === 'ma5') return '#00c853';
        if (seriesName === 'ma12') return '#42a5f5';
        return '#f9fafb';
    };

    return (
        <div className='containerDetail ml-5 mr-5 bg-lite color-lite mt--25'>
            {/* Header */}
            <div className='containerDetail flexContainer bg-lite contentLeft'>
                <div className='p-20 size20 contentLeft color-yellow'>
                    📊 Crypto Watch
                </div>
                <span style={{ color: statusColor, fontSize: '0.8em' }}>
                    ● {wsStatus === 'live' ? 'LIVE' : wsStatus === 'error' ? 'ERROR' : 'CONNECTING…'}
                </span>
            </div>
            <div className='containerDetail bg-tinted p-10 size12 color-yellow mt-5'>
                <ToggleCollapse
                    title={<span className='color-yellow'>Portfolio Snapshot</span>}
                    description={
                        portfolioCollapsed
                            ? <span className={`${portfolioPnl >= 0 ? 'color-neogreen' : 'color-red'}`}>
                                Value ${portfolioMetrics.totalValue.toFixed(2)} | Cost ${portfolioMetrics.totalCost.toFixed(2)} | P/L {portfolioPnl >= 0 ? '+' : ''}${portfolioPnl.toFixed(2)} ({portfolioPnlPct.toFixed(2)}%)
                            </span>
                            : null
                    }
                    component={null}
                    isCollapsed={portfolioCollapsed}
                    setCollapse={setPortfolioCollapsed}
                    align='left'
                    bold={false}
                    editTitle={null}
                    icon={null}
                />
                {portfolioCollapsed ? null : (
                    <div className='containerDetail bg-tinted contentLeft'>
                        <div className='color-lite flexContainer'>
                            <div className='bg-tinted color-yellow flex3Column contentRight mt-5 mb-5 ml-5 pt-5 mb-5 pr-10'>Value:</div>
                            <div className={`bg-tinted pt-5 pb-5 pr-10 mt-5 mb-5 ml-5 flex3Column contentRight ${portfolioMetrics.totalValue >= portfolioMetrics.totalCost ? 'color-neogreen' : 'color-red'}`}>${portfolioMetrics.totalValue.toFixed(2)}</div>
                            <div className={`bg-tinted flex3Column p-10 m-5 contentRight ${portfolioPnl >= 0 ? 'color-neogreen' : 'color-red'}`}></div>
                        </div>
                        <div className='color-lite flexContainer mt--5'>
                            <div className='bg-tinted color-yellow flex3Column contentRight mt-5 mb-5 ml-5 pt-5 pb-5 pr-10'>Cost: </div>
                            <div className='bg-tinted pt-5 pb-5 pr-10 mt-5 mb-5 ml-5 flex3Column contentRight color-red'>${portfolioMetrics.totalCost.toFixed(2)}</div>
                            <div className={`bg-tinted flex3Column p-10 m-5 contentRight ${portfolioPnl >= 0 ? 'color-neogreen' : 'color-red'}`}></div>
                        </div>
                        <div className='color-lite flexContainer mt--5'>
                            <div className='bg-tinted color-yellow flex3Column contentRight mt-5 mb-5 ml-5 pt-5 pb-5 pr-10'>P/L: </div>
                            <div className={`bg-tinted pt-5 pb-5 pr-10 mt-5 mb-5 ml-5 flex3Column contentRight ${portfolioPnl >= 0 ? 'color-neogreen' : 'color-red'}`}>{portfolioPnl >= 0 ? '+' : ''}${portfolioPnl.toFixed(2)}</div>
                            <div className={`bg-tinted flex3Column p-5 m-5 contentCenter ${portfolioPnl >= 0 ? 'color-neogreen' : 'color-red'}`}>({portfolioPnlPct.toFixed(2)}%)</div>
                        </div>
                    </div>
                )}
            </div>
            {/* Alerts Panel */}
            <div className='containerDetail bg-tinted mt-5 contentLeft'>
                <div className='containerDetail bg-tinted p-10 mb-5 color-orange size20 contentLeft flexContainer'>
                    <div className='flex3Column'>🔔 Alerts</div>
                    <div className='flex2Column contentRight'>
                        <button
                            type='button'
                            onClick={clearAlerts}
                            className='containerDetail p-10 color-yellow bg-lite'
                        >
                            Clear Window
                        </button>
                    </div>
                </div>
                <div className='containerDetail bg-tinted height-100 scroll p-10'>
                    {alerts.length === 0 ? (
                        <div>No alerts yet</div>
                    ) : (
                        alerts.map((a, i) => (
                            <div key={i} className='color-lite flexContainer contentLeft'>
                                <div className='flex8Column'>
                                    <span className='color-yellow'>{PAIR_LABELS[a.pair]}</span>{' '}
                                </div>
                                <div className={`flex4Column contentRight color-orange`}>
                                    ${a.threshold.toFixed(2)}🔔 <span className={a.direction === 'above' ? 'color-neogreen' : 'color-red'}>{a.direction === 'above' ? ' ▲ ' : ' ▼ '}</span>
                                </div>
                                <div className={`flex6Column contentRight pr-5 ${a.direction === 'above' ? 'color-neogreen' : 'color-red'}`}>
                                    ${a.price.toFixed(2)}
                                </div>
                                <div className={`flex4Column contentLeft ${a.direction === 'above' ? ' color-neogreen' : 'color-red'}`}>
                                    {' ⏰ '}{new Date(a.time).toLocaleTimeString()}{' '}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <div className='containerDetail bg-tinted p-10 mt-5 mb-5'>
                <label className='size10 color-lite flexContainer contentRight'>
                    <span className='mr-10 color-yellow'>Auto Reorder</span>
                    <input
                        type='checkbox'
                        checked={autoReorder}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setAutoReorder(e.target.checked)
                        }
                    />
                </label>
            </div>

            {/* Asset Cards */}
            <div className='containerDetail bg-tinted mt-5 contentLeft'>
                {orderedPairs.map((pair) => {
                    const pairTrades = trades[pair];
                    const data = getSeriesWithMovingAverages(pairTrades);
                    const latest = pairTrades?.[0]?.price;
                    const latestTickTime = pairTrades?.[0]?.time;
                    const { above: aboveThreshold, below: belowThreshold } = alertThresholds[pair];
                    const { cooldownMs, hysteresisPct } = alertBehavior[pair];
                    const { quantity, avgCost } = positions[pair];
                    const isPositionCollapsed = positionCollapsedByPair[pair];
                    const isBehaviorCollapsed = behaviorCollapsedByPair[pair];
                    const isChartCollapsed = chartCollapsedByPair[pair];
                    const cooldownSec = Math.round(cooldownMs / 1000);
                    const hysteresisPctDisplay = Number((hysteresisPct * 100).toFixed(2));
                    const latestPoint: ChartPoint | undefined = data[data.length - 1];
                    const marketValue = latest != null ? latest * quantity : 0;
                    const costBasis = avgCost * quantity;
                    const pnl = marketValue - costBasis;
                    const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
                    const tickAgeSec = latestTickTime
                        ? Math.floor((Date.now() - latestTickTime) / 1000)
                        : null;
                    const isStale = tickAgeSec != null && tickAgeSec > 15;
                    const recentAlert = alerts.find((a) => a.pair === pair);
                    const recentAlertAgeSec = recentAlert
                        ? Math.floor((Date.now() - recentAlert.time) / 1000)
                        : null;

                    const baseOptions = ALERT_OPTIONS[pair];
                    const makeSelectOptions = (val: number): number[] =>
                        !baseOptions.includes(val)
                            ? [...baseOptions, val].sort((a, b) => a - b)
                            : baseOptions;
                    const snapToNearestOption = (rawValue: number, options: number[]): number => {
                        return options.reduce((closest, option) => {
                            return Math.abs(option - rawValue) < Math.abs(closest - rawValue)
                                ? option
                                : closest;
                        }, options[0]);
                    };
                    const cooldownOptions = COOLDOWN_PRESETS_SEC.includes(cooldownSec)
                        ? COOLDOWN_PRESETS_SEC
                        : [...COOLDOWN_PRESETS_SEC, cooldownSec].sort((a, b) => a - b);
                    const hysteresisOptions = HYSTERESIS_PRESETS_PCT.includes(hysteresisPctDisplay)
                        ? HYSTERESIS_PRESETS_PCT
                        : [...HYSTERESIS_PRESETS_PCT, hysteresisPctDisplay].sort((a, b) => a - b);

                    return (
                        <div
                            key={pair}
                            className='containerDetail size20 p-10 m-5 color-yellow bg-tinted contentLeft'
                        >
                            <div className='contentLeft'>
                                <div className='flexContainer'>
                                    <div className='flex2Column'>
                                        <div className='flexContainer '>
                                            <div className='flex2Column size20'>
                                                {PAIR_LABELS[pair]}
                                                <div
                                                    onClick={() => {
                                                        setChartCollapsedByPair((prev) => ({
                                                            ...prev,
                                                            [pair]: !prev[pair],
                                                        }));
                                                    }}
                                                    className='containerDetail button size12 color-yellow bg-green mt-5 w-100 p-10 contentCenter'
                                                >
                                                    {isChartCollapsed ? 'Reveal Chart' : 'Hide Chart'}
                                                </div>
                                            </div>
                                            <div className='flexColumn contentRight'>
                                                {recentAlertAgeSec != null && recentAlertAgeSec <= 600 ? (
                                                    <div className='size10 color-yellow mt--10'>
                                                        Priority: recent alert {recentAlertAgeSec}s ago
                                                    </div>
                                                ) : null}
                                                <div className={`size10 mt--10 ${isStale ? 'color-red' : 'color-lite'}`}>
                                                    Tick age: {tickAgeSec != null ? `${tickAgeSec}s` : '—'}
                                                    {isStale ? ' (stale)' : ''}
                                                </div>
                                                <div className='size10 color-orange'>
                                                    Current Price:{' '}
                                                    {latest != null
                                                        ? `$${latest.toFixed(2)}`
                                                        : wsStatus === 'connecting'
                                                        ? 'Connecting…'
                                                        : 'Waiting for tick…'}
                                                </div>
                                                <div className='size10 mt--10 contentRight'>
                                                    <div style={{ color: '#00c853' }}>
                                                        MA5: {latestPoint ? `$${latestPoint.ma5.toFixed(2)}` : '—'}
                                                    </div>
                                                    <div style={{ color: '#42a5f5', marginTop: -10 }}>
                                                        MA12: {latestPoint ? `$${latestPoint.ma12.toFixed(2)}` : '—'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='containerDetail mt-5 bg-lite'>
                                <div className='containerDetail bg-tinted'>
                                    <ToggleCollapse
                                        title={<div className='color-yellow size12'>
                                            Position { 
                                                isPositionCollapsed 
                                                ? <div className='mt--5'>
                                                    <span className={`color-lite contentLeft mt--5`}>
                                                        <div className={`flexContainer width-300`}>
                                                            <div className='flexColumn contentRight w-30'>Qty</div> 
                                                                <div className='flex2Column contentLeft pl-10 color-neogreen'>{quantity.toFixed(4)}</div>
                                                        </div>
                                                        <div className={`flexContainer mr-5 mt--5`}>
                                                            <div className='flexColumn contentRight w-30'>Avg</div>
                                                            <div className='flex2Column color-yellow contentLeft pl-10'>${avgCost.toFixed(2)}</div>
                                                        </div>
                                                        <div className={`flexContainer mt--5`}>
                                                            <div className='flexColumn contentRight w-30'>Value</div>
                                                                <div className={`flex2Column contentLeft pl-10 ${avgCost < marketValue ? 'color-neogreen' : 'color-red'}`}>{`${(avgCost < marketValue) ? '▲' : '▼'} $${marketValue.toFixed(2)}`}</div>
                                                        </div>
                                                    </span>
                                                </div>
                                                : null
                                            }
                                        </div>}
                                        component={null}
                                        description={ 
                                                isPositionCollapsed 
                                                ? <div className='color-lite contentLeft size12 mt--5'>
                                                    <span className={pnl >= 0 ? 'color-neogreen' : 'color-red'}>P/L {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} <span className={`${pnlPct > 0 ? 'color-neogreen' : 'color-red'} `}>({pnlPct.toFixed(2)}%)</span></span>
                                                    </div>
                                                : null
                                            }
                                        isCollapsed={isPositionCollapsed}
                                        setCollapse={(nextState: boolean | ((prev: boolean) => boolean)) => {
                                            setPositionCollapsedByPair((prev) => ({
                                                ...prev,
                                                [pair]:
                                                    typeof nextState === 'function'
                                                        ? nextState(prev[pair])
                                                        : nextState,
                                            }));
                                        }}
                                        align='left'
                                        bold={false}
                                        editTitle={null}
                                        icon={null}
                                    />
                                </div>
                                {
                                    isPositionCollapsed 
                                    ? null
                                    : <div className='contentLeft'>
                                            <div className='containerDetail p-10 size10 mb-5 mt-5 flexContainer'>
                                                <div className='color-lite flex2Column contentLeft'>Value: ${marketValue.toFixed(2)}</div>
                                                <div className={`flex2Column contentRight ${pnl >= 0 ? 'color-neogreen' : 'color-red'}`}>
                                                    P/L: {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} ({pnlPct.toFixed(2)}%)
                                                </div>
                                            </div>
                                            <div className='containerDetail p-10 flexContainer'>
                                                <div className='flex2Column size10 color-lite'>
                                                    Qty
                                                    <input
                                                        type='number'
                                                        min='0'
                                                        step='0.0001'
                                                        value={quantity}
                                                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                            updatePositionField(pair, 'quantity', e.target.value)
                                                        }
                                                        className='containerDetail p-5 ml-5 color-yellow bg-tinted w-100'
                                                    />
                                                </div>
                                                <div className='flexColumn size10 color-lite'>
                                                    Avg Cost
                                                    <input
                                                        type='number'
                                                        min='0'
                                                        step='0.01'
                                                        value={avgCost}
                                                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                            updatePositionField(pair, 'avgCost', e.target.value)
                                                        }
                                                        className='containerDetail p-5 ml-5 color-yellow bg-tinted w-100'
                                                    />
                                                </div>
                                            </div>
                                        </div>
                            }
                            </div>
                            {
                                isPositionCollapsed
                                ? null
                                : <div className=''>
                                    <div className='flexContainer'>
                                        <div className='size10 color-lite mb-10 flex2Column contentLeft'>
                                            <div className='containerDetail mt-5 bg-lite'>
                                                <div className='containerDetail p-10 color-neogreen'>
                                                        ▲ Alert Above: 
                                                </div>
                                                <select
                                                    value={aboveThreshold}
                                                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                                        updateAlertThreshold(pair, 'above', e.target.value)
                                                    }
                                                    className='containerDetail p-10 color-neogreen bg-tinted width--5 flex2Column'
                                                >
                                                    {makeSelectOptions(aboveThreshold).map((option) => (
                                                        <option key={option} value={option}>
                                                            ${option.toFixed(2)}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className='containerDetail mt-5'>
                                                    <input
                                                        type='range'
                                                        min={baseOptions[0]}
                                                        max={baseOptions[baseOptions.length - 1]}
                                                        step='1'
                                                        value={aboveThreshold}
                                                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                                            const parsed = Number(e.target.value);
                                                            if (!Number.isFinite(parsed)) return;
                                                            const snapped = snapToNearestOption(parsed, makeSelectOptions(aboveThreshold));
                                                            updateAlertThreshold(pair, 'above', String(snapped));
                                                        }}
                                                        className='ml-5 w-100'
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className='size10 color-lite mb-10 flex2Column contentLeft ml-5'>
                                            <div className='containerDetail mt-5 bg-lite'>
                                                <div className=''>
                                                    <div className='containerDetail p-10 color-red'>
                                                        ▼ Alert Below:
                                                    </div>                                      
                                                    <select
                                                        value={belowThreshold}
                                                        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                                            updateAlertThreshold(pair, 'below', e.target.value)
                                                        }
                                                        className='containerDetail p-10 color-red bg-tinted width--5'
                                                    >
                                                        {makeSelectOptions(belowThreshold).map((option) => (
                                                            <option key={option} value={option}>
                                                                ${option.toFixed(2)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className='containerDetail mt-5'>
                                                    <input
                                                        type='range'
                                                        min={baseOptions[0]}
                                                        max={baseOptions[baseOptions.length - 1]}
                                                        step='1'
                                                        value={belowThreshold}
                                                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                                            const parsed = Number(e.target.value);
                                                            if (!Number.isFinite(parsed)) return;
                                                            const snapped = snapToNearestOption(parsed, makeSelectOptions(belowThreshold));
                                                            updateAlertThreshold(pair, 'below', String(snapped));
                                                        }}
                                                        className='ml-5 w-100'
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='containerDetail mt-5 bg-lite'>
                                        <div className='containerDetail bg-lite'>
                                            <ToggleCollapse
                                                title={<span className='size10 color-yellow'>Alert Behavior</span>}
                                                component={null}
                                                description={
                                                    <div className='size10 color-lite contentLeft mt--5'>
                                                        Cooldown {cooldownSec}s | Re-arm band +/-{hysteresisPctDisplay.toFixed(2)}%
                                                    </div>
                                                }
                                                isCollapsed={isBehaviorCollapsed}
                                                setCollapse={(nextState: boolean | ((prev: boolean) => boolean)) => {
                                                    setBehaviorCollapsedByPair((prev) => ({
                                                        ...prev,
                                                        [pair]:
                                                            typeof nextState === 'function'
                                                                ? nextState(prev[pair])
                                                                : nextState,
                                                    }));
                                                }}
                                                align='left'
                                                bold={false}
                                                editTitle={null}
                                                icon={null}
                                            />
                                        </div>
                                        {
                                            isBehaviorCollapsed 
                                            ? null
                                            : <div>
                                                <div className='flexContainer'>
                                                        <div className='containerDetail flex2Column color-yellow p-10 mt-5 size12'>
                                                        <div className='containerDetail p-10 size12 color-yellow'>
                                                            Cooldown Preset
                                                        </div>
                                                        <select
                                                            value={cooldownSec}
                                                            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                                                updateAlertBehaviorField(pair, 'cooldownMs', e.target.value)
                                                            }
                                                            className='containerDetail color-yellow bg-tinted w-100 p-10'
                                                        >
                                                            {cooldownOptions.map((option) => (
                                                                <option key={option} value={option}>
                                                                    {option}s
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <div className='containerDetail mt-5'>
                                                            <input
                                                                type='range'
                                                                min='0'
                                                                max='600'
                                                                step='5'
                                                                value={cooldownSec}
                                                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                                    updateAlertBehaviorField(pair, 'cooldownMs', e.target.value)
                                                                }
                                                                className='ml-5 w-100'
                                                            />
                                                        </div>
                                                    </div>
                                                            <div className='containerDetail flex2Column p-10 mt-5 ml-5 size12'>
                                                        <div className='containerDetail p-10 size12 color-yellow '>
                                                            Hysteresis Preset
                                                        </div>
                                                        <select
                                                            value={hysteresisPctDisplay}
                                                            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                                                updateAlertBehaviorField(pair, 'hysteresisPct', e.target.value)
                                                            }
                                                            className='containerDetail p-10 color-yellow bg-tinted w-100'
                                                        >
                                                            {hysteresisOptions.map((option) => (
                                                                <option key={option} value={option}>
                                                                    {option.toFixed(2)}%
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <div className='containerDetail mt-5'>
                                                            <input
                                                                type='range'
                                                                min='0'
                                                                max='5'
                                                                step='0.05'
                                                                value={hysteresisPctDisplay}
                                                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                                    updateAlertBehaviorField(pair, 'hysteresisPct', e.target.value)
                                                                }
                                                                className='ml-5 w-100'
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div 
                                                        onClick={() => resetAlertBehaviorForPair(pair)}
                                                        className='containerDetail button p-10 mt-5 color-yellow bg-green size15 contentCenter'
                                                    >
                                                        Reset
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </div>
                            }
                            <div style={{ display: isChartCollapsed ? 'none' : 'block' }}>
                                <LineChart
                                    width={350}
                                    height={200}
                                    data={data}
                                    margin={{ top: 6, right: 8, left: 20, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray='3 3' />
                                    <XAxis dataKey='time' hide />
                                    <YAxis
                                        domain={['auto', 'auto']}
                                        width={70}
                                        tick={{ fontSize: 10 }}
                                        tickFormatter={(value: number) => value.toFixed(1)}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#111827',
                                            border: '1px solid #374151',
                                            borderRadius: '8px',
                                            color: '#f9fafb',
                                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
                                        }}
                                        cursor={{ stroke: '#6b7280', strokeDasharray: '4 4' }}
                                        formatter={(value: number | string, name: string) => {
                                            const numericValue = typeof value === 'number' ? value : Number(value);
                                            const displayValue = Number.isFinite(numericValue)
                                                ? `$${numericValue.toFixed(2)}`
                                                : String(value);
                                            const color = getTooltipSeriesColor(name);

                                            return [
                                                <span style={{ color }}>{displayValue}</span>,
                                                <span style={{ color }}>{name.toUpperCase()}</span>,
                                            ];
                                        }}
                                        labelStyle={{ color: '#facc15', fontWeight: 600 }}
                                    />
                                    <ReferenceLine
                                        y={aboveThreshold}
                                        stroke='#00c853'
                                        strokeDasharray='4 4'
                                        strokeOpacity={0.8}
                                    />
                                    <ReferenceLine
                                        y={belowThreshold}
                                        stroke='#d50000'
                                        strokeDasharray='4 4'
                                        strokeOpacity={0.8}
                                    />
                                    <Line
                                        type='monotone'
                                        dataKey='price'
                                        dot={false}
                                        stroke='#f5b400'
                                        strokeWidth={2}
                                    />
                                    <Line
                                        type='monotone'
                                        dataKey='ma5'
                                        dot={false}
                                        stroke='#00c853'
                                        strokeWidth={1.5}
                                    />
                                    <Line
                                        type='monotone'
                                        dataKey='ma12'
                                        dot={false}
                                        stroke='#42a5f5'
                                        strokeWidth={1.5}
                                    />
                                </LineChart>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
