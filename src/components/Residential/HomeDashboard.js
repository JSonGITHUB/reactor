import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { FaExclamationTriangle, FaClock, FaInfoCircle } from 'react-icons/fa';

// Reusable widget component with optional legend tooltip
const WidgetCard = ({ title, count, children, background = '#eee', color = '#000', legend }) => {
    return (
        <div
            style={{
                background,
                color,
                padding: '15px',
                borderRadius: '8px',
                flex: 1,
                minHeight: '120px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                position: 'relative',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ flex: 1 }}>{title}</h3>
                {legend && (
                    <span title={legend} style={{ cursor: 'help' }}>
                        <FaInfoCircle />
                    </span>
                )}
            </div>
            <p style={{ fontSize: '24px', margin: '5px 0' }}>{count}</p>
            <div>{children}</div>
        </div>
    );
};

const HomeDashboard = ({ inventory = [], tasks = [], recurringTasks = [] }) => {
    const [lowStockItems, setLowStockItems] = useState([]);
    const [todayTasks, setTodayTasks] = useState([]);
    const [upcomingRecurringTasks, setUpcomingRecurringTasks] = useState([]);

    useEffect(() => {
        const lowStock = inventory.filter(item => item.quantity <= 2);
        setLowStockItems(lowStock);

        const today = moment().startOf('day');

        const todaysTasks = tasks.filter(
            task => !task.completed && moment(task.date).isSameOrBefore(today, 'day')
        );
        setTodayTasks(todaysTasks);

        const upcoming = recurringTasks.filter(task => {
            const taskDate = moment(task.date);
            return taskDate.isAfter(today, 'day') && taskDate.diff(today, 'days') <= 7;
        });
        setUpcomingRecurringTasks(upcoming);
    }, [inventory, tasks, recurringTasks]);

    const getLowStockColor = quantity => {
        if (quantity <= 1) return { background: '#f94144', color: 'white' };
        if (quantity === 2) return { background: '#f8961e', color: 'white' };
        return { background: '#f9c74f', color: 'black' };
    };

    const getTaskColor = task => {
        const today = moment().startOf('day');
        const taskDate = moment(task.date);
        if (!task.completed && taskDate.isBefore(today, 'day')) return { background: '#f94144', color: 'white' };
        if (!task.completed && taskDate.diff(today, 'days') <= 2) return { background: '#f9c74f', color: 'black' };
        return { background: '#90be6d', color: 'white' };
    };

    return (
        <div className='containerBox'>
            <h1>Home Dashboard</h1>
            {/* Summary Widgets */}
            <section style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <WidgetCard
                    title='Low Stock Items'
                    count={lowStockItems.length}
                    legend='Red: Out of stock, Orange: Low stock (≤2), Yellow: Moderate stock'
                >
                    {lowStockItems.map(i => (
                        <div key={i.id} style={{ ...getLowStockColor(i.quantity), padding: '2px 5px', borderRadius: '4px', marginBottom: '2px' }}>
                            {i.name} ({i.quantity}) {i.quantity <= 2 && <FaExclamationTriangle style={{ marginLeft: '5px' }} />}
                        </div>
                    ))}
                </WidgetCard>

                <WidgetCard
                    title='Tasks Due Today'
                    count={todayTasks.length}
                    legend='Red: Overdue, Yellow: Due soon (≤2 days), Green: On track'
                    background={todayTasks.length ? getTaskColor(todayTasks[0]).background : '#90be6d'}
                    color={todayTasks.length ? getTaskColor(todayTasks[0]).color : 'white'}
                >
                    {todayTasks.map(t => (
                        <div key={t.id} style={{ marginBottom: '2px' }}>
                            {t.name}
                            {!t.completed && moment(t.date).isBefore(moment(), 'day') && <FaExclamationTriangle style={{ marginLeft: '5px' }} />}
                            {!t.completed && moment(t.date).diff(moment(), 'days') <= 2 && <FaClock style={{ marginLeft: '5px' }} />}
                        </div>
                    ))}
                </WidgetCard>

                <WidgetCard
                    title='Upcoming Recurring Tasks (7 days)'
                    count={upcomingRecurringTasks.length}
                    legend='Tasks scheduled within next 7 days'
                    background='#f94144'
                    color='white'
                >
                    {upcomingRecurringTasks.map(t => (
                        <div key={t.id} style={{ marginBottom: '2px' }}>
                            {t.name} - {moment(t.date).format('MMM D')}
                            {moment(t.date).diff(moment(), 'days') <= 2 && <FaClock style={{ marginLeft: '5px' }} />}
                        </div>
                    ))}
                </WidgetCard>

                <WidgetCard title='Total Inventory Items' count={inventory.length} background='#577590' color='white' legend='Total count of all items in inventory' />
            </section>

            {/* Additional dashboard content can go here */}
        </div>
    );
};

export default HomeDashboard;