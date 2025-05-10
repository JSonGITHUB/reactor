import React, { useState, useEffect } from 'react';
import initializeData from '../utils/InitializeData';

const FormEssay = () => {

    const [value, setValue] = useState(initializeData('notes', null));
        
    useEffect(() => {
        localStorage.setItem('notes', value);
    }, [value]);

    const handleChange = (event) => setValue(event.target.value);

    const handleSubmit = (event) => {
        //alert('Note was submitted: ' + value);
        localStorage.setItem('notes', value);
        event.preventDefault();
    }
    const clear = (event) => {
        //alert('Note was cleared: ' + value);
        localStorage.setItem('notes', '');
        setValue('');
    }
    return (
        <form onSubmit={handleSubmit} className='neumorphism p-20 noteContainer m-auto relative'>
            <label>
                <textarea className='mb-30 bg-black fullscreenTextarea' value={value} onChange={handleChange} />
            </label><br/>
            <div className='containerBox flexContainer'>
                <div 
                    title='clear'
                    value='Submit' 
                    className='contentCenter button greet p-20 r-10 width-100-percent bg-red brdr-red glassy m-5 bold' 
                    onClick={() => clear()}
                >
                    Clear
                </div>
            </div>
        </form>
    );
}

export default FormEssay;