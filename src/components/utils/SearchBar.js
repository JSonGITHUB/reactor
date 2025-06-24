import React, { useState } from 'react';

const SearchBar = ({label, term, onSubmit, onChange}) => {

    const [keyword, setTerm] = useState(term || '');
    
    return (
        <div className='m-20'>
            <form onSubmit={onSubmit}>
                <input
                    id='search'
                    name='search'
                    className='p-10 r-5 bg-dark white size25 bold width-100-percent'
                    type='text'
                    value={keyword}
                    placeholder={label}
                    onChange={e => {
                        setTerm(e.target.value);
                        onChange(e.target.value);
                    }}
                />
            </form>
        </div>
    )
}

export default SearchBar;