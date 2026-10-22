import React from 'react';
import Music from '../music/Music';
import Watch from './Watch';
import Pics from '../pics/Pics';

export default function Media() {
    return (
        <React.Fragment>
            <Watch />
            <Pics />
            <Music />
        </React.Fragment>
    );
}