// src/components/PhotoAssistant/ConditionSelectors.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import CollapseToggleButton from './CollapseToggleButton';

export default function ConditionSelectors({
    lighting,
    setLighting,
    motion,
    setMotion,
    effect,
    setEffect,
    scene,
    setScene,
    mode
}) {
    const [conditionsCollapsed, setConditionsCollapsed] = useState(true);    
    const header = <div className='color-yellow size20'>
                        Optional Capture Conditions
                        <div className='copyright color-lite'>
                            These options are optional, but help generate more accurate photo/video settings.
                        </div>
                    </div>
    return (
        mode !== '' && (
        <div className='containerDetail m-5'>
            <div className='containerDetail bg-lite'>
                <CollapseToggleButton
                title={header}
                isCollapsed={conditionsCollapsed}
                setCollapse={setConditionsCollapsed}
                align='left'
                />
            </div>

            {
                !conditionsCollapsed && (  
                    <div className='containerDetail flexContainer m-5'>
                        <label className='flex2Column size20 contentRight p-15 color-yellow'>
                            Lighting
                        </label>
                        <select
                            className='containerDetail flex2Column size20 contentLeft p-10 bg-dark color-lite'
                            value={lighting}
                            onChange={(e) => setLighting(e.target.value)}
                        >
                            <option value=''>None</option>
                            <option value='low'>Low Light</option>
                            <option value='medium'>Indoor / Mixed Light</option>
                            <option value='bright'>Bright Sunlight</option>
                            <option value='backlit'>Backlit Subject</option>
                            <option value='studio'>Studio Light</option>
                        </select>
                    </div>
                ) 
            }
            {
                !conditionsCollapsed && (  
                <div className=''>
                        <div className='containerDetail flexContainer m-5'>
                            <label className='flex2Column size20 contentRight p-15 color-yellow'>
                                Motion
                            </label>
                            <select
                                className='containerDetail flex2Column size20 contentLeft p-10 bg-dark color-lite'
                                value={motion}
                                onChange={(e) => setMotion(e.target.value)}
                            >
                                <option value=''>None</option>
                                <option value='still'>Still Subject</option>
                                <option value='slow'>Slow Motion</option>
                                <option value='fast'>Fast Motion (sports, wildlife)</option>
                            </select>
                        </div>
                    </div>
                ) 
            }
            {
                !conditionsCollapsed && (  
                <div className=''>
                    <div className='containerDetail flexContainer m-5'>
                        <label className='flex2Column size20 contentRight p-15 color-yellow'>
                            Creative Effect / Style
                        </label>
                    <select
                        className='containerDetail flex2Column size20 contentLeft p-10 bg-dark color-lite'
                        value={effect}
                        onChange={(e) => setEffect(e.target.value)}
                    >
                        <option value=''>None</option>
                        <option value='portrait'>Portrait (shallow depth of field)</option>
                        <option value='landscape'>Landscape (deep depth of field)</option>
                        <option value='nightSky'>Astro Photography</option>
                        <option value='smoothWater'>Long Exposure Water</option>
                        <option value='bokeh'>Strong Bokeh</option>
                    </select>
                </div>
            </div>
                ) 
            }
            {
                !conditionsCollapsed && (
                <div className=''>
                    <div className='containerDetail flexContainer m-5'>
                        <label className='flex2Column size20 contentRight p-15 color-yellow'>
                            Scene Type
                        </label>
                        <select
                            className='containerDetail flex2Column size20 contentLeft p-10 bg-dark color-lite'
                            value={scene}
                            onChange={(e) => setScene(e.target.value)}
                        >
                            <option value=''>None</option>
                            <option value='outdoor'>Outdoor</option>
                            <option value='indoor'>Indoor</option>
                            <option value='studio'>Studio</option>
                            <option value='city'>City / Urban</option>
                            <option value='nature'>Nature / Forest</option>
                        </select>
                    </div>
                </div>
                )
            }
        </div>
        )
    );
}

ConditionSelectors.propTypes = {
    lighting: PropTypes.string.isRequired,
    setLighting: PropTypes.func.isRequired,
    motion: PropTypes.string.isRequired,
    setMotion: PropTypes.func.isRequired,
    effect: PropTypes.string.isRequired,
    setEffect: PropTypes.func.isRequired,
    scene: PropTypes.string.isRequired,
    setScene: PropTypes.func.isRequired
};