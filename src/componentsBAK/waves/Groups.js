import React from 'react';
import group from './Group.js';
import getKey from '../utils/KeyGenerator.js';

const groups = (items, log, defaultSelection, selectionInterface) => {
    //console.log(`Groups => items: ${JSON.stringify(items())}`)
    items().map((item) => {
        console.log(`Groups => item.description: ${item.description}`)
        const headerClasses = 'subHeader color-yellow';
        const selectorClasses = "greet p-vw bg-vdkGreen flex3Column";
        const groupClasses = (window.innerWidth < 500) ? "r-vw" : "flexContainer width-100-percent r-vw";
        const description = item.description;
        return <div key={getKey("groupConainer")}>
                        <div key={getKey("groupHeader")} className={headerClasses}>
                            {item.description}
                        </div>
                        {/*
                        <div className={groupClasses} key={getKey("groupSubConainer")}>
                            {group(item).map((group) => 
                                <div key={getKey("selectorContainer")} className={selectorClasses}>
                                    {selectionInterface(group, description)}
                                </div>
                            )}
                        </div>
                        */}
                    </div>
    })
}
export default groups;