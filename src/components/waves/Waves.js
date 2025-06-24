import React, { useState, useRef} from 'react';
import OceanParent from '../context/OceanContext';
import WavesParent from '../context/WavesContext';
import WavesNew from './WavesNew';

const Waves = () => {

    const targetElementRef = useRef(null);
    const [retry, setRetry] = useState('');
    return (
        (retry !== '')
            ? <div>
                WATER TEMP: Error fetching data retry attempt {retry}
            </div>
            : <OceanParent targetElementRef={targetElementRef} >
                <WavesParent targetElementRef={targetElementRef} >
                    <WavesNew>
                    </WavesNew>
                </WavesParent>
            </OceanParent>
    )
}
export default Waves;