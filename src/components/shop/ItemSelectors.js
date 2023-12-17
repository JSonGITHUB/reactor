import React from 'react';
import { connect } from 'react-redux';
import InCart from '../../assets/images/inCart.png';
import PutInCart from '../../assets/images/putInCart.png';
import Selector from '../forms/FunctionalSelector.js';
const ItemSelectors = ({status, setStatus, index, getTotal, todo, aisleColor, itemMenuDefault, updateAisles, aislesInit}) => {
    if (todo === undefined) {
        todo = {
          title: "Petmate portion right",
          aisle: "pet smart",
          price: "0.00",
          quantity: 1,
          tax: false,
          cart: false,
          select: false,
          lastPurchase: "2020-09-29T19:38:14.408Z",
          days: 144,
          color: "#35468f"
        }
    }
    const getInCartButton = (index) => {
        console.log(`getInCartButton =>\nindex: ${index}\ntodo: ${JSON.stringify(todo,null,2)}`)
        return (
            <img 
                className='inCartIcon' 
                alt='in cart' 
                src={(todo.cart) ? InCart : PutInCart} 
                onClick={() => toggleCart(index)}
            />
        )
    }
    const quantities = [0,1,2,3,4,5,6,7,8,9,10];
    const toggleTax = (index) => {          
        const newTodos = status.todos;   
        newTodos.forEach(item => {
            if (item.title === status.todos[index].title) {
                item.tax = !status.todos[index].tax;
            }
        });
        localStorage.setItem('vueTodos', JSON.stringify(newTodos));
        localStorage.setItem('vueTodosSaved', JSON.stringify(newTodos));
        //console.log(`vueTodosSaved(8): ${JSON.stringify(JSON.parse(localStorage.getItem('vueTodosSaved')),null,2)}`)
        setStatus(prevState => ({
            ...prevState,
            todos: JSON.parse(localStorage.getItem('vueTodos')),
            retrievedData: JSON.parse(localStorage.getItem('vueTodosSaved'))
        }));
        getTotal();
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
    const getTaxCheckBox = () => {
        if (todo.tax) {
            return <input className='regular-checkbox button glassy' checked type='checkbox' id='tax' onChange={() => toggleTax(index)} />
        } else {
            return <input className='regular-checkbox button glassy' type='checkbox' id='tax' onChange={() => toggleTax(index)} />
        }
    }
    const updateQuantity = (groupTitle, id, selected) => {
        //console.log(`updateQuantity =>\ngroupTitle: ${groupTitle}\n, \nindex: ${id}, \nselected: ${selected}`);
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
        getTotal();
        //window.location.pathname = "/reactor/Shop";
    
    };
    const reIndex = (groupTitle, index, selectedAisle) => {
        //console.log(`REINDEX => \nselectedAisle: ${selectedAisle}\nindex: ${index}`);
        const updatedTodos = status.todos;
        const updatedRetrievedData = JSON.parse(localStorage.getItem('vueTodosSaved'));
        let newAisles = status.aisles || aislesInit;   
        if (selectedAisle === 'DELETE') {
            updatedRetrievedData.forEach(item => {
                if (item.title === status.todos[index].title) {
                    updatedRetrievedData.splice(index, 1);
                }
            })
            localStorage.setItem('vueTodosSaved', JSON.stringify(updatedRetrievedData));
            //console.log(`vueTodosSaved(4): ${JSON.stringify(JSON.parse(localStorage.getItem('vueTodosSaved')),null,2)}`)
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
            //console.log(`vueTodosSaved(5): ${JSON.stringify(JSON.parse(localStorage.getItem('vueTodosSaved')))}`);
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
            //console.log(`vueTodosSaved(6): ${JSON.stringify(JSON.parse(localStorage.getItem('vueTodosSaved')),null,2)}`)
        } else {
            newAisles = status.aisles || aislesInit;
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
            //console.log(`vueTodosSaved(7): ${JSON.stringify(JSON.parse(localStorage.getItem('vueTodosSaved')),null,2)}`)
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

    }
    return (
        <div className='itemSelectors' style={{backgroundColor: aisleColor}}>
            <div className='flex-container'>
                <div>
                    <div className='button'>
                        {getInCartButton(index)}
                    </div>
                    <div className='size20 m-10'> 
                        ${ todo.price }
                    </div>
                </div>
                <div>
                    <div>Days</div>
                    <div className='lastPurchaseDays flexOneFifthColumn contentCenter'>{todo.days}</div>
                </div>
                <div>
                    <div className='mb-5'>Tax</div>
                    {getTaxCheckBox(todo, index)}
                </div>
                <div>
                    <div className='mb-5 button'>Count</div> 
                    <Selector
                        groupTitle='Count'
                        //selected={todo.quantity} 
                        selected={0} 
                        label={index}
                        items={quantities}
                        onChange={updateQuantity}
                        padding='5px'
                        fontSize='15'
                    />
                </div>
                <div id='aisle flexTwoFourthColumn' >
                    <div className='mb-5'>Aisle</div>
                    <Selector
                        groupTitle='Aisle'
                        selected={todo.aisle} 
                        label={index} 
                        items={itemMenuDefault.concat(status.aisles) || itemMenuDefault.concat(aislesInit)}
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

const mapStateToProps = (state) => {
    return { 
        status: state.status, 
        setStatus: state.setStatus, 
        index: state.index, 
        getTotal: state.getTotal, 
        todo: state.todo, 
        aisleColor: state.aisleColor, 
        itemMenuDefault: state.itemMenuDefault, 
        updateAisles: state.updateAisles, 
        aislesInit: state.aislesInit
    }
}
export default connect(mapStateToProps)(ItemSelectors);