import React, { useState, useEffect, useRef } from 'react';

const Calculator = ({
    newValue,
    onSubmit,
    onClose
}) => {
    const [value, setValue] = useState(newValue ? String(newValue) : '');
    const [result, setResult] = useState('');
    const inputRef = useRef(null);

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                const res = evaluate(value);
                setResult(res);
                setValue(String(res));
            } else if (e.key === 'Escape') {
                setValue('');
                setResult('');
            } else if (e.key === 'Backspace') {
                setValue((prev) => prev.slice(0, -1));
            } else if (/^[\d+\-*/.().]$/.test(e.key)) {
                setValue((prev) => prev + e.key);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [value]);

    const evaluate = (expr) => {
        try {
            if (!/^[\d+\-*/.() ]+$/.test(expr)) return 'Error';
            // eslint-disable-next-line no-eval
            const res = eval(expr);
            return isNaN(res) ? 'Error' : res;
        } catch {
            return 'Error';
        }
    };

    const handleClick = (input) => {
        console.log('Clicked:', input);
        if (input === 'C') {
            setValue('');
            setResult('');
        } else if (input === '=') {
            const res = evaluate(value);
            setResult(res);
            setValue(String(res));
        } else {
            if (
                ['+', '-', '*', '/'].includes(input) &&
                (value === '' || ['+', '-', '*', '/'].includes(value.slice(-1)))
            ) {
                return;
            }
            setValue((prev) => prev + input);
        }
    };

    const handleSubmit = () => {
        const res = evaluate(value);
        if (onSubmit) onSubmit(res);
        if (onClose) onClose();
    };

    return (
        <div className='containerDetail size25 color-lite bg-lite'>
            <div className='containerDetail w-100 p-10 m-5 width-auto'>
                <div className='containerDetail p-20 contentRight color-lite size30 mb-5'>
                    {value || '0'}
                </div>
                <div className='containerDetail p-20 contentRight color-lite size30 mb-5'>
                    {result !== '' ? result : ''}
                </div>
                {/* Hidden input for accessibility and keyboard focus */}
                <input
                    ref={inputRef}
                    style={{ position: 'absolute', left: '-9999px' }}
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    tabIndex={-1}
                />
                <div className='containerDetail'>
                    {[['7', '8', '9', '/'],
                    ['4', '5', '6', '*'],
                    ['1', '2', '3', '-'],
                    ['0', '.', '=', '+']
                    ].map((row, rowId) => (
                        <div key={rowId} className='flexContainer'>
                            {row.map((btn) => (
                                <div
                                    key={btn}
                                    onClick={() => handleClick(btn)}
                                    className='containerDetail flexColumn button color-lite p-20 m-5 w-80'
                                >
                                    {btn}
                                </div>
                            ))}
                        </div>
                    ))}
                    <div className='flexContainer'>
                        <div
                            onClick={() => handleClick('C')}
                            className='containerDetail bg-dkRed button color-lite p-10 ml-5 mr-15 mt-5 mb-10 w-80'
                        >
                            C
                        </div>
                        <div
                            onClick={() => setValue((prev) => prev.slice(0, -1))}
                            className='containerDetail bg-blue button color-lite p-10 ml-5 mr-15 mt-5 mb-10 w-80'
                        >
                            ⌫
                        </div>
                    </div>
                </div>
                <div className='flexContainer'>
                    <div
                        onClick={onClose}
                        className='button containerDetail flex2Column p-20 button bg-lite color-lite m-5'
                    >
                        Cancel
                    </div>
                    <div
                        onClick={handleSubmit}
                        className='button containerDetail flex2Column p-20 button bg-lite color-lite m-5'
                    >
                        Submit
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Calculator;