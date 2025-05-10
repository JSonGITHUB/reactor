const feedingPlans = [
    { 
        date: 'Feb 17',
        phase: '🌱 Seedling & Early Growth Stage (Weeks 1-4)',
        instructions: `✅ Goal: Encourage strong root and leaf development.
        Fish Waste Contribution: Provides nitrates(N) for leafy greens.
        Supplements: Minimal; seedlings don’t need high phosphorus(P) or potassium(K).`,
        plan: [
                'Fish Emulsion Tea: ¼ strength(1 tbsp per 5 gallons of water) every 2 weeks.',
                '10-10-10 Fertilizer Tea: None (Avoid stressing young plants).',
                'pH Monitoring: Keep 6.5-7.0 for optimal nutrient uptake.'
        ]
    },
    {
        date: 'March 17',
        phase: '🌿 Vegetative Growth Stage (Weeks 5-8)',
        instructions: `✅ Goal: Encourage leafy growth in greens and strong stems for broccoli, beets, and tomatoes.
        * Fish Waste Contribution: Supports lettuce, spinach, cilantro, and mint well.
        * Supplements: Medium P & K needed for broccoli, beets, and tomatoes.`,
        plan: [
                'Fish Emulsion Tea: ½ strength (2 tbsp per 5 gallons) weekly.',
                '10-10-10 Fertilizer Tea: ¼ strength (1 tbsp per 5 gallons) every 2 weeks (start slow).',
                'Extra Potassium (K) for Tomatoes & Beets: Add seaweed extract (½ tsp per 5 gallons) every 2 weeks.'
        ]
    },
    {
        date: 'April 17',
        phase: '🌸 Flowering Stage (Weeks 9-12)',
        instructions: `✅ Goal: Boost flowering in tomatoes and broccoli while sustaining leafy greens.
        * Fish Waste Contribution: Still high in nitrates, but plants now need more phosphorus (P) & potassium (K).
        * Supplements: Increase P & K for fruiting crops.`,
        plan: [
                'Fish Emulsion Tea: ½ strength (2 tbsp per 5 gallons) every week.',
                '10-10-10 Fertilizer Tea: ½ strength (2 tbsp per 5 gallons) every 2 weeks.',
                'Extra Phosphorus (P) Boost: Add bone meal or rock phosphate (sprinkle near tomato/beet root zones).',
                'Monitor Nitrate Levels: Keep 20-80 ppm to avoid excessive leafy growth over flowers.'
        ]
    },
    {
        date: 'May 17',
        phase: '🍅 Fruiting & Harvest Stage (Weeks 13+)',
        instructions: `✅ Goal: Sustain fruit production (tomatoes), strong root crops (beets), and continuous leafy harvests.
        * Fish Waste Contribution: Still useful for greens, but fruiting plants now require even more K.
        * Supplements: Higher potassium (K) and phosphorus (P).`,
        plan: [
                'Fish Emulsion Tea: Maintain ½ strength weekly.',
                '10-10-10 Fertilizer Tea: Full strength (3 tbsp per 5 gallons) every 2 weeks.',
                'Extra Potassium (K) for Tomatoes & Beets: Increase seaweed extract (1 tsp per 5 gallons) weekly.',
                'Calcium Boost (Prevent Blossom End Rot in Tomatoes): Add crushed eggshells or calcium chloride.'
        ]
    }
];
export default feedingPlans;