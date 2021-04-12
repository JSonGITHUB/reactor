import React from 'react';
import { connect } from 'react-redux';
import { signIn, signOut } from '../../actions';
import LocalAuth from './LocalAuth.js';

class GoogleAuth extends React.Component {
  constructor(props) {
    super(props);
    console.log(`GoogleAuth => props.isSignedIn: ${this.props.isSignedIn}`)
    this.state = {
      localSignIn: false
    };
  }
  componentDidMount() {
    console.log(`GoogleAuth => componentDidMount(): ${JSON.stringify(this.props,null,2)}`)
    
    window.gapi.load('client:auth2', () => {
      window.gapi.client
        .init({
          clientId:
            '708928164694-1hej0sd42volq7ng5enucjbhr6n18fl8.apps.googleusercontent.com',
          scope: 'email'
        })
        .then(() => {
          this.auth = window.gapi.auth2.getAuthInstance();
          this.onAuthChange(this.auth.isSignedIn.get());
          this.auth.isSignedIn.listen(this.onAuthChange);
        });
    });
  }

  onAuthChange = isSignedIn => {
    if (isSignedIn) {
      this.props.signIn(this.auth.currentUser.get().getId());
    } else {
      this.props.signOut();
    }
  };

  onSignInClick = () => {
    this.auth.signIn();
  };

  onSignOutClick = () => {
    this.auth.signOut();
  };
  setSignIn = () => {
    console.log(`GoogleAuth => setSignIn => localSignIn: ${!this.state.localSignIn}`)
    this.setState({ localSignIn: !this.state.localSignIn });
    return this.props.setSignIn();
  };

  renderAuthButton() {
    console.log(`GoogleAuth => this.props.isSignedIn: ${this.props.isSignedIn}`)
    console.log(`GoogleAuth => this.state.localSignIn: ${this.state.localSignIn}`)

    if (this.props.isSignedIn === null) {
      return <LocalAuth 
                isSignedIn={this.state.localSignIn}
                setSignIn={this.setSignIn}
              />
    } else if (this.state.localSignIn || this.props.isSignedIn) {
      return (
        <button onClick={this.onSignOutClick} className="ui google button">
          <i className="larger middle aligned icon user" />
          Sign Out
        </button>
      );
    } else {
      return (
        <button onClick={this.onSignInClick} className="ui google button">
          <i className="larger middle aligned icon user" />
          Sign In with Google
        </button>
      );
    }
  }

  render() {
    return <React.Fragment>{this.renderAuthButton()}</React.Fragment>;
  }
}

const mapStateToProps = state => {
  console.log(`GoogleAuth => mapStateToProps => state: ${JSON.stringify(state,null,2)}`);
  return { isSignedIn: state.auth.isSignedIn };
};

export default connect(
  mapStateToProps,
  { signIn, signOut }
)(GoogleAuth);
