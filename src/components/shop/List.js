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

const List = () => {

    const {
        ingredients,
        setIngredients
    } = useContext(IngredientContext);

    const getTodos = () => initializeData('vueTodos', initData);
    const [todos, setTodos] = useState(initializeData('vueTodos', getTodos()));
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
    useEffect(() => {
        localStorage.setItem('vueTodosSaved', JSON.stringify(todos));
        localStorage.setItem('vueTodos', JSON.stringify(todos));
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
    const quantities = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const toggleTax = (index) => {
        const newTodos = [...todos];
        newTodos.forEach(item => {
            if (item.title === todos[index].title) {
                item.tax = !todos[index].tax;
            }
        });
        localStorage.setItem('vueTodos', JSON.stringify(newTodos));
        localStorage.setItem('vueTodosSaved', JSON.stringify(newTodos));
        setStatus(prevState => ({
            ...prevState,
            retrievedData: initializeData('vueTodosSaved', null)
        }));
        setTodos(initializeData('vueTodos', initData))
    };
    const toggleCart = (index) => {
        const newTodos = [...todos];
        if (newTodos[index].cart) {
            newTodos[index].cart = false;
        } else {
            newTodos[index].cart = true;
        }
        setTodos(newTodos);
    };
    const getTaxCheckBox = (todo, index) => {
        if (todo.tax) {
            return <input
                id='tax'
                name='tax'
                className='regular-checkbox button glassy'
                checked type='checkbox'
                onChange={() => toggleTax(index)}
            />
        } else {
            return <input
                id='tax'
                name='tax'
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
        const updatedRetrievedData = initializeData('vueTodosSaved', null);
        let newAisles = aisles || aislesInit;
        if (selectedAisle === 'DELETE') {
            updatedRetrievedData.forEach(item => {
                if (item.title === todos[index].title) {
                    updatedRetrievedData.splice(index, 1);
                }
            })
            localStorage.setItem('vueTodosSaved', JSON.stringify(updatedRetrievedData));
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
            localStorage.setItem('vueTodosSaved', JSON.stringify(updatedRetrievedData));
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
            localStorage.setItem('vueTodosSaved', JSON.stringify(updatedRetrievedData));
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
            localStorage.setItem('vueTodosSaved', JSON.stringify(updatedRetrievedData));
            localStorage.setItem('vueTodos', JSON.stringify(updatedRetrievedData));
            getTotal();
            updateAisles();
        }
        updateAisles();
        setTodos(updatedTodos);
        setStatus(prevState => ({
            ...prevState,
            retrievedData: initializeData('vueTodosSaved', null),
            ogTitle: (selectedAisle === 'EDIT') ? '' : status.ogTitle
        }));
        setAisles(newAisles);
    }
    const getSelectors = (todo, index, aisleColor) => {
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
                        <div className='lastPurchaseDays flex1Auto contentCenter'>{todo.days}</div>
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
    const daItem = (todo, index) => {
        const shopNavClasses = () => (todo.select) ? 'itemRemove box-highlight' : 'itemRemove box-top';
        const titleClasses = () => (todo.select) ? 'title white' : 'title';
        const aisleColor = getColor(todo.aisle);
        if (validate(todo) !== null) {
            return (
                <div key={getKey(todos[index].title)} className='pt-5 ml-5 mr-5 scroll'>
                    <div
                        title={todos[index].title}
                        className={`r-10-t bg-tinted ${shopNavClasses()}`}
                        onClick={() => toggleSelect(index)}
                    >
                        <span className={`${titleClasses()}`}>{todos[index].title}</span>
                        {getSelectIcon(index)}
                    </div>
                    {getSelectors(todo, index, aisleColor)}
                </div>
            )
        } else {
            return (
                <div key={getKey(todos[index].title)}>
                    <div className='height1px' style={{ backgroundColor: aisleColor }}></div>
                    <div
                        title={todos[index].title}
                        className={shopNavClasses()}
                        onClick={() => toggleSelect(index)}
                    >
                        <span className={titleClasses()}>{todos[index].title}</span>
                        {getSelectIcon(index)}
                    </div>
                    {getSelectors(todo, index, aisleColor)}
                </div>
            )
        }
    }
    const getItems = (context) => {
        const newAisles = (validate(aisles) !== null) ? aisles : aislesInit;
        const pushNewAisle = (aisle) => (newAisles.indexOf(aisle) > -1) ? '' : newAisles.push(aisle);

        const newList = todos.map((todo) => {
            const display = todo.title.toLowerCase().includes(status.search.toLowerCase()) && (category === '' || todo.aisle === category);
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
            return <div className='height--220'>
                {itemsDisplay()}
            </div>
        } else if (context === 'effect') {
            setAisles(newAisles);
        }
        localStorage.setItem('vueTodos', JSON.stringify(newList));
    };
    useEffect(() => {
        //alert(`shopFilter: ${shopFilter} !!shopFilter: ${!!shopFilter}`);
        if (shopFilter !== undefined) {
            localStorage.setItem('shopFilter', shopFilter);
        }
    }, [shopFilter]);
    useEffect(() => {
        setCategory(initializeData('shopCategory', ''));
        const filter = localStorage.getItem('shopFilter');
        //alert(`display filter: ${filter} localStorage.getItem('shopFilter'): ${localStorage.getItem('shopFilter')}`);
        setShopFilter(filter);
        updateAisles();
    }, []);
    useEffect(() => {
        const isIngredient = (item) => {
            if (!ingredients) {
                return false;
            }
            return ingredients.some((ingredient) => (item.toLowerCase() === String(ingredient.split(' ')[0]).toLowerCase()) ? true : false);
        };

        const updatedTodos = todos.map((item) => {
            if (isIngredient(item.title)) {
                return { ...item, select: true };
            }
            return item;
        });

        if (ingredients) {
            const newIngredients = ingredients.filter((item) => {
                return todos.some((ingredient) =>
                    ingredient.title.toLowerCase().includes(String(item.split(' ')[0]).toLowerCase())
                );
            });
            console.log(`newIngredients: ${JSON.stringify(newIngredients, null, 2)}`);

            newIngredients.forEach((ingredient) => {
                if (!updatedTodos.some((todo) => todo.title === ingredient)) {
                    updatedTodos.push({
                        title: ingredient,
                        aisle: 'Recipes',
                        price: '0.00',
                        quantity: 1,
                        tax: false,
                        cart: false,
                        select: true,
                        lastPurchase: '2024-12-01T23:25:07.437Z',
                        days: 0,
                        display: false,
                    });
                }
            });
        }

        setTodos(updatedTodos);
    }, [ingredients]);
    useEffect(() => {
        console.log(`Shop ==> useEffect category: ${category}`);
        localStorage.setItem('shopCategory', category);
    }, [category]);
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
                cart: true,
                select: true,
                lastPurchase: today,
                days: 0
            };
            updatedTodos.push(newItem);
            updatedRetrievedData.push(newItem);
            localStorage.setItem('vueTodos', JSON.stringify(updatedRetrievedData));
            const localVueTodosSaved = initializeData('vueTodosSaved', null);
            if (!localVueTodosSaved) {
                localStorage.setItem('vueTodosSaved', JSON.stringify(updatedTodos));
            } else {
                updatedRetrievedData = initializeData('vueTodosSaved', null);
                updatedRetrievedData.push(newItem);
                localStorage.setItem('vueTodosSaved', JSON.stringify(updatedRetrievedData));
            }
            const newTodos = initializeData('vueTodosSaved', null);
            const newRetrievedData = initializeData('vueTodosSaved', initializeData('vueTodos', null));
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
        setTodos(initializeData('vueTodos', initData));
        updateAisles();
    };
    const revert = () => {
        const revertData = initializeData(
            'vueTodosRevert',
            initializeData('vueTodosSaved', null)
        );
        localStorage.setItem('vueTodos', JSON.stringify(revertData));
        setStatus(prevState => ({
            ...prevState,
            retrievedData: revertData,
            displaySettings: false,
            displayProductEntry: false
        }));
        setTodos(revertData);
    };
    const save = () => {
        localStorage.setItem('vueTodosSaved', JSON.stringify(todos));
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
            retrievedData: initializeData('vueTodosSaved', null),
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
            setCategory('all');
        }
    };
    const changeList = () => {
        localStorage.setItem('vueTodosRevert', JSON.stringify(todos));
        const newCategory = window.prompt('Enter new category:', '');
        const ok = window.confirm(`changeing all => ${category} to ${newCategory}`);
        if (ok) {
            const newTodos = [...todos];
            newTodos.map(todo => {
                if (todo.aisle === category) {
                    todo.aisle = newCategory;
                }
            });
            setTodos(newTodos);
            if (category === 'Recipes') {
                setIngredients([]);
            }
        }
    };
    const emptyCart = () => {
        localStorage.setItem('vueTodosRevert', JSON.stringify(todos));
        const newTodos = [...todos];
        newTodos.map(todo => {
            todo.cart = false;
        });
        setTodos(newTodos);
        if (category === 'Recipes') {
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
    const totals = <div className='total '>
        <div className='totalItems'>
            Items: {status.items}<br />
            total: {status.totalItems}
        </div>
        <div className='totalDollars'>
            Tax: $ {status.taxTotal}<br />
            Total: $ {status.total}
        </div>
    </div>
    const getMenuHeight = (status.displaySettings) ? (!!shopFilter) ? 'mt-360' : 'mt-280' : 'mt-850';
    const menuClasses = (!status.displaySettings && !status.displayProductEntry) ? (!!shopFilter) ? 'mt-150' : 'mt-70' : getMenuHeight;
    console.log(`Shop ==> REFRESH
                        displaySettings: ${status.displaySettings}
                        displayProductEntry: ${status.displayProductEntry}
                    `);
    return <div className='mt--7 relative'>
                <div className='input'>
                    <SearchBar onSubmit={addTodo} onChange={setEntry} label='Search / Add items' term='' />
                    <img
                        title={`${(status.displaySettings) ? 'close' : 'open'} menu`}
                        className='settings'
                        src={menu}
                        alt='open menu'
                        onClick={() => toggleSettings()}
                    />
                </div>
                <div className={`${menuClasses}`}>
                    {getItems('display')}
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
                />
            </div>
}
export default List;