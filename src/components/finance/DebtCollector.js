import React, { useState, useEffect } from 'react';
import getKey from '../utils/KeyGenerator';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import Selector from '../forms/FunctionalSelector';
import initializeData from '../utils/InitializeData';

const DebtCollector = () => {

    const [debts, setDebts] = useState([]);
    const [dues, setDues] = useState([]);
    const [collection, setCollection] = useState([]);
    const [form, setForm] = useState({
        debtor: '',
        amount: '',
        dueDate: '',
        note: '',
    });
    const [collapseDebt, setCollapseDebt] = useState();
    const [collapseCollect, setCollapseCollect] = useState();
    const [collapseDues, setCollapseDues] = useState();
    const [collapsePaidDues, setCollapsePaidDues] = useState();
    const [collapseForm, setCollapseForm] = useState(true);

    useEffect(() => {
        if (typeof collapseDebt !== 'undefined') {
            localStorage.setItem('collapseDebt', JSON.stringify(collapseDebt));
        }
    }, [collapseDebt]);

    useEffect(() => {
        if (typeof collapseCollect !== 'undefined') {
            localStorage.setItem('collapseCollect', JSON.stringify(collapseCollect));
        }
    }, [collapseCollect]);

    useEffect(() => {
        if (typeof collapseDues !== 'undefined') {
            localStorage.setItem('collapseDues', JSON.stringify(collapseDues));
        }
    }, [collapseDues]);

    useEffect(() => {
        if (typeof collapsePaidDues !== 'undefined') {
            localStorage.setItem('collapsePaidDues', JSON.stringify(collapsePaidDues));
        }
    }, [collapsePaidDues]);

    useEffect(() => {
        if (typeof collapseForm !== 'undefined') {
            localStorage.setItem('collapseForm', JSON.stringify(collapseForm));
        }
    }, [collapseForm]);

    useEffect(() => {
        const storedDebts = JSON.parse(localStorage.getItem('debts')) || [];
        const storedDues = JSON.parse(localStorage.getItem('dues')) || [];
        setDebts(storedDebts);
        setDues(storedDues);
        setCollection('debt');
        setCollapseDebt(localStorage.getItem('collapseDebt') ? JSON.parse(localStorage.getItem('collapseDebt')) : false);
        setCollapseCollect(localStorage.getItem('collapseCollect') ? JSON.parse(localStorage.getItem('collapseCollect')) : false);
        setCollapseDues(localStorage.getItem('collapseDues') ? JSON.parse(localStorage.getItem('collapseDues')) : false);
        setCollapsePaidDues(localStorage.getItem('collapsePaidDues') ? JSON.parse(localStorage.getItem('collapsePaidDues')) : false);
        setCollapseForm(localStorage.getItem('collapseForm') ? JSON.parse(localStorage.getItem('collapseForm')) : false);
    }, []);

    useEffect(() => {
        if (debts.length > 0) {
            localStorage.setItem('debts', JSON.stringify(debts));
        }
    }, [debts]);

    useEffect(() => {
        if (dues.length > 0) {
            localStorage.setItem('dues', JSON.stringify(dues));
        }
    }, [dues]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const selectCollection = (a, b, value) => {
        setCollection(value);
    }

    const addDebt = () => {
        if (!form.debtor || !form.amount || !form.dueDate) return;
        setDebts([
            ...debts,
            {
                id: Date.now(),
                ...form,
                status: 'unpaid',
                note: [],
            },
        ]);
        setForm({ debtor: '', amount: '', dueDate: '', note: '' });
        setCollapseForm(true)
    };

    const addDues = () => {
        if (!form.payee || !form.amount || !form.dueDate) return;
        setDues([
            ...dues,
            {
                id: Date.now(),
                ...form,
                status: 'unpaid',
                note: [],
            },
        ]);
        setForm({ payee: '', amount: '', dueDate: '', note: '' });
        setCollapseForm(true)
    };

    const markAsPaid = (id) => {
        setDebts(
            debts.map((debt) =>
                debt.id === id ? { ...debt, status: 'paid' } : debt
            )
        );
    };

    const markAsCleared = (id) => {
        setDues(
            dues.map((due) =>
                due.id === id ? { ...due, status: 'paid' } : due
            )
        );
    };

    const addNote = (id, note) => {
        setDebts(
            debts.map((debt) =>
                debt.id === id
                    ? { ...debt, note: [...debt.note, note] }
                    : debt
            )
        );
    };
    const addDuesNote = (id, note) => {
        setDues(
            dues.map((due) =>
                due.id === id
                    ? { ...due, note: [...due.note, note] }
                    : due
            )
        );
    };
    const editNote = (id, index, note) => {
        console.log(`DebtCollector => editNote => note: ${note}`);
        setDebts(
            debts.map((debt) =>
                debt.id === id
                    ? {
                        ...debt,
                        note: note === ''
                            ? debt.note.filter((_, i) => i !== index)
                            : debt.note.map((n, i) => (i === index ? note : n))
                    }
                    : debt
            )
        );
    };
    const editDuesNote = (id, index, note) => {
        console.log(`DebtCollector => editDuesNote => note: ${note}`);
        setDues(
            dues.map((due) =>
                due.id === id
                    ? {
                        ...due,
                        note: note === ''
                            ? due.note.filter((_, i) => i !== index)
                            : due.note.map((n, i) => (i === index ? note : n))
                    }
                    : due
            )
        );
    };
    const deleteDebt = (id) => {
        if (!window.confirm('Are you sure you want to delete this debt?')) return;
        setDebts(debts.filter(debt => debt.id !== id));
    };
    const deleteDues = (id) => {
        if (!window.confirm('Are you sure you want to delete this due?')) return;
        setDues(dues.filter(due => due.id !== id));
    };

    const unpaidDebts = debts.filter(debt => debt.status !== 'paid');
    const paidDebts = debts.filter(debt => debt.status === 'paid');
    const unpaidDues = dues.filter(due => due.status !== 'paid');
    const paidDues = dues.filter(due => due.status === 'paid');
    const getDebt = (debt) => <div key={debt.id} className='containerBox bg-lite'>
        <div className=''>
            <div className='contentLeft'>
                <div className='containerBox'>
                    📅 {new Date(debt.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                </div>
            </div>
            <div className='contentLeft'>
                <div className='containerBox'>
                    👤 {debt.debtor || debt.payee}
                </div>
            </div>
        </div>
        <div className=''>
            {debt.note.length > 0 && (
                <div className=''>
                    <div className='scroll ht-60'>
                        {
                            debt.note.map((note, index) => <div key={getKey(`${debt.id}${index}`)} className='containerDetail p-10 m-5 contentLeft'>
                                <span
                                    title='edit note'
                                    className='button mr-5'
                                    onClick={() => {
                                        const newNote = prompt('Edit note:', note);
                                        if (newNote) editNote(debt.id, index, newNote);
                                    }}
                                >
                                    ✏️
                                </span>
                                {note}
                            </div>
                            )}
                    </div>
                </div>
            )}
            <div className='containerBox centerVertical contentLeft'>
                💲 {debt.amount}
            </div>
            <div className='centerVertical contentLeft'>
                <div className='flexContainer'>
                    {
                        debt.status === 'unpaid' && (
                            <div
                                title='mark as paid'
                                onClick={() => (debt.debtor) ? markAsPaid(debt.id) : markAsCleared(debt.id)}
                                className='containerBox flex3Column bg-dark button contentCenter size30'
                            >
                                💰 Collect
                            </div>
                        )
                    }
                    <div
                        title='add note'
                        onClick={() => {
                            const note = prompt('Add note:');
                            if (note) addNote(debt.id, note);
                        }}
                        className='containerBox bg-dark flex3Column button contentCenter size30'
                    >
                        📝
                    </div>
                    <div
                        title='delete debt'
                        onClick={() => (debt.debtor) ? deleteDebt(debt.id) : deleteDues(debt.id)}
                        className='containerBox bg-dark size30 flex3Column button contentCenter size30'
                    >
                        🗑️
                    </div>
                </div>
            </div>
        </div>
    </div>

    const getTotalAmount = (items) => {
        return items.reduce((total, item) => total + parseFloat(item.amount || 0), 0).toFixed(2);
    }

    return (
        <div className='containerDetail mt--30'>
            <div className='containerDetail p-20 bg-lite color-lite size30 m-5 contentLeft'>
                💰 Debt Collection
            </div>
            {
                (collapseForm)
                    ? <div onClick={() => setCollapseForm(prev => !prev)} className='containerDetail m-5 size25 bg-green p-20 color-yellow contentLeft'>
                    ➕ Add Debt/Due
                </div>
                : <div className='containerBox bg-lite'>
                    <div>
                        <Selector
                            groupTitle='Collection'
                            label='collection selector'
                            items={['debt', 'due']}
                            selected={collection}
                            onChange={selectCollection}
                            fontSize='25'
                            padding='10px'
                            width='100%'
                        />
                        <div className='containerBox'>
                            📅
                            <input
                                name='dueDate'
                                type='date'
                                value={form.dueDate}
                                onChange={handleChange}
                                className='containerBox w-200'
                            />
                        </div>
                        <div className='containerBox'>
                            👤
                            <input
                                name={`${(collection === 'debt') ? 'debtor' : 'payee'}`}
                                placeholder={`${(collection === 'debt') ? 'Debtor Name' : 'Payee'}`}
                                value={(collection === 'debt') ? form.debtor : form.payee}
                                onChange={handleChange}
                                className='containerBox w-200'
                            />
                        </div>
                        <div className='containerBox'>
                            💲
                            <input
                                name='amount'
                                placeholder='Amount ($)'
                                value={form.amount}
                                onChange={handleChange}
                                type='number'
                                className='containerBox w-200'
                            />
                        </div>
                        <div className='flexContainer'>
                            <div title='add debt' onClick={(collection === 'debt') ? addDebt : addDues} className='containerDetail flex2Column m-5 p-10 button bg-white button w-200 ml-auto mr-auto mb-10 mt-10'>
                                ➕
                            </div>
                            <div title='cancel' onClick={() => setCollapseForm(true)} className='containerDetail flex2Column m-5 p-10 button bg-white button w-200 ml-auto mr-auto mb-10 mt-10 color-dark'>
                                Cancel
                            </div>
                        </div>
                    </div>
                </div>
            }
            <div className='containerDetail bg-blue m-5 p-10 size20'>
                <CollapseToggleButton
                    title={<div className='color-yellow flexContainer'><span className='flex2Column'>💲 Paid Debts</span><span className='flex2Column contentRight pr-10'>${getTotalAmount(paidDebts)}</span></div>}
                    isCollapsed={collapseCollect}
                    setCollapse={setCollapseCollect}
                    align='left'
                />
            </div>
            {
                (collapseCollect)
                ? null
                : <div>
                    {paidDebts.length === 0 && (
                        <div className='containerBox color-red'>No paid debts</div>
                    )}
                    {paidDebts.length > 0 && (
                        <div className='scroll ht-250'>
                            {paidDebts.map((debt) => (
                                getDebt(debt)
                            ))}
                        </div>
                    )}
                </div>
            }
            <div className='containerBox bg-blue'>
                <CollapseToggleButton
                    title={<div className='color-yellow flexContainer'><span className='flex2Column'>🤲🏼 Unpaid Debts</span><span className='flex2Column contentRight pr-10'>${getTotalAmount(unpaidDebts)}</span></div>}
                    isCollapsed={collapseDebt}
                    setCollapse={setCollapseDebt}
                    align='left'
                />
            </div>
            {
                collapseDebt
                ? null
                : <div>
                    {unpaidDebts.length === 0 && (
                        <div className='containerBox color-red'>No unpaid debts</div>
                    )}
                    {unpaidDebts.length > 0 && (
                        <div className='scroll ht-250'>
                            {unpaidDebts.map((debt) => (
                                getDebt(debt)
                            ))}
                        </div>
                    )}
                </div>
            }
            <div className='containerBox bg-blue'>
                <CollapseToggleButton
                    title={<div className='color-yellow flexContainer'><span className='flex2Column'>💸 Dues</span><span className='flex2Column contentRight pr-10'>${getTotalAmount(unpaidDues)}</span></div>}
                    isCollapsed={collapseDues}
                    setCollapse={setCollapseDues}
                    align='left'
                />
            </div>
            {
                (collapseDues)
                ? null
                : <div>
                    {unpaidDues.length === 0 && (
                        <div className='containerBox color-red'>No unpaid dues</div>
                    )}
                    {unpaidDues.length > 0 && (
                        <div className='scroll ht-250'>
                            {unpaidDues.map((due) => (
                                getDebt(due)
                            ))}
                        </div>
                    )}
                </div>
            }
            <div className='containerBox bg-blue'>
                <CollapseToggleButton
                    title={<div className='color-yellow flexContainer'><span className='flex2Column'>💸 Paid Dues</span><span className='flex2Column contentRight pr-10'>${getTotalAmount(paidDues)}</span></div>}
                    isCollapsed={collapsePaidDues}
                    setCollapse={setCollapsePaidDues}
                    align='left'
                />
            </div>
            {
                collapsePaidDues
                ? null
                : <div>
                    {paidDues.length === 0 && (
                        <div className='containerBox color-red'>No paid dues</div>
                    )}
                    {paidDues.length > 0 && (
                        <div className='scroll ht-250'>
                            {paidDues.map((due) => (
                                getDebt(due)
                            ))}
                        </div>
                    )}
                </div>
            }
        </div>
    );
};

export default DebtCollector;