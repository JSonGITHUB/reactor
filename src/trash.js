import React from 'react';
/*
<SelectorForm 
          selected={"Ahi"} 
          header = {"Poki Bowl"} 
          items = {["one", "two", "three"]}
        />
*/
class SelectorForm extends React.Component {
    
    action = "";
    header = "Select:";
    select;
    items = [];
    bowlIngredients = "";
    selected = this.select;
    selectItems;

    constructor(props) {
        super(props);
        this.items = props.items;
        this.state = {value: props.selected};
        this.select = props.selected;
        this.header = props.header;
        this.selectItems = this.items.map((item) =>
            <option 
                key={item.toString().toLowerCase()} 
                value={item.toString()}>{item}
            </option>    
        );
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        console.log('You Selected: ' + event.target.value);
        this.selected = event.target.value;
        this.setState({value: event.target.value});
    }
    showBowlIngredients = (event) => {
        console.log("Bowl Ingredients => " + this.bowlIngredients);
        //this.setState({value: e.target.value});
    }
    handleSubmit(event) {
        alert("handleSubmit => selected: " + this.selected)
        const removeExtra = () => this.bowlIngredients = this.bowlIngredients.substr(2,(this.bowlIngredients.length-1));
        const cleanUpIngredients = () => (this.bowlIngredients.substr(0,1) === ", ") ? removeExtra() : false;
        this.selected = (this.bowlIngredients.includes(this.selected)) ? false : this.selected;
        const itemExists = (this.bowlIngredients.includes(this.selected)) ? true : false;

        if (itemExists && this.action === "remove") {
            console.log("SUBMITTED => Remove: " + this.selected);
            this.bowlIngredients = (this.bowlIngredients.includes(this.selected+ ", ")) ? this.bowlIngredients.replace(this.selected+", ","") : this.bowlIngredients.replace(this.selected,"");
            document.getElementById('bowl').value = this.bowlIngredients;
        } else if (!itemExists) {
            alert("1")
            console.log("SUBMITTED => Add: " + this.selected + " => action: " + this.action);
            alert("2")
            this.bowlIngredients = (this.bowlIngredients === "") ? this.selected : (this.bowlIngredients + ", " + this.selected);
            alert("3")
            cleanUpIngredients();
            alert("4")
            document.getElementById('bowl').value = this.bowlIngredients;
        }
        this.action = "";
        event.preventDefault();
    }
    add = (event) => { this.action = "add" };
    remove = (event) => { this.action = "remove" };

    render() {
        return (
            <form onSubmit={this.handleSubmit} className="neumorphism p-20">
                {this.header}<br/><br/>
                <textarea id="ingredients" rows="11" cols="10" className="mb-20" value={this.bowlIngredients} onChange={this.showBowlIngredients} /><br/>
                <label>
                    <select value={this.state.value} onChange={this.handleChange}>
                        {this.selectItems}
                    </select>
                </label><br/>
                <input type="submit" value="Add Item" onClick={this.add}/>
                <input type="submit" value="Remove Item" className="ml-2" onClick={this.remove}/>
            </form>
        );
    }
}
export default SelectorForm;