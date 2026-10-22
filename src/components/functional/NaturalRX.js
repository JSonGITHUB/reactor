import React, { useMemo, useState } from 'react';
import CollapseToggleButton from '../utils/CollapseToggleButton';

const DATASET_STORAGE_KEY = 'naturalRxDataset';

const SEARCH_TYPES = [
    { value: 'all', label: 'All' },
    { value: 'foodName', label: 'Food' },
    { value: 'symptom', label: 'Symptom' },
    { value: 'benefit', label: 'Benefit' },
    { value: 'deficiency', label: 'Deficiency' },
    { value: 'organ', label: 'Organ' },
    { value: 'healthFunction', label: 'Function' }
];

// Dynamically collect all categories from DATASET
const getAllCategories = (dataset) => {
    const cats = dataset.map(item => item.category).filter(Boolean);
    return Array.from(new Set(cats)).sort();
};

const SYNONYMS = {
    lethargic: ['fatigue', 'low energy', 'tired'],
    fatigue: ['low energy', 'lethargic', 'tired'],
    tired: ['fatigue', 'low energy', 'lethargic'],
    constipation: ['irregular bowel', 'bowel movement'],
    ibs: ['digestive discomfort', 'bloating', 'gut symptoms'],
    hydration: ['dehydration', 'electrolytes'],
    dehydration: ['hydration', 'electrolytes', 'muscle cramps'],
    memory: ['brain fog', 'cognitive support'],
    immune: ['immunity', 'immune system'],
    'blood sugar': ['glucose', 'glycemic'],
    cholesterol: ['lipids', 'ldl'],
    anemia: ['iron deficiency', 'low iron'],
    inflammation: ['inflammatory response', 'joint discomfort']
};

const rxSymptomIcons = {
    fatigue: '⚡️',
    lethargic: '😴',
    constipation: '🚽',
    ibs: '🫃',
    hydration: '💧',
    dehydration: '🥵',
    memory: '🧠',
    'brain fog': '🌫️',
    immune: '🛡️',
    immunity: '🛡️',
    'blood sugar': '🩸',
    cholesterol: '🫀',
    anemia: '🩸',
    inflammation: '🔥',
    'muscle cramps': '🦵',
    'sore throat': '🗣️',
    skin: '✨',
    digestion: '🥣',
    gut: '🦠',
    heart: '❤️',
    liver: '🧽'
};
const rxCategoryIcons = {
    fruit: '🍎',
    vegetable: '🥦',
    nut: '🥜',
    seed: '🌱',
    grain: '🌾',
    protein: '🍳',
    fermented: '🧪',
    spice: '🧂',
    herb: '🌿',
    beverage: '🥤',
    'natural sweetener': '🍯',
    legume: '🫘'
};

const rxDeficiencyIcons = {
    iron: '🩸',
    magnesium: '🧲',
    'vitamin c': '🍊',
    'vitamin d': '☀️',
    'vitamin e': '✨',
    folate: '🌿',
    fiber: '🌾',
    potassium: '🍌',
    zinc: '🛡️',
    omega: '🐟',
    protein: '💪',
    calcium: '🦴',
    b12: '⚡️',
    choline: '🧠'
};

const rxOrganIcons = {
    brain: '🧠',
    heart: '❤️',
    liver: '🧽',
    gut: '🦠',
    blood: '🩸',
    lungs: '🫁',
    skin: '✨',
    bones: '🦴',
    muscles: '💪',
    pancreas: '🧬',
    immune: '🛡️',
    vessels: '🫀',
    joints: '🦵'
};

const rxFunctionIcons = {
    recovery: '🔁',
    hydration: '💧',
    digestion: '🥣',
    immune: '🛡️',
    cognitive: '🧠',
    energy: '⚡️',
    metabolic: '🔥',
    circulation: '🫀',
    antioxidant: '🫐', 
    microbiome: '🦠',
    cardiovascular: '❤️',            
    detox: '🧽',                                                                                                                                                                                                                                                                                                     
                                                                                                                                                                                                                               };

const normalizeTag = (value) => String(value || '').trim().toLowerCase();

const canUseLocalStorage = () => {
    try {
        if (typeof window === 'undefined' || !window.localStorage) return false;
        const testKey = '__naturalrx__';
        window.localStorage.setItem(testKey, 'ok');
        window.localStorage.removeItem(testKey);
        return true;
    } catch (error) {
        return false;
    }
};

