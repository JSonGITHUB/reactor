// withMultiInput.js
import React from 'react';
import { useMultiInput } from './MultiInputContext';

export const withMultiInput = (WrappedComponent) => {
    const WithMultiInput = (props) => {
        const ctx = useMultiInput();

        return (
            <WrappedComponent
                {...props}
                inputDevices={{
                    enabledDevices: ctx.enabledDevices,
                    isDeviceEnabled: ctx.isDeviceEnabled,
                    setDeviceEnabled: ctx.setDeviceEnabled,
                    subscribeToInput: ctx.subscribeToInput,
                    subscribeToAction: ctx.subscribeToAction,
                    dispatchInputEvent: ctx.dispatchInputEvent,
                    dispatchNormalizedAction: ctx.dispatchNormalizedAction,
                }}
            />
        );
    };

    WithMultiInput.displayName =
        `WithMultiInput(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

    return WithMultiInput;
};
