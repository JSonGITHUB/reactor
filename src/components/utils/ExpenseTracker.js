import React, { useState, useEffect } from 'react';
import ExchangeRatesConfig from './ExchangeRatesConfig';
import initData from './ExpenseTrackerInitData.js';

const ExpenseTracker = () => {

  const countries = {
    USD: {
      country: `US`,
      dollar: `Dollar`
    },
    MXN: {
      country: `Mexico`,
      dollar: `Pesos`,
    },
    NIO: {
      country: `Nicaragua`,
      dollar: `Córdoba`,
    },
    CRC: {
      country: `Costa Rica`,
      dollar: `Colones`,
    },
    IDR: {
      country: `Indonesia`,
      dollar: `Rupiah`,
    },
    AUD: {
      country: `Australia`,
      dollar: `AUD`,
    }
  }

  const currencyCode = [
    'USD',
    'MXN',
    'NIO',
    'CRC',
    'IDR',
    'AUD',
  ];
  const currencyOptions = {
    US: 'USD',
    Mexico: 'MXN',
    Nicaragua: 'NIO',
    'Costa Rica': 'CRC',
    Indonesia: 'IDR',
    Australia: 'AUD',
  };

  const currencies = {
    USD: 'Dollar',
    MXN: `Pesos`,   // Mexican Peso
    NIO: `Córdoba`,   // Nicaraguan Cordovas
    CRC: `Colones`,    // Costa Rican Colones
    IDR: `Rupiah`,  // Indonesian Rupiah
    AUD: `AUD`,    // Australian Dollar
  };

  const defaultExchangeRates = {
    'USD': 1,
    'MXN': 17.16,   // Mexican Peso
    'NIO': 36.55,   // Nicaraguan Cordovas
    'CRC': 541.23,    // Costa Rican Colones
    'IDR': 15000,  // Indonesian Rupiah
    'AUD': 1.5,    // Australian Dollar
  };

  const [exchangeRates, setExchangeRates] = useState(defaultExchangeRates);
  const [usdAmount, setUsdAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('MXN');
  const [convertedAmount, setConvertedAmount] = useState('');
  const [settings, setSettings] = useState(false)
  const [totalExpenses, setTotalExpenses] = useState();
  const [expenses, setExpenses] = useState([]);
  const [expenseData, setExpenseData] = useState({
    date: '',
    time: '',
    expense: '',
    location: '',
    cost: '',
    currency: '',
    countryCode: ''
  });

  useEffect(() => {
    const grandTotal = getTotalExpenses();
    localStorage.setItem('totalExpenses', grandTotal);
    setTotalExpenses(grandTotal);
    console.log(`Total Expense: ${grandTotal}`)
  }, []);

  useEffect(() => {
    const savedExchangeRates = localStorage.getItem('exchangeRates');
    if (savedExchangeRates !== '{}') {
      setExchangeRates(JSON.parse(savedExchangeRates));
    } else {
      setExchangeRates(defaultExchangeRates);
    }
    console.log(`IDR: ${exchangeRates.IDR}`);
  }, []);

  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses');
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    } else {
      setExpenses(initData);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
    const grandTotal = getTotalExpenses();
    localStorage.setItem('totalExpenses', grandTotal);
    setTotalExpenses(grandTotal);
    console.log(`Total Expense: ${grandTotal}`)
  }, [expenses]);
  
  useEffect(() => {
    console.log(`exchangeRates changed: ${exchangeRates}`)
    localStorage.setItem('exchangeRates', JSON.stringify(exchangeRates));
  }, [exchangeRates]);

  const handleInputRateChange = (event) => {
    const { name, value } = event.target;
    setExpenseData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddExpense = () => {
    const newExpense = { ...expenseData };
    newExpense.date = getCurrentDate();
    newExpense.time = getCurrentTime();
    setExpenses((prevExpenses) => [...prevExpenses, newExpense]);
    setExpenseData({
      date: '',
      time: '',
      expense: '',
      location: '',
      cost: '',
      currency: '',
      countryCode: ''
    });
  };
  const removeExpense = (index) => {
    const savedExpenses = localStorage.getItem('expenses');
    const expenseUpdate = JSON.parse(savedExpenses);
    expenseUpdate.splice(index, 1);
    setExpenses(expenseUpdate);
  }

  const getCurrentDate = () => {
    const currentDate = new Date();
    return currentDate.toDateString();
  };

  const getCurrentTime = () => {
    const currentTime = new Date();
    return currentTime.toLocaleTimeString();
  };

  const handleExpenseInputChange = (event) => {
    setUsdAmount(event.target.value);
    console.log(`${selectedCurrency}: ${event.target.value} - `)
  };
  const handleCurrencyInputChange = (event) => {
    //console.log(event.target.value)
    //alert(`USD: ${event.target.value}`)
    //setCountryCode(event.target.value);
    setSelectedCurrency(event.target.value);
  };
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'cost') {
      handleExpenseInputChange(event);
    }
    if (name === 'currency') {
      handleCurrencyInputChange(event);
      setExpenseData((prevData) => ({
        ...prevData,
        [name]: value,
        countryCode: value,
      }));
    } else {
      setExpenseData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
      
  };

  const handleCurrencyChange = (currency) => {
    setSelectedCurrency(currency);
  };

  const getTotalExpenses = () => {
    const total = expenses.reduce((acc, expense) => {
      const itemTotal = convertToUS(expense.cost, expense.countryCode);
      return acc + itemTotal;
    }, 0);
    return "$" + total.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
  };  

  const reversedExpenses = [...expenses].reverse().map((item) => {
    // Perform your mapping logic here
    return item * 2;
  });
  const formatNumber = (amount) => {
    const formattedNumber = Number(amount).toLocaleString();
    return formattedNumber
  }
  const convertToUS = (amount, countryCode) => {
    console.log(`convertToUS(${amount}) selectedCurrency: ${countryCode}`)
    const rate = exchangeRates[countryCode];
    console.log(`convertToUS(${amount}) rate(${rate})`)
    const convertedValue = amount / rate;
    const converted = convertedValue.toFixed(2);
    console.log(`convertToUS:(${amount}) rate:(${rate}) converted:(${converted})`)
    //setConvertedAmount(converted);
    return Number(converted);
};

  return (
    <div>
      <ExchangeRatesConfig onExchangeRatesChange={setExchangeRates}></ExchangeRatesConfig>
      <div className='bg-darker r-10 p-10 ml-20 mr-20 mb-1'>
        <label>
          Expense:
          <input
            type="text"
            name="expense"
            value={expenseData.expense}
            onChange={handleInputChange}
            className='r-10 p-10 mr-20 ml-20'
          />
        </label>
      </div>
      <br />
      <div className='bg-darker r-10 p-10 ml-20 mr-20 mb-1'>
        <label>
          Location:
          <select
            name="location"
            value={expenseData.location}
            onChange={handleInputChange}
            className='r-10 p-10 mr-20 ml-20'
          >
            <option value="">Select Location</option>
            {Object.keys(currencyOptions).map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </label>
      </div>
      <br />
      <div className='bg-darker r-10 p-10 ml-20 mr-20 mb-1'>
        <label>
          Currency:
          <select
            name="currency"
            value={expenseData.currency}
            onChange={handleInputChange}
            className='r-10 p-10 mr-20 ml-20'
          >
            <option value="">Select Currency</option>
            {currencyCode.map((currency) => (
              <option key={currency} value={currency}>
                {currencies[currency]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <br />
      <div className='bg-darker r-10 p-10 ml-20 mr-20 mb-1'>
        <label>
          Cost:
          <input
            type="number"
            name="cost"
            value={expenseData.cost}
            onChange={handleInputChange}
            className='r-10 p-10 mr-20 ml-20'
          />
        </label>
      </div>
      <br />
      <div>
        <div className='bg-orange greet timerBox m-20 color-black' onClick={handleAddExpense}>Add Expense</div>
      </div>
      <br />
      <br />
      <div className='color-yellow mb-20 size20 bold'>Grand Total: {totalExpenses}</div>
      <div className='bg-darker r-10 p-10 ml-20 mr-20 mb-1'>
        {expenses.length === 0 ? (
          <p>No expenses recorded.</p>
        ) : (
          <div>
            {[...expenses].reverse().map((expense, index) => (
              <div className='p-10 ml-20 mr-20 mb-1 lowerBorder size20' key={index}>
                <div className='bold'>{expense.expense}: ${formatNumber(convertToUS(expense.cost,expense.countryCode))} {/*exchangeRates[expense.currency]'USD'*/} {/*expense.currency*/}</div>
                <div className='description'>
                {expense.location} : {expense.date} - {expense.time}<br/>
                  ${formatNumber(expense.cost)} {expense.currency}s
                </div>
                <div 
                  className='description color-red brdr-red button p-10 r-5 b-1 m-5'
                  onClick={() => removeExpense(index-1)}
                >
                  delete
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseTracker;