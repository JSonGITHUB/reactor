import React, { useEffect, useState } from 'react';
import './WelcomeFlow.css';

/**
 * Full flow:
 * 1. Welcome screen (enter first name) -> Begin
 * 2. Quote fade (3-4s)
 * 3. Overlay transition to brand color + upward reveal of dashboard
 * 4. Dashboard with tasks and tips
 */

const DEFAULT_TASKS = [
    { id: 1, text: 'Check your schedule', done: false },
    { id: 2, text: 'Drink a glass of water', done: false },
    { id: 3, text: 'Plan your top 3 priorities', done: false },
];

const QUOTES = [
    { text: 'Make today ridiculously amazing.', author: 'Unknown' },
    { text: 'Small steps every day.', author: 'Unknown' },
    { text: 'Be the reason someone smiles today.', author: 'Unknown' },
];

const storageKey = 'user';

const readUserFromStorage = () => {
    try {
        const raw = localStorage.getItem(storageKey);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
};

const saveUserToStorage = (user) => {
    try {
        localStorage.setItem(storageKey, JSON.stringify(user));
    } catch (e) {
        // ignore
    }
};

const SunriseIcon = ({ className = '' }) => (
    <svg viewBox='0 0 64 64' className={className} aria-hidden>
        <g fill='none' stroke='currentColor' strokeWidth='2'>
            <path d='M32 44V28' strokeLinecap='round' />
            <path d='M10 44h44' strokeLinecap='round' />
            <path d='M16 34l-4-4M52 34l4-4' strokeLinecap='round' />
            <path d='M22 30l-6-6M42 30l6-6' strokeLinecap='round' />
            <path d='M20 14a12 12 0 0024 0' strokeLinecap='round' />
        </g>
    </svg>
);

export default function WelcomeFlow() {
    const stored = readUserFromStorage();
    const [firstName, setFirstName] = useState((stored && stored.firstName) || '');
    const [step, setStep] = useState(stored ? 'dashboard' : 'welcome');
    const [quoteIndex, setQuoteIndex] = useState(0);
    const [tasks, setTasks] = useState(DEFAULT_TASKS);
    const [showTipIndex, setShowTipIndex] = useState(stored ? -1 : 0); // show tips for first-time only
    const [overlayActive, setOverlayActive] = useState(false);
    const [dashboardVisible, setDashboardVisible] = useState(stored ? true : false);
    const [showProgressMicro, setShowProgressMicro] = useState(false);

    useEffect(() => {
        // nothing special on mount
    }, []);

    const handleBegin = () => {
        const cleaned = firstName.trim();
        if (!cleaned) {
            // simple feedback: briefly shake input or set a message — we'll simple focus
            const el = document.querySelector('.wf-input');
            if (el) el.focus();
            return;
        }

        // Save to localStorage
        const user = { firstName: cleaned, firstSeenAt: new Date().toISOString() };
        saveUserToStorage(user);

        // Start the sequence: welcome -> quote -> overlay -> dashboard
        setStep('quote');
        setQuoteIndex(Math.floor(Math.random() * QUOTES.length));

        // quote lasts ~3.5s then transition overlay
        setTimeout(() => {
            setOverlayActive(true);
            setShowProgressMicro(true);
            // after overlay (animation 800ms), show dashboard with upward reveal
            setTimeout(() => {
                setDashboardVisible(true);
                setStep('dashboard');
                // hide overlay and micro anim after a little
                setTimeout(() => {
                    setOverlayActive(false);
                    setShowProgressMicro(false);
                }, 800);
            }, 900);
        }, 3500);
    };

    const toggleTask = (id) =>
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

    const handleSkipTips = () => setShowTipIndex(-1);

    const handleNextTip = () => setShowTipIndex((i) => (i < 2 ? i + 1 : -1));

    const handleReset = () => {
        localStorage.removeItem(storageKey);
        setFirstName('');
        setStep('welcome');
        setDashboardVisible(false);
        setShowTipIndex(0);
        setTasks(DEFAULT_TASKS);
    };

    // Dashboard 'final summary' or display
    return (
        <div className=''>
            {/* Overlay for transition */}
            <div className={`wf-overlay ${overlayActive ? 'active' : ''}`} aria-hidden />

            {/* Welcome screen */}
            {step === 'welcome' && (
                    <div className='containerBox'>
                        <div className='containerBox'>
                            Welcome,&nbsp;
                            <input
                                className='p-20'
                                type='text'
                                aria-label='First name'
                                placeholder='First Name'
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>
                        <p className='wf-sub'>Your day starts here</p>

                        <div
                            className='containerBox button bg-green'
                            onClick={handleBegin}
                            aria-label='Begin'
                        >
                            Begin
                        </div>
                    </div>
            )}

            {/* Quote Fade */}
            {step === 'quote' && (
                <main className='wf-screen wf-quote'>
                    <div className='wf-quote-box'>
                        <div className='wf-quote-icon'>
                            <SunriseIcon />
                        </div>
                        <blockquote className='wf-quote-text'>
                            “{QUOTES[quoteIndex].text}”
                            <footer className='wf-quote-author'>— {QUOTES[quoteIndex].author}</footer>
                        </blockquote>
                    </div>
                </main>
            )}

            {/* Dashboard */}
            <div className={/*wf-dashboard-wrap*/`containerBox ${dashboardVisible ? 'visible' : ''}`}>
                <div className='containerBox button color-orange' onClick={handleReset}>
                    <h2>Good morning{firstName ? `, ${firstName}` : ''} 🤙🏽</h2>
                </div>
{/*
                <main className='wf-dashboard'>
                    {showProgressMicro && (
                        <div className='wf-micro-progress' aria-hidden>
                            <div className='wf-progress-bar'>
                                <div className='wf-progress-fill' />
                            </div>
                        </div>
                    )}
                    
                    <section className='wf-tips'>
                        {showTipIndex >= 0 && (
                            <div className='wf-tip-bubble' role='dialog' aria-live='polite'>
                                <strong>Tip:</strong>
                                {showTipIndex === 0 && <span> Spin the wheel to earn daily motivation tokens.</span>}
                                {showTipIndex === 1 && <span> Click a task to mark it done — complete streaks build habit.</span>}
                                {showTipIndex === 2 && <span> Use the dashboard to track your top 3 priorities each day.</span>}
                                <div className='wf-tip-actions'>
                                    <button className='wf-small' onClick={handleNextTip}>Next</button>
                                    <button className='wf-small' onClick={handleSkipTips}>Close</button>
                                </div>
                            </div>
                        )}
                    </section>

                    <section className='wf-tasks'>
                        <h3>Today's Tasks</h3>
                        <ul>
                            {tasks.map((task) => (
                                <li key={task.id} className={`wf-task ${task.done ? 'done' : ''}`}>
                                    <label>
                                        <input
                                            type='checkbox'
                                            checked={task.done}
                                            onChange={() => toggleTask(task.id)}
                                        />
                                        <span className='wf-task-text'>{task.text}</span>
                                    </label>
                                </li>
                            ))}
                        </ul>

                        <div className='wf-welcome-text'>
                            <strong>Welcome!</strong>
                            <p>We've pre-populated a few tasks to help you get started. Customize them anytime.</p>
                        </div>
                    </section>

                </main>
*/}
            </div>

        </div>
    );
}