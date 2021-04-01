import React from "react";
import { connect } from "react-redux";
import { signIn, signOut } from "../../actions/index.js";

class LocalAuth extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isSignedIn: this.props.isSignedIn,
        };
    }
    onSignInClick = () => {
        console.log(`LocalAuth => SignInClick!!! (${this.props.isSignedIn})`);
        //this.auth.signIn();
        this.props.setSignIn();
    };
    onSignOutClick = () => {
        console.log(`LocalAuth => SignOutClick!!! (${this.props.isSignedIn})`);
        //this.auth.signOut();
        this.props.setSignIn();
    };
    renderAuthButton() {
        if (this.state.isSignedIn === null) {
            return null;
        } else if (this.props.isSignedIn === true) {
            return (
                <button onClick={this.onSignOutClick} className="ui google button">
                <i className="larger middle aligned icon user" />
                Local Sign Out
                </button>
            );
        } else {
            return (
                <button onClick={this.onSignInClick} className="ui google button">
                <i className="larger middle aligned icon user" />
                Local Sign In
                </button>
            );
        }
    }

    render() {
        return <div>{this.renderAuthButton()}</div>;
    }
}

export default LocalAuth;
