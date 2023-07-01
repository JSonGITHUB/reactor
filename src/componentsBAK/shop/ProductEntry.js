import React, { useState, useEffect } from 'react';
import getKey from '../utils/KeyGenerator.js';
import debounceType from '../utils/DebouncerType.js';
import Selector from '../forms/FunctionalSelector.js';
import CurrencyInput from 'react-currency-input-field';

const ProductEntry = ({ state, updateAisles, save, displayProductEntry}) => {

    console.log(`searchItem: ${state.search}`)

    const listItems = [
        'Item',
        'Aisle',
        'Price',
        'Save'
    ];
    const [Price, setPrice] = useState('');
    const [debouncedPrice, setDebouncedPrice] = useState(Price);
    const [Item, setItem] = useState(state.item);
    console.log(`ProductEntry => search: ${state.search} - Item: ${Item}`);
    const handleSubmit = (event) => {
        event.preventDefault();
        // Do something with the collected price
        console.log(Price);
    };
    
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedPrice(Price);
        }, 1000);

        return () => {
            clearTimeout(timerId);
        };
       debounceType(setDebouncedPrice, Price);
    }, [Price]);

    const initState = () => {
       
        //const newState = state;
        //newState.listItems = listItems;
        const initAdd = {
            listItems: [...listItems] // make a copy of the listItems array
        }
        listItems.map((item, index) => {
            const propName = listItems[index];
            const propValue = (listItems[index] === 'Aisle') ? 'Smart and Final' : (listItems[index] === 'Item') ? state.search : state.search;
            initAdd[propName] = propValue;
        })
        initAdd["displayProductEntry"] = displayProductEntry;
        const newState = { ...state, ...initAdd };
        return newState;
    }

    const [status, setStatus] = useState(initState());
    
    console.log(`status => search: ${initState().search}`)

    console.log('-----=======>>>>>>>  status: ', status);

    const getSetting = (index) => {
        if (status.listItems[index] === 'Save') {
            save();
        } else if (status.listItems[index] === 'Price') {

        }
        //displayProductEntry = displayProductEntry
        /*
        setStatus(prevState => ({
            ...prevState,
            listItems: listItems,
            displayProductEntry: displayProductEntry
        }));
        */
    };
    const setDisplay = (display) => {
        setStatus(prevState => ({
            ...prevState,
            Price: display
        }))
        console.log('setDisplay: ', display);
        /*
        setStatus(prevState => ({
            ...prevState,
            displayProductEntry: displayProductEntry
        }))
        */
    };

    const getInputField = (index) => {
        const itemEntry = () => {
            const item = initState().search;
            console.log('setItem: ', item);
            setStatus(prevState => ({
                ...prevState,
                Item: item,
                item: item,
                search: item
            }))
        };
        const setAisle = (groupTitle, label, selected) => {
            console.log('setAisle: ', selected);
            setStatus(prevState => ({
                ...prevState,
                Aisle: selected
            }))
        };
        const setThePrice = (value) => {
            console.log('setThePrice: ', value);
            setStatus(prevState => ({
                ...prevState,
                Price: value
            }))
        };
        if (listItems[index] === "Price") {
            return <CurrencyInput
                        id="price"
                        name="price"
                        placeholder="enter price..."
                        defaultValue={state.price}
                        decimalsLimit={2}
                        //onValueChange={(value, name) => setThePrice(value)}
                        onValueChange={setPrice}
                    />
        } else if (listItems[index] === "Item") {
            return <div className='m-20'>
                        <form onSubmit={itemEntry}>
                            <input
                                className='p-10 r-5 bg-dark white size25 glassy width-100-percent'
                                type="text"
                                value={initState().search}
                                placeholder={'item...'}
                                onChange={itemEntry}
                            />
                        </form>
                    </div>
        } else if (listItems[index] === "Aisle") {
            return <Selector
                    groupTitle={`Aisles`} 
                    selected={status.Aisle} 
                    label='Aisles' 
                    items={status.aisles}
                    onChange={setAisle}
                    fontSize='20'
                    padding='5px'
                    width='70%'
                />
        }
        return <button>Add</button>

    }
    
    
    const productEntry = <div id='settingsMenu' className='bg-dark'>
            {
                status.listItems.map((item, index) => {
                    return (
                        <div 
                            key={getKey(status.listItems[index])} 
                            className='productButton' 
                            onClick={() => getSetting(index)}
                        >
                            { listItems[index] }: {getInputField(index)}
                            
                        </div>
                    )
                })
            }
        </div>
    console.log('displayProductEntry1: ', displayProductEntry);
    if (displayProductEntry === true) {
        console.log('displayProductEntry2: ', displayProductEntry);
        return productEntry
    }
    return <React.Fragment></React.Fragment>
}

export default ProductEntry