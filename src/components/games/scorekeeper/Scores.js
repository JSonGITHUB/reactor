import React, { useRef } from 'react';
import PlayerParent from '../../context/PlayerContext';
import GolfParent from '../../context/GolfContext';
import PlayerScores from './PlayerScores';
import WavesParent from '../../context/WavesContext';

const Scores = () => {

    const targetElementRef = useRef(null);

    return (
        <PlayerParent targetElementRef={targetElementRef} >
            <GolfParent targetElementRef={targetElementRef} >
                <WavesParent targetElementRef={targetElementRef} >
                    <PlayerScores/>
                </WavesParent>
            </GolfParent>
        </PlayerParent>
    );
}

export default Scores;