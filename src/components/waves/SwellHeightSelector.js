import React, { useState } from 'react';
import Selector from '../forms/FunctionalSelector.js';

export default function SwellHeightSelector(data) {
    // Declare a new state variable, which we'll call "height"
    const [height, setHeight] = useState(data.swellHeight);
    console.log(`height: ${height} handleSwell1Height: ${JSON.stringify(data, 2, null)}`);
    return <Selector
            groupTitle={`SwellHeight${data.id}`}
            selected={height} 
            label="Height" 
            items={[
                "",
                "1ft",
                "2ft",
                "3ft",
                "4ft",
                "5ft",
                "6ft",
                "7ft",
                "8ft",
                "9ft",
                "10ft",
                "11ft",
                "12ft",
                "13ft",
                "14ft",
                "15ft",
                "16ft",
                "17ft",
                "18ft"
            ]}
            //onChange={(data.id === 1) ? handleSwell1Height : handleSwell2Height}
            onChange={() => setHeight(this.value)}
        />
}