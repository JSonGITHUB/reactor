import React, { useState } from 'react';

const  Reservation = () => {

    const [isGoing, setIsGoing] = useState(true);
    const [numberOfGuests, setNumberOfGuests] = useState(2);
    const [name, setName] = useState('');

    const handleInputChange = (event) => {
        const target = event.target;
        const value = target.name === 'isGoing' ? target.checked : target.value;
        const name = target.name;
        setName(value);
    }
    return (
        <div className="App-content flexContainer width-100-percent fadeIn">
            <div className="flex3Column" />
            <div className="flex3Column" >
            <form className="neumorphism p-20">
                <label>
                    Is going:<br/>
                    <input
                        name="isGoing"
                        type="checkbox"
                        checked={isGoing}
                        onChange={handleInputChange}
                    />
                </label>
                <br />
                <br />
                <label>
                    Number of guests:<br/>
                    <input className="mt-10 greet p-10 r-10 brdr-green"
                        name="numberOfGuests"
                        type="number"
                        value={numberOfGuests}
                        onChange={handleInputChange}/>
                </label>
            </form>                    
            </div>
            <div className="flex3Column" />
        </div>
    );
}
export default Reservation;