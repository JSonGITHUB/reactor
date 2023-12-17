import React from 'react';
import getKey from '../utils/KeyGenerator.js';

//<FormSelector items={["Grapefruit", "Lime", "Coconut", "Mango"]} />

function FormSelector(props) {
    let action = "";
    const { items, label, selected} = props;
    const select = selected;
    let bowlIngredients = "";
    const tagSelected = (item) => <option selected key={getKey(item)} value={item.toString()}>{item}</option>;
    const tag = (item) => <option key={getKey(item)} value={item.toString()}>{item}{suffix}</option>;
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
            <textarea id="bowl" rows="11" cols={props.width/15} className="mb-20" value={bowlIngredients} onChange={showBowlIngredients} /><br/>
            <label>
                <div className="p-20 bg-yellow r-10 mb-10">
                    <span className="greet color-black bold">select: </span>
                    <select onChange={handleChange}>
                        {selectItems}
                    </select>
                </div>
            </label>
            <span className="flexContainer">
                <input type="submit" value="add" className="flex2Column contentCenter bold greet p-20 r-10 width-100-percent bg-green brdr-green" onClick={add}/>
                <input type="submit" value="remove" className="flex2Column contentCenter bold greet ml-2 p-20 r-10 width-100-percent bg-red brdr-red" onClick={remove}/>
            </span>
        </form>
    );
}

export default FormSelector;