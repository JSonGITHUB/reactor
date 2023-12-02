import React from 'react';
import WindSelector from './wind/WindSelector.js';
import TideSelector from './tide/TideSelector.js';
import SwellSelector from './SwellSelector.js';
import ConditionsContext from '../context/ConditionsContext.js';
import Selector from '../forms/FunctionalSelector.js';

class ConditionsSelectors extends React.Component {
    constructor(props) {
        super(props);
        this.setWindStatus = props.setWindStatus;
        this.setTide = props.setTide;
        this.setWind = props.setWind;
        this.setWindStatus = props.setWindStatus;
        this.handleWindCheck = props.handleWindCheck;
        this.handleTideCheck = props.handleTideCheck;
        this.handleTideSelection = props.handleTideSelection;
        this.handleSwellCheck = props.handleSwellCheck;
        this.handleSwell1Selection = props.handleSwell1Selection;
        this.handleSwell2Selection = props.handleSwell2Selection;
        this.handleSwell1Angle = props.handleSwell1Angle;
        this.handleSwell2Angle = props.handleSwell2Angle;
        this.handleSwell1Height = props.handleSwell1Height;
        this.handleSwell2Height = props.handleSwell2Height;
        this.handleSwell1Interval = props.handleSwell1Interval;
        this.handleSwell2Interval = props.handleSwell2Interval;
        this.handleStarSelection = props.handleStarSelection;
        this.handleDistanceSelection = props.handleDistanceSelection;
        this.pause = props.pause;
        this.setStatus = props.setStatus;
        this.data = props.data;
        this.tideDisplay = props.tideDisplay;
    }

    static contextType = ConditionsContext;

    refresh = () => window.location.pathname = "/reactor/WaveFinder";
    
    starSelector = (stars) => <div 
                                className="flex2Column contentCenter glassy r-10 m-5 p-15" 
                                onMouseDown={this.pause}
                                >
                                    Match<br/>
                                    <Selector
                                        groupTitle="Matches" 
                                        selected={stars} 
                                        label="Quality"
                                        items={[0,1,2,3,4,5]}
                                        onChange={this.handleStarSelection}
                                        fontSize='20'
                                        padding='5px'
                                        width='93%'
                                    />
                                </div>
    milesInput = (distance) => <div className="flex2Column contentCenter glassy r-10 m-5 p-10">
                                <label>
                                    Miles<br/>
                                    <input className="mt-10 p-10 r-10"
                                        name="distance"
                                        type="number"
                                        value={(distance=='' ? 100 : distance)}
                                        onChange={this.handleDistanceSelection}
                                    />
                                </label>
                            </div>
    render() {
        //console.log('ConditionsSelectors => render => this.context: ', this.context);
        return (
            <div className="p-5 r-10 m-5">
                <div className='p-10 color-yellow'>select current conditions:</div>
                <div className="flexContainer">
                    <SwellSelector 
                        id='1' 
                        swellDirection={this.context.swell1Direction} 
                        status={this.context} 
                        handleSwell1Selection={this.handleSwell1Selection} 
                        handleSwell2Selection={this.handleSwell2Selection} 
                        handleSwell1Angle={this.handleSwell1Angle} 
                        handleSwell2Angle={this.handleSwell2Angle} 
                        handleSwell1Height={this.handleSwell1Height} 
                        handleSwell2Height={this.handleSwell2Height} 
                        handleSwell1Interval={this.handleSwell1Interval} 
                        handleSwell2Interval={this.handleSwell2Interval} 
                        handleSwellCheck={this.handleSwellCheck}  
                        pause={this.pause}>
                    </SwellSelector>
                    <SwellSelector 
                        id='2' 
                        swellDirection={this.context.swell2Direction} 
                        status={this.context} 
                        handleSwell1Selection={this.handleSwell1Selection} 
                        handleSwell2Selection={this.handleSwell2Selection} 
                        handleSwell1Angle={this.handleSwell1Angle} 
                        handleSwell2Angle={this.handleSwell2Angle} 
                        handleSwell1Height={this.handleSwell1Height} 
                        handleSwell2Height={this.handleSwell2Height} 
                        handleSwell1Interval={this.handleSwell1Interval} 
                        handleSwell2Interval={this.handleSwell2Interval} 
                        handleSwellCheck={this.handleSwellCheck} 
                        pause={this.pause}>
                    </SwellSelector>
                </div>
                <div className="flexContainer">
                    <TideSelector 
                        tideNow={this.tideNow} 
                        data={this.data} 
                        status={this.context}
                        pause={this.pause} 
                        tideDisplay={this.tideDisplay} 
                        handleTideCheck={this.handleTideCheck} 
                        handleTideSelection={this.handleTideSelection}
                    />
                    <WindSelector 
                        windDirection={this.context.windDirection} 
                        pause={this.pause} 
                        setWind={this.setWind} 
                        isWind={this.context.isWind} 
                        setStatus={this.setWindStatus} 
                        handleWindCheck={this.handleWindCheck}
                    />
                </div>
                <div className="flexContainer">
                    {this.milesInput(this.context.distance)}
                    {this.starSelector(this.context.stars)} 
                </div>
                <div className="button bg-neogreen r-10 m-5 p-15 color-black bold glassy" onClick={this.refresh}>Refresh</div>
            </div>
        ) 
    }
    
}
export default ConditionsSelectors;
