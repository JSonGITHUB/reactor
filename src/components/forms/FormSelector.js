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
        this.items = props.items;
        this.state = { 
            value: props.selected,
            selected: props.selected,
            select: props.selected,
            header: props.header,
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
        let ingredients = this.state.bowlIngredients;
        const itemExists = ingredients.includes(this.state.selected);
        const itemExistsWithComma = ingredients.includes(", " + this.state.selected);
        const emptyBowl = (ingredients === "") ? true : false;
        const addedIngredients = ingredients + ", " + this.state.selected;
        const setBowlIngredients = (emptyBowl) ? this.state.selected : addedIngredients;
        const removeExtra = (ingredients) => ingredients.replace(", ", "");
        const removeItem = ingredients.replace(this.state.selected, "");
        const removeItemAndComma = ingredients.replace(", " + this.state.selected, "");
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
        return (
            <form onSubmit={this.handleSubmit} className="neumorphism p-20 mb-30">
                {this.state.header}<br/><br/>
                <textarea id="ingredients" rows="11" cols={window.innerWidth/15} className="mb-20" value={this.state.bowlIngredients} /><br/>
                <label>
                    <div className="p-20 bg-yellow r-10 mb-10">
                        <span className="greet color-black bold">select: </span>
                        <select value={this.state.value} onChange={this.handleChange}>
                            {this.state.selectItems}
                        </select>
                    </div>
                </label>
                <span>
                    <input type="submit" value="add" onClick={this.add} className="bold greet p-20 r-10 w-200 bg-green brdr-green"/>
                    <input type="submit" value="remove" onClick={this.remove} className="bold greet ml-2 p-20 r-10 w-200 bg-red brdr-red"/>
                </span>
            </form>
        );
    };
}
export default SelectorForm;