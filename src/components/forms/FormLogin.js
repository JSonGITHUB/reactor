import React, { useState } from 'react';

const FormLogin = ({isLoggedIn, user, handleClick}) => {

    const [loggedIn, setLoggedIn] = useState(isLoggedIn);
    const [value, setValue] = useState('');

    const handleChange = (event) => {
        //console.log("value: " + event.target.value)
        setValue(event.target.value);
        //setLoggedIn(true);
    }

    const handleSubmit = (event) => event.preventDefault();

    const handleLoginClick = () => {
        setLoggedIn(true);
        handleClick(true, value);
    }

    const handleLogoutClick = () => {
        setValue("")
        setLoggedIn(false);
        handleClick(false, "");
    }
    const LoginButton = () => <div>
                <input type="text" value={value} onChange={(e) => setValue(e.target.value)}/>
                <button className="button-green" onClick={handleLoginClick}>
                    Login
                </button>
            </div>
    
    const LogoutButton = () => <button  className="button-green" onClick={handleLogoutClick}>
                                    Logout
                                </button>
    let button;

    if (loggedIn) {
        button = <LogoutButton type="submit" value={value} className="greet p-20 r-10 w-200 bg-green brdr-green ml-2" />;
    } else {
        button = <LoginButton type="submit" value={value} className="greet p-20 r-10 w-200 bg-green brdr-green ml-2" />;
    }

    return (
        <form onSubmit={handleSubmit}>
            {button}
        </form>            
    );
}

export default FormLogin;