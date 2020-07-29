import React from 'react';
import getKey from '../utils/KeyGenerator.js';
/*
<SelectorForm 
          selected={"Ahi"} 
          header = {"Poki Bowl"} 
          items = {["one", "two", "three"]}
        />
*/
class SelectorForm extends React.Component {
    action = "YEWW!!!!";
    constructor(props) {
        super(props); 
        let { items, selected, header } = props;
        this.items = items;
        this.state = { 
            value: selected,
            selected: selected,
            select: selected,
            header: header,
            bowlIngredients: "",
            selectItems: this.items.map((item) =>
                <option 
                    key={getKey(item)} 
                    value={item.toString()}>{item}
                </option>    
            )
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    };

    handleChange(event) {
        this.setState({
            selected: event.target.value,
            value: event.target.value
        });
    };
    handleSubmit(event) {
        const { bowlIngredients, selected } = this.state;
        let ingredients = bowlIngredients;
        const itemExists = ingredients.includes(selected);
        const itemExistsWithComma = ingredients.includes(", " + selected);
        const emptyBowl = (ingredients === "") ? true : false;
        const addedIngredients = ingredients + ", " + selected;
        const setBowlIngredients = (emptyBowl) ? selected : addedIngredients;
        const removeExtra = (ingredients) => ingredients.replace(", ", "");
        const removeItem = ingredients.replace(selected, "");
        const removeItemAndComma = ingredients.replace(", " + selected, "");
        const hasJunk = (ingredients) => (ingredients.substr(0,2) === ", ") ? true : false; 
        const cleanUpIngredients = (ingredients) => (hasJunk(ingredients)) ? removeExtra(ingredients) : ingredients;
        if (!itemExists && this.action === "add") {
            this.setState({ bowlIngredients: setBowlIngredients });
        } else if (itemExists && this.action === "remove") {
            ingredients = (itemExistsWithComma) ? removeItemAndComma : removeItem;
            this.setState({ bowlIngredients: cleanUpIngredients(ingredients) });            
        }
        event.preventDefault();
    };
    add = (event) => this.action = "add";
    remove = (event) => this.action = "remove";

    render() {
        const { header, value, selectItems, bowlIngredients } = this.state;
        return (
            <form onSubmit={this.handleSubmit} className="neumorphism p-20 mb-30">
                {header}<br/><br/>
                <textarea id="ingredients" rows="11" cols={this.props.width/15} className="mb-20" value={bowlIngredients} /><br/>
                <label>
                    <div className="p-20 bg-yellow r-10 mb-10">
                        <span className="greet color-black bold">select: </span>
                        <select value={value} onChange={this.handleChange}>
                            {selectItems}
                        </select>
                    </div>
                </label>
                <span  className="flexContainer">
                    <input type="submit" value="add" onClick={this.add} className="flex2Column bold greet p-20 r-10 width-100-percent bg-green brdr-green"/>
                    <input type="submit" value="remove" onClick={this.remove} className="flex2Column bold greet ml-2 p-20 r-10 width-100-percent bg-red brdr-red"/>
                </span>
            </form>
        );
    };
}
export default SelectorForm;