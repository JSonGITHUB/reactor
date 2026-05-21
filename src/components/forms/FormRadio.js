import React , { useEffect, useState } from 'react';
import shakaBlack from '../../assets/images/shakaBlack.png';
import thumbsUp from '../../assets/images/ThumbsUp.png';
import thumbsDown from '../../assets/images/ThumbsDown.png';
const FormRadio = ({ items, selected, header, label, groupTitle, onChange }) => {

    const [ value, setValue] =  useState(selected);

    useEffect(() => {
        //alert(`Selected value for ${groupTitle} is now: ${selected}`);
        const conditions = ['Firing', 'Good', 'Bad'];
        setValue(conditions.indexOf(selected));
    }, [selected]);

    const selectItems = () => {
        const getIcon = (item, index, select) => {
            const value = item.toString();
            const displayClass = (select === true) ? 'shakingShaka shaka' : 'shaka';
            
            let displayColor = (index === 0) ? 'bg-neogreen' : 'bg-yellow';
            displayColor = (index === 2) ? 'bg-red' : displayColor;
            
            const buttonClass = displayColor + ' pt-10 pb-5 r-5 m-5 button glassy size30';
            const click = () => {
                onChange(groupTitle, groupTitle, item);
                setValue(index);
            }
            
            let icon = (index === 0) ? shakaBlack : thumbsUp;
            icon = (index === 2) ? thumbsDown : icon;
            return <div 
                    title={item}
                    key={`radio-option-${groupTitle}-${String(item)}`}
                    className={buttonClass} 
                    onClick={click}
                    >
                        <div className='flexContainer p-10 contentCenter color-dark size30'>
                            <div className='flex3Column mb-10'>
                                <input 
                                    id={index} 
                                    name={index} 
                                    type='radio' 
                                    value={item} 
                                    onChange={click} 
                                    checked={select}
                                />
                            </div>
                            <div className='flex3Column mb-5'>
                                {item}
                            </div>
                            <div className='flex3Column'>
                                <img id={value} src={icon} alt={value} className={displayClass} /><br/>
                            </div>
                        </div>
                    </div>;
        }

        const icon = (item, index, select) => {
            let iconOut = '';
            iconOut = getIcon(item, index, select);
            return iconOut;
        }
        const isSelected = (index) => (Number(value) === Number(index)) ? true : false;
        return items.map((item, index) =>
            <div className='flex3Column' key={`radio-col-${groupTitle}-${String(item)}`} >
                {icon(item, index, isSelected(index))}
            </div>
        )

    }
    return selectItems();
}
export default FormRadio;