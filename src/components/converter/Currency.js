import React, { useState, useEffect } from 'react';
import ExchangeRatesConfig from './ExchangeRatesConfig';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import icons from '../site/icons';
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
        if (!usdAmount) {
            setConvertedAmount('');
            return;
        }
        const rate = exchangeRates[selectedCurrency];
        if (!rate) return;
        const convertedValue = isToUsd ? usdAmount / rate : usdAmount * rate;
        setConvertedAmount(convertedValue.toFixed(2));
    }, [usdAmount, exchangeRates, selectedCurrency, isToUsd]);

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
        setIsToUsd(prev => !prev);
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
        <div className='containerDetail mt--30'>
            <div className='containerDetail color-yellow bg-lite p-22 size20 contentLeft color-yellow mb-5'>
                <span className=''>{icons.currency}</span> Currency
            </div>
            <div className='containerDetail size20 mb-5 bg-lite'>
                <ExchangeRatesConfig onExchangeRatesChange={setExchangeRates}></ExchangeRatesConfig>
            </div>
            <div className='containerDetail bg-lite'>
                <div className='containerDetail size20 bg-lite'>
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
                    : <div className='containerDetail bg-lite mt-5 size20'>
                        <div 
                            title={`${isToUsd ? 'Convert to USD' : 'Convert from USD'}`}
                            className='button bg-green size25 timerBox p-30 bold color-yellow' 
                            onClick={handleConversionDirection}
                        >
                            {isToUsd ? 'Convert to USD' : 'Convert from USD'}
                        </div>
                        <div className='containerDetail mt-5'>
                            <label className='flexContainer containerDetail bg-lite'>
                                <div className='flexColumn contentRight'>
                                    <span className='inputText ml-10 color-yellow'>
                                        {!isToUsd ? 'To:' : 'From:'}
                                    </span>
                                </div>
                                <div className='flexColumn columnLeftAlign'>
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
                            <label className='flexContainer containerDetail bg-lite mt-5'>
                                <div className='color-yellow flexColumn columnRightAlign inputText p-10'>
                                    {isToUsd ? `${currencyConverting()}: $` : 'US Dollars: $'}
                                </div>
                                <div className='flex2Column columnLeftAlign width-50-percent'>
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
                        </div>
                        <div
                            title='convert'
                            className='button p-30 r-10 mt-5 size25 bg-green bold color-yellow'
                            onClick={handleConversion}
                        >
                            Convert
                        </div>
                        {
                            (convertedAmount)
                                ? <div className=''>
                                    <div className='containerDetail p-30 mt-10 color-yellow'>
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