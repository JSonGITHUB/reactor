import React, {useState} from 'react';
import getKey from '../utils/KeyGenerator.js';
/*
<SelectorForm 
          selected={"Ahi"} 
          header = {"Poki Bowl"} 
          items = {["one", "two", "three"]}
        />
*/
const SelectorForm = ({ width, height, selection, header, items }) => {
    console.log('FormSelector')
    let action = "YEWW!!!!";
    const options = () => {
        items.map((item) =>
            <option 
                key={getKey(item)} 
                value={item.toString()}>{item}
            </option>    
        )
    }
    const [value, setValue] = useState(selection);
    const [selected, setSelected] = useState(selection);
    const [bowlIngredients, setBowlIngredients] = useState('');
    const [selectItems, setSelectedItems] = useState(options);
    
    const handleChange = (event) => {
        setSelected(event.target.value);
        setValue(event.target.value);
    };
    const handleSubmit = (event) => {
        let ingredients = bowlIngredients;
        const itemExists = ingredients.includes(selected);
        const itemExistsWithComma = ingredients.includes(", " + selected);
        const emptyBowl = (ingredients === "") ? true : false;
        const addedIngredients = ingredients + ", " + selected;
        const removeExtra = (ingredients) => ingredients.replace(", ", "");
        const removeItem = ingredients.replace(selected, "");
        const removeItemAndComma = ingredients.replace(", " + selected, "");
        const hasJunk = (ingredients) => (ingredients.substr(0,2) === ", ") ? true : false; 
        const cleanUpIngredients = (ingredients) => (hasJunk(ingredients)) ? removeExtra(ingredients) : ingredients;
        if (!itemExists && action === "add") {
            setBowlIngredients((emptyBowl) ? selected : addedIngredients)
        } else if (itemExists && action === "remove") {
            ingredients = (itemExistsWithComma) ? removeItemAndComma : removeItem;
            setBowlIngredients(cleanUpIngredients(ingredients));
        }
        event.preventDefault();
    };
    const add = (event) => action = "add";
    const remove = (event) => action = "remove";
    const buttonClasses = 'flex2Column contentCenter bold greet width-100-percent';
    const addClasses = 'p-20 r-10  bg-green brdr-green ' + buttonClasses;
    const removeClasses = 'ml-2 p-20 r-10 bg-red brdr-red ' + buttonClasses;
    
    return (
        <form onSubmit={handleSubmit} className="neumorphism p-20 mb-30">
            {header}<br/><br/>
            <textarea id="ingredients" rows="11" cols={width/15} className="mb-20" value={bowlIngredients} /><br/>
            <label>
                <div className="p-20 bg-yellow r-10 mb-10">
                    <span className="greet color-black bold">select: </span>
                    <select value={value} onChange={handleChange}>
                        {selectItems}
                    </select>
                </div>
            </label>
            <span  className="flexContainer">
                <input type="submit" value="add" onClick={add} className={addClasses}/>
                <input type="submit" value="remove" onClick={remove} className={removeClasses}/>
            </span>
        </form>
    );
}
export default SelectorForm;