import React, { useState, useEffect } from 'react';
import ExchangeRatesConfig from './ExchangeRatesConfig';

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

  const [exchangeRates, setExchangeRates] = useState({});
  const [usdAmount, setUsdAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('MXN');
  const [convertedAmount, setConvertedAmount] = useState('');
  const [settings, setSettings] = useState(false)
  const [expenses, setExpenses] = useState([]);
  const [countryCode, setCountryCode] = useState([]);
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
    const savedExchangeRates = localStorage.getItem('exchangeRates');
    if (savedExchangeRates) {
      setExchangeRates(JSON.parse(savedExchangeRates));
    }
  }, []);

  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses');
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

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
  useEffect(() => {
    localStorage.setItem('exchangeRates', JSON.stringify(exchangeRates));
  }, [exchangeRates]);

  const handleExpenseInputChange = (event) => {
    setUsdAmount(event.target.value);
    console.log(`${selectedCurrency}: ${event.target.value} - USD: ${convertToUS(event.target.value)}`)
  };
  const handleCurrencyInputChange = (event) => {
    //console.log(event.target.value)
    //alert(`USD: ${event.target.value}`)
    setSelectedCurrency(event.target.value);
  };
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'cost') {
      handleExpenseInputChange(event);
    }
    if (name === 'currency') {
      handleCurrencyInputChange(event);
    }
    setExpenseData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCurrencyChange = (currency) => {
    setSelectedCurrency(currency);
  };

  const convertToUS = (amount) => {
      console.log(`convertToUS(${amount}) selectedCurrency: ${selectedCurrency}`)
      const rate = exchangeRates['MXN'];
      console.log(`convertToUS(${amount}) rate(${rate})`)
      const convertedValue = amount / rate;
      const converted = convertedValue.toFixed(2);
      setConvertedAmount(converted);
      return converted;
  };

  const reversedExpenses = [...expenses].reverse().map((item) => {
    // Perform your mapping logic here
    return item * 2;
  });

  return (
    <div>
      <ExchangeRatesConfig onExchangeRatesChange={setExchangeRates}></ExchangeRatesConfig>
      <div className='bg-darker r-10 p-10 ml-20 mr-20 mb-1 bold'>
        <label>
          Expense:
          <input
            type="text"
            name="expense"
            value={expenseData.expense}
            onChange={handleInputChange}
            className='r-10 p-10 mr-20 ml-20 bold'
          />
        </label>
      </div>
      <br />
      <div className='bg-darker r-10 p-10 ml-20 mr-20 mb-1 bold'>
        <label>
          Location:
          <select
            name="location"
            value={expenseData.location}
            onChange={handleInputChange}
            className='r-10 p-10 mr-20 ml-20 bold'
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
      <div className='bg-darker r-10 p-10 ml-20 mr-20 mb-1 bold'>
        <label>
          Currency:
          <select
            name="currency"
            value={expenseData.currency}
            onChange={handleInputChange}
            className='r-10 p-10 mr-20 ml-20 bold'
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
      <div className='bg-darker r-10 p-10 ml-20 mr-20 mb-1 bold'>
        <label>
          Cost:
          <input
            type="number"
            name="cost"
            value={expenseData.cost}
            onChange={handleInputChange}
            className='r-10 p-10 mr-20 ml-20 bold'
          />
        </label>
      </div>
      <br />
      <div>
        <div className='bg-orange greet timerBox m-20 color-black' onClick={handleAddExpense}>Add Expense</div>
      </div>
      <br />
      <br />
      <div className='bg-darker r-10 p-10 ml-20 mr-20 mb-1 bold'>
        <h3>Expense List</h3>
        {expenses.length === 0 ? (
          <p>No expenses recorded.</p>
        ) : (
          <ol>
            {[...expenses].reverse().map((expense, index) => (
              <li className='p-10 ml-20 mr-20 mb-1 bold lowerBorder size20' key={index}>
                {expense.expense}: {expense.cost/*exchangeRates[expense.currency]'USD'*/} {expense.currency}
                <div className='copyright'>
                  {expense.date} - {expense.time} - {expense.location} : {expense.countryCode} - ${expense.cost} {expense.currency}s
                </div>
                <div 
                  className='copyright color-red brdr-red button p-10 r-5 b-1 m-5'
                  onClick={() => removeExpense(index)}
                >
                  delete
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
};

export default ExpenseTracker;