const parseCsv = (value) =>
    String(value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

const toCsv = (value) => (Array.isArray(value) ? value.join(', ') : '');

const getSuggestedPreparation = (name) => {
    const normalized = String(name || '').toLowerCase();
    if (normalized.includes('turmeric')) {
        return 'Turmeric-Ginger Water: 1 cup water, 1/2 tsp turmeric powder, 3-4 ginger slices, pinch black pepper. Steep 5 mins.';
    }
    if (normalized.includes('ginger')) {
        return 'Ginger Tea: 1 cup hot water with 4-5 ginger slices. Steep 5-8 mins and sip warm.';
    }
    if (normalized.includes('oats')) {
        return 'Cook 1/2 cup oats in water or milk for 5-7 mins. Add fruit or nuts before serving.';
    }
    if (normalized.includes('yogurt') || normalized.includes('kefir')) {
        return 'Serve 3/4-1 cup plain. Add berries/seeds and avoid high added sugar versions.';
    }
    if (normalized.includes('spinach') || normalized.includes('broccoli')) {
        return 'Steam or sauté lightly for 3-5 mins to retain texture and nutrients.';
    }
    if (normalized.includes('garlic') || normalized.includes('onion')) {
        return 'Chop and rest 5-10 mins, then add to cooked dishes near the end of cooking.';
    }
    if (normalized.includes('banana') || normalized.includes('apple') || normalized.includes('kiwi') || normalized.includes('berries') || normalized.includes('grapes')) {
        return 'Eat fresh as a snack, or combine with protein/fat sources for steadier energy.';
    }
    return 'Suggested prep: pair with balanced meals.';
};


// Merge two food objects by name, combining arrays and preferring new evidenceNote/preparation if present
const mergeFoodObjects = (base, update) => {
    const mergeArray = (a, b) => Array.from(new Set([...(a || []), ...(b || [])]));
    return {
        ...base,
        ...update,
        supports: mergeArray(base.supports, update.supports),
        deficiencySupport: mergeArray(base.deficiencySupport, update.deficiencySupport),
        nutrients: mergeArray(base.nutrients, update.nutrients),
        organs: mergeArray(base.organs, update.organs),
        healthFunctions: mergeArray(base.healthFunctions, update.healthFunctions),
        aliases: mergeArray(base.aliases, update.aliases),
        cautions: mergeArray(base.cautions, update.cautions),
        evidenceNote: (update.evidenceNote && update.evidenceNote.trim()) || base.evidenceNote,
        preparation: (update.preparation && update.preparation.trim()) || base.preparation
    };
};

// Merge persistent (localStorage) and new DATASET entries by name
const mergeDatasets = (persistent, fresh) => {
    const byName = (arr) => Object.fromEntries((arr || []).map(item => [item.name.toLowerCase(), item]));
    const persistentMap = byName(persistent);
    const freshMap = byName(fresh);
    const allNames = Array.from(new Set([...Object.keys(persistentMap), ...Object.keys(freshMap)]));
    return allNames.map(name => {
        if (persistentMap[name] && freshMap[name]) {
            return mergeFoodObjects(freshMap[name], persistentMap[name]);
        }
        return persistentMap[name] || freshMap[name];
    });
};

const withPreparation = (items) =>
    (Array.isArray(items) ? items : []).map((item) => ({
        ...item,
        preparation: (item.preparation || '').trim() || getSuggestedPreparation(item.name)
    }));

const emptyFoodForm = {
    name: '',
    category: 'fruit',
    supports: '',
    deficiencySupport: '',
    nutrients: '',
    organs: '',
    healthFunctions: '',
    aliases: '',
    evidenceNote: '',
    preparation: '',
    cautions: ''
};

const getTagIcon = (value, iconMap, fallback = '•') => {
    const normalized = normalizeTag(value);
    if (iconMap[normalized]) {
        return iconMap[normalized];
    }

    const partialKey = Object.keys(iconMap).find((key) => normalized.includes(key) || key.includes(normalized));
    if (partialKey) {
        return iconMap[partialKey];
    }

    return fallback;
};

const DATASET = [
                        {
                            name: 'Asparagus',
                            category: 'vegetable',
                            supports: ['digestive health', 'detox support', 'heart health', 'immune support'],
                            deficiencySupport: ['fiber', 'folate', 'vitamin K', 'vitamin C'],
                            nutrients: ['fiber', 'folate', 'vitamin K', 'vitamin C', 'antioxidants'],
                            organs: ['gut', 'liver', 'heart'],
                            healthFunctions: ['digestive support', 'detox support', 'cardiovascular support', 'immune support'],
                            aliases: [],
                            evidenceNote: 'Asparagus is rich in fiber, folate, vitamin K, and antioxidants. Supports digestion, detoxification, heart, and immune health.',
                            cautions: ['May cause urine odor in some individuals.']
                        },
                    {
                        name: 'Fig',
                        category: 'fruit',
                        supports: ['digestive health', 'blood sugar support', 'bone health', 'energy support'],
                        deficiencySupport: ['fiber', 'calcium', 'potassium', 'magnesium'],
                        nutrients: ['fiber', 'calcium', 'potassium', 'magnesium', 'antioxidants'],
                        organs: ['gut', 'bones', 'heart'],
                        healthFunctions: ['digestive support', 'metabolic health', 'bone support'],
                        aliases: ['figs'],
                        evidenceNote: 'Figs are rich in fiber, calcium, potassium, and magnesium. They support digestion, blood sugar, bone, and heart health.',
                        cautions: ['May cause digestive upset if eaten in excess.']
                    },
                {
                    name: 'Black Beans',
                    category: 'legume',
                    supports: ['blood sugar support', 'heart health', 'digestive health', 'energy support'],
                    deficiencySupport: ['fiber', 'protein', 'iron', 'magnesium', 'folate'],
                    nutrients: ['fiber', 'protein', 'iron', 'magnesium', 'folate', 'antioxidants'],
                    organs: ['heart', 'gut', 'blood'],
                    healthFunctions: ['metabolic health', 'digestive support', 'cardiovascular support'],
                    aliases: [],
                    evidenceNote: 'Black beans are rich in fiber, protein, iron, magnesium, and folate. They support blood sugar, heart, and digestive health.',
                    cautions: ['May cause bloating in sensitive individuals.']
                },
            {
                name: 'Green Tea',
                category: 'beverage',
                supports: ['antioxidant support', 'energy boost', 'metabolic health', 'brain support', 'cholesterol support'],
                deficiencySupport: ['antioxidants', 'polyphenols'],
                nutrients: ['catechins', 'EGCG', 'polyphenols', 'antioxidants'],
                organs: ['brain', 'heart', 'liver'],
                healthFunctions: ['antioxidant support', 'cognitive support', 'metabolic health'],
                aliases: [],
                evidenceNote: 'Green tea is rich in catechins (EGCG) and polyphenols, supporting antioxidant defenses, metabolism, and brain health.',
                cautions: ['Contains caffeine; may affect sleep or sensitive individuals.']
            },
        // SUPERFOODS
        {
            name: 'Chlorella',
            category: 'superfood',
            supports: ['removes heavy metals', 'detoxes radiation', 'boosts immunity'],
            deficiencySupport: ['vitamins', 'minerals'],
            nutrients: ['chlorophyll', 'vitamins', 'minerals'],
            organs: ['liver', 'immune system'],
            healthFunctions: ['detox support', 'immune support'],
            aliases: [],
            evidenceNote: 'Chlorella is rich in vitamins and minerals, helps remove heavy metals, detoxifies radiation, and boosts immunity.',
            cautions: []
        },
        {
            name: 'Chia Seeds',
            category: 'seed',
            supports: ['lowers blood pressure'],
            deficiencySupport: ['fiber', 'omega-3', 'antioxidants', 'vitamins', 'minerals'],
            nutrients: ['fiber', 'omega-3', 'antioxidants', 'vitamins', 'minerals'],
            organs: ['heart', 'gut'],
            healthFunctions: ['metabolic health', 'digestive support', 'cardiovascular support'],
            aliases: [],
            evidenceNote: 'Chia seeds are high in fiber, omega-3, antioxidants, vitamins, and minerals. They help lower blood pressure.',
            cautions: []
        },
        // Cacao already exists, merge new data
        {
            name: 'Cacao',
            category: 'seed',
            supports: ['mood booster', 'iron rich'],
            deficiencySupport: ['magnesium', 'fiber', 'iron', 'antioxidants'],
            nutrients: ['flavanols', 'magnesium', 'fiber', 'iron', 'antioxidants'],
            organs: ['brain', 'gut', 'immune system'],
            healthFunctions: ['mood support', 'antioxidant support'],
            aliases: ['cocoa'],
            evidenceNote: 'Cacao is rich in magnesium, fiber, iron, and antioxidants. It supports mood and is iron rich.',
            cautions: ['Can contain caffeine-like compounds in sensitive people.']
        },
        {
            name: 'Goji Berries',
            category: 'fruit',
            supports: ['energy boost', 'fights depression', 'regulates blood sugar'],
            deficiencySupport: ['antioxidants', 'vitamins'],
            nutrients: ['antioxidants', 'vitamins'],
            organs: ['brain', 'blood'],
            healthFunctions: ['energy support', 'mood support', 'metabolic health'],
            aliases: [],
            evidenceNote: 'Goji berries are high in antioxidants and vitamins, boost energy, fight depression, and help regulate blood sugar.',
            cautions: []
        },
        {
            name: 'Red Cabbage',
            category: 'vegetable',
            supports: ['gut support'],
            deficiencySupport: ['inulin', 'prebiotic fiber'],
            nutrients: ['inulin', 'prebiotic fiber'],
            organs: ['gut'],
            healthFunctions: ['digestive support'],
            aliases: [],
            evidenceNote: 'Red cabbage contains inulin and prebiotic fiber for gut support.',
            cautions: []
        },
        {
            name: 'Spirulina',
            category: 'superfood',
            supports: ['lowers blood pressure', 'boost immunity', 'anti viral'],
            deficiencySupport: ['vitamins', 'minerals'],
            nutrients: ['vitamins', 'minerals'],
            organs: ['immune system', 'heart'],
            healthFunctions: ['immune support', 'cardiovascular support'],
            aliases: [],
            evidenceNote: 'Spirulina is rich in vitamins and minerals, lowers blood pressure, boosts immunity, and is anti-viral.',
            cautions: []
        },
        {
            name: 'Flaxseed',
            category: 'seed',
            supports: ['digestive health', 'lowers cholesterol'],
            deficiencySupport: ['omega-3', 'fiber', 'antioxidants'],
            nutrients: ['omega-3', 'fiber', 'antioxidants'],
            organs: ['gut', 'heart'],
            healthFunctions: ['digestive support', 'cardiovascular support'],
            aliases: [],
            evidenceNote: 'Flaxseed is high in omega-3, fiber, and antioxidants. Supports digestion and lowers cholesterol.',
            cautions: []
        },
        // Cinnamon already exists, merge new data
        {
            name: 'Cinnamon',
            category: 'spice',
            supports: ['improves insulin sensitivity', 'reduces sugar spikes', 'anti inflammatory', 'antioxidant rich'],
            deficiencySupport: [],
            nutrients: ['polyphenols', 'antioxidants'],
            organs: ['pancreas', 'metabolic system'],
            healthFunctions: ['glucose support', 'anti-inflammatory', 'antioxidant support'],
            aliases: [],
            evidenceNote: 'Cinnamon improves insulin sensitivity, reduces sugar spikes, is anti-inflammatory and antioxidant rich.',
            cautions: ['High doses may not be appropriate with diabetes meds or liver concerns.']
        },
        {
            name: 'Ashwagandha',
            category: 'herb',
            supports: ['reduces stress', 'supports adrenal health', 'hormone balance', 'better sleep'],
            deficiencySupport: [],
            nutrients: [],
            organs: ['adrenal', 'brain'],
            healthFunctions: ['stress resilience', 'hormone support', 'sleep support'],
            aliases: [],
            evidenceNote: 'Ashwagandha reduces stress, supports adrenal health, hormone balance, and better sleep.',
            cautions: []
        },
        {
            name: 'Fennel Seeds',
            category: 'seed',
            supports: ['reduces bloating', 'eases digestion', 'freshens breath', 'gut soothing'],
            deficiencySupport: [],
            nutrients: [],
            organs: ['gut'],
            healthFunctions: ['digestive support'],
            aliases: [],
            evidenceNote: 'Fennel seeds reduce bloating, ease digestion, freshen breath, and soothe the gut.',
            cautions: []
        },
        {
            name: 'Camu Camu',
            category: 'fruit',
            supports: ['immune system booster', 'support skin collagen', 'antioxidant powerhouse'],
            deficiencySupport: ['vitamin c'],
            nutrients: ['vitamin c'],
            organs: ['immune system', 'skin'],
            healthFunctions: ['immune support', 'antioxidant support'],
            aliases: [],
            evidenceNote: 'Camu Camu is extremely high in vitamin C (3000%), boosts immunity, supports skin collagen, and is an antioxidant powerhouse.',
            cautions: []
        },
        {
            name: 'Black Seed',
            category: 'seed',
            supports: ['powerful anti-inflammatory', 'supports immune system', 'helps balance blood sugar', 'supports respiratory health'],
            deficiencySupport: [],
            nutrients: [],
            organs: ['immune system', 'respiratory system'],
            healthFunctions: ['immune support', 'anti-inflammatory', 'respiratory support'],
            aliases: ['nigella sativa'],
            evidenceNote: 'Black seed (nigella sativa) is a powerful anti-inflammatory, supports immunity, blood sugar, and respiratory health.',
            cautions: []
        },
        // Pumpkin Seeds already exist, merge new data
        {
            name: 'Pumpkin Seeds',
            category: 'seed',
            supports: ['supports digestion', 'reduces bloating and gas', 'improves nutrient absorption', 'regulates blood sugar', 'antioxidants'],
            deficiencySupport: ['magnesium', 'zinc'],
            nutrients: ['magnesium', 'zinc', 'antioxidants'],
            organs: ['muscles', 'immune system', 'gut'],
            healthFunctions: ['electrolyte support', 'immune support', 'digestive support', 'metabolic health'],
            aliases: ['pepitas'],
            evidenceNote: 'Pumpkin seeds support digestion, reduce bloating and gas, improve nutrient absorption, regulate blood sugar, and are rich in antioxidants.',
            cautions: []
        },
        {
            name: 'Raw Brussel Sprouts',
            category: 'vegetable',
            supports: ['detox activation'],
            deficiencySupport: ['sulforaphane'],
            nutrients: ['sulforaphane'],
            organs: ['liver'],
            healthFunctions: ['detox support'],
            aliases: ['brussel sprouts'],
            evidenceNote: 'Raw brussel sprouts are a source of sulforaphane for detox activation.',
            cautions: []
        },
        {
            name: 'Nettle Seed',
            category: 'seed',
            supports: ['improves mood', 'nerves support', 'brain support'],
            deficiencySupport: ['magnesium', 'zinc'],
            nutrients: ['magnesium', 'zinc'],
            organs: ['nerves', 'brain'],
            healthFunctions: ['mood support', 'nervous system support', 'cognitive support'],
            aliases: [],
            evidenceNote: 'Nettle seed provides magnesium and zinc, supports mood, nerves, and brain.',
            cautions: []
        },
        {
            name: 'Moringa',
            category: 'superfood',
            supports: ['support blood sugar', 'anti-inflammatory'],
            deficiencySupport: ['plant protein', 'iron', 'calcium'],
            nutrients: ['plant protein', 'iron', 'calcium'],
            organs: ['blood'],
            healthFunctions: ['metabolic health', 'anti-inflammatory'],
            aliases: [],
            evidenceNote: 'Moringa is a source of plant protein, iron, and calcium. Supports blood sugar and is anti-inflammatory.',
            cautions: []
        },
        // Turmeric already exists, merge new data
        {
            name: 'Turmeric',
            category: 'spice',
            supports: ['anti-inflammatory', 'liver support', 'joint support', 'anti-oxidants', 'digestion support', 'immune support'],
            deficiencySupport: [],
            nutrients: ['curcumin', 'antioxidants'],
            organs: ['joints', 'liver', 'immune system'],
            healthFunctions: ['recovery', 'anti-inflammatory', 'immune support', 'digestion support'],
            aliases: ['curcuma'],
            evidenceNote: 'Turmeric is anti-inflammatory, supports liver and joint health, is rich in antioxidants, and aids digestion and immunity.',
            cautions: ['May interact with blood-thinner medications.']
        },
        {
            name: 'Hemp Seeds',
            category: 'seed',
            supports: ['brain support', 'heart support', 'hormone support', 'easy to digest'],
            deficiencySupport: ['protein', 'omega-3', 'omega-9'],
            nutrients: ['protein', 'omega-3', 'omega-9'],
            organs: ['brain', 'heart'],
            healthFunctions: ['cognitive support', 'cardiovascular support', 'hormone support'],
            aliases: [],
            evidenceNote: 'Hemp seeds provide protein, omega-3, and omega-9. Support brain, heart, and hormone health, and are easy to digest.',
            cautions: []
        },
        {
            name: 'Bee Pollen',
            category: 'superfood',
            supports: ['stamina boost', 'energy boost', 'immune support', 'allergy support'],
            deficiencySupport: ['multi vitamin', 'enzymes'],
            nutrients: ['multi vitamin', 'enzymes'],
            organs: ['immune system'],
            healthFunctions: ['energy support', 'immune support'],
            aliases: [],
            evidenceNote: 'Bee pollen is a multi-vitamin, boosts stamina, energy, immunity, and provides enzymes and allergy support.',
            cautions: []
        },
        {
            name: 'Maca Root',
            category: 'root',
            supports: ['hormone support', 'adrenal support', 'libido support', 'energy boost', 'stress resilience'],
            deficiencySupport: [],
            nutrients: [],
            organs: ['adrenal', 'brain'],
            healthFunctions: ['hormone support', 'energy support', 'stress resilience'],
            aliases: ['maca'],
            evidenceNote: 'Maca root supports hormones, adrenals, libido, energy, and stress resilience.',
            cautions: []
        },
        {
            name: 'Black Sesame Seeds',
            category: 'seed',
            supports: ['hair support', 'skin support', 'liver support', 'kidney support', 'digestive support'],
            deficiencySupport: ['minerals', 'calcium', 'iron'],
            nutrients: ['minerals', 'calcium', 'iron'],
            organs: ['hair', 'skin', 'liver', 'kidneys', 'gut'],
            healthFunctions: ['digestive support', 'skin support', 'liver support'],
            aliases: [],
            evidenceNote: 'Black sesame seeds are rich in minerals, calcium, and iron. Support hair, skin, liver, kidney, and digestion.',
            cautions: []
        },
        {
            name: 'Rosemary',
            category: 'herb',
            supports: ['brain support', 'memory', 'circulation support', 'vein support', 'anti-inflammatory', 'long-life'],
            deficiencySupport: [],
            nutrients: [],
            organs: ['brain', 'veins'],
            healthFunctions: ['cognitive support', 'circulation', 'anti-inflammatory'],
            aliases: [],
            evidenceNote: 'Rosemary supports brain, memory, circulation, veins, is anti-inflammatory, and associated with longevity.',
            cautions: []
        },
    {
        name: 'Turmeric',
        category: 'spice',
        supports: ['inflammation', 'joint comfort'],
        deficiencySupport: [],
        nutrients: ['curcumin'],
        organs: ['joints'],
        healthFunctions: ['recovery'],
        aliases: ['curcuma'],
        evidenceNote: 'Curcumin content may support healthy inflammatory response.',
        cautions: ['May interact with blood-thinner medications.']
    },
    {
        name: 'Almonds',
        category: 'nut',
        supports: ['brain fog', 'bone support'],
        deficiencySupport: ['magnesium', 'vitamin e'],
        nutrients: ['vitamin e', 'magnesium', 'healthy fats'],
        organs: ['brain', 'bones'],
        healthFunctions: ['focus', 'metabolic health'],
        aliases: [],
        evidenceNote: 'Nutrient-dense snack supporting energy and micronutrient intake.',
        cautions: ['Tree-nut allergy risk.']
    },
    {
        name: 'Chia Seeds',
        category: 'seed',
        supports: ['brain fog', 'digestion', 'cholesterol'],
        deficiencySupport: ['vitamin c'],
        nutrients: Array.from(new Set(['omega-3 ala', 'fiber', 'protein', 'calcium'])),
        organs: ['brain', 'bones', 'gut'],
        healthFunctions: ['digestion', 'recovery'],
        aliases: [],
        evidenceNote: 'Contains bromelain and vitamin C for digestion and recovery support. Pineapple is rich in vitamin C and bromelain, which may aid digestion and recovery.',
        cautions: []
    },
    {
        name: 'Pineapple',
        category: 'fruit',
        supports: ['brain fog', 'bone support', 'digestion'],
        deficiencySupport: ['vitamin c'],
        nutrients: Array.from(new Set(['vitamin c', 'manganese', 'bromelain'])),
        organs: ['brain', 'bones', 'gut'],
        healthFunctions: ['digestion', 'recovery'],
        aliases: [],
        evidenceNote: 'Contains bromelain and vitamin C for digestion and recovery support. Pineapple is rich in vitamin C and bromelain, which may aid digestion and recovery.',
        cautions: []
    },
    {
        name: 'Eggs',
        category: 'protein',
        supports: ['low energy', 'lethargic', 'fatigue'],
        deficiencySupport: ['b12', 'choline'],
        nutrients: Array.from(new Set(['protein', 'b12', 'choline', 'vitamin D', 'selenium'])),
        organs: ['brain', 'muscles'],
        healthFunctions: ['energy', 'metabolic health'],
        aliases: [],
        evidenceNote: 'High-quality protein and choline may support steady energy and focus. Eggs are a source of vitamin D and selenium, supporting immune and metabolic health.',
        cautions: ['Egg allergy possible.']
    },
    {
        name: 'Oats',
        category: 'grain',
        supports: ['cholesterol', 'blood sugar support', 'constipation'],
        deficiencySupport: ['fiber'],
        nutrients: Array.from(new Set(['beta-glucan fiber', 'iron', 'magnesium'])),
        organs: ['heart', 'gut'],
        healthFunctions: ['metabolic health', 'digestive support'],
        aliases: ['oatmeal'],
        evidenceNote: 'Soluble fiber may support healthy cholesterol and glucose response. Oats provide iron and magnesium for metabolic and cardiovascular support.',
        cautions: []
    },
    {
        name: 'Yogurt',
        category: 'fermented',
        supports: ['digestion issues', 'gut support'],
        deficiencySupport: ['protein', 'calcium'],
        nutrients: ['probiotics', 'protein', 'calcium'],
        organs: ['gut', 'bones'],
        healthFunctions: ['microbiome support'],
        aliases: [],
        evidenceNote: 'Live cultures may support digestive and microbiome balance.',
        cautions: ['Dairy sensitivity possible.']
    },
    {
        name: 'Cucumber',
        category: 'vegetable',
        supports: ['dry skin', 'hydration'],
        deficiencySupport: [],
        nutrients: ['water content', 'vitamin k'],
        organs: ['skin'],
        healthFunctions: ['hydration'],
        aliases: [],
        evidenceNote: 'High water content supports hydration and skin moisture.',
        cautions: []
    },
    {
        name: 'Mushrooms',
        category: 'vegetable',
        supports: ['dry skin', 'immune support'],
        deficiencySupport: ['vitamin d'],
        nutrients: ['beta-glucans', 'vitamin d'],
        organs: ['skin', 'immune system'],
        healthFunctions: ['immune support'],
        aliases: [],
        evidenceNote: 'Can provide immune-supportive compounds and vitamin D (varies by type).',
        cautions: []
    },
    {
        name: 'Beets',
        category: 'vegetable',
        supports: ['blood pressure', 'liver support', 'blood flow'],
        deficiencySupport: ['folate'],
        nutrients: ['nitrates', 'folate'],
        organs: ['heart', 'liver', 'blood vessels'],
        healthFunctions: ['circulation'],
        aliases: ['beetroot'],
        evidenceNote: 'Dietary nitrates may support blood pressure and circulation.',
        cautions: []
    },
    {
        name: 'Pomegranate',
        category: 'fruit',
        supports: ['blood pressure', 'blood vessel support', 'liver support'],
        deficiencySupport: ['vitamin c'],
        nutrients: ['polyphenols', 'vitamin c'],
        organs: ['heart', 'liver', 'blood vessels'],
        healthFunctions: ['circulation', 'antioxidant support'],
        aliases: [],
        evidenceNote: 'Polyphenols may support vascular function and antioxidant status.',
        cautions: ['May interact with some medications in sensitive individuals.']
    },
    {
        name: 'Grapes',
        category: 'fruit',
        supports: ['lung support', 'immune support'],
        deficiencySupport: [],
        nutrients: ['polyphenols'],
        organs: ['lungs', 'immune system'],
        healthFunctions: ['antioxidant support'],
        aliases: [],
        evidenceNote: 'Polyphenols may support antioxidant defenses.',
        cautions: []
    },
    {
        name: 'Onion',
        category: 'vegetable',
        supports: ['lung support', 'immune support', 'prebiotic support'],
        deficiencySupport: [],
        nutrients: ['quercetin', 'prebiotic fibers'],
        organs: ['lungs', 'gut', 'immune system'],
        healthFunctions: ['microbiome support', 'immune support'],
        aliases: [],
        evidenceNote: 'Contains quercetin and prebiotic compounds that support immune and gut health.',
        cautions: ['Can trigger symptoms in some IBS/FODMAP-sensitive people.']
    },
    {
        name: 'Garlic',
        category: 'vegetable',
        supports: ['lung support', 'immune support', 'heart health'],
        deficiencySupport: [],
        nutrients: ['allicin'],
        organs: ['lungs', 'immune system', 'heart'],
        healthFunctions: ['immune support', 'cardiovascular support'],
        aliases: [],
        evidenceNote: 'Contains sulfur compounds linked to immune and cardiovascular support.',
        cautions: ['May interact with blood thinners and can irritate sensitive digestion.']
    },
    {
        name: 'Strawberries',
        category: 'fruit',
        supports: ['immunity', 'skin support'],
        deficiencySupport: ['vitamin c'],
        nutrients: ['vitamin c', 'polyphenols'],
        organs: ['immune system', 'skin'],
        healthFunctions: ['immune support'],
        aliases: [],
        evidenceNote: 'Rich in vitamin C and antioxidants for immune and skin support.',
        cautions: []
    },
    {
        name: 'Walnuts',
        category: 'nut',
        supports: ['heart health', 'brain support'],
        deficiencySupport: ['omega-3'],
        nutrients: Array.from(new Set(['omega-3 ala', 'polyphenols', 'vitamin E', 'magnesium'])),
        organs: ['heart', 'brain'],
        healthFunctions: ['cardiovascular support', 'cognitive support'],
        aliases: [],
        evidenceNote: 'Plant omega-3 fats may support heart and brain health. Walnuts are also a source of vitamin E and magnesium for brain and heart support.',
        cautions: ['Tree-nut allergy risk.']
    },
    {
        name: 'Cinnamon',
        category: 'spice',
        supports: ['blood sugar support'],
        deficiencySupport: [],
        nutrients: ['polyphenols'],
        organs: ['pancreas', 'metabolic system'],
        healthFunctions: ['glucose support'],
        aliases: [],
        evidenceNote: 'May support glucose metabolism as part of diet/lifestyle.',
        cautions: ['High doses may not be appropriate with diabetes meds or liver concerns.']
    },
    {
        name: 'Lemon',
        category: 'fruit',
        supports: ['detox support', 'hydration'],
        deficiencySupport: ['vitamin c'],
        nutrients: ['vitamin c'],
        organs: ['liver'],
        healthFunctions: ['hydration', 'antioxidant support'],
        aliases: ['lemons'],
        evidenceNote: 'Supports hydration and provides vitamin C.',
        cautions: []
    },
    {
        name: 'Honey',
        category: 'natural sweetener',
        supports: ['sore throat', 'antimicrobial support', 'wound healing support'],
        deficiencySupport: [],
        nutrients: ['polyphenols'],
        organs: ['throat', 'skin'],
        healthFunctions: ['soothing support'],
        aliases: [],
        evidenceNote: 'Can soothe sore throat and may support topical wound care in appropriate use.',
        cautions: ['Do not give to infants under 1 year old.']
    },
    {
        name: 'Apples',
        category: 'fruit',
        supports: ['constipation', 'gut health'],
        deficiencySupport: ['fiber'],
        nutrients: ['pectin fiber'],
        organs: ['gut'],
        healthFunctions: ['digestive support'],
        aliases: ['apple'],
        evidenceNote: 'Pectin fiber may support bowel regularity.',
        cautions: []
    },
    {
        name: 'Blueberries',
        category: 'fruit',
        supports: ['mood support', 'memory support', 'metabolic health'],
        deficiencySupport: [],
        nutrients: ['anthocyanins', 'fiber'],
        organs: ['brain', 'metabolic system'],
        healthFunctions: ['cognitive support', 'antioxidant support'],
        aliases: [],
        evidenceNote: 'Anthocyanins may support cognition and metabolic resilience.',
        cautions: []
    },
    {
        name: 'Cacao',
        category: 'seed',
        supports: ['mood support', 'immune support', 'gut support'],
        deficiencySupport: ['magnesium'],
        nutrients: ['flavanols', 'magnesium'],
        organs: ['brain', 'gut', 'immune system'],
        healthFunctions: ['mood support', 'antioxidant support'],
        aliases: ['cocoa'],
        evidenceNote: 'Flavanols and magnesium may support mood and vascular function.',
        cautions: ['Can contain caffeine-like compounds in sensitive people.']
    },
    {
        name: 'Peppermint',
        category: 'herb',
        supports: ['sore throat', 'ibs symptoms', 'bloating'],
        deficiencySupport: [],
        nutrients: ['menthol'],
        organs: ['gut', 'throat'],
        healthFunctions: ['digestive comfort'],
        aliases: ['peppermint tea'],
        evidenceNote: 'May support digestive comfort for some IBS-related symptoms.',
        cautions: ['Can worsen reflux/heartburn in some people.']
    },
    {
        name: 'Ginger',
        category: 'spice',
        supports: ['muscle pain', 'ibs symptoms', 'constipation', 'nausea'],
        deficiencySupport: [],
        nutrients: ['gingerols'],
        organs: ['gut', 'muscles'],
        healthFunctions: ['digestive support', 'recovery'],
        aliases: [],
        evidenceNote: 'May support nausea, digestion, and post-exercise comfort.',
        cautions: ['May interact with blood-thinner medications.']
    },
    {
        name: 'Kefir',
        category: 'fermented',
        supports: ['anemia support', 'gut microbiome support'],
        deficiencySupport: ['b vitamins'],
        nutrients: ['probiotics', 'protein'],
        organs: ['gut', 'blood'],
        healthFunctions: ['microbiome support'],
        aliases: [],
        evidenceNote: 'Fermented dairy with diverse probiotics for gut support.',
        cautions: ['Dairy sensitivity possible.']
    },
    {
        name: 'Bone Broth',
        category: 'protein',
        supports: ['gut health', 'skin health'],
        deficiencySupport: ['protein'],
        nutrients: ['gelatin', 'amino acids'],
        organs: ['gut', 'skin'],
        healthFunctions: ['recovery'],
        aliases: [],
        evidenceNote: 'Protein-rich broth may support hydration and recovery.',
        cautions: []
    },
    {
        name: 'Banana',
        category: 'fruit',
        supports: ['dehydration', 'muscle cramps', 'fatigue'],
        deficiencySupport: ['potassium'],
        nutrients: ['potassium', 'carbohydrates'],
        organs: ['muscles', 'nervous system'],
        healthFunctions: ['electrolyte support', 'energy support'],
        aliases: [],
        evidenceNote: 'Potassium and carbs can support hydration and activity recovery.',
        cautions: []
    },
    {
        name: 'Watermelon',
        category: 'fruit',
        supports: ['dehydration', 'fatigue', 'muscle cramps'],
        deficiencySupport: ['hydration'],
        nutrients: ['water content', 'potassium'],
        organs: ['muscles'],
        healthFunctions: ['hydration'],
        aliases: [],
        evidenceNote: 'High water content supports hydration, especially in heat.',
        cautions: []
    },
    {
        name: 'Coconut Water',
        category: 'beverage',
        supports: ['dehydration', 'muscle cramps', 'fatigue'],
        deficiencySupport: ['potassium'],
        nutrients: ['electrolytes', 'potassium'],
        organs: ['muscles', 'nervous system'],
        healthFunctions: ['electrolyte support'],
        aliases: [],
        evidenceNote: 'Provides fluid and electrolytes for rehydration support.',
        cautions: ['Monitor portions if managing blood sugar.']
    },
    {
        name: 'Avocado',
        category: 'fruit',
        supports: ['skin support', 'heart health'],
        deficiencySupport: ['vitamin e', 'potassium'],
        nutrients: ['vitamin e', 'healthy fats', 'potassium'],
        organs: ['skin', 'heart'],
        healthFunctions: ['cardiovascular support', 'skin barrier support'],
        aliases: [],
        evidenceNote: 'Healthy fats and vitamin E may support skin and heart health.',
        cautions: []
    },
    {
        name: 'Spinach',
        category: 'vegetable',
        supports: ['anemia support', 'fatigue', 'muscle cramps'],
        deficiencySupport: ['iron', 'magnesium', 'folate'],
        nutrients: Array.from(new Set(['iron', 'folate', 'magnesium', 'vitamin K', 'vitamin C'])),
        organs: ['blood', 'muscles'],
        healthFunctions: ['oxygen transport support'],
        aliases: [],
        evidenceNote: 'Provides iron and folate for red blood cell and energy support. Spinach is also rich in vitamin K and vitamin C, supporting blood and immune health.',
        cautions: ['May require pairing with vitamin C foods for better iron absorption.']
    },
    {
        name: 'Salmon',
        category: 'protein',
        supports: ['heart health', 'brain support', 'inflammation'],
        deficiencySupport: ['omega-3', 'vitamin D'],
        nutrients: ['omega-3 EPA/DHA', 'protein', 'vitamin D', 'selenium', 'B12'],
        organs: ['heart', 'brain', 'joints'],
        healthFunctions: ['cardiovascular support', 'cognitive support', 'anti-inflammatory'],
        aliases: [],
        evidenceNote: 'Salmon is a rich source of omega-3 fatty acids (EPA/DHA) and vitamin D, supporting heart, brain, and joint health.',
        cautions: ['May contain trace mercury; choose wild-caught when possible.']
    },
    {
        name: 'Chickpeas',
        category: 'legume',
        supports: ['blood sugar support', 'digestive support', 'satiety'],
        deficiencySupport: ['fiber', 'protein', 'iron'],
        nutrients: ['fiber', 'protein', 'iron', 'folate', 'manganese'],
        organs: ['gut', 'blood'],
        healthFunctions: ['metabolic health', 'digestive support'],
        aliases: ['garbanzo beans'],
        evidenceNote: 'Chickpeas provide fiber, protein, and iron, supporting blood sugar, digestion, and satiety.',
        cautions: ['May cause bloating in sensitive individuals.']
    },
    {
        name: 'Lentils',
        category: 'legume',
        supports: ['anemia support', 'cholesterol support', 'blood sugar support'],
        deficiencySupport: ['iron', 'fiber', 'folate'],
        nutrients: ['iron', 'fiber', 'protein', 'folate'],
        organs: ['blood', 'heart', 'metabolic system'],
        healthFunctions: ['metabolic health', 'digestive support'],
        aliases: [],
        evidenceNote: 'Fiber and plant protein can support glucose, lipids, and satiety.',
        cautions: []
    },
    {
        name: 'Pumpkin Seeds',
        category: 'seed',
        supports: ['muscle cramps', 'sleep support', 'energy support'],
        deficiencySupport: ['magnesium', 'zinc'],
        nutrients: ['magnesium', 'zinc'],
        organs: ['muscles', 'immune system'],
        healthFunctions: ['electrolyte support', 'immune support'],
        aliases: ['pepitas'],
        evidenceNote: 'Magnesium-rich option for muscle and recovery support.',
        cautions: []
    },
    {
        name: 'Kiwi',
        category: 'fruit',
        supports: ['constipation', 'immunity'],
        deficiencySupport: ['vitamin c', 'fiber'],
        nutrients: ['vitamin c', 'fiber'],
        organs: ['gut', 'immune system'],
        healthFunctions: ['digestive support', 'immune support'],
        aliases: ['kiwifruit'],
        evidenceNote: 'Fiber and vitamin C support digestion and immune function.',
        cautions: ['Allergy possible in latex-fruit syndrome.']
    },
    {
        name: 'Prunes',
        category: 'fruit',
        supports: ['constipation', 'bone support'],
        deficiencySupport: ['fiber'],
        nutrients: ['fiber', 'sorbitol'],
        organs: ['gut', 'bones'],
        healthFunctions: ['digestive support'],
        aliases: ['dried plums'],
        evidenceNote: 'Sorbitol and fiber can support bowel regularity.',
        cautions: ['May cause GI discomfort if introduced too quickly.']
    },
    {
        name: 'Broccoli',
        category: 'vegetable',
        supports: ['liver support', 'detox support', 'immune support'],
        deficiencySupport: ['vitamin c', 'folate'],
        nutrients: ['sulforaphane precursors', 'vitamin c'],
        organs: ['liver', 'immune system'],
        healthFunctions: ['detox support', 'antioxidant support'],
        aliases: [],
        evidenceNote: 'Cruciferous compounds may support detoxification pathways.',
        cautions: []
    }
];

const NaturalRX = () => {
    const [mergePrompt, setMergePrompt] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [dataset, setDataset] = useState(() => {
        if (!canUseLocalStorage()) {
            return withPreparation(DATASET);
        }
        try {
            const saved = JSON.parse(window.localStorage.getItem(DATASET_STORAGE_KEY));
            if (Array.isArray(saved) && saved.length > 0) {
                // If persistent data differs from DATASET, prompt user to merge
                const merged = mergeDatasets(saved, DATASET);
                // If merged differs from saved, prompt merge
                const needsMerge = JSON.stringify(merged) !== JSON.stringify(saved);
                if (needsMerge) {
                    setMergePrompt(true);
                }
                return withPreparation(saved);
            }
            return withPreparation(DATASET);
        } catch (error) {
            return withPreparation(DATASET);
        }
    });
    const [query, setQuery] = useState('');
    const [searchType, setSearchType] = useState('all');
    const [form, setForm] = useState(emptyFoodForm);
    const [editingName, setEditingName] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [collapsedByFood, setCollapsedByFood] = useState({});

    const isFoodCollapsed = (name) => {
        const value = collapsedByFood[name];
        return typeof value === 'boolean' ? value : true;
    };

    const setFoodCollapsed = (name) => (updater) => {
        setCollapsedByFood((prev) => {
            const current = typeof prev[name] === 'boolean' ? prev[name] : true;
            const next = typeof updater === 'function' ? updater(current) : Boolean(updater);
            return {
                ...prev,
                [name]: next
            };
        });
    };

    const persistDataset = (nextDataset) => {
        const hydrated = withPreparation(nextDataset);
        setDataset(hydrated);
        if (!canUseLocalStorage()) return;
        try {
            window.localStorage.setItem(DATASET_STORAGE_KEY, JSON.stringify(hydrated));
        } catch (error) {
            // no-op; fallback remains in-memory DATASET copy
        }
    };

    // UI handler to merge persistent and new DATASET
    const handleMergeDatasets = () => {
        if (!canUseLocalStorage()) return;
        try {
            const saved = JSON.parse(window.localStorage.getItem(DATASET_STORAGE_KEY));
            const merged = mergeDatasets(saved, DATASET);
            persistDataset(merged);
            setMergePrompt(false);
        } catch (error) {
            // fallback: just use DATASET
            persistDataset(DATASET);
            setMergePrompt(false);
        }
    };

    const handleAddOrSave = () => {
        const trimmedName = form.name.trim();
        if (!trimmedName) {
            alert('Name is required.');
            return;
        }

        const normalizedName = trimmedName.toLowerCase();
        const item = {
            name: trimmedName,
            category: (form.category || '').trim() || 'fruit',
            supports: parseCsv(form.supports),
            deficiencySupport: parseCsv(form.deficiencySupport),
            nutrients: parseCsv(form.nutrients),
            organs: parseCsv(form.organs),
            healthFunctions: parseCsv(form.healthFunctions),
            aliases: parseCsv(form.aliases),
            evidenceNote: (form.evidenceNote || '').trim(),
            preparation: (form.preparation || '').trim(),
            cautions: parseCsv(form.cautions)
        };

        const duplicate = dataset.find((entry) => entry.name.toLowerCase() === normalizedName);
        if (!editingName && duplicate) {
            alert('An item with this name already exists. Use edit instead.');
            return;
        }

        const nextDataset = editingName
            ? dataset.map((entry) => (entry.name === editingName ? item : entry))
            : [...dataset, item];

        persistDataset(nextDataset);
        setForm(emptyFoodForm);
        setEditingName('');
        setFormOpen(false);
    };

    const handleEdit = (food) => {
        setFormOpen(true);
        setEditingName(food.name);
        setForm({
            name: food.name || '',
            category: food.category || 'fruit',
            supports: toCsv(food.supports),
            deficiencySupport: toCsv(food.deficiencySupport),
            nutrients: toCsv(food.nutrients),
            organs: toCsv(food.organs),
            healthFunctions: toCsv(food.healthFunctions),
            aliases: toCsv(food.aliases),
            evidenceNote: food.evidenceNote || '',
            preparation: food.preparation || '',
            cautions: toCsv(food.cautions)
        });
    };

    const handleDelete = (name) => {
        const confirmed = window.confirm(`Delete '${name}' from NaturalRX dataset?`);
        if (!confirmed) return;
        const nextDataset = dataset.filter((entry) => entry.name !== name);
        persistDataset(nextDataset);
        if (editingName === name) {
            setEditingName('');
            setForm(emptyFoodForm);
            setFormOpen(false);
        }
    };

    const normalizedQuery = query.trim().toLowerCase();

    const expandedQueryTerms = useMemo(() => {
        if (!normalizedQuery) {
            return [];
        }
        const base = [normalizedQuery];
        const synonymTerms = SYNONYMS[normalizedQuery] || [];
        return Array.from(new Set([...base, ...synonymTerms]));
    }, [normalizedQuery]);

    const results = useMemo(() => {
        const shouldSearch = normalizedQuery.length > 0;
        const getSearchValues = (food) => {
            if (searchType === 'foodName') {
                return [food.name, ...(food.aliases || [])];
            }
            if (searchType === 'symptom') {
                return food.supports || [];
            }
            if (searchType === 'benefit') {
                return food.supports || [];
            }
            if (searchType === 'deficiency') {
                return food.deficiencySupport || [];
            }
            if (searchType === 'organ') {
                return food.organs || [];
            }
            if (searchType === 'healthFunction') {
                return food.healthFunctions || [];
            }
            return [
                food.name,
                ...(food.aliases || []),
                ...(food.supports || []),
                ...(food.deficiencySupport || []),
                ...(food.organs || []),
                ...(food.healthFunctions || []),
                ...(food.nutrients || [])
            ];
        };

        let filtered = dataset;
        if (categoryFilter) {
            filtered = filtered.filter((food) => food.category === categoryFilter);
        }

        const scored = filtered.map((food) => {
            if (!shouldSearch) {
                return {
                    ...food,
                    score: 0,
                    matchedOn: []
                };
            }

            let score = 0;
            const matchedOn = [];
            const terms = expandedQueryTerms;
            const values = getSearchValues(food).map((value) => String(value).toLowerCase());
            const lowerName = food.name.toLowerCase();
            const aliasValues = (food.aliases || []).map((alias) => alias.toLowerCase());

            terms.forEach((term) => {
                if (lowerName === term) {
                    score += 120;
                    matchedOn.push(`food:${food.name}`);
                } else if (lowerName.includes(term)) {
                    score += 70;
                    matchedOn.push(`food:${food.name}`);
                }

                aliasValues.forEach((alias) => {
                    if (alias === term) {
                        score += 100;
                        matchedOn.push(`alias:${alias}`);
                    } else if (alias.includes(term)) {
                        score += 45;
                        matchedOn.push(`alias:${alias}`);
                    }
                });

                values.forEach((value) => {
                    if (value === term) {
                        score += 60;
                        matchedOn.push(value);
                    } else if (value.includes(term)) {
                        score += 25;
                        matchedOn.push(value);
                    }
                });
            });

            return {
                ...food,
                score,
                matchedOn: Array.from(new Set(matchedOn)).slice(0, 5)
            };
        });

        return scored
            .filter((food) => !shouldSearch || food.score > 0)
            .sort((left, right) => {
                if (right.score !== left.score) {
                    return right.score - left.score;
                }
                return left.name.localeCompare(right.name);
            });
    }, [dataset, expandedQueryTerms, normalizedQuery, searchType, categoryFilter]);

    return (
        <div className='containerDetail mt--30'>
            {mergePrompt && (
                <div className='containerDetail p-10 bg-yellow color-red mb-5'>
                    <div className='mb-5'>
                        <b>New food/nutrient data is available.</b> Merge your saved data with the latest updates?
                    </div>
                    <button className='containerDetail button p-10 bg-green color-lite mr-5' onClick={handleMergeDatasets}>
                        Merge & Update
                    </button>
                    <button className='containerDetail button p-10 bg-lite color-lite' onClick={() => setMergePrompt(false)}>
                        Dismiss
                    </button>
                </div>
            )}
            <div className='containerDetail p-20 bg-lite color-lite size30 mb-5 contentLeft'>
                🌿 NaturalRX
            </div>
            <div className='containerDetail bg-lite mb-5'>
                <div className='containerDetail p-10 mb-5 contentLeft'>
                    <label className='mr-10 color-yellow'>Filter by Category:</label>
                    <select
                        className='containerDetail p-10 width--5 color-lite mb-5'
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value)}
                    >
                        <option value=''>All</option>
                        {getAllCategories(dataset).map((cat) => (
                            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                        ))}
                    </select>
                </div>
                <div className='containerDetail p-10 color-yellow mb-5 contentLeft'>
                    Search by symptom, benefit, deficiency, organ, health function, or food.
                </div>
                <div className='containerDetail p-10 mb-5 contentLeft'>
                    <button
                        className='containerDetail button p-10 bg-green color-lite mr-5'
                        onClick={() => {
                            setEditingName('');
                            setForm(emptyFoodForm);
                            setFormOpen((prev) => !prev);
                        }}
                    >
                        ➕ Add Item
                    </button>
                    <button
                        className={`containerDetail button p-10 color-lite ${isEditMode ? 'bg-dkYellow' : 'bg-lite'}`}
                        onClick={() => {
                            setIsEditMode((prev) => !prev);
                            if (isEditMode) {
                                setFormOpen(false);
                                setEditingName('');
                                setForm(emptyFoodForm);
                            }
                        }}
                    >
                        {isEditMode ? 'Edit Toggle: ON' : 'Edit Toggle: OFF'}
                    </button>
                </div>
                {
                    formOpen && (
                        <div className='containerDetail p-10 mb-5'>
                            <div className='containerDetail color-yellow p-10 mb-5 contentLeft'>
                                {editingName ? `✏️ Edit ${editingName}` : '➕ Add NaturalRX Item'}
                            </div>
                            <input className='containerDetail p-10 width--5 color-lite mb-5' placeholder='Name' value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
                            <input className='containerDetail p-10 width--5 color-lite mb-5' placeholder='Category (fruit, vegetable, spice...)' value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} />
                            <input className='containerDetail p-10 width--5 color-lite mb-5' placeholder='Supports (comma separated)' value={form.supports} onChange={(event) => setForm({ ...form, supports: event.target.value })} />
                            <input className='containerDetail p-10 width--5 color-lite mb-5' placeholder='Deficiency Support (comma separated)' value={form.deficiencySupport} onChange={(event) => setForm({ ...form, deficiencySupport: event.target.value })} />
                            <input className='containerDetail p-10 width--5 color-lite mb-5' placeholder='Nutrients (comma separated)' value={form.nutrients} onChange={(event) => setForm({ ...form, nutrients: event.target.value })} />
                            <input className='containerDetail p-10 width--5 color-lite mb-5' placeholder='Organs (comma separated)' value={form.organs} onChange={(event) => setForm({ ...form, organs: event.target.value })} />
                            <input className='containerDetail p-10 width--5 color-lite mb-5' placeholder='Functions (comma separated)' value={form.healthFunctions} onChange={(event) => setForm({ ...form, healthFunctions: event.target.value })} />
                            <input className='containerDetail p-10 width--5 color-lite mb-5' placeholder='Aliases (comma separated)' value={form.aliases} onChange={(event) => setForm({ ...form, aliases: event.target.value })} />
                            <textarea className='containerDetail p-10 width--5 color-lite mb-5' placeholder='Evidence note' value={form.evidenceNote} onChange={(event) => setForm({ ...form, evidenceNote: event.target.value })} />
                            <textarea className='containerDetail p-10 width--5 color-lite mb-5' placeholder='Preparation instructions' value={form.preparation} onChange={(event) => setForm({ ...form, preparation: event.target.value })} />
                            <input className='containerDetail p-10 width--5 color-lite mb-5' placeholder='Cautions (comma separated)' value={form.cautions} onChange={(event) => setForm({ ...form, cautions: event.target.value })} />
                            <div className='flexContainer'>
                                <button className='containerDetail button p-10 bg-green color-lite mr-5' onClick={handleAddOrSave}>
                                    {editingName ? 'Save' : 'Add'}
                                </button>
                                <button
                                    className='containerDetail button p-10 bg-dkYellow color-lite'
                                    onClick={() => {
                                        setFormOpen(false);
                                        setEditingName('');
                                        setForm(emptyFoodForm);
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )
                }
                <select
                    className='containerDetail p-20 mb-5 width--5 bg-lite color-lite size20'
                    value={searchType}
                    onChange={(event) => setSearchType(event.target.value)}
                >
                    {SEARCH_TYPES.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <input
                    className='containerDetail p-10 width--5 color-lite size20 mb-5 mt-5'
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder='Try: fatigue, anemia, blood sugar, liver, constipation, blueberries'
                />
            </div>
            <div className='containerDetail bg-lite mb-5'>
                <div className='containerDetail p-10 color-orange mb-5 contentLeft'>
                    Suggestions are educational and not medical advice. For severe/persistent symptoms, seek professional care.
                </div>

                <div className='containerDetail p-10 bg-blue color-yellow mb-5 contentLeft'>
                    Results ({results.length})
                </div>

                {results.length === 0 ? (
                    <div className='containerDetail color-red bg-lite p-10 contentLeft'>
                        No matches found. Try broader terms or switch search type to All.
                    </div>
                ) : (
                    <div className='containerDetail'>
                        <div className='scroll ht-400'>
                            {results.map((food) => {
                                const isCollapsed = isFoodCollapsed(food.name);
                                return (
                                <div key={food.name} className='containerDetail bg-lite color-lite mb-5'>
                                <div className='containerDetail bg-lite color-yellow size25'>
                                    <div className='containerDetail'>
                                        <CollapseToggleButton
                                            title={food.name}
                                            isCollapsed={isCollapsed}
                                            setCollapse={setFoodCollapsed(food.name)}
                                            align='left'
                                        />
                                    </div>
                                    <div className='contentRight color-lite p-10'>
                                        {
                                            isCollapsed
                                                ? <div className='flexContainer size15'>
                                                    <div className='flex2Column contentLeft pl-10'>
                                                        {(food.supports || []).slice(0, 4).map((item, idx) => (
                                                            <span key={`${food.name}-header-sup-${item}-${idx}`} className='mr-5'>
                                                                {getTagIcon(item, rxSymptomIcons, '🌿')}
                                                            </span>
                                                        ))}
                                                        {(food.organs || []).slice(0, 4).map((item, idx) => (
                                                            <span key={`${food.name}-header-org-${item}-${idx}`} className='mr-5'>
                                                                {getTagIcon(item, rxOrganIcons, '🫀')}
                                                            </span>
                                                        ))}
                                                        {(food.healthFunctions || []).slice(0, 4).map((item, idx) => (
                                                            <span key={`${food.name}-header-fx-${item}-${idx}`} className='mr-5'>
                                                                {getTagIcon(item, rxFunctionIcons, '🧭')}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className='flexColumn contentRight pr-10'>
                                                        {getTagIcon(food.category, rxCategoryIcons, '🥗')}
                                                    </div>
                                                </div>
                                                : <span title={food.category} className='mr-5 size15 pr-5'>{getTagIcon(food.category, rxCategoryIcons, '🥗')}</span>
                                                
                                        }
                                    </div>
                                </div>
                                {
                                    isCollapsed
                                        ? null
                                        : <div>
                                {
                                    isEditMode && (
                                        <div className='containerDetail p-10 contentRight'>
                                            <button className='containerDetail button p-10 bg-lite color-lite mr-5' onClick={() => handleEdit(food)}>
                                                ✏️ Edit
                                            </button>
                                            <button className='containerDetail button p-10 bg-red color-lite' onClick={() => handleDelete(food.name)}>
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    )
                                }
                                <div className='containerDetail contentLeft mb-5'>
                                    <div className='containerDetail color-yellow p-10 mb-5'>
                                        Supports:
                                    </div>
                                    <div className=''>
                                        {
                                            (food.supports || []).length === 0
                                                ? ' —'
                                                : <div className='mt-5 flexContainer width-100-percent h-scroll'>
                                                    {(food.supports || []).map((item) => (
                                                        <div key={`${food.name}-${item}`} className='containerDetail inlineBlock mr-5 p-10 bg-lite color-lite width-auto'>
                                                            <div className='mb-5'>
                                                                {getTagIcon(item, rxSymptomIcons, '🌿')}
                                                            </div>
                                                            <div>
                                                                {item}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                        }
                                    </div>
                                </div>
                                <div className='containerDetail contentLeft mb-5'>
                                    <div className='containerDetail color-yellow p-10 mb-5'>
                                        Deficiency Support:
                                    </div>
                                    <div className=''>
                                        {
                                            (food.deficiencySupport || []).length === 0
                                                ? ' —'
                                                : <div className='mt-5 flexContainer width-100-percent'>
                                                    {(food.deficiencySupport || []).map((item) => (
                                                        <span key={`${food.name}-def-${item}`} className='containerDetail inlineBlock mr-5 mb-5 p-10 bg-lite color-lite'>
                                                            <span className='mr-5'>{getTagIcon(item, rxDeficiencyIcons, '🧪')}</span>
                                                            {item}
                                                        </span>
                                                    ))}
                                                </div>
                                        }
                                    </div>
                                </div>
                                <div className='containerDetail contentLeft mb-5'>
                                    <div className='containerDetail color-yellow p-10 mb-5'>
                                        Organs:
                                    </div>
                                    <div className=''>
                                        {
                                            (food.organs || []).length === 0
                                                ? ' —'
                                                : <div className='mt-5 flexContainer width-100-percent'>
                                                    {(food.organs || []).map((item, idx) => (
                                                        <span key={`${food.name}-org-${item}-${idx}`} className='containerDetail inlineBlock mr-5 mb-5 p-10 bg-lite color-lite'>
                                                            <span className='mr-5'>{getTagIcon(item, rxOrganIcons, '🫀')}</span>
                                                            {item}
                                                        </span>
                                                    ))}
                                                </div>
                                        }
                                    </div>
                                </div>
                                <div className='containerDetail contentLeft mb-5'>
                                    <div className='containerDetail color-yellow p-10 mb-5'>
                                        Functions:
                                    </div>
                                    <div className=''>
                                        {
                                            (food.healthFunctions || []).length === 0
                                                ? ' —'
                                                : <div className='mt-5 flexContainer width-100-percent'>
                                                    {(food.healthFunctions || []).map((item) => (
                                                        <span key={`${food.name}-fx-${item}`} className='containerDetail inlineBlock mr-5 mb-5 p-10 bg-lite color-lite'>
                                                            <span className='mr-5'>{getTagIcon(item, rxFunctionIcons, '🧭')}</span>
                                                            {item}
                                                        </span>
                                                    ))}
                                                </div>
                                        }
                                    </div>
                                </div>
                                <div className='containerDetail contentLeft mb-5'>
                                    <div className='containerDetail color-yellow p-10 mb-5'>
                                        Nutrients:
                                    </div>
                                    <div className='containerDetail p-10 contentLeft mb-5'>
                                        <span className='color-yellow'>Preparation:</span> {food.preparation || getSuggestedPreparation(food.name)}
                                    </div>
                                    <div className='containerDetail p-10 contentLeft mb-5'>
                                        <span className='color-yellow'>Why:</span> {food.evidenceNote}
                                    </div>
                                    {(food.cautions || []).length > 0 && (
                                        <div className='containerDetail p-10 contentLeft color-red mb-5'>
                                            <span className='color-yellow'>Caution:</span> {(food.cautions || []).join(' ')}
                                        </div>
                                    )}

                                    {query.trim() && (
                                        <div className='containerDetail p-10 contentLeft size15 color-lite'>
                                            <span className='color-yellow mr-5'>
                                                Matched on:
                                            </span> 
                                            {(food.matchedOn || []).join(', ') || 'general relevance'}
                                        </div>
                                    )}
                                </div>
                                </div>
                                }
                                </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NaturalRX;