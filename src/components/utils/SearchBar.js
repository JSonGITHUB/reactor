import React, { useRef, useState } from 'react';

let searchBarIdCounter = 0;

const SearchBar = ({label, term, onSubmit, onChange}) => {

    const [keyword, setTerm] = useState(term || '');
    const fieldIdRef = useRef(null);
    if (fieldIdRef.current === null) {
        searchBarIdCounter += 1;
        fieldIdRef.current = `search-${searchBarIdCounter}`;
    }
    const fieldId = fieldIdRef.current;
    
    return (
        <div className='m-20'>
            <form onSubmit={onSubmit}>
                <input
                    id={fieldId}
                    name={fieldId}
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