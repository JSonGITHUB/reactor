// src/components/PhotoAssistant/PhotoSettingResults.js
import React from 'react';
import PropTypes from 'prop-types';

export default function PhotoSettingResults({
    result,
    onSave,
    subject,
    description
}) {
    if (!result) return null;

    const {
        aperture,
        shutter,
        iso,
        focalLength,
        whiteBalance,
        notes
    } = result;

    return (
        <div className='containerDetail p-10 bg-lite size20 m-5 contentLeft '>
            <div className='containerDetail contentLeft p-10 mb-10 color-yellow'>
                Recommended Photo Settings
            </div>
            {/* Subject / Description */}
            <div className='containerDetail contentLeft p-10 '>
            {subject || description ? (
                <div className='containerDetail bg-lite color-yellow mb-5 p-10'>
                    {subject && <div className='p-10'>{subject}</div>}
                    {description && <p><strong>Description:</strong> {description}</p>}
                </div>
            ) : null}
                {/* Aperture */}
                <div className='containerDetail p-10 color-yellow'>
                    <div className='p-10'>
                        🔆  Aperture  {aperture}
                    </div>

                    {/* Shutter */}
                    <div className='p-10'>
                        ⏱️ Shutter Speed {shutter}
                    </div>

                    {/* ISO */}
                    <div className='p-10'>
                        📶 ISO {iso}
                    </div>
                    {/* Focal Length */}
                    <div className='p-10'>
                        🔍 Focal Length {focalLength}
                    </div>
                    {/* White Balance */}
                    <div className='p-10'>
                        ☀️ White Balance {whiteBalance}                    
                    </div>
                    {/* Notes */}
                    {notes && (
                        <div className='p-10'>
                           🗒️ {notes}
                        </div>
                    )}
                </div>
            </div>

            {/* Save Results 
             <div className='containerDetail p-20 bg-green button color-lite' onClick={onSave}>
                Save
            </div>
            */}
           
        </div>
    );
}

PhotoSettingResults.propTypes = {
    result: PropTypes.shape({
        aperture: PropTypes.string,
        shutter: PropTypes.string,
        iso: PropTypes.string,
        focalLength: PropTypes.string,
        whiteBalance: PropTypes.string,
        metering: PropTypes.string,
        notes: PropTypes.string
    }),
    subject: PropTypes.string,
    description: PropTypes.string,
    onSave: PropTypes.func.isRequired
};