import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import initializeData from './initializeData';
import { newDate } from '../utils/Dates';
import CollapseToggleButton from '../utils/CollapseToggleButton';

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
    const [income, setIncome] = useState();
    const [expenses, setExpenses] = useState([]);
    const [entry, setEntry] = useState({ date: today(), category: '', amount: '', notes: '' });
    const [edit, setEdit] = useState({ date: today(), category: '', amount: '', notes: '' });
    const [activeTab, setActiveTab] = useState('tracker');
    const [editIndex, setEditIndex] = useState();
    const [addCollapse, setAddCollapse] = useState();

    const handleChange = (e) => {
        const { name, id, value } = e.target;
        
        console.log(`BusinessTax => handleChage => id: ${id}`);
        console.log(`BusinessTax => handleChage => name: ${name}`);
        console.log(`BusinessTax => handleChage => name: value: ${ value }`);


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
        console.log(`BusinessTax => useEffect => localIncome: ${localIncome}`);
        setIncome(localIncome);
        const localExpenses = initializeData('taxExpenses', []);
        setExpenses(localExpenses);
        const localEditIndex = initializeData('taxEditIndex', null);
        setEditIndex(localEditIndex);
        console.log(`BusinessTax => useEffect => today: ${JSON.stringify(today(),null,2)}`);
    }, []);
    useEffect(() => {
        console.log(`BusinessTax => useEffect => entry: ${JSON.stringify(entry, null, 2)}`);
    }, [entry]);
    useEffect(() => {
        console.log(`BusinessTax => useEffect => edit: ${JSON.stringify(edit, null, 2)}`);
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

    const isEven = (index) => {
        return index % 2 === 0;
    }
    
    return (
        <div className='tax-tracker containerBox'>
            <div className='tabs containerBox flexContainer bg-dkGreen'>
                <div 
                    className='containerBox button flex3Column bg-green' 
                    onClick={() => setActiveTab('tracker')}
                >
                    Expense Tracker
                </div>
                <div 
                    className='containerBox button flex3Column bg-green' 
                    onClick={() => setActiveTab('summary')}
                >
                    Summary
                </div>
                <div 
                    className='containerBox button flex3Column bg-green' 
                    onClick={() => setActiveTab('quarterly')}
                >
                    Quarterly Estimate
                </div>
            </div>

            {activeTab === 'tracker' && (
                <div className='tracker-tab'>
                    <div className='containerBox flexContainer bg-lite'>
                        <div className='containerDetail p-15 m-5 flexColumn contentRight color-yellow b size30'>
                            Quarterly income: 
                        </div>
                        <input
                            className='flex2Column containerDetail button w-100 m-5 p-10 color-lite'
                            name='income'
                            value={income}
                            onChange={handleChange}
                            placeholder={income || 0}
                        />
                    </div>
                    <div className='containerBox'>
                        <CollapseToggleButton
                            title={<span className='color-yellow bold size30'>Add Expense</span>}
                            isCollapsed={addCollapse}
                            setCollapse={setAddCollapse}
                            align='left'
                        />
                    {
                        (addCollapse)
                        ? null
                        : <div className='containerBox bg-lite'>
                            <div className='input-row containerBox flexContainer'>
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
                            <div className='input-row containerBox'>
                                <input 
                                    className='containerDetail button p-10 color-lite width-100-percent' 
                                    name='category' 
                                    value={entry.category} 
                                    onChange={handleChange} 
                                    placeholder='Category' 
                                    list='category-list' 
                                />
                            </div>
                            <datalist id='category-list'>
                                {categories.map((c) => (
                                    <option key={c} value={c} />
                                ))}
                            </datalist>
                            <div className='containerBox'>
                                <input 
                                    className='containerDetail button p-10 color-lite width-100-percent' 
                                    name='notes' 
                                    value={entry.notes} 
                                    onChange={handleChange} 
                                    placeholder='Notes' 
                                />
                            </div>
                            <div 
                                className='containerBox button bg-green' 
                                onClick={addExpense}
                            >
                                Add Expense
                            </div>
                        </div>
                    }
                    </div>
                    <div className='containerBox'>
                        {expenses.map((e, idx) => (
                            <div className='containerBox contentLeft bg-lite' key={idx}>
                                <div className='containerBox button'>
                                    <div className='containerBox color-yellow bg-lite' onClick={() => setEditIndex((editIndex === idx) ? null : idx)}>
                                        {e.date || '(No Date)'}
                                    </div>
                                    <div className='containerBox color-graphite' onClick={() => setEditIndex((editIndex === idx) ? null : idx)}>
                                        {e.category}:
                                    </div>
                                    <div className='containerBox' onClick={() => setEditIndex((editIndex === idx) ? null : idx)}>
                                        ${e.amount.toFixed(2)}
                                    </div>
                                    <div className='containerBox button i color-graphite' onClick={() => setEditIndex((editIndex === idx) ? null : idx)}>
                                        {e.notes}
                                    </div>
                                </div>
                                {
                                    (editIndex === idx)
                                    ? <div className='containerBox bg-lite mt-20'>
                                        <div className='containerBox flexContainer'>
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
                                                        value={e.date} 
                                                        onChange={handleChange} 
                                                        placeholder='Date' 
                                                    />
                                            </div>
                                        </div>
                                        <div className='containerBox flexContainer'>
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
                                                        value={e.category} 
                                                        onChange={handleChange} 
                                                        placeholder='Category' 
                                                        list='category-list' 
                                                    />
                                            </div> 
                                        </div>
                                        <div className='containerBox flexContainer'>
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
                                                    value={Number(e.amount)} 
                                                    onChange={handleChange} 
                                                    placeholder='Amount' 
                                                    type='number' 
                                                />
                                            </div>
                                        </div>
                                        <div className='containerBox  flexContainer'>
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
                                                    value={e.notes} 
                                                    onChange={handleChange} 
                                                    placeholder='Notes' 
                                                />
                                            </div>
                                        </div>
                                        <div className='input-row containerBox flexContainer'>
                                            <datalist id='category-list'>
                                                {categories.map((c) => (
                                                    <option key={c} value={c} />
                                                ))}
                                            </datalist>
                                        </div>
                                        <div className='containerBox bg-green color-lite button contentCenter' onClick={() => setEditIndex((editIndex === idx) ? null : idx)}>
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
                <div className='quarterly-table width-100-percent'>
                    <div className='containerBox flexContainer bg-lite'>
                        <div className='containerBox bg-lite flex4Column'>Quarter</div>
                        <div className='containerBox bg-lite flex4Column'>Estimated Income</div>
                        <div className='containerBox bg-lite flex4Column'>Estimated Expenses</div>
                        <div className='containerBox bg-lite flex4Column'>Taxable Income</div>
                        <div className='containerBox bg-lite flex4Column'>Estimated Tax (25%)</div>
                    </div>
                    <div className='containerBox width-100-percent'>
                        {quarterlyEstimates.map((q, index) => (
                            <div
                                className={`containerBox flexContainer ${(!isEven(index)) ? 'bg-lite' : null}`}
                                key={q.quarter}
                            >
                                <div className='containerBox flex4Column'>{q.quarter}</div>
                                <div className='containerBox flex4Column'>${Number(q.income).toFixed(2)}</div>
                                <div className='containerBox flex4Column'>${q.expenses.toFixed(2)}</div>
                                <div className='containerBox flex4Column'>${q.taxable.toFixed(2)}</div>
                                <div className='containerBox flex4Column'>${q.tax.toFixed(2)}</div>
                            </div>
                        ))}
                    </div>
                    
                </div>
            )}
        </div>
    );
}
export default BusinessTax;