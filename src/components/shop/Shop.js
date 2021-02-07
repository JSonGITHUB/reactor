import React, { useState, useEffect } from 'react';
import getKey from '../utils/KeyGenerator.js';
import debounceType from '../utils/DebouncerType.js';
import menu from '../../assets/images/menuYellow.png';
import Selected from '../../assets/images/cart.png';
import Select from '../../assets/images/addToCart.png';
import InCart from '../../assets/images/inCart.png';
import PutInCart from '../../assets/images/putInCart.png';
import Selector from '../forms/FunctionalSelector.js';
import '../../assets/css/shop.css';

const Shop = () => {
    console.log(`Shop til you drop!!!`);
    const today = new Date();
    const initData = [
        {
            "title": "Tent",
            "aisle": "Baja",
            "price": "60.00",
            "quantity": "1",
            "tax": false,
            "cart": false,
            "select": false,
            "lastPurchase": "",
            "days": 0
        }
    ];
    const itemMenuDefault = ['', 'ADD INDEX', 'EDIT', 'PRICE', 'DELETE'];
    const quantities = [0,1,2,3,4,5,6,7,8,9,10];
    const settings = [
        'Sort by Name',
        'Font Size',
        'Tax',
        'Save', 
        'Restore',
        'Export',
        'Clear', 
        'Undo'
    ];
    let newItem = {
        title: '', 
        aisle: '', 
        price: '', 
        quantity: 1, 
        tax: false, 
        cart: false, 
        select: false, 
        lastPurchase: '', 
        days: 0
    };
    const getTodos = () => {
        const newTodos = (localStorage.getItem('vueTodos')) ? JSON.parse(localStorage.getItem('vueTodos')) : initData;
        return newTodos;
    }
    const getLocalAisles = () => {
        const aisles = localStorage.getItem('aisles').split(',');
    }
    const aislesInit = ['Vons', 'Sprouts', 'Smart and Final'];
    const getAisles = () => (localStorage.getItem('aisles') !== undefined) ? JSON.parse(localStorage.getItem('aisles')) : aislesInit;
    const pad = (n, width, z) => {
        //pad(10, 4) => 0010
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
      }
    const getColors = (aisles) => {
        const colors = [];
        let aisleColor = '';
        aisles = (aisles !== undefined) ? aisles : aislesInit;
        aisles.forEach(aisle => {
            aisleColor = Math.floor(Math.random()*16777215).toString(16).toUpperCase();
            aisleColor = pad(aisleColor, 6);
            console.log(`getColors => \naisleColor: ${aisleColor}\naisleColorLength: ${aisleColor.length}`)
            colors.push(`#${aisleColor}`);
        });
        console.log(`getColors => colors: ${colors}`)
        return colors;
    }
    const [ status, setStatus ] = useState({
        displaySettings: false,
        list: <div></div>,
        fontSize: 25,
        tax: 8.75,
        todos: getTodos(),
        aisles: getAisles(),
        colors: getColors(getAisles()),
        retrievedData: getTodos(),
        itemEntry: '',
        ogTitle: '',
        newTodoText: '',
        total: 0, 
        taxTotal: 0, 
        items: 0, 
        totalItems: 0
    });
    console.log(`todos: ${JSON.stringify(status.todos, null, 2)}`)
    localStorage.setItem('vueTodosSaved', JSON.stringify(status.todos));
    localStorage.setItem('vueTodos', JSON.stringify(status.todos));
    //console.log(`vueTodosSaved(1): ${JSON.stringify(JSON.parse(localStorage.getItem('vueTodosSaved')),null,2)}`);
    const aisleIndex = (aisle) => (status.aisles === undefined) ? 0 : status.aisles.indexOf(aisle);
    const getColor = (aisle) => {
        const index = aisleIndex(aisle);
        console.log(`getColor => \nindex: ${index}\naisle: ${aisle}\ncolors: ${status.colors}\ncolor: ${status.colors[aisleIndex(aisle)]}`)
        return status.colors[aisleIndex(aisle)];
    }
    const daItem = (todo, index) => {
        //console.log(`daItem =>\ntodo: ${JSON.stringify(todo, null, 2)}\nindex: ${index}`);
        const getTaxCheckBox = () => {
           if (todo.tax) {
            return <input className='regular-checkbox button' checked type='checkbox' id='tax' onChange={() => toggleTax(index)} />
           } else {
            return <input className='regular-checkbox button' type='checkbox' id='tax' onChange={() => toggleTax(index)} />
           }
        }
        return (
            <div>
                <div className='itemRemove' onClick={() => toggleSelect(index)}>
                    <span className='title'>{ status.todos[index].title }</span>
                    {getSelectIcon(index)}
                </div>
                {/*console.log(`color: ${getColor(todo.aisle)}`)*/}
                <div className='itemSelectors' style={{backgroundColor: getColor(todo.aisle)}}>
                    <div className='flex-container'>
                        <div>
                            <div className='button'>
                                {getInCartButton(index)}
                            </div>
                            <div className='size25 m-10'> 
                                { todo.price }
                            </div>
                        </div>
                        <div>
                            <div>Days</div>
                            <div className='lastPurchaseDays'>{todo.days}</div>
                        </div>
                        <div className='mb-5'>
                            <div className='mb-5'>Tax</div>
                            {getTaxCheckBox()}
                        </div>
                        <div>
                            <div className='mb-5 button'>Count</div> 
                            <Selector
                                groupTitle='Count'
                                //selected={todo.quantity} 
                                selected={status.todos[index].quantity} 
                                label={index}
                                items={quantities}
                                onChange={updateQuantity}
                            />
                        </div>
                        <div id='aisle'>
                        <div className='mb-5'>Aisle</div>
                            <Selector
                                groupTitle='Aisle'
                                selected={todo.aisle} 
                                label={index} 
                                items={itemMenuDefault.concat(status.aisles) || itemMenuDefault.concat(aislesInit)}
                                onChange={reIndex}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    const getItems = (context) => {
        const newAisles = (status.aisles !== undefined) ? status.aisles : aislesInit;
        let newList = <div></div>;
        //console.log(`daList => todos: ${JSON.stringify(status.todos, null,2)}`);
        const pushNewAisle = (aisle) => (newAisles.indexOf(aisle) > -1) ? '' : newAisles.push(aisle);
        status.todos.forEach((todo,index) => {
            pushNewAisle(todo.aisle);
            //console.log(`daList =>\nnewAisles: ${newAisles}\nquantities: ${todo.quantity}\ntitle: ${todo.title}\ndays: ${todo.days}\nprice: ${todo.price}\ntax: ${todo.tax}\nquantity: ${todo.quantity}`)
            newList = <div>
                    {newList}
                    {daItem(todo, index)}
                </div>;
        })
        //console.log(`daList => newList: ${JSON.stringify(newList,null,2)}`)
        localStorage.setItem('aisles', JSON.stringify(newAisles));
        if (context === 'display') {
            return newList;
        } else if (context === 'effect') {
            //console.log(`useEffect => newAisles: ${newAisles}`)
            setStatus(prevState => ({
                ...prevState,
                list: newList,
                aisles: newAisles
            }));
        }
    };
    
    useEffect(() => {
        getItems('effect');
        getTotal();
    },[status.todos]);

    const sortArray = (array) => {
        const alphabetic = [];
        const numeric = [];
        let n=0;
        array.forEach(item => {
            if (Number(item.substring(0,1)) > 0) {
                numeric.push(item);
            } else {
                alphabetic.push(item);
            }
        });
        alphabetic.sort();
        numeric.sort(function(a, b){return a - b});
        array = [];
        alphabetic.forEach(item => {
            if (array.indexOf(item) < 0){
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
        let updatedTodos = status.todos;
        let updatesItems = 0;
        let updatedTotalItems = 0;
        updatedTodos.forEach(item => {
            if (typeof item.price !== 'undefined' && item.cart) {
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
        //localStorage.setItem('vueTodos', JSON.stringify(status.todos));
        newTotal = Math.round( newTotal * 100 ) / 100;
        newTotal = newTotal.toFixed(2);
        newTaxTotal = newTaxTotal.toFixed(2)
        setStatus(prevState => ({
            ...prevState,
            totalItems: updatedTotalItems,
            items: updatesItems,
            total: newTotal,
            taxTotal: newTaxTotal,
            //tax: newTax
        }));
    };
    const updatePrice = () => {
        const updatedTodos = status.todos;
        updatedTodos.forEach(item => {
            if (typeof item.price === 'undefined') {
                item.price = Number(0).toFixed(2);
            }
        });
        setStatus(prevState => ({
            ...prevState,
            todos: updatedTodos
        }));
        getTotal();
    };
    const updateAisles = () => {
        let aisleColor;
        let colors = [];
        let todoSort = [];
        let inactiveTodos = [];
        let newAisles = status.aisles;
        const updatedTodos = status.todos;
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
        console.log(`updateAisles => !!!!!!!!!!\ntodoSort: ${todoSort}\ninactiveTodos: ${inactiveTodos}`)
        inactiveTodos.forEach(todo => todoSort.push(todo));
        setStatus(prevState => ({
            ...prevState,
            todos: (settings[0] === 'Sort by Name') ? todoSort : todoSort,
            aisles: newAisles,
            colors: colors
        }));
    };
    const setEntry = (e) => {
        const entry = e.target.value
        console.log(`setEntry ${entry}`);
        setStatus(prevState => ({
            ...prevState,
            itemEntry: entry
        }));
    }
    const addTodo = (e) => {
        e.preventDefault();
        console.log(`addTodo ${status.itemEntry}`);
        const updatedTodos = status.todos;
        let updatedRetrievedData = status.retrievedData;
        const updatedAisles = status.aisles;
        let newPriceUpdate = 0;
        if (status.itemEntry) {
            const newAisle = prompt('Enter aisle number:', '');
            if (updatedAisles.indexOf(newAisle) < 0) {
                updatedAisles.push(newAisle);
            }
            newPriceUpdate = prompt('Enter price:', '');
            newItem = {
                title: status.itemEntry, 
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
            if (!localStorage.getItem('vueTodosSaved')) {
                localStorage.setItem('vueTodosSaved', JSON.stringify(updatedTodos));
                console.log(`vueTodosSaved(2): ${JSON.stringify(JSON.parse(localStorage.getItem('vueTodosSaved')),null,2)}`);                
            } else {
                updatedRetrievedData = JSON.parse(localStorage.getItem('vueTodosSaved'));
                updatedRetrievedData.push(newItem);
                localStorage.setItem('vueTodosSaved', JSON.stringify(updatedRetrievedData));
                console.log(`vueTodosSaved(3): ${JSON.stringify(JSON.parse(localStorage.getItem('vueTodosSaved')),null,2)}`);
            }
            const newTodos = JSON.parse(localStorage.getItem('vueTodosSaved'));
            const newRetrievedData = (localStorage.getItem('vueTodosSaved')) ? JSON.parse(localStorage.getItem('vueTodosSaved')) : JSON.parse(localStorage.getItem('vueTodos'))
            setStatus(prevState => ({
                ...prevState,
                newTodoText: status.itemEntry,
                aisles: updatedAisles,
                retrievedData: newRetrievedData,
                todos: newTodos,
            }));
            //updateAisles();
            //setNewTodoText('');
            getTotal();
            //setItemEntry('');
        }
    };
    const toggleCart = (index) => {
        const newTodos = status.todos;
        if (newTodos[index].cart) {
            newTodos[index].cart = false;
        } else {
            newTodos[index].cart = true;
        }
        setStatus(prevState => ({
            ...prevState,
            todos: newTodos
        }));
        getTotal();
    };
    const toggleSettings = () => {
        console.log(`toggleSettings => displaySettings: ${status.displaySettings}`)
        setStatus(prevState => ({
            ...prevState,
            displaySettings: !status.displaySettings
        }));
    };
    const reIndex = (groupTitle, index, selectedAisle) => {
        console.log(`REINDEX => \nselectedAisle: ${selectedAisle}\nindex: ${index}`);
        const updatedTodos = status.todos;
        const updatedRetrievedData = JSON.parse(localStorage.getItem('vueTodosSaved'));
        let newAisles = status.aisles;   
        if (selectedAisle === 'DELETE') {
            updatedRetrievedData.forEach(item => {
                if (item.title === status.todos[index].title) {
                    updatedRetrievedData.splice(index, 1);
                }
            })
            localStorage.setItem('vueTodosSaved', JSON.stringify(updatedRetrievedData));
            console.log(`vueTodosSaved(4): ${JSON.stringify(JSON.parse(localStorage.getItem('vueTodosSaved')),null,2)}`)
            updatedTodos.splice(index, 1);
        } else if (selectedAisle === 'PRICE') {
            updatedTodos[index].price = Number(prompt('Enter price:', '')).toFixed(2);
            updatedRetrievedData.forEach(item => {
                if (item.title === updatedTodos[index].title) {
                    item.price = updatedTodos[index].price;
                    updatedTodos[index].aisle = item.aisle;
                };
            });
            localStorage.setItem('vueTodosSaved', JSON.stringify(updatedRetrievedData));
            console.log(`vueTodosSaved(5): ${JSON.stringify(JSON.parse(localStorage.getItem('vueTodosSaved')))}`);
        } else if (selectedAisle === 'EDIT') {
            let updatedOgTitle = status.ogTitle;
            updatedOgTitle = updatedTodos[index].title;
            updatedTodos[index].title = prompt('Enter new label:', updatedTodos[index].title);
            updatedRetrievedData.forEach(item => {
                if (item.title === updatedOgTitle) {
                    item.title = updatedTodos[index].title;
                    selectedAisle = item.aisle;
                };
            });
            updatedTodos[index].aisle = selectedAisle;
            //updateAisles();
            localStorage.setItem('vueTodosSaved', JSON.stringify(updatedRetrievedData));
            console.log(`vueTodosSaved(6): ${JSON.stringify(JSON.parse(localStorage.getItem('vueTodosSaved')),null,2)}`)
        } else {
            newAisles = status.aisles;
            if (selectedAisle === 'ADD INDEX') {
                selectedAisle = prompt('Enter aisle number:', '');
                if(newAisles.indexOf(selectedAisle) < 0){
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
            console.log(`vueTodosSaved(7): ${JSON.stringify(JSON.parse(localStorage.getItem('vueTodosSaved')),null,2)}`)
            getTotal();
            updateAisles(); 
            //window.location.pathname = "/reactor/Shop";
        }
        updateAisles();
        localStorage.setItem('vueTodos', JSON.stringify(updatedTodos));
        setStatus(prevState => ({
            ...prevState,
            todos: updatedTodos,
            aisles: newAisles,
            retrievedData: JSON.parse(localStorage.getItem('vueTodosSaved')),
            ogTitle: (selectedAisle === 'EDIT') ? '' : status.ogTitle
        }));

    };
    const getSetting = (index) => {
        if (settings[index] === 'Clear') {
            clear();
        } else if (settings[index] === 'Sort by Name') {
            sortName();
            settings.splice(0, 1, 'Sort by Index');
        } else if (settings[index] === 'Sort by Index') {
            settings.splice(0, 1, 'Sort by Name');
            updateAisles();
        } else if (settings[index] === 'Tax') {
            let newTax = prompt('Enter sales tax', status.tax);
            localStorage.setItem('tax', newTax);
            setStatus(prevState => ({
                ...prevState,
                tax: localStorage.getItem('tax')
            }));
            getTotal();
        } else if (settings[index] === 'Font Size') {
            const newFontSize = prompt('Enter font size', status.fontSize);
            localStorage.setItem('fontSize', newFontSize);
        } else if (settings[index] === 'Undo') {
            revert();
        } else if (settings[index] === 'Save') {
            save();
        } else if (settings[index] === 'Restore') {
            restore();
        } else if (settings[index] === 'Export') {
            console.log(JSON.stringify(status.todos));
        }
        toggleSettings();
    };
    const clear = () => {
        localStorage.setItem('vueTodosRevert', JSON.stringify(status.todos));
        localStorage.removeItem('aisles', '');
        localStorage.removeItem('vueTodos', '');
        setStatus(prevState => ({
            ...prevState,
            todos: [],
            aisles: []
        }));
        
        getTotal();
    };
    const sortName = () => {
        let aisleColor;
        let todoSort = [];
        let inactiveTodos = [];
        let sortedTodos = status.todos;
        sortedTodos.sort(function(a, b){
            let x = a.title.toLowerCase();
            let y = b.title.toLowerCase();
            if (x < y) {return -1;}
            if (x > y) {return 1;}
            return 0;
        });
        setStatus(prevState => ({
            ...prevState,
            todos: sortedTodos
        }));
    };
    const updateQuantity = (groupTitle, id, selected) => {
        console.log(`updateQuantity =>\ngroupTitle: ${groupTitle}\n, \nindex: ${id}, \nselected: ${selected}`);
        const updatedTodos = status.todos;
        updatedTodos.forEach((item, index) => {
            if (id === index) {
                item.quantity = Number(selected);
            } else if (typeof item.quantity === 'undefined') {
                item.quantity = quantities[1];
            }
        });
        setStatus(prevState => ({
            ...prevState,
            todos: updatedTodos
        }));
        window.location.pathname = "/reactor/Shop";
    
    };
    const updateSelect = () => {
        const updatedTodos = status.todos;
        updatedTodos.forEach(item => {
            item.select = false;
        });
        setStatus(prevState => ({
            ...prevState,
            todos: updatedTodos
        }));
    };
    const getDaysSincePurchase = (index) => {
        let lastPurchase = new Date(status.todos[index].lastPurchase);
        let todoPurchase = new Date(lastPurchase.getFullYear(), lastPurchase.getMonth(), lastPurchase.getDate()); 
        let one_day=1000*60*60*24;    // Convert both dates to milliseconds
        let date1_ms = todoPurchase.getTime();   
        let date2_ms = today.getTime();    // Calculate the difference in milliseconds  
        let difference_ms = date2_ms - date1_ms;        // Convert back to days and return   
        return Math.round(difference_ms/one_day);
    };
    const updateLastPurchase = () => {
        const updatedTodos = status.todos;
        updatedTodos.forEach((item,index) => {
            if (typeof item.lastPurchase === 'undefined') {
                item.lastPurchase = today;
                item.days = 0;
            } else {
                item.days = getDaysSincePurchase(index);
            }
        });
        setStatus(prevState => ({
            ...prevState,
            todos: updatedTodos
        }));
    };
    const toggleTax = (index) => {          
        const newTodos = status.todos;   
        newTodos.map(item => {
            if (item.title === status.todos[index].title) {
                item.tax = !status.todos[index].tax;
            }
        });
        localStorage.setItem('vueTodos', JSON.stringify(newTodos));
        localStorage.setItem('vueTodosSaved', JSON.stringify(newTodos));
        console.log(`vueTodosSaved(8): ${JSON.stringify(JSON.parse(localStorage.getItem('vueTodosSaved')),null,2)}`)
        setStatus(prevState => ({
            ...prevState,
            todos: JSON.parse(localStorage.getItem('vueTodos')),
            retrievedData: JSON.parse(localStorage.getItem('vueTodosSaved'))
        }));
        getTotal();
    };
    const toggleSelect = (id) => { 
        const updatedTodos = status.todos; 
        updatedTodos.map((item, index) => {
            if (item.title === updatedTodos[id].title) {
                if (updatedTodos[id].select) {
                    updatedTodos[index].select = false;
                } else {
                    updatedTodos[index].lastPurchase = today;
                    updatedTodos[index].days = 1;
                    updatedTodos[index].select = true;
                }
            }
        });       
        localStorage.setItem('vueTodos', JSON.stringify(updatedTodos));
        setStatus(prevState => ({
            ...prevState,
            todos: JSON.parse(localStorage.getItem('vueTodos'))
        }));
        getTotal();
        updateAisles();   
    };
    const updateTax = () => {
        const updatedTodos = status.todos;
        updatedTodos.forEach(todo => {
            if (typeof todo.tax === 'undefined') {
                todo.tax = false;
            }
        });
        setStatus(prevState => ({
            ...prevState,
            todos: updatedTodos
        }));
    };
    const updateCart = () => {
        const updatedTodos = status.todos;
        updatedTodos.forEach(todo => {
            if (typeof todo.cart === 'undefined') {
                todo.cart = false;
            }
        });
        setStatus(prevState => ({
            ...prevState,
            todos: updatedTodos
        }));
    };
    const revert = () => {
        const revertData = JSON.parse(localStorage.getItem('vueTodosRevert'));
        console.log(`revertData: ${JSON.stringify(revertData, null, 2)}`)
        localStorage.setItem('vueTodos', JSON.stringify(revertData));
        setStatus(prevState => ({
            ...prevState,
            todos: revertData,
            retrievedData: revertData
        }));
        //itemMenuDefault.forEach(aisle => newAisles.push(aisle));
        //setAisles(newAisles);
        //updateAisles();
        getTotal();
    };
    const save = () => {
        localStorage.setItem('vueTodosSaved', JSON.stringify(status.todos));
        console.log(`vueTodosSaved(9): ${JSON.stringify(JSON.parse(localStorage.getItem('vueTodosSaved')),null,2)}`)
    };
    const restore = () => {
        const newAisles = status.aisles;
        itemMenuDefault.forEach(aisle => newAisles.push(aisle));
        updateAisles();
        localStorage.setItem('vueTodos', JSON.stringify(status.retrievedData));
        setStatus(prevState => ({
            ...prevState,
            todos: status.retrievedData,
            aisles: newAisles,
            retrievedData: JSON.parse(localStorage.getItem('vueTodosSaved')),
        }));        
    };
    const getInCartButton = (index) => <img 
                                        className='inCartIcon' 
                                        alt='in cart' 
                                        src={(status.todos[index].cart) ? InCart : PutInCart} 
                                        onClick={() => toggleCart(index)}
                                    />
    
    const getSelectIcon = (index) => <img 
                                        className='cart' 
                                        alt='select' 
                                        src={(status.todos[index].select) ? Selected : Select}
                                        />
    const getSettingsMenu = () => {
        const settingsMenu = <div id='settingsMenu' className='bg-dark'>
                {
                    settings.map((item, index) => {
                        return (
                            <div className='settingsButton' onClick={() => getSetting(index)}>
                                { settings[index] }
                            </div>  
                        )
                    })
                }
            </div>
        
        if (status.displaySettings) {
            return settingsMenu
        }
        const index = 0;
        return <div></div>
    }
    return (
        <div>
            <div className='input'>
                <form onSubmit={addTodo}>
                    <input type='text' id='itemEntry' className='inputItem' onChange={setEntry} placeholder='Add items'/>
                    <img className='settings' src={menu} alt="open menu" onClick={() => toggleSettings()}/>
                </form>
            </div>
            <div className='mt-40 visible'>
                {
                    //status.list
                    getItems('display')
                }
            </div>
            <div className='total '>
                <div className='totalItems'>
                    Items: { status.items }<br />
                    total: { status.totalItems }
                </div>
                <div className='totalDollars'>
                    Tax: $ { status.taxTotal }<br />
                    Total: $ { status.total }
                </div>
            </div>
            {getSettingsMenu()}
        </div>
    )
}

export default Shop;