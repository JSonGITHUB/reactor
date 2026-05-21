export const ingredientUnitAliases = {
    tsp: 'teaspoon',
    tsps: 'teaspoon',
    teaspoon: 'teaspoon',
    teaspoons: 'teaspoon',
    tbsp: 'tablespoon',
    tbsps: 'tablespoon',
    tablespoon: 'tablespoon',
    tablespoons: 'tablespoon',
    cup: 'cup',
    cups: 'cup',
    oz: 'ounce',
    ounce: 'ounce',
    ounces: 'ounce',
    lb: 'pound',
    lbs: 'pound',
    pound: 'pound',
    pounds: 'pound',
    g: 'gram',
    gram: 'gram',
    grams: 'gram',
    kg: 'kilogram',
    kilogram: 'kilogram',
    kilograms: 'kilogram',
    ml: 'milliliter',
    milliliter: 'milliliter',
    milliliters: 'milliliter',
    l: 'liter',
    liter: 'liter',
    liters: 'liter',
    clove: 'clove',
    cloves: 'clove',
    pinch: 'pinch',
    pinches: 'pinch',
    bunch: 'bunch',
    bunches: 'bunch',
    stalk: 'stalk',
    stalks: 'stalk',
    handful: 'handful',
    handfuls: 'handful',
    unit: 'unit',
    units: 'unit'
};

const ingredientUnitLabels = new Set(Object.values(ingredientUnitAliases));

const vulgarFractionMap = {
    '¼': '1/4',
    '½': '1/2',
    '¾': '3/4',
    '⅓': '1/3',
    '⅔': '2/3',
    '⅛': '1/8',
    '⅜': '3/8',
    '⅝': '5/8',
    '⅞': '7/8'
};

export const isQuantityToken = (value) => {
    const normalized = String(value || '').trim();
    return /^\d*\.?\d+$/.test(normalized) || /^\d+\/\d+$/.test(normalized);
};

const isSimpleNumberToken = (value) => /^\d*\.?\d+$/.test(String(value || '').trim());

const isFractionToken = (value) => /^\d+\/\d+$/.test(String(value || '').trim());
const isVulgarFractionToken = (value) => Object.prototype.hasOwnProperty.call(vulgarFractionMap, String(value || '').trim());

export const normalizeIngredientUnitToken = (value) => {
    const normalized = String(value || '')
        .toLowerCase()
        .replace(/^[.,]+|[.,]+$/g, '')
        .trim();
    return ingredientUnitAliases[normalized] || normalized;
};

export const isIngredientUnitToken = (value) => ingredientUnitLabels.has(normalizeIngredientUnitToken(value));

export const parseIngredientLine = (line) => {
    const parts = String(line || '').trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
        return null;
    }

    let quantity = '';
    let unit = '';
    let name = '';

    let nameStartIndex = 0;
    const compactRangeMatch = parts[0].match(/^(\d*\.?\d+)[-–—](\d*\.?\d+)$/);
    if (compactRangeMatch) {
        quantity = `${compactRangeMatch[1]}-${compactRangeMatch[2]}`;
        nameStartIndex = 1;
    } else if (parts.length >= 3 && isSimpleNumberToken(parts[0]) && /^(to|-|–|—)$/i.test(parts[1]) && isSimpleNumberToken(parts[2])) {
        quantity = /^to$/i.test(parts[1])
            ? `${parts[0]} to ${parts[2]}`
            : `${parts[0]}-${parts[2]}`;
        nameStartIndex = 3;
    } else if (parts.length >= 2 && /^\d+$/.test(parts[0]) && (isFractionToken(parts[1]) || isVulgarFractionToken(parts[1]))) {
        const normalizedFraction = isVulgarFractionToken(parts[1]) ? vulgarFractionMap[parts[1]] : parts[1];
        quantity = `${parts[0]} ${normalizedFraction}`;
        nameStartIndex = 2;
    } else {
        const compactMixedMatch = parts[0].match(/^(\d+)([¼½¾⅓⅔⅛⅜⅝⅞])$/);
        if (compactMixedMatch) {
            quantity = `${compactMixedMatch[1]} ${vulgarFractionMap[compactMixedMatch[2]]}`;
            nameStartIndex = 1;
        } else if (isVulgarFractionToken(parts[0])) {
            quantity = vulgarFractionMap[parts[0]];
            nameStartIndex = 1;
        } else if (isQuantityToken(parts[0])) {
            quantity = parts[0];
            nameStartIndex = 1;
        }
    }

    if (quantity !== '') {
        const remainingCount = parts.length - nameStartIndex;
        if (remainingCount <= 0) {
            name = '';
        } else if (remainingCount === 1) {
            name = parts[nameStartIndex];
        } else if (isIngredientUnitToken(parts[nameStartIndex])) {
            unit = normalizeIngredientUnitToken(parts[nameStartIndex]);
            name = parts.slice(nameStartIndex + 1).join(' ');
        } else {
            name = parts.slice(nameStartIndex).join(' ');
        }
    } else {
        name = parts.join(' ');
    }

    const normalizedName = String(name || '').trim();
    if (!normalizedName || /^undefined$/i.test(normalizedName) || /^ingredient-/i.test(normalizedName) || /^(true|false)$/i.test(normalizedName)) {
        return null;
    }

    if (String(quantity || '').toLowerCase() === 'undefined' || String(unit || '').toLowerCase() === 'undefined') {
        return null;
    }

    return {
        quantity,
        unit,
        name: normalizedName
    };
};
