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
        <div className='p-10 r-10 bg-tinted m-10'>
            <ExchangeRatesConfig onExchangeRatesChange={setExchangeRates}></ExchangeRatesConfig>
            <div className='button bg-lite size25 timerBox m-20 p-30 bold color-lite' onClick={handleConversionDirection}>
                {isToUsd ? 'Convert to USD' : 'Convert from USD'}
            </div>
            <div className='bg-tinted r-10 p-20 ml-20 mr-20 mb-1 bold'>
                <div className='size20 color-lite'>
                    <label className='flexContainer containerInput'>
                        <div className='columnRightAlign'>
                            <span className='inputText'>
                                {!isToUsd ? 'To:' : 'From:'}
                            </span>
                        </div>
                        <div className='columnLeftAlign'>
                            <select className='inputSelect' value={selectedCurrency} onChange={handleCurrencyChange}>
                                <option value="MXN">Mexican Peso ({Number(exchangeRates.MXN).toFixed(3)})</option>
                                <option value="NIO">Nicaraguan Córdoba ({Number(exchangeRates.NIO).toFixed(3)})</option>
                                <option value="CRC">Costa Rican Colone ({Number(exchangeRates.CRC).toFixed(3)})</option>
                                <option value="IDR">Indonesian Rupiah ({Number(exchangeRates.IDR).toFixed(3)})</option>
                                <option value="AUD">Australian Dollar ({Number(exchangeRates.AUD).toFixed(3)})</option>
                            </select>
                        </div>
                    </label>
                </div>
            </div>
            <div className='bg-tinted r-10 p-20 mr-20 ml-20 bold'>
                <div className='size20 color-lite'>
                    <label className='flexContainer containerInput'>
                        <div className='columnRightAlign'>
                            <span className='inputText'>
                                {isToUsd ? `${currencyConverting()}: $` : 'US Dollars: $'}
                            </span>
                        </div>
                        <div className='columnLeftAlign width-50-percent'>
                            <input
                                className='inputField' 
                                type='number' 
                                value={usdAmount} 
                                onChange={handleInputChange} 
                            />
                        </div>
                    </label>
                </div>
            </div>
            <div className='button p-30 r-10 m-20 size25 color-lite bg-lite bold' onClick={handleConversion}>Convert</div>
            {convertedAmount && (
                <div className='p-10 r-5 m-5 flex3Column size15 color-lite bg-lite bold'>
                    {isToUsd
                        ? `Converted Amount: ${convertedAmount} USD`
                        : `Converted Amount: ${formatNumber(convertedAmount)} ${selectedCurrency}`}
                </div>
            )}
        </div>
    );
};

export default ExchangeConverter;