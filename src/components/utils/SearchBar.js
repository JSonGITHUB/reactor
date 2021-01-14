import React, { useState, useEffect } from 'react';
import GridImage from './GridImage'
import getKey from './KeyGenerator.js';

const SearchBar = ({term, onSubmit}) => {

    const [keyword, setTerm] = useState(term || '');
    const [menuArray, setMenuArray] = useState([]);

    const updateArray = (array) => {
        console.log(`menuArray: ${JSON.stringify(array, null, 2)}`)
        setMenuArray(array);
    }
    const clearMenu = () => (menuArray.length>0) ? setMenuArray([]) : null;
    const onFormSubmit = event =>  {
        event.preventDefault();
        clearMenu();
        console.log(`Search Term: ${keyword}`);
        onSubmit(keyword, updateArray);
    }
    const getImage = (item) => <GridImage key={getKey("thumb")} item={item}></GridImage>
    /*
    componentDidMount() {
        if(window.location.pathname.indexOf("Photos") > -1) {
            this.clearMenu();
            this.props.onSubmit('surfing pipeline', this.updateArray);
        }
        
    }
    */
    return (
        <div className='width-100-percent'>
            <form onSubmit={onFormSubmit} className='p-10 r-5 bg-lite ml-20 mr-20'>
                    <label className='color-yellow'>Search: </label>
                    <input
                        className='m-5'
                        type="text"
                        value={keyword}
                        onChange={e => setTerm(e.target.value)}
                    />
            </form>
            <div className='m-20'>
                {menuArray.map((item) => getImage(item))}   
            </div> 
        </div>
    )
}

export default SearchBar;