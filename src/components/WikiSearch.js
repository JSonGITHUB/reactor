import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DropDown from './DropDown.js';
import debounceType from './utils/DebouncerType.js';

const WikiSearch = () => {
    const options = [
        { label: 'Green', value: 'green' },
        { label: 'Red', value: 'red' },
        { label: 'Yellow', value: 'yellow' }
    ]
    const [selected, setSelected] = useState(options[0]);
    const [term, setTerm] = useState('');
    const [debouncedTerm, setDebouncedTerm] = useState(term);
    const [results, setResults] = useState([]);
    // eslint-disable-next-line
    const [bkgColor, setBkgColor] = useState(options[2].value);

    //console.log(results);
    //always invoked on mount 
    //and when any value changes in the dependancy array

    useEffect(() => {
        /*
        const timerId = setTimeout(() => {
            setDebouncedTerm(term);
        }, 1000);

        return () => {
            clearTimeout(timerId);
        };
        */
       debounceType(setDebouncedTerm, term);
    }, [term]);

    useEffect(() => {
        const search = async () => {
            const { data } = await axios.get('https://en.wikipedia.org/w/api.php', {
                params: {
                    action: 'query',
                    list: 'search',
                    origin: '*',
                    format: 'json',
                    srsearch: debouncedTerm
                }
            });
            setResults(data.query.search);
        };
        if (debouncedTerm && !results.length) { 
            search() 
        } else {
            const timeoutId = setTimeout(() => {
                if (debouncedTerm) { search() }
            }, 1000);

            return () => {
                clearTimeout(timeoutId);
            };
        }
    }, [debouncedTerm, results.length]);
    const goToLink = (link) => window.location.href=link;
    // eslint-disable-next-line
    const renderedLinkResults = results.map((result) => {
        return (
            <a 
                href={`https://en.wikipedia.org?curid=${result.pageid}`} 
                className='maxWidth400 button p-10 lowerBorder pointer color-yellow' 
                key={result.pageid}
            >
                <div className={`color-yellow bold p-10 columnLeft`}>{result.title}</div>
                <div className='p-10 mb-5 columnLeft white'>
                    <span dangerouslySetInnerHTML={{ __html: result.snippet }}></span>
                </div> 
            </a>
        )
    });
    const renderedDivResults = results.map((result) => {
        return (
            <div 
                onClick={() => goToLink(`https://en.wikipedia.org?curid=${result.pageid}`)} 
                className='maxWidth400 button p-10 lowerBorder pointer sides-auto color-yellow' 
                key={result.pageid}
            >
                <div className={`color-yellow bold p-10 columnLeft`}>{result.title}</div>
                <div className='p-10 mb-5 columnLeft white'>
                    <span dangerouslySetInnerHTML={{ __html: result.snippet }}></span>
                </div> 
            </div>
        )
    });
    //console.log(`selected: ${selected.value}`)
    const selectedBackground = `bg-${selected.value}`;
    return (
        <div className="m-20">
            <div className='directory sides-auto'>
                <DropDown 
                    label='Select a color:' 
                    options={options} 
                    selected={selected} 
                    onSelectionChange={setSelected}
                />
            </div>
            <div className='ui form mt-20'>
                <div className={`flexContainer ${selectedBackground} r-10 p-10`}>
                    <label className='greet flex2Column10Percent p-10'><span>Search: </span></label>
                    <input 
                        value={term} 
                        onChange={e => setTerm(e.target.value)}
                        className='input flex2Column'
                    />
                </div>
            </div>
            <div className='ui celled list'>{renderedDivResults}</div>
        </div>
    )
};

export default WikiSearch;