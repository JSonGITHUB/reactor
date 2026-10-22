const fuelDefaultCategories = Object.freeze({
    'Start': '🟢',
    'End': '🔴',
    'Shopping': '🛒',
    'Beach': '🏖️',
    'Hike': '🥾',
    'Bike': '🚴‍♂️',
    'Surf': '🏄‍♂️',
    'Snorkel': '🤿',
    'Fishing': '🎣',
    'Entertainment': '🎭',
    'Work': '💼',
    'Medical': '🏥',
    'Water': '💧',
    'Dining': '🍽️',
    'Bar': '🍸',
    'Billiards': '🎱',
    'Gas': '⛽',
    'Maintenance': '🛠️',
    'Service': '🔧',
    'Camp': '⛺️',
    'Parking': '🅿️',
    'Toll': '🚧',
});

export const fuelCategoryOptions = Object.entries(fuelDefaultCategories);
export const fuelCategoryKeys = fuelCategoryOptions.map(([name]) => name);

export default fuelDefaultCategories;