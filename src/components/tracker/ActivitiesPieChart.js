import React, { useCallback, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

const ActivitiesPieChart = ({
    trainingData,
    goalData,
    colors,
    category
}) => {

    const convertToDataFormat = (data) => {
        //console.log(`convertToDataFormat => ${JSON.stringify(data, null, 2)}`)
        return data.map(item => ({
            name: item.skill,
            value: Number(item.percentage)
        }));
    };

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const radius = innerRadius + (outerRadius-innerRadius) * 0.5;
        const x = cx + (radius*2.5) * Math.cos(-midAngle * RADIAN);
        const y = cy + (radius*2.5) * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y}  textAnchor={x > cx ? 'start' : 'end'} fill={colors[index % colors.length]} dominantBaseline="central">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };
    const data = convertToDataFormat(trainingData);
    const goals = convertToDataFormat(goalData);
    const pieChartDisplay = () => <PieChart width={300} height={230}>
        <Pie
            data={(category === 'training') ? data : goals}
            cx={150}
            cy={100}
            labelLine={true}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill='#8884d8'
            dataKey='value'
        >
            {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
        </Pie>
        <Tooltip />
    </PieChart>
    const tooltipStyle = {
        color: 'blue',
        backgroundColor: '#00FF00',
    };
    const customizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const radius = (innerRadius/2)+10;
        const x = cx + (radius*2.5) * Math.cos(-midAngle * RADIAN);
        const y = cy + (radius*2.5) * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} textAnchor={x > cx ? 'start' : 'end'} fill={colors[index % colors.length]} dominantBaseline="central">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };
    const outerPieDisplay = () => <PieChart width={350} height={265}>
        <Pie
            data={goals}
            dataKey='value'
            cx='50%'
            cy='50%'
            outerRadius={60}
            labelLine={false}
            fill='#8884d8'
        >
            {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
        </Pie>
        <Pie
            data={(category === 'training') ? data : goals}
            cx='50%'
            cy='50%'
            labelLine={true}
            label={customizedLabel}
            innerRadius={70}
            outerRadius={90}
            fill='#8884d8'
            dataKey='value'
        >
            {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
        </Pie>
        <Tooltip />
    </PieChart>
    return (
        (category === 'training') ? outerPieDisplay() : pieChartDisplay()
    );
}

export default ActivitiesPieChart;