import React, { useState, useEffect } from 'react';

const DebtCollector = () => {
    const [debts, setDebts] = useState([]);
    const [form, setForm] = useState({
        debtor: '',
        amount: '',
        dueDate: '',
        note: '',
    });

    useEffect(() => {
        const storedDebts = JSON.parse(localStorage.getItem('debts')) || [];
        setDebts(storedDebts);
    }, []);
    
    useEffect(() => {
        localStorage.setItem('debts', JSON.stringify(debts));
    }, [debts]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

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
    };

    const markAsPaid = (id) => {
        setDebts(
            debts.map((debt) =>
                debt.id === id ? { ...debt, status: 'paid' } : debt
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
    const deleteDebt = (id) => {
        if (!window.confirm('Are you sure you want to delete this debt?')) return;
        setDebts(debts.filter(debt => debt.id !== id));
    };

    // Split debts into unpaid and paid
    const unpaidDebts = debts.filter(debt => debt.status !== 'paid');
    const paidDebts = debts.filter(debt => debt.status === 'paid');

    return (
        <div className='containerBox'>
            <div className='containerBox color-yellow'>Debt Collection Tracker</div>

            <div className='containerBox bg-lite'>
                <div className='containerBox'>Add New Debt</div>
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
                        name='debtor'
                        placeholder='Debtor Name'
                        value={form.debtor}
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
                <div title='add debt' onClick={addDebt} className='containerDetail p-10 button bg-green button w-200 ml-auto mr-auto mb-10 mt-10'>
                    ➕ Add Debt
                </div>
            </div>
            <div className='containerBox flex1Column'>
                <div className='containerBox bg-green color-dark bold'>💲 Paid Debts</div>
                <div>
                    {paidDebts.length === 0 && (
                        <div className='containerBox color-red'>No paid debts</div>
                    )}
                    {paidDebts.map((debt) => (
                        <div key={debt.id} className='containerBox flexContainer'>
                            <div className='containerBox flex4Column'>
                                {new Date(debt.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                            </div>
                            <div className='containerBox flex4Column'>{debt.debtor}</div>
                            <div className='containerBox flex4Column'>${debt.amount}</div>
                            <div className='flex4Column flexContainer'>
                                <div
                                    title='add note'
                                    onClick={() => {
                                        const note = prompt('Add note:');
                                        if (note) addNote(debt.id, note);
                                    }}
                                    className='containerBox bg-lite flex2Column button'
                                >
                                    📝
                                </div>
                                <div
                                    title='delete debt'
                                    onClick={() => deleteDebt(debt.id)}
                                    className='containerBox bg-lite size30 flex2Column button'
                                >
                                    🗑️
                                </div>
                            </div>
                            <div className='containerBox'>
                                {debt.note.length > 0 && (
                                    debt.note
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className='containerBox'>
                <div className='containerBox bg-yellow color-dark bold'>🤲🏼 Unpaid Debts</div>
                <div>
                    {unpaidDebts.length === 0 && (
                        <div className='containerBox color-red'>No unpaid debts</div>
                    )}
                    {unpaidDebts.map((debt) => (
                        <div key={debt.id} className='containerBox centerVertical flexContainer'>
                            <div className='containerBox flex2Column'>
                                {new Date(debt.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })} {debt.debtor} ${debt.amount}
                            </div>
                            <div className='containerBox flex2Column flexContainer'>
                                <div
                                    title='mark as paid'
                                    onClick={() => markAsPaid(debt.id)}
                                    className='containerBox bg-green flex3Column button'
                                >
                                    💰
                                </div>
                                <div
                                    title='add note'
                                    onClick={() => {
                                        const note = prompt('Add note:');
                                        if (note) addNote(debt.id, note);
                                    }}
                                    className='containerBox bg-white flex3Column button'
                                >
                                    📝
                                </div>
                                <div
                                    title='delete debt'
                                    onClick={() => deleteDebt(debt.id)}
                                    className='containerBox bg-lite size30 flex3Column button'
                                >
                                    🗑️
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DebtCollector;