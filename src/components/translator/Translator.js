import { useState, useEffect } from 'react';

// Example API (Free)
const API_URL = 'https://api.mymemory.translated.net/get';
// Example API (Paid)
//const API_URL = "https://translation.googleapis.com/language/translate/v2"; 

const API_KEY = ''; // Add API key if using a paid service

const Translator = () => {
  const languageOptions = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
    { code: 'de', label: 'German' },
    { code: 'zh', label: 'Chinese' },
    { code: 'ja', label: 'Japanese' },
  ];

  const [inputLanguage, setInputLanguage] = useState(localStorage.getItem('inputLanguage') || 'en');
  const [targetLanguage, setTargetLanguage] = useState(localStorage.getItem('targetLanguage') || 'es');
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');

  useEffect(() => {
    localStorage.setItem('inputLanguage', inputLanguage);
  }, [inputLanguage]);

  useEffect(() => {
    localStorage.setItem('targetLanguage', targetLanguage);
  }, [targetLanguage]);

  // Function to fetch translations
  const translateText = async (text, from, to) => {
    if (!text) {
      setTranslatedText('');
      return;
    }

    try {
      const response = await fetch(`${API_URL}?q=${encodeURIComponent(String(text))}&langpair=${String(from)}|${String(to)}`);
      // Paid API
      //const response = await fetch(`${API_URL}?q=${encodeURIComponent(text)}&source=${from}&target=${to}&key=${API_KEY}`);

      const data = await response.json();

      if (data.responseData?.translatedText) {
        setTranslatedText(data.responseData.translatedText);
      } else {
        setTranslatedText('Translation failed');
      }
    } catch (error) {
      setTranslatedText('Error fetching translation');
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      translateText(inputText, inputLanguage, targetLanguage);
    }, 500); // Avoid excessive API calls

    return () => clearTimeout(delay);
  }, [inputText, inputLanguage, targetLanguage]);

  return (
    <div className='containerBox'>
      <div className='containerBox'>
        <div className='containerBox columnLeftAlign'>
          <select
            className='containerBox'
            value={inputLanguage}
            onChange={(e) => setInputLanguage(e.target.value)}
          >
            {languageOptions.map((lang) => (
              <option key={lang.code} value={lang.code}>{lang.label}</option>
            ))}
          </select>
        </div>
        <div className='containerBox'>
          <textarea
            className='containerBox width--10'
            placeholder='Enter text to translate...'
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{ height: '20vh' }}
          />
        </div>
      </div>
      <div className='containerBox'>
        <div className='containerBox columnLeftAlign'>
          <select
            className='containerBox'
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
          >
            {languageOptions.map((lang) => (
              <option key={lang.code} value={lang.code}>{lang.label}</option>
            ))}
          </select>
        </div>
        <div className='containerBox'>
          <textarea
            className='containerBox width--10'
            readOnly
            value={translatedText}
            placeholder='Translated text will appear here...'
            style={{ height: '20vh' }}
          />
        </div>
      </div>
    </div>
  );
}
export default Translator;