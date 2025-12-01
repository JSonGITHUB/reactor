import React, { useState, useEffect } from 'react';
import './AIDashboard.css';

/* -----------------------
   Mock API setup
   ----------------------- */
// You can remove this section when connecting to a real backend
if (!window._mockAIServer) {
    window._mockAIServer = true;

    // Simulate a simple backend route
    const originalFetch = window.fetch;
    window.fetch = async (url, options) => {
        if (url.endsWith('/api/ai-suggestions')) {
            const { moduleKey, context } = JSON.parse(options.body || '{}');
            return new Promise((resolve) => {
                setTimeout(() => {
                    const suggestions = generateAISuggestions(moduleKey, context);
                    resolve(
                        new Response(
                            JSON.stringify({ suggestions }),
                            { headers: { 'Content-Type': 'application/json' } }
                        )
                    );
                }, 900 + Math.random() * 800);
            });
        }
        // Default passthrough for any real fetch
        return originalFetch(url, options);
    };
}

/* -----------------------
   Mock module components
   ----------------------- */
const BudgetModule = ({ context, setContext }) => {
    const budgets = context.budgets || [];
    const activeId = context.activeBudgetId || (budgets[0] && budgets[0].id);

    useEffect(() => {
        if (!context.activeBudgetId && budgets[0]) {
            setContext((c) => ({ ...c, activeBudgetId: budgets[0].id }));
        }
    }, []); // eslint-disable-line

    const active = budgets.find((b) => b.id === activeId) || budgets[0] || null;

    const updateCategory = (budgetId, catName, value) => {
        setContext((prev) => ({
            ...prev,
            budgets: prev.budgets.map((b) =>
                b.id === budgetId
                    ? {
                        ...b,
                        categories: {
                            ...b.categories,
                            [catName]: Number(value),
                        },
                    }
                    : b
            ),
        }));
    };

    const addBudget = () => {
        const id = `b${Date.now()}`;
        const newBudget = {
            id,
            name: `Budget ${budgets.length + 1}`,
            categories: { Housing: 800, Food: 300, Transport: 150, Utilities: 120 },
            limit: 2000,
        };
        setContext((prev) => ({ ...prev, budgets: [...prev.budgets, newBudget], activeBudgetId: id }));
    };

    return (
        <div className="module-inner">
            <div className="module-actions">
                <button onClick={addBudget}>+ New Budget</button>
                <select
                    value={active ? active.id : ''}
                    onChange={(e) => setContext((c) => ({ ...c, activeBudgetId: e.target.value }))}
                >
                    {budgets.map((b) => (
                        <option key={b.id} value={b.id}>
                            {b.name}
                        </option>
                    ))}
                </select>
            </div>

            {!active && <div className="empty-msg">No budgets — create one to get started.</div>}

            {active && (
                <div>
                    <h4>{active.name}</h4>
                    <div className="budget-grid">
                        {Object.entries(active.categories).map(([cat, amt]) => (
                            <div key={cat} className="budget-row">
                                <label>{cat}</label>
                                <input
                                    type="number"
                                    value={amt}
                                    onChange={(e) => updateCategory(active.id, cat, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="budget-summary">
                        <strong>
                            Total: $
                            {Object.values(active.categories).reduce((s, v) => s + Number(v || 0), 0).toFixed(2)} / $
                            {active.limit}
                        </strong>
                    </div>
                </div>
            )}
        </div>
    );
};

const MaintenanceModule = ({ context, setContext }) => {
    const tasks = context.tasks || [];
    const addTask = () => {
        const t = { id: `t${Date.now()}`, title: 'New Task', due: '', priority: 'Medium', done: false };
        setContext((c) => ({ ...c, tasks: [...(c.tasks || []), t] }));
    };
    const toggleDone = (id) =>
        setContext((c) => ({ ...c, tasks: c.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }));

    return (
        <div className="module-inner">
            <div className="module-actions">
                <button onClick={addTask}>+ Add Task</button>
            </div>
            <ul className="task-list">
                {tasks.length === 0 && <li className="empty-msg">No tasks. Add a maintenance task to signal AI.</li>}
                {tasks.map((t) => (
                    <li key={t.id}>
                        <input type="checkbox" checked={t.done} onChange={() => toggleDone(t.id)} />
                        <span className={t.done ? 'done' : ''}>{t.title}</span>
                        <small className="muted"> {t.priority} {t.due && ` • due ${t.due}`}</small>
                    </li>
                ))}
            </ul>
        </div>
    );
};

/* -----------------------
   Main Dashboard
   ----------------------- */
const MODULES = [
    { key: 'Overview', label: 'Overview' },
    { key: 'Budget', label: 'Budget Manager' },
    { key: 'Maintenance', label: 'Maintenance Manager' },
];

const initialContexts = {
    Budget: {
        budgets: [
            { id: 'b1', name: 'City A', categories: { Housing: 1200, Food: 350, Transport: 120 }, limit: 2200 },
        ],
        activeBudgetId: 'b1',
    },
    Maintenance: {
        tasks: [{ id: 'm1', title: 'Change HVAC filter', due: '', priority: 'High', done: false }],
    },
};

const AIDashboard = () => {
    const [openTabs, setOpenTabs] = useState([]);
    const [activeTabKey, setActiveTabKey] = useState(null);
    const [contexts, setContexts] = useState(initialContexts);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState([]);

    const openModule = (moduleKey) => {
        if (openTabs.find((t) => t.key === moduleKey)) {
            setActiveTabKey(moduleKey);
            return;
        }
        setOpenTabs((prev) => [...prev, { key: moduleKey }]);
        setActiveTabKey(moduleKey);
    };

    const closeTab = (key) => {
        setOpenTabs((prev) => prev.filter((t) => t.key !== key));
        if (activeTabKey === key) {
            const remaining = openTabs.filter((t) => t.key !== key);
            setActiveTabKey(remaining.length ? remaining[remaining.length - 1].key : null);
        }
    };

    const setModuleContext = (moduleKey, newPartial) =>
        setContexts((prev) => ({ ...prev, [moduleKey]: { ...(prev[moduleKey] || {}), ...newPartial } }));

    // 🔥 FETCH mock AI API instead of simulated timer
    useEffect(() => {
        if (!activeTabKey) {
            setAiSuggestions([]);
            return;
        }

        setAiLoading(true);
        setAiSuggestions([]);

        fetch('/api/ai-suggestions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                moduleKey: activeTabKey,
                context: contexts[activeTabKey] || {},
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                setAiSuggestions(data.suggestions || []);
            })
            .catch(() => {
                setAiSuggestions(['⚠️ AI service unavailable. Please try again later.']);
            })
            .finally(() => setAiLoading(false));
    }, [activeTabKey, contexts]);

    const renderModule = (key) => {
        const ctx = contexts[key] || {};
        const setCtx = (updater) => {
            if (typeof updater === 'function') {
                const res = updater(ctx);
                setModuleContext(key, res);
            } else {
                setModuleContext(key, updater);
            }
        };

        switch (key) {
            case 'Budget':
                return <BudgetModule context={ctx} setContext={setCtx} />;
            case 'Maintenance':
                return <MaintenanceModule context={ctx} setContext={setCtx} />;
            default:
                return <div className="module-inner">Overview (summary dashboard)</div>;
        }
    };

    return (
        <div className="ai-dashboard mt--30">
            <aside className="ai-sidebar">
                <h2>AI Dashboard</h2>
                {MODULES.map((m) => (
                    <div
                        key={m.key}
                        className={`module-item ${activeTabKey === m.key ? 'active' : ''}`}
                        onClick={() => openModule(m.key)}
                    >
                        {m.label}
                    </div>
                ))}
            </aside>

            <main className="ai-main">
                <header className="ai-header">
                    <div className="tabs-row">
                        {openTabs.map((t) => (
                            <div
                                key={t.key}
                                className={`tab ${activeTabKey === t.key ? 'active' : ''}`}
                                onClick={() => setActiveTabKey(t.key)}
                            >
                                {MODULES.find((m) => m.key === t.key)?.label || t.key}
                                <button className="tab-close" onClick={(e) => { e.stopPropagation(); closeTab(t.key); }}>×</button>
                            </div>
                        ))}
                    </div>
                </header>

                <section className="ai-content">
                    <div className="content-left">
                        {activeTabKey ? renderModule(activeTabKey) : <div className="empty-center">Open a module</div>}
                    </div>
                    <aside className="content-right">
                        <div className="ai-box">
                            <h3>AI Suggestions</h3>
                            {aiLoading ? (
                                <div className="ai-loading"><div className="spinner" /> <span>Loading...</span></div>
                            ) : (
                                <ul className="ai-list">
                                    {aiSuggestions.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            )}
                        </div>
                    </aside>
                </section>
            </main>
        </div>
    );
};

/* -----------------------
   Mock AI Suggestion Logic
   ----------------------- */
function generateAISuggestions(key, context) {
    if (key === 'Budget') {
        const budgets = context.budgets || [];
        if (!budgets.length) return ['No budgets yet — add one to receive AI insights.'];
        const active = budgets.find((b) => b.id === context.activeBudgetId) || budgets[0];
        const total = Object.values(active.categories || {}).reduce((s, n) => s + Number(n || 0), 0);
        const pctFood = active.categories.Food ? (active.categories.Food / total) * 100 : 0;
        const suggestions = [];
        if (pctFood > 25) suggestions.push(`Food is ${pctFood.toFixed(0)}% of your budget. Consider dining at home more often.`);
        if (total > active.limit) suggestions.push(`You’ve exceeded your limit by ${(total - active.limit).toFixed(2)}.`);
        if (!suggestions.length) suggestions.push('Budget is healthy — nice work!');
        return suggestions;
    }

    if (key === 'Maintenance') {
        const tasks = context.tasks || [];
        const overdue = tasks.filter((t) => !t.done && t.due && new Date(t.due) < new Date()).length;
        const suggestions = [];
        if (overdue) suggestions.push(`You have ${overdue} overdue maintenance tasks.`);
        if (tasks.length === 0) suggestions.push('No maintenance tasks added — add one to start tracking.');
        if (!suggestions.length) suggestions.push('All systems operational!');
        return suggestions;
    }

    return ['General system overview — AI insights coming soon.'];
}

export default AIDashboard;