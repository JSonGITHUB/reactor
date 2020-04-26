import React from 'react';
import Dialog from '../functional/Dialog.js';

class SignUpDialog extends React.Component {

    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleSignUp = this.handleSignUp.bind(this);
        this.state = {
            title: props.title,
            message: props.message,
            login: ''
        };
    }

    render() {
        return (
            <div className="App-content flexContainer">
                <div className="flex3Column" />
                <div className="flex3Column" >
                    <Dialog title={this.state.title}
                            message={this.state.message}>
                        <input value={this.state.login}
                                onChange={this.handleChange} />
                        <button onClick={this.handleSignUp}>
                            Sign Me Up!
                        </button>
                    </Dialog>              
                </div>
                <div className="flex3Column" />
            </div>
        );
    }

    handleChange(e) {
        this.setState({login: e.target.value});
    }

    handleSignUp() {
        alert(`Welcome aboard, ${this.state.login}!`);
    }
}
export default SignUpDialog;