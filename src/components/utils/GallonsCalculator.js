import React, { useState, useEffect } from 'react';

const GallonsCalculator = () => {
  const [exchangeRate, setExchangeRate] = useState(0);
  const [pricePerLiter, setPricePerLiter] = useState(0);
  const [pricePerLiterUSD, setPricePerLiterUSD] = useState(0);
  const [litersPurchased, setLitersPurchased] = useState(0);
  const [gallons, setGallons] = useState(0);
  const [usdPerGallon, setUsdPerGallon] = useState(0);
  const [totalUSD, setTotalUSD] = useState(0);
  const [totalPesos, setTotalPesos] = useState(0);

  useEffect(() => {
    const newTotalUSD = (gallons * usdPerGallon);
    setTotalUSD(newTotalUSD.toFixed(2));
  }, [gallons, usdPerGallon]);

  const calculate = () => {
    // Convert pricePerLiter from foreign currency to USD
    const pricePerLiterUSD = pricePerLiter / exchangeRate;

    // Calculate gallons
    const newGallons = litersPurchased * 0.264172;
    setGallons(newGallons.toFixed(2));

    // Calculate USD per gallon
    const newUsdPerGallon = pricePerLiterUSD * 3.78541;
    setUsdPerGallon(newUsdPerGallon.toFixed(2));

  };

  const handleCalculate = () => {
    calculate();

    const newTotalPesos = (litersPurchased * pricePerLiter);
    setTotalPesos(newTotalPesos.toFixed(2));
  };

  return (
    <div>
      <h1 className='color-soft'>Gas Price Converter</h1>
      <label className="flexContainer bg-veryLite r-10 m-5">
        <div className="columnRightAlign width-50-percent">
          <span className='bg-tinted r-5 w-200 p-10 bold color-soft'>Exchange Rate:</span>
        </div>
        <div className="p-10 columnLeftAlign width-50-percent">
          <input className='r-5 p-10 w-200 bg-darker color-soft'
            type="number"
            value={exchangeRate}
            onChange={(e) => setExchangeRate(e.target.value)}
          />
        </div>
      </label>
      <label className="flexContainer bg-veryLite r-10 m-5">
        <div className="columnRightAlign width-50-percent">
          <span className='bg-tinted r-5 w-200 p-10 bold color-soft'>Pesos per Liter:</span>
        </div>
        <div className="p-10 columnLeftAlign width-50-percent">
          <input className='r-5 p-10 w-200 bg-darker color-soft'
            type="number"
            value={pricePerLiter}
            onChange={(e) => setPricePerLiter(e.target.value)}
          />
        </div>
      </label>
      <label className="flexContainer bg-veryLite r-10 m-5">
        <div className="columnRightAlign width-50-percent">
          <span className='bg-tinted r-5 w-200 p-10 bold color-soft'>Total Liters:</span>
        </div>
        <div className="p-10 columnLeftAlign width-50-percent">
          <input className='r-5 p-10 w-200 bg-darker color-soft'
            type="number"
            value={litersPurchased}
            onChange={(e) => setLitersPurchased(e.target.value)}
          />
        </div>
      </label>
      <button className='myButton mt-20' onClick={handleCalculate}>Calculate</button>
      <div className='mt-20 color-soft'>
        <div className="flexContainer bg-tinted r-5 m-5">
          <div className="columnRightAlign width-50-percent p-5 bold">{gallons}</div>
          <div className="columnLeftAlign width-50-percent p-5">gallons</div>
        </div>
        <div className="flexContainer bg-tinted r-5 m-5">
          <div className="columnRightAlign width-50-percent p-5 bold">${usdPerGallon}</div>
          <div className="columnLeftAlign width-50-percent p-5">per gallon</div>
        </div>
        <div className="flexContainer bg-tinted r-5 m-5">
          <div className="columnRightAlign width-50-percent p-5 bold">${totalUSD}</div>
          <div className="columnLeftAlign width-50-percent p-5">dollars</div>
        </div>
        <div className="flexContainer bg-tinted r-5 m-5">
          <div className="columnRightAlign width-50-percent p-5 bold">${totalPesos}</div>
          <div className="columnLeftAlign width-50-percent p-5">pesos</div>
        </div>
      </div>
    </div>
  );
};

export default GallonsCalculator;