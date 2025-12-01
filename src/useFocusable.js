// useFocusable.js
import { useEffect, useRef, useState } from 'react';
import { useFocusManager } from './FocusManagerContext';

export const useFocusable = () => {
    const { registerFocusable, currentIndex } = useFocusManager();
    const ref = useRef(null);
    const [myIndex, setMyIndex] = useState(null);

    useEffect(() => {
        const { index, unregister } = registerFocusable(ref);
        setMyIndex(index);
        return () => unregister();
    }, [registerFocusable]);

    const isFocused = myIndex !== null && currentIndex === myIndex;

    return { ref, isFocused };
};
