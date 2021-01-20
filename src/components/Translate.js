import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from './apis/config';

const Translate = ({language, text}) => {
    const [translated, setTranslated] = useState('');
    const [debouncedText, setDebouncedText] = useState(text);
    
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedText(text);
        }, 800);
        return () => {
            clearTimeout(timerId);
        };
    },[text]);
    
    useEffect(() => {
        const getTranslation = async () => {
            const proxyurl = "https://cors-anywhere.herokuapp.com/";
            const { data } = await axios.post(
                proxyurl + config.googleAPI_BASE_URL, 
                {}, 
                {
                    params: {
                        q: debouncedText,
                        target: language.value,
                        key: config.googleAPI_KEY
                    },
                }
            );
            setTranslated(data.data.translations[0].translatedText);
        };
        getTranslation();
    }, [language, debouncedText]);
    return (
        <div className='ui bg-dkGreen color-neogreen p-10 r-5 mt-5'>{translated}</div>
    )
};

export default Translate;