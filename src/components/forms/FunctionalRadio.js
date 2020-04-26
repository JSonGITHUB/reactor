import React from 'react';

//<FormSelector items={["Grapefruit", "Lime", "Coconut", "Mango"]} />

function FormSelector(props) {
    let action = "";
    const items = props.items;
    const label = props.label;
    const groupTitle = props.groupTitle;
    let select = props.selected;
    let selected = select;
    
    const handleChange = (event) => {
        selected = event.target.value;
        select = event.target.value;
        console.log(groupTitle + " >> " + label + " -> " + selected);
        //console.log(`${groupTitle} => handleChange -> ${event.target.value} --- select: ${select}`);
        //select = event.target.value;
        //this.setState({select: event.target.value});
    }
    const tagSelected = (item) => <div>
            <input key={item.toString().toLowerCase()} type="radio" value={item.toString()} onChange={handleChange} checked={true}/>
            <span className="description">{item.toString()}</span>
        </div>
    const tag = (item) => <div>
            <input key={item.toString().toLowerCase()} type="radio" value={item.toString()} onChange={handleChange} checked={false}/>
            <span className="description">{item.toString()}</span>
        </div>;
    const getTag = (item, index) => (Number(index) === Number(selected)) ? tagSelected(item) : tag(item);
    const selectItems = items.map((item, index) =>
        getTag(item,index)
    );
    
    return (
            <label className="m-5 p-20 m-5">    
                {selectItems}
            </label>
    );
}

export default FormSelector;