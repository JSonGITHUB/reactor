import React, { useState, useEffect } from 'react';
import ExchangeRatesConfig from '../converter/ExchangeRatesConfig';
import initData from './ExpenseTrackerInitData';
import currencyCodes from '../converter/currencyCodes';
import currencyOptions from '../converter/currencyOptions';
import currencies from '../converter/currencies';
import defaultExchangeRates from '../converter/defaultExchangeRates';
import defaultExpenses from './defaultExpenses';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import initializeData from '../utils/InitializeData';

const Expenses = () => {

  const getLocalExpenses = () => {
    const savedExpenses = initializeData('expenses', initData);
    return savedExpenses;
  }

  const [exchangeRates, setExchangeRates] = useState(defaultExchangeRates);
  const [totalExpenses, setTotalExpenses] = useState();
  const [expenses, setExpenses] = useState(getLocalExpenses());
  const [expenseData, setExpenseData] = useState(defaultExpenses);
  const [formCollapse, setFormCollapse] = useState(false);
  const [logCollapse, setLogCollapse] = useState(true);

  useEffect(() => {
    const grandTotal = getTotalExpenses();
    localStorage.setItem('totalExpenses', grandTotal);
    setTotalExpenses(grandTotal);
    console.log(`Total Expense: ${grandTotal}`)
  }, []);

  useEffect(() => {
    const savedExchangeRates = initializeData('exchangeRates', defaultExchangeRates)
    setExchangeRates(savedExchangeRates);
    console.log(`IDR: ${exchangeRates.IDR}`);
  }, []);

  useEffect(() => {
    setExpenses(getLocalExpenses());
  }, []);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
    const grandTotal = getTotalExpenses();
    localStorage.setItem('totalExpenses', grandTotal);
    setTotalExpenses(grandTotal);
    console.log(`Expenses => Total Expense: ${grandTotal} expenses: ${JSON.stringify(expenses, null, 2)}`)
  }, [expenses]);

  useEffect(() => {
    console.log(`exchangeRates changed: ${exchangeRates}`)
    localStorage.setItem('exchangeRates', JSON.stringify(exchangeRates));
  }, [exchangeRates]);
  const handleAddExpense = () => {
    console.log(`handleAddExpense => expenseData: ${JSON.stringify(expenseData, null, 2)}`)
    const newExpense = { ...expenseData };
    newExpense.date = getCurrentDate();
    newExpense.time = getCurrentTime();
    setExpenses((prevExpenses) => [...prevExpenses, newExpense]);
    setExpenseData(defaultExpenses);
  };
  const removeItemAtIndex = (array, index) => {
    console.log(`removeItemAtIndex => array length(1): ${array.length}`);
    if (index >= 0 && index < array.length) {
      array.splice(index, 1); // Removes 1 item at the specified index
    }
    console.log(`removeItemAtIndex => array length(2): ${array.length}`);
    console.log(`Expenses => removeItemAtIndex => savedExpenses: ${JSON.stringify(array, null, 2)}`);
    return array;
  }
  const removeExpense = (index) => {
    console.log(`Expenses => removeExpense => index: ${expenses.length-index}`);
    const newExpenses = [...expenses];
    const savedExpenses = removeItemAtIndex(newExpenses, ((expenses.length-1)-index));
    console.log(`Expenses => removeExpense => savedExpenses: ${JSON.stringify(savedExpenses, null, 2)}`);
    setExpenses(savedExpenses);
  }
  const getCurrentDate = () => {
    const currentDate = new Date();
    return currentDate.toDateString();
  };
  const getCurrentTime = () => {
    const currentTime = new Date();
    return currentTime.toLocaleTimeString();
  };
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'currency') {
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
  const getTotalExpenses = () => {
    const total = expenses.reduce((acc, expense) => {
      const itemTotal = convertToUS(expense.cost, expense.countryCode);
      return acc + itemTotal;
    }, 0);
    return '$' + total.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };
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
    return Number(converted);
  };
  const expenseEntry = () => <div>
    <div className='containerBox bg-lite'>
      <ExchangeRatesConfig onExchangeRatesChange={setExchangeRates}></ExchangeRatesConfig>
    </div>
    <div>
      <label className='flexContainer containerInput contentCenter mt-15'>
        <div className='containerBox p-15 columnRightAlign width-50-percent'>
          <span className='inputText'>
            Expense:
          </span>
        </div>
        <div className='columnLeftAlign width-50-percent'>
          <input
            type='text'
            id='expense'
            name='expense'
            value={expenseData.expense}
            onChange={handleInputChange}
            className='inputField'
          />
        </div>
      </label>
      <label className='flexContainer containerInput contentCenter'>
        <div className='containerBox p-15 columnRightAlign width-50-percent'>
          <span className='inputText'>
            Location:
          </span>
        </div>
        <div className='columnLeftAlign width-50-percent'>
          <select
            name='location'
            value={expenseData.location}
            onChange={handleInputChange}
            className='inputSelect'
          >
            <option value=''>Select Location</option>
            {Object.keys(currencyOptions).map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>
      </label>
      <label className='flexContainer containerInput contentCenter'>
        <div className='containerBox p-15 columnRightAlign width-50-percent'>
          <span className='inputText'>
            Currency:
          </span>
        </div>
        <div className='columnLeftAlign width-50-percent'>
          <select
            name='currency'
            value={expenseData.currency}
            onChange={handleInputChange}
            className='inputSelect'
          >
            <option value=''>Select Currency</option>
            {currencyCodes.map((currency) => (
              <option key={currency} value={currency}>
                {currencies[currency]}
              </option>
            ))}
          </select>
        </div>
      </label>
      <label className='flexContainer containerInput contentCenter'>
        <div className='containerBox p-15 columnRightAlign width-50-percent'>
          <span className='inputText'>
            Cost:
          </span>
        </div>
        <div className='columnLeftAlign width-50-percent'>
          <input
            type='number'
            id='cost'
            name='cost'
            value={expenseData.cost}
            onChange={handleInputChange}
            className='inputField'
          />
        </div>
      </label>
      <div
        title='add expense'
        className='bg-soft color-dark size25 r-10 mt-10 mb-10 ml-5 mr-5 p-10 ht-50 centeredContent button'
        onClick={handleAddExpense}
      >
        Add Expense
      </div>
    </div>
  </div>

  const displayLog = () => <div>
    <div className='containerBox'>
      <span>Grand Total: {totalExpenses}</span>
    </div>
    <div>
      {expenses.length === 0 ? (
        <p>No expenses recorded.</p>
      ) : (
        <div className='height--220 r-10'>
          {[...expenses].reverse().map((expense, index) => (
            <div className='relative containerDetail scrollSnapTop m-5 bg-veryLite' key={index}>
              <div className='containerBox min-height-60'>
                <div 
                  title='remove expense'
                  className='absolute w-50 rt-20 t-0 r-5 size15 bg-lite color-yellow button pr-20 pl-20 pt-10 pb-10 contentRight mt-20' 
                  onClick={() => removeExpense(index)}
                >
                  X
                </div>
                <div className='min-height-40 columnLeftAlign color-yellow width--60'>
                  {expense.expense}: ${formatNumber(convertToUS(expense.cost, expense.countryCode))} {/*exchangeRates[expense.currency]'USD'*/} {/*expense.currency*/}
                </div>
              </div>
              <div className='ml-15 mt-2 columnLeftAlign color-lite size15 mb-5'>
                {expense.location} : {expense.date} - {expense.time}<br />
                ${formatNumber(expense.cost)} {expense.currency}s
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>

  return (
    <div className='mt--40'>
      <div className='containerBox'>
        <div className='containerBox  bg-lite'>
          <CollapseToggleButton
            title={'Expense Entry'}
            isCollapsed={formCollapse}
            setCollapse={setFormCollapse}
          />
        </div>
        {
          (formCollapse)
            ? <div></div>
            : <div className='containerBox bg-dark'>
              {expenseEntry()}
            </div>
        }
        <div className='containerBox bg-lite'>
          <CollapseToggleButton
            title={'Expense Log'}
            isCollapsed={logCollapse}
            setCollapse={setLogCollapse}
          />
        </div>
        {
          (logCollapse)
            ? <div></div>
            : displayLog()
        }
      </div>
    </div>
  );
};

export default Expenses;