import { useEffect, useRef, useState, useCallback } from 'react';

// Kraken public WebSocket — real trade ticks, browser-friendly, no API key
const WS_URL = 'wss://ws.kraken.com';
const SUBSCRIBE_MSG = JSON.stringify({
    event: 'subscribe',
    pair: ['XBT/USD'],
    subscription: { name: 'trade' }
});

// CoinGecko REST fallback — CORS-enabled, free, no key needed
const REST_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd';

export default function Trade() {
    const [ticks, setTicks] = useState([]);
    const [status, setStatus] = useState('connecting'); // 'connecting' | 'live' | 'polling' | 'error'
    const [lastUpdateMs, setLastUpdateMs] = useState(null);
    const [nowMs, setNowMs] = useState(Date.now());

    const socketRef = useRef(null);
    const bufferRef = useRef([]);
    const flushRef = useRef(null);
    const reconnectRef = useRef(null);
    const pollingRef = useRef(null);
    const wsFailCountRef = useRef(0);
    const clockRef = useRef(null);
    const noTradeTimeoutRef = useRef(null);
    const hasLiveTradeRef = useRef(false);

    // Live clock — always ticking so "Updated Xs ago" is always fresh
    useEffect(() => {
        clockRef.current = setInterval(() => setNowMs(Date.now()), 1000);
        return () => clearInterval(clockRef.current);
    }, []);

    const stopWebSocket = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.onclose = null;
            socketRef.current.onerror = null;
            socketRef.current.close();
            socketRef.current = null;
        }
        clearTimeout(reconnectRef.current);
        clearTimeout(noTradeTimeoutRef.current);
    }, []);

    const stopRestPolling = useCallback(() => {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
    }, []);

    const startRestPolling = useCallback(() => {
        if (pollingRef.current) return;
        if (!hasLiveTradeRef.current) {
            setStatus('polling');
        }
        const poll = async () => {
            try {
                const res = await fetch(REST_URL);
                if (!res.ok) return;
                const json = await res.json();
                const price = json?.bitcoin?.usd;
                if (price != null) {
                    const now = Date.now();
                    setLastUpdateMs(now);
                    setTicks((prev) => [{ price, volume: null, time: now }, ...prev].slice(0, 50));
                }
            } catch (_) {}
        };
        poll();
        pollingRef.current = setInterval(poll, 3000);
    }, []);

    const connect = useCallback(() => {
        startRestPolling();
        setStatus('connecting');
        let ws;
        try {
            ws = new WebSocket(WS_URL);
        } catch (_) {
            startRestPolling();
            return;
        }
        socketRef.current = ws;
        hasLiveTradeRef.current = false;

        const openTimeout = setTimeout(() => {
            if (ws.readyState !== WebSocket.OPEN) {
                wsFailCountRef.current += 1;
                stopWebSocket();
                startRestPolling();
            }
        }, 6000);

        ws.onopen = () => {
            clearTimeout(openTimeout);
            wsFailCountRef.current = 0;
            ws.send(SUBSCRIBE_MSG);

            // If subscribed but no trade data arrives promptly, keep polling fallback active.
            noTradeTimeoutRef.current = setTimeout(() => {
                if (!hasLiveTradeRef.current) {
                    setStatus('polling');
                }
            }, 8000);
        };

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                // Kraken trade messages: [channelId, [[price, volume, time, side, ...]], "trade", "XBT/USD"]
                if (!Array.isArray(msg) || msg[2] !== 'trade') return;
                const trades = msg[1];
                if (!Array.isArray(trades)) return;
                const now = Date.now();
                trades.forEach(([price, volume]) => {
                    const parsedPrice = parseFloat(price);
                    const parsedVolume = parseFloat(volume);
                    if (!Number.isFinite(parsedPrice)) return;
                    bufferRef.current.push({
                        price: parsedPrice,
                        volume: Number.isFinite(parsedVolume) ? parsedVolume : null,
                        time: now
                    });
                });
                hasLiveTradeRef.current = true;
                clearTimeout(noTradeTimeoutRef.current);
                stopRestPolling();
                setStatus('live');
                setLastUpdateMs(now);
            } catch (_) {}
        };

        ws.onclose = () => {
            clearTimeout(openTimeout);
            clearTimeout(noTradeTimeoutRef.current);
            wsFailCountRef.current += 1;
            if (wsFailCountRef.current >= 3) {
                startRestPolling();
                return;
            }
            setStatus('connecting');
            reconnectRef.current = setTimeout(() => connect(), 2000);
        };

        ws.onerror = () => {
            clearTimeout(openTimeout);
            ws.close();
        };
    }, [startRestPolling, stopRestPolling, stopWebSocket]);

    useEffect(() => {
        connect();
        return () => {
            stopWebSocket();
            clearInterval(flushRef.current);
            stopRestPolling();
            clearTimeout(reconnectRef.current);
        };
    }, [connect, stopRestPolling, stopWebSocket]);

    // Flush buffer to state 4x/sec so trades appear promptly
    useEffect(() => {
        flushRef.current = setInterval(() => {
            if (bufferRef.current.length === 0) return;
            setTicks((prev) => {
                const next = [...bufferRef.current, ...prev].slice(0, 50);
                bufferRef.current = [];
                return next;
            });
        }, 250);
        return () => clearInterval(flushRef.current);
    }, []);

    const latestPrice = ticks[0]?.price;
    const prevPrice = ticks[1]?.price;
    const direction = latestPrice != null && prevPrice != null
        ? latestPrice > prevPrice ? '▲' : latestPrice < prevPrice ? '▼' : '–'
        : null;
    const directionColor = direction === '▲' ? '#00c853' : direction === '▼' ? '#d50000' : '#aaa';

    const secSinceUpdate = lastUpdateMs != null
        ? Math.floor((nowMs - lastUpdateMs) / 1000)
        : null;

    const statusDot = {
        live: { color: '#00c853', label: 'LIVE' },
        polling: { color: '#f5b400', label: 'POLLING' },
        connecting: { color: '#aaa', label: 'CONNECTING…' },
        error: { color: '#d50000', label: 'ERROR' }
    }[status];

    return (
        <div className='containerDetail bg-lite color-lite mt--20 ml-5 mr-5'>
            <div className='containerDetail bg-lite color-yellow size20 p-10 contentLeft flexContainer centerVertical mb-5'>
                <span className='flex2Column'>📊 BTC/USD — Kraken Trade Stream</span>
                <span className='flexColumn contentRight pr-10 size12' style={{ color: statusDot.color }}>
                    ● {statusDot.label}
                </span>
            </div>

            <div className='containerDetail bg-lite p-10 flexContainer size14'>
                <div className='flex2Column contentLeft'>
                    <span className='color-lite'>Latest Price: </span>
                    <span style={{ color: directionColor, fontWeight: 'bold', fontSize: '1.2em' }}>
                        {latestPrice != null ? `$${latestPrice.toFixed(2)}` : '—'}
                    </span>
                    {direction && (
                        <span style={{ color: directionColor, marginLeft: 6 }}>{direction}</span>
                    )}
                </div>
                <div className='flexColumn contentRight color-soft size12 pr-10'>
                    {secSinceUpdate != null
                        ? `Updated ${secSinceUpdate}s ago`
                        : 'Waiting for data…'}
                </div>
            </div>

            {status === 'polling' && (
                <div className='containerDetail color-orange size12 p-10 contentLeft'>
                    ⚠️ WebSocket unavailable — polling CoinGecko every 3s
                </div>
            )}

            <table border='1' cellPadding='6' className='containerDetail width-100-percent mt-5'>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Price (USD)</th>
                        <th>Volume (BTC)</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tbody>
                    {ticks.length === 0 ? (
                        <tr><td colSpan={4} style={{ textAlign: 'center', padding: 12 }}>Waiting for trades…</td></tr>
                    ) : (
                        ticks.map((t, i) => (
                            <tr key={i} style={{ background: i === 0 ? 'rgba(0,200,83,0.08)' : undefined }}>
                                <td style={{ color: '#888', fontSize: '0.85em' }}>{ticks.length - i}</td>
                                <td style={{ fontWeight: i === 0 ? 'bold' : undefined }}>${t.price.toFixed(2)}</td>
                                <td>{t.volume != null ? t.volume.toFixed(6) : '—'}</td>
                                <td>{new Date(t.time).toLocaleTimeString()}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
