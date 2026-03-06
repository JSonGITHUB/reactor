// src/components/PhotoAssistant/VideoSettingResults.js

import React from 'react';

/**
 * Displays recommended video settings
 * @param {Object} props
 * @param {Object} props.settings - output from calculateVideoSettings
 */
export default function VideoSettingResults({ 
    result,
    onSave,
    subject,
    description,
    settings
}) {
    if (!settings) return null;

    return (
        <div className='containerDetail bg-lite color-lite size20 m-5 contentLeft '>
            <div className='containerDetail contentLeft p-10 mb-5 color-yellow'>
                Recommended Video Settings
            </div>
                <div className='containerDetail p-10 mb-5'><span className='color-yellow'>Resolution:</span> {settings.resolution}</div>
                <div className='containerDetail p-10 mb-5'><span className='color-yellow'>Frame Rate:</span> {settings.frameRate} fps</div>
                <div className='containerDetail p-10 mb-5'><span className='color-yellow'>Aperture:</span> {settings.aperture}</div>
                <div className='containerDetail p-10 mb-5'><span className='color-yellow'>Shutter Speed:</span> {settings.shutter}</div>
                <div className='containerDetail p-10 mb-5'><span className='color-yellow'>ISO:</span> {settings.iso}</div>
                <div className='containerDetail p-10 mb-5'><span className='color-yellow'>White Balance:</span> {settings.whiteBalance}</div>
                <div className='containerDetail p-10 mb-5'><span className='color-yellow'>Stabilization:</span> {settings.stabilization}</div>
            {settings.notes && (
                <div className='containerDetail p-10 mb-5'>
                    <div className='color-yellow mb-5'>
                        Tips:
                    </div>
                    {settings.notes}
                </div>
            )}
        </div>
    );
}