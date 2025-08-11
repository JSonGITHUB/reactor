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
import Selector from '../forms/FunctionalSelector';
import icons from '../site/icons';
import ActivitiesPieChart from '../tracker/ActivitiesPieChart';
import defaultTrainingData from '../tracker/defaultTrainingData';
import defaultGoalData from '../tracker/defaultGoalData';
import getKey from '../utils/KeyGenerator';

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
  const [categorySort, setCategorySort] = useState(false);
  const [category, setCategory] = useState();
  const [location, setLocation] = useState();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterCollapse, setFilterCollapse] = useState(true);
  const [trainingData, setTrainingData] = useState();
  const [totalCollapse, setTotalCollapse] = useState(true);

  const getTotalExpenses = () => {
    const total = getList().reduce((acc, expense) => {
      const itemTotal = convertToUS(expense.cost, expense.countryCode);
      console.log(`Expenses => getTotalExpenses => expense: ${itemTotal} code: ${expense.countryCode}`);
      return acc + itemTotal;
    }, 0);
    return total.toFixed(2);
  };

  const getTrainingData = () => {
    const list = getList();
    const categoryTotals = {};
    list.forEach(item => {
      if (!categoryTotals[item.category]) {
        categoryTotals[item.category] = 0;
      }
      categoryTotals[item.category] += Number(item.cost);
    });
    return Object.entries(categoryTotals).map(([category, total]) => ({
      skill: category,
      time: '00:00:00',
      percentage: (getList().reduce((acc, expense) => acc + Number(expense.cost), 0) > 0)
        ? total
        : 0,
    }));
  }

  const getGoalData = () => {
    const list = getList();
    const categoryTotals = {};
    list.forEach(item => {
      if (!categoryTotals[item.category]) {
        categoryTotals[item.category] = 0;
      }
      categoryTotals[item.category] += Number(item.cost);
    });
    return Object.entries(categoryTotals).map(([category, total]) => ({
      skill: category,
      time: '00:00:00',
      // Calculate percentage of total expenses for this category
      percentage: (getList().reduce((acc, expense) => acc + Number(expense.cost), 0) > 0)
        ? total
        : 0,
    }));
  }
  useEffect(() => {
    const grandTotal = '$' + getTotalExpenses();
    localStorage.setItem('totalExpenses', grandTotal);
    setTotalExpenses(grandTotal);
    setCategory(localStorage.getItem('expenseCategory') || 'all');
    setLocation(localStorage.getItem('expenseLocation') || 'all');
    console.log(`Total Expense: ${grandTotal}`)
    const savedExchangeRates = initializeData('exchangeRates', defaultExchangeRates)
    setExchangeRates(savedExchangeRates);
    console.log(`IDR: ${exchangeRates.IDR}`);
    setExpenses(getLocalExpenses());
    setTrainingData(getTrainingData() || defaultTrainingData);
  }, []);
  useEffect(() => {
    console.log(`categorySort: ${categorySort}`)
  }, [categorySort]);
  useEffect(() => {
    localStorage.setItem('expenseCategory', category);
  }, [category]);
  useEffect(() => {
    console.log(`Expenses => location: ${location}`);
    localStorage.setItem('expenseLocation', location);
  }, [location]);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
    const grandTotal = '$' + getTotalExpenses();
    localStorage.setItem('totalExpenses', grandTotal);
    setTotalExpenses(grandTotal);
    console.log(`Expenses => Total Expense: ${grandTotal} expenses: ${JSON.stringify(expenses, null, 2)}`)
    setTrainingData(getTrainingData() || defaultTrainingData);
  }, [expenses]);

  useEffect(() => {
    console.log(`exchangeRates changed: ${JSON.stringify(exchangeRates, null, 2)}`)
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
  const removeExpense = (expenseToRemove) => {
    // Find the index of the expense to remove (match by unique fields, e.g. date+time+cost+expense name)
    const index = expenses.findIndex(exp =>
      exp.expense === expenseToRemove.expense &&
      exp.date === expenseToRemove.date &&
      exp.time === expenseToRemove.time &&
      exp.cost === expenseToRemove.cost
    );
    if (index !== -1) {
      const newExpenses = [...expenses];
      newExpenses.splice(index, 1);
      setExpenses(newExpenses);
    }
  };
  const getCurrentDate = () => {
    const currentDate = new Date();
    return currentDate.toDateString();
  };
  const getCurrentTime = () => {
    const currentTime = new Date();
    return currentTime.toLocaleTimeString();
  };
  //const handleInputChange = (event) => {
  const handleInputChange = (event, expense) => {
    const { name, value } = event.target;
    if (expenseData === expense) {
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
    } else {
      const index = expenses.findIndex(exp =>
        exp.expense === expense.expense &&
        exp.date === expense.date &&
        exp.time === expense.time &&
        exp.cost === expense.cost
      );
      if (index !== -1) {
        const newExpenses = [...expenses];
        newExpenses[index][name] = value;
        setExpenses(newExpenses);
      }
    }
  };
  const formatNumber = (amount) => {
    const formattedNumber = Number(amount).toLocaleString();
    return formattedNumber
  }
  const convertToUS = (amount, countryCode) => {
    console.log(`convertToUS(${amount}) selectedCurrency: ${countryCode}`)
    console.log(`exchangeRates: ${JSON.stringify(exchangeRates, null, 2)}`)
    const rate = exchangeRates[countryCode] || defaultExchangeRates[countryCode];
    console.log(`convertToUS(${amount}) rate(${rate})`)
    const convertedValue = amount / rate;
    const converted = convertedValue.toFixed(2);
    console.log(`convertToUS:(${amount}) rate:(${rate}) converted:(${converted})`)
    return Number(converted);
  };
  const getForm = (expense) => <div>
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
          value={expense.expense}
          onChange={e => handleInputChange(e, expense)}
          className='inputField'
        />
      </div>
    </label>
    <label className='flexContainer containerInput contentCenter'>
      <div className='containerBox p-15 columnRightAlign width-50-percent'>
        <span className='inputText'>
          Category:
        </span>
      </div>
      <div className='columnLeftAlign width-50-percent'>
        <select
          name='category'
          value={expense.category || ''}
          onChange={e => handleInputChange(e, expense)}
          className='inputSelect'
        >
          <option value=''>Select Category</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
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
          value={expense.location}
          onChange={e => handleInputChange(e, expense)}
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
          value={expense.currency}
          onChange={e => handleInputChange(e, expense)}
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
          value={expense.cost}
          onChange={e => handleInputChange(e, expense)}
          className='inputField'
        />
      </div>
    </label>
    <div
      title='add expense'
      className='bg-soft color-dark size25 r-10 mt-10 mb-10 ml-5 mr-5 p-10 ht-50 centeredContent button'
      onClick={(expense === expenseData) ? handleAddExpense : () => editExpense(expense)}
    >
      {`${(expense === expenseData) ? 'Add' : 'Edit'} Expense`}
    </div>
  </div>
  const expenseEntry = () => <div>
    <div className='containerBox bg-lite'>
      <ExchangeRatesConfig onExchangeRatesChange={setExchangeRates}></ExchangeRatesConfig>
    </div>
    {
      getForm(expenseData)
    }
  </div>

  const categories = ['all', 'breakfast', 'lunch', 'dinner', 'snack', 'coffee', 'transportation', 'shopping', 'entertainment', 'utilities', 'rent', 'other']
  const getCategories = [icons.all, icons.breakfast, icons.lunch, icons.dinner, icons.snack, icons.coffee, icons.transportation, icons.shopping, icons.entertainment, icons.utilities, icons.rent, icons.other]

  const convertSelection = (selection) => {
    return categories[getCategories.indexOf(selection)];
  }
  const convertToIcon = (category) => {
    console.log(`Expenses => convertToIcon => category: ${category}`);
    return icons[category] || icons.dinner; // Default to dinner if category not found
  }

  const selectCategory = (index, x, selection) => {
    const newExpenses = [...expenses];
    console.log(`Expenses => selectCategory(index: ${(newExpenses.length - 1) - Number(index)} x: ${x}, selection: ${selection}) => newExpenses: ${JSON.stringify(newExpenses, null, 2)}`);
    newExpenses[(newExpenses.length - 1) - Number(index)].category = convertSelection(selection);
    setExpenses(newExpenses);
  }
  const selectSort = (index, x, selection) => {
    console.log(`Expenses => selectSort(selection: ${selection})`);
    if (selection === 'category') {
      setCategorySort(true);
    } else {
      setCategorySort(false);
    }
  }
  const filterByDateRange = (selectedExpenses) => {
    if (!startDate && !endDate) return selectedExpenses;
    return selectedExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const afterStart = startDate ? expenseDate >= new Date(startDate) : true;
      const beforeEnd = endDate ? expenseDate <= new Date(endDate) : true;
      return afterStart && beforeEnd;
    });
  };
  const filterCategory = (index, x, selection) => {
    console.log(`Expenses => filetCategory(selection: ${selection})`);
    setCategory(selection);
  }
  const filterLocation = (index, x, selection) => {
    console.log(`Expenses => filetLocation(selection: ${selection})`);
    setLocation(selection);
  }
  const filteredExpenses = (selectedExpenses) => (category && category !== 'all')
    ? selectedExpenses.filter(expense => expense.category === category)
    : selectedExpenses;

  const filteredlocations = (selectedExpenses) => (location && location !== 'all')
    ? selectedExpenses.filter(expense => expense.location === location)
    : selectedExpenses;

  const getList = () => {
    const baseList = categorySort
      ? filteredlocations(filteredExpenses(sortedByCategory()))
      : filteredlocations(filteredExpenses(sortedByDate.reverse()));
    return filterByDateRange(baseList);
  };

  const getLocations = () => {
    const locations = ['all', ...Array.from(new Set(expenses.map(expense => expense.location).filter(Boolean)))];
    //const locations = Array.from(new Set(expenses.map(expense => expense.location).filter(Boolean)));
    console.log(`Expenses => getLocations: ${JSON.stringify(locations, null, 2)}`);
    return locations
  }

  const sortedByCategory = () => (expenses)
                                  ? [...expenses].reverse().sort((a, b) => {
                                      const catA = a.category.toUpperCase(); // ignore case
                                      const catB = b.category.toUpperCase();

                                      if (catA < catB) return -1;
                                      if (catA > catB) return 1;
                                      return 0; // equal
                                    })
                                  : null;
  const sortedBySkill = (expenseSkill) => [...expenseSkill].reverse().sort((a, b) => {
    const catA = a.skill.toUpperCase(); // ignore case
    const catB = b.skill.toUpperCase();

    if (catA < catB) return -1;
    if (catA > catB) return 1;
    return 0; // equal
  });
  const sortedByDate = [...expenses].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);

    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;
    return 0; // equal
  });
  const colors = [
    '#0088FE',  // Blue
    '#00C49F',  // Green
    '#FFBB28',  // Yellow
    '#FF8042',  // Orange
    '#A569BD',  // Purple
    '#5DADE2',  // Light Blue
    '#F1948A',  // Light Red
    '#52BE80',  // Light Green
    '#F7DC6F',  // Light Yellow
    '#DC7633'   // Brown
  ];

  const editExpense = (expense) => {
    const index = expenses.findIndex(exp =>
      exp.expense === expense.expense &&
      exp.date === expense.date &&
      exp.time === expense.time &&
      exp.cost === expense.cost
    );
    if (index !== -1) {
      const newExpenses = [...expenses];
      newExpenses[index].edit = (newExpenses[index].edit) ? !newExpenses[index].edit : true;
      setExpenses(newExpenses);
    }
  }
  const displayLog = () => <div className='containerBox'>
    <div className='containerDetail bg-lite m-5 contentLeft'>
      <div className='containerBox'>
        <CollapseToggleButton
          title={`Grand Total:${getTotalExpenses()}`}
          isCollapsed={totalCollapse}
          setCollapse={setTotalCollapse}
          align='left'
        />
      </div>
      {
        (totalCollapse)
          ? null
          : <div>
            <ActivitiesPieChart
              trainingData={sortedBySkill(getTrainingData())}
              goalData={sortedBySkill(getGoalData())}
              colors={colors}
              category='training'
              categories={categories}
            />
            <div className='containerDetail'>
              {(expenses && Array.isArray(expenses))
                ? categories.sort((a, b) => a.localeCompare(b))
                  .map((category, index) => {
                    // Calculate total cost for this category
                    const total = getList()
                      .filter(expense => expense.category === category)
                      .reduce((sum, expense) => sum + Number(convertToUS(expense.cost, expense.countryCode)), 0);

                    return { category, total, origIndex: index };
                  })
                  .filter(item => item.total > 0)
                  .map((item, filteredIndex) => {
                    const { category, total, origIndex } = item;
                    const categoryStyle = (idx) => ({
                      fontColor: colors[filteredIndex],
                      color: colors[filteredIndex]
                    });
                    const getCategoryHeader = (category, total) => (
                      <div className='flexContainer verticalCenter'>
                        <div title={category} className='flex3Column'>
                          <div className='containerDetail mt-5 mb-5 size40 contentCenter'>
                            {icons[category]}
                          </div>
                        </div>
                        <div className='flex3Column'>
                          <div className='containerDetail m-5 pl-20'>
                            ${formatNumber(total.toFixed(0))}
                          </div>
                        </div>
                        <div className='flex3Column contentLeft'>
                          <div className='containerDetail m-5 pl-20'>
                            {
                              (Number(getTotalExpenses()) > 0)
                                ? ((total / Number(getTotalExpenses()) * 100) < 1)
                                  ? (total / Number(getTotalExpenses()) * 100).toFixed(1)
                                  : (total / Number(getTotalExpenses()) * 100).toFixed(0)
                                : 0
                            }%
                          </div>
                        </div>
                      </div>
                    );
                    return (
                      <div key={getKey(category)} className='containerBox' style={categoryStyle(categories.indexOf(category))}>
                        {getCategoryHeader(category, total)}
                      </div>
                    );
                  })
                : null}
            </div>
          </div>
      }
      <div className='containerBox'>
          <CollapseToggleButton
          title={<span className='pl-10 '>filters: {(startDate || endDate) ? <span title={`${startDate} - ${endDate}`} className='p-10 bg-dark r-10 '>📅</span> : ''} {(!category || category === 'all') ? null : <span title={category} className='p-10 bg-dark r-10 '>{icons[category]}</span>} {(location) ? <span title={location} className='p-10 bg-dark r-10 '>🌎</span> : ''} sort: {(categorySort) ? <span title='category sort' className='p-10 bg-dark r-10 '>📂</span> : <span title='date sort' className='p-10 bg-dark r-10 '>📅</span>}</span>}
            isCollapsed={filterCollapse}
            setCollapse={setFilterCollapse}
            align='left'
          />
        {
          (filterCollapse)
            ? null
            : <div className='containerBox'>
              <div className='containerBox flexContainer'>
                <div className='containerBox flex2Column contentRight'>
                  start:
                </div>
                <input
                  type='date'
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className='containerDetail bg-lite flex2Column'
                  placeholder='Start Date'
                />
              </div>
              <div className='containerBox flexContainer'>
                <div className='containerBox flex2Column contentRight'>
                  end:
                </div>
                <input
                  type='date'
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className='flex2Column containerDetail bg-lite'
                  placeholder='End Date'
                />
              </div>
              <div className='containerBox flexContainer pr-15'>
                <div className='containerBox flex2Column contentRight'>
                  sort:
                </div>
                <div className='flex2Column'>
                  <Selector
                    groupTitle='sort'
                    label='sort:'
                    items={['category', 'date']}
                    selected={(categorySort) ? 'category' : 'date'}
                    onChange={selectSort}
                    fontSize='25'
                    padding='10px'
                    width='50px'
                  />
                </div>
              </div>
              <div className='containerBox flexContainer pr-15'>
                <div className='containerBox flex2Column contentRight'>
                  category:
                </div>
                <div className='flex2Column'>
                  <Selector
                    groupTitle='category'
                    label='category:'
                    items={categories}
                    selected={category || ''}
                    onChange={filterCategory}
                    fontSize='25'
                    padding='10px'
                    width='50px'
                  />
                </div>
              </div>
              <div className='containerBox flexContainer pr-15'>
                <div className='containerBox flex2Column contentRight'>
                  location:
                </div>
                <div className='flex2Column'>
                  <Selector
                    groupTitle='location'
                    label='location:'
                    items={getLocations()}
                    selected={location || ''}
                    onChange={filterLocation}
                    fontSize='25'
                    padding='10px'
                    width='50px'
                  />
                </div>
              </div>
            </div>
        }
      </div>
    </div>
    <div>
      {expenses.length === 0 ? (
        <p>No expenses recorded.</p>
      ) : (
        <div className=''>
          {getList().map((expense, index) => (
            <div className='relative containerDetail scrollSnapTop m-5 bg-veryLite' key={index}>
              {
                (expense.edit)
                  ? getForm(expense)
                  : <div>
                    <div className='containerBox min-height-60'>
                      <div
                        title='remove expense'
                        className='absolute w-50 rt-20 t-0 r-5 size15 bg-lite color-yellow button pr-20 pl-20 pt-10 pb-10 contentRight mt-20'
                        onClick={() => removeExpense(expense)}
                      >
                        X
                      </div>
                      <div className='min-height-40 columnLeftAlign color-yellow width--60 button' onClick={() => editExpense(expense)}>
                        {expense.expense}: ${formatNumber(convertToUS(expense.cost, expense.countryCode))} {/*exchangeRates[expense.currency]'USD'*/} {/*expense.currency*/}
                      </div>
                    </div>
                    <div className='flexContainer pr-15'>
                      <div className='p-10 ml-10 flex2Column mt-2 columnLeftAlign color-lite size15 mb-5'>
                        {expense.location} : ${formatNumber(expense.cost)} {expense.currency}s<br />{expense.date} - {expense.time}
                      </div>
                      <Selector
                        groupTitle={index}
                        label={expense.category || 'dinner'}
                        items={getCategories}
                        selected={convertToIcon(expense.category) || icons.dinner}
                        onChange={selectCategory}
                        fontSize='25'
                        padding='10px'
                        width='50px'
                      />
                    </div>
                  </div>
              }
            </div>
          ))}
        </div>
      )}
    </div>
  </div>

  return (
    <div className='mt--40'>
      <div className='containerBox'>
        <div className='containerBox bg-lite'>
          <CollapseToggleButton
            title={'Expense Entry'}
            isCollapsed={formCollapse}
            setCollapse={setFormCollapse}
            align='left'
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
            align='left'
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