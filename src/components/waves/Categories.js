import React from 'react';
import RadioSelector from '../forms/FormRadio.js';
import groups from './Groups.js';
import selector from './Selector.js';

const categories = (items, log, handleSelection, spot) => {
    const selected = (item,groupTitle) => ((item.selections.indexOf(log[groupTitle][item.description])) !== -1) ? true : false;
    const defaultSelection = (item,groupTitle) => (selected(item,groupTitle)) ? (item.selections.indexOf(log[groupTitle][item.description])) : 0; 

    const radioItems = (item, groupTitle) => {
        return (
            <RadioSelector
                header={groupTitle}
                groupTitle={groupTitle} 
                selected={defaultSelection(item,groupTitle)} 
                label={item.description} 
                items={item.selections} 
                onChange={handleSelection}
            />
        )
    };

    const radio = (item, groupTitle) => <div className="r-vw bg-green">
                {radioItems(item, groupTitle)}
            </div>;

    const selectionInterface = (item, groupTitle) => (item.type === "radio") ? radio(item, groupTitle) : selector(item, groupTitle, spot, defaultSelection, handleSelection, selected);
    console.log(`Categories => items: ${JSON.stringify(items)}`)
    return <div className='description'>{groups(items, log, defaultSelection, selectionInterface)}</div>;
}
export default categories;