import React, { useState, useEffect } from 'react';

const ExchangeRates = () => {

  // set endpoint and your access key
  //const endpoint = 'latest'
  //const endpoint = '2000-01-17'
  const endpoint = 'convert'
  const access_key = '58e53558ca998da70c28b76dba516368';
  const from = 'USD';
  const to = 'EUR';
  const amount = 25;

  const templateData = {
    success: true,
    timestamp: 1519296206,
    base: "EUR",
    date: "2021-03-17",
    rates: {
          AUD: 1.566015,
          CAD: 1.560132,
          CHF: 1.154727,
          CNY: 7.827874,
          GBP: 0.882047,
          JPY: 132.360679,
          USD: 1.23396
    }
  }

  //const [rates, setRates] = useState(null);
  const [data, setData] = useState(templateData);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch('https://api.exchangeratesapi.io/v1/' + endpoint + '?access_key=' + access_key + '&from=' + from + '&to=' + to + '&amount=' + amount);
        const data = await response.json();
        //alert(JSON.stringify(data.error.code, null, 2));
        setData(templateData);
      } catch (error) {
        //console.error('Error fetching exchange rates:', error);
        setData(templateData);
      }
    };

    fetchRates();
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }
  
  const rates = data.rates || templateData.rates;
  
  return (
    <div>
      <h2>Exchange Rates</h2>
      <ul>
        {Object.entries(data.rates).map(([currency, rate]) => (
          <li key={currency}>
            {currency}: {rate}
          </li>
        ))}
      </ul>
      Error code: {data.error?.code}
      <br/>
      Error message: {data.error?.message}
    </div>
  );
  
};

export default ExchangeRates;