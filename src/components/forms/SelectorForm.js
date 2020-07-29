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
        const {items, selected, header} = props;
        this.items = items;
        this.state = { 
            value: selected,
            selected: selected,
            select: selected,
            header: header,
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
        const { value, selectItems } = this.state;
        return (
            <label>
                <select value={value} onChange={this.handleChange}>
                    {selectItems}
                </select>
            </label>
        );
    };
}
export default SelectorForm;