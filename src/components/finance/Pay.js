import React, { useEffect, useMemo, useState } from 'react';
import CollapseToggleButton from '../utils/CollapseToggleButton';

const STORAGE_KEY = 'payCalculatorState';

const DEFAULT_PAY_STATE = {
    incomeType: 'annual',
    annualSalary: '75000',
    hourlyRate: '30',
    hoursPerWeek: '40',
    hoursPerDay: '8',
    federalTaxPercent: '22',
    stateTaxPercent: '5',
    payWeeks: '2',
    incomeSectionCollapsed: false,
    taxesSectionCollapsed: false
};

const loadPayState = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_PAY_STATE;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return DEFAULT_PAY_STATE;
        return { ...DEFAULT_PAY_STATE, ...parsed };
    } catch (error) {
        return DEFAULT_PAY_STATE;
    }
};

const parseNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const formatMoney = (value) => `$${parseNumber(value).toFixed(2)}`;

const Pay = () => {
    const [storedState] = useState(loadPayState);
    const [incomeType, setIncomeType] = useState(storedState.incomeType);
    const [annualSalary, setAnnualSalary] = useState(storedState.annualSalary);
    const [hourlyRate, setHourlyRate] = useState(storedState.hourlyRate);
    const [hoursPerWeek, setHoursPerWeek] = useState(storedState.hoursPerWeek);
    const [hoursPerDay, setHoursPerDay] = useState(storedState.hoursPerDay);
    const [federalTaxPercent, setFederalTaxPercent] = useState(storedState.federalTaxPercent);
    const [stateTaxPercent, setStateTaxPercent] = useState(storedState.stateTaxPercent);
    const [payWeeks, setPayWeeks] = useState(storedState.payWeeks);
    const [incomeSectionCollapsed, setIncomeSectionCollapsed] = useState(!!storedState.incomeSectionCollapsed);
    const [taxesSectionCollapsed, setTaxesSectionCollapsed] = useState(!!storedState.taxesSectionCollapsed);

    useEffect(() => {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    incomeType,
                    annualSalary,
                    hourlyRate,
                    hoursPerWeek,
                    hoursPerDay,
                    federalTaxPercent,
                    stateTaxPercent,
                    payWeeks,
                    incomeSectionCollapsed,
                    taxesSectionCollapsed
                })
            );
        } catch (error) {
            // storage unavailable
        }
    }, [
        annualSalary,
        federalTaxPercent,
        hourlyRate,
        hoursPerDay,
        hoursPerWeek,
        incomeType,
        incomeSectionCollapsed,
        payWeeks,
        stateTaxPercent,
        taxesSectionCollapsed
    ]);

    const summary = useMemo(() => {
        const selectedPayWeeks = parseNumber(payWeeks, 2) === 1 ? 1 : 2;
        const weeklyHours = Math.max(0, parseNumber(hoursPerWeek));
        const dailyHours = Math.max(0, parseNumber(hoursPerDay));
        const federalTaxRate = Math.max(0, parseNumber(federalTaxPercent)) / 100;
        const stateTaxRate = Math.max(0, parseNumber(stateTaxPercent)) / 100;

        const grossAnnual = incomeType === 'annual'
            ? Math.max(0, parseNumber(annualSalary))
            : Math.max(0, parseNumber(hourlyRate)) * weeklyHours * 52;

        const grossWeekly = grossAnnual / 52;
        const grossPaycheck = grossWeekly * selectedPayWeeks;
        const federalTax = grossPaycheck * federalTaxRate;
        const stateTax = grossPaycheck * stateTaxRate;
        const totalTax = federalTax + stateTax;
        const netPaycheck = grossPaycheck - totalTax;

        const effectiveHourly = incomeType === 'hourly'
            ? Math.max(0, parseNumber(hourlyRate))
            : (weeklyHours > 0 ? grossAnnual / (weeklyHours * 52) : 0);

        const grossDaily = effectiveHourly * dailyHours;
        const netDaily = grossDaily - (grossDaily * (federalTaxRate + stateTaxRate));

        return {
            selectedPayWeeks,
            grossAnnual,
            grossPaycheck,
            federalTax,
            stateTax,
            totalTax,
            netPaycheck,
            effectiveHourly,
            grossDaily,
            netDaily
        };
    }, [
        annualSalary,
        federalTaxPercent,
        hourlyRate,
        hoursPerDay,
        hoursPerWeek,
        incomeType,
        payWeeks,
        stateTaxPercent
    ]);

    return (
        <div className='containerDetail mt--30 width--10'>
            <div className='containerDetail p-20 bg-lite color-lite size30 contentLeft mb-5'>
                💰 Pay
            </div>

            <div className='containerDetail bg-lite mb-5'>
                <div className='containerDetail color-yellow mb-5 size20 bg-lite'>
                    <CollapseToggleButton
                        title={<span className='color-yellow'>Income Type</span>}
                        isCollapsed={incomeSectionCollapsed}
                        setCollapse={setIncomeSectionCollapsed}
                        align='left'
                    />
                </div>
                {
                    incomeSectionCollapsed
                        ? null
                        : <div className='containerDetail'>
                    <select
                        className='containerDetail p-10 m-5 color-lite width--10'
                        value={incomeType}
                        onChange={(event) => setIncomeType(event.target.value)}
                    >
                        <option value='annual'>Annual Salary</option>
                        <option value='hourly'>Hourly Rate</option>
                    </select>

                {
                    incomeType === 'annual'
                        ? <input
                            className='containerDetail p-10 m-5 color-lite width--10'
                            type='number'
                            placeholder='Annual salary'
                            value={annualSalary}
                            onChange={(event) => setAnnualSalary(event.target.value)}
                        />
                        : <input
                            className='containerDetail p-10 m-5 color-lite width--10'
                            type='number'
                            placeholder='Hourly rate'
                            value={hourlyRate}
                            onChange={(event) => setHourlyRate(event.target.value)}
                        />
                }

                <input
                    className='containerDetail p-10 m-5 color-lite width--10'
                    type='number'
                    placeholder='Hours per week'
                    value={hoursPerWeek}
                    onChange={(event) => setHoursPerWeek(event.target.value)}
                />
                <input
                    className='containerDetail p-10 m-5 color-lite width--10'
                    type='number'
                    placeholder='Hours per day'
                    value={hoursPerDay}
                    onChange={(event) => setHoursPerDay(event.target.value)}
                />
                </div>
                }
            </div>

            <div className='containerDetail bg-lite mb-5'>
                <div className='containerDetail color-yellow mb-5 size20 bg-lite'>
                    <CollapseToggleButton
                        title={<span className='color-yellow'>Taxes & Paycheck</span>}
                        isCollapsed={taxesSectionCollapsed}
                        setCollapse={setTaxesSectionCollapsed}
                        align='left'
                    />
                </div>
                {
                    taxesSectionCollapsed
                        ? null
                        : <div className='containerDetail mb-5'>
                    <input
                        className='containerDetail p-10 m-5 color-lite width--10'
                        type='number'
                        placeholder='Federal tax %'
                        value={federalTaxPercent}
                        onChange={(event) => setFederalTaxPercent(event.target.value)}
                    />
                    <input
                        className='containerDetail p-10 m-5 color-lite width--10'
                        type='number'
                        placeholder='State tax %'
                        value={stateTaxPercent}
                        onChange={(event) => setStateTaxPercent(event.target.value)}
                    />
                    <select
                        className='containerDetail p-10 m-5 color-lite width--10'
                        value={payWeeks}
                        onChange={(event) => setPayWeeks(event.target.value)}
                    >
                        <option value='1'>1 week paycheck</option>
                        <option value='2'>2 week paycheck</option>
                    </select>
                </div>
                }
            </div>

            <div className='containerDetail bg-lite'>
                <div className='containerDetail color-yellow p-20 contentLeft mb-5 size20 bg-lite'>
                    Summary
                </div>
                <div className='containerDetail mb-5'>
                    <div className='containerDetail pr-10 pt-10 pb-10 color-lite contentLeft mb-5 pl-20 pl-10'><span className='color-yellow'>Gross annual:</span> {formatMoney(summary.grossAnnual)}</div>
                    <div className='containerDetail pr-10 pt-10 pb-10 color-lite contentLeft mb-5 pl-20 pl-10'><span className='color-yellow'>Gross paycheck ({summary.selectedPayWeeks} week):</span> {formatMoney(summary.grossPaycheck)}</div>
                    <div className='containerDetail pr-10 pt-10 pb-10 color-lite contentLeft mb-5 pl-20 pl-10'><span className='color-yellow'>Federal tax:</span> -{formatMoney(summary.federalTax)}</div>
                    <div className='containerDetail pr-10 pt-10 pb-10 color-lite contentLeft mb-5 pl-20 pl-10'><span className='color-yellow'>State tax:</span> -{formatMoney(summary.stateTax)}</div>
                    <div className='containerDetail pr-10 pt-10 pb-10 color-lite contentLeft mb-5 pl-20 pl-10'><span className='color-yellow'>Total tax:</span> -{formatMoney(summary.totalTax)}</div>
                </div>
                <div className='containerDetail p-20 color-lite contentLeft mb-5'>
                    <span className='color-yellow mr-5'>
                        Effective hourly:
                    </span> 
                    {formatMoney(summary.effectiveHourly)}
                </div>
                <div className='containerDetail p-20 color-lite contentLeft mb-5 size20 bg-green'>
                    <span className='color-yellow mr-5'>
                        Take-home paycheck:
                    </span> 
                    {formatMoney(summary.netPaycheck)}
                </div>
                <div className='containerDetail mb-5'>
                    <div className='containerDetail pr-10 pt-10 pb-10 color-lite contentLeft mb-5 pl-20'>
                        <span className='color-yellow mr-5'>
                            Effective hourly:
                        </span> 
                        {formatMoney(summary.effectiveHourly)}
                    </div>
                    <div className='containerDetail pr-10 pt-10 pb-10 color-lite contentLeft mb-5 pl-20 pl-10'>
                        <span className='color-yellow mr-5'>Gross per day:</span>
                        {formatMoney(summary.grossDaily)}
                    </div>
                </div>
                <div className='containerDetail p-20 color-lite contentLeft size20 bg-blue'>
                    <span className='color-yellow mr-5'>
                        Take-home per day:
                    </span>
                    {formatMoney(summary.netDaily)}</div>
            </div>
        </div>
    );
};

export default Pay;
