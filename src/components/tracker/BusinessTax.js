import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import initializeData from './initializeData';
import { newDate } from '../utils/Dates';
import icons from '../site/icons';

const categories = [
    'Home Office Expenses',
    'Office Equipment & Supplies',
    'Vehicle Expenses',
    'Travel & Meals',
    'Professional Services',
    'Startup & Marketing',
    'Communications'
];

const BusinessTax = () => {
    const today = () => newDate();
    const [income, setIncome] = useState('');
    const [expenses, setExpenses] = useState([]);
    const [entry, setEntry] = useState({ date: today(), category: '', amount: '', notes: '' });
    const [edit] = useState({ date: today(), category: '', amount: '', notes: '' });
    const [activeTab, setActiveTab] = useState('tracker');
    const [editIndex, setEditIndex] = useState();
    const [addCollapse, setAddCollapse] = useState(true);

    const handleChange = (e) => {
        const { name, id, value } = e.target;
        


        if (name === 'income') {
            setIncome(value)
        } else if (name.includes('edit-')) {
            const newName = String(name).replace('edit-','');
            const newExpenses = [...expenses];
            newExpenses[id][newName] = (newName === 'amount') ? Number(value) : value;
            //setEdit((prev) => ({ ...prev, [newName]: value }));
            setExpenses(newExpenses);
        } else {
            setEntry((prev) => ({ ...prev, [name]: value }));
        }
    };

    const addExpense = () => {
        if (!entry.category || !entry.amount) return;
        setExpenses((prev) => [...prev, { ...entry, amount: parseFloat(entry.amount) }]);
        setEntry({ date: today(), category: '', amount: '', notes: '' });
        setAddCollapse(true)
    };

    const categoryTotals = categories.map((category) => {
        const total = expenses
            .filter((e) => e.category === category)
            .reduce((acc, curr) => acc + curr.amount, 0);
        return { category, total };
    });

    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const quarterlyEstimates = quarters.map((q, i) => {
    const expensesTotal = categoryTotals.reduce((sum, cat) => sum + cat.total, 0) / 4;
        const taxable = income - expensesTotal;
        return {
            quarter: q,
            income,
            expenses: expensesTotal,
            taxable,
            tax: taxable * 0.25,
        };
    });
    useEffect(() => {
        const localIncome = initializeData('taxIncome', 0);
        setIncome(localIncome ?? '');
        const localExpenses = initializeData('taxExpenses', []);
        setExpenses(localExpenses);
        const localEditIndex = initializeData('taxEditIndex', null);
        setEditIndex(localEditIndex);
    }, []);
    useEffect(() => {
    }, [entry]);
    useEffect(() => {
    }, [edit]);
    useEffect(() => {
        localStorage.setItem('taxIncome', income);
    }, [income]);
    useEffect(() => {
        localStorage.setItem('taxExpenses', JSON.stringify(expenses));
    }, [expenses]);
    useEffect(() => {
        localStorage.setItem('taxEditIndex', editIndex);
    }, [editIndex]);

    return (
        <div className='tax-tracker containerDetail mt--30'>
            <div className='containerDetail color-lite bg-dkGreen m-5 p-22 size30 contentLeft'>
                <span className='m-5 text-outline-lite'>{icons.businesstax}</span> Business Tax
            </div>
            <div className='tabs containerDetail m-5 size20 bg-lite color-lite flexContainer bg-dkGreen'>
                <div 
                    className='containerDetail m-5 size20 bg-lite color-yellow button flex3Column bg-green' 
                    onClick={() => setActiveTab('tracker')}
                >
                    Expense Tracker
                </div>
                <div 
                    className='containerDetail m-5 size20 bg-lite color-yellow button flex3Column bg-green' 
                    onClick={() => setActiveTab('summary')}
                >
                    Summary
                </div>
                <div 
                    className='containerDetail m-5 size20 bg-lite color-yellow button flex3Column bg-green' 
                    onClick={() => setActiveTab('quarterly')}
                >
                    Quarterly Estimate
                </div>
            </div>

            {activeTab === 'tracker' && (
                <div className='tracker-tab'>
                    <div className='containerDetail p-15 m-5 size20 bg-lite color-lite flexContainer bg-lite'>
                        <div className='containerDetail p-15 m-5 flex2Column contentRight color-yellow b size20'>
                            Quarterly income: 
                        </div>
                        <input
                            className='flexColumn containerDetail button w-100 m-5 p-10 color-lite'
                            name='income'
                            value={income ?? ''}
                            onChange={handleChange}
                            placeholder={income || 0}
                        />
                    </div>
                    <div className=''>
                    {
                        (!addCollapse)
                        ? null
                        : <div className='containerDetail p-15 m-5 size20 bg-lite color-lite button contentLeft bg-green' onClick={() => setAddCollapse(false)}>
                                    <span className='color-yellow bold size30'><span className='text-outline-lite'>➕</span> Add Expense</span>
                        </div>
                    }
                    {
                        (addCollapse)
                        ? null
                        : <div className='containerDetail p-15 m-5 size20 bg-lite color-lite bg-lite'>
                            <div className='input-row containerDetail p-15 m-5 size20 bg-lite color-lite flexContainer'>
                                <input 
                                    className='containerDetail button flex2Column w-100 m-5 p-10 color-lite' 
                                    name='date' 
                                    value={entry.date} 
                                    onChange={handleChange} 
                                    placeholder='Date' 
                                />
                                <input 
                                    className='containerDetail button flex2Column w-100 m-5 p-10 color-lite' 
                                    name='amount' 
                                    value={entry.amount} 
                                    onChange={handleChange} 
                                    placeholder='Amount' 
                                    type='number' 
                                />
                            </div>
                            <div className='input-row containerDetail p-15 m-5 size20 bg-lite color-lite'>
                                <input 
                                    className='containerDetail button p-10 color-lite width-100-percent' 
                                    name='category' 
                                    value={entry.category} 
                                    onChange={handleChange} 
                                    placeholder='Category' 
                                    list='category-list-add' 
                                />
                            </div>
                            <datalist id='category-list-add'>
                                {categories.map((c) => (
                                    <option key={c} value={c} />
                                ))}
                            </datalist>
                            <div className='containerDetail p-15 m-5 size20 bg-lite color-lite'>
                                <input 
                                    className='containerDetail button p-10 color-lite width-100-percent' 
                                    name='notes' 
                                    value={entry.notes} 
                                    onChange={handleChange} 
                                    placeholder='Notes' 
                                />
                            </div>
                            <div 
                                className='containerDetail p-15 m-5 size20 bg-lite color-lite button bg-green' 
                                onClick={addExpense}
                            >
                                Add Expense
                            </div>
                            <div 
                                className='containerDetail p-15 m-5 size20 bg-lite color-lite button bg-green' 
                                onClick={() => setAddCollapse(true)}
                            >
                                Cancel
                            </div>
                        </div>
                    }
                    </div>
                    <div className='size20 color-lite'>
                        {expenses.map((e, idx) => (
                            <div className='size20 color-lite contentLeft mb-5' key={idx}>
                                <div className='containerDetail button bg-lite'>
                                    <div className='containerDetail flexContainer color-dark bg-yellow' onClick={() => setEditIndex((editIndex === idx) ? null : idx)}>
                                        <div className='flex2Column pt-15 pl-10'>
                                            {e.date || '(No Date)'}
                                        </div>
                                        <div className='flexColumn flexContainer'>
                                            <div 
                                                title='edit'
                                                className='containerDetail p-10 m-5 flexColumn button'
                                            >
                                                ✏️
                                            </div>
                                            <div 
                                                title='delete'
                                                className='containerDetail p-10 m-5 flexColumn button'
                                            >
                                                🗑️
                                            </div>
                                        </div>
                                        
                                    </div>
                                     <div className='flexContainer'>
                                        <div className='containerDetail flex2Column p-15 mt-5 size20 bg-lite color-lite color-graphite' onClick={() => setEditIndex((editIndex === idx) ? null : idx)}>
                                            {e.category}:
                                        </div>
                                        <div className='containerDetail flex2Column p-15 ml-5 mt-5 size20 bg-lite color-lite button i color-graphite' onClick={() => setEditIndex((editIndex === idx) ? null : idx)}>
                                            {e.notes}
                                        </div>
                                    </div>
                                    <div className='containerDetail p-15 mt-5 size20 bg-lite color-yellow' onClick={() => setEditIndex((editIndex === idx) ? null : idx)}>
                                        ${e.amount.toFixed(2)}
                                    </div>
                                    
                                </div>
                                {
                                    (editIndex === idx)
                                    ? <div className='containerDetail p-15 m-5 size20 bg-lite color-lite bg-lite mt-20'>
                                        <div className='containerDetail p-15 m-5 size20 bg-lite color-lite flexContainer'>
                                            <div className='flex2Column contentRight color-yellow'>
                                                <div className='p-15 m-5'>
                                                    Date:
                                                </div>
                                            </div>
                                            <div className='flex2Column'>
                                                    <input 
                                                        className='containerDetail button flex5Column m-5 p-10 color-lite width-100-percent' 
                                                        id={idx}
                                                        name='edit-date' 
                                                        value={e.date ?? ''} 
                                                        onChange={handleChange} 
                                                        placeholder='Date' 
                                                    />
                                            </div>
                                        </div>
                                        <div className='containerDetail p-15 m-5 size20 bg-lite color-lite flexContainer'>
                                            <div className='flex2Column contentRight color-yellow'>
                                                <div className='p-15 m-5'>
                                                    Category:
                                                </div>
                                            </div>
                                            <div className='flex2Column'>
                                                    <input 
                                                        className='containerDetail button flex5Column m-5 p-10 color-lite width-100-percent' 
                                                        id={idx}
                                                        name='edit-category' 
                                                        value={e.category ?? ''} 
                                                        onChange={handleChange} 
                                                        placeholder='Category' 
                                                        list='category-list-edit' 
                                                    />
                                            </div> 
                                        </div>
                                        <div className='containerDetail p-15 m-5 size20 bg-lite color-lite flexContainer'>
                                            <div className='flex2Column contentRight color-yellow'>
                                                <div className='p-15 m-5'>
                                                    Amount:
                                                </div>
                                            </div>
                                            <div className='flex2Column'>
                                                <input 
                                                    className='containerDetail button flex5Column m-5 p-10 color-lite width-100-percent' 
                                                    id={idx}
                                                    name='edit-amount' 
                                                    value={e.amount ?? ''} 
                                                    onChange={handleChange} 
                                                    placeholder='Amount' 
                                                    type='number' 
                                                />
                                            </div>
                                        </div>
                                        <div className='containerDetail p-15 m-5 size20 bg-lite color-lite  flexContainer'>
                                            <div className='flex2Column contentRight color-yellow'>
                                                <div className='p-15 m-5'>
                                                    Notes:
                                                </div>
                                            </div>
                                            <div className='flex2Column'>
                                                <input 
                                                    className='containerDetail button flex5Column m-5 p-10 color-lite width-100-percent' 
                                                    id={idx}
                                                    name='edit-notes' 
                                                    value={e.notes ?? ''} 
                                                    onChange={handleChange} 
                                                    placeholder='Notes' 
                                                />
                                            </div>
                                        </div>
                                        <div className='input-row containerDetail p-15 m-5 size20 bg-lite color-lite flexContainer'>
                                            <datalist id='category-list-edit'>
                                                {categories.map((c) => (
                                                    <option key={c} value={c} />
                                                ))}
                                            </datalist>
                                        </div>
                                        <div className='containerDetail p-15 m-5 size20 bg-lite color-lite bg-green color-lite button contentCenter' onClick={() => setEditIndex((editIndex === idx) ? null : idx)}>
                                            submit
                                        </div>
                                    </div>
                                    : null
                                }
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'summary' && (
                <div className='summary-tab' style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart data={categoryTotals}>
                            <XAxis dataKey='category' tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor='end' />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey='total' fill='#4f46e5' />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {activeTab === 'quarterly' && (
                <div className='containerDetail p-15 m-5 size20 bg-lite color-lite h-scroll'>
                    <table className='width-100-percent'>
                        <thead>
                            <tr className='bg-dkGreen text-left'>
                                <th className='containerDetail p-15 m-5 size20 bg-lite color-lite color-yellow'>Quarter</th>
                                <th className='containerDetail p-15 m-5 size20 bg-lite color-lite color-yellow'>Estimated Income</th>
                                <th className='containerDetail p-15 m-5 size20 bg-lite color-lite color-yellow'>Estimated Expenses</th>
                                <th className='containerDetail p-15 m-5 size20 bg-lite color-lite color-yellow'>Taxable Income</th>
                                <th className='containerDetail p-15 m-5 size20 bg-lite color-lite color-yellow'>Estimated Tax (25%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quarterlyEstimates.map((q, index) => (
                                <tr
                                    key={q.quarter}
                                    className={index % 2 === 0 ? 'bg-lite' : 'bg-blue text-white'}
                                >
                                    <td className='containerDetail p-15 m-5 size20 bg-lite color-lite font-bold'>{q.quarter}</td>
                                    <td className='containerDetail p-15 m-5 size20 bg-lite color-lite'>${q.income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td className='containerDetail p-15 m-5 size20 bg-lite color-lite'>${q.expenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td className='containerDetail p-15 m-5 size20 bg-lite color-lite'>${q.taxable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td className='containerDetail p-15 m-5 size20 bg-lite color-lite text-yellow'>${q.tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            )}
        </div>
    );
}
export default BusinessTax;