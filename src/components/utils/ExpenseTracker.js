import React, { useState, useEffect } from 'react';

const ExpenseTracker = () => {
  const currencyOptions = {
    US: 'Dollar',
    Mexico: 'Peso',
    Nicaragua: 'Córdoba',
    'Costa Rica': 'Colones',
    Indonesia: 'Rupiah',
    Australian: 'AUD',
  };

  const [expenses, setExpenses] = useState([]);
  const [expenseData, setExpenseData] = useState({
    date: '',
    time: '',
    expense: '',
    location: '',
    cost: '',
    currency: '',
  });

  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses');
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  const handleInputChange = (event) => {
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
    });
  };

  const getCurrentDate = () => {
    const currentDate = new Date();
    return currentDate.toDateString();
  };

  const getCurrentTime = () => {
    const currentTime = new Date();
    return currentTime.toLocaleTimeString();
  };

  return (
    <div>
      <h2>Expense Tracker</h2>
      <br/>
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
      <br/>
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
      <br/>
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
      <br/>
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
            {Object.values(currencyOptions).map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </label>
      </div>
      <br/>
      <div>
        <div className='bg-orange greet timerBox m-20 color-black' onClick={handleAddExpense}>Add Expense</div>
      </div>
      <br/>
      <br/>
      <div className='bg-darker r-10 p-10 ml-20 mr-20 mb-1 bold'>
        <h3>Expense List</h3>
        {expenses.length === 0 ? (
          <p>No expenses recorded.</p>
        ) : (
          <ol>
            {expenses.map((expense, index) => (
              <li className='p-10 ml-20 mr-20 mb-1 bold lowerBorder' key={index}>
               {expense.expense}: {expense.date} - {expense.time} - {expense.location} - ${expense.cost} {expense.currency}s
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
};

export default ExpenseTracker;