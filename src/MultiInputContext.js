// MultiInputContext.js
import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';

export const DEVICE_IDS = {
    KEYBOARD: 'keyboard',
    TOUCH: 'touch',
    BINARY_KEYPAD: 'binaryKeypad',
    SIP_PUFF: 'sipPuff',
};

export const ACTIONS = {
    ACTIVATE: 'ACTIVATE',
    MOVE_NEXT: 'MOVE_NEXT',
    MOVE_PREVIOUS: 'MOVE_PREVIOUS',
    BACK: 'BACK',
    CONFIRM: 'CONFIRM',
    CANCEL: 'CANCEL',
};

const MultiInputContext = createContext(null);

export const useMultiInput = () => {
    const ctx = useContext(MultiInputContext);
    if (!ctx) {
        throw new Error('useMultiInput must be used within MultiInputProvider');
    }
    return ctx;
};

export const MultiInputProvider = ({ children, initialEnabledDevices }) => {
    const [enabledDevices, setEnabledDevices] = useState(() => ({
        [DEVICE_IDS.KEYBOARD]: true,
        [DEVICE_IDS.TOUCH]: true,
        [DEVICE_IDS.BINARY_KEYPAD]: false,
        [DEVICE_IDS.SIP_PUFF]: false,
        ...(initialEnabledDevices || {}),
    }));

    // deviceId → Set<handler>
    const deviceSubscribersRef = useRef({
        [DEVICE_IDS.KEYBOARD]: new Set(),
        [DEVICE_IDS.TOUCH]: new Set(),
        [DEVICE_IDS.BINARY_KEYPAD]: new Set(),
        [DEVICE_IDS.SIP_PUFF]: new Set(),
    });

    // action → Set<handler>
    const actionSubscribersRef = useRef({
        [ACTIONS.ACTIVATE]: new Set(),
        [ACTIONS.MOVE_NEXT]: new Set(),
        [ACTIONS.MOVE_PREVIOUS]: new Set(),
        [ACTIONS.BACK]: new Set(),
        [ACTIONS.CONFIRM]: new Set(),
        [ACTIONS.CANCEL]: new Set(),
    });

    const isDeviceEnabled = (deviceId) => !!enabledDevices[deviceId];

    const setDeviceEnabled = (deviceId, enabled) => {
        setEnabledDevices((prev) => ({
            ...prev,
            [deviceId]: enabled,
        }));
    };

    const subscribeToInput = (deviceId, handler) => {
        if (!deviceSubscribersRef.current[deviceId]) {
            deviceSubscribersRef.current[deviceId] = new Set();
        }
        deviceSubscribersRef.current[deviceId].add(handler);
        return () => {
            deviceSubscribersRef.current[deviceId].delete(handler);
        };
    };

    const subscribeToAction = (action, handler) => {
        if (!actionSubscribersRef.current[action]) {
            actionSubscribersRef.current[action] = new Set();
        }
        actionSubscribersRef.current[action].add(handler);
        return () => {
            actionSubscribersRef.current[action].delete(handler);
        };
    };

    const dispatchInputEvent = (deviceId, payload) => {
        if (!isDeviceEnabled(deviceId)) return;
        const subs = deviceSubscribersRef.current[deviceId];
        if (!subs) return;
        subs.forEach((handler) => {
            try {
                handler(payload);
            } catch (e) {
                console.error('MultiInput device handler error', e);
            }
        });
    };

    const dispatchNormalizedAction = (action, { sourceDevice, devicePayload }) => {
        // If the device is disabled, don't dispatch actions from it
        if (!isDeviceEnabled(sourceDevice)) return;

        const subs = actionSubscribersRef.current[action];
        if (!subs || subs.size === 0) return;

        const evt = {
            action,
            sourceDevice,
            devicePayload,
            timestamp: Date.now(),
        };

        subs.forEach((handler) => {
            try {
                handler(evt);
            } catch (e) {
                console.error('MultiInput normalized action handler error', e);
            }
        });
    };

    // KEYBOARD → raw + normalized actions
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!enabledDevices[DEVICE_IDS.KEYBOARD]) return;

            const raw = {
                type: 'keydown',
                key: e.key,
                code: e.code,
                altKey: e.altKey,
                ctrlKey: e.ctrlKey,
                shiftKey: e.shiftKey,
                timestamp: Date.now(),
                rawEvent: e,
            };

            dispatchInputEvent(DEVICE_IDS.KEYBOARD, raw);

            switch (e.key) {
                case 'Enter':
                case ' ':
                    dispatchNormalizedAction(ACTIONS.ACTIVATE, {
                        sourceDevice: DEVICE_IDS.KEYBOARD,
                        devicePayload: raw,
                    });
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                    dispatchNormalizedAction(ACTIONS.MOVE_NEXT, {
                        sourceDevice: DEVICE_IDS.KEYBOARD,
                        devicePayload: raw,
                    });
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    dispatchNormalizedAction(ACTIONS.MOVE_PREVIOUS, {
                        sourceDevice: DEVICE_IDS.KEYBOARD,
                        devicePayload: raw,
                    });
                    break;
                case 'Escape':
                    dispatchNormalizedAction(ACTIONS.CANCEL, {
                        sourceDevice: DEVICE_IDS.KEYBOARD,
                        devicePayload: raw,
                    });
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [enabledDevices]);

    // TOUCH → raw + normalized ACTIVATE
    useEffect(() => {
        const handleTouchEnd = (e) => {
            if (!enabledDevices[DEVICE_IDS.TOUCH]) return;

            const payload = {
                type: 'touchend',
                touches: e.changedTouches.length,
                timestamp: Date.now(),
                rawEvent: e,
            };

            dispatchInputEvent(DEVICE_IDS.TOUCH, payload);

            dispatchNormalizedAction(ACTIONS.ACTIVATE, {
                sourceDevice: DEVICE_IDS.TOUCH,
                devicePayload: payload,
            });
        };

        window.addEventListener('touchend', handleTouchEnd);
        return () => window.removeEventListener('touchend', handleTouchEnd);
    }, [enabledDevices]);

    // External devices (binary keypad / sip-puff) would call
    // dispatchInputEvent(...) and dispatchNormalizedAction(...)
    // from their integration points.

    const value = {
        enabledDevices,
        isDeviceEnabled,
        setDeviceEnabled,
        subscribeToInput,
        subscribeToAction,
        dispatchInputEvent,
        dispatchNormalizedAction,
    };

    return (
        <MultiInputContext.Provider value={value}>
            {children}
        </MultiInputContext.Provider>
    );
};
