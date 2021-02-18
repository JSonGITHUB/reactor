import React, { useState } from 'react';

const FormEssay = () => {

    const [ value, setValue ] = useState(localStorage.getItem("notes") || null)

    const handleChange = (event) => setValue(event.target.value);

    const handleSubmit = (event) => {
        //alert('Note was submitted: ' + value);
        localStorage.setItem("notes", value);
        event.preventDefault();
    }
    const clear = (event) => {
        //alert('Note was cleared: ' + value);
        localStorage.setItem("notes", "");
        setValue("");
    }
    return (
        <div className="App-content flexContainer width-100-percent fadeIn mt--14">
            <div className="flex3Column" />
            <div className="flex3Column" >
                <form onSubmit={handleSubmit} className="neumorphism p-20">
                    <label>
                        <textarea rows="13" cols={window.innerWidth/15} className="mb-30 bg-black" value={value} onChange={handleChange} />
                    </label><br/>
                    <div className="flexContainer">
                        <input type="submit" value="Submit" className="flex2Column greet p-20 r-10 width-100-percent bg-green brdr-green glassy m-5 bold"/>
                        <div value="Submit" className="flex2Column button greet p-20 r-10 width-100-percent bg-red brdr-red glassy m-5 bold" onClick={() => clear()}>Clear</div>
                    </div>
                </form>
            </div>
            <div className="flex3Column" />
        </div>
    );
}

export default FormEssay;