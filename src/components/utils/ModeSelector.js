// src/components/PhotoAssistant/ModeSelector.js
import React from 'react';
import PropTypes from 'prop-types';

export default function ModeSelector({ 
    mode, 
    setMode 
}) {
    return (
        <div className='pa-section'>
            <div className='containerDetail flexContainer color-yellow contentLeft m-5 p-15 bg-silver'>
                <div className='flex2Column size20'>
                    Capture Mode
                </div>
                <div className='flexColumn'>
                    {/* PHOTO MODE */}
                    <label className='button containerDetail pt-10 pb-10 pl-10 pr-15 ml-5 bg-green color-lite'>
                        <input
                            className='mr-10'
                            type='radio'
                            name='captureMode'
                            value='photo'
                            checked={mode === 'photo'}
                            onChange={() => setMode('photo')}
                        />
                        Photo
                    </label>

                    {/* VIDEO MODE */}
                    <label className='button containerDetail pt-10 pb-10 pl-10 pr-15 ml-5 bg-green color-lite'>
                        <input
                            className='mr-10'
                            type='radio'
                            name='captureMode'
                            value='video'
                            checked={mode === 'video'}
                            onChange={() => setMode('video')}
                        />
                        Video
                    </label>
                </div>
            </div>
        </div>
    );  
}

ModeSelector.propTypes = {
    mode: PropTypes.oneOf(['photo', 'video']).isRequired,
    setMode: PropTypes.func.isRequired
};