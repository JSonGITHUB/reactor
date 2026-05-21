import React, { useState, useEffect, useContext } from 'react';
import getKey from '../utils/KeyGenerator';
import menu from '../../assets/images/menuYellow.png';
// eslint-disable-next-line
import { BsFillGearFill } from 'react-icons/bs';
import Selected from '../../assets/images/cart.png';
import Select from '../../assets/images/addToCart.png';
import SettingsMenu from './SettingsMenu';
import ProductEntry from './ProductEntry';
import SearchBar from '../utils/SearchBar';
import '../../assets/css/shop.css';
import debounceType from '../utils/DebouncerType';
import initData from './initData';
import InCart from '../../assets/images/inCart.png';
import PutInCart from '../../assets/images/putInCart.png';
import Selector from '../forms/FunctionalSelector';
import validate from '../utils/validate';
import initializeData from '../utils/InitializeData';
import { IngredientContext } from '../context/IngredientContext';
import { getShopTodosFromStorage, saveShopTodosToStorage, SHOP_AISLES, useKitchenInventory } from '../context/KitchenInventoryContext';
import { addCheckoutRecord, getCheckoutHistory } from './checkoutHistory';

/* eslint-disable react-hooks/exhaustive-deps */

const PriceEntryDialog = ({
    title,
    initialPriceInput,
    initialExpiration,
    initialDays,
    initialMonths,
    initialYears,
    onSave,
    onClose,
    normalizeExpirationDate,
    getDaysFromToday,
    getMonthsFromToday,
    getYearsFromToday,
    getDateFromTodayPlusDays,
    getDateFromTodayPlusMonths,
    getDateFromTodayPlusYears
}) => {
    const toCents = (v) => Math.round(Number(v || 0) * 100);
    const toDecimalStr = (c) => (Number(c) / 100).toFixed(2);

    const [priceInput, setPriceInput] = useState(initialPriceInput || '');
    const [cents, setCents] = useState(() => toCents(initialPriceInput));
    const [expiration, setExpiration] = useState(initialExpiration);
    const [days, setDays] = useState(initialDays);
    const [months, setMonths] = useState(initialMonths);
    const [years, setYears] = useState(initialYears);
    const [priceEntryDialogDetails, setPriceEntryDialogDetails] = useState(false);
    useEffect(() => {
        const c = toCents(initialPriceInput);
        setCents(c);
        setPriceInput(c > 0 ? toDecimalStr(c) : '');
        setExpiration(initialExpiration);
        setDays(initialDays);
        setMonths(initialMonths);
        setYears(initialYears);
    }, [initialPriceInput, initialExpiration, initialDays, initialMonths, initialYears]);

    const handlePriceKeyDown = (e) => {
        if (e.key === 'Backspace') {
            e.preventDefault();
            const next = String(cents).slice(0, -1);
            const nextCents = Number(next) || 0;
            setCents(nextCents);
            setPriceInput(nextCents > 0 ? toDecimalStr(nextCents) : '');
        } else if (e.key >= '0' && e.key <= '9') {
            e.preventDefault();
            const next = Number(String(cents) + e.key);
            setCents(next);
            setPriceInput(toDecimalStr(next));
        }
    };

    const priceDisplayValue = cents > 0
        ? `$${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, '0')}`
        : '';

    const clearPrice = () => {
        setCents(0);
        setPriceInput('');
    };

    const updateDays = (value) => {
        const nextValue = String(value);
        if (nextValue === '' || nextValue === '-') {
            setDays(nextValue);
            return;
        }

        const parsedDays = Number(nextValue);
        const safeDays = Number.isFinite(parsedDays) ? Math.trunc(parsedDays) : 0;
        const nextExpiration = getDateFromTodayPlusDays(safeDays);
        setDays(String(safeDays));
        setExpiration(nextExpiration);
        setMonths(getMonthsFromToday(nextExpiration));
        setYears(getYearsFromToday(nextExpiration));
    };

    const updateMonths = (value) => {
        const nextValue = String(value);
        if (nextValue === '' || nextValue === '-') {
            setMonths(nextValue);
            return;
        }

        const parsedMonths = Number(nextValue);
        const safeMonths = Number.isFinite(parsedMonths) ? Math.trunc(parsedMonths) : 0;
        const nextExpiration = getDateFromTodayPlusMonths(safeMonths);
        setMonths(String(safeMonths));
        setExpiration(nextExpiration);
        setDays(getDaysFromToday(nextExpiration));
        setYears(getYearsFromToday(nextExpiration));
    };

    const updateYears = (value) => {
        const nextValue = String(value);
        if (nextValue === '' || nextValue === '-') {
            setYears(nextValue);
            return;
        }

        const parsedYears = Number(nextValue);
        const safeYears = Number.isFinite(parsedYears) ? Math.trunc(parsedYears) : 0;
        const nextExpiration = getDateFromTodayPlusYears(safeYears);
        setYears(String(safeYears));
        setExpiration(nextExpiration);
        setDays(getDaysFromToday(nextExpiration));
        setMonths(getMonthsFromToday(nextExpiration));
    };

    const updateExpiration = (value) => {
        const normalized = normalizeExpirationDate(value);
        setExpiration(normalized);
        setDays(getDaysFromToday(normalized));
        setMonths(getMonthsFromToday(normalized));
        setYears(getYearsFromToday(normalized));
    };

    return (
        <div className='containerDetail fixed p-20 height-100-percent bg-tintedDark color-lite contentLeft mt--80'>
            <div className='size25 color-orange mb-10'>
                {title}
            </div>
            <div className='size20 color-yellow mb-20 mt--5'>
                Price Entry
            </div>
            <input
                className='mb-10 containerDetail color-lite width-100-percent size35 p-10'
                type='text'
                inputMode='numeric'
                value={priceDisplayValue}
                placeholder='$0.00'
                onKeyDown={handlePriceKeyDown}
                onChange={() => {}}
                autoFocus
            />
            <div 
                className='color-yellow mt-10 mb-5'
                onClick={() => setPriceEntryDialogDetails(prev => !prev)}
            >
                Details {priceEntryDialogDetails ? '▲' : '▼'}
            </div>
            {
                (!priceEntryDialogDetails)
                ? null
                : <div className='mb-10'>
                    <div className='containerDetail pr-5 contentLeft color-yellow'>
                        <div className='mb-5'>
                            Expiration Date:
                        </div>
                        <input
                            className='mb-5 containerDetail color-lite width-100-percent'
                            type='date'
                            value={expiration}
                            onChange={(e) => updateExpiration(e.target.value)}
                        />
                    </div>
                    <div className='containerDetail contentLeft'>
                        <div className='mb-5 color-yellow'>
                            Days
                        </div>
                        <input
                            className='mb-5 containerDetail color-lite width-100-percent'
                            type='number'
                            value={days}
                            onChange={(e) => updateDays(e.target.value)}
                        />
                    </div>
                    <div className='containerDetail contentLeft'>
                        <div className='mb-5 color-yellow'>
                            Months
                        </div>
                        <input
                            className='mb-5 containerDetail color-lite width-100-percent'
                            type='number'
                            value={months}
                            onChange={(e) => updateMonths(e.target.value)}
                        />
                    </div>
                    <div className='containerDetail contentLeft'>
                        <div className='mb-5 color-yellow'>
                            Years
                        </div>
                        <input
                            className='mb-5 containerDetail color-lite width-100-percent'
                            type='number'
                            value={years}
                            onChange={(e) => updateYears(e.target.value)}
                        />
                    </div>
                </div>
            }
            <div className='flexContainer mt-10'>
                <div
                    className='containerDetail flex2Column button mr-5 bg-yellow p-10 contentCenter color-dark'
                    onClick={clearPrice}
                >
                    Clear
                </div>
                <div
                    className='containerDetail flex2Column button mr-5 bg-green p-10 contentCenter color-neogreen'
                    onClick={() => onSave({ priceInput, expiration, days, months, years })}
                >
                    <div className='flexContainer size30'>
                        <div className='flex2Column text-outline-lite contentRight'>
                            ➕
                        </div>
                        <div className='flex2Column ml-5 text-outline-dark contentLeft'>
                            🛒
                        </div>
                    </div>
                </div>
                <div
                    className='containerDetail flex2Column button bg-red p-10 contentCenter color-yellow'
                    onClick={onClose}
                >
                    Cancel
                </div>
            </div>
            <div className='containerDetail ht-200 mb-40 mt-40'>
            </div>
        </div>
    );
};

