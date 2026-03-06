import React, { useMemo, PureComponent } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const TideGraph = ({
    tideChart
}) => {

    const convertedData = useMemo(() => {
        if (!tideChart?.predictions || tideChart.predictions.length === 0) {
            return [];
        }
        const newData = [...tideChart.predictions];
        const get12Hour = (hour) => {
            const getLabel = (hour >= 12) ? 'pm' : 'am';
            return getLabel;
        }
        const getTime = (time) => {
            const newTime = String(time).split(' ')[1];
            const hour = newTime.split(':')[0]
            const minutes = newTime.split(':')[1]
            const label = get12Hour(hour);
            const removeLeadingZero = (str) => {
                if (str.startsWith('0')) {
                    return str.slice(1);
                }
                return str;
            }
            let displayTime = removeLeadingZero(newTime)
            if (hour > 12) {
                displayTime = `${Number(hour) - 12}:${minutes}`
            }
            return `${displayTime}${label}`
        }
        
        const updatedData = newData.map((tide) => ({
            ...tide,
            name: tide.type === 'H' ? 'HIGH' : (Number(tide.v) < 3.6 ? 'LOW' : 'HIGH'),
            pv: Number(tide.v),
            uv: Number(tide.v),
            tide: Number(tide.v),
            amt: Number(tide.v),
            value: Number(tide.v),
            time: getTime(tide.t)
        }));
        //console.log(`updatedData: ${JSON.stringify(updatedData, null, 2)}`);
        return updatedData;
    }, [tideChart?.predictions]);

    const isDataConverted = convertedData.length > 0;

    const box = {
        borderRadius: 10,
        backgroundColor: 'black',
        fontSize: 20,
    }

    class CustomizedAxisTick extends PureComponent {
        render() {
            const { x, y, payload } = this.props;

            return (
                <g transform={`translate(${x},${y})`}>
                    <text x={0} y={-12} dy={16} textAnchor='end' fill='#666' transform='rotate(0)'>
                        {payload.value}ft
                    </text>
                </g>
            );
        }
    }
    class CustomizedXAxisTick extends PureComponent {
        render() {
            const { x, y, payload } = this.props;

            return (
                <g transform={`translate(${x},${y})`}>
                    <text x={24} y={0} dy={16} textAnchor='end' backgroundcolor='#0099ff' fill='#666' fontSize='15' transform='rotate(0)'>
                        {payload.value}
                    </text>
                </g>
            );
        }
    }
    /*
    const getIntroOfPage = (label) => {
        if (label === 'Page A') {
            return `Page A is about men's clothing`;
        }
        if (label === 'Page B') {
            return `Page B is about women's dress`;
        }
        if (label === 'Page C') {
            return `Page C is about women's bag`;
        }
        if (label === 'Page D') {
            return `Page D is about household goods`;
        }
        if (label === 'Page E') {
            return `Page E is about food`;
        }
        if (label === 'Page F') {
            return `Page F is about baby food`;
        }
        return '';
    };
*/
    const convertDate = (payload) => {
        const dateStr = payload[0].payload.t;
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const date = new Date(dateStr);
        const month = months[date.getMonth()];
        const day = date.getDate();

        const suffix = (day) => {
            if (day > 3 && day < 21) return 'th'; // special case for 11-13
            switch (day % 10) {
                case 1: return 'st';
                case 2: return 'nd';
                case 3: return 'rd';
                default: return 'th';
            }
        };

        return `${month} ${day}${suffix(day)}`;
    };

    const getTide = (payload) => ((Number(payload[0].payload.tide) < 2) ? 'Low Tide' : (Number(payload[0].payload.tide) < 3) ? 'Medium Tide' : 'High Tide');

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className='containerDetail bg-tintedMedium'>
                    <div className='containerBox bg-tintedMedium contentCenter'>
                        <span className='color-yellow mr-10'>
                            {`${convertDate(payload)}`}
                        </span>
                        {label}
                    </div>
                    <div className='containerBox bg-tintedMedium contentCenter'>
                        <span className='color-yellow'>{`${getTide(payload)}`}</span>  {`${Number(payload[0].value).toFixed(1)} ft`}
                    </div>
                </div>
            );
        }

        return null;
    };
    
    return (
        (isDataConverted)
            ? <div>
                <div className='color-yellow size20 containerDetail contentLeft pl-20 pt-10 pb-10 bg-lite'>
                    La Jolla
                </div>
                <div className='mb-20'></div>
                <div className='ml--20 mb-20'>
                    <ResponsiveContainer width='100%' height={400}>
                        <AreaChart
                            width='100%'
                            height={100}
                            data={convertedData}
                            syncId='anyId'
                            margin={{
                                top: 10,
                                right: 30,
                                left: 0,
                                bottom: 0,
                            }}
                        >
                            <CartesianGrid strokeDasharray='3 3' />
                            <XAxis dataKey='time' tick={<CustomizedXAxisTick />} />
                            <YAxis dataKey='tide' tick={<CustomizedAxisTick />} />
                            <Tooltip
                                contentStyle={box}
                                content={<CustomTooltip />}
                            />
                            <Area type='monotone' dataKey='tide' stroke='#0099ff' fill='#0099ff' activeDot={{ r: 8, stroke:'#0099ff', fill:'orange'}} strokeWidth={3} dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
            : null
    )
};

export default TideGraph;