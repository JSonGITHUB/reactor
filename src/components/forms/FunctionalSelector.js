import React from 'react';
import getKey from '../utils/KeyGenerator.js';
import validate from '../utils/validate';

const FunctionalSelector = React.memo(({
    items,
    label,
    alignText,
    groupTitle,
    selected,
    padding,
    fontSize,
    maxWidth,
    width,
    bgColor = null,
    color = null,
    onChange
}) => {

    //console.log(`FunctionalSelector => label: ${label}`);
    //console.log(`FunctionalSelector => selected: ${selected} `)
    //console.log(`FunctionalSelector => items: ${JSON.stringify(items, null, 2)}`);

    const tag = (item) => {
        if (validate(item) !== null) {
            return <option key={getKey(item)} value={item}>
                {item}
            </option>;
        } else {
            //console.log(`FunctionalSelector => item: ${JSON.stringify(item, null, 2)}`);
        }

    }
    const setSelected = (item) => {
        selected = item;
        return tag(item)
    }

    const getTag = (item, index) => (Number(item) === Number(selected)) ? setSelected(item) : tag(item);
    const selectItems = () => {
        //console.log(`FunctionalSelector => items: ${JSON.stringify(items, null, 2)}`);
        if (validate(items) === null || items.length === 0 || !Array.isArray(items)) {
            //console.log(`FunctionalSelector => empty: ${JSON.stringify(items, null, 2)} validate: ${validate(items)} length: ${items.length} typeOf: ${typeof items}`);
            return ['empty'];
        }
        return items.map((item, index) => getTag(item, index));
    };
    const handleChange = (event) => {
        selected = event.target.value;
        //console.log(`FunctionalSelector => selected: ${selected}`)
        onChange(groupTitle, label, selected);
    }
    const getAlignment = () => {
        const contentAlign = (alignText === 'center') ? 'contentCenter' : (alignText === 'right') ? 'contentRight' : 'contentLeft';
        return contentAlign;
    }
    return (
        <label id={label} key={getKey('selectorContainer')}>
            <select id={`${label}Selector`} className={`containerBox ${getAlignment()} button width-100-percent ${color || 'color-soft'} ${bgColor || 'bg-tintedMediumDark'}`} value={(selected) || ''} onChange={handleChange}>
                {selectItems()}
            </select>
        </label>
    );
})

export default FunctionalSelector;