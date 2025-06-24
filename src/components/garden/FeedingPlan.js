import React, { useState } from 'react'
import CollapseToggleButton from '../utils/CollapseToggleButton';
import getKey from '../utils/KeyGenerator';

const FeedingPlan = ({
    plan,
    index
}) => {
    const [collapsed, setCollapsed] = useState(true);
    const instructions = plan.instructions.split('.')
    return <div key={getKey(index)} className='containerBox'>
        <CollapseToggleButton
            title={`${plan.date} ${plan.phase.split(' ')[0]} ${plan.phase.split(' ')[1]}`}
            isCollapsed={collapsed}
            setCollapse={setCollapsed}
            align='left'
        />
        {
            (collapsed)
                ? null
                : <div className='containerBox'>
                    <div className='containerBox columnLeftAlign bg-green color-yellow'>
                        {plan.phase}
                    </div>
                    <div className='containerDetail p-20'>
                        <div className='columnLeftAlign color-yellow bold pt-15 pb-15'>
                            Food
                        </div>
                        {
                            plan.plan.map((step, index) => <div className='flexContainer'>
                                <div className='flexColumn'>
                                    {
                                        (step.includes('Fish'))
                                        ?'🐟'
                                        : (step.includes('10-10-10'))
                                            ? '⚖️'
                                            : (step.includes('pH'))
                                                ? '🧪'
                                                : '🔹'
                                    }
                                </div>
                                <div className='containerBox flex2Column columnLeftAlign'>
                                    {step}
                                </div>
                            </div>
                            )
                        }
                    </div>
                    <div className='containerBox'>
                        {

                            instructions.map((item, index) => {
                                return (item === '')
                                    ? null
                                    : <div className='columnLeftAlign'>
                                        {
                                            (item.includes('*'))
                                                ? item.split('*').map((subItem, subIndex) => {
                                                    if (index < (instructions.length - 1)) {
                                                        return <div className={`${(subIndex === 0) ? 'flexColumn' : 'containerBox flex2Column columnLeftAlign'}`}>
                                                            {
                                                                (subIndex === 0 && index !== 0)
                                                                    ? (String(subItem).includes('Fish'))
                                                                        ? '🐟'
                                                                        : (String(subItem).includes('Supplements'))
                                                                            ? '🧪'
                                                                            : '🔹'
                                                                    : subItem + '.'
                                                            }
                                                        </div>
                                                    }
                                                })
                                                : (item === '')
                                                    ? null
                                                    : <div className={`${(index !== 0 && index < (instructions.length - 1)) ? 'flexContainer' : null}`}>
                                                        <div className={`${(index !== 0 && index < (instructions.length - 1)) ? 'flexColumn' : null}`}>
                                                            {
                                                                (index !== 0 && index < (instructions.length - 1))
                                                                    ? (item.includes('Fish'))
                                                                        ? '🐟'
                                                                        : (item.includes('Supplements'))
                                                                            ? '🧪'
                                                                            : '🔹'
                                                                : null
                                                            }
                                                        </div>
                                                        <div className={`${(index !== 0 && index < (instructions.length - 1)) ? 'containerBox flex2Column' : 'pt-20 pb-20'} columnLeftAlign`}>
                                                            {item}
                                                        </div>
                                                    </div>
                                        }
                                    </div>
                            })}
                    </div>
                </div>
        }
    </div>
}
export default FeedingPlan;