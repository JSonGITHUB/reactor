import React, { useState } from 'react';
import DropDown from './DropDown.js';
import Translate from './Translate.js';
import SearchBar from './utils/SearchBar';
const Translator = () => {
    //https://cloud.google.com/translate/docs/languages
    const options = [
        { label: 'Spanish', value: 'es' },
        { label: 'English', value: 'en' },
        { label: 'French', value: 'fr' },
        { label: 'Hindi', value: 'hi' },
        { label: 'Hawaiian', value: 'haw' },
        { label: 'Indonesian', value: 'id' },
        { label: 'Italian', value: 'it' },
        { label: 'Japanese', value: 'ja' },
        { label: 'Javanese', value: 'jv' },
        { label: 'Tagalog', value: 'tl' }
    ]
    const [language, setLanguage] = useState(options[0]);
    const [term, setTerm] = useState('');

    //console.log(`language: ${language.value}`)
    const submit = e =>  {
        e.preventDefault();
        //console.log(`submit =>\nterm: ${term}`)
    }
    return (
        <div className='mt--40'>
            <SearchBar onSubmit={submit} onChange={setTerm} label='enter words here...' term={term}/>
            <DropDown 
                label='Select a language:' 
                options={options} 
                selected={language} 
                onSelectionChange={setLanguage}
            />
            <Translate text={term} language={language} />
        </div>
    )
};

export default Translator;