const List = () => {

    const {
        ingredients,
        setIngredients,
        ingredientStatus
    } = useContext(IngredientContext);

    const getTodos = () => {
        const persistedTodos = getShopTodosFromStorage();
        return persistedTodos.length > 0 ? persistedTodos : initData;
    };
    const [todos, setTodos] = useState(getTodos());
    const [aisles, setAisles] = useState();
    const [itemEntry, setItemEntry] = useState('');
    const [category, setCategory] = useState('');
    const [shopFilter, setShopFilter] = useState();
    const today = new Date();
    const itemMenuDefault = ['', 'ADD INDEX', 'EDIT', 'PRICE', 'DELETE'];
    const aislesInit = ['Vons', 'Sprouts', 'Smart and Final'];
    const getAisles = () => initializeData('aisles', aislesInit);
    const pad = (n, width, z) => {
        //pad(10, 4) => 0010
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }
    const getColors = (aisles) => {
        const colors = [];
        let aisleColor = '';
        aisles = (aisles !== null) ? aisles : aislesInit;
        aisles.forEach(aisle => {
            aisleColor = Math.floor(Math.random() * 16777215).toString(16).toUpperCase();
            aisleColor = pad(aisleColor, 6);
            colors.push(`#${aisleColor}`);
        });
        return colors;
    }
    const [status, setStatus] = useState({
        displaySettings: false,
        displayProductEntry: false,
        search: '',
        fontSize: 25,
        tax: 8.75,
        colors: getColors(getAisles()),
        retrievedData: getTodos(),
        ogTitle: '',
        newTodoText: '',
        total: 0,
        taxTotal: 0,
        items: 0,
        totalItems: 0,
        sortByIndex: true,
        item: ''
    });
    const [shoppingHistoryOpen, setShoppingHistoryOpen] = useState(false);
    const [historyRecords, setHistoryRecords] = useState([]);
    const [historySelectedIndex, setHistorySelectedIndex] = useState(null);
    const [historyItems, setHistoryItems] = useState([]);
    const [historyNotice, setHistoryNotice] = useState('');
    // Keep recalculation tied to todo updates; helper functions are intentionally not deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        saveShopTodosToStorage(todos);
        getItems('effect');
        getTotal();
    }, [todos]);
    useEffect(() => {
        console.log(`useEffect => aisles: ${JSON.stringify(aisles, null, 2)}`);
    }, [aisles]);

    const aisleIndex = (aisle) => (validate(aisles) === null) ? 0 : aisles.indexOf(aisle);
    const getColor = (aisle) => {
        return status.colors[aisleIndex(aisle)];
    }
    const getInCartButton = (index) => {
        return (
            <img
                title='in cart'
                className='inCartIcon'
                alt='in cart'
                src={(todos[index].cart) ? InCart : PutInCart}
                onClick={() => toggleCart(index)}
            />
        )
    }
    const inCartIcon = () => {
        return (
            <img
                title='in cart'
                className='inCartIcon'
                alt='in cart'
                src={InCart}
                height='15px'
            />
        )
    }
    const selectedIcon = () => {
        return (
            <img
                title='selected'
                className='selectedIcon'
                alt='selected'
                src={Selected}
                height='20px'
            />
        )
    }
    const getSelectedIconForItem = (item) => (
        <img
            className='cart'
            alt='select'
            src={item?.select ? Selected : Select}
        />
    );
    const quantities = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const getTodayDateString = () => {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };
    const parseLocalDate = (isoDate) => {
        if (!isoDate) {
            return null;
        }
        const [yyyy, mm, dd] = String(isoDate).split('-').map(Number);
        if (!yyyy || !mm || !dd) {
            return null;
        }
        return new Date(yyyy, mm - 1, dd);
    };
    const formatLocalDate = (date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };
    const normalizeExpirationDate = (value) => {
        if (!value) {
            return getTodayDateString();
        }

        const isoDate = parseLocalDate(value);
        if (isoDate) {
            return formatLocalDate(isoDate);
        }

        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) {
            return formatLocalDate(parsed);
        }

        return getTodayDateString();
    };
    const getDaysFromToday = (isoDate) => {
        const targetDate = parseLocalDate(isoDate);
        const todayDate = parseLocalDate(getTodayDateString());
        if (!targetDate || !todayDate) {
            return '0';
        }
        const msPerDay = 24 * 60 * 60 * 1000;
        return String(Math.round((targetDate - todayDate) / msPerDay));
    };
    const getMonthsFromToday = (isoDate) => {
        const targetDate = parseLocalDate(isoDate);
        const todayDate = parseLocalDate(getTodayDateString());
        if (!targetDate || !todayDate) {
            return '0';
        }

        const yearDiff = targetDate.getFullYear() - todayDate.getFullYear();
        let monthDiff = (yearDiff * 12) + (targetDate.getMonth() - todayDate.getMonth());
        if (targetDate.getDate() < todayDate.getDate()) {
            monthDiff -= 1;
        }
        return String(monthDiff);
    };
    const getYearsFromToday = (isoDate) => {
        const targetDate = parseLocalDate(isoDate);
        const todayDate = parseLocalDate(getTodayDateString());
        if (!targetDate || !todayDate) {
            return '0';
        }

        let yearDiff = targetDate.getFullYear() - todayDate.getFullYear();
        const hasNotReachedAnniversary =
            targetDate.getMonth() < todayDate.getMonth() ||
            (targetDate.getMonth() === todayDate.getMonth() && targetDate.getDate() < todayDate.getDate());
        if (hasNotReachedAnniversary) {
            yearDiff -= 1;
        }
        return String(yearDiff);
    };
    const getDateFromTodayPlusDays = (daysValue) => {
        const todayDate = parseLocalDate(getTodayDateString());
        const parsedDays = Number(daysValue);
        const safeDays = Number.isFinite(parsedDays) ? Math.trunc(parsedDays) : 0;
        todayDate.setDate(todayDate.getDate() + safeDays);
        return formatLocalDate(todayDate);
    };
    const getDateFromTodayPlusMonths = (monthsValue) => {
        const todayDate = parseLocalDate(getTodayDateString());
        const parsedMonths = Number(monthsValue);
        const safeMonths = Number.isFinite(parsedMonths) ? Math.trunc(parsedMonths) : 0;
        todayDate.setMonth(todayDate.getMonth() + safeMonths);
        return formatLocalDate(todayDate);
    };
    const getDateFromTodayPlusYears = (yearsValue) => {
        const todayDate = parseLocalDate(getTodayDateString());
        const parsedYears = Number(yearsValue);
        const safeYears = Number.isFinite(parsedYears) ? Math.trunc(parsedYears) : 0;
        todayDate.setFullYear(todayDate.getFullYear() + safeYears);
        return formatLocalDate(todayDate);
    };
    const [cartEditor, setCartEditor] = useState({
        index: null,
        priceInput: '',
        expiration: getTodayDateString(),
        days: '0',
        months: '0',
        years: '0'
    });
    const openCartEditor = (index) => {
        const item = todos[index] || {};
        const numericPrice = Number(item.price || 0);
        const safePrice = Number.isFinite(numericPrice) && numericPrice >= 0 ? numericPrice : 0;
        const priceInput = safePrice > 0 ? safePrice.toFixed(2) : '';
        const expiration = normalizeExpirationDate(item.expiration);
        setCartEditor({
            index,
            priceInput,
            expiration,
            days: getDaysFromToday(expiration),
            months: getMonthsFromToday(expiration),
            years: getYearsFromToday(expiration)
        });
    };
    const closeCartEditor = () => {
        setCartEditor({
            index: null,
            priceInput: '',
            expiration: getTodayDateString(),
            days: '0',
            months: '0',
            years: '0'
        });
    };
    const updateCartEditorDays = (value) => {
        const nextValue = String(value);
        if (nextValue === '' || nextValue === '-') {
            setCartEditor(prev => ({
                ...prev,
                days: nextValue
            }));
            return;
        }

        const parsedDays = Number(nextValue);
        const safeDays = Number.isFinite(parsedDays) ? Math.trunc(parsedDays) : 0;
        setCartEditor(prev => ({
            ...prev,
            days: String(safeDays),
            expiration: getDateFromTodayPlusDays(safeDays)
        }));
    };
    const updateCartEditorExpiration = (value) => {
        const expiration = normalizeExpirationDate(value);
        setCartEditor(prev => ({
            ...prev,
            expiration,
            days: getDaysFromToday(expiration)
        }));
    };
    const saveCartEditor = (index, editorState = cartEditor) => {
        const updatedTodos = [...todos];
        if (!updatedTodos[index]) {
            closeCartEditor();
            return;
        }

        const parsedPrice = Number(editorState.priceInput);
        const totalPrice = Number.isFinite(parsedPrice) && parsedPrice >= 0 ? parsedPrice : 0;
        const expiration = normalizeExpirationDate(editorState.expiration);
        updatedTodos[index].price = totalPrice.toFixed(2);
        updatedTodos[index].expiration = expiration;
        updatedTodos[index].cart = true;

        // Set purchaseDate to today in ISO format (yyyy-mm-dd)
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        updatedTodos[index].purchaseDate = `${yyyy}-${mm}-${dd}`;
        updatedTodos[index].lastPurchase = now;

        setTodos(updatedTodos);
        closeCartEditor();
    };
    const hasExistingPrice = (todo) => {
        const parsedPrice = Number(todo.price);
        return Number.isFinite(parsedPrice) && parsedPrice > 0;
    };
    const toggleTax = (index) => {
        const newTodos = [...todos];
        newTodos.forEach(item => {
            if (item.title === todos[index].title) {
                item.tax = !todos[index].tax;
            }
        });
        saveShopTodosToStorage(newTodos);
        setStatus(prevState => ({
            ...prevState,
            retrievedData: getShopTodosFromStorage()
        }));
        setTodos(getTodos())
    };
    const toggleCart = (index) => {
        const newTodos = [...todos];
        if (newTodos[index].cart) {
            newTodos[index].cart = false;
            if (cartEditor.index === index) {
                closeCartEditor();
            }
        } else {
            openCartEditor(index);
            return;
        }
        setTodos(newTodos);
    };
    
    const getTaxCheckBox = (todo, index) => {
        const taxId = `tax-${index}`;
        if (todo.tax) {
            return <input
                id={taxId}
                name={taxId}
                className='regular-checkbox button glassy'
                checked type='checkbox'
                onChange={() => toggleTax(index)}
            />
        } else {
            return <input
                id={taxId}
                name={taxId}
                className='regular-checkbox button glassy'
                type='checkbox'
                onChange={() => toggleTax(index)}
            />
        }
    }
    const updateQuantity = (groupTitle, id, selected) => {
        const updatedTodos = [...todos];
        updatedTodos.forEach((item, index) => {
            if (id === index) {
                item.quantity = Number(selected);
            } else if (validate(item.quantity) === null) {
                item.quantity = quantities[1];
            }
        });
        setTodos(updatedTodos);

    };
    const updateCategory = (groupTitle, id, selected) => {
        const selectedCategory = (selected === 'all') ? '' : selected;
        setCategory(selectedCategory);
    };
    const updateAisles = () => {
        let colors = [];
        let todoSort = [];
        let inactiveTodos = [];
        let newAisles = aisles || aislesInit;
        const updatedTodos = [...todos];
        updatedTodos.forEach(todo => {
            if (newAisles.indexOf(todo.aisle) < 0) {
                newAisles.push(todo.aisle);
            }
        });
        newAisles = sortArray(newAisles);
        localStorage.setItem('aisles', JSON.stringify(newAisles));
        colors = getColors(newAisles);
        newAisles.forEach(aisle => {
            updatedTodos.forEach(todo => {
                if (todo.aisle === aisle && todo.select) {
                    todoSort.push(todo);
                } else if (todo.aisle === aisle && !todo.select) {
                    inactiveTodos.push(todo);
                }
            });
        });
        inactiveTodos.forEach(todo => todoSort.push(todo));
        setTodos(todoSort);
        setStatus(prevState => ({
            ...prevState,
            colors: colors
        }));
        setAisles(newAisles);
    };
    const reIndex = (groupTitle, index, selectedAisle) => {
        const updatedTodos = [...todos];
        const updatedRetrievedData = getShopTodosFromStorage();
        let newAisles = aisles || aislesInit;
        if (selectedAisle === 'DELETE') {
            updatedRetrievedData.forEach(item => {
                if (item.title === todos[index].title) {
                    updatedRetrievedData.splice(index, 1);
                }
            })
            saveShopTodosToStorage(updatedRetrievedData);
            updatedTodos.splice(index, 1);
        } else if (selectedAisle === 'PRICE') {
            const newPrice = prompt('Enter price:', updatedTodos[index].price);
            updatedTodos[index].price = (newPrice !== null) ? Number(newPrice).toFixed(2) : updatedTodos[index].price;
            updatedRetrievedData.forEach(item => {
                if (item.title === updatedTodos[index].title) {
                    item.price = updatedTodos[index].price;
                    updatedTodos[index].aisle = item.aisle;
                };
            });
            saveShopTodosToStorage(updatedRetrievedData);
        } else if (selectedAisle === 'EDIT') {
            let updatedOgTitle = status.ogTitle;
            updatedOgTitle = updatedTodos[index].title;
            const newLabel = prompt('Enter new label:', updatedTodos[index].title);
            updatedTodos[index].title = (newLabel !== null) ? newLabel : updatedTodos[index].title;
            updatedRetrievedData.forEach(item => {
                if (item.title === updatedOgTitle) {
                    item.title = updatedTodos[index].title;
                    selectedAisle = item.aisle;
                };
            });
            updatedTodos[index].aisle = selectedAisle;
            saveShopTodosToStorage(updatedRetrievedData);
        } else {
            newAisles = aisles || aislesInit;
            if (selectedAisle === 'ADD INDEX') {
                const newAisle = prompt('Enter aisle number:', '');
                selectedAisle = (newAisle !== null) ? newAisle : 'New';
                if (newAisles.indexOf(selectedAisle) < 0) {
                    newAisles.push(selectedAisle);
                }
            }
            updatedTodos[index].aisle = selectedAisle;
            updatedRetrievedData.forEach(item => {
                if (item.title === updatedTodos[index].title) {
                    item.aisle = selectedAisle;
                }
            });
            localStorage.setItem('aisles', JSON.stringify(newAisles));
            saveShopTodosToStorage(updatedRetrievedData);
            getTotal();
            updateAisles();
        }
        updateAisles();
        setTodos(updatedTodos);
        setStatus(prevState => ({
            ...prevState,
            retrievedData: getShopTodosFromStorage(),
            ogTitle: (selectedAisle === 'EDIT') ? '' : status.ogTitle
        }));
        setAisles(newAisles);
    }
    const getSelectors = (todo, index, aisleColor, options = {}) => {
        const {
            isHistory = false,
            onHistoryToggleCart,
        } = options;

        if (isHistory) {
            const historyCount = Number(todo.quantity || 1);
            const historyAisleItems = itemMenuDefault.concat(aisles) || itemMenuDefault.concat(aislesInit);
            return (
                <div className='itemSelectors r-10-b' style={{ backgroundColor: aisleColor }}>
                    <div className='flex-container'>
                        <div>
                            <div className='button'>
                                <img
                                    title='add to cart again'
                                    className='inCartIcon'
                                    alt='add to cart'
                                    src={todo.cart ? InCart : PutInCart}
                                    onClick={() => onHistoryToggleCart(index)}
                                />
                            </div>
                            <div className='size20 m-10'>
                                ${Number(todo.price || 0).toFixed(2)}
                            </div>
                        </div>
                        <div>
                            <div>Days</div>
                            <div className='lastPurchaseDays flex1Auto contentCenter'>
                                {validate(todo.days) !== null ? todo.days : '0'}
                            </div>
                        </div>
                        <div>
                            <div className='mb-5'>Tax</div>
                            <input
                                className='regular-checkbox button glassy'
                                type='checkbox'
                                checked={Boolean(todo.tax)}
                                readOnly
                            />
                        </div>
                        <div>
                            <div className='mb-5 button'>Count</div>
                            <Selector
                                groupTitle='Count'
                                selected={historyCount}
                                label={index}
                                items={quantities}
                                onChange={() => {}}
                                padding='5px'
                                fontSize='15'
                            />
                        </div>
                        <div className='flex2Column pl-10 pr-10'>
                            <div className='mb-5'>Index</div>
                            <Selector
                                groupTitle='Aisle'
                                selected={todo.aisle || todo.category || 'History'}
                                label={index}
                                items={historyAisleItems}
                                onChange={() => {}}
                                padding='5px'
                                fontSize='15'
                                maxWidth='115px'
                            />
                        </div>
                    </div>
                    {todo.nutritionInfo ? (
                        <div className='containerDetail mt-5 size12 color-lite'>
                            Nutrition: {todo.nutritionInfo}
                        </div>
                    ) : null}
                </div>
            );
        }

        return (
            <div className='itemSelectors r-10-b' style={{ backgroundColor: aisleColor }}>
                <div className='flex-container'>
                    <div>
                        <div className='button'>
                            {getInCartButton(index)}
                        </div>
                        <div className='size20 m-10'>
                            ${todo.price}
                        </div>
                    </div>
                    <div>
                        <div>Days</div>
                        <div className='lastPurchaseDays flex1Auto contentCenter'>
                            {todo.days}
                        </div>
                    </div>
                    <div>
                        <div className='mb-5'>Tax</div>
                        {getTaxCheckBox(todo, index)}
                    </div>
                    <div>
                        <div className='mb-5 button'>Count</div>
                        <Selector
                            groupTitle='Count'
                            selected={todos[index].quantity}
                            label={index}
                            items={quantities}
                            onChange={updateQuantity}
                            padding='5px'
                            fontSize='15'
                        />
                    </div>
                    <div id='aisle' className='flex2Column pl-10 pr-10'>
                        <div className='mb-5'>Index</div>
                        <Selector
                            groupTitle='Aisle'
                            selected={todo.aisle}
                            label={index}
                            items={itemMenuDefault.concat(aisles) || itemMenuDefault.concat(aislesInit)}
                            onChange={reIndex}
                            padding='5px'
                            fontSize='15'
                            maxWidth='115px'
                        />
                    </div>
                </div>
            </div>
        )
    }
    const daItem = (todo, index, options = {}) => {
        const {
            isHistory = false,
            onToggleSelectOverride,
            onHistoryToggleCart,
            keyPrefix = 'main',
        } = options;
        const shopNavClasses = () => (todo.select) ? 'itemRemove box-highlight' : 'itemRemove box-top';
        const titleClasses = (length) => (todo.select) ? `${(length > 12) ? 'titleLong' : 'title'} white` : 'title';
        const aisleColor = getColor(todo.aisle);
        const handleSelectClick = onToggleSelectOverride || (() => toggleSelect(index));
        if (validate(todo) !== null) {
            return (
                <div key={getKey(`${keyPrefix}-${todo.title}-${index}`)} className='pt-5 ml-5 mr-5'>
                    <div
                        title={todo.title}
                        className={`r-10-t bg-tinted ${shopNavClasses()}`}
                        onClick={handleSelectClick}
                    >
                        <span className={`${titleClasses(todo.title.length)}`}>{todo.title}</span>
                        {getSelectedIconForItem(todo)}
                    </div>
                    {getSelectors(todo, index, aisleColor, { isHistory, onHistoryToggleCart })}
                </div>
            )
        } else {
            return (
                <div key={getKey(`${keyPrefix}-${todo.title}-${index}`)}>
                    <div className='height1px' style={{ backgroundColor: aisleColor }}></div>
                    <div
                        title={todo.title}
                        className={shopNavClasses()}
                        onClick={handleSelectClick}
                    >
                        <span className={titleClasses(todo.title.length)}>{todo.title}</span>
                        {getSelectedIconForItem(todo)}
                    </div>
                    {getSelectors(todo, index, aisleColor, { isHistory, onHistoryToggleCart })}
                </div>
            )
        }
    }

    const toHistoryItem = (item) => ({
        ...item,
        title: item.title || item.name || 'Untitled Item',
        aisle: item.aisle || item.category || 'History',
        price: Number.isFinite(Number(item.price)) ? Number(item.price).toFixed(2) : '0.00',
        quantity: Number.isFinite(Number(item.quantity)) && Number(item.quantity) > 0 ? Number(item.quantity) : 1,
        tax: Boolean(item.tax),
        cart: false,
        select: false,
        days: validate(item.days) !== null ? item.days : 0,
    });

    const formatHistoryDateTime = (record) => {
        const datePart = record?.date || 'Unknown date';
        const timePart = record?.time || (record?.timestamp ? new Date(record.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Unknown time');
        return `${datePart} ${timePart}`;
    };

    const showShoppingHistory = () => {
        const records = getCheckoutHistory();
        const initialIndex = records.length ? 0 : null;
        setHistoryRecords(records);
        setHistorySelectedIndex(initialIndex);
        setHistoryItems(initialIndex !== null ? (records[0].items || []).map(toHistoryItem) : []);
        setHistoryNotice('');
        setShoppingHistoryOpen(true);
        setStatus((prevState) => ({
            ...prevState,
            displaySettings: false,
        }));
    };

    const closeShoppingHistory = () => {
        setShoppingHistoryOpen(false);
        setHistoryNotice('');
    };

    const selectHistoryRecord = (index) => {
        const record = historyRecords[index];
        if (!record) return;
        setHistorySelectedIndex(index);
        setHistoryItems((record.items || []).map(toHistoryItem));
        setHistoryNotice('');
    };

    const toggleHistoryItemSelect = (index) => {
        setHistoryItems((prev) => prev.map((item, idx) => (
            idx === index ? { ...item, select: !item.select } : item
        )));
    };

    const addHistoryItemsToSelectedList = (itemsToAdd) => {
        if (!itemsToAdd.length) return;

        setTodos((prevTodos) => {
            const nextTodos = [...prevTodos];
            const now = new Date();
            const todayDate = getTodayDateString();

            itemsToAdd.forEach((historyItem) => {
                const existingIndex = nextTodos.findIndex((todo) =>
                    String(todo.title || '').toLowerCase() === String(historyItem.title || '').toLowerCase()
                );

                const normalizedItem = {
                    ...historyItem,
                    title: historyItem.title || 'Untitled Item',
                    aisle: historyItem.aisle || historyItem.category || 'History',
                    price: Number.isFinite(Number(historyItem.price)) ? Number(historyItem.price).toFixed(2) : '0.00',
                    quantity: Number.isFinite(Number(historyItem.quantity)) && Number(historyItem.quantity) > 0 ? Number(historyItem.quantity) : 1,
                    tax: Boolean(historyItem.tax),
                    cart: false,
                    select: true,
                    purchaseDate: todayDate,
                    lastPurchase: now,
                    days: 0,
                };

                if (existingIndex >= 0) {
                    nextTodos[existingIndex] = {
                        ...nextTodos[existingIndex],
                        ...normalizedItem,
                    };
                } else {
                    nextTodos.push(normalizedItem);
                }
            });

            return nextTodos;
        });

        setHistoryItems((prev) => prev.map((item) => {
            const shouldSelect = itemsToAdd.some((historyItem) => (
                String(historyItem.title || '').toLowerCase() === String(item.title || '').toLowerCase()
            ));

            return shouldSelect ? { ...item, select: true } : item;
        }));

        setCategory('Items Left');
        setHistoryNotice(`Added ${itemsToAdd.length} item${itemsToAdd.length === 1 ? '' : 's'} to cart.`);
    };

    const addSelectedHistoryItemsToSelectedList = () => {
        const selected = historyItems.filter((item) => item.select);
        if (!selected.length) {
            setHistoryNotice('Select one or more history items to add to cart.');
            return;
        }
        addHistoryItemsToSelectedList(selected);
        setHistoryItems((prev) => prev.map((item) => ({
            ...item,
            cart: item.select ? true : item.cart,
            select: item.select ? true : item.select,
        })));
    };

    const addAllHistoryItemsToSelectedList = () => {
        if (!historyItems.length) {
            setHistoryNotice('No history items to add to cart.');
            return;
        }

        setHistoryItems((prev) => prev.map((item) => ({ ...item, select: true })));
        addHistoryItemsToSelectedList(historyItems);

        setHistoryNotice('Selected all displayed history items. Use Add Selected To Cart Again to add them to cart.');
    };

    const addHistoryItemToSelectedList = (index) => {
        const item = historyItems[index];
        if (!item) return;
        addHistoryItemsToSelectedList([item]);
        setHistoryItems((prev) => prev.map((entry, idx) => (
            idx === index ? { ...entry, cart: false, select: true } : entry
        )));
    };

    const getShoppingHistoryDisplay = () => {
        if (!shoppingHistoryOpen) return null;

        return (
            <div className='containerDetail bg-lite p-10'>
                <div className='containerDetail bg-green flexContainer mb-10 mt-10' style={{ gap: '8px' }}>
                    <div className='containerDetail size20 color-yellow p-15 flex3Column contentLeft'>
                        Shopping History
                    </div>
                    <div
                        className='containerDetail button bg-red color-yellow p-10 flexColumn contentCenter'
                        onClick={closeShoppingHistory}
                    >
                        Close History
                    </div>
                </div>
                {historyRecords.length === 0 ? (
                    <div className='containerDetail p-10 color-yellow'>No checkout history found.</div>
                ) : (
                    <>
                        <div className='containerDetail scroll mb-10' style={{ maxHeight: '220px' }}>
                            {historyRecords.map((record, index) => {
                                const itemCount = Number(record.totalItems || (record.items || []).length || 0);
                                const total = Number(record.totalAmount || 0).toFixed(2);
                                const selectedClass = historySelectedIndex === index ? 'bg-green color-neogreen' : 'bg-lite color-yellow';
                                return (
                                    <div
                                        key={getKey(`history-${record.date || 'date'}-${record.time || index}`)}
                                        className={`containerDetail button p-10 m-5 ${selectedClass}`}
                                        onClick={() => selectHistoryRecord(index)}
                                    >
                                        {formatHistoryDateTime(record)} | Items: {itemCount} | Total: ${total}
                                    </div>
                                );
                            })}
                        </div>
                        <div className='flexContainer mb-10' style={{ gap: '8px' }}>
                            <div
                                className='containerDetail button bg-green color-neogreen p-10'
                                onClick={addSelectedHistoryItemsToSelectedList}
                            >
                                Add Selected
                            </div>
                            <div
                                className='containerDetail button bg-green color-neogreen p-10'
                                onClick={addAllHistoryItemsToSelectedList}
                            >
                                Add All
                            </div>
                            {historyNotice ? (
                                <div className='containerDetail p-10 color-yellow'>{historyNotice}</div>
                            ) : null}
                        </div>
                        <div className='containerDetail scroll' style={{ maxHeight: '500px' }}>
                            {historyItems.map((item, index) =>
                                daItem(item, index, {
                                    isHistory: true,
                                    onToggleSelectOverride: () => toggleHistoryItemSelect(index),
                                    onHistoryToggleCart: () => addHistoryItemToSelectedList(index),
                                    keyPrefix: `history-${historySelectedIndex ?? 'none'}`,
                                })
                            )}
                        </div>
                    </>
                )}
            </div>
        );
    };
    const getItems = (context) => {
        const newAisles = (validate(aisles) !== null) ? aisles : aislesInit;
        const pushNewAisle = (aisle) => (newAisles.indexOf(aisle) > -1) ? '' : newAisles.push(aisle);

        const newList = todos.map((todo) => {
            let display = todo.title.toLowerCase().includes(status.search.toLowerCase());
            if (category === 'Items Left') {
                display = display && todo.select && !todo.cart;
            } else if (category === 'In Cart') {
                display = display && todo.cart;
            } else if (category !== '' && category !== undefined) {
                display = display && todo.aisle === category;
            }
            if (display) {
                //console.log(`displayItem => title: ${todo.title.toLowerCase()} search: ${status.search.toLowerCase()}`);
            }
            pushNewAisle(todo.aisle);
            return {
                ...todo,
                display
            };
        });
        localStorage.setItem('aisles', JSON.stringify(newAisles));
        if (context === 'display') {
            const itemsDisplay = () => newList.map((todo, index) => (todo.display) ? daItem(todo, index) : null);
            return <div className='height--300 bg-lite'>
                    { itemsDisplay() }
                </div>
        } else if (context === 'effect') {
            setAisles(newAisles);
        }
        saveShopTodosToStorage(newList);
    };
    useEffect(() => {
        //alert(`shopFilter: ${shopFilter} !!shopFilter: ${!!shopFilter}`);
        if (shopFilter !== undefined) {
            localStorage.setItem('shopFilter', shopFilter);
        }
    }, [shopFilter]);
    // Run initial filter/category setup once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        setCategory(initializeData('shopCategory', ''));
        const filter = localStorage.getItem('shopFilter');
        //alert(`display filter: ${filter} localStorage.getItem('shopFilter'): ${localStorage.getItem('shopFilter')}`);
        setShopFilter(filter);
        updateAisles();
    }, []);
    // Apply ingredient sync on ingredient changes; todos dependency intentionally omitted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        const checkedIngredients = (ingredients || []).filter((item) => ingredientStatus?.[item] === true);

        const isIngredient = (item) => {
            if (!checkedIngredients || checkedIngredients.length === 0) {
                return false;
            }
            return checkedIngredients.some((ingredient) => (item.toLowerCase() === String(ingredient.split(' ')[0]).toLowerCase()) ? true : false);
        };

        const updatedTodos = todos.map((item) => {
            if (isIngredient(item.title)) {
                return { ...item, select: true };
            }
            return item;
        });

        if (checkedIngredients.length > 0) {
            const newIngredients = checkedIngredients.filter((item) => {
                return todos.some((ingredient) =>
                    ingredient.title.toLowerCase().includes(String(item.split(' ')[0]).toLowerCase())
                );
            });
            console.log(`newIngredients: ${JSON.stringify(newIngredients, null, 2)}`);

            newIngredients.forEach((ingredient) => {
                if (!updatedTodos.some((todo) => todo.title === ingredient)) {
                    updatedTodos.push({
                        title: ingredient,
                        aisle: SHOP_AISLES.COOK_REQUIRED,
                        price: '0.00',
                        quantity: 1,
                        tax: false,
                        cart: false,
                        select: true,
                        lastPurchase: today,
                        days: 0,
                        display: false,
                    });
                }
            });
        }

        setTodos(updatedTodos);
    }, [ingredients, ingredientStatus]);
    useEffect(() => {
        console.log(`Shop ==> useEffect category: ${category}`);
        localStorage.setItem('shopCategory', category);
    }, [category]);
    // Tax toggle should recompute totals; helper is intentionally stable by usage pattern.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        getTotal();
    }, [status.tax]);
    const sortArray = (array) => {
        const filtered = array.filter(function (el) {
            return el != null;
        });
        const alphabetic = [];
        const numeric = [];
        filtered.forEach(item => {
            if (Number(item.substring(0, 1)) > 0) {
                numeric.push(item);
            } else {
                alphabetic.push(item);
            }
        });
        alphabetic.sort();
        numeric.sort(function (a, b) { return a - b });
        array = [];
        alphabetic.forEach(item => {
            if (array.indexOf(item) < 0) {
                array.push(item);
            }
        });
        numeric.forEach(item => array.push(item));
        return array;
    };
    const getTotal = () => {
        let newTotal = 0;
        let subtotal = 0;
        let newTax = 0;
        let newTaxTotal = 0;
        let updatedTodos = [...todos];
        let updatesItems = 0;
        let updatedTotalItems = 0;
        updatedTodos.forEach(item => {
            if (validate(item.price) !== null && item.cart) {
                updatesItems++;
                updatedTotalItems = Number(updatedTotalItems) + Number(item.quantity);
                subtotal = parseFloat(Number(item.price)) * Number(item.quantity);
                if (item.tax) {
                    newTax = subtotal * (Number(status.tax) * .01);
                    newTaxTotal = newTaxTotal + newTax;
                    subtotal = subtotal + newTax;
                }
                newTotal = parseFloat(Number(newTotal)) + subtotal;
            }
        })
        newTotal = Math.round(newTotal * 100) / 100;
        newTotal = newTotal.toFixed(2);
        newTaxTotal = newTaxTotal.toFixed(2)
        setStatus(prevState => ({
            ...prevState,
            totalItems: updatedTotalItems,
            items: updatesItems,
            total: newTotal,
            taxTotal: newTaxTotal
        }));
    };
    const sortName = () => {
        const sortedTodos = [...todos];
        sortedTodos.sort(function (a, b) {
            let x = a.title.toLowerCase();
            let y = b.title.toLowerCase();
            if (x < y) { return -1; }
            if (x > y) { return 1; }
            return 0;
        });
        setTodos(sortedTodos);
    };
    const updateItem = (item) => {
        setStatus(prevState => ({
            ...prevState,
            item: item
        }));
    }
    const setEntry = (value) => {
        console.log(`setEntry ${value}`);
        debounceType(setItemEntry, value);
        setStatus(prevState => ({
            ...prevState,
            displayProductEntry: false,
            displaySettings: false,
            search: value,
            item: value
        }));
    }
    const addTodo = () => {
        console.log(`addTodo =>\nitemEntry: ${itemEntry}`);
        const updatedTodos = [...todos];
        let updatedRetrievedData = status.retrievedData;
        const updatedAisles = aisles || aislesInit;
        let newPriceUpdate = 0;
        let newItem = {};
        if (itemEntry) {
            const newAisle = (!category || category === 'all') ? 'Walmart' : category;
            if (updatedAisles.indexOf(newAisle) < 0) {
                updatedAisles.push(newAisle);
            }
            newItem = {
                title: itemEntry,
                aisle: newAisle,
                price: Number(newPriceUpdate).toFixed(2),
                quantity: 1,
                tax: false,
                cart: false,
                select: true,
                lastPurchase: today,
                days: 0
            };
            updatedTodos.push(newItem);
            updatedRetrievedData.push(newItem);
            saveShopTodosToStorage(updatedRetrievedData);
            const newTodos = getShopTodosFromStorage();
            const newRetrievedData = getShopTodosFromStorage();
            setStatus(prevState => ({
                ...prevState,
                newTodoText: itemEntry,
                retrievedData: newRetrievedData,
            }));
            setAisles(updatedAisles);
            setTodos(newTodos);
        }
    };
    const toggleSelect = (id) => {
        const updatedTodos = [...todos];
        updatedTodos.forEach((item, index) => {
            if (item.title === updatedTodos[id].title) {
                if (updatedTodos[id].select) {
                    updatedTodos[index].select = false;
                    updatedTodos[index].cart = false;
                } else {
                    updatedTodos[index].lastPurchase = today;
                    updatedTodos[index].days = 1;
                    updatedTodos[index].select = true;
                }
            }
        });
        setTodos(getTodos());
        updateAisles();
    };
    const revert = () => {
        const revertData = initializeData(
            'vueTodosRevert',
            getShopTodosFromStorage()
        );
        saveShopTodosToStorage(revertData);
        setStatus(prevState => ({
            ...prevState,
            retrievedData: revertData,
            displaySettings: false,
            displayProductEntry: false
        }));
        setTodos(revertData);
    };
    const save = () => {
        saveShopTodosToStorage(todos);
        setStatus(prevState => ({
            ...prevState,
            displaySettings: false,
            displayProductEntry: false
        }));
    };
    const restore = () => {
        const newAisles = aisles || aislesInit;
        itemMenuDefault.forEach(aisle => newAisles.push(aisle));
        updateAisles();
        setTodos(status.retrievedData);
        setStatus(prevState => ({
            ...prevState,
            retrievedData: getShopTodosFromStorage(),
            displaySettings: false,
            displayProductEntry: false
        }));
        setAisles(newAisles);
    };
    const getSelectIcon = (index) => <img
        className='cart'
        alt='select'
        src={(todos[index].select) ? Selected : Select}
    />
    const setTax = () => {
        setStatus(prevState => ({
            ...prevState,
            tax: initializeData('tax', null)
        }));
    }
    const toggleSettings = () => {
        setStatus(prevState => ({
            ...prevState,
            displaySettings: !status.displaySettings
        }));
    };
    const clear = () => {
        localStorage.setItem('vueTodosRevert', JSON.stringify(todos));
        localStorage.removeItem('aisles', '');
        localStorage.removeItem('vueTodos', '');
        localStorage.removeItem('vueTodosSaved', '');
        setAisles([]);
        setTodos([]);
    };
    const deleteList = () => {
        const ok = window.confirm(`deleting all => ${category} items`);
        if (ok) {
            localStorage.setItem('vueTodosRevert', JSON.stringify(todos));
            const newTodos = [...todos];
            const cleanList = newTodos.filter(todo => todo.aisle !== category);
            setTodos(cleanList);

            //const aisles = [...aisles];
            const removeItem = (arr, value) => {
                return arr.filter(item => item !== value);
            };
            setAisles(removeItem(aisles, category));
            setIngredients([]);
            setCategory('');
        }
    };
    const changeList = () => {
        localStorage.setItem('vueTodosRevert', JSON.stringify(todos));
        const newCategory = window.prompt('Enter new category:', '');
        const ok = window.confirm(`changeing all => ${category} to ${newCategory}`);
        if (ok) {
            const newTodos = [...todos];
            newTodos.forEach((todo) => {
                if (todo.aisle === category) {
                    todo.aisle = newCategory;
                }
            });
            setTodos(newTodos);
            if (category === SHOP_AISLES.RECIPES_LEGACY || category === SHOP_AISLES.COOK_REQUIRED) {
                setIngredients([]);
            }
        }
    };
    const emptyCart = () => {
        localStorage.setItem('vueTodosRevert', JSON.stringify(todos));
        const newTodos = [...todos];
        newTodos.forEach((todo) => {
            todo.cart = false;
        });
        setTodos(newTodos);
        if (category === SHOP_AISLES.RECIPES_LEGACY || category === SHOP_AISLES.COOK_REQUIRED) {
            setIngredients([]);
        }
    };
    const selectList = () => {
        localStorage.setItem('vueTodosRevert', JSON.stringify(todos));
        const newTodos = todos.map(todo => {
            if (todo.aisle === category) {
                return { ...todo, select: true };
            }
            return todo;
        });
        setTodos(newTodos);
    };  
    const deselectList = () => {
        localStorage.setItem('vueTodosRevert', JSON.stringify(todos));
        const newTodos = todos.map(todo => {
            if (todo.aisle === category) {
                return { ...todo, select: false };
            }
            return todo;
        });
        setTodos(newTodos);
    };  
    // Calculate selected items and their quantity totals
    const selectedItems = todos.filter(item => item.select);
    const selectedCount = selectedItems.length;
    const selectedQuantityTotal = selectedItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

    // --- CHECKOUT BUTTON LOGIC ---
    const [checkoutNotice, setCheckoutNotice] = useState('');
    const [checkoutDisabled, setCheckoutDisabled] = useState(false);
    const [checkoutReview, setCheckoutReview] = useState({
        open: false,
        rows: [],
        showMissingOnly: false,
        bulkExpirationDays: '7',
        activeEditSourceIndex: null,
        notice: ''
    });
    const { inventoryItems, addInventoryItem, updateInventoryItem } = useKitchenInventory();

    const getDateInputValue = (value) => {
        const parsed = parseLocalDate(value);
        return parsed ? formatLocalDate(parsed) : '';
    };

    const getMissingCheckoutFields = (row) => {
        const missing = [];
        const parsedPrice = Number(row.priceInput);
        if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) missing.push('price');
        if (!row.purchaseDate) missing.push('purchase date');
        if (!row.expiration) missing.push('expiration');
        return missing;
    };

    const updateCheckoutReviewRow = (sourceIndex, patch) => {
        setCheckoutReview((prev) => ({
            ...prev,
            rows: prev.rows.map((row) => (
                row.sourceIndex === sourceIndex
                    ? { ...row, ...patch }
                    : row
            ))
        }));
    };

    const closeCheckoutReview = () => {
        setCheckoutReview({
            open: false,
            rows: [],
            showMissingOnly: false,
            bulkExpirationDays: '7',
            activeEditSourceIndex: null,
            notice: ''
        });
    };

    const beginCheckoutReviewEdit = (sourceIndex) => {
        setCheckoutReview((prev) => ({
            ...prev,
            activeEditSourceIndex: sourceIndex,
        }));
    };

    const endCheckoutReviewEdit = (sourceIndex, patch = null) => {
        setCheckoutReview((prev) => ({
            ...prev,
            rows: patch
                ? prev.rows.map((row) => (row.sourceIndex === sourceIndex ? { ...row, ...patch } : row))
                : prev.rows,
            activeEditSourceIndex: prev.activeEditSourceIndex === sourceIndex ? null : prev.activeEditSourceIndex,
        }));
    };

    const toCentsFromPriceInput = (value) => {
        const digits = String(value || '').replace(/\D/g, '');
        return digits ? Number(digits) : 0;
    };

    const toPriceInputFromCents = (cents) => {
        if (!Number.isFinite(cents) || cents <= 0) return '';
        return (cents / 100).toFixed(2);
    };

    const handleCheckoutReviewPriceKeyDown = (sourceIndex, currentPriceInput, event) => {
        if (event.key === 'Tab') return;

        if (event.key === 'Backspace') {
            event.preventDefault();
            const nextCents = Math.trunc(toCentsFromPriceInput(currentPriceInput) / 10);
            updateCheckoutReviewRow(sourceIndex, { priceInput: toPriceInputFromCents(nextCents) });
            return;
        }

        if (event.key >= '0' && event.key <= '9') {
            event.preventDefault();
            const prevCents = toCentsFromPriceInput(currentPriceInput);
            const nextCents = Number(`${prevCents}${event.key}`);
            updateCheckoutReviewRow(sourceIndex, { priceInput: toPriceInputFromCents(nextCents) });
            return;
        }

        // Block other printable characters to keep the cents-entry flow predictable.
        if (event.key.length === 1) {
            event.preventDefault();
        }
    };

    const toggleCheckoutReviewRowSelected = (sourceIndex) => {
        setCheckoutReview((prev) => ({
            ...prev,
            rows: prev.rows.map((row) => (
                row.sourceIndex === sourceIndex
                    ? { ...row, selected: !row.selected }
                    : row
            ))
        }));
    };

    const setCheckoutReviewSelectionForMissing = () => {
        setCheckoutReview((prev) => ({
            ...prev,
            rows: prev.rows.map((row) => ({
                ...row,
                selected: getMissingCheckoutFields(row).length > 0,
            }))
        }));
    };

    const setCheckoutReviewSelectionAll = (selected) => {
        setCheckoutReview((prev) => ({
            ...prev,
            rows: prev.rows.map((row) => ({ ...row, selected }))
        }));
    };

    const fillMissingPurchaseDatesToday = () => {
        const todayIso = getTodayDateString();
        setCheckoutReview((prev) => ({
            ...prev,
            rows: prev.rows.map((row) => (
                row.selected && !row.purchaseDate
                    ? { ...row, purchaseDate: todayIso }
                    : row
            )),
            notice: ''
        }));
    };

    const fillMissingExpirationByDays = () => {
        const daysNum = Number(checkoutReview.bulkExpirationDays);
        const safeDays = Number.isFinite(daysNum) ? Math.trunc(daysNum) : 7;
        const expiration = getDateFromTodayPlusDays(safeDays);

        setCheckoutReview((prev) => ({
            ...prev,
            rows: prev.rows.map((row) => (
                row.selected && !row.expiration
                    ? { ...row, expiration }
                    : row
            )),
            notice: ''
        }));
    };

    const copyFirstExpirationToSelectedRows = () => {
        const firstExpiration = (checkoutReview.rows || []).find((row) => row.expiration)?.expiration;
        if (!firstExpiration) {
            setCheckoutReview((prev) => ({
                ...prev,
                notice: 'Enter at least one expiration date first, then copy to selected items.'
            }));
            return;
        }

        setCheckoutReview((prev) => ({
            ...prev,
            rows: prev.rows.map((row) => (
                row.selected
                    ? { ...row, expiration: firstExpiration }
                    : row
            )),
            notice: ''
        }));
    };

    const getShelfLifeDaysForCategory = (categoryValue) => {
        const category = String(categoryValue || '').toLowerCase();

        if (category.includes('meat') || category.includes('seafood')) return 3;
        if (category.includes('dairy') || category.includes('egg')) return 14;
        if (category.includes('produce') || category.includes('fruit') || category.includes('vegetable')) return 7;
        if (category.includes('frozen')) return 180;
        if (category.includes('pantry') || category.includes('canned') || category.includes('dry') || category.includes('spice')) return 90;

        return 14;
    };

    const autoFixMissingCheckoutDates = () => {
        setCheckoutReview((prev) => {
            const hasSelectedRows = prev.rows.some((row) => row.selected);
            let updates = 0;

            const rows = prev.rows.map((row) => {
                const target = hasSelectedRows ? row.selected : true;
                if (!target) return row;

                let changed = false;
                const next = { ...row };

                if (!next.purchaseDate) {
                    next.purchaseDate = getTodayDateString();
                    changed = true;
                }

                if (!next.expiration) {
                    const shelfLifeDays = getShelfLifeDaysForCategory(next.category);
                    next.expiration = getDateFromTodayPlusDays(shelfLifeDays);
                    changed = true;
                }

                if (changed) updates += 1;
                return next;
            });

            return {
                ...prev,
                rows,
                notice: updates > 0
                    ? `Auto-filled missing dates on ${updates} item${updates === 1 ? '' : 's'}.`
                    : 'No missing dates found on targeted rows.'
            };
        });
    };

    // Import all properties of in-cart items into inventory
    const importFullShopItemsIntoInventory = (shopItems) => {
        if (!Array.isArray(shopItems) || shopItems.length === 0) return;
        // Normalize by cleaned name for matching
        const cleanLabel = (val) => String(val || '').replace(/\s+/g, ' ').trim().toLowerCase();
        shopItems.forEach((shopItem) => {
            const name = cleanLabel(shopItem.title || shopItem.name);
            if (!name) return;
            // Try to find existing inventory item by cleaned name
            const existing = (inventoryItems || []).find(inv => cleanLabel(inv.name) === name);
            const payload = {
                name: shopItem.title || shopItem.name || '',
                purchaseDate: shopItem.purchaseDate || '',
                expirationDate: shopItem.expiration || shopItem.expirationDate || '',
                nutritionInfo: shopItem.nutritionInfo || '',
                quantity: shopItem.quantity !== undefined ? String(shopItem.quantity) : '',
                category: shopItem.category || 'pantry',
            };
            if (existing) {
                // Only update if something changed
                const updatedFields = {};
                if (payload.purchaseDate && payload.purchaseDate !== existing.purchaseDate) updatedFields.purchaseDate = payload.purchaseDate;
                if (payload.expirationDate && payload.expirationDate !== existing.expirationDate) updatedFields.expirationDate = payload.expirationDate;
                if (payload.nutritionInfo && payload.nutritionInfo !== existing.nutritionInfo) updatedFields.nutritionInfo = payload.nutritionInfo;
                if (payload.quantity && payload.quantity !== existing.quantity) updatedFields.quantity = payload.quantity;
                if (payload.category && payload.category !== existing.category) updatedFields.category = payload.category;
                if (Object.keys(updatedFields).length > 0) {
                    updateInventoryItem(existing.id, updatedFields);
                }
            } else {
                addInventoryItem(payload);
            }
        });
    };
    const handleCheckout = () => {
        const inCartItems = todos
            .map((item, sourceIndex) => ({ ...item, sourceIndex }))
            .filter(item => item.cart);

        if (inCartItems.length === 0) {
            setCheckoutNotice('No items in cart to checkout.');
            setTimeout(() => setCheckoutNotice(''), 2000);
            return;
        }

        const reviewRows = inCartItems.map((item) => {
            const parsedPrice = Number(item.price);
            return {
                sourceIndex: item.sourceIndex,
                title: item.title || '',
                quantity: Number(item.quantity || 1),
                priceInput: Number.isFinite(parsedPrice) && parsedPrice > 0 ? parsedPrice.toFixed(2) : '',
                purchaseDate: getDateInputValue(item.purchaseDate),
                expiration: getDateInputValue(item.expiration),
                nutritionInfo: item.nutritionInfo || '',
                category: item.category || 'pantry',
                tax: Boolean(item.tax),
                selected: false,
            };
        });

        setCheckoutReview({
            open: true,
            rows: reviewRows,
            showMissingOnly: reviewRows.some((row) => getMissingCheckoutFields(row).length > 0),
            bulkExpirationDays: '7',
            activeEditSourceIndex: null,
            notice: ''
        });
    };

    const finalizeCheckout = () => {
        const rows = checkoutReview.rows || [];
        if (!rows.length) {
            setCheckoutReview((prev) => ({
                ...prev,
                notice: 'No items available to checkout.'
            }));
            return;
        }

        const missingRequired = rows.some((row) => !row.expiration || !row.purchaseDate);
        if (missingRequired) {
            setCheckoutReview((prev) => ({
                ...prev,
                notice: 'Please add purchase and expiration dates for all items before checkout.'
            }));
            return;
        }

        const updatedTodos = [...todos];
        const finalizedItems = [];

        rows.forEach((row) => {
            const idx = row.sourceIndex;
            // Safety guard: only complete checkout for items that are currently in cart.
            if (!updatedTodos[idx] || !updatedTodos[idx].cart) return;

            const parsedPrice = Number(row.priceInput);
            const safePrice = Number.isFinite(parsedPrice) && parsedPrice >= 0 ? parsedPrice : 0;
            const parsedQuantity = Number(row.quantity);
            const safeQuantity = Number.isFinite(parsedQuantity) && parsedQuantity > 0
                ? Math.trunc(parsedQuantity)
                : 1;

            const now = new Date();

            updatedTodos[idx] = {
                ...updatedTodos[idx],
                title: row.title,
                price: safePrice.toFixed(2),
                quantity: safeQuantity,
                purchaseDate: normalizeExpirationDate(row.purchaseDate),
                expiration: normalizeExpirationDate(row.expiration),
                nutritionInfo: row.nutritionInfo || '',
                category: row.category || 'pantry',
                tax: Boolean(row.tax),
                cart: false,
                select: false,
                lastPurchase: now,
            };

            finalizedItems.push(updatedTodos[idx]);
        });

        if (finalizedItems.length === 0) {
            setCheckoutReview((prev) => ({
                ...prev,
                notice: 'Unable to checkout. No matching cart items were found.'
            }));
            return;
        }

        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        const totalItems = finalizedItems.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
        const totalAmount = finalizedItems
            .reduce((sum, item) => sum + (parseFloat(item.price) * Number(item.quantity || 1)), 0)
            .toFixed(2);
        const title = `Checkout ${dateStr} | Items: ${totalItems} | $${totalAmount}`;

        setTodos(updatedTodos);

        addCheckoutRecord({
            title,
            date: dateStr,
            time: timeStr,
            timestamp: now.getTime(),
            totalItems,
            totalAmount,
            items: finalizedItems,
        });
        // Import all in-cart items with full properties into inventory
        importFullShopItemsIntoInventory(finalizedItems);
        closeCheckoutReview();
        setCheckoutDisabled(true);
        setCheckoutNotice('Saving...');
        setTimeout(() => {
            setCheckoutNotice('');
            setCheckoutDisabled(false);
        }, 2000);
    };

    const submitCheckoutReview = () => {
        if (checkoutDisabled) return;
        finalizeCheckout();
    };

    const endCheckoutReview = (mode = 'close') => {
        if (mode === 'submit') {
            submitCheckoutReview();
            return;
        }
        closeCheckoutReview();
    };

    useEffect(() => {
        if (!checkoutReview.open) return undefined;

        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                endCheckoutReview('close');
                return;
            }

            const isSubmitShortcut = event.key === 'Enter' && (event.metaKey || event.ctrlKey);
            if (isSubmitShortcut) {
                event.preventDefault();
                endCheckoutReview('submit');
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [checkoutReview.open, checkoutDisabled]);

    const getCheckoutReviewDialog = () => {
        if (!checkoutReview.open) return null;

        const rows = checkoutReview.showMissingOnly
            ? checkoutReview.rows.filter((row) => (
                getMissingCheckoutFields(row).length > 0
                || row.sourceIndex === checkoutReview.activeEditSourceIndex
            ))
            : checkoutReview.rows;
        const missingCount = checkoutReview.rows.filter((row) => getMissingCheckoutFields(row).length > 0).length;
        const selectedCount = checkoutReview.rows.filter((row) => row.selected).length;
        const readyCount = checkoutReview.rows.length - missingCount;

        return (
            <div
                className='mt-130'
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
                onClick={() => endCheckoutReview('close')}
            >
                <div
                    className='containerDetail bg-tintedDark color-lite width-100-percent mt--5'
                    onClick={(event) => event.stopPropagation()}
                >
                    <div className='flexContainer contentCenter mt-10 mb-10' style={{ gap: '10px' }}>
                        <div className='size25 color-yellow flex3Column contentLeft'>Checkout Review</div>
                        <div
                            className='containerDetail button bg-green p-10 contentCenter color-neogreen'
                            style={{
                                border: '2px solid #34d399',
                                minWidth: '220px'
                            }}
                            onClick={() => endCheckoutReview('submit')}
                            title='Submit checkout review (Cmd/Ctrl + Enter)'
                        >
                            Complete Checkout ({readyCount}/{checkoutReview.rows.length})
                        </div>
                    </div>
                    <div className='size14 color-orange mb-10'>
                        Missing field alerts: {missingCount}
                    </div>
                    <div className='containerDetail mb-10 p-10 bg-mediumDark'>
                        <div className='size14 color-yellow contentLeft'>
                            Complete checkout when all required fields are filled.
                        </div>
                        <div className='size12 color-lite contentLeft mt-5'>
                            Ready items: {readyCount}/{checkoutReview.rows.length} | Submit shortcut: Cmd/Ctrl + Enter
                        </div>
                    </div>
                    <div
                        className='containerDetail button mb-10 p-10 bg-green color-neogreen contentCenter'
                        style={{ border: '2px solid #34d399' }}
                        onClick={() => endCheckoutReview('submit')}
                        title='Submit checkout review (Cmd/Ctrl + Enter)'
                    >
                        Complete Checkout Now
                    </div>
                    <div
                        className='containerDetail button mb-10 p-10 bg-green color-yellow contentCenter'
                        onClick={() => setCheckoutReview((prev) => ({ ...prev, showMissingOnly: !prev.showMissingOnly }))}
                    >
                        {checkoutReview.showMissingOnly ? 'Showing: Missing Fields Only' : 'Showing: All Checkout Items'}
                    </div>
                    <div className='flexContainer mb-10' style={{ gap: '8px', flexWrap: 'wrap' }}>
                        <div
                            className='containerDetail button p-10  color-yellow contentCenter'
                            onClick={() => setCheckoutReviewSelectionAll(true)}
                        >
                            Select All
                        </div>
                        <div
                            className='containerDetail button p-10  color-yellow contentCenter'
                            onClick={() => setCheckoutReviewSelectionAll(false)}
                        >
                            Clear Selection
                        </div>
                        <div
                            className='containerDetail button p-10  color-yellow contentCenter'
                            onClick={setCheckoutReviewSelectionForMissing}
                        >
                            Select Missing
                        </div>
                        <div className='containerDetail p-10  color-lite contentCenter'>
                            Selected: {selectedCount}
                        </div>
                    </div>

                    <div className='containerDetail mb-10 p-10 '>
                        <div className='size12 color-yellow mb-5'>Quick Date Tools (apply to selected rows)</div>
                        <div className='flexContainer' style={{ gap: '8px', flexWrap: 'wrap' }}>
                            <div
                                className='containerDetail button p-10 bg-yellow color-dark contentCenter width-100-percent'
                                onClick={fillMissingPurchaseDatesToday}
                            >
                                Fill Missing Purchase = Today
                            </div>
                            <div
                                className='containerDetail button p-10 bg-yellow color-dark contentLeft '
                                onClick={fillMissingExpirationByDays}
                            >
                                Fill Missing Expiration = Today + N days
                            </div>
                            <div className='containerDetail contentLeft p-5'>
                                <input
                                    className='containerDetail color-lite p-5'
                                    type='number'
                                    value={checkoutReview.bulkExpirationDays}
                                    onChange={(e) => setCheckoutReview((prev) => ({ ...prev, bulkExpirationDays: e.target.value }))}
                                    style={{ width: '70px' }}
                                />
                            </div>
                            <div
                                className='containerDetail button p-10 bg-yellow color-dark contentLeft width-100-percent'
                                onClick={copyFirstExpirationToSelectedRows}
                            >
                                Copy First Entered Expiration to Selected
                            </div>
                            <div
                                className='containerDetail button p-10 bg-green color-neogreen contentLeft width-100-percent'
                                onClick={autoFixMissingCheckoutDates}
                            >
                                Auto-Fix Missing Dates (Category Defaults)
                            </div>
                            <div
                                className='containerDetail button bg-red color-yellow p-10 flex1Column contentLeft width-100-percent'
                                onClick={() => endCheckoutReview('close')}
                                title='Close checkout review (Esc)'
                            >
                                Cancel
                            </div>
                        </div>
                    </div>
                    <div className='ht-400 scroll'>
                        {rows.map((row, rowIndex) => {
                            const missing = getMissingCheckoutFields(row);
                            const expirationMissing = !row.expiration;
                            const purchaseMissing = !row.purchaseDate;
                            const priceMissing = !Number.isFinite(Number(row.priceInput)) || Number(row.priceInput) <= 0;

                            return (
                                <div
                                    key={`${row.title}-${row.sourceIndex}`}
                                    className={`containerDetail ${(rowIndex === rows.length - 1) ? 'mb-80': 'mb-10'} p-10`}
                                    style={{
                                        border: `1px solid ${missing.length ? '#ff6b6b' : '#2ec4b6'}`,
                                        borderRadius: '8px',
                                        backgroundColor: '#0f172a'
                                    }}
                                >
                                    <div className='flexContainer mb-5' style={{ gap: '10px', alignItems: 'center' }}>
                                        <input
                                            type='checkbox'
                                            checked={Boolean(row.selected)}
                                            onChange={() => toggleCheckoutReviewRowSelected(row.sourceIndex)}
                                        />
                                        <div className='size18 color-yellow'>{row.title}</div>
                                    </div>
                                    {missing.length > 0 && (
                                        <div className='size12 color-orange mb-10'>
                                            Missing: {missing.join(', ')}
                                        </div>
                                    )}
                                    <div className='flexContainer' style={{ gap: '10px', flexWrap: 'wrap' }}>
                                        <div className='contentLeft'>
                                            <div className='size12 color-yellow mb-5'>Price</div>
                                            <input
                                                className='containerDetail color-lite p-5'
                                                type='text'
                                                inputMode='numeric'
                                                style={{ border: `1px solid ${priceMissing ? '#ff6b6b' : '#2ec4b6'}` }}
                                                value={row.priceInput ? `$${row.priceInput}` : ''}
                                                placeholder='0.00'
                                                onChange={() => {}}
                                                onKeyDown={(e) => handleCheckoutReviewPriceKeyDown(row.sourceIndex, row.priceInput, e)}
                                                onFocus={() => beginCheckoutReviewEdit(row.sourceIndex)}
                                                onBlur={() => {
                                                    const parsed = Number(row.priceInput);
                                                    if (Number.isFinite(parsed) && row.priceInput !== '') {
                                                        endCheckoutReviewEdit(row.sourceIndex, { priceInput: parsed.toFixed(2) });
                                                    } else {
                                                        endCheckoutReviewEdit(row.sourceIndex);
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className='contentLeft'>
                                            <div className='size12 color-yellow mb-5'>Quantity</div>
                                            <input
                                                className='containerDetail color-lite p-5'
                                                type='number'
                                                min='1'
                                                value={row.quantity}
                                                onChange={(e) => updateCheckoutReviewRow(row.sourceIndex, { quantity: e.target.value })}
                                                onFocus={() => beginCheckoutReviewEdit(row.sourceIndex)}
                                                onBlur={() => endCheckoutReviewEdit(row.sourceIndex)}
                                            />
                                        </div>
                                        <div className='contentLeft'>
                                            <div className='size12 color-yellow mb-5'>Purchase Date</div>
                                            <input
                                                className='containerDetail color-lite p-5'
                                                style={{ border: `1px solid ${purchaseMissing ? '#ff6b6b' : '#2ec4b6'}` }}
                                                type='date'
                                                value={row.purchaseDate}
                                                onChange={(e) => updateCheckoutReviewRow(row.sourceIndex, { purchaseDate: e.target.value })}
                                                onFocus={() => beginCheckoutReviewEdit(row.sourceIndex)}
                                                onBlur={() => endCheckoutReviewEdit(row.sourceIndex)}
                                            />
                                        </div>
                                        <div className='contentLeft'>
                                            <div className='size12 color-yellow mb-5'>Expiration</div>
                                            <input
                                                className='containerDetail color-lite p-5'
                                                style={{ border: `1px solid ${expirationMissing ? '#ff6b6b' : '#2ec4b6'}` }}
                                                type='date'
                                                value={row.expiration}
                                                onChange={(e) => updateCheckoutReviewRow(row.sourceIndex, { expiration: e.target.value })}
                                                onFocus={() => beginCheckoutReviewEdit(row.sourceIndex)}
                                                onBlur={() => endCheckoutReviewEdit(row.sourceIndex)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {checkoutReview.notice && (
                        <div className='size14 color-orange mb-10'>{checkoutReview.notice}</div>
                    )}

                    <div
                        className='flexContainer mt-10'
                        style={{
                            gap: '10px',
                            position: 'sticky',
                            bottom: 0,
                            backgroundColor: '#0f172a',
                            padding: '10px 0',
                            borderTop: '1px solid #334155',
                            zIndex: 2
                        }}
                    >
                        <div
                            className='containerDetail flex2Column button bg-red p-10 contentCenter color-yellow'
                            onClick={() => endCheckoutReview('close')}
                        >
                            Cancel
                        </div>
                        <div
                            className='containerDetail flex2Column button p-10 contentCenter color-neogreen'
                            style={{
                                backgroundColor: '#0f9f5f',
                                border: '2px solid #34d399',
                                boxShadow: '0 0 0 2px rgba(52, 211, 153, 0.2)'
                            }}
                            onClick={() => endCheckoutReview('submit')}
                            title='Submit checkout review (Cmd/Ctrl + Enter)'
                        >
                            Complete Checkout ({readyCount}/{checkoutReview.rows.length})
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const totals = <div className='total flexContainer color-lite '>
        <div 
            className='containerDetail flex4Column pt-10 pb-10 pr-15 contentLeft ml--5 mr-5 mt--5 mb--5'
            onClick={() => setCategory('Items Left')}
            title='Items Left'
        >
            <div className='flexContainer'>
                <div className='color-yellow mt--1 mb--10 flex2Column contentRight'>
                    <span className=''>
                        {selectedIcon()}
                    </span>
                </div>
                <div className='flexColumn contentLeft pr-10'>
                    {(selectedCount - status.items)}
                </div>
            </div>
            <div className='flexContainer'>
                <div className='color-yellow mr-5 pl-10 flex2Column contentRight'>
                    Items:
                </div>
                <div className='flexColumn contentLeft pr-10'>
                    {(selectedQuantityTotal - status.totalItems)}
                </div>
            </div>
        </div>
       <div 
            className='containerDetail flex4Column pt-10 pb-10 pr-15 contentLeft mr-5 mt--5 mb--5'
            onClick={() => setCategory('In Cart')}
            title='In Cart'
        >
            <div className='flexContainer'>
                <div className='color-yellow mt--5 mr-10 mb--5 flex2Column contentRight'>
                    <span className=''>
                        {inCartIcon()}
                    </span>
                </div>
                <div className='flexColumn contentLeft pr-10'>
                    {status.items}
                </div>
            </div>
            <div className='flexContainer'>
                <div className='color-yellow mr-5 pl-10 flex2Column contentRight'>
                    Items:
                </div>
                <div className='flexColumn contentLeft pr-10'>
                    {status.totalItems}
                </div>
            </div>
        </div>
        <div className='containerDetail flex4Column pt-10 pb-10 pr-20 mt--5 mb--5'>
            <div className='flexContainer' >
                <div className='color-yellow mr-5 flex2Column contentRight'>
                    Tax:
                </div>
                <div className='pr-5 flexColumn contentLeft'>
                    ${status.taxTotal}
                </div>
            </div>
            <div className='flexContainer' >
                <div className='color-yellow mr-5 flex2Column contentRight'>
                    Total:
                </div>
                <div className='flexColumn pr-5 contentLeft'>
                    ${status.total}
                </div>
            </div>
        </div>
        <div
            onClick={handleCheckout}
            className='containerDetail bg-green button flex4Column ml-5 pt-10 mt--5 mb--5 mr--5 color-yellow brdr-green pb-10 pt-20 noScroll'
            disabled={checkoutDisabled}
            style={{ opacity: checkoutDisabled ? 0.6 : 1, cursor: checkoutDisabled ? 'not-allowed' : 'pointer' }}
        >
            {checkoutNotice ? checkoutNotice : 'Checkout'}
        </div>
    </div>
    const getPriceDialog = () => {
        if (cartEditor.index === null) {
            return null;
        }

        return (
            <PriceEntryDialog
                title={todos[cartEditor.index]?.title || ''}
                initialPriceInput={cartEditor.priceInput}
                initialExpiration={cartEditor.expiration}
                initialDays={cartEditor.days}
                initialMonths={cartEditor.months}
                initialYears={cartEditor.years}
                onSave={(editorState) => saveCartEditor(cartEditor.index, editorState)}
                onClose={closeCartEditor}
                normalizeExpirationDate={normalizeExpirationDate}
                getDaysFromToday={getDaysFromToday}
                getMonthsFromToday={getMonthsFromToday}
                getYearsFromToday={getYearsFromToday}
                getDateFromTodayPlusDays={getDateFromTodayPlusDays}
                getDateFromTodayPlusMonths={getDateFromTodayPlusMonths}
                getDateFromTodayPlusYears={getDateFromTodayPlusYears}
            />
        );
    };
    const getMenuHeight = (status.displaySettings) ? (!!shopFilter) ? 'mt-360' : 'mt-280' : 'mt-850';
    const menuClasses = (!status.displaySettings && !status.displayProductEntry) ? (!!shopFilter) ? 'mt-150' : 'mt-70' : getMenuHeight;
    console.log(`Shop ==> REFRESH
                        displaySettings: ${status.displaySettings}
                        displayProductEntry: ${status.displayProductEntry}
                    `);
    return <div className='mt--7 relative'>
                <div className='input mt-10'>
                    <SearchBar onSubmit={addTodo} onChange={setEntry} label='Search / Add items' term='' />
                    {
                        (status.displaySettings) 
                    ? <div 
                        className='containerDetail bg-dkRed p-10 brdr-red button closeSettings' 
                        onClick={() => toggleSettings()}
                        title='close menu'
                    >
                        ❌
                    </div>
                    : <img
                        title={`${(status.displaySettings) ? 'close' : 'open'} menu`}
                        className='settings'
                        src={menu}
                        alt='open menu'
                        onClick={() => toggleSettings()}
                    />
                    }
                </div>
                <div className={`${menuClasses}`}>
                    {shoppingHistoryOpen ? getShoppingHistoryDisplay() : getItems('display')}
                </div>
                {totals}
                <ProductEntry
                    state={status}
                    updateAisles={updateAisles}
                    save={save}
                    displayProductEntry={status.displayProductEntry}
                    Item={status.search}
                    updateItem={updateItem}
                />
                <div className='containerDetail bg-lite'>
                    <SettingsMenu
                        state={status}
                        aisles={aisles}
                        setAisles={setAisles}
                        updateAisles={updateAisles}
                        sortName={sortName}
                        revert={revert}
                        save={save}
                        restore={restore}
                        getTotal={getTotal}
                        setTax={setTax}
                        clear={clear}
                        setShopFilter={setShopFilter}
                        shopFilter={shopFilter}
                        category={category}
                        setCategory={setCategory}
                        itemMenuDefault={itemMenuDefault}
                        aislesInit={aislesInit}
                        updateCategory={updateCategory}
                        deleteList={deleteList}
                        changeList={changeList}
                        emptyCart={emptyCart}
                        deselectList={deselectList}
                        selectList={selectList}
                        onShowShoppingHistory={showShoppingHistory}
                    />
                </div>
                {getCheckoutReviewDialog()}
                {getPriceDialog()}
            </div>
}
export default List;