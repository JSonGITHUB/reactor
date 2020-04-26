import React from 'react';
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
                    key={item.toString().toLowerCase()} 
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
            <label>
                <select value={this.state.value} onChange={this.handleChange}>
                    {this.state.selectItems}
                </select>
            </label>
        );
    };
}
export default SelectorForm;