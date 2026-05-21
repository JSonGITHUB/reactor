import React, { useRef } from 'react';
import validate from '../utils/validate';

let functionalSelectorIdCounter = 0;

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
    inputId,
    onChange
}) => {

    const uniqueRef = useRef(null);
    const toSlug = (value) => String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    if (uniqueRef.current === null) {
        functionalSelectorIdCounter += 1;
        uniqueRef.current = `fs-${functionalSelectorIdCounter}`;
    }
    const uniqueBaseId = inputId || `${toSlug(groupTitle)}-${toSlug(label)}-${toSlug(uniqueRef.current)}`;
    const selectId = `${uniqueBaseId}-selector`;
    const labelId = `${uniqueBaseId}-label`;

    //console.log(`FunctionalSelector => label: ${label}`);
    //console.log(`FunctionalSelector => selected: ${selected} `)
    //console.log(`FunctionalSelector => items: ${JSON.stringify(items, null, 2)}`);

    const tag = (item, index) => {
        if (validate(item) !== null) {
            return <option key={`${uniqueBaseId}-option-${String(item)}-${index}`} value={item}>
                {item}
            </option>;
        } else {
            //console.log(`FunctionalSelector => item: ${JSON.stringify(item, null, 2)}`);
        }

    }
    const selectItems = () => {
        //console.log(`FunctionalSelector => items: ${JSON.stringify(items, null, 2)}`);
        if (validate(items) === null || items.length === 0 || !Array.isArray(items)) {
            //console.log(`FunctionalSelector => empty: ${JSON.stringify(items, null, 2)} validate: ${validate(items)} length: ${items.length} typeOf: ${typeof items}`);
            return [<option key={`${uniqueBaseId}-option-empty`} value=''>empty</option>];
        }
        return items.map((item, index) => tag(item, index));
    };
    const handleChange = (event) => {
        const nextValue = event.target.value;
        //console.log(`FunctionalSelector => selected: ${nextValue}`)
        onChange(groupTitle, label, nextValue);
    }
    const getAlignment = () => {
        const contentAlign = (alignText === 'center') ? 'contentCenter' : (alignText === 'right') ? 'contentRight' : 'contentLeft';
        return contentAlign;
    }
    return (
        <label id={labelId} htmlFor={selectId}>
            <select id={selectId} className={`containerDetail p-10 ${getAlignment()} button width-100-percent ${color || 'color-soft'} ${bgColor || 'bg-tintedMediumDark'}`} value={(selected) || ''} onChange={handleChange}>
                {selectItems()}
            </select>
        </label>
    );
})

export default FunctionalSelector;