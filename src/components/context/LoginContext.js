import React, { createContext, useContext, useState } from 'react';

const LoginContext = createContext();

export const useLogin = () => useContext(LoginContext);

const passwords = {
    admin: 'admin',
    user: 'user',
    visitor: 'visitor',
};

export const LoginProvider = ({ children }) => {
    const [role, setRole] = useState(null);

    const login = (inputPassword) => {
        for (const [key, pwd] of Object.entries(passwords)) {
            if (inputPassword === pwd) {
                setRole(key);
                return key;
            }
        }
        return null;
    };

    const logout = () => setRole(null);

    return (
        <LoginContext.Provider value={{ role, login, logout }}>
            {children}
        </LoginContext.Provider>
    );
};
