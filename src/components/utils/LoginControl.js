//stateful component
import React from 'react';

import Greeting from './Greeting.js'
import FormLogin from '../forms/FormLogin.js';

class LoginControl extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.state = {isLoggedIn: false};
  }

  handleClick(isLoggedIn, user) {
    this.setState({
      isLoggedIn: isLoggedIn, 
      user: user,
      value: {
        viewer:user,
        login: () => console.log(`login`),
        logout: () => console.log(`logout`)
      }
    });
  }

  render() {
    
    const isLoggedIn = this.state.isLoggedIn;
    const user = this.state.user;
    /*
    let button;
    if (isLoggedIn) {
      button = <LogoutButton onClick={this.handleLogoutClick} />;
    } else {
      button = <LoginButton onClick={this.handleLoginClick} />;
    }
    */
    return (
      
        <div className='width-100-percent mt-20 responsiveTopMargin'>
          <Greeting isLoggedIn={isLoggedIn} user={user} />
          <FormLogin isLoggedIn={isLoggedIn} user={user} handleClick={this.handleClick}/>
        </div>
      
    );
  }
}

export default LoginControl;