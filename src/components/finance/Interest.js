import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import getKey from '../utils/KeyGenerator';

const fundPresets = [
  { label: 'Custom', return: 7.0 },
  { label: 'VOO (S&P 500)', return: 8.5 },
  { label: 'VTI (Total Market)', return: 8.0 },
  { label: 'SPY (S&P 500)', return: 8.2 },
  { label: 'QQQ (Nasdaq 100)', return: 10.0 },
  { label: 'BND (Total Bond)', return: 4.0 }
];

const compoundFrequencies = [
  { label: 'Annual', value: 'annual', freq: 1 },
  { label: 'Monthly', value: 'monthly', freq: 12 },
  { label: 'Daily', value: 'daily', freq: 365 }
];

const buildDurationOptions = (maxYears = 50) => {
  const options = [];
  for (let y = 0.5; y <= maxYears; y += 0.5) {
    options.push(Number(y.toFixed(1)));
  }
  return options;
};

const Interest = () => {
  const [principal, setPrincipal] = useState(10000);
  const [annualReturn, setAnnualReturn] = useState(7.0);
  const [durationYears, setDurationYears] = useState(10);
  const [compounding, setCompounding] = useState('monthly');
  const [monthlyContribution, setMonthlyContribution] = useState(0);
  const [annualContribution, setAnnualContribution] = useState(0);
  const [inflationRate, setInflationRate] = useState(2.5);
  const [feeRate, setFeeRate] = useState(0.03);
  const [taxRate, setTaxRate] = useState(0);
  const [scenarioSpread, setScenarioSpread] = useState(2.0);
  const [selectedFund, setSelectedFund] = useState('Custom');
  const [lumpSumAmount, setLumpSumAmount] = useState(0);
  const [lumpSumYear, setLumpSumYear] = useState(1);
  const [lumpSums, setLumpSums] = useState([]);

  const durationOptions = useMemo(() => buildDurationOptions(50), []);

  const handleFundChange = (value) => {
    setSelectedFund(value);
    const preset = fundPresets.find(item => item.label === value);
    if (preset) {
      setAnnualReturn(preset.return);
    }
  };

  const addLumpSum = () => {
    if (!lumpSumAmount || !lumpSumYear) return;
    setLumpSums(prev => [
      ...prev,
      { id: Date.now(), amount: Number(lumpSumAmount), year: Number(lumpSumYear) }
    ]);
    setLumpSumAmount(0);
  };

  const removeLumpSum = (id) => {
    setLumpSums(prev => prev.filter(item => item.id !== id));
  };

  const summary = useMemo(() => {
    const frequency = compoundFrequencies.find(item => item.value === compounding) || compoundFrequencies[1];
    const durationMonths = Math.round(Number(durationYears) * 12);

    const toMonthlyRate = (annualPercent) => {
      const rate = annualPercent / 100;
      return Math.pow(1 + rate / frequency.freq, frequency.freq / 12) - 1;
    };

    const applySchedule = (annualPercent) => {
      const monthlyRate = toMonthlyRate(annualPercent);
      let balance = Number(principal) || 0;
      let totalContrib = balance;
      let totalInterest = 0;
      let yearStartBalance = balance;
      let contribThisYear = 0;
      let lumpsThisYear = 0;
      const schedule = [];

      for (let month = 1; month <= durationMonths; month += 1) {
        if (Number(monthlyContribution) > 0) {
          balance += Number(monthlyContribution);
          totalContrib += Number(monthlyContribution);
          contribThisYear += Number(monthlyContribution);
        }

        if (Number(annualContribution) > 0 && month % 12 === 0) {
          balance += Number(annualContribution);
          totalContrib += Number(annualContribution);
          contribThisYear += Number(annualContribution);
        }

        for (const entry of lumpSums) {
          const entryMonth = Math.round(Number(entry.year) * 12);
          if (entryMonth === month) {
            balance += Number(entry.amount);
            totalContrib += Number(entry.amount);
            lumpsThisYear += Number(entry.amount);
          }
        }

        const interest = balance * monthlyRate;
        balance += interest;
        totalInterest += interest;

        if (Number(taxRate) > 0 && month % 12 === 0) {
          const gains = balance - yearStartBalance - contribThisYear - lumpsThisYear;
          if (gains > 0) {
            balance -= gains * (Number(taxRate) / 100);
          }
          yearStartBalance = balance;
          contribThisYear = 0;
          lumpsThisYear = 0;
        }

        if (month % 6 === 0 || month === durationMonths) {
          schedule.push({
            year: Number((month / 12).toFixed(1)),
            balance: Number(balance.toFixed(2))
          });
        }
      }

      return {
        schedule,
        finalBalance: Number(balance.toFixed(2)),
        totalContrib: Number(totalContrib.toFixed(2)),
        totalInterest: Number(totalInterest.toFixed(2))
      };
    };

    const baseAnnual = Number(annualReturn) - Number(feeRate) - Number(inflationRate);
    const bestAnnual = baseAnnual + Number(scenarioSpread);
    const worstAnnual = baseAnnual - Number(scenarioSpread);

    const base = applySchedule(baseAnnual);
    const best = applySchedule(bestAnnual);
    const worst = applySchedule(worstAnnual);

    const chartData = base.schedule.map((item, index) => ({
      year: item.year,
      base: item.balance,
      best: best.schedule[index]?.balance ?? item.balance,
      worst: worst.schedule[index]?.balance ?? item.balance
    }));

    return {
      chartData,
      base,
      best,
      worst,
      baseAnnual,
      bestAnnual,
      worstAnnual
    };
  }, [
    annualContribution,
    annualReturn,
    compounding,
    durationYears,
    feeRate,
    inflationRate,
    lumpSums,
    monthlyContribution,
    principal,
    scenarioSpread,
    taxRate
  ]);

  const formatCurrency = (value) => <span className=''>{Number(value || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className='containerDetail' style={{ backgroundColor: '#0f172a', borderRadius: 10, padding: 12 }}>
        <div className='containerDetail color-yellow mb-5'>
          {label} yrs
        </div>
        {payload.map((item) => (
          <div key={getKey(`${item.dataKey}-${label}`)} className='containerDetail color-lite'>
            <span style={{ color: item.color }}>■</span> {item.name}: {formatCurrency(item.value)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className='mt--30'>
      <div className='containerDetail color-yellow bg-lite m-5 p-22 size20 contentLeft'>
        🤑 Interest
      </div>
      <div className='containerDetail bg-lite m-5 p-10'>
        <div className='containerDetail'>
          <div className='containerDetail flexContainer mb-5'>
            <div className='flex2Column contentRight color-yellow p-10'>Starting Amount:</div>
            <input
              className='containerDetail flex2Column inputField'
              type='number'
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
            />
          </div>
          <div className='containerDetail flexContainer mb-5'>
            <div className='flex2Column contentRight color-yellow p-10'>Fund Preset:</div>
            <select
              className='containerDetail flex2Column inputSelect'
              value={selectedFund}
              onChange={(e) => handleFundChange(e.target.value)}
            >
              {fundPresets.map((item) => (
                <option key={item.label} value={item.label}>{item.label}</option>
              ))}
            </select>
          </div>
          <div className='containerDetail flexContainer mb-5'>
            <div className='flex2Column contentRight color-yellow p-10'>Expected Return (%):</div>
            <input
              className='containerDetail flex2Column inputField'
              type='number'
              step='0.1'
              value={annualReturn}
              onChange={(e) => setAnnualReturn(e.target.value)}
            />
          </div>
          <div className='containerDetail flexContainer mb-5'>
            <div className='flex2Column contentRight color-yellow p-10'>Duration (years):</div>
            <select
              className='containerDetail flex2Column inputSelect'
              value={durationYears}
              onChange={(e) => setDurationYears(e.target.value)}
            >
              {durationOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className='containerDetail flexContainer mb-5'>
            <div className='flex2Column contentRight color-yellow p-10'>Compounding:</div>
            <select
              className='containerDetail flex2Column inputSelect'
              value={compounding}
              onChange={(e) => setCompounding(e.target.value)}
            >
              {compoundFrequencies.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </div>
          <div className='containerDetail flexContainer mb-5'>
            <div className='flex2Column contentRight color-yellow p-10'>Monthly Contribution:</div>
            <input
              className='containerDetail flex2Column inputField'
              type='number'
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(e.target.value)}
            />
          </div>
          <div className='containerDetail flexContainer mb-5'>
            <div className='flex2Column contentRight color-yellow p-10'>Annual Contribution:</div>
            <input
              className='containerDetail flex2Column inputField'
              type='number'
              value={annualContribution}
              onChange={(e) => setAnnualContribution(e.target.value)}
            />
          </div>
          <div className='containerDetail flexContainer mb-5'>
            <div className='flex2Column contentRight color-yellow p-10'>Inflation (%):</div>
            <input
              className='containerDetail flex2Column inputField'
              type='number'
              step='0.1'
              value={inflationRate}
              onChange={(e) => setInflationRate(e.target.value)}
            />
          </div>
          <div className='containerDetail flexContainer mb-5'>
            <div className='flex2Column contentRight color-yellow p-10'>Fees (%):</div>
            <input
              className='containerDetail flex2Column inputField'
              type='number'
              step='0.01'
              value={feeRate}
              onChange={(e) => setFeeRate(e.target.value)}
            />
          </div>
          <div className='containerDetail flexContainer mb-5'>
            <div className='flex2Column contentRight color-yellow p-10'>Tax on Gains (%):</div>
            <input
              className='containerDetail flex2Column inputField'
              type='number'
              step='0.1'
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
            />
          </div>
          <div className='containerDetail flexContainer mb-5'>
            <div className='flex2Column contentRight color-yellow p-10'>Scenario Spread (±%):</div>
            <input
              className='containerDetail flex2Column inputField'
              type='number'
              step='0.1'
              value={scenarioSpread}
              onChange={(e) => setScenarioSpread(e.target.value)}
            />
          </div>
        </div>

        <div className='containerDetail mt-10'>
          <div className='containerDetail color-yellow mb-5 contentLeft size20 p-20'>Lump Sum Additions</div>
          <div className='containerDetail flexContainer mb-5'>
            <div className='flex2Column contentRight color-yellow p-10'>Amount:</div>
            <input
              className='containerDetail flex2Column inputField'
              type='number'
              value={lumpSumAmount}
              onChange={(e) => setLumpSumAmount(e.target.value)}
            />
          </div>
          <div className='containerDetail flexContainer mb-5'>
            <div className='flex2Column contentRight color-yellow p-10'>Year:</div>
            <select
              className='containerDetail flex2Column inputSelect'
              value={lumpSumYear}
              onChange={(e) => setLumpSumYear(e.target.value)}
            >
              {durationOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div
            className='containerDetail bg-soft color-dark size20 r-10 mt-10 mb-10 p-10 ht-50 centeredContent button'
            onClick={addLumpSum}
          >
            Add Lump Sum
          </div>
          {lumpSums.length === 0
            ? <div className='containerDetail color-lite'>No lump sums added.</div>
            : <div className='containerDetail'>
                {lumpSums.map((item) => (
                  <div key={getKey(item.id)} className='containerDetail flexContainer mb-5 bg-veryLite mt-5'>
                    <div className='flex3Column pl-10'>{formatCurrency(item.amount)}</div>
                    <div className='flex3Column'>Year {item.year}</div>
                    <div className='flex3Column contentRight pr-10'>
                      <span className='button' onClick={() => removeLumpSum(item.id)}>Remove</span>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>

      <div className='containerDetail bg-lite m-5'>
        <div className='containerDetail color-yellow p-10 contentLeft size20 p-20'>Investment Lifespan</div>
        <div className='containerDetail mt-5'>
          <ResponsiveContainer width='100%' height={320}>
            <LineChart data={summary.chartData} margin={{ top: 10, right: 30, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='year' />
              <YAxis tickFormatter={(value) => `$${Number(value).toLocaleString('en-US')}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type='monotone' dataKey='best' stroke='#34d399' strokeWidth={2} dot={false} name={`Best (${summary.bestAnnual.toFixed(1)}%)`} />
              <Line type='monotone' dataKey='base' stroke='#60a5fa' strokeWidth={2} dot={false} name={`Base (${summary.baseAnnual.toFixed(1)}%)`} />
              <Line type='monotone' dataKey='worst' stroke='#f87171' strokeWidth={2} dot={false} name={`Worst (${summary.worstAnnual.toFixed(1)}%)`} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className='containerDetail mt-5'>
          <div className='containerDetail flexContainer color-lite'>
            <div className='flex3Column color-base'><div className='color-yellow'>{summary.chartData.length/2}yrs:</div> {formatCurrency(summary.base.finalBalance)}</div>
            <div className='flex3Column color-base'><div className='color-yellow'>Contributions: </div>{formatCurrency(summary.base.totalContrib)}</div>
            <div className='flex3Column color-base'><div className='color-yellow'>Interest: </div>{formatCurrency(summary.base.totalInterest)}</div>
          </div>
        </div>
      </div>

      <div className='containerDetail bg-lite m-5'>
        <div className='containerDetail color-yellow size20 contentLeft p-15'>Year-by-Year</div>
        <div className='containerDetail mt-5'>
          {summary.chartData.map((row, index) => (
            <div key={getKey(row.year)} className={`containerDetail flexContainer ${(index === summary.chartData.length - 1) ? '' : 'mb-5'} ${(String(row.year).includes('.')) ? '' : ''}`}>
              <div className='flex4Column pl-10 color-yellow contentRight mr-30'>{row.year} yrs</div>
              <div className='flex4Column color-best'>{formatCurrency(row.best)}</div>
              <div className='flex4Column color-base'>{formatCurrency(row.base)}</div>
              <div className='flex4Column color-worst'>{formatCurrency(row.worst)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Interest;
