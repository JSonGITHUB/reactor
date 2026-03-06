import React, { useState, useEffect } from 'react';
import icons from '../site/icons';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import ExpenseEditDialog from './ExpenseEditDialog';
import AddCategoryDialog from './AddCategoryDialog';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import './Budget.css';

const STANDARD_CATEGORIES = ['Housing', 'Food', 'Transport', 'Utilities', 'Entertainment', 'Misc'];

const CATEGORY_ICONS = {
    'Housing': '🏠',
    'Food': '🍔',
    'Transport': '🚗',
    'Utilities': '💡',
    'Entertainment': '🎬',
    'Misc': '📦',
    'Health': '🏥',
    'Shopping': '🛒',
    'Dining': '🍽️',
    'Subscriptions': '📺',
};

const SUGGESTED_ICONS = [
    '🏠', '🍔', '🚗', '💡', '🎬', '📦', '🏥', '🛒', '🍽️', '📺',
    '💰', '🎓', '🎮', '✈️', '🏋️', '📱', '💳', '🔧', '🎨', '📚',
    '☕', '🍕', '🎵', '🏖️', '🐕', '💊', '👔', '🎁', '🌟', '⚽'
];

const Budget = () => {
    const [budgets, setBudgets] = useState([]);
    const [activeTabs, setActiveTabs] = useState([]);
    const [currentBudgetId, setCurrentBudgetId] = useState(null);
    const [compareMode] = useState(false);
    const [selectedForCompare] = useState([]);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [graphCollapsed, setGraphCollapsed] = useState(true);
    const [incomeSort, setIncomeSort] = useState('source'); // 'source' | 'amount'
    const [expenseSort, setExpenseSort] = useState('category'); // 'category' | 'amount'
    const [categoryManageCollapsed, setCategoryManageCollapsed] = useState(true);
    const [editingExpense, setEditingExpense] = useState(null);
    const [addingCategory, setAddingCategory] = useState(null);

    useEffect(() => {
        const storedBudgets = JSON.parse(localStorage.getItem('budgets')) || [];
        // Ensure all expenses have assignedCategory field
        const normalizedBudgets = storedBudgets.map(b => ({
            ...b,
            expenses: (b.expenses || []).map(e => ({
                ...e,
                assignedCategory: e.assignedCategory || e.category || 'Misc',
                description: e.description || ''
            }))
        }));
        setBudgets(normalizedBudgets);
        if (normalizedBudgets.length) setCurrentBudgetId(normalizedBudgets[0].id);
    }, []);

    useEffect(() => {
        if (budgets.length > 0) {
            localStorage.setItem('budgets', JSON.stringify(budgets));
        }
    }, [budgets]);
    useEffect(() => {
        console.log(`Budget => useEffect => activeTabs: ${JSON.stringify(activeTabs, null, 2)}`);
    }, [activeTabs]);

    // Responsive sidebar collapse
    useEffect(() => {
        const handleResize = () => {
            setSidebarCollapsed(window.innerWidth < 700);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const addBudget = () => {
        const name = prompt('Enter new budget name');
        if (!name) return;
        const newBudget = {
            id: `budget-${Date.now()}`,
            name,
            income: [],
            expenses: [],
            categories: [...STANDARD_CATEGORIES]
        };
        setBudgets([...budgets, newBudget]);
        setActiveTabs([...activeTabs, newBudget.id]);
        setCurrentBudgetId(newBudget.id);
    };

    const addIncome = (budgetId) => {
        const source = prompt('Income source');
        const amount = Number(prompt('Amount'));
        if (!source || isNaN(amount)) return;
        setBudgets(budgets.map(b => b.id === budgetId ? { ...b, income: [...b.income, { source, amount }] } : b));
    };

    const addExpense = (budgetId) => {
        const category = prompt('Category (existing or new)');
        const amount = Number(prompt('Amount'));
        if (!category || isNaN(amount)) return;
        
        setBudgets(budgets.map(b => {
            if (b.id === budgetId) {
                const newCategories = b.categories.includes(category) ? b.categories : [...b.categories, category];
                return { 
                    ...b, 
                    categories: newCategories, 
                    expenses: [...b.expenses, { category, amount, description: '', assignedCategory: category }] 
                };
            }
            return b;
        }));
    };

    // Color-coded total logic
    const getTotalStatus = (budget) => {
        const totalIncome = budget.income.reduce((sum, i) => sum + Number(i.amount), 0);
        const totalExpenses = budget.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
        if (totalIncome === 0 && totalExpenses === 0) return 'neutral';
        if (totalIncome > totalExpenses) return 'under';
        if (totalIncome < totalExpenses) return 'over';
        return 'neutral';
    };

    const getTotalClass = (status) => {
        if (status === 'under') return 'dkGreen';
        if (status === 'over') return 'dkRed';
        return 'lite';
    };

    const prepareExpenseChartData = (budget) => {
        const expenseByCategory = {};
        budget.expenses.forEach(e => {
            expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + Number(e.amount);
        });
        return Object.keys(expenseByCategory).map(category => ({
            name: category,
            value: expenseByCategory[category]
        }));
    };

    const prepareIncomeChartData = (budget) => {
        const incomeBySource = {};
        budget.income.forEach(i => {
            incomeBySource[i.source] = (incomeBySource[i.source] || 0) + Number(i.amount);
        });
        return Object.keys(incomeBySource).map(source => ({
            name: source,
            value: incomeBySource[source]
        }));
    };

    const prepareTrendData = (budget) => {
        const data = [];
        let cumulativeIncome = 0;
        let cumulativeExpenses = 0;
        
        budget.income.forEach((i, idx) => {
            cumulativeIncome += Number(i.amount);
            data.push({
                index: idx + 1,
                income: cumulativeIncome,
                expenses: cumulativeExpenses,
                net: cumulativeIncome - cumulativeExpenses
            });
        });
        
        budget.expenses.forEach((e, idx) => {
            cumulativeExpenses += Number(e.amount);
            data.push({
                index: budget.income.length + idx + 1,
                income: cumulativeIncome,
                expenses: cumulativeExpenses,
                net: cumulativeIncome - cumulativeExpenses
            });
        });
        
        return data;
    };

    const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className='containerDetail p-10 bg-dark color-lite' style={{ 
                    borderRadius: '6px',
                    border: '1px solid #4a5568'
                }}>
                    {label && <div className='color-yellow mb-5'>{label}</div>}
                    {payload.map((entry, index) => (
                        <div key={index} className='color-lite size14'>
                            {entry.name}: ${Number(entry.value).toFixed(2)}
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    const renderGraphs = (budget) => (
        <div className='containerDetail mt-10 bg-lite'>
            <div className='containerDetail bg-lite p-10'>
                <CollapseToggleButton
                    title={<span className='color-yellow size20'>📊 Budget Visualizations</span>}
                    isCollapsed={graphCollapsed}
                    setCollapse={setGraphCollapsed}
                    align='left'
                />
            </div>
            {
                !graphCollapsed && (
                    <div className='containerDetail p-10'>
                        {/* Expense Distribution Pie Chart */}
                        <div className='containerDetail mt-10 bg-dark p-10'>
                            <div className='color-yellow size18 mb-10'>💰 Expense Distribution by Category</div>
                            {
                                budget.expenses.length > 0 ? (
                                    <ResponsiveContainer width='100%' height={300}>
                                        <PieChart>
                                            <Pie
                                                data={prepareExpenseChartData(budget)}
                                                cx='50%'
                                                cy='50%'
                                                labelLine={false}
                                                label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
                                                outerRadius={80}
                                                fill='#8884d8'
                                                dataKey='value'
                                            >
                                                {COLORS.map((color, index) => (
                                                    <Cell key={`cell-${index}`} fill={color} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className='color-lite p-10'>No expense data available</div>
                                )
                            }
                        </div>

                        {/* Income Distribution Pie Chart */}
                        <div className='containerDetail mt-10 bg-dark p-10'>
                            <div className='color-yellow size18 mb-10'>💵 Income Distribution by Source</div>
                            {
                                budget.income.length > 0 ? (
                                    <ResponsiveContainer width='100%' height={300}>
                                        <PieChart>
                                            <Pie
                                                data={prepareIncomeChartData(budget)}
                                                cx='50%'
                                                cy='50%'
                                                labelLine={false}
                                                label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
                                                outerRadius={80}
                                                fill='#82ca9d'
                                                dataKey='value'
                                            >
                                                {COLORS.map((color, index) => (
                                                    <Cell key={`cell-${index}`} fill={color} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className='color-lite p-10'>No income data available</div>
                                )
                            }
                        </div>

                        {/* Expense vs Category Bar Chart */}
                        <div className='containerDetail mt-10 bg-dark p-10'>
                            <div className='color-yellow size18 mb-10'>📈 Expenses by Category</div>
                            {
                                budget.expenses.length > 0 ? (
                                    <ResponsiveContainer width='100%' height={300}>
                                        <BarChart data={prepareExpenseChartData(budget)}>
                                            <CartesianGrid strokeDasharray='3 3' />
                                            <XAxis dataKey='name' />
                                            <YAxis />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey='value' fill='#FF6384' />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className='color-lite p-10'>No expense data available</div>
                                )
                            }
                        </div>

                        {/* Cumulative Trend Line Chart */}
                        <div className='containerDetail mt-10 bg-dark p-10'>
                            <div className='color-yellow size18 mb-10'>📊 Income vs Expenses Trend</div>
                            {
                                (budget.income.length > 0 || budget.expenses.length > 0) ? (
                                    <ResponsiveContainer width='100%' height={300}>
                                        <LineChart data={prepareTrendData(budget)}>
                                            <CartesianGrid strokeDasharray='3 3' />
                                            <XAxis dataKey='index' />
                                            <YAxis />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                            <Line type='monotone' dataKey='income' stroke='#4BC0C0' strokeWidth={2} />
                                            <Line type='monotone' dataKey='expenses' stroke='#FF6384' strokeWidth={2} />
                                            <Line type='monotone' dataKey='net' stroke='#FFCE56' strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className='color-lite p-10'>No data available</div>
                                )
                            }
                        </div>
                    </div>
                )
            }
        </div>
    );

    const sortIncome = (income) => {
        if (incomeSort === 'amount') {
            return [...income].sort((a, b) => b.amount - a.amount);
        }
        return [...income].sort((a, b) => a.source.localeCompare(b.source));
    };
    const sortExpenses = (expenses) => {
        if (expenseSort === 'amount') {
            return [...expenses].sort((a, b) => b.amount - a.amount);
        }
        // Sort by assignedCategory instead of category
        return [...expenses].sort((a, b) => {
            const catA = a.assignedCategory || a.category || '';
            const catB = b.assignedCategory || b.category || '';
            return catA.localeCompare(catB);
        });
    };

    const renderBudgetView = (budget) => {
        const totalIncome = budget.income.reduce((sum, i) => sum + Number(i.amount), 0);
        const totalExpenses = budget.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
        const status = getTotalStatus(budget);
        const totalClass = getTotalClass(status);

        const sortedIncome = sortIncome(budget.income);
        const sortedExpenses = sortExpenses(budget.expenses);

        return (
            <div key={budget.id} className='mt-5 containerDetail bg-lite color-lite width--5'>
                { 
                    (!activeTabs.includes(budget.id))
                        ? <div className='containerDetail bg-lite p-20 mb-5 color-yellow size20 contentLeft'>
                            💰 {budget.name}
                        </div>
                    : null
                }
                { 
                    (activeTabs.includes(budget.id))
                    ? <div className='containerDetail bg-lite flexContainer p-10 mb-5 color-yellow size20 contentLeft'>
                        <div className='pt-5 pb-5  m-5 flex2Column'>
                            💰 {budget.name}
                        </div>
                        <button
                            onClick={() => setActiveTabs(activeTabs.filter(id => id !== budget.id))}
                            className='containerDetail p-15 flexColumn bg-lite'
                        >
                            ❌
                        </button>
                    </div>
                    : null
                }
                <div className='containerDetail bg-dkGreen'>
                    <div
                        className='containerDetail p-20 button bg-green color-yellow size20'
                        onClick={() => addIncome(budget.id)}
                    >
                        <span className='text-outline-light mr-5'>➕</span> Add Income
                    </div>
                    <select 
                        value={incomeSort} 
                        onChange={(e) => setIncomeSort(e.target.value)}
                        className='containerDetail p-10 mt-05 bg-lite color-lite size15 width--5'
                    >
                        <option value='source'>Sort by Source</option>
                        <option value='amount'>Sort by Amount (High to Low)</option>
                    </select>
                    {sortedIncome.map((i, idx) => {
                        const originalIdx = budget.income.findIndex(item => item.source === i.source && item.amount === i.amount);
                        return (
                            <div className='containerDetail flexContainer p-10 mt-5 size20 color-yellow' key={originalIdx}>
                                <div className='flex2Column contentLeft'>
                                    <div className='p-5'>
                                        {i.source}: ${i.amount}
                                    </div>
                                </div>
                                <div className='flexColumn contentRight'>
                                    <button
                                        className='containerDetail p-5 ml-5 r-5 button bg-lite'
                                        title='Edit income'
                                        onClick={() => editIncome(budget.id, originalIdx)}
                                    >
                                        {icons.edit || 'Edit'}
                                    </button>
                                    <button
                                        className='containerDetail p-5 ml-5 r-5 button bg-lite'
                                        title='Delete income'
                                        onClick={() => deleteIncome(budget.id, originalIdx)}
                                    >
                                        {icons.delete || 'Delete'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className='containerDetail bg-dkRed mt-5'>
                    <div
                        className='containerDetail p-20 button bg-red color-yellow size20 flex2Column'
                        onClick={() => addExpense(budget.id)}
                    >
                        <span className='text-outline-light mr-5'>➕</span> Add Expense
                    </div>
                    <select 
                        value={expenseSort} 
                        onChange={(e) => setExpenseSort(e.target.value)}
                        className='containerDetail p-10 bg-lite color-lite size15 width--5'
                    >
                        <option value='category'>Sort by Category</option>
                        <option value='amount'>Sort by Amount (High to Low)</option>
                    </select>
                    {sortedExpenses.map((e, idx) => {
                        const originalIdx = budget.expenses.findIndex(item => item.category === e.category && item.amount === e.amount);
                        const expense = budget.expenses[originalIdx];
                        const assignedCat = expense?.assignedCategory || e.assignedCategory || e.category;
                        return (
                            <div className='containerDetail flexContainer p-10 mt-5 size20 color-yellow' key={originalIdx}>
                                <div className='flex2Column contentLeft'>
                                    <div className='p-5'>
                                        <span>{CATEGORY_ICONS[assignedCat] || '📦'}</span> {e.category}: ${e.amount}
                                        {expense?.description && (
                                            <div className='size12 color-lite m-5'>
                                                📝 {expense.description}
                                            </div>
                                        )}
                                        <div className='flexContainer p-5 mt-3' style={{ borderRadius: '4px', width: 'fit-content' }}>
                                            <span className='mr-5'>{CATEGORY_ICONS[assignedCat] || '📦'}</span>
                                            <span className='color-lite size12'>{assignedCat}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className='flexColumn contentRight'>
                                    <button
                                        className='containerDetail p-5 ml-5 r-5 button bg-lite'
                                        title='Edit expense'
                                        onClick={() => editExpense(budget.id, originalIdx)}
                                    >
                                        {icons.edit || 'Edit'}
                                    </button>
                                    <button
                                        className='containerDetail p-5 ml-5 r-5 button bg-lite'
                                        title='Delete expense'
                                        onClick={() => deleteExpense(budget.id, originalIdx)}
                                    >
                                        {icons.delete || 'Delete'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className={`containerDetail mt-5`}>
                    <div className='containerDetail color-lite size20 p-10 bg-dkGreen'>Total Income: ${totalIncome}</div>
                    <div className='containerDetail color-lite size20 p-10 mt-5 bg-dkRed'>Total Expenses: ${totalExpenses}</div>
                    <div className={`containerDetail color-lite size20 p-10 mt-5 bg-${totalClass}`}>Net: ${(totalIncome - totalExpenses).toFixed(2)}</div>
                </div>
                <div className='containerDetail mt-10 bg-lite'>
                    <div className='containerDetail bg-lite p-10'>
                        <CollapseToggleButton
                            title={<span className='color-yellow size20'>🏷️ Category Manager</span>}
                            isCollapsed={categoryManageCollapsed}
                            setCollapse={setCategoryManageCollapsed}
                            align='left'
                        />
                    </div>
                    {
                        !categoryManageCollapsed && (
                            <div className='containerDetail p-10'>
                                <div className='color-yellow size18 mb-10 contentLeft'>
                                    Available Categories:
                                </div>
                                <div className='containerDetail flexContainer p-10 bg-dark' style={{ flexWrap: 'wrap', gap: '10px' }}>
                                    {budget.categories.map((cat, idx) => {
                                        const expensesInCategory = budget.expenses.filter(e => e.category === cat).length;
                                        const isStandard = STANDARD_CATEGORIES.includes(cat);
                                        return (
                                            <div 
                                                key={idx} 
                                                className='containerDetail flexContainer p-10 bg-lite color-lite size15'
                                                style={{ borderRadius: '8px', gap: '5px' }}
                                            >
                                                <div className='flex2Column'>
                                                    <span>{CATEGORY_ICONS[cat] || '📦'}</span> {cat}
                                                    {expensesInCategory > 0 && (
                                                        <span className='size12 color-yellow ml-5'>({expensesInCategory})</span>
                                                    )}
                                                </div>
                                                {!isStandard && (
                                                    <button
                                                        className='containerDetail p-5 ml-5 button bg-red size12'
                                                        title={expensesInCategory > 0 ? `Cannot delete - has ${expensesInCategory} expense(s)` : 'Delete category'}
                                                        onClick={() => deleteCategory(budget.id, cat)}
                                                        disabled={expensesInCategory > 0}
                                                        style={{
                                                            opacity: expensesInCategory > 0 ? 0.5 : 1,
                                                            cursor: expensesInCategory > 0 ? 'not-allowed' : 'pointer'
                                                        }}
                                                    >
                                                        🗑️
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div
                                    className='containerDetail mt-5 p-10 button bg-green color-yellow size15 width-100-percent'
                                    onClick={() => handleAddCategory(budget.id)}
                                >
                                    ➕ Add Category
                                </div>
                            </div>
                        )
                    }
                </div>
                {renderGraphs(budget)}
            </div>
        );
    };

    const renderComparisonView = () => (
        <div className='comparison-view flexContainer'>
            {budgets.filter(b => selectedForCompare.includes(b.id)).map((renderBudgetView) => <div key={renderBudgetView.id} className='flexColumn'>{renderBudgetView && renderBudgetView.id ? renderBudgetView : 'No Budget Selected'}</div>)}
        </div>
    );

    const editBudget = (budgetId) => {
        const budget = budgets.find(b => b.id === budgetId);
        if (!budget) return;
        const newName = prompt('Edit budget name:', budget.name);
        if (newName && newName.trim() !== '' && newName !== budget.name) {
            setBudgets(budgets.map(b => b.id === budgetId ? { ...b, name: newName } : b));
        }
    };

    const deleteBudget = (budgetId) => {
        if (!window.confirm('Are you sure you want to delete this budget?')) return;
        const newBudgets = budgets.filter(b => b.id !== budgetId);
        setBudgets(newBudgets);
        setActiveTabs(activeTabs.filter(id => id !== budgetId));
        //setSelectedForCompare(selectedForCompare.filter(id => id !== budgetId));
        if (currentBudgetId === budgetId) {
            setCurrentBudgetId(newBudgets.length ? newBudgets[0].id : null);
        }
    };

    const editIncome = (budgetId, idx) => {
        const budget = budgets.find(b => b.id === budgetId);
        if (!budget) return;
        const income = budget.income[idx];
        if (!income) return;
        const newSource = prompt('Edit income source:', income.source);
        const newAmount = prompt('Edit income amount:', income.amount);
        if (newSource && !isNaN(Number(newAmount))) {
            setBudgets(budgets.map(b =>
                b.id === budgetId
                    ? {
                        ...b,
                        income: b.income.map((i, iIdx) =>
                            iIdx === idx ? { source: newSource, amount: Number(newAmount) } : i
                        )
                    }
                    : b
            ));
        }
    };

    const deleteIncome = (budgetId, idx) => {
        if (!window.confirm('Delete this income item?')) return;
        setBudgets(budgets.map(b =>
            b.id === budgetId
                ? { ...b, income: b.income.filter((_, iIdx) => iIdx !== idx) }
                : b
        ));
    };
    const editExpense = (budgetId, idx) => {
        const budget = budgets.find(b => b.id === budgetId);
        if (!budget) return;
        const expense = budget.expenses[idx];
        if (!expense) return;
        
        setEditingExpense({
            budgetId,
            idx,
            expense,
            categories: budget.categories
        });
    };

    const handleSaveExpense = (updatedData) => {
        if (!editingExpense) return;
        
        const { budgetId, idx, expense } = editingExpense;
        
        setBudgets(budgets.map(b =>
            b.id === budgetId
                ? {
                    ...b,
                    expenses: b.expenses.map((e, eIdx) =>
                        eIdx === idx 
                            ? { 
                                ...e,
                                category: expense.category,
                                amount: updatedData.amount,
                                description: updatedData.description,
                                assignedCategory: updatedData.assignedCategory
                            } 
                            : e
                    ),
                    categories: b.categories.includes(updatedData.assignedCategory)
                        ? b.categories
                        : [...b.categories, updatedData.assignedCategory]
                }
                : b
        ));
        
        setEditingExpense(null);
    };

    const handleCancelEdit = () => {
        setEditingExpense(null);
    };

    const deleteExpense = (budgetId, idx) => {
        if (!window.confirm('Delete this expense item?')) return;
        setBudgets(budgets.map(b =>
            b.id === budgetId
                ? { ...b, expenses: b.expenses.filter((_, eIdx) => eIdx !== idx) }
                : b
        ));
    };
    const deleteCategory = (budgetId, categoryName) => {
        const budget = budgets.find(b => b.id === budgetId);
        if (!budget) return;
        
        const expensesInCategory = budget.expenses.filter(e => e.category === categoryName).length;
        
        if (expensesInCategory > 0) {
            window.alert(`Cannot delete "${categoryName}" - it has ${expensesInCategory} expense(s). Delete the expenses first.`);
            return;
        }
        
        if (!window.confirm(`Delete category "${categoryName}"?`)) return;
        
        setBudgets(budgets.map(b =>
            b.id === budgetId
                ? { ...b, categories: b.categories.filter(cat => cat !== categoryName) }
                : b
        ));
    };
    const handleAddCategory = (budgetId) => {
        setAddingCategory({ budgetId });
    };

    const handleSaveCategory = (categoryData) => {
        if (!addingCategory) return;
        
        const { budgetId } = addingCategory;
        const { name, icon } = categoryData;
        
        setBudgets(budgets.map(b => {
            if (b.id === budgetId) {
                // Add to categories array
                const newCategories = b.categories.includes(name) ? b.categories : [...b.categories, name];
                
                // Store icon in CATEGORY_ICONS (you may want to persist this differently)
                if (icon && icon !== '📦') {
                    CATEGORY_ICONS[name] = icon;
                }
                
                return { ...b, categories: newCategories };
            }
            return b;
        }));
        
        setAddingCategory(null);
    };

    const handleCancelAddCategory = () => {
        setAddingCategory(null);
    };

    return (
        <div className={`mt--25 ml-5 mr-5 budget-manager${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
            {sidebarCollapsed && (
                <div className='containerDetail color-lite bg-lite mb-5 p-20 size20 contentLeft'>
                    <span className='size20 m-5'>
                        {icons.budget}
                    </span> Budget Manager
                </div>
            )}
            <aside className={`containerDetail sidebar${sidebarCollapsed ? ' collapsed' : ''}`}>
                {!sidebarCollapsed && (
                    <div className='containerDetail color-lite bg-lite mb-5 p-20 size20'>
                        <span className='size40 m-5'>{icons.budget}</span> Budget Manager
                    </div>
                )}
                <div className='containerDetail ht-300 bg-lite scroll'>
                    {budgets.map(b => (
                        <div key={b.id} className='containerDetail p-5 m-5 color-lite contentLeft flexContainer'>
                            <div
                                className='button flex2Column'
                                onClick={() => {
                                    setCurrentBudgetId(b.id);
                                    if (!activeTabs.includes(b.id)) setActiveTabs([...activeTabs, b.id]);
                                }}
                            >
                                {/*<input type='checkbox' checked={selectedForCompare.includes(b.id)} onChange={() => toggleCompare(b.id)} />*/}
                                <span className='ml-10 size20 color-yellow'>{b.name}</span>
                            </div>
                            <div className='flexColumn contentRight'>
                                <button
                                    className='containerDetail p-10 ml-10  bg-lite'
                                    title='Edit budget name'
                                    onClick={() => editBudget(b.id)}
                                >
                                    {icons.edit || 'Edit'}
                                </button>
                                <button
                                    className='containerDetail p-10 ml-10 bg-lite'
                                    title='Delete budget'
                                    onClick={() => deleteBudget(b.id)}
                                >
                                    {icons.delete || 'Delete'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className='containerDetail flexContainer mt-5 bg-lite'>
                    <div 
                        className='containerDetail button flexContainer size20 p-5 m-5 flex3Column bg-lite color-lite' 
                        onClick={addBudget}
                    >
                        <div className='flexColumn text-outline-light pl-10'>
                            ➕
                        </div> 
                        <div className='flex2Column p-10'>
                            Add Budget
                        </div> 
                    </div>
                    {
                        /*
                        <div 
                            className='containerDetail button size20 p-5 m-5 flex3Column bg-lite color-lite' 
                            onClick={() => setCompareMode(prev => !prev)}
                        >
                        {
                            (compareMode)
                            ? <div className='flexContainer '>
                                <div className='flexColumn pl-10'>
                                    ❌
                                </div>
                                <div className='flex2Column p-10'>
                                    Exit Compare
                                </div> 
                            </div>
                            : <div className='flexContainer'>
                                <div className='flexColumn pl-10'>
                                    ↔️
                                </div>
                                <div className='flex2Column'>
                                    Compare Selected
                                </div>
                            </div>
                        }
                        </div>
                        */
                    }
                    {sidebarCollapsed && (
                        <button 
                            className='containerDetail size20 p-5 m-5 flex3Column bg-lite' 
                            onClick={() => setSidebarCollapsed(false)}
                        >
                            {icons.menu || '→ Expand'}
                        </button>
                    )}
                </div>
            </aside>
            <main className={`budget-main h-scroll ${(sidebarCollapsed) ? 'mt--5' : null} ${(activeTabs.length < 2) ? 'width--10 mr-5' : null}`}>
                <div className={`${(activeTabs.length < 2) ? 'width--100-percent' : 'flexContainer'}`}>
                    {
                        (!compareMode)
                        ? activeTabs.map(tabId => (
                            <div 
                                key={tabId} 
                                onClick={() => setCurrentBudgetId(tabId)} 
                                className={`${(activeTabs.length < 2) ? 'width-100-percent' : 'flex2Column'} brdr-transparent ${tabId === currentBudgetId ? 'active' : ''}`}
                            >
                                <div className={`ml-5 budget-content${sidebarCollapsed ? ' stacked' : ''}`}>
                                    {renderBudgetView(budgets.find(b => b.id === (tabId)) || { name: 'No Budget Selected', income: [], expenses: [] })}
                                </div>
                            </div>
                        ))
                        : null
                    }
                </div>
                <div className={`budget-content${sidebarCollapsed ? ' stacked' : ''}`}>
                    {compareMode ? renderComparisonView() : (activeTabs.length < 1) ? renderBudgetView(budgets.find(b => b.id === currentBudgetId) || { name: 'No Budget Selected', income: [], expenses: [] }) : null}
                </div>
            </main>
            {editingExpense && (
                <ExpenseEditDialog
                    expense={editingExpense.expense}
                    categories={editingExpense.categories}
                    categoryIcons={CATEGORY_ICONS}
                    onSave={handleSaveExpense}
                    onCancel={handleCancelEdit}
                />
            )}
            
            {addingCategory && (
                <AddCategoryDialog
                    suggestedIcons={SUGGESTED_ICONS}
                    onSave={handleSaveCategory}
                    onCancel={handleCancelAddCategory}
                />
            )}
        </div>
    );
};

export default Budget;