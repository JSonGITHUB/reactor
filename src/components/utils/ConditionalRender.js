import React from 'react';

export function UserGreeting(props) {
    return <h1>Welcome back!</h1>;
}

export function GuestGreeting(props) {
    return <h1>Please sign up.</h1>;
}

export function Greeting(props) {
    const isLoggedIn = props.isLoggedIn;
    console.log(`isLoggedIn: ${isLoggedIn}`)
    if (isLoggedIn === true) {
        return <UserGreeting />;
    }
    return <GuestGreeting />;
}