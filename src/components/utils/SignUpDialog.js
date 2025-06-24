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
        const { title, message, login } = this.state;
        return (
            <div className='App-content pb-400 sizeMobile flexContainer width-100-percent fadeIn'>
                <div className='flex3Column' />
                <div className='flex3Column' >
                    <Dialog title={title}
                            message={message}>
                        <input
                            id='login' 
                            name='login'
                            value={login} 
                            placeholder='Enter here...'
                            onChange={this.handleChange} 
                            className='greet p-20 r-10 w-200 brdr-green'
                        />
                        <button onClick={this.handleSignUp} className='ml-5 greet p-20 r-10 w-200 bg-green brdr-green'>
                            Sign Me Up!
                        </button>
                    </Dialog>              
                </div>
                <div className='flex3Column' />
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