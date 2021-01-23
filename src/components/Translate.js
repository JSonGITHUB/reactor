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
                (proxyurl + config.googleAPI_BASE_URL), 
                {}, 
                {
                    params: {
                        client: 'gtx',
                        q: debouncedText,
                        target: language.value,
                        key: config.googleAPI_KEY
                    },
                }
                /*
                                headers: {"X-HTTP-Method-Override":"GET"},
                                url: "https://www.googleapis.com/language/translate/v2",
                                dataType: "jsonp",
                                data: { key: config.googleAPI_KEY,
                                        source: SOURCE_LANGUAGE,
                                        target: language.value,
                                        q: debouncedText },
                                success: function(result){
                                    if(!result.error){
                                    // translated text in 
                                    // result.data.translations[0].translatedText
                                    }
                                }
                */
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