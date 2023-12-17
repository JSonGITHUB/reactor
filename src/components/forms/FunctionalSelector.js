import React from 'react';
import getKey from '../utils/KeyGenerator.js';
//<FunctionalSelector items={["Grapefruit", "Lime", "Coconut", "Mango"]} />

function FunctionalSelector(props) {
    //let action = "";
    //console.log(`FunctionalSelector => props: ${JSON.stringify(props.onChange,null,2)}`)
    let { items, label, groupTitle, selected, padding, fontSize, maxWidth, width} = props;
    //console.log(`FunctionalSelector => \n${groupTitle}\nlabel: ${label}\nselected: ${selected}`)
    const setSelected = (item) => {
        selected = item;
        return tag(item)
    }
    //const tagSelected = (item) => <option selected key={getKey(item)} value={item.toString()}>{item}</option>;
    const tag = (item) => <option key={getKey(item)} value={item}>{item}</option>;
    const getTag = (item, index) => (Number(item) === Number(selected)) ? setSelected(item) : tag(item);
    const selectItems = items.map((item, index) => getTag(item,index));
    const handleChange = (event) => {
        selected = event.target.value;
        //this.setState({value: e.target.value});
        props.onChange(groupTitle, label, selected);
    }
    const getStyle = {
        padding: padding || 0,
        fontSize: Number(fontSize),
        color: 'yellow',
        maxWidth: maxWidth,
        width: width
    };
    return (
        
        <label>    
            <div>
                <select className='r-10 p-10 bg-darker color-soft width-auto pt-5 pb-5 button' style={getStyle} value={(selected)||''} onChange={handleChange}>
                    {selectItems}
                </select>
            </div>
        </label>
    );
}

export default FunctionalSelector;