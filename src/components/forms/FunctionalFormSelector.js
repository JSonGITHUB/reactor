import React from 'react';
import getKey from '../utils/KeyGenerator.js';

//<FormSelector items={["Grapefruit", "Lime", "Coconut", "Mango"]} />

function FormSelector(props) {
    let action = "";
    const items = props.items;
    const label = props.label;
    const select = props.selected;
    let bowlIngredients = "";
    let selected = select;
    const tagSelected = (item) => <option selected key={getKey(item)} value={item.toString()}>{item}</option>;
    const tag = (item) => <option key={getKey(item)} value={item.toString()}>{item}</option>;
    const getTag = (item) => (item === select) ? tagSelected(item) : tag(item);
    const selectItems = items.map((item) =>
        getTag(item)     
    );
    const handleSubmit = (event) => { 
        console.log("SUBMITTED => " + selected + " => action: " + action);
        const itemExists = (bowlIngredients.includes(selected)) ? true : false;
        const removeExtra = () => bowlIngredients = bowlIngredients.substr(2,(bowlIngredients.length-1));
        const cleanUpIngredients = () => (bowlIngredients.substr(0,2) === ", ") ? removeExtra() : false;
        if (itemExists && action === "remove") {
            console.log("SUBMITTED => Remove: " + selected);
            bowlIngredients = (bowlIngredients.includes(selected+ ", ")) ? bowlIngredients.replace(selected+", ","") : bowlIngredients.replace(selected,"");
            cleanUpIngredients(); 
            document.getElementById('bowl').value = bowlIngredients;
        } else if (!itemExists) {
            console.log("SUBMITTED => Add: " + selected);
            bowlIngredients = (bowlIngredients === "") ? selected : (bowlIngredients + ", " + selected);
            document.getElementById('bowl').value = bowlIngredients;
        }
        action = "";
        event.preventDefault();
    }
    const handleChange = (event) => {
        console.log("CHANGED => " + event.target.value);
        selected = event.target.value;
        //this.setState({value: e.target.value});
    }
    const showBowlIngredients = (event) => {
        console.log("Bowl Ingredients => " + bowlIngredients);
        //this.setState({value: e.target.value});
    }
    const add = (event) => { action = "add" };
    const remove = (event) => { action = "remove" };

    return (
        <form onSubmit={handleSubmit} className="neumorphism p-20 mb-30">
            {label}<br/><br/>
            <textarea id="bowl" rows="11" cols={window.innerWidth/15} className="mb-20" value={bowlIngredients} onChange={showBowlIngredients} /><br/>
            <label>    
                <select onChange={handleChange}>
                    {selectItems}
                </select>
            </label>
            <br/>
            <input type="submit" value="Add Item" onClick={add}/>
            <input type="submit" value="Remove Item" className="ml-2" onClick={remove}/>
        </form>
    );
}

export default FormSelector;