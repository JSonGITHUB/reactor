import React from 'react';

export function UserGreeting(props) {
    return <div className="greet p-5">Welcome back {props.user}!</div>;
}
  
export function GuestGreeting(props) {
    return <div className="greet p-5">Sign up...</div>;
}

export default function Greeting(props) {
    const isLoggedIn = props.isLoggedIn;
    const user = props.user;
    if (isLoggedIn) {
        return <UserGreeting user={user}/>;
    }
    return <GuestGreeting user={user}/>;
}