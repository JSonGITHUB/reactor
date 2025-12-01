// MenuScreen.jsx
import React from 'react';
import { FocusableButton } from './FocusableButton';
import { DEVICE_IDS } from './MultiInputContext';
import { withMultiInput } from './withMultiInput';

const MenuScreenBase = ({ inputDevices }) => {
    const { enabledDevices, setDeviceEnabled } = inputDevices;

    const handlePlay = () => {
        alert('Play selected (navigate to game screen)');
    };

    const handleSettings = () => {
        alert('Settings selected (open settings panel)');
    };

    const handleAccessibility = () => {
        alert('Accessibility selected (open device options)');
    };

    const handleExit = () => {
        alert('Exit selected (close app / log out)');
    };

    return (
        <div
            className='mt--50'
            style={{
                minHeight: '100vh',
                background:
                    'radial-gradient(circle at top, #111827 0, #020617 60%, #000 100%)',
                color: '#e5e7eb',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 24,
                boxSizing: 'border-box',
            }}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: 480,
                    background: 'rgba(15,23,42,0.9)',
                    borderRadius: 16,
                    padding: 20,
                    boxShadow: '0 18px 35px rgba(0,0,0,0.55)',
                    border: '1px solid rgba(148,163,184,0.3)',
                }}
            >
                <header style={{ marginBottom: 16 }}>
                    <h1 style={{ margin: 0, fontSize: 24 }}>Main Menu</h1>
                    <p style={{ margin: '6px 0 0', fontSize: 14, color: '#9ca3af' }}>
                        Use arrows / sip-puff / keypad to move. Activate to select.
                    </p>
                </header>

                <section style={{ marginBottom: 18 }}>
                    <h2
                        style={{
                            fontSize: 14,
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                            color: '#9ca3af',
                            marginBottom: 8,
                        }}
                    >
                        Primary Actions
                    </h2>
                    <FocusableButton onClick={handlePlay}>▶ Play</FocusableButton>
                    <FocusableButton onClick={handleSettings} variant="secondary">
                        ⚙ Settings
                    </FocusableButton>
                </section>

                <section style={{ marginBottom: 18 }}>
                    <h2
                        style={{
                            fontSize: 14,
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                            color: '#9ca3af',
                            marginBottom: 8,
                        }}
                    >
                        Accessibility
                    </h2>
                    <FocusableButton onClick={handleAccessibility}>
                        ♿ Accessibility Options
                    </FocusableButton>
                </section>

                <section style={{ marginBottom: 18 }}>
                    <h2
                        style={{
                            fontSize: 14,
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                            color: '#9ca3af',
                            marginBottom: 8,
                        }}
                    >
                        Devices
                    </h2>
                    <div style={{ fontSize: 13 }}>
                        {Object.entries(enabledDevices).map(([deviceId, enabled]) => (
                            <label
                                key={deviceId}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: 4,
                                    gap: 8,
                                    cursor: 'pointer',
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={enabled}
                                    onChange={(e) =>
                                        setDeviceEnabled(deviceId, e.target.checked)
                                    }
                                />
                                <span>
                                    {deviceId === DEVICE_IDS.KEYBOARD && 'Keyboard'}
                                    {deviceId === DEVICE_IDS.TOUCH && 'Touchscreen'}
                                    {deviceId === DEVICE_IDS.BINARY_KEYPAD && 'Binary Keypad'}
                                    {deviceId === DEVICE_IDS.SIP_PUFF && 'Sip/Puff'}
                                    {![
                                        DEVICE_IDS.KEYBOARD,
                                        DEVICE_IDS.TOUCH,
                                        DEVICE_IDS.BINARY_KEYPAD,
                                        DEVICE_IDS.SIP_PUFF,
                                    ].includes(deviceId) && deviceId}
                                    {' — '}
                                    <span
                                        style={{ color: enabled ? '#4ade80' : '#f97373' }}
                                    >
                                        {enabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                </span>
                            </label>
                        ))}
                    </div>
                </section>

                <section>
                    <h2
                        style={{
                            fontSize: 14,
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                            color: '#9ca3af',
                            marginBottom: 8,
                        }}
                    >
                        System
                    </h2>
                    <FocusableButton onClick={handleExit} variant="danger">
                        ⏻ Exit
                    </FocusableButton>
                </section>
            </div>
        </div>
    );
};

export const MenuScreen = withMultiInput(MenuScreenBase);
