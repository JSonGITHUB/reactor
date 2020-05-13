import React from 'react';

const UserGreeting = props => <div className="greet p-5">
                                Welcome back {props.user}!
                            </div>;
  
const GuestGreeting = () => <div className="greet p-5">
                                Sign up...
                            </div>;

const Greeting = props => {
    const isLoggedIn = props.isLoggedIn;
    const user = props.user;
    if (isLoggedIn) {
        return <UserGreeting user={user}/>;
    }
    return <GuestGreeting user={user}/>;
}

export default Greeting;