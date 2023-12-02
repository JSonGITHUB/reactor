import React, { useState, useEffect } from 'react';
import ExchangeRatesConfig from './ExchangeRatesConfig';

const ExchangeConverter = () => {

    const currencies = {
        MXN: `Pesos`,   // Mexican Peso
        NIO: `Córdoba`,   // Nicaraguan Cordovas
        CRC: `Colones`,    // Costa Rican Colones
        IDR: `Rupiah`,  // Indonesian Rupiah
        AUD: `AUD`,    // Australian Dollar
    };

    const [exchangeRates, setExchangeRates] = useState({});

    const [usdAmount, setUsdAmount] = useState('');
    const [selectedCurrency, setSelectedCurrency] = useState('MXN');
    const [convertedAmount, setConvertedAmount] = useState('');
    const [isToUsd, setIsToUsd] = useState(true);

    const handleInputChange = (event) => {
        setUsdAmount(event.target.value);
    };

    const handleCurrencyChange = (event) => {
        setSelectedCurrency(event.target.value);
    };

    const handleConversion = () => {
        if (isToUsd) {
            const rate = exchangeRates[selectedCurrency];
            const convertedValue = usdAmount / rate;
            setConvertedAmount(convertedValue.toFixed(2));
        } else {
            const rate = exchangeRates[selectedCurrency];
            const convertedValue = usdAmount * rate;
            setConvertedAmount(convertedValue.toFixed(2));
        }
    };

    const handleConversionDirection = () => {
        setIsToUsd(!isToUsd);
        setUsdAmount('');
        setConvertedAmount('');
    };

    const currencyConverting = () => {
        return currencies[selectedCurrency]
    }
    const formatNumber = (amount) => {
        const formattedNumber = Number(amount).toLocaleString();
        return formattedNumber
    }

    return (
        <div>
            <ExchangeRatesConfig onExchangeRatesChange={setExchangeRates}></ExchangeRatesConfig>
            <div className='bg-yellow size20 timerBox m-20 p-30 bold color-black' onClick={handleConversionDirection}>
                {isToUsd ? 'Convert to USD' : 'Convert from USD'}
            </div>
            <div className='bg-darker r-10 p-10 ml-20 mr-20 mb-1 bold'>
                <div className='size20 color-lite mb-20 mt-10'>
                    <label>
                        {!isToUsd ? 'Convert to:' : 'Convert from:'}
                        <select className='dualVideoPlayer color-black p-10 r-5' value={selectedCurrency} onChange={handleCurrencyChange}>
                            <option value="MXN">Mexican Peso ({exchangeRates.MXN})</option>
                            <option value="NIO">Nicaraguan Córdoba ({exchangeRates.NIO})</option>
                            <option value="CRC">Costa Rican Colone ({exchangeRates.CRC})</option>
                            <option value="IDR">Indonesian Rupiah ({exchangeRates.IDR})</option>
                            <option value="AUD">Australian Dollar ({exchangeRates.AUD})</option>
                        </select>
                    </label>
                </div>
            </div>
            <div className='bg-darker r-10 p-10 mr-20 ml-20 bold'>
                <div className='size20 m-20 color-lite'>
                    <label>
                        {isToUsd ? `${currencyConverting()}: $` : 'US Dollars: $'}
                        <input className='dualVideoPlayer p-10 r-5 color-black m-5' type='number' value={usdAmount} onChange={handleInputChange} />
                    </label>
                </div>
            </div>
            <div className='bg-orange size20 timerBox m-20 color-black bold p-30' onClick={handleConversion}>Convert</div>
            {convertedAmount && (
                <div className='size20 color-lite bold p-30 bold m-20 r-10 bg-green'>
                    {isToUsd
                        ? `Converted Amount: ${convertedAmount} USD`
                        : `Converted Amount: ${formatNumber(convertedAmount)} ${selectedCurrency}`}
                </div>
            )}
        </div>
    );
};

export default ExchangeConverter;