import React, { createContext, useState } from 'react';

export const ThemeContext = createContext();

const ThemeParent = ({
    children,
    targetElementRef
}) => {

    const [theme, setTheme] = useState('dark');

    return (
        <ThemeContext.Provider
            value={{
                theme,
                setTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}
export const useTheme = () => useContext(ThemeContext);

export default ThemeParent;