// FocusManagerContext.js
import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import { ACTIONS, useMultiInput } from './MultiInputContext';

const FocusManagerContext = createContext(null);

export const useFocusManager = () => useContext(FocusManagerContext);

const playSafeSound = (src) => {
    try {
        if (typeof Audio !== 'undefined') {
            const audio = new Audio(src);
            audio.play().catch(() => { });
        }
    } catch (e) {
        // ignore if audio not supported
    }
};

export const FocusManagerProvider = ({ children }) => {
    const { subscribeToAction } = useMultiInput();

    const focusablesRef = useRef([]); // array of refs or nulls
    const [currentIndex, setCurrentIndex] = useState(null);

    const findNextIndex = (arr, from) => {
        if (!arr.length) return null;
        let i = from;
        for (let step = 0; step < arr.length; step++) {
            i = (i + 1) % arr.length;
            if (arr[i]) return i;
        }
        return null;
    };

    const findPreviousIndex = (arr, from) => {
        if (!arr.length) return null;
        let i = from;
        for (let step = 0; step < arr.length; step++) {
            i = i === 0 ? arr.length - 1 : i - 1;
            if (arr[i]) return i;
        }
        return null;
    };

    const registerFocusable = (ref) => {
        let index = focusablesRef.current.findIndex((r) => r === null);
        if (index === -1) {
            focusablesRef.current.push(ref);
            index = focusablesRef.current.length - 1;
        } else {
            focusablesRef.current[index] = ref;
        }

        setCurrentIndex((prev) => (prev == null ? index : prev));

        const unregister = () => {
            focusablesRef.current[index] = null;
            setCurrentIndex((prev) => {
                if (prev !== index) return prev;
                const next = findNextIndex(focusablesRef.current, prev);
                return next;
            });
        };

        return { index, unregister };
    };

    const moveNext = () => {
        setCurrentIndex((prev) => {
            if (prev == null) return prev;
            const next = findNextIndex(focusablesRef.current, prev);
            if (next != null && next !== prev) {
                playSafeSound('/sounds/focus-move.mp3');
                return next;
            }
            return prev;
        });
    };

    const movePrevious = () => {
        setCurrentIndex((prev) => {
            if (prev == null) return prev;
            const next = findPreviousIndex(focusablesRef.current, prev);
            if (next != null && next !== prev) {
                playSafeSound('/sounds/focus-move.mp3');
                return next;
            }
            return prev;
        });
    };

    const activate = () => {
        if (currentIndex == null) return;
        const ref = focusablesRef.current[currentIndex];
        if (ref?.current) {
            playSafeSound('/sounds/activate.mp3');
            ref.current.click();
        }
    };

    // Hook into normalized actions
    useEffect(() => {
        const unsubNext = subscribeToAction(ACTIONS.MOVE_NEXT, () => moveNext());
        const unsubPrev = subscribeToAction(ACTIONS.MOVE_PREVIOUS, () => movePrevious());
        const unsubAct = subscribeToAction(ACTIONS.ACTIVATE, () => activate());

        return () => {
            unsubNext();
            unsubPrev();
            unsubAct();
        };
    }, [subscribeToAction]); // we use state setters inside so it's safe

    // Focus the element when currentIndex changes
    useEffect(() => {
        if (currentIndex == null) return;
        const ref = focusablesRef.current[currentIndex];
        if (ref?.current && typeof ref.current.focus === 'function') {
            ref.current.focus();
        }
    }, [currentIndex]);

    const value = {
        registerFocusable,
        currentIndex,
    };

    return (
        <FocusManagerContext.Provider value={value}>
            {children}
        </FocusManagerContext.Provider>
    );
};
