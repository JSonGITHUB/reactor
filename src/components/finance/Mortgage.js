import React, { useEffect, useMemo, useState } from 'react';
import icons from '../site/icons';

const MORTGAGE_PLANS_KEY = 'mortgagePlans';
const MORTGAGE_ACTIVE_PLAN_KEY = 'mortgageActivePlanId';
const MORTGAGE_COMPARE_KEY = 'mortgageCompareIds';
const MORTGAGE_TAB_KEY = 'mortgageTab';

const toNumber = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
};

const round2 = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const currency = (value) => {
    const safe = Number.isFinite(value) ? value : 0;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(safe);
};

const percent = (value) => `${round2(value)}%`;

const asDateInput = (date) => {
    const d = new Date(date || Date.now());
    if (!Number.isFinite(d.getTime())) return new Date().toISOString().slice(0, 10);
    return d.toISOString().slice(0, 10);
};

const addMonths = (date, months) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
};

const formatDate = (dateLike) => {
    const d = new Date(dateLike);
    if (!Number.isFinite(d.getTime())) return '--';
    return d.toLocaleDateString([], { month: 'short', year: 'numeric' });
};

const getMonthlyPayment = (principal, annualRatePct, months) => {
    const p = Math.max(0, toNumber(principal));
    const n = Math.max(1, Math.round(toNumber(months, 360)));
    const monthlyRate = Math.max(0, toNumber(annualRatePct) / 100 / 12);

    if (monthlyRate === 0) return p / n;

    const factor = Math.pow(1 + monthlyRate, n);
    return p * ((monthlyRate * factor) / (factor - 1));
};

