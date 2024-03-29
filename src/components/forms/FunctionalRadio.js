import React from 'react';

//<FormSelector items={["Grapefruit", "Lime", "Coconut", "Mango"]} />

function FormSelector(props) {
    let action = "";
    let { items, groupTitle, label, selected } = props;
    let select = selected;
    
    const handleChange = (event) => {
        selected = event.target.value;
        select = event.target.value;
        console.log(groupTitle + " >> " + label + " -> " + selected);
        //console.log(`${groupTitle} => handleChange -> ${event.target.value} --- select: ${select}`);
        //select = event.target.value;
        //this.setState({select: event.target.value});
    }
    const tagSelected = (item) => <React.Fragment>
            <input key={item.toString().toLowerCase()} type="radio" value={item.toString()} onChange={handleChange} checked={true}/>
            <span className="description">{item.toString()}</span>
        </React.Fragment>
    const tag = (item) => <React.Fragment>
            <input key={item.toString().toLowerCase()} type="radio" value={item.toString()} onChange={handleChange} checked={false}/>
            <span className="description">{item.toString()}</span>
        </React.Fragment>;
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