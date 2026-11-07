import React, { useState, useEffect } from 'react';

import icons from '../site/icons';

const TipCalculator = () => {


        // Load persisted values from localStorage
        const getPersisted = (key, fallback) => {
            const val = localStorage.getItem(key);
            if (val === null || val === undefined) return fallback;
            if (typeof fallback === 'number') return Number(val);
            return val;
        };

        const [amount, setAmount] = useState(() => getPersisted('tipcalc_amount', ''));
        const [tipPercent, setTipPercent] = useState(() => getPersisted('tipcalc_tipPercent', 15));
        const [split, setSplit] = useState(() => getPersisted('tipcalc_split', 1));
        const [focused, setFocused] = useState('amount');

        // Persist values to localStorage on change
        useEffect(() => { localStorage.setItem('tipcalc_amount', amount); }, [amount]);
        useEffect(() => { localStorage.setItem('tipcalc_tipPercent', tipPercent); }, [tipPercent]);
        useEffect(() => { localStorage.setItem('tipcalc_split', split); }, [split]);

    // Parse as float for calculations, ignore trailing dot
    const amountNum = parseFloat(amount.replace(/\.$/, '')) || 0;
    const tip = amountNum * (tipPercent / 100);
    const total = amountNum + tip;
    const perPerson = split > 1 ? total / split : total;

  return (
    <div 
        className='containerDetail color-yellow size20 ml-5 mr-5 contentLeft mt--20' 
        role='region' 
        aria-label='Tip Calculator'
    >
      <div 
        className='containerDetail size20 p-20 color-yellow bg-lite contentLeft' 
        style={{display: 'flex', gap: 12}}
    >
        <span 
            className='size40' 
            aria-hidden='true' 
        >
            {icons.tipcalculator}
        </span>
        Tip Calculator
      </div>
      <form 
        onSubmit={e => e.preventDefault()} 
        className='tip-form pt-20 pl-20' 
        style={{display: 'flex', 
        flexDirection: 'column', 
        gap: 16}}
    >
        <div className='form-group'>
          <label 
            htmlFor='amount' 
            className='mb-5'
          >
            Bill Amount
          </label>
                    <input
                        id='amount'
                        type='text'
                        inputMode='decimal'
                        pattern='^\$?\d{0,9}(\.\d{0,2})?$'
                        min='0'
                        step='0.01'
                        value={amount}
                        onChange={e => {
                            // Allow only numbers and up to one decimal point
                            let val = e.target.value.replace(/[^\d.]/g, '');
                            // Prevent more than one decimal
                            const parts = val.split('.');
                            if (parts.length > 2) return;
                            if (parts[1] && parts[1].length > 2) return;
                            setAmount(val);
                        }}
                        onBlur={e => {
                            // Format as currency on blur if valid
                            if (amount && !isNaN(Number(amount))) {
                                setAmount(Number(amount).toFixed(2));
                            }
                        }}
                        aria-label='Bill Amount'
                        className='containerBox inputBox color-lite size20 p-10 mt-10 width--30'
                        autoFocus={focused === 'amount'}
                        onFocus={() => setFocused('amount')}
                        placeholder='0.00'
                    />
        </div>
        <div className='flexContainer contentLeft mt--10'>
            <div className='flex2Column'>
                                <label htmlFor='tipPercent' className=''>
                                        Tip %
                                </label>
                                <div className='ml--5 mt-5'>
                                    <select
                                        id='tipPercent'
                                        value={tipPercent}
                                        onChange={e => setTipPercent(Number(e.target.value))}
                                        aria-label='Tip Percentage'
                                        className='containerBox inputBox color-lite size20 p-10 width--10'
                                        onFocus={() => setFocused('tipPercent')}
                                    >
                                        {[5, 10, 12, 15, 18, 20, 22, 25, 30, 35, 40, 50].map(val => (
                                            <option key={val} value={val}>{val}%</option>
                                        ))}
                                    </select>
                                </div>
            </div>
            <div className='flex2Column'>
                <label 
                        htmlFor='split' 
                        className='mb-5'
                >
                        Split
                </label>
                <div className='mt-5 ml--5'>
                    <select
                        id='split'
                        value={split}
                        onChange={e => setSplit(Number(e.target.value))}
                        aria-label='Number of People'
                        className='containerBox inputBox color-lite size20 p-10 width--30'
                        onFocus={() => setFocused('split')}
                    >
                        {Array.from({length: 20}, (_, i) => i + 1).map(val => (
                            <option key={val} value={val}>{val}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
      </form>
      <div 
        className='containerDetail flexContainer p-10 color-yellow tip-results mt-20 bg-lite' 
        aria-live='polite' 
      >
        <div className='flexContainer width-100-percent'>
            <div className='flex2Column contentLeft p-10'>
                <div className='mb-10'>
                    Tip:
                </div>
                <div>
                    Total:
                </div>
            </div>
            <div className='flex2Column p-10'>
                <div className='pl-10 color-orange flex2Column mb-10 contentRight'>
                    ${tip.toFixed(2)}
                </div>
                <div className='pl-10 color-orange flex2Column contentRight'>
                    ${total.toFixed(2)}
                </div>
            </div>
        </div>
        
      </div>
        {
            split > 1 && <div className='containerDetail contentCenter pl-40 p-20 pb-10 mt-5 bg-lite flexContainer'>
                            <div className='flex2Column contentLeft'>
                                Per Person:
                            </div>
                            <div className='flex2Column color-orange contentRight'>
                                ${perPerson.toFixed(2)}
                            </div>
                        </div>
        }
    </div>
  );
};

export default TipCalculator;
