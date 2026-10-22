import React, { useState } from 'react';
import { getCheckoutHistory, saveCheckoutHistory } from './checkoutHistory';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CFF', '#FF6F91', '#FFD6E0', '#B5EAD7', '#C7CEEA'];

function aggregateByCategory(items) {
    const map = {};
    items.forEach(item => {
        const cat = item.aisle || 'Uncategorized';
        let price = parseFloat(item.price);
        if (isNaN(price)) price = 0;
        let qty = Number(item.quantity);
        if (!isFinite(qty) || qty <= 0) qty = 1;
        const amt = price * qty;
        map[cat] = (map[cat] || 0) + amt;
    });
    return Object.entries(map).map(([category, value]) => ({ category: String(category), value: isNaN(value) ? 0 : Number(value.toFixed(2)) }));
}

function aggregateByDate(history) {
    return history.map(record => ({
        date: String(record.date),
        value: isNaN(Number(record.totalAmount)) ? 0 : Number(Number(record.totalAmount).toFixed(2))
    }));
}

const ShopReport = ({ onClose }) => {
    const [selected, setSelected] = useState(null);
    const [history, setHistory] = useState(getCheckoutHistory());

    const handleDelete = (index) => {
        if (!window.confirm('Delete this report?')) return;
        const newHistory = history.slice();
        newHistory.splice(index, 1);
        saveCheckoutHistory(newHistory);
        setHistory(newHistory);
        // Adjust selected index if needed
        if (selected === index) {
            setSelected(null);
        } else if (selected > index) {
            setSelected(selected - 1);
        }
    };

    if (!history.length) return (
    <div className='containerDetail bg-lite p-20 color-yellow'>
      <div className='size20 mb-10'>No checkouts recorded yet.</div>
      <button className='button bg-red color-yellow' onClick={onClose}>Close</button>
    </div>
  );

  const selectedRecord = selected != null ? history[selected] : history[0];
  const categoryData = aggregateByCategory(selectedRecord.items || []);
  const dateData = aggregateByDate(history);

    const getTotalSpent = () => {
        let total = 0;
        selectedRecord.items.forEach(item => {
            const price = parseFloat(item.price);
            const quantity = Number(item.quantity);
            if (!isNaN(price) && isFinite(quantity) && quantity > 0) {
                total += price * quantity;
            }
        });
        return total.toFixed(2);
    };

    const getTotalQuantity = () => {
        let total = 0;
        selectedRecord.items.forEach(item => {
            const quantity = Number(item.quantity);
            if (isFinite(quantity) && quantity > 0) {
                total += quantity;
            }
        });
        return total;
    };

        // Format date as Month Day, Year, always using local time for yyyy-mm-dd
        function formatDate(dateStr) {
            if (!dateStr) return '';
            // If dateStr is yyyy-mm-dd, parse as local date
            const match = /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
            let d;
            if (match) {
                const [y, m, day] = dateStr.split('-').map(Number);
                d = new Date(y, m - 1, day);
            } else {
                d = new Date(dateStr);
            }
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        }

  return (
      <div className='containerDetail bg-tintedDark pt-20 pl-10 pr-10 color-lite'>
        <div className='containerDetail flexContainer bg-lite mb-5'>
            <div className='size25 p-20 flex2Column contentLeft'>
                Checkout Reports
            </div>
            <div className='button bg-red color-yellow p-20 size20 flexColumn contentRight' onClick={onClose}>
                Close
            </div>
        </div>
        <div className='containerDetail mb-5 contentLeft'>
            {(history.length > 0) && (
                <div
                    className='button bg-red color-yellow p-10 size15'
                    onClick={() => handleDelete(selected || 0)}
                >
                    Delete Report
                </div>
            )}
            <select 
                className='containerDetail bg-lite p-10 mt-5 size15 color-lite width--5' 
                value={selected ?? 0} 
                onChange={e => setSelected(Number(e.target.value))}
            >
                {history.map((rec, i) => (
                        <option key={i} value={i}>{rec.title}</option>
                ))}
            </select>
        </div>
        <div className='ht-400 scroll'>
            <div className='containerDetail'>
                <div className='containerDetail bg-tintedDark p-10 m-10 ht-400 bg-pink'>
                    <div className='size18 mb-5'>
                        Spending by Category
                    </div>
                    <ResponsiveContainer width='100%' height={300}>
                        <PieChart>
                        <Pie data={categoryData} dataKey='value' nameKey='category' cx='50%' cy='50%' outerRadius={100} label={({ category, value }) => `${category}: $${value}` }>
                            {categoryData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className='containerDetail bg-tintedDark p-10 m-10'>
                <div className='size18 mb-5'>
                    Spending Over Time
                </div>
                <ResponsiveContainer width='100%' height={300}>
                    <BarChart data={dateData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='date' />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey='value' fill='#8884d8' name='Total Spent' />
                    </BarChart>
                </ResponsiveContainer>
                </div>
            </div>
                        <div className='size20 mb-10 contentLeft pl-10 color-yellow flexContainer'>
                                <span>Checkout Details</span>
                                <span className='ml-20 color-lite size15'>
                                    {formatDate(selectedRecord.date)}
                                </span>
                        </div>
            <div className='containerDetail m-5 p-10 mb-2 flexContainer contentLeft width--20 bg-dkYellow'>
                <div className='flex4Column color-yellow'>
                    Item
                </div>
                <div className='flex4Column color-yellow'>
                    Quantity
                </div>
                <div className='flex4Column color-yellow'>
                    Price
                </div>
                <div className='flex4Column color-yellow'>
                    Category
                </div>
            </div>
            <div className='containerDetail bg-lite p-10 m-5 contentLeft ht-100'>
                {selectedRecord.items.map((item, idx) => (
                    <div key={idx} className='mb-2 flexContainer'>
                        <div className='flex4Column'>
                            <div className='containerDetail mb-5 p-10 color-yellow'>
                            {item.title}
                            </div>
                        </div>
                        <div className='flex4Column'>
                            <div className='containerDetail mb-5 p-10 color-yellow'>
                                {isFinite(Number(item.quantity)) && Number(item.quantity) > 0 ? item.quantity : 1} 
                            </div>
                        </div>
                        <div className='flex4Column'>
                            <div className='containerDetail mb-5 p-10 color-yellow'>
                                ${!isNaN(parseFloat(item.price)) ? parseFloat(item.price).toFixed(2) : '0.00'} 
                            </div>
                        </div>
                        <div className='flex4Column'>
                            <div className='containerDetail mb-5 p-10 color-yellow'>
                                {item.aisle || 'Uncategorized'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className='containerDetail m-5 p-10 mb-2 flexContainer contentLeft width--20 bg-dkGreen'>
                <div className='flex4Column color-yellow'>
                    Totals
                </div>
                <div className='flex4Column color-yellow'>
                    {getTotalQuantity()}
                </div>
                <div className='flex4Column color-yellow'>
                    ${getTotalSpent()}  
                </div>
                <div className='flex4Column color-yellow'>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ShopReport;
