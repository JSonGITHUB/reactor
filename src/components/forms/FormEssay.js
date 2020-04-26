import React from 'react';

class FormEssay extends React.Component {

    constructor(props) {

        super(props);
        this.state = {
            value: ''
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        alert('An essay was submitted: ' + this.state.value);
        event.preventDefault();
    }

    render() {
        return (
            <div className="App-content flexContainer">
                <div className="flex3Column" />
                <div className="flex3Column" >
                    <form onSubmit={this.handleSubmit} className="neumorphism p-20">
                        <label>
                            <textarea rows="13" cols="75" className="mb-30" value={this.state.value} onChange={this.handleChange} />
                        </label><br/>
                        <input type="submit" value="Submit" />
                    </form>
                </div>
                <div className="flex3Column" />
            </div>
        );
    }
}

export default FormEssay;