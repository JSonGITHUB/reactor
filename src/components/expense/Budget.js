import React, { useState, useEffect } from 'react';
import icons from '../site/icons';
import './Budget.css';

const STANDARD_CATEGORIES = ['Housing', 'Food', 'Transport', 'Utilities', 'Entertainment', 'Misc'];

const Budget = () => {
    const [budgets, setBudgets] = useState([]);
    const [activeTabs, setActiveTabs] = useState([]);
    const [currentBudgetId, setCurrentBudgetId] = useState(null);
    const [compareMode, setCompareMode] = useState(false);
    const [selectedForCompare, setSelectedForCompare] = useState([]);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        const storedBudgets = JSON.parse(localStorage.getItem('budgets')) || [];
        setBudgets(storedBudgets);
        if (storedBudgets.length) setCurrentBudgetId(storedBudgets[0].id);
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
                return { ...b, categories: newCategories, expenses: [...b.expenses, { category, amount }] };
            }
            return b;
        }));
    };
/*
    const toggleCompare = (budgetId) => {
        if (selectedForCompare.includes(budgetId)) {
            setSelectedForCompare(selectedForCompare.filter(id => id !== budgetId));
        } else {
            setSelectedForCompare([...selectedForCompare, budgetId]);
        }
    };
*/
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

    const renderBudgetView = (budget) => {
        const totalIncome = budget.income.reduce((sum, i) => sum + Number(i.amount), 0);
        const totalExpenses = budget.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
        const status = getTotalStatus(budget);
        const totalClass = getTotalClass(status);

        return (
            <div key={budget.id} className='mt-5 containerDetail bg-lite color-lite'>
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
                    {budget.income.map((i, idx) => (
                        <div className='containerDetail flexContainer p-10 mt-5 size20 color-yellow' key={idx}>
                            <div className='flex2Column contentLeft'>
                                <div className='p-5'>
                                    {i.source}: ${i.amount}
                                </div>
                            </div>
                            <div className='flexColumn contentRight'>
                                <button
                                    className='containerDetail p-5 ml-5 r-5 button bg-lite'
                                    title='Edit income'
                                    onClick={() => editIncome(budget.id, idx)}
                                >
                                    {icons.edit || 'Edit'}
                                </button>
                                <button
                                    className='containerDetail p-5 ml-5 r-5 button bg-lite'
                                    title='Delete income'
                                    onClick={() => deleteIncome(budget.id, idx)}
                                >
                                    {icons.delete || 'Delete'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className='containerDetail bg-dkRed mt-5'>
                    <div
                        className='containerDetail p-20 button bg-red color-yellow size20'
                        onClick={() => addExpense(budget.id)}
                    >
                        <span className='text-outline-light mr-5'>➕</span> Add Expense
                    </div>
                    {budget.expenses.map((e, idx) => (
                        <div className='containerDetail flexContainer p-10 mt-5 size20 color-yellow' key={idx}>
                            <div className='flex2Column contentLeft'>
                                <div className='p-5'>
                                    {e.category}: ${e.amount}
                                </div>
                            </div>
                            <div className='flexColumn contentRight'>
                                <button
                                    className='containerDetail p-5 ml-5 r-5 button bg-lite'
                                    title='Edit expense'
                                    onClick={() => editExpense(budget.id, idx)}
                                >
                                    {icons.edit || 'Edit'}
                                </button>
                                <button
                                    className='containerDetail p-5 ml-5 r-5 button bg-lite'
                                    title='Delete expense'
                                    onClick={() => deleteExpense(budget.id, idx)}
                                >
                                    {icons.delete || 'Delete'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className={`containerDetail mt-5`}>
                    <div className='containerDetail color-lite size20 p-10 bg-dkGreen'>Total Income: ${totalIncome}</div>
                    <div className='containerDetail color-lite size20 p-10 mt-5 bg-dkRed'>Total Expenses: ${totalExpenses}</div>
                    <div className={`containerDetail color-lite size20 p-10 mt-5 bg-${totalClass}`}>Net: ${(totalIncome - totalExpenses).toFixed(2)}</div>
                </div>
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
        const newCategory = prompt('Edit expense category:', expense.category);
        const newAmount = prompt('Edit expense amount:', expense.amount);
        if (newCategory && !isNaN(Number(newAmount))) {
            setBudgets(budgets.map(b =>
                b.id === budgetId
                    ? {
                        ...b,
                        expenses: b.expenses.map((e, eIdx) =>
                            eIdx === idx ? { category: newCategory, amount: Number(newAmount) } : e
                        ),
                        categories: b.categories.includes(newCategory)
                            ? b.categories
                            : [...b.categories, newCategory]
                    }
                    : b
            ));
        }
    };

    const deleteExpense = (budgetId, idx) => {
        if (!window.confirm('Delete this expense item?')) return;
        setBudgets(budgets.map(b =>
            b.id === budgetId
                ? { ...b, expenses: b.expenses.filter((_, eIdx) => eIdx !== idx) }
                : b
        ));
    };
    return (
        <div className={`mt--30 budget-manager${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
            {sidebarCollapsed && (
                <div className='containerDetail color-lite bg-lite ml-5 mr-5 mt-5 p-22 size20 contentLeft'>
                    <span className='size20 m-5'>{icons.budget}</span> Budget Manager
                </div>
            )}
            <aside className={`containerDetail sidebar${sidebarCollapsed ? ' collapsed' : ''}`}>
                {!sidebarCollapsed && (
                    <div className='containerDetail color-lite bg-lite mb-5 p-22 size20'>
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
                <div className={`${(activeTabs.length < 2) ? 'width-100-percent' : 'flexContainer'}`}>
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
        </div>
    );
};

export default Budget;