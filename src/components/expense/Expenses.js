import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
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
import getKey from '../utils/KeyGenerator';

const LAST_EXPENSE_LOCATION_KEY = 'lastExpenseLocation';
const LAST_EXPENSE_CURRENCY_KEY = 'lastExpenseCurrency';

const REPORT_COLORS = [
  '#4fc3f7',
  '#ff8c42',
  '#6fd672',
  '#a78bfa',
  '#f472b6',
  '#facc15',
  '#34d399',
  '#60a5fa',
  '#fb7185',
  '#c084fc'
];

const Expenses = () => {

  const categories = ['all', 'breakfast', 'lunch', 'dinner', 'snack', 'coffee', 'transportation', 'shopping', 'entertainment', 'utilities', 'rent', 'other'];

  const getLocalExpenses = () => {
    const savedExpenses = initializeData('expenses', initData);
    return savedExpenses;
  }

  const normalizeCategory = (value) => {
    if (!value) return value;
    const normalized = String(value).trim().toLowerCase();
    return normalized === 'diner' ? 'dinner' : normalized;
  };

  const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const inferCategoryFromExpense = (expenseName) => {
    if (!expenseName) return null;
    const text = String(expenseName).toLowerCase();
    const categoryKeywords = categories.filter(cat => cat !== 'all');
    const match = categoryKeywords.find(cat => new RegExp(`\\b${escapeRegExp(cat)}\\b`, 'i').test(text));
    return match || null;
  };

  const ensureCategories = (list = []) => {
    let changed = false;
    const updated = list.map(item => {
      if (item.category && String(item.category).trim()) return item;
      const inferred = inferCategoryFromExpense(item.expense) || 'other';
      changed = true;
      return { ...item, category: inferred };
    });
    return { updated, changed };
  };

  const buildExpenseDraft = (lastLocation = '', lastCurrency = '') => ({
    ...defaultExpenses,
    location: lastLocation,
    currency: lastCurrency,
    countryCode: lastCurrency
  });

  const getLastExpenseDefaults = () => {
    const lastLocation = localStorage.getItem(LAST_EXPENSE_LOCATION_KEY) || '';
    const lastCurrency = localStorage.getItem(LAST_EXPENSE_CURRENCY_KEY) || '';
    return buildExpenseDraft(lastLocation, lastCurrency);
  };

  const [exchangeRates, setExchangeRates] = useState(defaultExchangeRates);
  const [expenses, setExpenses] = useState(() => ensureCategories(getLocalExpenses()).updated);
  const [expenseData, setExpenseData] = useState(() => getLastExpenseDefaults());
  const [formCollapse, setFormCollapse] = useState(true);
  const [logCollapse, setLogCollapse] = useState(true);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [category, setCategory] = useState();
  const [location, setLocation] = useState();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterCollapse, setFilterCollapse] = useState(true);
  const [totalCollapse, setTotalCollapse] = useState(true);
  const [reportsCollapse, setReportsCollapse] = useState(true);

  const getTotalExpenses = () => {
    const total = getList().reduce((acc, expense) => {
      const itemTotal = convertToUS(expense.cost, expense.countryCode || 'USD');
      //console.log(`Expenses => getTotalExpenses => expense: ${itemTotal} code: ${expense.countryCode}`);
      return acc + itemTotal;
    }, 0);
    return total.toFixed(2);
  };


  const getTrainingData = () => {
    const list = getList();
    const categoryTotals = {};
    list.forEach(item => {
      const normalizedCategory = normalizeCategory(item.category) || 'uncategorized';
      if (!categoryTotals[normalizedCategory]) {
        categoryTotals[normalizedCategory] = 0;
      }
      categoryTotals[normalizedCategory] += Number(item.cost);
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
      const normalizedCategory = normalizeCategory(item.category) || 'uncategorized';
      if (!categoryTotals[normalizedCategory]) {
        categoryTotals[normalizedCategory] = 0;
      }
      categoryTotals[normalizedCategory] += Number(item.cost);
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
    setCategory(localStorage.getItem('expenseCategory') || 'all');
    setLocation(localStorage.getItem('expenseLocation') || 'all');
    //console.log(`Total Expense: ${grandTotal}`)
    const savedExchangeRates = initializeData('exchangeRates', defaultExchangeRates)
    setExchangeRates(savedExchangeRates);
    //console.log(`IDR: ${exchangeRates.IDR}`);
    setExpenses(getLocalExpenses());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    //console.log(`sortField: ${sortField} sortDirection: ${sortDirection}`)
  }, [sortField, sortDirection]);
  useEffect(() => {
    const { updated, changed } = ensureCategories(expenses);
    if (changed) {
      setExpenses(updated);
    }
  }, [expenses]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    localStorage.setItem('expenseCategory', category);
  }, [category]);
  useEffect(() => {
    //console.log(`Expenses => location: ${location}`);
    localStorage.setItem('expenseLocation', location);
  }, [location]);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
    const grandTotal = '$' + getTotalExpenses();
    localStorage.setItem('totalExpenses', grandTotal);
    //console.log(`Expenses => Total Expense: ${grandTotal} expenses: ${JSON.stringify(expenses, null, 2)}`)
  }, [expenses]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    //console.log(`exchangeRates changed: ${JSON.stringify(exchangeRates, null, 2)}`)
    localStorage.setItem('exchangeRates', JSON.stringify(exchangeRates));
  }, [exchangeRates]);
  const handleAddExpense = () => {
    console.log(`handleAddExpense => expenseData: ${JSON.stringify(expenseData, null, 2)}`)
    const newExpense = { ...expenseData };
    newExpense.date = getCurrentDate();
    newExpense.time = getCurrentTime();
    if (!newExpense.category || !String(newExpense.category).trim()) {
      newExpense.category = inferCategoryFromExpense(newExpense.expense) || 'other';
    }
    localStorage.setItem(LAST_EXPENSE_LOCATION_KEY, String(newExpense.location || ''));
    localStorage.setItem(LAST_EXPENSE_CURRENCY_KEY, String(newExpense.currency || ''));
    setExpenses((prevExpenses) => [...prevExpenses, newExpense]);
    setExpenseData(buildExpenseDraft(newExpense.location || '', newExpense.currency || ''));
    setFormCollapse(true);
  };

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
  const getExpenseIndex = (expenseToFind) => {
    return expenses.findIndex(exp =>
      exp.expense === expenseToFind.expense &&
      exp.date === expenseToFind.date &&
      exp.time === expenseToFind.time &&
      exp.cost === expenseToFind.cost
    );
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
    //console.log(`convertToUS(${amount}) selectedCurrency: ${countryCode}`)
    //console.log(`exchangeRates: ${JSON.stringify(exchangeRates, null, 2)}`)
    const rate = exchangeRates[countryCode] || defaultExchangeRates[countryCode];
    //console.log(`convertToUS(${amount}) rate(${rate})`)
    const convertedValue = amount / rate;
    const converted = convertedValue.toFixed(2);
    //console.log(`convertToUS:(${amount}) rate:(${rate}) converted:(${converted})`)
    return Number(converted);
  };
  const collapseForm = (expense, index) => {
    if (index === null) {
      setFormCollapse(true);
    } else {
      const newExpenses = [...expenses];
      newExpenses[index].edit = false;
      setExpenses(newExpenses);
    }
  }
  const getForm = (expense, index) => <div>
    <label className='flexContainer containerInput contentCenter'>
      <div className='size20 m-5 p-15 columnRightAlign width-50-percent'>
        <span className='color-yellow'>
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
          className='containerDetail size20 p-10 color-lite width-100-percent'
        />
      </div>
    </label>
    <label className='flexContainer containerInput contentCenter'>
      <div className='size20 m-5 p-15 columnRightAlign width-50-percent'>
        <span className='color-yellow'>
          Category:
        </span>
      </div>
      <div className='columnLeftAlign width-50-percent'>
        <select
          name='category'
          value={expense.category || ''}
          onChange={e => handleInputChange(e, expense)}
          className='containerDetail size20 p-10 color-lite width-100-percent'
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
      <div className='size20 m-5 p-15 columnRightAlign width-50-percent'>
        <span className='color-yellow'>
          Location:
        </span>
      </div>
      <div className='columnLeftAlign width-50-percent'>
        <select
          name='location'
          value={expense.location}
          onChange={e => handleInputChange(e, expense)}
          className='containerDetail size20 p-10 color-lite width-100-percent'
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
      <div className='size20 m-5 p-15 columnRightAlign width-50-percent'>
        <span className='color-yellow'>
          Currency:
        </span>
      </div>
      <div className='columnLeftAlign width-50-percent'>
        <select
          name='currency'
          value={expense.currency}
          onChange={e => handleInputChange(e, expense)}
          className='containerDetail size20 p-10 color-lite width-100-percent'
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
      <div className='size20 m-5 p-15 columnRightAlign width-50-percent'>
        <span className='color-yellow'>
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
          className='containerDetail size20 p-10 color-lite width-100-percent'
        />
      </div>
    </label>
    <div className='flexContainer'>
      <div
        title={`${(expense === expenseData) ? 'add' : 'edit'} expense`}
        className='flex2Column bg-soft color-dark size25 r-10 mt-10 mb-10 ml-5 mr-5 p-10 ht-50 centeredContent button'
        onClick={(expense === expenseData) ? handleAddExpense : () => editExpense(expense)}
      >
        {`${(expense === expenseData) ? 'Add' : 'Edit'} Expense`}
      </div>
      <div
        title={`cancel`}
        className='flex2Column bg-soft color-dark size25 r-10 mt-10 mb-10 ml-5 mr-5 p-10 ht-50 centeredContent button'
        onClick={() => collapseForm(expense, index)}
      >
        {`Cancel`}
      </div>
    </div>
  </div>
  const expenseEntry = () => <div>
    <div className='containerDetail size20 m-5 bg-lite'>
      <ExchangeRatesConfig onExchangeRatesChange={setExchangeRates}></ExchangeRatesConfig>
    </div>
    {
      getForm(expenseData, null)
    }
  </div>

  const getCategories = [icons.all, icons.breakfast, icons.lunch, icons.dinner, icons.snack, icons.coffee, icons.transportation, icons.shopping, icons.entertainment, icons.utilities, icons.rent, icons.other]

  const convertSelection = (selection) => {
    return categories[getCategories.indexOf(selection)];
  }
  const convertToIcon = (category) => {
    const normalized = normalizeCategory(category);
    //console.log(`Expenses => convertToIcon => category: ${normalized}`);
    return icons[normalized] || icons.dinner; // Default to dinner if category not found
  }

  const selectCategory = (index, x, selection) => {
    const newExpenses = [...expenses];
    const expenseIndex = Number(index);
    if (Number.isNaN(expenseIndex) || expenseIndex < 0 || expenseIndex >= newExpenses.length) {
      console.warn('Expenses => selectCategory: invalid expense index', { index, selection });
      return;
    }
    //console.log(`Expenses => selectCategory(index: ${expenseIndex} x: ${x}, selection: ${selection})`);
    newExpenses[expenseIndex].category = convertSelection(selection);
    setExpenses(newExpenses);
  }
  const selectSortField = (index, x, selection) => {
    setSortField(selection);
  }
  const selectSortDirection = (index, x, selection) => {
    setSortDirection(selection);
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
    //console.log(`Expenses => filetCategory(selection: ${selection})`);
    setCategory(selection);
  }
  const filterLocation = (index, x, selection) => {
    //console.log(`Expenses => filetLocation(selection: ${selection})`);
    setLocation(selection);
  }
  const filteredExpenses = (selectedExpenses) => (category && category !== 'all')
    ? selectedExpenses.filter(expense => normalizeCategory(expense.category) === normalizeCategory(category))
    : selectedExpenses;

  const filteredlocations = (selectedExpenses) => (location && location !== 'all')
    ? selectedExpenses.filter(expense => expense.location === location)
    : selectedExpenses;

  const getExpenseTimestamp = (expense) => {
    const dateTime = new Date(`${expense?.date || ''} ${expense?.time || ''}`);
    if (!Number.isNaN(dateTime.getTime())) return dateTime.getTime();
    const dateOnly = new Date(expense?.date || '');
    return Number.isNaN(dateOnly.getTime()) ? 0 : dateOnly.getTime();
  };

  const sortExpensesList = (selectedExpenses) => {
    const list = Array.isArray(selectedExpenses) ? [...selectedExpenses] : [];
    const directionMultiplier = sortDirection === 'asc' ? 1 : -1;

    const compareValues = (valueA, valueB) => {
      if (valueA < valueB) return -1;
      if (valueA > valueB) return 1;
      return 0;
    };

    return list.sort((a, b) => {
      let comparison = 0;

      if (sortField === 'category') {
        const catA = String(normalizeCategory(a?.category) || '').toUpperCase();
        const catB = String(normalizeCategory(b?.category) || '').toUpperCase();
        comparison = compareValues(catA, catB);
      } else if (sortField === 'amount') {
        const amountA = Number(convertToUS(a?.cost, a?.countryCode || a?.currency || 'USD')) || 0;
        const amountB = Number(convertToUS(b?.cost, b?.countryCode || b?.currency || 'USD')) || 0;
        comparison = compareValues(amountA, amountB);
      } else if (sortField === 'name') {
        const nameA = String(a?.expense || '').toUpperCase();
        const nameB = String(b?.expense || '').toUpperCase();
        comparison = compareValues(nameA, nameB);
      } else {
        const dateA = getExpenseTimestamp(a);
        const dateB = getExpenseTimestamp(b);
        comparison = compareValues(dateA, dateB);
      }

      return comparison * directionMultiplier;
    });
  };

  const getList = () => {
    const filteredList = filteredlocations(filteredExpenses(expenses));
    const dateFiltered = filterByDateRange(filteredList);
    return sortExpensesList(dateFiltered);
  };

  const getLocations = () => {
    const locations = ['all', ...Array.from(new Set(expenses.map(expense => expense.location).filter(Boolean)))];
    //const locations = Array.from(new Set(expenses.map(expense => expense.location).filter(Boolean)));
    //console.log(`Expenses => getLocations: ${JSON.stringify(locations, null, 2)}`);
    return locations
  }

  const sortedBySkill = (expenseSkill) => [...expenseSkill].reverse().sort((a, b) => {
    const catA = a.skill.toUpperCase(); // ignore case
    const catB = b.skill.toUpperCase();

    if (catA < catB) return -1;
    if (catA > catB) return 1;
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

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const title = label || payload[0]?.name;
    return (
      <div className='containerDetail' style={{ backgroundColor: '#0f172a', borderRadius: 10, padding: 12 }}>
        <div className='containerDetail color-yellow mb-5'>
          {title}
        </div>
        {payload.map((item) => {
          const seriesName = item.name || item.dataKey;
          const swatchColor =
            item.dataKey === 'total'
              ? '#4fc3f7'
              : categoryColorMap[item.payload?.name] || item.color || item.fill || '#cbd5f5';
          return (
          <div key={getKey(`${item.name}-${item.value}`)} className='containerDetail color-lite'>
            <span style={{ color: swatchColor }}>■</span> {seriesName}: ${formatNumber(item.value)}
          </div>
          );
        })}
      </div>
    );
  };

  const monthlySpendingData = (() => {
    const totals = {};
    getList().forEach(expense => {
      const expenseDate = new Date(expense.date);
      if (isNaN(expenseDate)) return;
      const monthKey = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
      const usdValue = convertToUS(Number(expense.cost) || 0, expense.countryCode || expense.currency || 'USD');
      totals[monthKey] = (totals[monthKey] || 0) + usdValue;
    });
    return Object.entries(totals)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, total]) => {
        const [year, month] = key.split('-').map(Number);
        const label = new Date(year, month - 1, 1).toLocaleString('default', { month: 'short', year: 'numeric' });
        return {
          month: label,
          total: Number(total.toFixed(2))
        };
      });
  })();

  const categoryRatioData = (() => {
    const totals = {};
    getList().forEach(expense => {
      const cat = normalizeCategory(expense.category) || 'uncategorized';
      const usdValue = convertToUS(Number(expense.cost) || 0, expense.countryCode || expense.currency || 'USD');
      totals[cat] = (totals[cat] || 0) + usdValue;
    });
    return Object.entries(totals)
      .map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value);
  })();

  const categoryColorMap = (() => {
    const map = {};
    categoryRatioData.forEach((item, index) => {
      map[item.name] = REPORT_COLORS[index % REPORT_COLORS.length];
    });
    return map;
  })();

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
      setFormCollapse(true);
    }
  }
  const filterDisplay = () => <div className='containerDetail bg-lite mt-5 contentLeft'>
    <div className='containerDetail color-yellow size20 p-10'>
      <CollapseToggleButton
        title={`Grand Total: ${getTotalExpenses()}`}
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
                    .filter(expense => normalizeCategory(expense.category) === normalizeCategory(category))
                    .reduce((sum, expense) => sum + Number(convertToUS(expense.cost, expense.countryCode || 'USD')), 0);

                  return { category, total, origIndex: index };
                })
                .filter(item => item.total > 0)
                .map((item, filteredIndex) => {
                  const { category, total } = item;
                  const categoryStyle = (idx) => ({
                    fontColor: colors[filteredIndex],
                    color: colors[filteredIndex]
                  });
                  const getCategoryHeader = (category, total) => (
                    <div className='flexContainer verticalCenter'>
                      <div title={category} className='flex3Column'>
                        <div className='mt-10 mb-5 size40 contentCenter'>
                          {icons[category]}
                        </div>
                      </div>
                      <div className='flex3Column'>
                        <div className='mt-10 mb-5 pl-20'>
                          ${formatNumber(total.toFixed(0))}
                        </div>
                      </div>
                      <div className='flex3Column contentLeft'>
                        <div className='mt-10 mb-10 pl-20'>
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
                    <div key={getKey(category)} className='containerDetail size20 m-5' style={categoryStyle(categories.indexOf(category))}>
                      {getCategoryHeader(category, total)}
                    </div>
                  );
                })
              : null}
          </div>
        </div>
    }
    <div className='containerDetail mt-5 color-lite'>
      <div className='containerDetail bg-lite'>
        <CollapseToggleButton
          title={<span className='pl-10 mr-10'>filters: {(startDate || endDate) ? <span title={`${startDate} - ${endDate}`} className='p-10 lite r-10'>📅</span> : ''} {(!category || category === 'all') ? null : <span title={category} className='p-10 bg-lite r-10 '>{icons[category]}</span>} {(location) ? <span title={location} className='p-10 bg-lite r-10 ml-5 mr-10'>🌎</span> : ''} sort: <span title={`${sortField} ${sortDirection}`} className='p-10 ml-5 bg-lite r-10 '>{sortDirection === 'asc' ? '⬆️' : '⬇️'} {sortField}</span></span>}
          isCollapsed={filterCollapse}
          setCollapse={setFilterCollapse}
          align='left'
        />
      </div>
      {
        (filterCollapse)
          ? null
          : <div className='containerDetail size20 mt-5'>
            <div className='containerDetail mb-5 size20 flexContainer'>
              <div className='size20 mt-15 mr-10 flex2Column contentRight color-yellow'>
                start:
              </div>
              <input
                type='date'
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className='containerDetail bg-tintedMedium m-5 color-lite flex2Column'
                placeholder='Start Date'
              />
            </div>
            <div className='containerDetail size20 mb-5 flexContainer'>
              <div className='size20 mt-15 mr-10 flex2Column contentRight color-yellow'>
                end:
              </div>
              <input
                type='date'
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className='containerDetail bg-tintedMedium color-lite flex2Column m-5'
                placeholder='End Date'
              />
            </div>
            <div className='containerDetail size20 mb-5 flexContainer pr-15'>
              <div className='size20 mt-20 mr-10 flex2Column contentRight color-yellow'>
                sort:
              </div>
              <div className='flex2Column pb-5'>
                <Selector
                  groupTitle='sort-field'
                  label='sort by:'
                  items={['date', 'amount', 'category', 'name']}
                  selected={sortField}
                  onChange={selectSortField}
                  fontSize='25'
                  padding='10px'
                  width='50px'
                />
              </div>
            </div>
            <div className='containerDetail size20 mb-5 flexContainer pr-15'>
              <div className='size20 mt-20 mr-10 flex2Column contentRight color-yellow'>
                order:
              </div>
              <div className='flex2Column pb-5'>
                <Selector
                  groupTitle='sort-direction'
                  label='order:'
                  items={['asc', 'desc']}
                  selected={sortDirection}
                  onChange={selectSortDirection}
                  fontSize='25'
                  padding='10px'
                  width='50px'
                />
              </div>
            </div>
            <div className='containerDetail size20 mb-5 flexContainer pr-15'>
              <div className='size20 mt-20 mr-10 flex2Column contentRight color-yellow'>
                category:
              </div>
              <div className='flex2Column pb-5'>
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
            <div className='containerDetail size20 flexContainer pr-15'>
              <div className='size20 mt-20 mr-10 flex2Column contentRight color-yellow'>
                location:
              </div>
              <div className='flex2Column pb-5'>
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

  const displayLog = () => <div className='containerDetail size20 mt-5'>
    <div>
      {expenses.length === 0 ? (
        <p>No expenses recorded.</p>
      ) : (
        <div className='scrollHeight250'>
          {getList().map((expense, index) => {
            const expenseIndex = getExpenseIndex(expense);
            return (
            <div className='relative containerDetail scrollSnapTop bg-veryLite mt-5' key={index}>
              {
                (expense.edit)
                ? getForm(expense, index)
                : <div>
                  <div className='containerDetail size20 min-height-60 pt-10'>
                    <div
                      title='remove expense'
                      className='absolute w-50 rt-15 t-0 r-5 size15 bg-lite color-yellow button pr-20 pl-20 pt-10 pb-10 contentRight mt-15'
                      onClick={() => removeExpense(expense)}
                    >
                      X
                    </div>
                    <div className='min-height-40 columnLeftAlign color-yellow width--60 button pl-10' onClick={() => editExpense(expense)}>
                      {expense.expense}: ${formatNumber(convertToUS(expense.cost, expense.countryCode || 'USD'))} {/*exchangeRates[expense.currency]'USD'*/} {/*expense.currency*/}
                    </div>
                  </div>
                  <div className='flexContainer pr-5'>
                    <div className='p-10 flex2Column columnLeftAlign color-lite size15'>
                      {expense.location} : ${formatNumber(expense.cost)} {expense.currency}s<br />{expense.date} - {expense.time}
                    </div>
                    <Selector
                      groupTitle={expenseIndex}
                      label={normalizeCategory(expense.category) || 'dinner'}
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
            );
          })}
        </div>
      )}
    </div>
  </div>

  return (
    <div className='mt--30'>
      <div className='containerDetail color-yellow bg-lite m-5 p-22 size20 contentLeft'>
        <span className='size20 m-5'>{icons.expenses}</span> Expenses
      </div>
      <div className='containerDetail bg-lite m-5'>
        {
          (formCollapse)
          ? <div className='containerDetail size20 color-lite bg-green button p-20' onClick={() => setFormCollapse(false)}>
              ➕ Add Expense
            </div>
          : null
        }
        {
          (formCollapse)
          ? null
          : <div className='containerDetail bg-lite'>
            {expenseEntry()}
          </div>
        }
        {
          filterDisplay()
        }
        <div className='containerDetail size20 color-lite mt-5 bg-lite'>
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
        <div className='containerDetail size20 color-lite mt-5 bg-lite'>
          <CollapseToggleButton
            title={'Reports'}
            isCollapsed={reportsCollapse}
            setCollapse={setReportsCollapse}
            align='left'
          />
        </div>
        {
          (reportsCollapse)
            ? <div></div>
            : <div className='containerDetail bg-lite mt-5'>
                <div className='containerDetail mb-5'>
                  <div className='containerDetail contentLeft p-10 size20 mb-5 color-yellow size20'>
                    Monthly Spending (USD)
                  </div>
                  <div className='containerDetail'>
                    <ResponsiveContainer width='100%' height={300}>
                      <BarChart data={monthlySpendingData} margin={{ top: 10, right: 20, bottom: 40, left: 0 }}>
                        <CartesianGrid strokeDasharray='3 3' />
                        <XAxis dataKey='month' angle={-35} textAnchor='end' height={60} tick={{ fontSize: 12, fill: '#dddddd' }} />
                        <YAxis tick={{ fill: '#dddddd' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey='total' name='Total (USD)' fill='#4fc3f7' />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
              </div>
              <div className='containerDetail'>
                <div className='containerDetail contentLeft p-10 size20 mb-5 color-yellow size20'>
                  Expense Category Ratios (USD)
                </div>
                <div className='containerDetail'>
                  <ResponsiveContainer width='100%' height={320}>
                    <PieChart>
                      <Pie
                        data={categoryRatioData}
                        dataKey='value'
                        nameKey='name'
                        outerRadius={110}
                        label
                      >
                        {categoryRatioData.map((entry, index) => (
                          <Cell key={getKey(`cat-${entry.name}`)} fill={REPORT_COLORS[index % REPORT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className='containerDetail contentLeft mt-10'>
                  {categoryRatioData.map((item, index) => (
                    <div key={getKey(`legend-${item.name}`)} className='containerDetail color-lite mb-5 p-10'>
                      <span style={{ color: REPORT_COLORS[index % REPORT_COLORS.length] }}>■</span> {item.name}: ${item.value}
                    </div>
                  ))}
                </div>
              </div>
            </div>
        }
      </div>
    </div>
  );
};

export default Expenses;