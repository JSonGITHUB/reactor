//stateful component
import React, { useState } from 'react';

import Greeting from './Greeting.js'
import FormLogin from '../forms/FormLogin.js';

const LoginControl = () => {
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState("");
  const [value, setValue] = useState({});

  const handleClick = (isLoggedIn, user) => {
    setIsLoggedIn(isLoggedIn);
    setUser(user);
    setValue({
      viewer:user,
      login: () => console.log(`login`),
      logout: () => console.log(`logout`)
    });
  }
  return (
      <div className='width-100-percent mt-20 responsiveTopMargin'>
        <Greeting isLoggedIn={isLoggedIn} user={user} />
        <FormLogin isLoggedIn={isLoggedIn} user={user} handleClick={handleClick}/>
      </div>
    
  );
}

export default LoginControl;