const createDefaultPlan = (name = 'Plan 1') => {
    const now = new Date().toISOString();
    return {
        id: `mort-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
        name,
        createdAt: now,
        updatedAt: now,
        inputs: {
            homePrice: 750000,
            downPayment: 20,
            downPaymentType: 'percent',
            interestRate: 6.5,
            termYears: 30,
            startDate: asDateInput(now),
            propertyTaxAnnual: 9000,
            insuranceAnnual: 1800,
            hoaMonthly: 0,
            pmiMonthly: 0,
        },
        strategy: {
            extraMonthly: 0,
            annualExtra: 0,
            annualExtraMonth: 1,
            oneTimePayments: [],
        },
    };
};

const computeMortgage = (plan) => {
    if (!plan) return null;

    const inputs = plan.inputs || {};
    const strategy = plan.strategy || {};

    const homePrice = Math.max(0, toNumber(inputs.homePrice));
    const downType = inputs.downPaymentType === 'amount' ? 'amount' : 'percent';
    const rawDown = Math.max(0, toNumber(inputs.downPayment));
    const downPaymentAmount = downType === 'percent'
        ? (homePrice * rawDown / 100)
        : rawDown;
    const loanAmount = Math.max(0, homePrice - downPaymentAmount);

    const interestRate = Math.max(0, toNumber(inputs.interestRate));
    const termYears = Math.max(1, Math.round(toNumber(inputs.termYears, 30)));
    const termMonths = termYears * 12;

    const propertyTaxAnnual = Math.max(0, toNumber(inputs.propertyTaxAnnual));
    const insuranceAnnual = Math.max(0, toNumber(inputs.insuranceAnnual));
    const hoaMonthly = Math.max(0, toNumber(inputs.hoaMonthly));
    const pmiMonthly = Math.max(0, toNumber(inputs.pmiMonthly));

    const escrowMonthly = propertyTaxAnnual / 12 + insuranceAnnual / 12 + hoaMonthly + pmiMonthly;

    const monthlyRate = interestRate / 100 / 12;
    const baseMonthlyPI = getMonthlyPayment(loanAmount, interestRate, termMonths);

    const extraMonthly = Math.max(0, toNumber(strategy.extraMonthly));
    const annualExtra = Math.max(0, toNumber(strategy.annualExtra));
    const annualExtraMonth = Math.min(12, Math.max(1, Math.round(toNumber(strategy.annualExtraMonth, 1))));

    const oneTimeByMonth = new Map();
    (strategy.oneTimePayments || []).forEach((item) => {
        if (!item?.date) return;
        const date = new Date(item.date);
        if (!Number.isFinite(date.getTime())) return;
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const prev = oneTimeByMonth.get(key) || 0;
        oneTimeByMonth.set(key, prev + Math.max(0, toNumber(item.amount)));
    });

    let balance = loanAmount;
    let totalInterest = 0;
    let totalPaid = 0;
    let cumulativePrincipal = 0;

    const startDate = inputs.startDate || asDateInput(Date.now());
    const rows = [];

    for (let monthIdx = 0; monthIdx < (termMonths + 600) && balance > 0.01; monthIdx++) {
        const currentDate = addMonths(startDate, monthIdx);
        const month = currentDate.getMonth() + 1;
        const monthKey = `${currentDate.getFullYear()}-${String(month).padStart(2, '0')}`;

        const interestPayment = monthlyRate > 0 ? balance * monthlyRate : 0;
        const scheduledPrincipal = Math.max(0, baseMonthlyPI - interestPayment);
        const annualExtraForMonth = month === annualExtraMonth ? annualExtra : 0;
        const oneTimeForMonth = oneTimeByMonth.get(monthKey) || 0;
        const extraForMonth = extraMonthly + annualExtraForMonth + oneTimeForMonth;

        const desiredPrincipal = scheduledPrincipal + extraForMonth;
        const principalPayment = Math.min(balance, desiredPrincipal);
        const piPayment = interestPayment + principalPayment;
        const totalPayment = piPayment + escrowMonthly;

        balance = Math.max(0, balance - principalPayment);
        totalInterest += interestPayment;
        totalPaid += totalPayment;
        cumulativePrincipal += principalPayment;

        rows.push({
            monthNumber: monthIdx + 1,
            date: currentDate.toISOString(),
            year: currentDate.getFullYear(),
            month,
            paymentPI: round2(piPayment),
            paymentTotal: round2(totalPayment),
            principal: round2(principalPayment),
            interest: round2(interestPayment),
            extra: round2(extraForMonth),
            balance: round2(balance),
            cumulativePrincipal: round2(cumulativePrincipal),
            cumulativeInterest: round2(totalInterest),
        });

        if (principalPayment <= 0 && monthlyRate === 0) break;
    }

    const payoffMonths = rows.length;
    const payoffDate = rows.length ? rows[rows.length - 1].date : null;

    const yearly = Object.values(rows.reduce((acc, row) => {
        if (!acc[row.year]) {
            acc[row.year] = {
                year: row.year,
                principal: 0,
                interest: 0,
                extra: 0,
                paymentTotal: 0,
                endingBalance: row.balance,
            };
        }
        acc[row.year].principal += row.principal;
        acc[row.year].interest += row.interest;
        acc[row.year].extra += row.extra;
        acc[row.year].paymentTotal += row.paymentTotal;
        acc[row.year].endingBalance = row.balance;
        return acc;
    }, {})).map((y) => ({
        ...y,
        principal: round2(y.principal),
        interest: round2(y.interest),
        extra: round2(y.extra),
        paymentTotal: round2(y.paymentTotal),
        endingBalance: round2(y.endingBalance),
    }));

    const milestones = [0.25, 0.5, 0.75, 1].map((ratio) => {
        const hit = rows.find((row) => row.cumulativePrincipal >= loanAmount * ratio);
        return {
            ratio,
            label: `${Math.round(ratio * 100)}% Paid`,
            date: hit ? hit.date : null,
            monthNumber: hit ? hit.monthNumber : null,
        };
    });

    return {
        homePrice,
        downPaymentAmount: round2(downPaymentAmount),
        downPaymentPct: homePrice > 0 ? round2((downPaymentAmount / homePrice) * 100) : 0,
        loanAmount: round2(loanAmount),
        termMonths,
        termYears,
        interestRate,
        escrowMonthly: round2(escrowMonthly),
        baseMonthlyPI: round2(baseMonthlyPI),
        baseMonthlyTotal: round2(baseMonthlyPI + escrowMonthly),
        payoffMonths,
        payoffDate,
        totalInterest: round2(totalInterest),
        totalPaid: round2(totalPaid),
        rows,
        yearly,
        milestones,
    };
};

const Mortgage = () => {
    const [plans, setPlans] = useState(() => {
        try {
            const stored = JSON.parse(localStorage.getItem(MORTGAGE_PLANS_KEY) || '[]');
            if (Array.isArray(stored) && stored.length) return stored;
            return [createDefaultPlan('Plan 1')];
        } catch {
            return [createDefaultPlan('Plan 1')];
        }
    });

    const [activePlanId, setActivePlanId] = useState(() => {
        const stored = localStorage.getItem(MORTGAGE_ACTIVE_PLAN_KEY);
        return stored || null;
    });

    const [compareIds, setCompareIds] = useState(() => {
        try {
            const stored = JSON.parse(localStorage.getItem(MORTGAGE_COMPARE_KEY) || '[]');
            return Array.isArray(stored) ? stored : [];
        } catch {
            return [];
        }
    });

    const [activeTab, setActiveTab] = useState(() => localStorage.getItem(MORTGAGE_TAB_KEY) || 'planner');
    const [amortizationYear, setAmortizationYear] = useState('all');
    const [isEditingLoanInputs, setIsEditingLoanInputs] = useState(false);

    useEffect(() => {
        if (!plans.length) {
            const seed = createDefaultPlan('Plan 1');
            setPlans([seed]);
            setActivePlanId(seed.id);
            return;
        }
        if (!activePlanId || !plans.some((p) => p.id === activePlanId)) {
            setActivePlanId(plans[0].id);
        }
    }, [plans, activePlanId]);

    useEffect(() => {
        localStorage.setItem(MORTGAGE_PLANS_KEY, JSON.stringify(plans));
    }, [plans]);

    useEffect(() => {
        if (activePlanId) localStorage.setItem(MORTGAGE_ACTIVE_PLAN_KEY, activePlanId);
    }, [activePlanId]);

    useEffect(() => {
        localStorage.setItem(MORTGAGE_COMPARE_KEY, JSON.stringify(compareIds));
    }, [compareIds]);

    useEffect(() => {
        localStorage.setItem(MORTGAGE_TAB_KEY, activeTab);
    }, [activeTab]);

    useEffect(() => {
        setIsEditingLoanInputs(false);
    }, [activePlanId]);

    const activePlan = useMemo(() => plans.find((p) => p.id === activePlanId) || null, [plans, activePlanId]);

    const activeMetrics = useMemo(() => computeMortgage(activePlan), [activePlan]);

    const planMetricsById = useMemo(() => {
        const map = {};
        plans.forEach((plan) => {
            map[plan.id] = computeMortgage(plan);
        });
        return map;
    }, [plans]);

    const comparedPlans = useMemo(() => {
        const picked = compareIds.length ? compareIds : (activePlanId ? [activePlanId] : []);
        return picked
            .map((id) => ({ plan: plans.find((p) => p.id === id), metrics: planMetricsById[id] }))
            .filter((entry) => entry.plan && entry.metrics);
    }, [compareIds, activePlanId, plans, planMetricsById]);

    const baseline = comparedPlans[0]?.metrics || activeMetrics;

    const updatePlan = (updater) => {
        setPlans((prev) => prev.map((plan) => {
            if (plan.id !== activePlanId) return plan;
            const updated = updater(plan);
            return {
                ...updated,
                updatedAt: new Date().toISOString(),
            };
        }));
    };

    const updateInput = (field, value) => {
        updatePlan((plan) => ({
            ...plan,
            inputs: {
                ...plan.inputs,
                [field]: value,
            },
        }));
    };

    const updateStrategy = (field, value) => {
        updatePlan((plan) => ({
            ...plan,
            strategy: {
                ...plan.strategy,
                [field]: value,
            },
        }));
    };

    const addPlan = () => {
        const nextNum = plans.length + 1;
        const base = activePlan || createDefaultPlan(`Plan ${nextNum}`);
        const clone = {
            ...base,
            id: `mort-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
            name: `${base.name} Copy`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            strategy: {
                ...(base.strategy || {}),
                oneTimePayments: [...(base.strategy?.oneTimePayments || [])],
            },
        };
        setPlans((prev) => [...prev, clone]);
        setActivePlanId(clone.id);
        setCompareIds((prev) => Array.from(new Set([...prev, clone.id])));
    };

    const startBlankPlan = () => {
        const fresh = createDefaultPlan(`Plan ${plans.length + 1}`);
        setPlans((prev) => [...prev, fresh]);
        setActivePlanId(fresh.id);
    };

    const removeActivePlan = () => {
        if (!activePlanId || plans.length <= 1) return;
        const nextPlans = plans.filter((p) => p.id !== activePlanId);
        setPlans(nextPlans);
        setCompareIds((prev) => prev.filter((id) => id !== activePlanId));
        setActivePlanId(nextPlans[0]?.id || null);
    };

    const toggleCompare = (planId) => {
        setCompareIds((prev) => {
            if (prev.includes(planId)) return prev.filter((id) => id !== planId);
            return [...prev, planId].slice(-4);
        });
    };

    const addOneTimePayment = () => {
        updatePlan((plan) => ({
            ...plan,
            strategy: {
                ...plan.strategy,
                oneTimePayments: [
                    ...(plan.strategy?.oneTimePayments || []),
                    { id: `otp-${Date.now().toString(36)}`, date: asDateInput(Date.now()), amount: 1000 },
                ],
            },
        }));
    };

    const updateOneTimePayment = (id, field, value) => {
        updatePlan((plan) => ({
            ...plan,
            strategy: {
                ...plan.strategy,
                oneTimePayments: (plan.strategy?.oneTimePayments || []).map((item) => (
                    item.id === id ? { ...item, [field]: value } : item
                )),
            },
        }));
    };

    const removeOneTimePayment = (id) => {
        updatePlan((plan) => ({
            ...plan,
            strategy: {
                ...plan.strategy,
                oneTimePayments: (plan.strategy?.oneTimePayments || []).filter((item) => item.id !== id),
            },
        }));
    };

    const years = useMemo(() => {
        const yearSet = new Set((activeMetrics?.rows || []).map((r) => r.year));
        return Array.from(yearSet).sort((a, b) => a - b);
    }, [activeMetrics]);

    const amortRows = useMemo(() => {
        const rows = activeMetrics?.rows || [];
        if (amortizationYear === 'all') return rows;
        return rows.filter((r) => String(r.year) === String(amortizationYear));
    }, [activeMetrics, amortizationYear]);

    const analyticsLines = useMemo(() => {
        if (!activeMetrics || !baseline) return [];
        if (baseline === activeMetrics) return [];

        const lines = [];
        const interestDelta = activeMetrics.totalInterest - baseline.totalInterest;
        const payoffDelta = activeMetrics.payoffMonths - baseline.payoffMonths;
        const monthlyDelta = activeMetrics.baseMonthlyTotal - baseline.baseMonthlyTotal;

        lines.push(
            interestDelta < 0
                ? `This plan projects ${currency(Math.abs(interestDelta))} lower lifetime interest than baseline.`
                : interestDelta > 0
                    ? `This plan projects ${currency(interestDelta)} higher lifetime interest than baseline.`
                    : 'This plan projects the same lifetime interest as baseline.'
        );

        lines.push(
            payoffDelta < 0
                ? `Projected payoff is ${Math.abs(payoffDelta)} months earlier than baseline.`
                : payoffDelta > 0
                    ? `Projected payoff is ${payoffDelta} months later than baseline.`
                    : 'Projected payoff timing is the same as baseline.'
        );

        lines.push(
            monthlyDelta < 0
                ? `Estimated monthly total is ${currency(Math.abs(monthlyDelta))} lower than baseline.`
                : monthlyDelta > 0
                    ? `Estimated monthly total is ${currency(monthlyDelta)} higher than baseline.`
                    : 'Estimated monthly total matches baseline.'
        );

        return lines;
    }, [activeMetrics, baseline]);

    if (!activePlan || !activeMetrics) {
        return <div className='containerDetail p-20 color-yellow bg-lite'>
                Loading mortgage planner...
            </div>;
    }

    return (
        <div className='containerDetail mt--30 ml-5 mr-5 contentLeft'>
            <div className='containerDetail bg-lite p-20'>
                <div className='size30 color-yellow contentLeft'>
                    {icons.mortgage || '🏦'} Mortgage Planner
                </div>
                <div className='size12 color-orange mt-10 contentLeft lh-15'>
                    Monthly payment modeling with escrow-inclusive totals. Compare multiple plans side-by-side.
                </div>
            </div>

            <div className='containerDetail mt-5'>
                <select
                    className='containerDetail bg-lite color-lite p-10 mt-2 mb-5 width--5'
                    value={activePlanId || ''}
                    onChange={(e) => setActivePlanId(e.target.value)}
                >
                    {(plans || []).map((plan) => (
                        <option key={`active-opt-${plan.id}`} value={plan.id}>
                            {plan.name}
                        </option>
                    ))}
                </select>
                <div 
                    className='flexContainer m-2' 
                    style={{ gap: '1px', alignItems: 'center', flexWrap: 'wrap' }}
                >
                    <div 
                        className='containerDetail button bg-green color-yellow p-10' 
                        onClick={startBlankPlan}
                    >
                        + New Plan
                    </div>
                    <div 
                        className='containerDetail button bg-dkYellow color-yellow p-10' 
                        onClick={addPlan}
                    >
                        Duplicate Active
                    </div>
                    <div 
                        className='containerDetail button bg-dkRed color-yellow p-10' 
                        onClick={removeActivePlan}
                    >
                        Delete Active
                    </div>
                </div>
            </div>

            <div className='containerDetail bg-lite mt-5'>
                <div className='size20 color-yellow p-5 mb-10 contentLeft'>
                    Mortgage Plans
                </div>
                {(plans || []).map((plan, pIdx) => {
                    const metrics = planMetricsById[plan.id];
                    const isActive = plan.id === activePlanId;
                    const isCompared = compareIds.includes(plan.id);
                    return (
                        <div
                            key={plan.id}
                            className={`containerDetail flexContainer p-10 ${pIdx === (plans || []).length - 1 ? '' : 'mb-5'} ${isActive ? 'bg-green' : 'bg-lite'}`}
                            style={{ gap: '1px', alignItems: 'center', cursor: 'pointer' }}
                            onClick={() => setActivePlanId(plan.id)}
                            title='Click to make this plan active'
                        >
                            <div className={`pt-10 pb-10 flex2Column contentLeft ${isActive ? 'color-yellow' : 'color-lite'}`}>
                                {plan.name}
                            </div>
                            <label 
                                className='size12 flexColumn color-yellow button' 
                                title='Include in comparison'
                            >
                                <input
                                    type='checkbox'
                                    checked={isCompared}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={() => toggleCompare(plan.id)}
                                /> Compare
                            </label>
                            <div className={`size12 ${isActive ? 'color-yellow' : 'color-lite'} flex4Column contentRight`} title={`Last updated: ${new Date(plan.updatedAt).toLocaleString()}`}>
                                {metrics ? `${currency(metrics.baseMonthlyTotal)} / mo` : '--'}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className='containerDetail bg-lite mt-5'>
                <div 
                    className='containerDetail bg-lite p-10 flexContainer mb-5' 
                    style={{ alignItems: 'center' }}
                >
                    <div className='flex3Column contentLeft'>
                        {
                            isEditingLoanInputs
                                ? <input
                                    className='containerDetail bg-lite color-lite p-10 mt-5 width--5'
                                    value={activePlan.name}
                                    onChange={(e) => {
                                        const nextName = e.target.value;
                                        setPlans((prev) => prev.map((p) => p.id === activePlan.id ? { ...p, name: nextName, updatedAt: new Date().toISOString() } : p));
                                    }}
                                />
                                : <div className='size20 color-yellow'>
                                    {activePlan.name}
                                </div>
                        }
                    </div>
                    <div
                        className='containerDetail flexColumn button bg-green color-yellow p-10 contentCenter size14'
                        title={isEditingLoanInputs ? 'Lock loan inputs' : 'Edit plan name and loan inputs'}
                        onClick={() => setIsEditingLoanInputs((prev) => !prev)}
                    >
                        ✏️ {isEditingLoanInputs ? 'Done' : 'Edit'}
                    </div>
                </div>
                <div className='containerDetail p-10'>
                    <div className='size12 color-orange'>
                        Home Price
                    </div>
                    <input className='containerDetail bg-lite color-lite p-10 width-100-percent' type='number' value={activePlan.inputs.homePrice}
                        disabled={!isEditingLoanInputs}
                        onChange={(e) => updateInput('homePrice', e.target.value)} 
                    />
                
                    <div className='size12 color-orange'>
                        Down Type
                    </div>
                    <select 
                        className='containerDetail bg-lite color-lite p-10' 
                        value={activePlan.inputs.downPaymentType}
                        disabled={!isEditingLoanInputs}
                        onChange={(e) => updateInput('downPaymentType', e.target.value)}
                    >
                        <option value='percent'>%</option>
                        <option value='amount'>$</option>
                    </select>
                        <div className='size12 color-orange'>
                            Down Payment
                        </div>
                        <input 
                            className='containerDetail bg-lite color-lite p-10 width-100-percent' 
                            type='number' value={activePlan.inputs.downPayment}
                            disabled={!isEditingLoanInputs}
                            onChange={(e) => updateInput('downPayment', e.target.value)} 
                        />
                    <div className='size12 color-orange'>
                        Interest %
                    </div>
                    <input 
                        className='containerDetail bg-lite color-lite p-10 width-100-percent' 
                        type='number' step='0.01' 
                        value={activePlan.inputs.interestRate}
                        disabled={!isEditingLoanInputs}
                        onChange={(e) => updateInput('interestRate', e.target.value)} 
                    />
                    <div className='size12 color-orange'>
                        Term (Years)
                    </div>
                    <input 
                        className='containerDetail bg-lite color-lite p-10 width-100-percent' 
                        type='number' value={activePlan.inputs.termYears}
                        disabled={!isEditingLoanInputs}
                        onChange={(e) => updateInput('termYears', e.target.value)} 
                    />
                        <div className='size12 color-orange'>
                            Start Date
                        </div>
                        <input 
                            className='containerDetail bg-lite color-lite p-10 width-100-percent' 
                            type='date' value={activePlan.inputs.startDate}
                            disabled={!isEditingLoanInputs}
                            onChange={(e) => updateInput('startDate', e.target.value)} 
                        />
                </div>
                <div className='containerDetail p-10 mt-5'>
                    <div className='size14 color-yellow contentLeft mb-10'>
                        Escrow & Carrying Costs (Included in totals)
                    </div>
                    <div 
                        className='flexContainer' 
                        style={{ gap: '1px', flexWrap: 'wrap' }}
                    >
                        <div className='flex1Column'>
                            <div className='size12 color-orange'>
                                Property Tax / Year
                            </div>
                            <input 
                                className='containerDetail bg-lite color-lite p-10 width-100-percent' 
                                type='number' value={activePlan.inputs.propertyTaxAnnual}
                                disabled={!isEditingLoanInputs}
                                onChange={(e) => updateInput('propertyTaxAnnual', e.target.value)} 
                            />
                        </div>
                        <div className='flex1Column'>
                            <div className='size12 color-orange'>
                                Insurance / Year
                            </div>
                            <input 
                                className='containerDetail bg-lite color-lite p-10 width-100-percent' 
                                type='number' value={activePlan.inputs.insuranceAnnual}
                                disabled={!isEditingLoanInputs}
                                onChange={(e) => updateInput('insuranceAnnual', e.target.value)} 
                            />
                        </div>
                        <div className='flex1Column'>
                            <div className='size12 color-orange'>
                                HOA / Month
                            </div>
                            <input 
                                className='containerDetail bg-lite color-lite p-10 width-100-percent' 
                                type='number' value={activePlan.inputs.hoaMonthly}
                                disabled={!isEditingLoanInputs}
                                onChange={(e) => updateInput('hoaMonthly', e.target.value)} 
                            />
                        </div>
                        <div className='flex1Column'>
                            <div className='size12 color-orange'>
                                PMI / Month
                            </div>
                            <input 
                                className='containerDetail bg-lite color-lite p-10 width-100-percent' 
                                type='number' value={activePlan.inputs.pmiMonthly}
                                disabled={!isEditingLoanInputs}
                                onChange={(e) => updateInput('pmiMonthly', e.target.value)} 
                            />
                        </div>
                    </div>
                </div>
                <div className='containerDetail p-10 mt-5'>
                    <div className='size14 color-yellow contentLeft mb-10'>
                        Prepayment Strategy Tools
                    </div>
                    <div 
                        className='flexContainer' 
                        style={{ gap: '1px', flexWrap: 'wrap' }}
                    >
                        <div className='flex1Column'>
                            <div className='size12 color-orange'>
                                Extra Monthly
                            </div>
                            <input 
                                className='containerDetail bg-lite color-lite p-10 width-100-percent' 
                                type='number' 
                                value={activePlan.strategy.extraMonthly}
                                disabled={!isEditingLoanInputs}
                                onChange={(e) => updateStrategy('extraMonthly', e.target.value)} />
                        </div>
                        <div className='flex1Column'>
                            <div className='size12 color-orange'>
                                Annual Extra
                            </div>
                            <input 
                                className='containerDetail bg-lite color-lite p-10 width-100-percent' 
                                type='number' 
                                value={activePlan.strategy.annualExtra}
                                disabled={!isEditingLoanInputs}
                                onChange={(e) => updateStrategy('annualExtra', e.target.value)} />
                        </div>
                        <div className='flex1Column'>
                            <div className='size12 color-orange'>
                                Annual Extra Month
                            </div>
                            <select 
                                className='containerDetail bg-lite color-lite p-10' 
                                value={activePlan.strategy.annualExtraMonth}
                                disabled={!isEditingLoanInputs}
                                onChange={(e) => updateStrategy('annualExtraMonth', e.target.value)}
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className='containerDetail mt-5'>
                    <div className='size12 color-yellow p-10 contentLeft'>
                        One-time Extra Payments
                    </div>
                    {(activePlan.strategy.oneTimePayments || []).map((item) => (
                        <div 
                            key={item.id} 
                            className='flexContainer mb-5' 
                            style={{ gap: '1px', alignItems: 'center' }}
                        >
                            <input 
                                className='containerDetail bg-lite color-lite p-10 width-100-percent' 
                                type='date' value={item.date}
                                disabled={!isEditingLoanInputs}
                                onChange={(e) => updateOneTimePayment(item.id, 'date', e.target.value)} 
                            />
                            <input 
                                className='containerDetail bg-lite color-lite p-10 width-100-percent' 
                                type='number' value={item.amount}
                                disabled={!isEditingLoanInputs}
                                onChange={(e) => updateOneTimePayment(item.id, 'amount', e.target.value)} 
                            />
                            {
                                isEditingLoanInputs
                                ? <div 
                                        className='button bg-dkRed color-yellow p-10' 
                                        onClick={() => removeOneTimePayment(item.id)}
                                    >
                                        ✕
                                    </div>
                                : null
                            }
                        </div>
                    ))}
                    {
                        isEditingLoanInputs
                            ? <div 
                                className='button bg-lite color-yellow p-10 contentCenter' 
                                onClick={addOneTimePayment}
                            >
                                + Add One-time Payment
                            </div>
                            : null
                    }
                </div>
            </div>

            <div className='containerDetail bg-lite mt-5'>
                <div className=''>
                    <div className='containerDetail bg-lite p-10 mb-5'>
                        <div className='size12 color-orange'>
                            Loan Amount
                        </div>
                        <div className='size20 color-yellow'>
                            {currency(activeMetrics.loanAmount)}
                        </div>
                    </div>
                    <div className='containerDetail bg-lite p-10 mb-5'>
                        <div className='size12 color-orange'>
                            Monthly P&I
                        </div>
                        <div className='size20 color-yellow'>
                            {currency(activeMetrics.baseMonthlyPI)}
                        </div>
                    </div>
                    <div className='containerDetail bg-lite p-10 mb-5'>
                        <div className='size12 color-orange'>
                            Monthly Total (PITI+fees)
                        </div>
                        <div className='size20 color-yellow'>
                            {currency(activeMetrics.baseMonthlyTotal)}
                        </div>
                    </div>
                    <div className='containerDetail bg-lite p-10 mb-5'>
                        <div className='size12 color-orange'>
                            Projected Payoff
                        </div>
                        <div className='size20 color-yellow'>
                            {formatDate(activeMetrics.payoffDate)}
                        </div>
                    </div>
                    <div className='containerDetail bg-lite p-10 mb-5'>
                        <div className='size12 color-orange'>
                            Total Interest
                        </div>
                        <div className='size20 color-yellow'>
                            {currency(activeMetrics.totalInterest)}
                        </div>
                    </div>
                    <div className='containerDetail bg-lite p-10'>
                        <div className='size12 color-orange'>
                            Total Paid
                        </div>
                        <div className='size20 color-yellow'>
                            {currency(activeMetrics.totalPaid)}
                        </div>
                    </div>
                </div>
            </div>

            <div className='containerDetail bg-lite mt-5'>
                <div 
                    className='flexContainer mb-5 width-100-percent contentCenter' 
                    style={{ gap: '1px', borderBottom: '2px solid #333' }}
                >
                    {['planner', 'amortized', 'compare', 'forecast'].map((tab) => (
                        <div
                            key={tab}
                            className={`containerDetail flex4Column button p-10 ${activeTab === tab ? 'bg-green color-yellow' : 'bg-lite color-yellow'}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </div>
                    ))}
                </div>

                {activeTab === 'planner' && (
                    <div className='containerDetail p-10'>
                        <div className='size14 color-yellow contentLeft mb-10'>
                            Analytics
                        </div>
                        {(analyticsLines.length ? analyticsLines : [
                            'Select at least two plans in Compare to view delta analytics for this active plan.',
                        ]).map((line, idx) => (
                            <div 
                                key={`line-${idx}`} 
                                className='size12 color-orange mb-5 contentLeft'
                            >
                                • {line}
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'amortized' && (
                    <div className='containerDetail p-10'>
                        <div 
                            className='flexContainer mb-10' 
                            style={{ gap: '1px', alignItems: 'center' }}
                        >
                            <div className='size12 color-yellow'>
                                Filter Year
                            </div>
                            <select
                                className='containerDetail bg-lite color-lite p-10'
                                value={amortizationYear}
                                onChange={(e) => setAmortizationYear(e.target.value)}
                            >
                                <option value='all'>
                                    All
                                </option>
                                {years.map((y) => <option key={y} value={y}>{y}</option>)}
                            </select>
                            <div className='size12 color-orange'>
                                Rows: {amortRows.length}
                            </div>
                        </div>
                        <div className='flexContainer color-yellow width--20'>
                            <div className='flex3Column contentLeft'>Month</div>
                            <div className='flex5Column contentRight'>Principal</div>
                            <div className='flex5Column contentRight'>Interest</div>
                            <div className='flex5Column contentRight'>Extra</div>
                            <div className='flex5Column contentRight'>Total</div>
                            <div className='flex5Column contentRight'>Balance</div>
                        </div>
                        <div className='containerDetail' style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            <div className='containerDetail width-100-percent'>
                                {amortRows.map((row) => (
                                    <div key={`${row.monthNumber}-${row.date}`} className='flexContainer size12 color-lite'>
                                        <div className='flexColumn contentLeft'>{row.monthNumber}</div>
                                        <div className='flex4Column contentRight'>{formatDate(row.date)}</div>
                                        <div className='flex5Column contentRight'>{currency(row.principal)}</div>
                                        <div className='flex5Column contentRight'>{currency(row.interest)}</div>
                                        <div className='flex5Column contentRight'>{currency(row.extra)}</div>
                                        <div className='flex5Column contentRight'>{currency(row.paymentTotal)}</div>
                                        <div className='flex5Column contentRight'>{currency(row.balance)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'compare' && (
                    <div className='containerDetail p-10'>
                        {comparedPlans.length < 2 ? (
                            <div className='size12 color-orange contentLeft'>
                                Select at least two plans using the Compare checkboxes above.
                            </div>
                        ) : (
                            <div className='containerDetail' style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                <div className='containerDetail width--10'>
                                    <div className='flexContainer color-yellow'>
                                        <div className='flex7Column contentLeft'>Metric</div>
                                        {comparedPlans.map((entry) => (
                                            <div key={`head-${entry.plan.id}`} className='flex7Column contentLeft'>
                                                {entry.plan.name}
                                            </div>
                                        ))}
                                    </div>
                                    {[
                                        { label: 'Loan Amount', get: (m) => currency(m.loanAmount) },
                                        { label: 'Down Payment %', get: (m) => percent(m.downPaymentPct) },
                                        { label: 'Monthly P&I', get: (m) => currency(m.baseMonthlyPI) },
                                        { label: 'Monthly Total (incl escrow)', get: (m) => currency(m.baseMonthlyTotal) },
                                        { label: 'Payoff Date', get: (m) => formatDate(m.payoffDate) },
                                        { label: 'Payoff Months', get: (m) => `${m.payoffMonths}` },
                                        { label: 'Total Interest', get: (m) => currency(m.totalInterest) },
                                        { label: 'Total Paid', get: (m) => currency(m.totalPaid) },
                                    ].map((row) => (
                                        <div key={row.label} className='flexContainer size12 color-lite'>
                                            <div className='flex7Column color-yellow'>{row.label}</div>
                                            {comparedPlans.map((entry) => (
                                                <div key={`${row.label}-${entry.plan.id}`} className='flex7Column'>
                                                    {row.get(entry.metrics)}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'forecast' && (
                    <div className='containerDetail p-10'>
                        <div className='size14 color-yellow contentLeft mb-10 pl-10'>
                            Payoff Milestones
                        </div>
                        <div 
                            className='flexContainer' 
                            style={{ gap: '1px', flexWrap: 'wrap' }}
                        >
                            {(activeMetrics.milestones || []).map((m) => (
                                <div key={m.label} className='containerDetail bg-lite p-10 mb-5'>
                                    <div className='size12 color-orange'>
                                        {m.label}
                                    </div>
                                    <div className='size16 color-yellow'>
                                        {m.date ? formatDate(m.date) : '--'}
                                    </div>
                                    <div className='size12 color-lite'>
                                        {m.monthNumber ? `Month ${m.monthNumber}` : ''}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className='size14 color-yellow contentLeft mt-20 mb-10'>
                            Yearly Forecast
                        </div>
                        <div className='flexContainer color-yellow width--10'>
                            <div className='flex7Column contentLeft'>Year</div>
                            <div className='flex7Column contentLeft'>Principal</div>
                            <div className='flex7Column contentLeft'>Interest</div>
                            <div className='flex7Column contentLeft'>Extra</div>
                            <div className='flex7Column contentLeft'>Total Paid</div>
                            <div className='flex7Column contentLeft'>Ending Balance</div>
                        </div>
                        <div className='' style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            <div className='containerDetail'>
                                {(activeMetrics.yearly || []).map((y) => (
                                    <div key={y.year} className='flexContainer size12 color-lite' style={{ gap: '15px' }}>
                                        <div className='flex5Column contentLeft'>{y.year}</div>
                                        <div className='flex5Column contentRight'>{currency(y.principal)}</div>
                                        <div className='flex5Column contentRight'>{currency(y.interest)}</div>
                                        <div className='flex5Column contentCenter w-20'>{currency(y.extra)}</div>
                                        <div className='flex5Column contentRight w-80'>{currency(y.paymentTotal)}</div>
                                        <div className='flex5Column contentRight'>{currency(y.endingBalance)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Mortgage;
