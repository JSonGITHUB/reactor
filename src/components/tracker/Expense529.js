import React, { useState, useEffect } from 'react';
//import jsPDF from 'jspdf';
//import 'jspdf-autotable'; // for tables
import CollapseToggleButton from '../utils/CollapseToggleButton';

const STORAGE_KEY = 'expenseTracker529_v1';

const QUALIFIED_CATEGORIES = [
    'Tuition',
    'Books',
    'Supplies',
    'Room & Board',
    'Internet',
    'Transportation'
];

const fmt = (n) =>
    typeof n === 'number' && !Number.isNaN(n)
        ? n.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
        : '$0.00';

const toNumber = (v) => {
    if (v === '' || v == null) return null;
    const n = Number(String(v).replace(/[^0-9.-]+/g, ''));
    return Number.isNaN(n) ? null : n;
};

const exportCSV = (rows, filename = '529_expenses.csv') => {
    const header = Object.keys(rows[0] || {});
    const csv = [
        header.join(','),
        ...rows.map((r) =>
            header
                .map((h) => {
                    const val = r[h] == null ? '' : String(r[h]);
                    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
                        return `"${val.replace(/"/g, '""')}"`;
                    }
                    return val;
                })
                .join(',')
        ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
};

const Expense529 = () => {
    const [formCollapsed, setFormCollaped] = useState(true);
    const [filterCollapsed, setFilterCollaped] = useState(true);
    const [studentName, setStudentName] = useState(() => {
        return localStorage.getItem(`${STORAGE_KEY}_student`) || '';
    });

    const [expenses, setExpenses] = useState(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });

    const emptyForm = {
        id: null,
        date: new Date().toISOString().slice(0, 10),
        category: QUALIFIED_CATEGORIES[0],
        vendor: '',
        amount: '',
        shared: false,
        percent: '',
        notes: '',
    };
    const [form, setForm] = useState(emptyForm);

    const [searchText, setSearchText] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    useEffect(() => {
        localStorage.setItem(`${STORAGE_KEY}_student`, studentName);
    }, [studentName]);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
        } catch (e) {
            console.error('Failed to save expenses to localStorage', e);
        }
    }, [expenses]);

    const computeStudentShare = (amount, shared, percent) => {
        const amt = toNumber(amount);
        if (amt == null) return 0;
        if (!shared) return amt;
        const p = toNumber(percent);
        if (p == null) return 0;
        return Math.round((amt * (p / 100) + Number.EPSILON) * 100) / 100;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const amountNum = toNumber(form.amount);
        if (amountNum == null || amountNum <= 0) {
            alert('Please enter a valid amount greater than 0.');
            return;
        }

        if (!QUALIFIED_CATEGORIES.includes(form.category)) {
            alert('Selected category is not qualified for 529 reimbursement.');
            return;
        }

        if (form.shared) {
            const p = toNumber(form.percent);
            if (p == null || p < 0 || p > 100) {
                alert('When shared, please enter a valid percentage (0-100).');
                return;
            }
        }

        const studentShare = computeStudentShare(form.amount, form.shared, form.percent);

        if (form.id) {
            setExpenses((prev) =>
                prev.map((it) =>
                    it.id === form.id ? { ...form, amount: Number(amountNum), studentShare } : it
                )
            );
        } else {
            const newExpense = {
                ...form,
                id: Date.now(),
                amount: Number(amountNum),
                studentShare,
            };
            setExpenses((prev) => [newExpense, ...prev]);
        }

        setForm(emptyForm);
    };

    const handleEdit = (id) => {
        const e = expenses.find((x) => x.id === id);
        if (!e) return;
        setForm({
            id: e.id,
            date: e.date,
            category: e.category,
            vendor: e.vendor || '',
            amount: e.amount != null ? String(e.amount) : '',
            shared: !!e.shared,
            percent: e.percent != null ? String(e.percent) : '',
            notes: e.notes || '',
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id) => {
        if (!window.confirm('Delete this expense?')) return;
        setExpenses((prev) => prev.filter((x) => x.id !== id));
    };

    const filtered = expenses.filter((it) => {
        if (searchText) {
            const s = searchText.toLowerCase();
            if (!((it.vendor || '').toLowerCase().includes(s) || (it.notes || '').toLowerCase().includes(s))) {
                return false;
            }
        }
        if (fromDate) {
            if (new Date(it.date) < new Date(fromDate)) return false;
        }
        if (toDate) {
            if (new Date(it.date) > new Date(toDate)) return false;
        }
        return true;
    });

    const totalsByCategory = QUALIFIED_CATEGORIES.reduce((acc, cat) => {
        acc[cat] = 0;
        return acc;
    }, {});
    let grandTotalStudentShare = 0;
    for (const it of expenses) {
        const share = computeStudentShare(it.amount, it.shared, it.percent ?? 100);
        grandTotalStudentShare += share;
        if (!totalsByCategory[it.category]) totalsByCategory[it.category] = 0;
        totalsByCategory[it.category] += share;
    }
    grandTotalStudentShare = Math.round((grandTotalStudentShare + Number.EPSILON) * 100) / 100;

    const handleExportCSV = () => {
        if (!expenses.length) {
            alert('No expenses to export.');
            return;
        }
        const rows = expenses.map((it) => ({
            Date: it.date,
            Category: it.category,
            Vendor: it.vendor || '',
            Amount: it.amount != null ? it.amount.toFixed(2) : '',
            Shared: it.shared ? 'Yes' : 'No',
            Percent: it.shared ? (it.percent || '') : '',
            StudentShare: computeStudentShare(it.amount, it.shared, it.percent ?? 100).toFixed(2),
            Notes: it.notes || '',
        }));
        exportCSV(rows, `${studentName.replace(/\s+/g, '_')}_529_expenses.csv`);
    };

    const handleReset = () => {
        if (!window.confirm('Reset all expenses? This cannot be undone.')) return;
        setExpenses([]);
        setForm(emptyForm);
        localStorage.removeItem(STORAGE_KEY);
    };

    useEffect(() => {
        if (!form.shared) {
            setForm((prev) => ({ ...prev, percent: '' }));
        }
        // eslint-disable-next-line
    }, [form.shared]);
/*
    const handleGeneratePDF = () => {
        if (!expenses.length) {
            alert('No expenses to include in report.');
            return;
        }

        //const doc = new jsPDF();

        // Header
        doc.setFontSize(16);
        doc.text('529 Reimbursement Packet', 14, 20);

        doc.setFontSize(12);
        doc.text(`Student: ${studentName}`, 14, 30);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 38);

        // Table of expenses
        const rows = expenses.map((e) => [
            e.date,
            e.category,
            e.vendor || '',
            fmt(e.amount),
            e.shared ? `${e.percent || ''}%` : '-',
            fmt(computeStudentShare(e.amount, e.shared, e.percent ?? 100)),
            e.notes || ''
        ]);

        doc.autoTable({
            startY: 50,
            head: [['Date', 'Category', 'Vendor', 'Amount', 'Share %', 'Student Share', 'Notes']],
            body: rows,
            styles: { fontSize: 10 },
        });

        // Totals
        let grandTotal = 0;
        const catTotals = {};
        QUALIFIED_CATEGORIES.forEach((c) => (catTotals[c] = 0));

        expenses.forEach((e) => {
            const share = computeStudentShare(e.amount, e.shared, e.percent ?? 100);
            grandTotal += share;
            catTotals[e.category] = (catTotals[e.category] || 0) + share;
        });

        let y = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.text('Totals by Category:', 14, y);
        y += 6;
        QUALIFIED_CATEGORIES.forEach((c) => {
            doc.text(`${c}: ${fmt(catTotals[c])}`, 20, y);
            y += 6;
        });

        y += 4;
        doc.setFontSize(14);
        doc.text(`Grand Total (Student Share): ${fmt(grandTotal)}`, 14, y);

        // Save
        doc.save(`${studentName.replace(/\s+/g, '_')}_529_report.pdf`);
    };
*/

    return (
        <div className='containerDetail mt--30 bg-lite'>
            <div className='containerDetail p-20 color-yellow size30 bg-lite contentLeft'>
                <span className=' size40'>🎓</span> 529 Expense
            </div>
            <div className='containerBox'>
                <label></label>
                <div className='containerBox'>
                    <input
                        value={studentName}
                        placeholder='Student Name'
                        onChange={(e) => setStudentName(e.target.value)}
                        className='containerBox contentLeft width--10'
                    />
                    {/*
                        <div onClick={handleGeneratePDF} className='containerBox bg-blue button'>
                            Generate PDF Report
                        </div>{' '}
                    */}
                    <div onClick={handleExportCSV} className='containerBox bg-blue button'>
                        Export CSV (Excel)
                    </div>{' '}
                    <div onClick={handleReset} className='containerBox bg-blue button'>
                        Reset Data
                    </div>
                </div>
                <div className='containerBox bg-lite'>
                    <CollapseToggleButton
                        title={<span className='color-yellow bold size30'>Form</span>}
                        isCollapsed={formCollapsed}
                        setCollapse={setFormCollaped}
                        align='left'
                    />
                </div>
                {
                    (formCollapsed)
                    ? null
                    :<form onSubmit={handleSubmit} className='containerBox contentLeft'>
                        <label>
                            <div className='containerBox bg-lite'>
                                <div className='containerBox'>
                                    Date
                                </div>
                                <input
                                    type="date"
                                    required
                                    value={form.date}
                                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                                    className='containerBox contentLeft width--10'
                                />
                            </div>
                        </label>
                        <label>
                            <div className='containerBox bg-lite'>
                                <div className='containerBox'>
                                    Category
                                </div>
                                <select
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    className='containerBox contentLeft width--10'
                                >
                                    {QUALIFIED_CATEGORIES.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </label>
                        <label>
                            <div className='containerBox bg-lite'>
                                <div className='containerBox'>
                                    Vendor
                                </div>
                                <input
                                    value={form.vendor}
                                    onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                                    placeholder="Vendor (optional)"
                                    className='containerBox contentLeft width--10'
                                />
                            </div>
                        </label>
                        <label>
                            <div className='containerBox bg-lite'>
                                <div className='containerBox'>
                                    Amount (USD)
                                </div>
                                <input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    required
                                    value={form.amount}
                                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                    className='containerBox contentLeft width--10'
                                />
                            </div>
                        </label>
                        <div className='containerBox bg-lite'>
                            <label>
                                <div className='containerBox flexContainer'>
                                    <div className='containerDetail p-20 flexColumn'>
                                        <input
                                            type="checkbox"
                                            checked={form.shared}
                                            onChange={(e) => setForm({ ...form, shared: e.target.checked })}
                                        />
                                    </div>
                                    <div className='containerBox flex2Column'>
                                        Shared expense (student pays a percentage)
                                    </div>
                                </div>
                            </label>
                            <label>
                                <div className='containerBox flexContainer'>
                                    <div className='containerBox flexColumn contenLeft'>
                                        Share % (0–100)
                                    </div>
                                    <input
                                        type="number"
                                        placeholder='50'
                                        min="0"
                                        max="100"
                                        step="1"
                                        disabled={!form.shared}
                                        value={form.percent}
                                        onChange={(e) => setForm({ ...form, percent: e.target.value })}
                                        className='containerBox contentLeft flex2Column'
                                    />
                                </div>
                            </label>
                        </div>
                        <div style={{ flex: '1 1 100%' }}>
                            <label>
                                <div className='containerBox bg-lite'>
                                    <div className='containerBox'>
                                        Notes
                                    </div>
                                    <input
                                        value={form.notes}
                                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                        placeholder="Notes (optional)"
                                        className='containerBox contentLeft width--10'
                                    />
                                </div>
                            </label>
                        </div>
                        <div className='containerBox bg-lite'>
                            <button 
                                type="submit" 
                                className='containerDetail m-5 p-20 bg-blue button size25 width-100-percent'
                            >
                                {form.id ? 'Update Expense' : 'Add Expense'}
                            </button>{' '}
                            {form.id && (
                                <button
                                    type="button"
                                    onClick={() => setForm(emptyForm)}
                                    className='containerDetail m-5 p-20 bg-blue button size25 width-100-percent'
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                }
                <div className='containerBox'>
                    <div className='containerBox'>
                        <div className='containerBox color-yellow'>
                            Totals by Category (student share)
                        </div>
                        {QUALIFIED_CATEGORIES.map((c) => (
                            <div key={c} className='containerBox flexContainer' style={{ minWidth: 180 }}>
                                <div className='containerDetail p-10 flex2Column contentRight'>
                                    {c}: 
                                </div>
                                 <div className='containerDetail flex3Column contentLeft p-10'>
                                    {fmt(totalsByCategory[c] ?? 0)}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className='containerBox bg-lite'>
                        <div className='containerBox color-yellow'>Grand Total (student share)</div>
                        <div className='containerBox'>{fmt(grandTotalStudentShare)}</div>
                        <div className='containerDetail size15 i bg-lite'>Use this total when requesting reimbursement.</div>
                    </div>
                </div>
                <div className='containerBox bg-lite'>
                    <CollapseToggleButton
                        title={<span className='color-yellow bold size30'>Search & Filter</span>}
                        isCollapsed={filterCollapsed}
                        setCollapse={setFilterCollaped}
                        align='left'
                    />
                </div>
                {
                    (filterCollapsed)
                    ? null
                    : <div className='containerDetail m-10 bg-lite'>
                        <input
                            placeholder="Search vendor or notes..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className='containerDetail width--20 m-10 p-10 color-lite bg-dark'
                        />
                        <label>
                            <div className='containerDetail flexContainer m-10'>
                                <div className='pl-10 pr-10 pb-10 pt-15 m-10 flex6Column'>
                                    From
                                </div>
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className='containerDetail flex2Column m-10 p-10 color-lite'
                                />
                            </div>
                        </label>
                        <label>
                            <div className='containerDetail flexContainer m-10'>
                                <div className='pl-30 pr-10 pb-10 pt-15 m-10 flex6Column'>
                                    To
                                </div>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className='containerDetail flex2Column m-10 p-10 color-lite'
                                />
                            </div>
                        </label>
                    </div>
                }
                <div className='containerBox scroll'>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr className='containerDetail flexContainer'>
                                <th className='containerDetail flex9Column color-yellow p-10 size15 contentLeft'>Date</th>
                                <th className='containerDetail flex9Column color-yellow p-10 size15 contentLeft'>Category</th>
                                <th className='containerDetail flex9Column color-yellow p-10 size15 contentLeft'>Vendor</th>
                                <th className='containerDetail flex9Column color-yellow p-10 size15 contentLeft'>Amount</th>
                                <th className='containerDetail flex9Column color-yellow p-10 size15 contentLeft'>Shared</th>
                                <th className='containerDetail flex9Column color-yellow p-10 size15 contentLeft'>% Share</th>
                                <th className='containerDetail flex9Column color-yellow p-10 size15 contentLeft'>Student Share</th>
                                <th className='containerDetail flex9Column color-yellow p-10 size15 contentLeft'>Notes</th>
                                <th className='containerDetail flex9Column color-yellow p-10 size15 contentLeft'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="9" style={{ padding: 12, textAlign: 'center', color: '#666' }}>
                                        No expenses found.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((it) => (
                                    <tr key={it.id} className='flexContainer'>
                                        <td className='containerDetail flex9Column p-10 size15 contentLeft'>{String(it.date).split('-')[1]}/{String(it.date).split('-')[2]}</td>
                                        <td className='containerDetail flex9Column p-10 size15 contentLeft'>{it.category}</td>
                                        <td className='containerDetail flex9Column p-10 size15 contentLeft'>{it.vendor}</td>
                                        <td className='containerDetail flex9Column p-10 size15 contentLeft'>{fmt(it.amount)}</td>
                                        <td className='containerDetail flex9Column p-10 size15 contentLeft'>{it.shared ? 'Yes' : 'No'}</td>
                                        <td className='containerDetail flex9Column p-10 size15 contentLeft'>{it.shared ? `${it.percent ?? ''}%` : '-'}</td>
                                        <td className='containerDetail flex9Column p-10 size15 contentLeft'>{fmt(computeStudentShare(it.amount, it.shared, it.percent ?? 100))}</td>
                                        <td className='containerDetail flex9Column p-10 size15 contentLeft'>{it.notes}</td>
                                        <td className='containerDetail flex9Column p-10 size15 contentLeft'>
                                            <button title='edit' onClick={() => handleEdit(it.id)} className='containerDetail button bg-lite m-1 width-100-percent'>
                                                ✏️
                                            </button>
                                            <button title='delete' onClick={() => handleDelete(it.id)} className='containerDetail button bg-lite m-1 width-100-percent'>
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div style={{ marginTop: 12, color: '#666', fontSize: 13 }}>
                    Note: This tool helps track expenses for your records. You should self-certify eligibility of each item for 529 reimbursement.
                </div>
            </div>
        </div>
    );
};

export default Expense529;