import React, { useState, useEffect } from 'react';
import ExchangeRatesConfig from './ExchangeRatesConfig';
import CollapseToggleButton from '../utils/CollapseToggleButton';

const Currency = () => {

    const currencies = {
        MXN: `MXN Pesos`,   // Mexican Peso
        DOP: `DOP Pesos`,   // Dominican Peso
        NIO: `Córdoba`,   // Nicaraguan Cordovas
        CRC: `Colones`,    // Costa Rican Colones
        IDR: `Rupiah`,  // Indonesian Rupiah
        AUD: `AUD`,    // Australian Dollar
    };

    const [exchangeRates, setExchangeRates] = useState({});
    const [collapse, setCollapse] = useState(false);
    const [usdAmount, setUsdAmount] = useState('');
    const [selectedCurrency, setSelectedCurrency] = useState('MXN');
    const [convertedAmount, setConvertedAmount] = useState('');
    const [isToUsd, setIsToUsd] = useState(true);

    useEffect(() => {
        handleConversion();
    }, [usdAmount]);

    const handleConversion = () => {
        if (usdAmount) {
            if (isToUsd) {
                const rate = exchangeRates[selectedCurrency];
                const convertedValue = usdAmount / rate;
                setConvertedAmount(convertedValue.toFixed(2));
            } else {
                const rate = exchangeRates[selectedCurrency];
                const convertedValue = usdAmount * rate;
                setConvertedAmount(convertedValue.toFixed(2));
            }
        }
    };
    const handleInputChange = (event) => {
        setUsdAmount(event.target.value);
    };

    const handleCurrencyChange = (event) => {
        setSelectedCurrency(event.target.value);
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
        <div className='containerBox'>
            <div className='containerBox'>
                <ExchangeRatesConfig onExchangeRatesChange={setExchangeRates}></ExchangeRatesConfig>
            </div>
            <div className='containerBox'>
                <div className='containerBox'>
                    <CollapseToggleButton
                        title={<span className='color-yellow'>Convert Currency</span>}
                        isCollapsed={collapse}
                        setCollapse={setCollapse}
                        className='color-yellow'
                        align='left'
                    />
                </div>
                {
                    (collapse)
                    ? null
                    : <div className='containerBox'>
                        <div 
                            title={`${isToUsd ? 'Convert to USD' : 'Convert from USD'}`}
                            className='button bg-lite size25 timerBox p-30 bold color-lite' 
                            onClick={handleConversionDirection}
                        >
                            {isToUsd ? 'Convert to USD' : 'Convert from USD'}
                        </div>
                        <label className='flexContainer containerInput mt-10'>
                            <div className='flexColumn containerBox p-15 columnRightAlign width-50-percent'>
                                <span className='inputText'>
                                    {!isToUsd ? 'To:' : 'From:'}
                                </span>
                            </div>
                            <div className='flex1Column columnLeftAlign width-50-percent'>
                                <select className='inputSelect' value={selectedCurrency} onChange={handleCurrencyChange}>
                                    <option value="MXN">Mexican Peso ({Number(exchangeRates.MXN).toFixed(3)})</option>
                                    <option value="DOP">Dominican Peso ({Number(exchangeRates.DOP).toFixed(3)})</option>
                                    <option value="NIO">Nicaraguan Córdoba ({Number(exchangeRates.NIO).toFixed(3)})</option>
                                    <option value="CRC">Costa Rican Colone ({Number(exchangeRates.CRC).toFixed(3)})</option>
                                    <option value="IDR">Indonesian Rupiah ({Number(exchangeRates.IDR).toFixed(3)})</option>
                                    <option value="AUD">Australian Dollar ({Number(exchangeRates.AUD).toFixed(3)})</option>
                                </select>
                            </div>
                        </label>
                        <label className='flexContainer containerInput'>
                            <div className='containerBox p-15 flexColumn columnRightAlign width-50-percent inputText'>
                                {isToUsd ? `${currencyConverting()}: $` : 'US Dollars: $'}
                            </div>
                            <div className='flex1Column columnLeftAlign width-50-percent'>
                                <input
                                    id='usd'
                                    name='usd'
                                    className='inputField'
                                    type='number'
                                    value={usdAmount}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </label>
                        <div
                            title='convert'
                            className='button p-30 r-10 mt-10 size25 bg-lite bold'
                            onClick={handleConversion}
                        >
                            Convert
                        </div>
                        {
                            (convertedAmount)
                                ? <div className='containerBox'>
                                    <div className='containerBox color-yellow'>
                                        {(isToUsd)
                                            ? <div className='size35 bold'>
                                                ${Number(convertedAmount).toFixed(2)} USD
                                            </div>
                                            : <div className='size35 bold'>
                                                ${formatNumber(convertedAmount)} {selectedCurrency}
                                            </div>
                                        }
                                    </div>
                                </div>
                                : <div></div>
                        }
                    </div>
                }
            </div>
        </div>
    );
};

export default Currency;