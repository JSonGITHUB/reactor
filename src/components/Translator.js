import React, { useState } from 'react';
import DropDown from './DropDown.js';
import Translate from './Translate.js';
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
    return (
        <div className="m-20">
            <div className='directory sides-auto'>
                <div className='ui form bg-yellow r-5 p-10 mb-5'>
                    <div className='field'>
                        <label>Enter Text</label>
                        <input value={term} onChange={(e) => setTerm(e.target.value)} />
                    </div>
                </div>
                <DropDown 
                    label='Select a language:' 
                    options={options} 
                    selected={language} 
                    onSelectionChange={setLanguage}
                />
                <div className='white greet ui bg-lite p-10 r-5 mt-5'>Translation:
                    <Translate text={term} language={language} />
                </div>
            </div>
        </div>
    )
};

export default Translator;