import React, { useState, useEffect } from 'react';
import menu from '../../assets/images/menuYellow.png';
import fetchTimer from '../utils/FetchTimer';
import initializeData from '../utils/InitializeData';
import CollapseToggleButton from '../utils/CollapseToggleButton';

const ExchangeRatesConfig = ({ onExchangeRatesChange }) => {

    const defaultRates = {
        USD: 1,
        MXN: 17.16,   // Mexican Peso
        DOP: 58.95,   // Dominican Peso
        NIO: 36.55,   // Nicaraguan Cordovas
        CRC: 541.23,    // Costa Rican Colones
        IDR: 15045.30,  // Indonesian Rupiah
        AUD: 1.50,    // Australian Dollar
    }

    const [exchangeRates, setExchangeRates] = useState(defaultRates);
    const [collapse, setCollapse] = useState(true);

    useEffect(() => {
        const templateData = {
            AUD: 1.566015,
            CAD: 1.560132,
            CHF: 1.154727,
            CNY: 7.827874,
            GBP: 0.882047,
            JPY: 132.360679,
            USD: 1.23396
        }
        const savedExchangeRates = initializeData('exchangeRates', templateData);
        const dataServer = 'http://localhost:3002/currency';
        const fetchRates = async (url) => {
            try {
                //const response = await fetch('https://api.exchangeratesapi.io/v1/' + endpoint + '?access_key=' + access_key + '&from=' + from + '&to=' + to + '&amount=' + amount);
                const response = await fetch(url);
                const data = await response.json();

                console.log(`data: ${JSON.stringify(data.date, null, 2)}`);
                console.log(`data: ${JSON.stringify(data.timestamp, null, 2)}`);
                console.log(`data: ${JSON.stringify(data.rates, null, 2)}`);

                setExchangeRates(data.rates);
                onExchangeRatesChange(exchangeRates)
            } catch (error) {
                //console.error('Error fetching exchange rates:', error);
                setExchangeRates(defaultRates);
                onExchangeRatesChange(exchangeRates)
            }
        };
        const isObjectEmpty = (obj) => Object.keys(obj).length === 0 && obj.constructor === Object;
        const currentExchangeRates = (!isObjectEmpty(savedExchangeRates)) 
            ? savedExchangeRates 
            : fetchTimer('ExchangeRatesConfig', dataServer, fetchRates);
        
        if (!isObjectEmpty(currentExchangeRates) && (currentExchangeRates === savedExchangeRates)) {
            setExchangeRates(currentExchangeRates);
            onExchangeRatesChange(exchangeRates);
        }

    }, []);

    useEffect(() => {
        localStorage.setItem('exchangeRates', JSON.stringify(exchangeRates));
        onExchangeRatesChange(exchangeRates);
    }, [exchangeRates]);

    useEffect(() => {
        localStorage.setItem('exchangeRates', JSON.stringify(exchangeRates));
        onExchangeRatesChange(exchangeRates); // Invoke the callback when rates change
    }, [exchangeRates, onExchangeRatesChange]);

    const toggleSettings = () => {
        setCollapse(!collapse)
    }

    const handleRateChange = (rate, value) => {
        console.log(`handleRateChange 1 - value: ${value} rate: ${rate}`);
        setExchangeRates(prevState => ({
            ...prevState,
            [rate]: value
        }));
        onExchangeRatesChange(exchangeRates);
    }
    const handleRateEnter = (e) => {
        console.log(`handleRateEnter:1 - key: ${e.key}`);
        if (e.key === 'Enter') {
            console.log(`handleRateEnter:2 - key: ${e.key}`);
            toggleSettings();
        }
    }

    return (
        <div>
            <div>
                {/*
                    <img 
                        title='exchange rates'
                        className='color-yellow button' 
                        src={menu} alt='open menu' 
                        onClick={() => toggleSettings()} 
                    /> 
                */}
                <div className='containerBox'>
                    <CollapseToggleButton
                        title={<span className='color-yellow'>Exchange Rates</span>}
                        isCollapsed={collapse}
                        setCollapse={setCollapse}
                        className='color-yellow' 
                        align='left'
                    />
                </div>
            </div>
            {!collapse ? (
                Object.keys(exchangeRates).map(rate => (
                    <div key={rate}>
                        <label
                            className='p-20 m-5 color-lite bold'
                            htmlFor={rate}
                        >
                            {rate}
                        </label>
                        <input
                            className='p-20 m-5 color-lite bold bg-black'
                            type='number'
                            id='rate'
                            name='rate'
                            value={exchangeRates[rate]}
                            onChange={e => handleRateChange(rate, e.target.value)}
                            onKeyDown={e => handleRateEnter(e)}
                        />
                    </div>
                ))
            ) : (
                null
            )}
        </div>
    );

};

export default ExchangeRatesConfig;