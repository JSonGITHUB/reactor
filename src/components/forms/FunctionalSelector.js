import React from 'react';
import getKey from '../utils/KeyGenerator.js';
//<FormSelector items={["Grapefruit", "Lime", "Coconut", "Mango"]} />

function FormSelector(props) {
    //let action = "";
    let { items, label, groupTitle, selected } = props;
    const select = selected;
    const setSelected = (item) => {
        selected = item;
        return tag(item)
    }
    //const tagSelected = (item) => <option selected key={getKey(item)} value={item.toString()}>{item}</option>;
    const tag = (item) => <option key={getKey(item)} value={item}>{item}</option>;
    const getTag = (item, index) => (Number(index) === Number(select)) ? setSelected(item) : tag(item);
    const selectItems = items.map((item, index) => getTag(item,index));
    const handleChange = (event) => {
        selected = event.target.value;
        //this.setState({value: e.target.value});
        props.onChange(groupTitle, label, selected);
    }
    return (
        <label>    
            <select value={selected} onChange={handleChange}>
                {selectItems}
            </select>
        </label>
    );
}

export default FormSelector;