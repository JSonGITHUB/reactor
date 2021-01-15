import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
            const { data } = await axios.post(
                'https://translation.googleapis.com/language/translate/v2', 
                {}, 
                {
                    params: {
                        q: debouncedText,
                        target: language.value,
                        key: 'AIzaSyCHUCmpR7cT_yDFHC98CZJy2LTms-IwDlM'
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