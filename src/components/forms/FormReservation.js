import React from 'react';

class Reservation extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isGoing: true,
            numberOfGuests: 2
        };
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.name === 'isGoing' ? target.checked : target.value;
        const name = target.name;
        this.setState({
            [name]: value
        });
    }

    render() {
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
                            checked={this.state.isGoing}
                            onChange={this.handleInputChange}
                        />
                    </label>
                    <br />
                    <br />
                    <label>
                        Number of guests:<br/>
                        <input className="mt-10 greet p-10 r-10 brdr-green"
                            name="numberOfGuests"
                            type="number"
                            value={this.state.numberOfGuests}
                            onChange={this.handleInputChange}/>
                    </label>
                </form>                    
                </div>
                <div className="flex3Column" />
            </div>
        );
    }
}
export default Reservation;