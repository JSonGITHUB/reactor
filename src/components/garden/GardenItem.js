import React, { useState } from 'react'
import CollapseToggleButton from '../utils/CollapseToggleButton';
import icons from '../site/icons';

const GardenItem = ({
    item,
    index,
    setModalData,
    crops,
    setCrops
}) => {
    const [collapsed, setCollapsed] = useState(true);
    const planted = !!crops[item.index].planted;

    //console.log(`GardenItem => item: ${JSON.stringify(item, null, 2)}`);
    const suns = {
        'Full sun': '☀️', 
        'Partial shade': '🌙' 
    }
    const getCurrentTime = new Date();
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const currentMonth = getCurrentTime.getMonth() + 1;
    const goodMonth = item.months.includes(months[currentMonth]);
    const isMoist = item.soil.includes('Moist');

    const header = () => <div className='button bold color-yellow relative' onClick={() => setModalData(item)}>
        {getCheckBox(item)} {item.icon} {item.name} {(goodMonth) ? <span className='ml-20 absolute' title={item.months}>📅 <span title={item.sun_exposure} className='ml-10 containerDetail mr-10'>{suns[item.sun_exposure]}</span>{(isMoist) ? '💦' : ''}</span> : null}
    </div>

    const determineHarvestDate = (item) => {
        if (!item.months || item.months.length === 0) {
            return "No planting months available";
        }

        // Define month mappings to get numeric values
        const monthMap = {
            January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
            July: 6, August: 7, September: 8, October: 9, November: 10, December: 11
        };

        // Extract the first planting month
        const firstMonth = item.months[0];
        const firstMonthIndex = monthMap[firstMonth];

        if (firstMonthIndex === undefined) {
            return "Invalid month data";
        }

        // Extract the number of days from the harvest property
        let daysToHarvest;
        const match = item.harvest.match(/\d+/g); // Extract numbers from "70-80 days"

        if (match) {
            daysToHarvest = Math.max(...match.map(Number)); // Use the larger number
        } else {
            return item.harvest; // If no numeric value found, return the harvest string as-is
        }

        // Get current year
        const currentYear = new Date().getFullYear();

        // Create a date object for the first day of the planting month
        const plantingDate = new Date(currentYear, firstMonthIndex, 1);

        // Add the daysToHarvest to determine the harvest date
        const harvestDate = new Date(plantingDate);
        harvestDate.setDate(harvestDate.getDate() + daysToHarvest);

        // Format the result as a readable string
        return harvestDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    };

    const togglePlanted = () => {
        const newCrops = [...crops];
        newCrops[item.index].planted = !planted;
        setCrops(newCrops);
        setCollapsed(true);
    }

    const getCheckBox = (item) => <input
        id={`${item.name}`}
        name={`${item.name}`}
        className='regular-checkbox button glassy ml-5 mr-10 mb--5'
        checked={!!planted}
        type='checkbox'
        onChange={togglePlanted}
    />
    return (
        <div key={index} className={`containerBox ${(!!planted) ? 'bg-dkGreen' : (goodMonth) ? 'bg-dkYellow' : 'bg-lite'}`}>
            <CollapseToggleButton
                title={header()}
                isCollapsed={collapsed}
                setCollapse={setCollapsed}
                align='left'
            />
            {
                (goodMonth) 
                ? <div className='containerBox columnLeftAlign' title={determineHarvestDate(item)}>{icons.garden} ✂️ {determineHarvestDate(item)}</div> 
                : null
            }
            {
                (collapsed)
                ? null
                : <div>
                    <div className='containerBox flexContainer'>
                        <div className='containerBox flex2Column columnRightAlign bold color-yellow'>
                            🌱 Planting Months:
                        </div>
                        <div className='containerBox flex2Column columnLeftAlign'>
                            {item.months.join(', ')}
                        </div>
                    </div>
                    <div className='containerBox flexContainer'>
                        <div className='containerBox flex2Column columnRightAlign bold color-yellow'>
                            ⏳ Harvest Time:
                        </div>
                        <div className='containerBox flex2Column columnLeftAlign'>
                            {item.harvest}
                        </div>
                    </div>
                    <div className='containerBox flexContainer'>
                        <div className='containerBox flex2Column columnRightAlign bold color-yellow'>
                            🌿 Companion Plants:
                        </div>
                        <div className='containerBox flex2Column columnLeftAlign'>
                            {item.companions.join(', ')}
                        </div>
                    </div>
                    <div className='containerBox flexContainer'>
                        <div className='containerBox flex2Column columnRightAlign bold color-yellow'>
                            🌎 Soil:
                        </div>
                        <div className='containerBox flex2Column columnLeftAlign'>
                            {item.soil}
                        </div>
                    </div>
                    <div className='containerBox flexContainer'>
                        <div className='containerBox flex2Column columnRightAlign bold color-yellow'>
                            💦 Watering:
                        </div>
                        <div className='containerBox flex2Column columnLeftAlign'>
                            {item.watering}
                        </div>
                    </div>
                    <div className='containerBox flexContainer'>
                        <div className='containerBox flex2Column columnRightAlign bold color-yellow'>
                            🌱 Fertilizer:
                        </div>
                        <div className='containerBox flex2Column columnLeftAlign'>
                            {item.fertilizer}
                        </div>
                    </div>
                    <div className='containerBox flexContainer'>
                        <div className='containerBox flex2Column columnRightAlign bold color-yellow'>
                            👩🏻‍🌾 Care:
                        </div>
                        <div className='containerBox flex2Column columnLeftAlign'>
                            {item.care}
                        </div>
                    </div>
                    <div className='containerBox flexContainer'>
                        <div className='containerBox flex2Column columnRightAlign bold color-yellow'>
                            🐛 Pest Control:
                        </div>
                        <div className='containerBox flex2Column columnLeftAlign'>
                            {item.pests}
                        </div>
                    </div>
                    <div className='containerBox flexContainer'>
                        <div className='containerBox flex2Column columnRightAlign bold color-yellow'>
                            🌞 Sun Exposure:
                        </div>
                        <div className='containerBox flex2Column columnLeftAlign'>
                            {item.sun_exposure}
                        </div>
                    </div>
                    <div className='containerBox flexContainer'>
                        <div className='containerBox flex2Column columnRightAlign bold color-yellow'>
                            🌱 Planted:
                        </div>
                        <div className='containerBox flex2Column columnLeftAlign'>
                            {getCheckBox(item)}
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}

export default GardenItem