import React, { useState } from 'react';
export default function Adder(props) {
    
    const units = [`km`, `mph`, `pts`, `kts`, `miles`, `ft`, `inches`, `'`, `"`];
    // Declare a new state variable, which we'll call "count"
    const [ count, setCount ] = useState(props.count ? Number(props.count) : 0);
	const [ unit, setUnit ] = useState(props.unit ? props.unit : units[0]);
    const [ label, setLabel ] = useState(props.label ? props.label : "How many?");
    const getUnitId = () => units.indexOf(unit);
    const getNextUnit = () => ((getUnitId()+1)<units.length) ? getUnitId()+1 : 0;
    
    return (
        <div>
            <div className="color-yellow p-5 r-10 flexContainer">
                <div className="flex3Column"></div>
                <div className="p-5 r-10 flex3Column bg-darker">
                    <p>{label}</p>
                    <p>{count} {unit}</p>
                    <div className="p-5 r-10 bg-lite">
                        <button className="r-10 size-25 bold bg-green m-5 p-20" onClick={() => setCount(prevCount => prevCount + 1)}>+</button>
                        <button className="r-10 size-25 bold bg-red m-5 p-20" onClick={() => setCount(prevCount => prevCount - 1)}>-</button>
                    </div>
                </div>
                <div className="flex3Column"></div>
            </div>
            <div className="flexContainer">
                    <div className="flex3Column"></div>
                    <div className="flex3Column">
                        <button className="r-10 greet bold bg-yellow m-5 p-20" onClick={() => setUnit(units[getNextUnit()])}>set unit</button>
                    </div>
                    <div className="flex3Column"></div>
            </div>
        </div>
    );
}