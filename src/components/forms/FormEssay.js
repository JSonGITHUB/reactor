import React from 'react';

class FormEssay extends React.Component {

    constructor(props) {

        super(props);
        this.state = {
            value: (localStorage.getItem("notes")) ? localStorage.getItem("notes") : null
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        //alert('An essay was submitted: ' + this.state.value);
        localStorage.setItem("notes", this.state.value);
        event.preventDefault();
    }
    clear(event) {
        //alert('An essay was submitted: ' + this.state.value);
        localStorage.setItem("notes", "");
        this.setState({value: ""});
    }

    render() {
        return (
            <div className="App-content flexContainer width-100-percent fadeIn">
                <div className="flex3Column" />
                <div className="flex3Column" >
                    <form onSubmit={this.handleSubmit} className="neumorphism p-20">
                        <label>
                            <textarea rows="13" cols={window.innerWidth/15} className="mb-30" value={this.state.value} onChange={this.handleChange} />
                        </label><br/>
                        <div className="flexContainer">
                            <input type="submit" value="Submit" className="flex2Column greet p-20 r-10 w-200 bg-green brdr-green"/>
                            <div value="Submit" className="flex2Column button greet p-20 r-10 w-200 bg-red brdr-red" onClick={() => this.clear()}>clear</div>
                        </div>
                    </form>
                </div>
                <div className="flex3Column" />
            </div>
        );
    }
}

export default FormEssay;