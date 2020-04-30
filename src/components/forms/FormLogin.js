import React from 'react';

class FormLogin extends React.Component {

    constructor(props) {
        super(props);
        this.state = {user: props.user};
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleLoginClick = this.handleLoginClick.bind(this);
        this.handleLogoutClick = this.handleLogoutClick.bind(this);
        //this.state = {isLoggedIn: false};
    }

    handleChange(event) {
        //console.log("value: " + event.target.value)
        this.setState({value: event.target.value});
        this.setState({isLoggedIn: true});
    }

    handleSubmit(event) {
        event.preventDefault();
    }

    handleLoginClick() {
        this.setState({isLoggedIn: true});
        this.props.handleClick(true, this.state.value);
    }

    handleLogoutClick() {
        this.setState({value: "", isLoggedIn: false});
        this.props.handleClick(false, "");
    }

    render() {

        const isLoggedIn = this.props.isLoggedIn;
        let button;

        if (isLoggedIn) {
            button = <LogoutButton type="submit" value={this.state.value} handleChange={this.handleChange} className="ml-2" onClick={this.handleLogoutClick} />;
        } else {
            button = <LoginButton type="submit" value={this.state.value} handleChange={this.handleChange} className="ml-2" onClick={this.handleLoginClick} />;
        }

        return (
            /*
            <div className='width-100-percent mt-20'>
                <Greeting isLoggedIn={isLoggedIn} /><br/><br/>
                {button}
            </div>
            */
            <form onSubmit={this.handleSubmit}>
                {/*<span>{this.state.value}</span>*/}
                {/*<input type="text" value={this.state.value} onChange={this.handleChange}/>*/}
                {/*<button type="submit" value="Sign in" className="ml-2" onClick={this.handleLoginClick}>Sign in</button>*/}
                {button}
            </form>            
        );
    }
}

export default FormLogin;


function LoginButton(props) {
    return (
        <div>
            <input type="text" value={props.value} onChange={props.handleChange}/>
            <button className="button-green" onClick={props.onClick}>
                Login
            </button>
        </div>
        
    );
}

function LogoutButton(props) {
    return (
        <button  className="button-green" onClick={props.onClick}>
            Logout
        </button>
    );
}