import React from 'react';

const UserGreeting = () => <h1>Welcome back!</h1>;

const GuestGreeting = () => <h1>Please sign up.</h1>;

const Greeting = props => {
    const isLoggedIn = props.isLoggedIn;
    console.log(`isLoggedIn: ${isLoggedIn}`)
    if (isLoggedIn === true) {
        return <UserGreeting />;
    }
    return <GuestGreeting />;
}

export {
    Greeting, 
    GuestGreeting, 
    UserGreeting,
}