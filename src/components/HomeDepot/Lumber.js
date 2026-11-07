import React, { useState, useEffect, useRef } from 'react';
import { useLayout } from '../utils/LayoutContext';
import { colors } from '@material-ui/core';
import evaluateMathExpression from '../utils/evaluateMathExpression';
// Keys for localStorage
const COLLAPSE_KEYS = {
    wall: 'collapse_wall',
    deck: 'collapse_deck',
    plywood: 'collapse_plywood',
    results: 'collapse_results',
    assistant: 'collapse_assistant',
    toolkit: 'collapse_toolkit',
    bayFinder: 'collapse_bay_finder',
    form: 'lumber_form',
};

const initialInputs = {
    wallLength: '',
    wallHeight: '',
    studSpacing: 16,
    numDoors: 0,
    numWindows: 0,
    deckLength: '',
    deckWidth: '',
    boardWidth: 5.5,
    fenceLength: '',
    picketWidth: 5.5,
    concreteVolume: '',
    plywoodLength: 8,
    plywoodWidth: 4,
    areaToCover: '',
    roofArea: '',
    drywallArea: '',
};

const INSPECTION_AISLES = [
    { id: '31', defaultLabel: 'Trim, Moulding, Garage Door, Pet Doors', lane: 'north' },
    { id: '30', defaultLabel: 'Drywall Cross Merch, Drywall Screws', lane: 'north' },
    { id: '28', defaultLabel: 'Shiplap Boards, Metal Products, Iron Deck', lane: 'north' },
    { id: '27', defaultLabel: 'Project Panels, Framing Mix', lane: 'north' },
    { id: '26', defaultLabel: 'Shingles Accessories, Block Brick', lane: 'north' },
    { id: '21', defaultLabel: 'Boards, Nails, Drywall Cross Merch', lane: 'south' },
    { id: '22', defaultLabel: 'Ram Board', lane: 'south' },
    { id: '23', defaultLabel: 'Dewalt, Gyp Tools, Project Panels', lane: 'south' },
    { id: '24', defaultLabel: 'Concrete Tools, Gypsum Board, Tape', lane: 'south' },
    { id: '25', defaultLabel: 'Concrete Repair, Forming, Commercial', lane: 'south' },
];

const normalizeInspectionBayCount = (value) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return 0;
    return Math.min(200, Math.floor(parsed));
};

const createDefaultInspectionState = () => {
    return INSPECTION_AISLES.reduce((acc, aisle) => {
        acc[aisle.id] = {
            label: aisle.defaultLabel,
            bayCount: 0,
            bays: {},
            isEditing: false,
        };
        return acc;
    }, {});
};

function roundUp(val) {
    return Math.ceil(Number(val) || 0);
}

const Lumber = () => {
                // StudFinder state and models
                const [collapsedStudFinder, setCollapsedStudFinder] = useState(true);
                const [studSel, setStudSel] = useState({
                    project: '',
                    structural: '',
                    exposure: '',
                    span: '',
                    appearance: '',
                    budget: '',
                    followup: '',
                });
                const [studRec, setStudRec] = useState(null); // LumberRecommendation | null
                const [studWarnings, setStudWarnings] = useState([]); // string[]
                const [studExplanation, setStudExplanation] = useState('');
                const [studNominalActual, setStudNominalActual] = useState('');

                // Option sets
                const studProjects = [
                    '', 'Interior wall', 'Exterior wall', 'Deck', 'Fence', 'Pergola', 'Shed', 'Workbench', 'Raised garden bed', 'Floor framing', 'Roof framing', 'Beam/header', 'Posts', 'Furniture', 'Garage shelving', 'Other'
                ];
                const studStructurals = [
                    '', 'Decorative only', 'Light structural', 'Structural/load-bearing', 'Unsure'
                ];
                const studExposures = [
                    '', 'Indoor dry', 'Indoor humid', 'Outdoor covered', 'Outdoor exposed', 'Ground contact'
                ];
                const studAppearances = [
                    '', 'Hidden framing', 'Utility', 'Paint-grade', 'Stain-grade', 'Furniture-quality'
                ];
                const studBudgets = [
                    '', 'Cheapest', 'Balanced', 'Premium'
                ];

                // Handler for StudFinder form
                const handleStudSelChange = e => {
                    const { name, value } = e.target;
                    setStudSel(prev => ({ ...prev, [name]: value }));
                    setStudRec(null); setStudWarnings([]); setStudExplanation(''); setStudNominalActual('');
                };

                // Rules engine for recommendations (simplified, extend as needed)
                function getStudRecommendation(sel) {
                    // Expanded rules: always return a recommendation based on selection
                    // Specific rules for known cases
                    if (sel.project === 'Interior wall' && sel.structural !== 'Structural/load-bearing') {
                        return {
                            nominalSize: '2x4',
                            actualSize: '1.5" x 3.5"',
                            species: 'SPF',
                            grade: 'Stud',
                            applications: ['Interior non-load-bearing walls'],
                            pros: ['Inexpensive', 'Lightweight', 'Standard framing lumber'],
                            cons: ['Not for exterior or long spans'],
                            alternatives: ['Douglas Fir 2x4', '2x6 for taller walls'],
                            warnings: ['Avoid outdoor exposure', 'Not for long unsupported spans'],
                        };
                    }
                    if (sel.project === 'Interior wall' && sel.structural === 'Structural/load-bearing') {
                        return {
                            nominalSize: '2x6',
                            actualSize: '1.5" x 5.5"',
                            species: 'Douglas Fir or SPF',
                            grade: 'Stud or #2',
                            applications: ['Load-bearing interior walls'],
                            pros: ['Stronger', 'Allows more insulation'],
                            cons: ['Heavier', 'More expensive'],
                            alternatives: ['2x8', 'Engineered lumber'],
                            warnings: ['Check local code for load-bearing walls'],
                        };
                    }
                    if (sel.project === 'Deck') {
                        return {
                            nominalSize: '2x8',
                            actualSize: '1.5" x 7.25"',
                            species: 'PT SYP',
                            grade: '#2 or better',
                            treatment: 'Pressure Treated',
                            applications: ['Deck joists', 'Deck framing'],
                            pros: ['Strong', 'Treated for outdoor use'],
                            cons: ['Heavier', 'May warp while drying'],
                            alternatives: ['2x10', '2x12'],
                            warnings: ['Use Ground Contact rated for posts or below grade'],
                        };
                    }
                    if (sel.project === 'Fence') {
                        return {
                            nominalSize: '4x4',
                            actualSize: '3.5" x 3.5"',
                            species: 'PT SYP or Cedar',
                            grade: 'Post',
                            treatment: 'Pressure Treated',
                            applications: ['Fence posts'],
                            pros: ['Rot resistant', 'Strong'],
                            cons: ['Heavy', 'May split'],
                            alternatives: ['Cedar', 'Redwood'],
                            warnings: ['Use Ground Contact rated for posts'],
                        };
                    }
                    if (sel.project === 'Beam/header') {
                        return {
                            nominalSize: 'LVL or 4x12',
                            actualSize: 'Engineered or 3.5" x 11.25"',
                            species: 'Engineered or Douglas Fir',
                            grade: 'LVL/Glulam/#1',
                            applications: ['Beams', 'Headers'],
                            pros: ['High strength', 'Long spans'],
                            cons: ['Expensive', 'Heavy'],
                            alternatives: ['Double 2x12', 'Steel beam'],
                            warnings: ['Consult code/engineer for sizing'],
                        };
                    }
                    if (sel.project === 'Furniture') {
                        return {
                            nominalSize: '1x, 2x, hardwood',
                            actualSize: 'Varies',
                            species: 'Oak, Maple, Pine',
                            grade: 'Select',
                            applications: ['Furniture', 'Shelving'],
                            pros: ['Attractive', 'Stable'],
                            cons: ['Expensive'],
                            alternatives: ['Plywood', 'MDF'],
                        };
                    }
                    // Generic fallback for all other combinations
                    // Use selection to generate a plausible recommendation
                    // Nominal size logic
                    let nominalSize = '2x4';
                    let actualSize = '1.5" x 3.5"';
                    let species = 'SPF';
                    let grade = 'Stud';
                    let treatment = '';
                    let applications = [sel.project || 'General construction'];
                    let pros = ['Widely available', 'Versatile'];
                    let cons = [];
                    let alternatives = ['2x6', 'Engineered lumber'];
                    let warnings = [];
                    // Adjust for structural
                    if (sel.structural === 'Structural/load-bearing') {
                        nominalSize = '2x6';
                        actualSize = '1.5" x 5.5"';
                        grade = 'Stud or #2';
                        pros.push('Stronger, supports more load');
                        cons.push('Heavier, more expensive');
                    } else if (sel.structural === 'Light structural') {
                        nominalSize = '2x4';
                        actualSize = '1.5" x 3.5"';
                        grade = 'Stud';
                        pros.push('Lightweight, easy to handle');
                    } else if (sel.structural === 'Decorative only') {
                        nominalSize = '1x4';
                        actualSize = '0.75" x 3.5"';
                        grade = 'Select';
                        pros.push('Good for trim or finish');
                        cons.push('Not for structural use');
                        alternatives = ['MDF', 'Pine'];
                    }
                    // Adjust for exposure
                    if (sel.exposure === 'Outdoor covered' || sel.exposure === 'Outdoor exposed' || sel.exposure === 'Ground contact') {
                        treatment = 'Pressure Treated';
                        species = 'PT SYP';
                        pros.push('Weather resistant');
                        if (sel.exposure === 'Ground contact') {
                            warnings.push('Use Ground Contact rated lumber');
                        }
                    } else if (sel.exposure === 'Indoor humid') {
                        pros.push('Resists moderate moisture');
                    }
                    // Adjust for appearance
                    if (sel.appearance === 'Paint-grade') {
                        grade = 'Paint-grade';
                        pros.push('Smooth, good for painting');
                    } else if (sel.appearance === 'Stain-grade' || sel.appearance === 'Furniture-quality') {
                        grade = 'Select';
                        species = 'Pine, Oak, Maple';
                        pros.push('Attractive grain, good for finish');
                        cons.push('More expensive');
                    } else if (sel.appearance === 'Utility') {
                        grade = 'Utility';
                        pros.push('Low cost');
                    }
                    // Adjust for budget
                    if (sel.budget === 'Cheapest') {
                        pros.push('Lowest price');
                        cons.push('May have more knots or defects');
                        grade = 'Utility';
                    } else if (sel.budget === 'Premium') {
                        grade = 'Select';
                        pros.push('Best appearance, fewer defects');
                        cons.push('Higher cost');
                    }
                    // Compose recommendation
                    return {
                        nominalSize,
                        actualSize,
                        species,
                        grade,
                        treatment: treatment || undefined,
                        applications,
                        pros,
                        cons,
                        alternatives,
                        warnings,
                    };
                }

                // Nominal vs Actual size education
                function getNominalActual(nominal) {
                    const map = {
                        '2x4': '1.5" x 3.5"',
                        '2x6': '1.5" x 5.5"',
                        '2x8': '1.5" x 7.25"',
                        '2x10': '1.5" x 9.25"',
                        '4x4': '3.5" x 3.5"',
                        '4x6': '3.5" x 5.5"',
                        '6x6': '5.5" x 5.5"',
                    };
                    return map[nominal] ? `${nominal} = ${map[nominal]}` : '';
                }

                // Explanation generator (simple)
                function getStudExplanation(rec) {
                    if (!rec) return '';
                    if (rec.nominalSize === '2x4') return '2x4: Standard for interior walls. Nominal sizes are rough-cut names; actual is 1.5" x 3.5".';
                    if (rec.nominalSize === '2x6') return '2x6: Used for load-bearing or tall walls. Allows more insulation.';
                    if (rec.nominalSize === '2x8') return '2x8: Deck joists, strong for outdoor use.';
                    if (rec.nominalSize === '4x4') return '4x4: Fence/garden posts. Use Ground Contact rated for below grade.';
                    if (rec.nominalSize === 'LVL or 4x12') return 'LVL: Engineered for long spans. Consult code for sizing.';
                    return '';
                }

                // Dynamic follow-up (example)
                const studFollowup = (() => {
                    if (studSel.project === 'Deck' && !studSel.span) return 'What is your joist span?';
                    if (studSel.project === 'Interior wall' && !studSel.structural) return 'Is this wall load-bearing?';
                    if (studSel.project === 'Beam/header' && !studSel.span) return 'What is the beam span?';
                    return '';
                })();

                // On submit, run rules
                const handleStudSelSubmit = e => {
                    e.preventDefault();
                    const rec = getStudRecommendation(studSel);
                    setStudRec(rec);
                    setStudWarnings(rec && rec.warnings ? rec.warnings : []);
                    setStudExplanation(getStudExplanation(rec));
                    setStudNominalActual(getNominalActual(rec ? rec.nominalSize : ''));
                };
            // PlySelector state and models
            const [collapsedPlySelector, setCollapsedPlySelector] = useState(true);
            const [plySel, setPlySel] = useState({
                projectType: '',
                environment: '',
                appearance: '',
                structural: '',
                budget: '',
                followup: '',
            });
            const [plyRec, setPlyRec] = useState(null); // PlywoodRecommendation | null
            const [plyConfidence, setPlyConfidence] = useState(null); // number | null
            const [plyWarnings, setPlyWarnings] = useState([]); // string[]
            const [plyExplanation, setPlyExplanation] = useState('');

            // Option sets
            const projectTypes = [
                { value: '', label: 'Select...' },
                { value: 'roof', label: 'Roof' },
                { value: 'cabinet', label: 'Cabinet' },
                { value: 'subfloor', label: 'Subfloor' },
                { value: 'shed', label: 'Shed' },
                { value: 'furniture', label: 'Furniture' },
            ];
            const environments = [
                { value: '', label: 'Select...' },
                { value: 'indoor', label: 'Indoor' },
                { value: 'humid', label: 'Humid/Bath/Laundry' },
                { value: 'outdoor', label: 'Outdoor' },
                { value: 'ground_contact', label: 'Ground Contact' },
            ];
            const appearances = [
                { value: '', label: 'Select...' },
                { value: 'hidden', label: 'Hidden' },
                { value: 'paint', label: 'Paint' },
                { value: 'stain', label: 'Stain' },
                { value: 'premium', label: 'Premium/Clear' },
            ];
            const structurals = [
                { value: '', label: 'Select...' },
                { value: 'structural', label: 'Structural' },
                { value: 'non_structural', label: 'Non-Structural' },
                { value: 'unknown', label: 'Not Sure' },
            ];
            const budgets = [
                { value: '', label: 'Select...' },
                { value: 'cheap', label: 'Cheapest' },
                { value: 'balanced', label: 'Balanced' },
                { value: 'premium', label: 'Premium' },
            ];

            // Handler for PlySelector form
            const handlePlySelChange = e => {
                const { name, value } = e.target;
                setPlySel(prev => ({ ...prev, [name]: value }));
                setPlyRec(null); setPlyConfidence(null); setPlyWarnings([]); setPlyExplanation('');
            };

            // Rules engine for recommendations (simplified, extend as needed)
            function getPlyRecommendation(sel) {
                // Example rules, can be expanded
                if (sel.projectType === 'roof' && sel.environment === 'outdoor') {
                    return {
                        name: 'CDX Sheathing',
                        thickness: '1/2"',
                        grade: 'CDX',
                        exposureRating: 'Exterior',
                        applications: ['Roof decking', 'Wall sheathing'],
                        pros: ['Strong', 'Widely available', 'Affordable'],
                        cons: ['Rough surface', 'Not for finish work'],
                        alternatives: ['OSB', 'RTD'],
                        warnings: ['Do not use MDF or particleboard outdoors.'],
                    };
                }
                if (sel.projectType === 'cabinet' && sel.appearance === 'stain') {
                    return {
                        name: 'Birch Plywood',
                        thickness: '3/4"',
                        grade: 'A1',
                        exposureRating: 'Interior',
                        applications: ['Cabinetry', 'Furniture'],
                        pros: ['Smooth', 'Takes stain well', 'Attractive grain'],
                        cons: ['More expensive'],
                        alternatives: ['Maple', 'Oak', 'Baltic birch'],
                    };
                }
                if (sel.projectType === 'subfloor') {
                    return {
                        name: 'Tongue & Groove OSB',
                        thickness: '3/4"',
                        grade: 'OSB',
                        exposureRating: 'Exposure 1',
                        applications: ['Subfloor'],
                        pros: ['Stable', 'Affordable', 'Easy to install'],
                        cons: ['Not for exterior use'],
                        alternatives: ['CDX', 'Advantech'],
                    };
                }
                if (sel.projectType === 'shed' && sel.environment === 'outdoor') {
                    return {
                        name: 'PT Plywood',
                        thickness: '5/8"',
                        grade: 'Pressure Treated',
                        exposureRating: 'Ground Contact',
                        applications: ['Shed floor', 'Outdoor structure'],
                        pros: ['Resists rot', 'Good for ground contact'],
                        cons: ['Heavier', 'More expensive'],
                        alternatives: ['CDX', 'BCX'],
                    };
                }
                if (sel.projectType === 'furniture' && sel.appearance === 'premium') {
                    return {
                        name: 'Baltic Birch',
                        thickness: '3/4"',
                        grade: 'BB/BB',
                        exposureRating: 'Interior',
                        applications: ['Furniture', 'Drawers', 'Cabinet boxes'],
                        pros: ['Very stable', 'Smooth edges', 'Minimal voids'],
                        cons: ['Expensive', 'Heavier'],
                        alternatives: ['Birch', 'Maple'],
                    };
                }
                // Fallback
                return null;
            }

            // Confidence scoring (simple example)
            function getConfidence(sel) {
                let score = 0.7;
                if (sel.projectType && sel.environment && sel.appearance && sel.structural && sel.budget) score += 0.2;
                if (sel.projectType && sel.environment) score += 0.1;
                return Math.min(score, 0.99);
            }

            // Explanation generator (simple)
            function getExplanation(rec) {
                if (!rec) return '';
                if (rec.name === 'CDX Sheathing') return 'CDX: C-grade face, D-grade back, exterior glue, used for roof/wall sheathing.';
                if (rec.name === 'Birch Plywood') return 'Birch: Smooth, fine grain, stains well, used for cabinets and furniture.';
                if (rec.name === 'Tongue & Groove OSB') return 'OSB: Oriented Strand Board, stable, affordable, common for subfloors.';
                if (rec.name === 'PT Plywood') return 'PT: Pressure treated, resists rot, for ground contact or outdoor use.';
                if (rec.name === 'Baltic Birch') return 'Baltic Birch: Many plies, minimal voids, premium for furniture.';
                return '';
            }

            // Dynamic follow-up (example)
            const plyFollowup = (() => {
                if (plySel.projectType === 'cabinet' && !plySel.appearance) return 'Will this be painted or stained?';
                if (plySel.projectType === 'roof' && !plySel.environment) return 'Is this indoor, outdoor, or humid?';
                if (plySel.projectType === 'subfloor' && !plySel.structural) return 'Is this for a structural floor?';
                return '';
            })();

            // On submit, run rules
            const handlePlySelSubmit = e => {
                e.preventDefault();
                const rec = getPlyRecommendation(plySel);
                setPlyRec(rec);
                setPlyConfidence(getConfidence(plySel));
                setPlyWarnings(rec && rec.warnings ? rec.warnings : []);
                setPlyExplanation(getExplanation(rec));
            };
        // Ply Converter state
        const [collapsedPly, setCollapsedPly] = useState(true);
        const [plyForm, setPlyForm] = useState({
            project: '',
            indoorOutdoor: '',
            structuralAppearance: '',
            finish: '',
            thickness: '',
            search: '',
        });

        // Plywood data
        const plyCategories = [
            { category: 'Rough Structural', names: ['CDX', 'sheathing', 'OSB', 'RTD'] },
            { category: 'Better Appearance', names: ['BC', 'sanded ply', 'AC'] },
            { category: 'Finish/Cabinet', names: ['birch', 'oak', 'maple', 'Baltic birch'] },
            { category: 'Moisture/Exterior', names: ['ACX', 'BCX', 'marine', 'PT ply'] },
        ];

        // Filtered table rows
        const filteredPly = plyCategories
            .map(cat => ({
                ...cat,
                filtered: cat.names.filter(n =>
                    n.toLowerCase().includes(plyForm.search.toLowerCase())
                )
            }))
            .filter(cat => cat.filtered.length > 0);

        const handlePlyFormChange = e => {
            const { name, value } = e.target;
            setPlyForm(prev => ({ ...prev, [name]: value }));
        };
    // --- Unified collapse state for all collapsible sections, persisted in localStorage ---
    const COLLAPSE_KEYS_ALL = [
        'inspection',
        'toolkit',
        'bayFinder',
        'plySelector',
        'ply', // Ply Converter
        'studFinder',
        'ai',
        'substitute',
        'contractorSlang',
        'wall',
        'deck',
        'plywood',
        'results',
        'assistant',
    ];
        // Example contractor slang mapping data
        const contractorSlangTable = [
            {
                slang: 'Green board',
                actual: 'Mold-resistant drywall',
                sku: '123456',
                aisle: 'Building Materials',
                bin: 'Aisle 12, Bay 3',
                substitutes: 'Purple board, Cement board',
                accessories: 'Drywall screws, Joint tape',
            },
            {
                slang: 'Plywood',
                actual: 'Sheathing, Sanded, Underlayment, BC, CDX',
                sku: '789012',
                aisle: 'Lumber',
                bin: 'Aisle 14, Bay 1',
                substitutes: 'OSB, MDF',
                accessories: 'Construction adhesive, Screws',
            },
            {
                slang: 'Cement board',
                actual: 'HardieBacker or Durock',
                sku: '345678',
                aisle: 'Tile',
                bin: 'Aisle 9, Bay 2',
                substitutes: 'Fiber cement, Green board',
                accessories: 'Backer board screws, Mesh tape',
            },
            {
                slang: 'Red rosin',
                actual: 'Flooring underlayment paper',
                sku: '654321',
                aisle: 'Flooring',
                bin: 'Aisle 17, Bay 4',
                substitutes: '15# felt, Foam underlayment',
                accessories: 'Stapler',
            },
            {
                slang: 'Blue board',
                actual: 'Plaster base drywall',
                sku: '112233',
                aisle: 'Building Materials',
                bin: 'Aisle 12, Bay 4',
                substitutes: 'Regular drywall',
                accessories: 'Plaster, Joint compound',
            },
        ];
    function getCollapseState() {
        let state = {};
        try {
            const raw = localStorage.getItem('collapseState');
            if (raw) state = JSON.parse(raw);
        } catch {}
        COLLAPSE_KEYS_ALL.forEach((k) => {
            if (typeof state[k] !== 'boolean') {
                state[k] = k === 'bayFinder' ? false : true;
            }
        });
        return state;
    }
    const [collapsed, setCollapsed] = useState(getCollapseState);
    useEffect(() => { setCollapsed(getCollapseState()); }, []);
    useEffect(() => { localStorage.setItem('collapseState', JSON.stringify(collapsed)); }, [collapsed]);
    const handleCollapse = (section) => {
        setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    const [inspectionFilter, setInspectionFilter] = useState(() => {
        try {
            return localStorage.getItem('lumber_inspection_filter') || 'all';
        } catch {
            return 'all';
        }
    });
    const [inspectionState, setInspectionState] = useState(() => {
        const defaults = createDefaultInspectionState();
        try {
            const saved = localStorage.getItem('lumber_inspection_state');
            if (!saved) return defaults;
            const parsed = JSON.parse(saved);
            const merged = { ...defaults };
            INSPECTION_AISLES.forEach((aisle) => {
                const savedEntry = parsed?.[aisle.id] || {};
                const bayCount = normalizeInspectionBayCount(savedEntry.bayCount);
                const bays = {};
                if (savedEntry?.bays && typeof savedEntry.bays === 'object') {
                    Object.keys(savedEntry.bays).forEach((key) => {
                        const bayNumber = normalizeInspectionBayCount(key);
                        if (bayNumber > 0 && bayNumber <= bayCount) {
                            bays[String(bayNumber)] = {
                                inspectedAt: Number(savedEntry.bays[key]?.inspectedAt) || Date.now(),
                            };
                        }
                    });
                }
                merged[aisle.id] = {
                    label: String(savedEntry.label || aisle.defaultLabel),
                    bayCount,
                    bays,
                    isEditing: false,
                };
            });
            return merged;
        } catch {
            return defaults;
        }
    });
    useEffect(() => {
        localStorage.setItem('lumber_inspection_filter', inspectionFilter);
    }, [inspectionFilter]);
    useEffect(() => {
        localStorage.setItem('lumber_inspection_state', JSON.stringify(inspectionState));
    }, [inspectionState]);

    const setAisleEditMode = (aisleId, isEditing) => {
        setInspectionState((prev) => {
            const next = { ...prev };
            const current = next[aisleId] || { label: '', bayCount: 0, bays: {}, isEditing: false };
            next[aisleId] = { ...current, isEditing };
            return next;
        });
    };

    const updateInspectionAisleLabel = (aisleId, label) => {
        setInspectionState((prev) => {
            const next = { ...prev };
            const current = next[aisleId] || { label: '', bayCount: 0, bays: {}, isEditing: false };
            next[aisleId] = {
                ...current,
                label,
            };
            return next;
        });
    };

    const updateInspectionAisleBayCount = (aisleId, value) => {
        setInspectionState((prev) => {
            const next = { ...prev };
            const current = next[aisleId] || { label: '', bayCount: 0, bays: {}, isEditing: false };
            const bayCount = normalizeInspectionBayCount(value);
            const trimmedBays = {};
            Object.keys(current.bays || {}).forEach((key) => {
                const bayNumber = normalizeInspectionBayCount(key);
                if (bayNumber > 0 && bayNumber <= bayCount) {
                    trimmedBays[String(bayNumber)] = current.bays[key];
                }
            });

            next[aisleId] = {
                ...current,
                bayCount,
                bays: trimmedBays,
            };
            return next;
        });
    };

    const toggleInspectionChecklistBay = (aisleId, bayNumber) => {
        const bayKey = String(bayNumber);
        setInspectionState((prev) => {
            const next = { ...prev };
            const current = next[aisleId] || { label: '', bayCount: 0, bays: {}, isEditing: false };
            const bays = { ...(current.bays || {}) };

            if (bays[bayKey]) {
                delete bays[bayKey];
            } else {
                bays[bayKey] = { inspectedAt: Date.now() };
            }

            next[aisleId] = {
                ...current,
                bays,
            };
            return next;
        });
    };

    const clearInspectionState = () => {
        setInspectionState((prev) => {
            const next = { ...prev };
            Object.keys(next).forEach((aisleId) => {
                const current = next[aisleId];
                next[aisleId] = {
                    ...current,
                    bays: {},
                    isEditing: false,
                };
            });
            return next;
        });
    };

    const inspectionAisleItems = INSPECTION_AISLES.map((aisle) => {
        const aisleState = inspectionState[aisle.id] || {};
        const bayCount = normalizeInspectionBayCount(aisleState.bayCount);
        const checkedBays = aisleState.bays && typeof aisleState.bays === 'object' ? aisleState.bays : {};
        const inspectedBayCount = Object.keys(checkedBays).filter((key) => {
            const bayNumber = normalizeInspectionBayCount(key);
            return bayNumber > 0 && bayNumber <= bayCount;
        }).length;
        const isInspected = bayCount > 0 && inspectedBayCount === bayCount;
        return {
            ...aisle,
            label: String(aisleState.label || aisle.defaultLabel),
            bayCount,
            bays: checkedBays,
            isEditing: Boolean(aisleState.isEditing),
            inspectedBayCount,
            isInspected,
        };
    });

    const totalInspectionBays = inspectionAisleItems.reduce((sum, aisle) => sum + aisle.bayCount, 0);
    const inspectedCount = inspectionAisleItems.reduce((sum, aisle) => sum + aisle.inspectedBayCount, 0);
    const inspectionPercent = totalInspectionBays > 0
        ? Math.round((inspectedCount / totalInspectionBays) * 100)
        : 0;

    const filteredInspectionBays = inspectionAisleItems.filter((aisle) => {
        if (inspectionFilter === 'inspected') return aisle.isInspected;
        if (inspectionFilter === 'pending') return !aisle.isInspected;
        return true;
    });

    const defaultProductFinderProducts = () => [
        {
            id: '2x4x6-21-1',
            product: '2X4X6',
            description: 'Framing stock',
            aisle: '21',
            bay: '1',
            price: '$5.49',
            weight: '7.2 lb',
            sku: '2X4X6-21-1',
        },
        {
            id: '2x4x8-21-1',
            product: '2X4X8',
            description: 'Framing stock',
            aisle: '21',
            bay: '1',
            price: '$7.99',
            weight: '9.8 lb',
            sku: '2X4X8-21-1',
        },
        {
            id: '2x4x8-21-2',
            product: '2X4X8',
            description: 'Long framing stock',
            aisle: '21',
            bay: '2',
            price: '$7.99',
            weight: '9.8 lb',
            sku: '2X4X8-21-2',
        },
        {
            id: '2x4x10-21-2',
            product: '2X4X10',
            description: 'Heavy framing stock',
            aisle: '21',
            bay: '2',
            price: '$9.49',
            weight: '12.6 lb',
            sku: '2X4X10-21-2',
        },
    ];

    const [productFinderProducts, setProductFinderProducts] = useState(() => {
        try {
            const saved = localStorage.getItem('lumber_product_finder_inventory');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch {}
        return defaultProductFinderProducts();
    });

    useEffect(() => {
        localStorage.setItem('lumber_product_finder_inventory', JSON.stringify(productFinderProducts));
    }, [productFinderProducts]);

    const [selectedProductId, setSelectedProductId] = useState(() => {
        const first = defaultProductFinderProducts()[0];
        return first ? first.id : '';
    });

    useEffect(() => {
        if (!productFinderProducts.some((product) => product.id === selectedProductId)) {
            setSelectedProductId(productFinderProducts[0]?.id || '');
        }
    }, [productFinderProducts, selectedProductId]);

    const selectedProduct =
        productFinderProducts.find((product) => product.id === selectedProductId)
        || productFinderProducts[0]
        || {
            id: '',
            product: '',
            description: '',
            aisle: '21',
            bay: '1',
            price: '',
            weight: '',
            sku: '',
        };

    const updateSelectedProduct = (field, value) => {
        setProductFinderProducts((previous) =>
            previous.map((product) =>
                product.id === selectedProductId
                    ? { ...product, [field]: value }
                    : product,
            ),
        );
    };

    const addProductFinderProduct = () => {
        const nextId = `product-${Date.now()}`;
        const newProduct = {
            id: nextId,
            product: 'New Product',
            description: 'New inventory item',
            aisle: selectedProduct?.aisle || '21',
            bay: selectedProduct?.bay || '1',
            price: '',
            weight: '',
            sku: '',
        };
        setProductFinderProducts((previous) => [...previous, newProduct]);
        setSelectedProductId(nextId);
    };

    const deleteProductFinderProduct = () => {
        if (!selectedProductId) return;
        const remainingProducts = productFinderProducts.filter((product) => product.id !== selectedProductId);
        setProductFinderProducts(remainingProducts);
        if (remainingProducts.length > 0) {
            setSelectedProductId(remainingProducts[0].id);
        } else {
            setSelectedProductId('');
        }
    };

    const productFinderAisles = Array.from(
        new Set(productFinderProducts.map((product) => String(product.aisle || '').trim()).filter(Boolean)),
    ).sort((left, right) => Number(left) - Number(right));

    const [productFinderSortBy, setProductFinderSortBy] = useState('product');
    const [productFinderFilterBy, setProductFinderFilterBy] = useState('all');
    const [productFinderFilterValue, setProductFinderFilterValue] = useState('');
    const productFinderListRef = useRef(null);
    const productFinderItemRefs = useRef({});

    const parseWeight = (weightValue) => {
        const normalized = String(weightValue || '').toLowerCase().replace(/lb|lbs|pounds?/, '').trim();
        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
    };

    const parsePrice = (priceValue) => {
        const normalized = String(priceValue || '').replace(/[$,]/g, '').trim();
        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
    };

    const resetProductFinderFilters = () => {
        setProductFinderFilterBy('all');
        setProductFinderFilterValue('');
    };

    const getProductSortValues = (productName) => {
        const normalized = String(productName || '').trim().toUpperCase();
        const parts = normalized.split('X').map((part) => Number(String(part).replace(/[^0-9]/g, ''))).filter((part) => Number.isFinite(part));
        return parts.length > 0 ? parts : [Number.MAX_SAFE_INTEGER];
    };

    const filteredAndSortedProductFinderProducts = [...productFinderProducts]
        .filter((product) => {
            if (productFinderFilterBy === 'all') return true;
            const filterValue = String(productFinderFilterValue || '').trim().toLowerCase();
            if (!filterValue) return true;
            const fieldValue = String(product[productFinderFilterBy] || '').trim().toLowerCase();
            return fieldValue.includes(filterValue);
        })
        .sort((left, right) => {
            const sortBy = productFinderSortBy;
            if (sortBy === 'price') return parsePrice(left.price) - parsePrice(right.price);
            if (sortBy === 'weight') return parseWeight(left.weight) - parseWeight(right.weight);
            if (sortBy === 'aisle') return Number(String(left.aisle || '0')) - Number(String(right.aisle || '0'));
            if (sortBy === 'bay') return Number(String(left.bay || '0')) - Number(String(right.bay || '0'));

            const leftValues = getProductSortValues(left.product);
            const rightValues = getProductSortValues(right.product);
            const maxLength = Math.max(leftValues.length, rightValues.length);

            for (let index = 0; index < maxLength; index += 1) {
                const leftValue = leftValues[index] ?? Number.MAX_SAFE_INTEGER;
                const rightValue = rightValues[index] ?? Number.MAX_SAFE_INTEGER;
                if (leftValue !== rightValue) return leftValue - rightValue;
            }

            return String(left.product || '').localeCompare(String(right.product || ''));
        });

    useEffect(() => {
        if (filteredAndSortedProductFinderProducts.length === 0) return;
        if (filteredAndSortedProductFinderProducts.some((product) => product.id === selectedProductId)) {
            const selectedItem = productFinderItemRefs.current[selectedProductId];
            if (
                selectedItem
                && productFinderListRef.current
                && typeof selectedItem.scrollIntoView === 'function'
            ) {
                selectedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            return;
        }
        setSelectedProductId(filteredAndSortedProductFinderProducts[0].id);
    }, [filteredAndSortedProductFinderProducts, selectedProductId]);
    // Substitute Finder state
    const [subInputs, setSubInputs] = useState(() => {
        try {
            const saved = localStorage.getItem('lumber_substitute_form');
            return saved ? JSON.parse(saved) : {
                intendedUse: '',
                weather: '',
                structural: '',
            };
        } catch {
            return {
                intendedUse: '',
                weather: '',
                structural: '',
            };
        }
    });
    useEffect(() => {
        localStorage.setItem('lumber_substitute_form', JSON.stringify(subInputs));
    }, [subInputs]);

    // Substitute logic
    const getSubstitutes = () => {
        const { intendedUse, weather, structural } = subInputs;
        if (!intendedUse && !weather && !structural) return null;
        let options = [];
        if (intendedUse.toLowerCase().includes('sheathing') || intendedUse.toLowerCase().includes('roof')) {
            options.push({
                name: 'OSB (Oriented Strand Board)',
                pros: 'Lower cost, good for sheathing',
                cons: 'Swells with moisture, not as strong as CDX',
                price: 'Usually 20-30% less',
            });
            options.push({
                name: 'BC Plywood',
                pros: 'Smooth face, good for painting',
                cons: 'More expensive than CDX',
                price: '10-20% more',
            });
        }
        if (weather.toLowerCase().includes('exterior')) {
            options.push({
                name: 'Pressure Treated Plywood',
                pros: 'Weather resistant',
                cons: 'Heavier, more expensive',
                price: '20-40% more',
            });
        }
        if (structural.toLowerCase().includes('non')) {
            options.push({
                name: 'Sanded Pine',
                pros: 'Smooth, good for non-structural uses',
                cons: 'Not for load-bearing',
                price: 'Similar or slightly more',
            });
        }
        if (options.length === 0) {
            options.push({
                name: 'Alternate Dimensions',
                pros: 'Use different thickness or size',
                cons: 'May require more sheets or extra framing',
                price: 'Varies',
            });
        }
        return options;
    };
    // Persist collapse state
    useEffect(() => {
        Object.entries(collapsed).forEach(([key, val]) => {
            if (COLLAPSE_KEYS[key]) localStorage.setItem(COLLAPSE_KEYS[key], val);
            if (key === 'ai') localStorage.setItem('collapse_ai', val);
        });
    }, [collapsed]);
    // AI Assistant state
    const [aiPrompt, setAiPrompt] = useState(() => {
        try {
            return localStorage.getItem('lumber_ai_prompt') || '';
        } catch {
            return '';
        }
    });
    const [aiAnswer, setAiAnswer] = useState(() => {
        try {
            return localStorage.getItem('lumber_ai_answer') || '';
        } catch {
            return '';
        }
    });
    useEffect(() => {
        localStorage.setItem('lumber_ai_prompt', aiPrompt);
    }, [aiPrompt]);
    useEffect(() => {
        localStorage.setItem('lumber_ai_answer', aiAnswer);
    }, [aiAnswer]);

    // Simulated RAG/GPT logic (demo only)
    const handleAiAsk = () => {
        // Demo: match keywords to canned answers
        const q = aiPrompt.toLowerCase();
        if (!q.trim()) {
            setAiAnswer('');
            return;
        }
        if (q.includes('span')) {
            setAiAnswer('For a 2x10 #2 SPF joist, 16" o.c., maximum span is 15 ft 2 in (per APA span tables).');
        } else if (q.includes('screw') || q.includes('fastener')) {
            setAiAnswer('For 5/8" CDX plywood, use #8 x 2" wood screws or 8d nails, spaced 6" o.c. at panel edges (per APA, Simpson Strong-Tie).');
        } else if (q.includes('load')) {
            setAiAnswer('A single 2x6 #2 SYP can support up to 1,200 lbs uniform load over a 6 ft span (see Simpson Strong-Tie, code tables).');
        } else if (q.includes('install')) {
            setAiAnswer('Install drywall with long edges perpendicular to framing, fasten every 12" along supports. See USG installation guide.');
        } else if (q.includes('cure')) {
            setAiAnswer('Quikrete 5000 concrete sets in 10-12 hours, full cure in 28 days. Keep moist for at least 3 days. See Quikrete TDS.');
        } else {
            setAiAnswer('No direct match found. Try rephrasing or specify product, span, or code.');
        }
    };
    
    // Form state and persistence
    const [inputs, setInputs] = useState(() => {
        try {
            const saved = localStorage.getItem(COLLAPSE_KEYS.form);
            return saved ? JSON.parse(saved) : initialInputs;
        } catch {
            return initialInputs;
        }
    });
    useEffect(() => {
        localStorage.setItem(COLLAPSE_KEYS.form, JSON.stringify(inputs));
    }, [inputs]);
    const [results, setResults] = useState({});

    const layout = useLayout();
    const appBg = layout?.colors?.background;
    const appPrimaryColor = layout?.colors?.primary;
    const appSecondaryColor = layout?.colors?.secondary;
    const headerBackground = layout?.colors?.headerBackground;
    const appText = layout?.colors?.text;

    // --- LumberSelector (Dimensional Lumber Decision Engine) State ---
    const [collapsedLumberSelector, setCollapsedLumberSelector] = useState(() => collapsed.lumberSelector ?? true);
    useEffect(() => {
        setCollapsed((prev) => ({ ...prev, lumberSelector: collapsedLumberSelector }));
    }, [collapsedLumberSelector]);

    const [lumberSel, setLumberSel] = useState({
        project: '',
        structural: '',
        exposure: '',
        span: '',
        appearance: '',
        budget: '',
    });
    const [lumberRec, setLumberRec] = useState(null);
    const [lumberWarnings, setLumberWarnings] = useState([]);
    const [lumberExplanation, setLumberExplanation] = useState('');
    const [lumberNominalActual, setLumberNominalActual] = useState('');

    // Option sets
    const lumberProjects = [
        '', 'Interior wall', 'Exterior wall', 'Deck', 'Fence', 'Pergola', 'Shed', 'Workbench', 'Raised garden bed', 'Floor framing', 'Roof framing', 'Beam/header', 'Posts', 'Furniture', 'Garage shelving', 'Other'
    ];
    const lumberStructurals = [
        '', 'Decorative only', 'Light structural', 'Structural/load-bearing', 'Unsure'
    ];
    const lumberExposures = [
        '', 'Indoor dry', 'Indoor humid', 'Outdoor covered', 'Outdoor exposed', 'Ground contact'
    ];
    const lumberAppearances = [
        '', 'Hidden framing', 'Utility', 'Paint-grade', 'Stain-grade', 'Furniture-quality'
    ];
    const lumberBudgets = [
        '', 'Cheapest', 'Balanced', 'Premium'
    ];

    // Handler for form changes
    const handleLumberSelChange = e => {
        const { name, value } = e.target;
        setLumberSel(prev => ({ ...prev, [name]: value }));
        setLumberRec(null); setLumberWarnings([]); setLumberExplanation(''); setLumberNominalActual('');
    };

    // Recommendation logic (simplified, extend as needed)
    function getLumberRecommendation(sel) {
        // Example rules (expand as needed)
        if (sel.project === 'Interior wall' && sel.structural !== 'Structural/load-bearing') {
            return {
                nominalSize: '2x4',
                actualSize: '1.5" x 3.5"',
                species: 'SPF',
                grade: 'Stud',
                treatment: undefined,
                applications: ['Interior non-load-bearing walls'],
                pros: ['Inexpensive', 'Lightweight', 'Standard framing lumber'],
                cons: ['Not for exterior or long spans'],
                alternatives: ['Douglas Fir 2x4', '2x6 for taller walls'],
                warnings: ['Avoid outdoor exposure', 'Not for long unsupported spans'],
            };
        }
        if (sel.project === 'Interior wall' && sel.structural === 'Structural/load-bearing') {
            return {
                nominalSize: '2x6',
                actualSize: '1.5" x 5.5"',
                species: 'Douglas Fir or SPF',
                grade: 'Stud or #2',
                treatment: undefined,
                applications: ['Load-bearing interior walls'],
                pros: ['Stronger', 'Allows more insulation'],
                cons: ['Heavier', 'More expensive'],
                alternatives: ['2x8', 'Engineered lumber'],
                warnings: ['Check local code for load-bearing walls'],
            };
        }
        if (sel.project === 'Deck') {
            return {
                nominalSize: '2x8',
                actualSize: '1.5" x 7.25"',
                species: 'PT SYP',
                grade: '#2 or better',
                treatment: 'Pressure Treated',
                applications: ['Deck joists', 'Deck framing'],
                pros: ['Strong', 'Treated for outdoor use'],
                cons: ['Heavier', 'May warp while drying'],
                alternatives: ['2x10', '2x12'],
                warnings: ['Use Ground Contact rated for posts or below grade'],
            };
        }
        if (sel.project === 'Fence') {
            return {
                nominalSize: '4x4',
                actualSize: '3.5" x 3.5"',
                species: 'PT SYP or Cedar',
                grade: 'Post',
                treatment: 'Pressure Treated',
                applications: ['Fence posts'],
                pros: ['Rot resistant', 'Strong'],
                cons: ['Heavy', 'May split'],
                alternatives: ['Cedar', 'Redwood'],
                warnings: ['Use Ground Contact rated for posts'],
            };
        }
        if (sel.project === 'Beam/header') {
            return {
                nominalSize: 'LVL or 4x12',
                actualSize: 'Engineered or 3.5" x 11.25"',
                species: 'Engineered or Douglas Fir',
                grade: 'LVL/Glulam/#1',
                treatment: undefined,
                applications: ['Beams', 'Headers'],
                pros: ['High strength', 'Long spans'],
                cons: ['Expensive', 'Heavy'],
                alternatives: ['Double 2x12', 'Steel beam'],
                warnings: ['Consult code/engineer for sizing'],
            };
        }
        if (sel.project === 'Furniture') {
            return {
                nominalSize: '1x, 2x, hardwood',
                actualSize: 'Varies',
                species: 'Oak, Maple, Pine',
                grade: 'Select',
                treatment: undefined,
                applications: ['Furniture', 'Shelving'],
                pros: ['Attractive', 'Stable'],
                cons: ['Expensive'],
                alternatives: ['Plywood', 'MDF'],
                warnings: [],
            };
        }
        // Fallback
        let nominalSize = '2x4';
        let actualSize = '1.5" x 3.5"';
        let species = 'SPF';
        let grade = 'Stud';
        let treatment = '';
        let applications = [sel.project || 'General construction'];
        let pros = ['Widely available', 'Versatile'];
        let cons = [];
        let alternatives = ['2x6', 'Engineered lumber'];
        let warnings = [];
        if (sel.structural === 'Structural/load-bearing') {
            nominalSize = '2x6';
            actualSize = '1.5" x 5.5"';
            grade = 'Stud or #2';
            pros.push('Stronger, supports more load');
            cons.push('Heavier, more expensive');
        } else if (sel.structural === 'Light structural') {
            nominalSize = '2x4';
            actualSize = '1.5" x 3.5"';
            grade = 'Stud';
            pros.push('Lightweight, easy to handle');
        } else if (sel.structural === 'Decorative only') {
            nominalSize = '1x4';
            actualSize = '0.75" x 3.5"';
            grade = 'Select';
            pros.push('Good for trim or finish');
            cons.push('Not for structural use');
            alternatives = ['MDF', 'Pine'];
        }
        if (sel.exposure === 'Outdoor covered' || sel.exposure === 'Outdoor exposed' || sel.exposure === 'Ground contact') {
            treatment = 'Pressure Treated';
            species = 'PT SYP';
            pros.push('Weather resistant');
            if (sel.exposure === 'Ground contact') {
                warnings.push('Use Ground Contact rated lumber');
            }
        } else if (sel.exposure === 'Indoor humid') {
            pros.push('Resists moderate moisture');
        }
        if (sel.appearance === 'Paint-grade') {
            grade = 'Paint-grade';
            pros.push('Smooth, good for painting');
        } else if (sel.appearance === 'Stain-grade' || sel.appearance === 'Furniture-quality') {
            grade = 'Select';
            species = 'Pine, Oak, Maple';
            pros.push('Attractive grain, good for finish');
            cons.push('More expensive');
        } else if (sel.appearance === 'Utility') {
            grade = 'Utility';
            pros.push('Low cost');
        }
        if (sel.budget === 'Cheapest') {
            pros.push('Lowest price');
            cons.push('May have more knots or defects');
            grade = 'Utility';
        } else if (sel.budget === 'Premium') {
            grade = 'Select';
            pros.push('Best appearance, fewer defects');
            cons.push('Higher cost');
        }
        return {
            nominalSize,
            actualSize,
            species,
            grade,
            treatment: treatment || undefined,
            applications,
            pros,
            cons,
            alternatives,
            warnings,
        };
    }

    // Nominal vs Actual size helper
    function getLumberNominalActual(nominal) {
        const map = {
            '2x4': '1.5" x 3.5"',
            '2x6': '1.5" x 5.5"',
            '2x8': '1.5" x 7.25"',
            '2x10': '1.5" x 9.25"',
            '4x4': '3.5" x 3.5"',
            '4x6': '3.5" x 5.5"',
            '6x6': '5.5" x 5.5"',
        };
        return map[nominal] ? `${nominal} = ${map[nominal]}` : '';
    }

    // Explanation generator
    function getLumberExplanation(rec) {
        if (!rec) return '';
        if (rec.nominalSize === '2x4') return '2x4: Standard for interior walls. Nominal sizes are rough-cut names; actual is 1.5\" x 3.5\".';
        if (rec.nominalSize === '2x6') return '2x6: Used for load-bearing or tall walls. Allows more insulation.';
        if (rec.nominalSize === '2x8') return '2x8: Deck joists, strong for outdoor use.';
        if (rec.nominalSize === '4x4') return '4x4: Fence/garden posts. Use Ground Contact rated for below grade.';
        if (rec.nominalSize === 'LVL or 4x12') return 'LVL: Engineered for long spans. Consult code for sizing.';
        return '';
    }

    // On submit, run rules
    const handleLumberSelSubmit = e => {
        e.preventDefault();
        const rec = getLumberRecommendation(lumberSel);
        setLumberRec(rec);
        setLumberWarnings(rec && rec.warnings ? rec.warnings : []);
        setLumberExplanation(getLumberExplanation(rec));
        setLumberNominalActual(getLumberNominalActual(rec ? rec.nominalSize : ''));
    };
    

    // --- Calculators ---
    const calculate = () => {
        // Stud count estimator
        const wallLenFt = Number(inputs.wallLength);
        const studSpace = Number(inputs.studSpacing) || 16;
        const wallHeight = Number(inputs.wallHeight);
        const studCount = wallLenFt > 0 ? roundUp((wallLenFt * 12) / studSpace) + 1 : 0;
        const topBottomPlates = wallLenFt > 0 ? roundUp((wallLenFt * 2) / 8) : 0;
        const drywallSheets = wallLenFt > 0 && wallHeight > 0 ? roundUp((wallLenFt * wallHeight) / 32) : 0;
        const screws = drywallSheets * 32;
        const insulationBatts = drywallSheets;

        // Deck board estimator
        const deckLen = Number(inputs.deckLength);
        const deckWid = Number(inputs.deckWidth);
        const boardWid = Number(inputs.boardWidth);
        const deckBoards = deckLen > 0 && deckWid > 0 ? roundUp((deckLen * 12) / boardWid) * roundUp(deckWid) : 0;

        // Fence picket calculator
        const fenceLen = Number(inputs.fenceLength);
        const picketWid = Number(inputs.picketWidth);
        const pickets = fenceLen > 0 ? roundUp((fenceLen * 12) / picketWid) : 0;

        // Concrete bag calculator (assume 0.6 cu ft per 80lb bag)
        const concreteVol = Number(inputs.concreteVolume);
        const concreteBags = concreteVol > 0 ? roundUp(concreteVol / 0.6) : 0;

        // Plywood sheet optimizer
        const area = Number(inputs.areaToCover);
        const plyArea = Number(inputs.plywoodLength) * Number(inputs.plywoodWidth);
        const plywoodSheets = area > 0 && plyArea > 0 ? roundUp(area / plyArea) : 0;

        // Roofing square calculator (1 square = 100 sq ft)
        const roofArea = Number(inputs.roofArea);
        const roofingSquares = roofArea > 0 ? roundUp(roofArea / 100) : 0;

        // Drywall takeoff helper
        const drywallArea = Number(inputs.drywallArea);
        const drywallTakeoff = drywallArea > 0 ? roundUp(drywallArea / 32) : 0;

        setResults({
            studCount,
            topBottomPlates,
            drywallSheets,
            screws,
            insulationBatts,
            deckBoards,
            pickets,
            concreteBags,
            plywoodSheets,
            roofingSquares,
            drywallTakeoff,
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInputs((prev) => ({ ...prev, [name]: value }));
    };
    const CalculatorToolkit = ({ appPrimaryColor, appText, appSecondaryColor }) => {
        // Collapsible state for History and Tips
        const [showHistory, setShowHistory] = useState(true);
        const [showTips, setShowTips] = useState(true);
        const [showFractionCompare, setShowFractionCompare] = useState(true);
        const [selectedPlywoodThickness, setSelectedPlywoodThickness] = useState('3/4');
        const [fractionCompareInputs, setFractionCompareInputs] = useState({
            baseMaterial: '3/4',
            comparisonMaterial: '11/16',
        });
        const commonPlywoodThicknesses = ['1/8', '3/16', '1/4', '9/32', '5/16', '11/32', '3/8', '13/32', '7/16', '15/32', '1/2', '17/32', '9/16', '19/32', '5/8', '21/32', '11/16', '23/32', '3/4', '25/32', '13/16', '27/32', '7/8', '29/32', '15/16', '31/32', '1'];
        const thicknessListRef = useRef(null);
        const thicknessRefs = useRef({});

        useEffect(() => {
            if (!selectedPlywoodThickness || !thicknessListRef.current) return;

            const selectedNode = thicknessRefs.current[selectedPlywoodThickness];
            if (!selectedNode) return;

            selectedNode.scrollIntoView({
                block: 'nearest',
                inline: 'nearest',
                behavior: 'smooth',
            });
        }, [selectedPlywoodThickness]);

        // Handler to clear history
        const handleClearHistory = () => {
            setHistory([]);
            localStorage.removeItem('calc_toolkit_history');
        };

        const parseFractionMeasurement = (rawValue) => {
            const normalizedValue = String(rawValue || '')
                .replace(/inches|inch/gi, '')
                .replace(/"/g, '')
                .trim();

            if (!normalizedValue) return null;

            if (/^\d*\.?\d+$/.test(normalizedValue)) {
                return Number(normalizedValue);
            }

            const mixedFractionMatch = normalizedValue.match(/^(\d+)\s+(\d+)\/(\d+)$/);
            if (mixedFractionMatch) {
                const wholeNumber = Number(mixedFractionMatch[1]);
                const numerator = Number(mixedFractionMatch[2]);
                const denominator = Number(mixedFractionMatch[3]);
                if (denominator === 0) return null;
                return wholeNumber + (numerator / denominator);
            }

            const fractionMatch = normalizedValue.match(/^(\d+)\/(\d+)$/);
            if (fractionMatch) {
                const numerator = Number(fractionMatch[1]);
                const denominator = Number(fractionMatch[2]);
                if (denominator === 0) return null;
                return numerator / denominator;
            }

            return null;
        };

        const formatFractionMeasurement = (value) => {
            if (typeof value !== 'number' || Number.isNaN(value)) return '';

            const wholeNumber = Math.trunc(value);
            const fractionalPart = value - wholeNumber;
            const roundedThirtySeconds = Math.round(fractionalPart * 32);

            if (roundedThirtySeconds === 32) {
                return `${wholeNumber + 1}"`;
            }

            if (roundedThirtySeconds === 0) {
                return wholeNumber === 0 ? '0"' : `${wholeNumber}"`;
            }

            const gcd = (left, right) => (right === 0 ? left : gcd(right, left % right));
            const divisor = gcd(roundedThirtySeconds, 32);
            const numerator = roundedThirtySeconds / divisor;
            const denominator = 32 / divisor;

            if (wholeNumber === 0) {
                return `${numerator}/${denominator}"`;
            }

            return `${wholeNumber} ${numerator}/${denominator}"`;
        };

        const handleFractionCompareChange = (event) => {
            const { name, value } = event.target;
            setSelectedPlywoodThickness(value);
            setFractionCompareInputs((previousState) => ({
                ...previousState,
                [name]: value,
            }));
        };

        const baseMaterialValue = parseFractionMeasurement(fractionCompareInputs.baseMaterial);
        const comparisonMaterialValue = parseFractionMeasurement(fractionCompareInputs.comparisonMaterial);
        const canCompareFractions = baseMaterialValue !== null && comparisonMaterialValue !== null;
        const fractionDifference = canCompareFractions ? Math.abs(baseMaterialValue - comparisonMaterialValue) : null;

        let fractionCompareSummary = '';
        let fractionCompareOverlap = '';
        if (canCompareFractions) {
            if (baseMaterialValue === comparisonMaterialValue) {
                fractionCompareSummary = 'Both measurements are the same size.';
                fractionCompareOverlap = 'There is no extra overlap between the two sizes.';
            } else if (comparisonMaterialValue > baseMaterialValue) {
                fractionCompareSummary = `Comparison material is larger by ${formatFractionMeasurement(fractionDifference)}.`;
                fractionCompareOverlap = `Yes. It will overhang the base material by ${formatFractionMeasurement(fractionDifference)}.`;
            } else {
                fractionCompareSummary = `Base material is larger by ${formatFractionMeasurement(fractionDifference)}.`;
                fractionCompareOverlap = `No. The comparison material is short by ${formatFractionMeasurement(fractionDifference)}.`;
            }
        }
        // Advanced function prompt state
        const [funcPrompt, setFuncPrompt] = useState(null); // {name: string, params: string[], values: string[]}

        // Map of advanced functions and their parameter names
        const funcParams = {
            area: ['length', 'width'],
            vol: ['length', 'width', 'height'],
            pitch: ['rise', 'run'],
            run: ['rise', 'pitch (deg)'],
        };

        const advancedMathFunctions = {
            area: (length, width) => length * width,
            vol: (length, width, height) => length * width * height,
            pitch: (rise, runDistance) => Math.atan(rise / runDistance) * (180 / Math.PI),
            run: (rise, pitchDegrees) => rise / Math.tan((pitchDegrees * Math.PI) / 180),
        };

        // Handler for submitting advanced function parameters
        const handleFuncSubmit = (e) => {
            e.preventDefault();
            if (!funcPrompt) return;
            const args = funcPrompt.values.join(',');
            //setDisplay(prev => (typeof prev === 'string' ? prev + `${funcPrompt.name}(${args})` : `${funcPrompt.name}(${args})`));
            setFuncPrompt(null);
                // Parse feet/inch expressions before evaluating safely
                const currentDisplay = (typeof display === 'string' ? display + `${funcPrompt.name}(${args})` : `${funcPrompt.name}(${args})`);
                const parsed = parseFeetInch(currentDisplay);
                const result = evaluateMathExpression(parsed, advancedMathFunctions);
                if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) throw new Error('Invalid result');
                // Always show only formatted ft/in string if input contains feet/inch
                let resultDisplay;
                if (display.includes("'") || display.includes('"') || /\u2032|\u2033/.test(display)) {
                    const ftin = formatFeetInches(result);
                    resultDisplay = ftin ? ftin : result.toString();
                } else {
                    resultDisplay = result.toString();
                }
                setHistory(h => [...h, `${display} = ${resultDisplay}`].slice(-10));
                setDisplay(resultDisplay);
        };

        // Handler for changing advanced function parameter values
        const handleFuncParamChange = (idx, value) => {
            setFuncPrompt(fp => ({ ...fp, values: fp.values.map((v, i) => i === idx ? value : v) }));
        };

        // State for calculator
        const [display, setDisplay] = useState('');
        const [memory, setMemory] = useState(0);
        const [history, setHistory] = useState(() => {
            try {
                const saved = localStorage.getItem('calc_toolkit_history');
                return saved ? JSON.parse(saved) : [];
            } catch {
                return [];
            }
        });

        useEffect(() => {
            localStorage.setItem('calc_toolkit_history', JSON.stringify(history));
        }, [history]);

        // --- Feet/Inch Parser ---
        // Converts expressions like 10' + 12" or 8' 6" to feet as a number
        function parseFeetInch(expr) {
            // Replace Unicode feet/inch with ASCII for easier parsing
            let s = expr.replace(/\u2032/g, "'").replace(/\u2033/g, '"');
            // Replace e.g. 8.5' 6.25" or 8.5'6.25" with (8.5 + 6.25/12)
            s = s.replace(/([0-9]*\.?[0-9]+)\s*'\s*([0-9]*\.?[0-9]+)(?:\s*"|\s*in)?/g, (m, ft, inch) => `(${ft} + ${inch}/12)`);
            // Replace e.g. 8.5' with (8.5)
            s = s.replace(/([0-9]*\.?[0-9]+)\s*'(?!\s*[0-9])/g, (m, ft) => `(${ft})`);
            // Replace e.g. 6.25" with (6.25/12)
            s = s.replace(/([0-9]*\.?[0-9]+)\s*"/g, (m, inch) => `(${inch}/12)`);
            return s;
        }

        // Format decimal feet to feet/inches string
        function formatFeetInches(val) {
            if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) return '';
            const feet = Math.trunc(val);
            let inches = (val - feet) * 12;
            // Round to nearest 1/16th inch for practical display
            const sixteenths = Math.round(inches * 16);
            const wholeInches = Math.floor(sixteenths / 16);
            const remainderSixteenths = sixteenths % 16;
            let inchStr = '';
            if (remainderSixteenths === 0) {
                inchStr = `${wholeInches}`;
            } else {
                inchStr = `${wholeInches} ${remainderSixteenths}/16`;
            }
            // Only show inches if not zero
            if (wholeInches === 0 && remainderSixteenths === 0) {
                return `${feet}'`;
            } else if (remainderSixteenths === 0) {
                return `${feet}'${wholeInches}\"`;
            } else {
                return `${feet}'${inchStr}\"`;
            }
        }

        // Button handler
        const handleButton = (val) => {
            if (val === 'C') {
                setDisplay('');
            } else if (val === '⌫') {
                setDisplay(prev => (typeof prev === 'string' ? prev.slice(0, -1) : ''));
            } else if (val === '=') {
                try {
                    // Parse feet/inch expressions before evaluating safely
                    const parsed = parseFeetInch(display);
                    const result = evaluateMathExpression(parsed, advancedMathFunctions);
                    if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) throw new Error('Invalid result');
                    // Always show only formatted ft/in string if input contains feet/inch
                    let resultDisplay;
                    if (display.includes("'") || display.includes('"') || /\u2032|\u2033/.test(display)) {
                        const ftin = formatFeetInches(result);
                        resultDisplay = ftin ? ftin : result.toString();
                    } else {
                        resultDisplay = result.toString();
                    }
                    setHistory(h => [...h, `${display} = ${resultDisplay}`].slice(-10));
                    setDisplay(resultDisplay);
                } catch {
                    setDisplay('Err');
                }
            } else if (val === 'M+') {
                try { setMemory(memory + Number(display) || 0); } catch { }
            } else if (val === 'M-') {
                try { setMemory(memory - Number(display) || 0); } catch { }
            } else if (val === 'MR') {
                setDisplay(memory.toString());
            } else if (val === 'MC') {
                setMemory(0);
            } else {
                // Prevent [object Object] by always concatenating as string
                setDisplay(prev => (typeof prev === 'string' ? prev + val : val));
            }
        };

        // Button layout
        const buttons = [
            ['7', '8', '9', '/', '('],
            ['4', '5', '6', '*', ')'],
            ['1', '2', '3', '-', '^'],
            ['0', '.', '⌫', '+', 'C'],
            ['M+', 'M-', 'MR', 'MC', '='],
            [`'`, '"', 'π', '√', 'vol'],
            ['area', 'pitch', 'run'],
            ['ft→in', 'in→ft'],
            ['m→ft', 'ft→m'],
            ['in→mm', 'mm→in']
        ];

        // Special handlers
        const handleSpecial = (val) => {
            if (val === 'π') setDisplay(display + Math.PI.toFixed(8));
            else if (val === '√') setDisplay(display + 'Math.sqrt(');
            else if (['area', 'vol', 'pitch', 'run'].includes(val)) {
                setFuncPrompt({
                    name: val,
                    params: funcParams[val],
                    values: funcParams[val].map(() => ''),
                });
            }
            else if (val === "'") setDisplay(display + "\u2032"); // feet symbol
            else if (val === '"') setDisplay(display + "\u2033"); // inch symbol
            else if (val === 'ft→in') setDisplay(display + '*12');
            else if (val === 'in→ft') setDisplay(display + '/12');
            else if (val === 'm→ft') setDisplay(display + '*3.28084');
            else if (val === 'ft→m') setDisplay(display + '*0.3048');
            else if (val === 'in→mm') setDisplay(display + '*25.4');
            else if (val === 'mm→in') setDisplay(display + '/25.4');
            else handleButton(val);
        };

        // Custom functions for eval
        window.area = (l, w) => Number(l) * Number(w);
        window.vol = (l, w, h) => Number(l) * Number(w) * Number(h);
        window.pitch = (rise, run) => Math.atan(Number(rise) / Number(run)) * 180 / Math.PI;
        window.run = (rise, pitch) => Number(rise) / Math.tan(Number(pitch) * Math.PI / 180);
        const getButtonColor = (b, i) => {
            return (b === '⌫')
                ? 'bg-red flex6Column'
                : (b === 'C')
                    ? 'bg-dkYellow flex6Column'
                    : (b === '+' || b === '-' || b === '*' || b === '/')
                        ? 'bg-purple flex6Column'
                        : (b === '=')
                            ? 'bg-dkGreen flex6Column'
                            : (b.substring(0, 1) === 'M')
                                ? 'bg-tintedMedium flex6Column'
                                : (i > 32)
                                    ? 'bg-blue flex3Column'
                                    : (i > 28)
                                        ? 'bg-orange flex5Column'
                                        : (i > 24)
                                            ? 'bg-brown flex5Column'
                                            : 'flex6Column bg-lite'
        }
        return (
            <div className='containerDetail' style={{ color: appText }}>
                {/* Advanced function parameter prompt */}
                {funcPrompt && (
                    <div className='containerDetail bg-lite mb-10' style={{ color: appPrimaryColor, border: '2px solid orange', borderRadius: 8 }}>
                        <form
                            onSubmit={handleFuncSubmit}
                            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
                            className=''
                        >
                            <div className='containerDetail p-10 size20'>
                                Enter parameters for <span style={{ color: appSecondaryColor }}>{funcPrompt.name}()</span>:
                            </div>
                            <div className='containerDetail p-10 width-100-percent'>
                                {funcPrompt.params.map((p, i) => (
                                    <label
                                        key={p}
                                        className='flexContainer size20'
                                    >
                                        <div className='flex9Column contentRight pr-10 pt-5' style={{ color: appSecondaryColor }}>
                                            {p}:
                                        </div>
                                        <input
                                            type='number'
                                            step='any'
                                            value={funcPrompt.values[i]}
                                            onChange={e => handleFuncParamChange(i, e.target.value)}
                                            className='containerDetail flex2Column mr-5'
                                            style={{ color: appText }}
                                            required
                                        />
                                    </label>
                                ))}
                            </div>
                            <div className='containerDetail flexContainer mt-10'>
                                <button
                                    type='submit'
                                    className='containerDetail bg-dkGreen p-10 flex2Column ml--1'
                                    style={{ minWidth: 80, color: appPrimaryColor }}
                                >
                                    Insert
                                </button>
                                <button
                                    type='button'
                                    className='containerDetail bg-red p-10 flex2Column'
                                    style={{ minWidth: 80, color: appPrimaryColor }}
                                    onClick={() => setFuncPrompt(null)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                <div className='containerDetail bg-dark p-10 mb-10' style={{ color: appPrimaryColor, fontSize: 24, minHeight: 40 }} aria-label='Calculator display' tabIndex={0}>
                    {display || '0'}
                </div>
                <div className='flexContainer' style={{ flexWrap: 'wrap' }}>
                    {buttons.flat().map((b, i) => (
                        <button
                            key={b + i}
                            className={`containerDetail bold pt-10 pb-10 m-2 size20 ${getButtonColor(b, i)}`}
                            style={{ minHeight: 45, color: appPrimaryColor }}
                            onClick={() => handleSpecial(b)}
                            aria-label={b}
                        >
                            {b}
                        </button>
                    ))}
                </div>
                <div className='mt-10' style={{ color: appSecondaryColor }}>
                    <b style={{color: appPrimaryColor}}>Memory:</b> {memory}
                </div>
                <div className='containerDetail p-10 mt-10' style={{ color: appPrimaryColor }}>
                    <div onClick={() => setShowFractionCompare(v => !v)} className='flexContainer'>
                        <div className='flex2Column contentLeft size20 pt-10 pb-10'>
                            <span style={{ fontSize: 18, margin: 5 }}>
                                {showFractionCompare ? '▼' : '▶'}
                            </span>
                            <b style={{ color: appPrimaryColor }}>Fraction Compare:</b>
                        </div>
                    </div>
                    {showFractionCompare && (
                        <div className='containerDetail p-10'>
                            <div className='flexContainer mb-10'>
                                <div className='flex2Column mr-5'>
                                    <label>
                                        Base Material Thickness
                                        <input
                                            className='containerDetail mt-5 width-100-percent size20'
                                            style={{ color: appText }}
                                            name='baseMaterial'
                                            value={fractionCompareInputs.baseMaterial}
                                            onChange={handleFractionCompareChange}
                                            type='text'
                                            placeholder='e.g. 3/4 or 1 1/8'
                                            aria-label='Base material thickness'
                                        />
                                    </label>
                                </div>
                                <div className='flex2Column'>
                                    <label>
                                        Comparison Material Size
                                        <input
                                            className='containerDetail mt-5 width-100-percent size20'
                                            style={{ color: appText }}
                                            name='comparisonMaterial'
                                            value={fractionCompareInputs.comparisonMaterial}
                                            onChange={handleFractionCompareChange}
                                            type='text'
                                            placeholder='e.g. 11/16'
                                            aria-label='Comparison material size'
                                        />
                                    </label>
                                </div>
                            </div>
                            <div className='size14 mb-10' style={{ color: appSecondaryColor }}>
                                Enter decimals, fractions, or mixed fractions such as 0.75, 3/4, or 1 1/8.
                            </div>
                            {!canCompareFractions && (
                                <div className='containerDetail p-10 bg-dark size18' style={{ color: appSecondaryColor }}>
                                    Enter valid fraction values in both fields to compare sizes.
                                </div>
                            )}
                            {canCompareFractions && (
                                <div className='containerDetail p-10 bg-dark size18'>
                                    <div className='mb-5'>
                                        <b style={{ color: appPrimaryColor }}>Base Material:</b> {formatFractionMeasurement(baseMaterialValue)} <span style={{ color: appSecondaryColor }}>({baseMaterialValue.toFixed(4)}")</span>
                                    </div>
                                    <div className='mb-5'>
                                        <b style={{ color: appPrimaryColor }}>Comparison Material:</b> {formatFractionMeasurement(comparisonMaterialValue)} <span style={{ color: appSecondaryColor }}>({comparisonMaterialValue.toFixed(4)}")</span>
                                    </div>
                                    <div className='mb-5'>
                                        <b style={{ color: appPrimaryColor }}>Difference:</b> {formatFractionMeasurement(fractionDifference)} <span style={{ color: appSecondaryColor }}>({fractionDifference.toFixed(4)}")</span>
                                    </div>
                                    <div className='mb-5' style={{ color: appSecondaryColor }}>
                                        {fractionCompareSummary}
                                    </div>
                                    <div style={{ color: appPrimaryColor, fontWeight: 'bold' }}>
                                        {fractionCompareOverlap}
                                    </div>
                                </div>
                            )}

                            <div className='containerDetail mt-15 p-10 bg-dark' style={{ border: `1px solid ${appSecondaryColor}`, borderRadius: 10 }}>
                                <div className='flexContainer' style={{ gap: 12, alignItems: 'stretch' }}>
                                    <div className='containerDetail flex2Column' style={{ minWidth: 180 }}>
                                        <div className='containerDetail size20 mb-5 p-10 bg-orange color-dark'>
                                            {selectedPlywoodThickness}
                                        </div>
                                        <div className='mb-8'>
                                            <input
                                                type='range'
                                                min={0}
                                                max={commonPlywoodThicknesses.length - 1}
                                                value={commonPlywoodThicknesses.indexOf(selectedPlywoodThickness)}
                                                onChange={(event) => setSelectedPlywoodThickness(commonPlywoodThicknesses[Number(event.target.value)])}
                                                style={{ width: '100%' }}
                                                aria-label='Select plywood thickness'
                                            />
                                        </div>
                                        <div ref={thicknessListRef} className='containerDetail ht-150 scroll'>
                                            {commonPlywoodThicknesses.map((option) => {
                                                const optionValue = parseFractionMeasurement(option);
                                                const isSelected = option === selectedPlywoodThickness;
                                                const delta = optionValue !== null && parseFractionMeasurement(selectedPlywoodThickness) !== null
                                                    ? Math.abs(parseFractionMeasurement(selectedPlywoodThickness) - optionValue)
                                                    : null;

                                                return (
                                                    <div
                                                        key={option}
                                                        ref={(node) => {
                                                            if (node) {
                                                                thicknessRefs.current[option] = node;
                                                            }
                                                        }}
                                                        onClick={() => setSelectedPlywoodThickness(option)}
                                                        className='containerDetail mb-5 width-100-percent'
                                                        style={{
                                                            background: isSelected ? appPrimaryColor : 'rgba(255,255,255,0.04)',
                                                            color: isSelected ? '#121212' : appText,
                                                            border: isSelected ? `2px solid ${appSecondaryColor}` : '1px solid rgba(255,255,255,0.12)',
                                                            borderRadius: 8,
                                                            padding: '8px 10px',
                                                            textAlign: 'left',
                                                            cursor: 'pointer',
                                                            fontWeight: isSelected ? 'bold' : 'normal'
                                                        }}
                                                    >
                                                        <div className='flexContainer'>
                                                            <span>{option}</span>
                                                            {delta !== null && option !== selectedPlywoodThickness && (
                                                                <span style={{ marginLeft: 'auto', fontSize: 12 }}>
                                                                    {delta === 0 ? 'exact' : `±${formatFractionMeasurement(delta)}`}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className='flex3Column'>
                                        <div className='containerDetail size20 m-5 p-10 bg-orange color-dark'>
                                            Comparisons
                                        </div>
                                        <div className='containerDetail p-10' style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                                            {(() => {
                                                const selectedValue = parseFractionMeasurement(selectedPlywoodThickness);
                                                const closestMatches = commonPlywoodThicknesses
                                                    .map((option) => {
                                                        const optionValue = parseFractionMeasurement(option);
                                                        if (optionValue === null || option === selectedPlywoodThickness || selectedValue === null) {
                                                            return null;
                                                        }
                                                        return {
                                                            label: option,
                                                            value: optionValue,
                                                            delta: Math.abs(optionValue - selectedValue),
                                                            isSmaller: optionValue < selectedValue,
                                                        };
                                                    })
                                                    .filter(Boolean)
                                                    .sort((a, b) => a.delta - b.delta)
                                                    .slice(0, 5);

                                                const maxDelta = closestMatches.length ? Math.max(...closestMatches.map((match) => match.delta)) : 0;

                                                return closestMatches.length ? closestMatches.map((match) => {
                                                    const barWidth = maxDelta > 0 ? Math.max((1 - (match.delta / maxDelta)) * 100, 10) : 100;
                                                    const textColor = match.isSmaller ? appSecondaryColor : appPrimaryColor;
                                                    const differenceText = `${match.isSmaller ? 'short by' : 'larger by'} ${formatFractionMeasurement(match.delta)}`;

                                                    return (
                                                        <div key={match.label} className='mb-10'>
                                                            <div className='flexContainer size14 mb-4'>
                                                                <span style={{ color: appText, fontWeight: 'bold' }}>{match.label}</span>
                                                                <span style={{ marginLeft: 'auto', color: textColor }}>{differenceText}</span>
                                                            </div>
                                                            <div style={{ height: 10, background: 'rgba(255,255,255,0.10)', borderRadius: 999, overflow: 'hidden' }}>
                                                                <div
                                                                    style={{
                                                                        width: `${barWidth}%`,
                                                                        height: '100%',
                                                                        background: match.isSmaller ? appSecondaryColor : appPrimaryColor,
                                                                        borderRadius: 999,
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                }) : (
                                                    <div style={{ color: appSecondaryColor }}>
                                                        Select a thickness to compare nearby sizes.
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>
                                {/*
                                    <div className='containerDetail p-10' style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, color: appText }}>
                                        <b style={{ color: appPrimaryColor }}>Example:</b> for <span style={{ color: appSecondaryColor }}>3/4</span>, <span style={{ color: appSecondaryColor }}>11/16</span> is short by <span style={{ color: appPrimaryColor }}>1/16</span>, and <span style={{ color: appSecondaryColor }}>13/16</span> is <span style={{ color: appPrimaryColor }}>1/16</span> larger. In 32nds, <span style={{ color: appSecondaryColor }}>23/32</span> is short by <span style={{ color: appPrimaryColor }}>1/32</span>, and <span style={{ color: appSecondaryColor }}>25/32</span> is <span style={{ color: appPrimaryColor }}>1/32</span> larger.
                                    </div>
                                */}
                            </div>
                        </div>
                    )}
                </div>
                {/* Collapsible History Section */}
                <div className='containerDetail p-10 mt-10' style={{ color: appPrimaryColor }}>
                    <div onClick={() => setShowHistory(v => !v)} className='flexContainer'>
                        <div className='flex2Column contentLeft size20 pt-10 pb-10'>
                            <span style={{ fontSize: 18, margin: 5 }}>
                                {showHistory ? '▼' : '▶'}
                            </span>
                            <b style={{color: appPrimaryColor}}>History:</b>
                        </div>
                        <div className='flex2Column contentRight p-10'>
                            {showHistory && (
                                <button className='containerDetail bg-lite color-lite bold p-5 size14 ml-10' style={{ minWidth: 60 }} onClick={e => { e.stopPropagation(); handleClearHistory(); }}>Clear</button>
                            )}
                        </div>
                    </div>
                    {showHistory && (
                        <ul className='containerDetail pl-20 ht-100 scroll' style={{ color: appText }}>
                            {history.map((h, i) => (
                                <li key={i} style={{ fontSize: 14 }}>{h}</li>
                            ))}
                        </ul>
                    )}
                </div>
                {/* Collapsible Tips Section */}
                <div className='containerBox mt-10 size12' style={{ color: appText }}>
                    <div
                        className='size20 pt-10 pb-10'
                        style={{ display: 'flex', cursor: 'pointer', color: appPrimaryColor, userSelect: 'none', alignItems: 'center' }}
                        onClick={() => setShowTips(v => !v)}
                    >
                        <span className='mr-10' style={{ fontSize: 18 }}>
                            {showTips ? '▼' : '▶'}
                        </span>
                        <b style={{ color: appPrimaryColor }}>
                            Tips:
                        </b>
                    </div>
                    {showTips && (
                        <div className='containerDetail p-10 size12 scroll' style={{ color: appText, maxHeight: 100 }}>
                            Use <b style={{color: appPrimaryColor}}>'</b> for feet, <b style={{color: appPrimaryColor}}>"</b> for inches.
                            <br />Try: <code>8'+6"</code> or <code>area(12,16)</code>or <code>pitch(6,12)</code>.
                            <div className='flexContainer mt-5'>
                                <div className='flex2Column contentRight mr-5' style={{ color: appPrimaryColor }}>
                                    <b style={{color: appPrimaryColor}}>area(l,w)</b>: Area, <b style={{color: appPrimaryColor}}>vol(l,w,h)</b>:
                                </div>
                                <div className='flex2Column contentLeft'>
                                    Volume
                                </div>
                            </div>
                            <div className='flexContainer'>
                                <div className='flex2Column contentRight mr-5' style={{ color: appPrimaryColor }}>
                                    <b style={{color: appPrimaryColor}}>pitch(rise,run)</b>:
                                </div>
                                <div className='flex2Column contentLeft'>
                                    Roof pitch (deg),
                                </div>
                            </div>
                            <div className='flexContainer'>
                                <div className='flex2Column contentRight mr-5' style={{ color: appPrimaryColor }}>
                                    <b style={{color: appPrimaryColor}}>run(rise,pitch)</b>:
                                </div>
                                <div className='flex2Column contentLeft'>
                                    Run from rise & pitch.
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div
            className='containerDetail bg-lite contentLeft mt--25'
            style={{ background: appBg, color: appText }}
        >
            <div
                className='containerDetail p-20 size25'
                style={{ background: headerBackground, color: appPrimaryColor }}
            >
                <h2>
                    Building Materials Assistant
                </h2>
                <p
                    className='color-orange copyright mt--15 lh-10'
                    style={{ color: appSecondaryColor }}
                >
                    Quick estimators for deck boards, fence pickets, concrete, studs, plywood, roofing, drywall, and more.
                </p>
            </div>

            <div
                className='containerDetail p-20 size20 mt-5'
                style={{ background: headerBackground, color: appPrimaryColor, cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleCollapse('inspection')}
            >
                <h3 style={{ display: 'flex', alignItems: 'center', margin: 0 }}>
                    <span style={{ marginRight: 8 }}>{collapsed.inspection ? '▶' : '▼'}</span>Inspection
                </h3>
            </div>
            {!collapsed.inspection && (
                <div className='containerDetail mt-5 p-15'>
                    <div className='flexContainer centerVertical' style={{ gap: 10, flexWrap: 'wrap' }}>
                        <label className='size15' style={{ color: appText }}>
                            Inspection view
                            <select
                                className='containerDetail mt-5 ml--5 width-100-percent size20'
                                value={inspectionFilter}
                                onChange={(event) => setInspectionFilter(event.target.value)}
                                aria-label='Filter inspection bays'
                                style={{ color: appText }}
                            >
                                <option value='all'>All Bays</option>
                                <option value='pending'>Pending Only</option>
                                <option value='inspected'>Inspected Only</option>
                            </select>
                        </label>
                        <div className='containerDetail p-10 size15' style={{ color: appText }}>
                            Inspected: <b style={{ color: appPrimaryColor }}>{inspectedCount}/{totalInspectionBays}</b> ({inspectionPercent}%)
                        </div>
                        <button
                            type='button'
                            className='containerDetail button p-10 size15 bg-dkRed color-lite'
                            onClick={clearInspectionState}
                            aria-label='Reset all inspection acknowledgements'
                        >
                            Reset Inspection
                        </button>
                    </div>

                    <div className='containerDetail mt-5 p-10' style={{ borderRadius: 8 }}>
                        <div className='size12' style={{ color: appText, marginBottom: 8 }}>
                            Visual bay map: select each bay to acknowledge inspection.
                        </div>
                        <div className='containerDetail p-10 mb-5 contentCenter bold size15' style={{ color: appPrimaryColor }}>
                            Panel Saw / Main Aisle
                        </div>

                        <div
                            role='group'
                            aria-label='Inspection bay map'
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: 10,
                            }}
                        >
                            {filteredInspectionBays.map((aisle) => {
                                const checklistNumbers = Array.from({ length: aisle.bayCount }, (_, index) => index + 1);
                                return (
                                    <div
                                        key={aisle.id}
                                        className='containerDetail p-10 contentLeft'
                                        aria-label={`Aisle ${aisle.id}, ${aisle.isInspected ? 'inspected' : 'pending'}`}
                                        style={{
                                            border: aisle.isInspected ? '2px solid #2e7d32' : '2px solid #f57c00',
                                            background: aisle.isInspected ? '#e8f5e9' : '#fff8e1',
                                            color: '#222',
                                            minHeight: 106,
                                        }}
                                    >
                                        <div className='flexContainer centerVertical'>
                                            <div className='containerDetail p-5 size20 bold' style={{ background: '#ff6f00', color: '#fff', minWidth: 42, textAlign: 'center', borderRadius: 6 }}>
                                                {aisle.id}
                                            </div>
                                            <div className='ml-10 size12 bold' style={{ color: aisle.isInspected ? '#1b5e20' : '#e65100' }}>
                                                {aisle.isInspected ? 'Inspected' : 'Pending'}
                                            </div>
                                            <button
                                                type='button'
                                                className='button containerDetail p-5 size15 ml-10'
                                                aria-label={`Edit aisle ${aisle.id}`}
                                                title='Edit aisle label and bay count'
                                                onClick={() => setAisleEditMode(aisle.id, !aisle.isEditing)}
                                                style={{ marginLeft: 'auto' }}
                                            >
                                                ✏️
                                            </button>
                                        </div>

                                        {aisle.isEditing ? (
                                            <div className='mt-5'>
                                                <label className='size12'>
                                                    Aisle label
                                                    <input
                                                        className='inputField mt-5 p-5 size12 r-10 width-100-percent'
                                                        value={aisle.label}
                                                        onChange={(event) => updateInspectionAisleLabel(aisle.id, event.target.value)}
                                                        aria-label={`Aisle ${aisle.id} label`}
                                                    />
                                                </label>
                                                <label className='size12 mt-5' style={{ display: 'block' }}>
                                                    Bay count
                                                    <input
                                                        type='number'
                                                        min={0}
                                                        className='inputField mt-5 p-5 size12 r-10 width-100-percent'
                                                        value={aisle.bayCount}
                                                        onChange={(event) => updateInspectionAisleBayCount(aisle.id, event.target.value)}
                                                        aria-label={`Aisle ${aisle.id} bay count`}
                                                    />
                                                </label>
                                            </div>
                                        ) : (
                                            <div className='mt-5 size12' style={{ lineHeight: 1.2 }}>
                                                {aisle.label}
                                            </div>
                                        )}

                                        <div className='mt-5 size12' style={{ color: '#555' }}>
                                            {aisle.bayCount > 0
                                                ? `${aisle.inspectedBayCount}/${aisle.bayCount} bays inspected`
                                                : 'Set bay count to generate checklist'}
                                        </div>

                                        {aisle.bayCount > 0 && (
                                            <div className='containerDetail mt-5 p-5  bg-dark' style={{ maxHeight: 160, overflowY: 'auto' }}>
                                                {checklistNumbers.map((bayNumber) => {
                                                    const bayKey = String(bayNumber);
                                                    const isChecked = Boolean(aisle.bays[bayKey]);
                                                    const inspectedAt = aisle.bays[bayKey]?.inspectedAt;
                                                    return (
                                                        <label key={`${aisle.id}-${bayKey}`} className='flexContainer centerVertical p-5 button' style={{ gap: 8 }}>
                                                            <input
                                                                type='checkbox'
                                                                checked={isChecked}
                                                                onChange={() => toggleInspectionChecklistBay(aisle.id, bayNumber)}
                                                                aria-label={`Aisle ${aisle.id} bay ${bayNumber} inspected`}
                                                            />
                                                            <span className='size12 color-yellow'>Bay {bayNumber}</span>
                                                            <span className='size10 color-orange' style={{ marginLeft: 'auto'}}>
                                                                {isChecked && inspectedAt ? new Date(inspectedAt).toLocaleTimeString() : 'Pending'}
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className='containerDetail mt-5 p-10 contentCenter bold size15' style={{ color: appPrimaryColor }}>
                            Checkouts / Front Aisle
                        </div>
                    </div>
                </div>
            )}

            {/* Calculator Toolkit Section */}
            <div
                className='containerDetail p-20 size20 mt-5'
                style={{ background: headerBackground, color: appPrimaryColor, cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleCollapse('toolkit')}
            >
                <h3 style={{ display: 'flex', alignItems: 'center', margin: 0 }}>
                    <span style={{ marginRight: 8 }}>{collapsed.toolkit ? '▶' : '▼'}</span>Calculator Toolkit
                </h3>
            </div>
            {!collapsed.toolkit && (
                <div className='mt-5'>
                    {/*
                    <p className='color-soft p-20' style={{ color: appText }}>
                        <b style={{color: appPrimaryColor}}>Professional Grade Construction Calculator</b><br/>
                        Use this toolkit for advanced construction math: feet/inch conversions, rise/run, roof pitch, compound angles, volume, area, and more. Includes memory, history, and scientific functions.
                    </p>
                    */}
                    <CalculatorToolkit appPrimaryColor={appPrimaryColor} appText={appText} appSecondaryColor={appSecondaryColor} />
                </div>
            )}

            <div
                className='containerDetail p-20 size20 mt-5'
                style={{ background: headerBackground, color: appPrimaryColor, cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleCollapse('productFinder')}
            >
                <h3 style={{ display: 'flex', alignItems: 'center', margin: 0 }}>
                    <span style={{ marginRight: 8 }}>{collapsed.productFinder ? '▶' : '▼'}</span>Product Finder
                </h3>
            </div>
            {!collapsed.productFinder && (
                <div className='containerDetail mt-5 p-15'>
                    <div className='flexContainer centerVertical' style={{ gap: 12, flexWrap: 'wrap' }}>
                        <label className='size15' style={{ color: appText, minWidth: 220, flex: 1 }}>
                            Product
                            <select
                                aria-label='Select product'
                                className='containerDetail mt-5 width-100-percent size20'
                                value={selectedProduct?.id || ''}
                                onChange={(event) => setSelectedProductId(event.target.value)}
                                style={{ color: appText }}
                            >
                                {filteredAndSortedProductFinderProducts.map((product) => (
                                    <option key={product.id} value={product.id}>
                                        {product.product || 'Unnamed product'}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className='size15' style={{ color: appText, minWidth: 170, flex: 1 }}>
                            Sort products by
                            <select
                                aria-label='Sort products by'
                                className='containerDetail mt-5 width-100-percent size20'
                                value={productFinderSortBy}
                                onChange={(event) => setProductFinderSortBy(event.target.value)}
                                style={{ color: appText }}
                            >
                                <option value='product'>Product</option>
                                <option value='aisle'>Aisle</option>
                                <option value='bay'>Bay</option>
                                <option value='price'>Price</option>
                                <option value='weight'>Weight</option>
                            </select>
                        </label>

                        <label className='size15' style={{ color: appText, minWidth: 170, flex: 1 }}>
                            Filter products by
                            <select
                                aria-label='Filter products by'
                                className='containerDetail mt-5 width-100-percent size20'
                                value={productFinderFilterBy}
                                onChange={(event) => setProductFinderFilterBy(event.target.value)}
                                style={{ color: appText }}
                            >
                                <option value='all'>All</option>
                                <option value='product'>Product</option>
                                <option value='aisle'>Aisle</option>
                                <option value='bay'>Bay</option>
                                <option value='price'>Price</option>
                                <option value='weight'>Weight</option>
                            </select>
                        </label>

                        {productFinderFilterBy !== 'all' && (
                            <label className='size15' style={{ color: appText, minWidth: 180, flex: 1 }}>
                                Filter value
                                <input
                                    aria-label='Filter by value'
                                    className='inputField mt-5 p-10 size16 width-100-percent'
                                    type='text'
                                    value={productFinderFilterValue}
                                    onChange={(event) => setProductFinderFilterValue(event.target.value)}
                                    placeholder='21'
                                    style={{ color: appText }}
                                />
                            </label>
                        )}

                        {(productFinderFilterBy !== 'all' || productFinderFilterValue) && (
                            <button
                                type='button'
                                className='containerDetail button p-10 size15 bg-lite color-dark'
                                onClick={resetProductFinderFilters}
                                aria-label='Clear filters'
                            >
                                Clear filters
                            </button>
                        )}

                        <button
                            type='button'
                            className='containerDetail button p-10 size15 bg-dkGreen color-lite'
                            onClick={addProductFinderProduct}
                            aria-label='Add a new product'
                        >
                            Add Product
                        </button>
                    </div>

                    <div className='containerDetail mt-10 p-10'>
                        <div className='containerDetail color-yellow size20 p-10' style={{ color: appPrimaryColor }}>
                            {selectedProduct?.product || 'New Product'}
                        </div>
                        
                        <div className='containerDetail mt-10 p-10 color-yellow' style={{ gap: 12, flexWrap: 'wrap' }}>
                            <div>
                                <label className='size14' >
                                    Product
                                    <div className='flexContainer' >
                                        <input
                                            className='inputField flex2Column mt-5 p-10 size18 mr-10'
                                            type='text'
                                            value={selectedProduct?.product || ''}
                                            onChange={(event) => updateSelectedProduct('product', event.target.value)}
                                            placeholder='2X4X6'
                                            aria-label='Product name'
                                        />
                                        {selectedProductId && (
                                            <div
                                                className='flexColumn containerDetail button p-10 size15 mt-10 ml-auto w-50 contentCenter mr-10'
                                                onClick={deleteProductFinderProduct}
                                                aria-label='Delete product'
                                            >
                                                🗑️
                                            </div>
                                        )}
                                    </div>
                                </label>
                            </div>
                            <div className='width-100-percent'>
                                <label className='size14 color-yellow'>
                                    SKU
                                    <input
                                        className='inputField mt-5 p-10 size18 width-100-percent'
                                        type='text'
                                        value={selectedProduct?.sku || ''}
                                        onChange={(event) => updateSelectedProduct('sku', event.target.value)}
                                        placeholder='2X4X6-21-1'
                                        aria-label='Product SKU'
                                    />
                                </label>
                            </div>
                            <label className='size14 color-yellow'>
                                Description
                                <input
                                    className='inputField mt-5 p-10 size16 width-100-percent'
                                    type='text'
                                    value={selectedProduct?.description || ''}
                                    onChange={(event) => updateSelectedProduct('description', event.target.value)}
                                    placeholder='Framing stock, trim, special order, etc.'
                                    aria-label='Product description'
                                />
                            </label>
                            <div className='flexContainer mt-10' style={{ gap: 12, flexWrap: 'wrap' }}>
                                <label className='size14 color-yellow' style={{ minWidth: 150, flex: 1 }}>
                                    Aisle
                                    <input
                                        className='inputField mt-5 p-10 size16 width-100-percent'
                                        type='text'
                                        value={selectedProduct?.aisle || ''}
                                        onChange={(event) => updateSelectedProduct('aisle', event.target.value)}
                                        placeholder='21'
                                        aria-label='Aisle number'
                                    />
                                </label>
                                <label className='size14 color-yellow' style={{ minWidth: 150, flex: 1 }}>
                                    Bay
                                    <input
                                        className='inputField mt-5 p-10 size16 width-100-percent'
                                        type='text'
                                        value={selectedProduct?.bay || ''}
                                        onChange={(event) => updateSelectedProduct('bay', event.target.value)}
                                        placeholder='1'
                                        aria-label='Bay number'
                                    />
                                </label>
                                <label className='size14 color-yellow' style={{ minWidth: 150, flex: 1 }}>
                                    Price
                                    <input
                                        className='inputField mt-5 p-10 size16 width-100-percent'
                                        type='text'
                                        value={selectedProduct?.price || ''}
                                        onChange={(event) => updateSelectedProduct('price', event.target.value)}
                                        placeholder='$5.49'
                                        aria-label='Product price'
                                    />
                                </label>
                                <label className='size14 color-yellow' style={{ minWidth: 150, flex: 1 }}>
                                    Weight
                                    <input
                                        className='inputField mt-5 p-10 size16 width-100-percent'
                                        type='text'
                                        value={selectedProduct?.weight || ''}
                                        onChange={(event) => updateSelectedProduct('weight', event.target.value)}
                                        placeholder='7.2 lb'
                                        aria-label='Product weight'
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className='containerDetail mt-10 p-10' style={{ borderRadius: 8 }}>
                        <div className='size18 bold mb-10' style={{ color: appPrimaryColor }}>
                            Product index
                        </div>
                        <div ref={productFinderListRef} className='containerDetail p-5' style={{ maxHeight: 260, overflowY: 'auto' }}>
                            {filteredAndSortedProductFinderProducts.length === 0 ? (
                                <div className='size15' style={{ color: appSecondaryColor }}>
                                    No product inventory matches the selected filter.
                                </div>
                            ) : (
                                filteredAndSortedProductFinderProducts.map((product) => (
                                    <div
                                        ref={(element) => {
                                            if (element) productFinderItemRefs.current[product.id] = element;
                                        }}
                                        key={product.id}
                                        className='containerDetail p-10 mt-5 button'
                                        style={{
                                            background: product.id === selectedProduct?.id ? 'rgba(255, 191, 0, 0.12)' : 'rgba(255,255,255,0.04)',
                                            borderRadius: 8,
                                            border: product.id === selectedProduct?.id ? '1px solid #ffb000' : '1px solid rgba(255,255,255,0.06)',
                                        }}
                                        onClick={() => setSelectedProductId(product.id)}
                                    >
                                        <div className='size16 bold' style={{ color: appPrimaryColor }}>
                                            {product.product || 'Unnamed product'}
                                        </div>
                                        <div className='size13 mt-5' style={{ color: appText }}>
                                            {product.description || 'No description'}
                                        </div>
                                        <div className='flexContainer size12 mt-5' style={{ gap: 12, flexWrap: 'wrap' }}>
                                            <span style={{ color: appSecondaryColor }}>Aisle {product.aisle || '—'}</span>
                                            <span style={{ color: appSecondaryColor }}>Bay {product.bay || '—'}</span>
                                            <span style={{ color: appSecondaryColor }}>{product.price || '—'}</span>
                                            <span style={{ color: appSecondaryColor }}>{product.weight || '—'}</span>
                                            <span style={{ color: appSecondaryColor }}>{product.sku || '—'}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Substitute Finder Section 
                        <CalculatorToolkit />*/}
            {/* PlySelector Section */}
            <div
                className='containerDetail p-20 size20 mt-5'
                style={{ background: headerBackground, color: appPrimaryColor, cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleCollapse('plySelector')}
            >
                <h3 style={{ display: 'flex', alignItems: 'center', margin: 0 }}>
                    <span style={{ marginRight: 8 }}>{collapsed.plySelector ? '▶' : '▼'}</span>PlySelector
                </h3>
            </div>
            {!collapsed.plySelector && (
                <div className='containerDetail bg-veryLite mt-5 pb-10'>
                    <form className='m-10' onSubmit={handlePlySelSubmit} style={{ maxWidth: 600 }}>
                        <div className='mb-5'>
                            <label>Project Type:
                                <select name='projectType' value={plySel.projectType} onChange={handlePlySelChange} className='containerDetail mt-5 ml--5 width-100-percent size20' style={{ color: appText }} required>
                                    {projectTypes.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </label>
                        </div>
                        <div className='mb-5'>
                            <label>Environment:
                                <select name='environment' value={plySel.environment} onChange={handlePlySelChange} className='containerDetail mt-5 ml--5 width-100-percent size20' style={{ color: appText }} required>
                                    {environments.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </label>
                        </div>
                        <div className='mb-5'>
                            <label>Appearance:
                                <select name='appearance' value={plySel.appearance} onChange={handlePlySelChange} className='containerDetail mt-5 ml--5 width-100-percent size20' style={{ color: appText }} required>
                                    {appearances.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </label>
                        </div>
                        <div className='mb-5'>
                            <label>Structural Requirement:
                                <select name='structural' value={plySel.structural} onChange={handlePlySelChange} className='containerDetail mt-5 ml--5 width-100-percent size20' style={{ color: appText }} required>
                                    {structurals.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </label>
                        </div>
                        <div className='mb-5'>
                            <label>Budget Priority:
                                <select name='budget' value={plySel.budget} onChange={handlePlySelChange} className='containerDetail mt-5 ml--5 width-100-percent size20' style={{ color: appText }} required>
                                    {budgets.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </label>
                        </div>
                        {plyFollowup && (
                            <div className='mb-5' style={{ color: appSecondaryColor, fontWeight: 'bold' }}>{plyFollowup}</div>
                        )}
                        <button type='submit' className='containerDetail bg-dkGreen color-dark bold p-10 size20 mt-10 mb-5'>
                            Get Recommendation
                        </button>
                    </form>
                    {plyRec && (
                        <div className='containerDetail p-10 mt-10 height-100 scroll' style={{ border: '1px solid #bada55', borderRadius: 8 }}>
                            <h4 style={{ color: appPrimaryColor, marginBottom: 8 }}>{plyRec.name} <span style={{ fontWeight: 'normal', color: appSecondaryColor }}>({plyRec.thickness}, {plyRec.grade}, {plyRec.exposureRating})</span></h4>
                            <div style={{ marginBottom: 6 }}>
                                <b style={{color: appPrimaryColor}}>Applications:</b> {plyRec.applications.join(', ')}
                            </div>
                            <div style={{ marginBottom: 6 }}>
                                <b style={{color: appPrimaryColor}}>Pros:</b> {plyRec.pros.join(', ')}
                            </div>
                            <div style={{ marginBottom: 6 }}>
                                <b style={{color: appPrimaryColor}}>Cons:</b> {plyRec.cons.join(', ')}
                            </div>
                            <div style={{ marginBottom: 6 }}>
                                <b style={{color: appPrimaryColor}}>Alternatives:</b> {plyRec.alternatives.join(', ')}
                            </div>
                            {plyWarnings.length > 0 && (
                                <div style={{ color: 'red', marginBottom: 6 }}>
                                    <b style={{color: appPrimaryColor}}>Warnings:</b> {plyWarnings.join(' ')}
                                </div>
                            )}
                            {plyConfidence && (
                                <div style={{ color: appSecondaryColor, marginBottom: 6 }}><b style={{color: appPrimaryColor}}>Confidence:</b> {(plyConfidence * 100).toFixed(0)}%</div>
                            )}
                            {plyExplanation && (
                                <div style={{ color: appPrimaryColor, marginTop: 8, fontStyle: 'italic' }}>{plyExplanation}</div>
                            )}
                        </div>
                    )}
                </div>
            )}
            {/* Ply Converter Section */}
            <div
                className='containerDetail p-20 size20 mt-5 mb-5'
                style={{ background: headerBackground, color: appPrimaryColor, cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleCollapse('ply')}
            >
                <h3 style={{ display: 'flex', alignItems: 'center', margin: 0 }}>
                    <span style={{ marginRight: 8 }}>{collapsed.ply ? '▶' : '▼'}</span>Ply Converter
                </h3>
            </div>
            {!collapsed.ply && (
                <div className='containerDetail bg-veryLite mt-5 pb-10'>
                    <form className='m-10' onSubmit={e => e.preventDefault()} style={{ maxWidth: 600 }}>
                        <div className='mb-5'>
                            <label>Project Type:
                                <select name='project' value={plyForm.project} onChange={handlePlyFormChange} className='containerDetail mt-5 ml--5 width-100-percent size20' style={{ color: appText }} required>
                                    <option value=''>Select...</option>
                                    <option value='roof'>Roof</option>
                                    <option value='cabinet'>Cabinet</option>
                                    <option value='subfloor'>Subfloor</option>
                                    <option value='shed'>Shed</option>
                                    <option value='furniture'>Furniture</option>
                                </select>
                            </label>
                        </div>
                        <div className='mb-5'>
                            <label>Environment:
                                <select name='indoorOutdoor' value={plyForm.indoorOutdoor} onChange={handlePlyFormChange} className='containerDetail mt-5 ml--5 width-100-percent size20' style={{ color: appText }} required>
                                    <option value=''>Select...</option>
                                    <option value='indoor'>Indoor</option>
                                    <option value='humid'>Humid/Bath/Laundry</option>
                                    <option value='outdoor'>Outdoor</option>
                                    <option value='ground_contact'>Ground Contact</option>
                                </select>
                            </label>
                        </div>
                        <div className='mb-5'>
                            <label>Appearance:
                                <select name='finish' value={plyForm.finish} onChange={handlePlyFormChange} className='containerDetail mt-5 ml--5 width-100-percent size20' style={{ color: appText }} required>
                                    <option value=''>Select...</option>
                                    <option value='hidden'>Hidden</option>
                                    <option value='paint'>Paint</option>
                                    <option value='stain'>Stain</option>
                                    <option value='premium'>Premium/Clear</option>
                                </select>
                            </label>
                        </div>
                        <div className='mb-5'>
                            <label>Structural Requirement:
                                <select name='structuralAppearance' value={plyForm.structuralAppearance} onChange={handlePlyFormChange} className='containerDetail mt-5 ml--5 width-100-percent size20' style={{ color: appText }} required>
                                    <option value=''>Select...</option>
                                    <option value='structural'>Structural</option>
                                    <option value='non_structural'>Non-Structural</option>
                                    <option value='unknown'>Not Sure</option>
                                </select>
                            </label>
                        </div>
                        <div className='mb-5'>
                            <label>Budget Priority:
                                <select name='thickness' value={plyForm.thickness} onChange={handlePlyFormChange} className='containerDetail mt-5 ml--5 width-100-percent size20' style={{ color: appText }} required>
                                    <option value=''>Select...</option>
                                    <option value='cheap'>Cheapest</option>
                                    <option value='balanced'>Balanced</option>
                                    <option value='premium'>Premium</option>
                                </select>
                            </label>
                        </div>
                        <div className='mb-5'>
                            <label>Search plywood type or grade:
                                <select
                                    className='containerDetail mt-5 ml--5 width-100-percent size20'
                                    style={{ color: appText }}
                                    name='search'
                                    value={plyForm.search}
                                    onChange={handlePlyFormChange}
                                    required
                                >
                                    <option value=''>Select...</option>
                                    <option value='AC'>AC</option>
                                    <option value='BC'>BC</option>
                                    <option value='Birch'>Birch</option>
                                    <option value='CDX'>CDX</option>
                                    <option value='Douglas Fir'>Douglas Fir</option>
                                    <option value='Fire Retardant'>Fire Retardant</option>
                                    <option value='Hardwood'>Hardwood</option>
                                    <option value='HDO'>HDO</option>
                                    <option value='Lauan'>Lauan</option>
                                    <option value='Maple'>Maple</option>
                                    <option value='Marine'>Marine</option>
                                    <option value='MDO'>MDO</option>
                                    <option value='Oak'>Oak</option>
                                    <option value='OSB'>OSB</option>
                                    <option value='Other'>Other</option>
                                    <option value='Poplar'>Poplar</option>
                                    <option value='Pressure Treated'>Pressure Treated</option>
                                    <option value='Radiata Pine'>Radiata Pine</option>
                                    <option value='Sanded'>Sanded</option>
                                    <option value='Underlayment'>Underlayment</option>
                                </select>
                            </label>
                        </div>
                    </form>
                    <div className='containerDetail p-10 mt-10' style={{ maxWidth: 700 }}>
                        <table className='containerDetail width-100-percent' style={{ borderCollapse: 'collapse', fontSize: 18 }}>
                            <thead>
                                <tr style={{ background: headerBackground, color: appPrimaryColor }}>
                                    <th style={{ textAlign: 'left', padding: 8 }}>Category</th>
                                    <th style={{ textAlign: 'left', padding: 8 }}>Names</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPly.length === 0 && (
                                    <tr><td colSpan={2} style={{ padding: 8, color: appSecondaryColor }}>No matches found.</td></tr>
                                )}
                                {filteredPly.map(cat => (
                                    <tr key={cat.category}>
                                        <td style={{ padding: 8, fontWeight: 'bold', color: appSecondaryColor }}>{cat.category}</td>
                                        <td style={{ padding: 8 }}>
                                            {cat.filtered.join(', ')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {/* LumberSelector Section */}
            <div
                className='containerDetail p-20 size20 mt-5'
                style={{ background: headerBackground, color: appPrimaryColor, cursor: 'pointer', userSelect: 'none' }}
                onClick={() => setCollapsedLumberSelector(v => !v)}
            >
                <h3 style={{ display: 'flex', alignItems: 'center', margin: 0 }}>
                    <span style={{ marginRight: 8 }}>{collapsedLumberSelector ? '▶' : '▼'}</span>LumberSelector
                </h3>
            </div>
            {
                !collapsedLumberSelector && (
                    <div className='containerDetail bg-veryLite mt-5 pb-10'>
                        <form className='m-10' onSubmit={handleLumberSelSubmit} style={{ maxWidth: 600 }}>
                            <div className='mb-5'>
                                <label>Project Type:
                                    <select name='project' value={lumberSel.project} onChange={handleLumberSelChange} className='containerDetail mt-5 ml--5 width-100-percent size20' style={{ color: appText }} required>
                                        {lumberProjects.map(opt => <option key={opt} value={opt}>{opt || 'Select...'}</option>)}
                                    </select>
                                </label>
                            </div>
                            <div className='mb-5'>
                                <label>Structural Importance
                                    <select name='structural' value={lumberSel.structural} onChange={handleLumberSelChange} className='containerDetail mt-5 ml--5 width-100-percent size20' style={{ color: appText }} required>
                                        {lumberStructurals.map(opt => <option key={opt} value={opt}>{opt || 'Select...'}</option>)}
                                    </select>
                                </label>
                            </div>
                            <div className='mb-5'>
                                <label>Exposure Conditions
                                    <select name='exposure' value={lumberSel.exposure} onChange={handleLumberSelChange} className='containerDetail mt-5 ml--5 width-100-percent size20' style={{ color: appText }} required>
                                        {lumberExposures.map(opt => <option key={opt} value={opt}>{opt || 'Select...'}</option>)}
                                    </select>
                                </label>
                            </div>
                            <div className='mb-5'>
                                <label>Span / Height
                                    <input
                                        className='containerDetail mt-5 ml--5 width-100-percent size20'
                                        style={{ color: appText }}
                                        name='span'
                                        value={lumberSel.span}
                                        onChange={handleLumberSelChange}
                                        type='text'
                                        placeholder='e.g. wall height, joist span, beam span, shelf length'
                                    />
                                </label>
                            </div>
                            <div className='mb-5'>
                                <label>Appearance Priority
                                    <select name='appearance' value={lumberSel.appearance} onChange={handleLumberSelChange} className='containerDetail mt-5 ml--5 width-100-percent size20' style={{ color: appText }} required>
                                        {lumberAppearances.map(opt => <option key={opt} value={opt}>{opt || 'Select...'}</option>)}
                                    </select>
                                </label>
                            </div>
                            <div className='mb-5'>
                                <label>Budget Priority
                                    <select name='budget' value={lumberSel.budget} onChange={handleLumberSelChange} className='containerDetail mt-5 ml--5 width-100-percent size20' style={{ color: appText }} required>
                                        {lumberBudgets.map(opt => <option key={opt} value={opt}>{opt || 'Select...'}</option>)}
                                    </select>
                                </label>
                            </div>
                            <button type='submit' className='containerDetail bg-dkGreen color-dark bold p-10 size20 mt-10'>Get Recommendation</button>
                        </form>
                        {lumberRec ? (
                            <div className='containerDetail p-10 mt-10 height-100 scroll mt-10' style={{ maxWidth: 700, border: '1px solid #bada55', borderRadius: 8 }}>
                                <h4 style={{ color: appPrimaryColor, marginBottom: 8 }}>{lumberRec.nominalSize} <span style={{ fontWeight: 'normal', color: appSecondaryColor }}>({lumberRec.actualSize}, {lumberRec.species}, {lumberRec.grade}{lumberRec.treatment ? ', ' + lumberRec.treatment : ''})</span></h4>
                                <div style={{ marginBottom: 6 }}><b style={{ color: appPrimaryColor }}>Applications:</b> {lumberRec.applications.join(', ')}</div>
                                <div style={{ marginBottom: 6 }}><b style={{ color: appPrimaryColor }}>Pros:</b> {lumberRec.pros.join(', ')}</div>
                                <div style={{ marginBottom: 6 }}><b style={{ color: appPrimaryColor }}>Cons:</b> {lumberRec.cons.join(', ')}</div>
                                <div style={{ marginBottom: 6 }}><b style={{ color: appPrimaryColor }}>Alternatives:</b> {lumberRec.alternatives.join(', ')}</div>
                                {lumberRec.warnings && lumberRec.warnings.length > 0 && (
                                    <div style={{ color: 'red', marginBottom: 6 }}><b style={{ color: appPrimaryColor }}>Warnings:</b> {lumberRec.warnings.join(' ')}</div>
                                )}
                                {lumberNominalActual && (
                                    <div style={{ color: appPrimaryColor, marginTop: 8, fontWeight: 'bold' }}>{lumberNominalActual} <span style={{ fontWeight: 'normal', color: appSecondaryColor }}>(Nominal vs Actual size)</span></div>
                                )}
                                {lumberExplanation && (
                                    <div style={{ color: appPrimaryColor, marginTop: 8, fontStyle: 'italic' }}>{lumberExplanation}</div>
                                )}
                            </div>
                        ) : (
                            <div className='containerDetail p-10 mt-10' style={{ maxWidth: 700, border: '1px solid #e0c97f', borderRadius: 8, color: appSecondaryColor }}>
                                <b style={{ color: appPrimaryColor }}>No recommendation found for your selection. Please adjust your choices or provide more details.</b>
                            </div>
                        )}
                    </div>
                )
            }
            {/* StudFinder Section */}
            <div
                className='containerDetail p-20 size20 mt-5'
                style={{ background: headerBackground, color: appPrimaryColor, cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleCollapse('studFinder')}
            >
                <h3 style={{ display: 'flex', alignItems: 'center', margin: 0 }}>
                    <span style={{ marginRight: 8 }}>{collapsed.studFinder ? '▶' : '▼'}</span>StudFinder
                </h3>
            </div>
            {!collapsed.studFinder && (
                <div className='containerDetail bg-veryLite mt-5 pb-10'>
                    <form className='m-10' onSubmit={handleStudSelSubmit} style={{ maxWidth: 600 }}>
                        <div className='mb-5'>
                            <label>What are you building?
                                <select name='project' value={studSel.project} onChange={handleStudSelChange} className='containerDetail mt-5 ml--5 width-100-percent size20' style={{ color: appText }} required>
                                    {studProjects.map(opt => <option key={opt} value={opt}>{opt || 'Select...'}</option>)}
                                </select>
                            </label>
                        </div>
                        <div className='mb-5'>
                            <label>Structural Importance
                                <select name='structural' value={studSel.structural} onChange={handleStudSelChange} className='containerDetail mt-5 ml--5 width-100-percent size20' style={{ color: appText }} required>
                                    {studStructurals.map(opt => <option key={opt} value={opt}>{opt || 'Select...'}</option>)}
                                </select>
                            </label>
                        </div>
                        <div className='mb-5'>
                            <label>Exposure Conditions
                                <select name='exposure' value={studSel.exposure} onChange={handleStudSelChange} className='containerDetail mt-5 ml--5 width-100-percent size20' style={{ color: appText }} required>
                                    {studExposures.map(opt => <option key={opt} value={opt}>{opt || 'Select...'}</option>)}
                                </select>
                            </label>
                        </div>
                        <div className='mb-5'>
                            <label>Span / Height
                                <input
                                    className='containerDetail mt-5 ml--5 width-100-percent size20'
                                    style={{ color: appText }}
                                    name='span'
                                    value={studSel.span}
                                    onChange={handleStudSelChange}
                                    type='text'
                                    placeholder='e.g. wall height, joist span, beam span, shelf length'
                                />
                            </label>
                        </div>
                        <div className='mb-5'>
                            <label>Appearance Priority
                                <select name='appearance' value={studSel.appearance} onChange={handleStudSelChange} className='containerDetail mt-5 ml--5 width-100-percent size20' style={{ color: appText }} required>
                                    {studAppearances.map(opt => <option key={opt} value={opt}>{opt || 'Select...'}</option>)}
                                </select>
                            </label>
                        </div>
                        <div className='mb-5'>
                            <label>Budget Priority
                                <select name='budget' value={studSel.budget} onChange={handleStudSelChange} className='containerDetail mt-5 ml--5 width-100-percent size20' style={{ color: appText }} required>
                                    {studBudgets.map(opt => <option key={opt} value={opt}>{opt || 'Select...'}</option>)}
                                </select>
                            </label>
                        </div>
                        {studFollowup && (
                            <div className='mb-5' style={{ color: appSecondaryColor, fontWeight: 'bold' }}>{studFollowup}</div>
                        )}
                        <button type='submit' className='containerDetail bg-dkGreen color-dark bold p-10 size20 mt-10'>Get Recommendation</button>
                    </form>
                    {studRec ? (
                        <div className='containerDetail p-10 mt-10 height-100 scroll mt-10' style={{ maxWidth: 700, border: '1px solid #bada55', borderRadius: 8 }}>
                            <h4 style={{ color: appPrimaryColor, marginBottom: 8 }}>{studRec.nominalSize} <span style={{ fontWeight: 'normal', color: appSecondaryColor }}>({studRec.actualSize}, {studRec.species}, {studRec.grade}{studRec.treatment ? ', ' + studRec.treatment : ''})</span></h4>
                            <div style={{ marginBottom: 6 }}><b style={{color: appPrimaryColor}}>Applications:</b> {studRec.applications.join(', ')}</div>
                            <div style={{ marginBottom: 6 }}><b style={{color: appPrimaryColor}}>Pros:</b> {studRec.pros.join(', ')}</div>
                            <div style={{ marginBottom: 6 }}><b style={{color: appPrimaryColor}}>Cons:</b> {studRec.cons.join(', ')}</div>
                            <div style={{ marginBottom: 6 }}><b style={{color: appPrimaryColor}}>Alternatives:</b> {studRec.alternatives.join(', ')}</div>
                            {studRec.warnings && studRec.warnings.length > 0 && (
                                <div style={{ color: 'red', marginBottom: 6 }}><b style={{color: appPrimaryColor}}>Warnings:</b> {studRec.warnings.join(' ')}</div>
                            )}
                            {studNominalActual && (
                                <div style={{ color: appPrimaryColor, marginTop: 8, fontWeight: 'bold' }}>{studNominalActual} <span style={{ fontWeight: 'normal', color: appSecondaryColor }}>(Nominal vs Actual size)</span></div>
                            )}
                            {studExplanation && (
                                <div style={{ color: appPrimaryColor, marginTop: 8, fontStyle: 'italic' }}>{studExplanation}</div>
                            )}
                        </div>
                    ) : (
                        <div className='containerDetail p-10 mt-10' style={{ maxWidth: 700, border: '1px solid #e0c97f', borderRadius: 8, color: appSecondaryColor }}>
                            <b style={{color: appPrimaryColor}}>No recommendation found for your selection. Please adjust your choices or provide more details.</b>
                        </div>
                    )}
                </div>
            )}
            {/* AI Assistant Section */}
            <div
                className='containerDetail p-20 size20 mt-5'
                style={{ background: headerBackground, color: appPrimaryColor, cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleCollapse('ai')}
            >
                <h3 style={{ display: 'flex', alignItems: 'center', margin: 0 }}>
                    <span style={{ marginRight: 8 }}>{collapsed.ai ? '▶' : '▼'}</span>AI Assistant
                </h3>
            </div>
            {!collapsed.ai && (
                <div className='containerDetail bg-veryLite mt-5 p-20'>
                    <p className='color-soft p-20' style={{ color: appText }}>
                        Ask building material questions and get instant answers from a local GPT/RAG assistant trained on:
                        <ul>
                            <li>Product specs, span tables, fastener charts</li>
                            <li>SDS/TDS sheets, building code references</li>
                            <li>Manufacturer installation guides</li>
                        </ul>
                        <b style={{color: appPrimaryColor}}>Sources:</b> Simpson Strong-Tie, APA, USG, Quikrete, and more.
                    </p>
                    <form className='mb-10' onSubmit={e => { e.preventDefault(); handleAiAsk(); }}>
                        <div className='flexContainer mb-5'>
                            <div className='flex2Column'>
                                <label style={{ color: appSecondaryColor }}>Ask a question:
                                    <input
                                        className='containerDetail mt-5 ml--5 width-100-percent size20'
                                        style={{ color: appText }}
                                        name='aiPrompt'
                                        value={aiPrompt}
                                        onChange={e => setAiPrompt(e.target.value)}
                                        type='text'
                                        placeholder='e.g. What is the max span for 2x10 joist?'
                                    />
                                </label>
                            </div>
                        </div>
                        <button className='containerDetail bg-neogreen color-dark bold p-10 width-100-percent mt-20 ml--5 mb--20 size25' type='submit'>
                            Ask
                        </button>
                    </form>
                    {aiAnswer && (
                        <div className='mt-20'>
                            <h4 style={{ color: appPrimaryColor }}>
                                Answer
                            </h4>
                            <div
                                className='containerDetail p-10 bg-dkGreen brdr-green lh-25 mt--10 size20'
                                style={{ color: appPrimaryColor }}
                            >
                                {aiAnswer}
                            </div>
                        </div>
                    )}
                </div>
            )}
            <div className='containerDetail p-20 size20 mt-5' style={{ background: headerBackground, color: appPrimaryColor, cursor: 'pointer', userSelect: 'none' }} onClick={() => handleCollapse('substitute')}>
                <h3 style={{ display: 'flex', alignItems: 'center', margin: 0 }}>
                    <span style={{ marginRight: 8 }}>{collapsed.substitute ? '▶' : '▼'}</span>Substitute Finder
                </h3>
            </div>
            {!collapsed.substitute && (
                <div className='containerDetail bg-veryLite mt-5 pb-10'>
                    <p className='color-soft p-10 mb--10' style={{ color: appSecondaryColor }}>
                        Find acceptable substitutes for out-of-stock lumber and sheet goods. Enter your needs and get real-world alternatives.
                    </p>
                    <form className='m-10' onSubmit={e => e.preventDefault()}>
                        <div className='mb-5 mt-20'>
                            <div style={{ color: appPrimaryColor }}>
                                <label>Intended Use:
                                    <select
                                        className='containerDetail mt-5 ml--5 width-100-percent size30'
                                        style={{ color: appText }}
                                        name='intendedUse'
                                        value={subInputs.intendedUse}
                                        onChange={e => setSubInputs(s => ({ ...s, intendedUse: e.target.value }))}
                                        required
                                    >
                                        <option value=''>Select...</option>
                                        <option value='roof sheathing'>Roof Sheathing</option>
                                        <option value='wall sheathing'>Wall Sheathing</option>
                                        <option value='subfloor'>Subfloor</option>
                                        <option value='siding'>Siding</option>
                                        <option value='fence'>Fence</option>
                                        <option value='deck'>Deck</option>
                                        <option value='cabinet'>Cabinet</option>
                                        <option value='furniture'>Furniture</option>
                                        <option value='shelving'>Shelving</option>
                                        <option value='other'>Other</option>
                                    </select>
                                </label>
                            </div>
                        </div>
                        <div className='mb-5 mt-20'>
                            <div style={{ color: appPrimaryColor }}>
                                <label>Weather Exposure:
                                    <select
                                        className='containerDetail mt-5 ml--5 width-100-percent size30'
                                        style={{ color: appText }}
                                        name='weather'
                                        value={subInputs.weather}
                                        onChange={e => setSubInputs(s => ({ ...s, weather: e.target.value }))}
                                        required
                                    >
                                        <option value=''>Select...</option>
                                        <option value='interior'>Interior</option>
                                        <option value='interior humid'>Interior Humid</option>
                                        <option value='exterior covered'>Exterior Covered</option>
                                        <option value='exterior exposed'>Exterior Exposed</option>
                                        <option value='ground contact'>Ground Contact</option>
                                    </select>
                                </label>
                            </div>
                        </div>
                        <div className='mb-5 mt-20'>
                            <div style={{ color: appPrimaryColor }}>
                                <label>Structural/Nonstructural:
                                    <select
                                        className='containerDetail mt-5 ml--5 width-100-percent size30'
                                        style={{ color: appText }}
                                        name='structural'
                                        value={subInputs.structural}
                                        onChange={e => setSubInputs(s => ({ ...s, structural: e.target.value }))}
                                        required
                                    >
                                        <option value=''>Select...</option>
                                        <option value='structural'>Structural</option>
                                        <option value='nonstructural'>Nonstructural</option>
                                        <option value='unknown'>Not Sure</option>
                                    </select>
                                </label>
                            </div>
                        </div>
                    </form>
                    {/* Substitutes Output */}
                    {(() => {
                        const subs = getSubstitutes();
                        if (!subs) return null;
                        return (
                            <div className='mt-5'>
                                <div className='containerDetail m-5 p-10 size30' style={{ color: appPrimaryColor }}>Acceptable Substitutes</div>
                                <ul className='height-400 mt--1'>
                                    {subs.map((s, i) => (
                                        <li
                                            key={i}
                                            className='containerDetail bg-dark ml--30 mr-10 mb-5 size15 p-10'
                                        >
                                            <b className='size20' style={{ color: appSecondaryColor }}>
                                                {s.name}
                                            </b>
                                            <div className='mt-5 color-neogreen'>
                                                <b style={{ color: appPrimaryColor }}>Pros:</b> {s.pros}
                                            </div>
                                            <div className='mt-5' style={{ color: appText }}>
                                                <b style={{ color: appPrimaryColor }}>Cons:</b> {s.cons}
                                            </div>
                                            <div className='mt-5' style={{ color: appSecondaryColor }}>
                                                <b style={{ color: appPrimaryColor }}>Price:</b> {s.price}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })()}
                </div>
            )}
            {/* Contractor Slang Section */}
            <div
                className='containerDetail p-20 size20 mt-5'
                style={{ background: headerBackground, color: appPrimaryColor, cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleCollapse('contractorSlang')}
            >
                <h3 style={{ display: 'flex', alignItems: 'center', margin: 0 }}>
                    <span style={{ marginRight: 8 }}>{collapsed.contractorSlang ? '▶' : '▼'}</span>Contractor Slang
                </h3>
            </div>
            {!collapsed.contractorSlang && (
                <div className='containerDetail bg-veryLite mt-5 pb-10'>
                    <p className='color-soft p-10 mb--10' style={{ color: appSecondaryColor }}>
                        Bridge the gap between what customers or contractors say and what you’ll actually find at Home Depot. Includes slang, real product names, SKU mappings, aisle/bin locations, substitutes, and compatible accessories.
                    </p>
                    <div className='containerDetail p-10 mt-10' style={{ maxWidth: 900, overflowX: 'auto' }}>
                        <table className='containerDetail width-100-percent' style={{ borderCollapse: 'collapse', fontSize: 16 }}>
                            <thead>
                                <tr style={{ background: headerBackground, color: appPrimaryColor }}>
                                    <th style={{ textAlign: 'left', padding: 8 }}>Customer Says</th>
                                    <th style={{ textAlign: 'left', padding: 8 }}>Actual Product</th>
                                    <th style={{ textAlign: 'left', padding: 8 }}>SKU</th>
                                    <th style={{ textAlign: 'left', padding: 8 }}>Aisle/Bin</th>
                                    <th style={{ textAlign: 'left', padding: 8 }}>Substitutes</th>
                                    <th style={{ textAlign: 'left', padding: 8 }}>Accessories</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contractorSlangTable.map((row, i) => (
                                    <tr key={row.slang + i}>
                                        <td style={{ padding: 8, fontWeight: 'bold', color: appSecondaryColor }}>{row.slang}</td>
                                        <td style={{ padding: 8 }}>{row.actual}</td>
                                        <td style={{ padding: 8 }}>{row.sku}</td>
                                        <td style={{ padding: 8 }}>{row.aisle} <span style={{ color: appSecondaryColor }}>/ {row.bin}</span></td>
                                        <td style={{ padding: 8 }}>{row.substitutes}</td>
                                        <td style={{ padding: 8 }}>{row.accessories}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div
                className='containerDetail p-20 size20 mt-5'
                style={{ background: headerBackground, color: appPrimaryColor, cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleCollapse('wall')}
            >
                <h3 style={{ display: 'flex', alignItems: 'center', margin: 0 }}>
                    <span style={{ marginRight: 8 }}>{collapsed.wall ? '▶' : '▼'}</span>Wall/Framing Inputs
                </h3>
            </div>
            {!collapsed.wall && (
                <div
                    className='containerDetail p-20 mt-5 bg-veryLite'
                    style={{ color: appPrimaryColor }}
                >
                    <p
                        className='copyright'
                        style={{ color: appSecondaryColor }}
                    >
                        Enter wall dimensions, stud spacing, and openings to get a full material list for a wall section.
                    </p>
                    <div className='flexContainer mb-10'>
                        <div className='flex2Column'>
                            <label>
                                Wall Length (ft):
                                <div>
                                    <input
                                        className='containerDetail mt-5 ml--5 width-100-percent size30'
                                        style={{ color: appText }}
                                        name='wallLength'
                                        value={inputs.wallLength}
                                        onChange={handleChange}
                                        type='number'
                                        min='0'
                                    />
                                </div>
                            </label>
                        </div>
                    </div>
                    <div className='flexContainer mb-10'>
                        <div className='flex2Column'>
                            <label>
                                Wall Height (ft):
                                <div>
                                    <input
                                        className='containerDetail mt-5 ml--5 width-100-percent size30'
                                        style={{ color: appText }}
                                        name='wallHeight'
                                        value={inputs.wallHeight}
                                        onChange={handleChange}
                                        type='number'
                                        min='0'
                                    />
                                </div>
                            </label>
                        </div>
                    </div>
                    <div className='flexContainer mb-10'>
                        <div className='flex2Column'>
                            <label>
                                Stud Spacing (in):
                                <div>
                                    <input
                                        className='containerDetail mt-5 ml--5 width-100-percent size30'
                                        style={{ color: appText }}
                                        name='studSpacing'
                                        value={inputs.studSpacing}
                                        onChange={handleChange}
                                        type='number'
                                        min='8'
                                        max='24'
                                        step='2'
                                    />
                                </div>
                            </label>
                        </div>
                    </div>
                    <div className='flexContainer mb-10'>
                        <div className='flex2Column'>
                            <label>
                                Doors:
                                <div>
                                    <input
                                        className='containerDetail mt-5 ml--5 width-100-percent size30'
                                        style={{ color: appText }}
                                        name='numDoors'
                                        value={inputs.numDoors}
                                        onChange={handleChange}
                                        type='number'
                                        min='0'
                                    />
                                </div>
                            </label>
                        </div>
                    </div>
                    <div className='flexContainer mb-10'>
                        <div className='flex2Column'>
                            <label>
                                Windows:
                                <div>
                                    <input
                                        className='containerDetail mt-5 ml--5 width-100-percent size30'
                                        style={{ color: appText }}
                                        name='numWindows'
                                        value={inputs.numWindows}
                                        onChange={handleChange}
                                        type='number'
                                        min='0'
                                    />
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            )}
            <div
                className='containerDetail p-20 size20 mt-5'
                style={{ background: headerBackground, color: appPrimaryColor }}
                onClick={() => handleCollapse('deck')}
            >
                <h3>
                    <span style={{ marginRight: 8 }}>{collapsed.deck ? '▶' : '▼'}</span>Deck/Fence/Concrete
                </h3>
            </div>
            {!collapsed.deck && (
                <div
                    className='containerDetail p-20 mt-5 bg-veryLite'
                    style={{ color: appPrimaryColor }}
                >

                    <div className='flexContainer mb-10'>
                        <div className='flex2Column'>
                            <label>
                                Deck Length (ft):
                                <div>
                                    <input
                                        className='containerDetail mt-5 ml--5 width-100-percent size30'
                                        style={{ color: appText }}
                                        name='deckLength'
                                        value={inputs.deckLength}
                                        onChange={handleChange}
                                        type='number'
                                        min='0'
                                    />
                                </div>
                            </label>
                        </div>
                    </div>
                    <div className='flexContainer mb-10'>
                        <div className='flex2Column'>
                            <label>
                                Deck Width (ft):
                                <div>
                                    <input
                                        className='containerDetail mt-5 ml--5 width-100-percent size30'
                                        style={{ color: appText }}
                                        name='deckWidth'
                                        value={inputs.deckWidth}
                                        onChange={handleChange}
                                        type='number'
                                        min='0'
                                    />
                                </div>
                            </label>
                        </div>
                    </div>
                    <div className='flexContainer mb-10'>
                        <div className='flex2Column'>
                            <label>
                                Board Width (in):
                                <div>
                                    <input
                                        className='containerDetail mt-5 ml--5 width-100-percent size30'
                                        style={{ color: appText }}
                                        name='boardWidth'
                                        value={inputs.boardWidth}
                                        onChange={handleChange}
                                        type='number'
                                        min='3'
                                    />
                                </div>
                            </label>
                        </div>
                    </div>
                    <div className='flexContainer mb-10'>
                        <div className='flex2Column'>
                            <label>
                                Fence Length (ft):
                                <div>
                                    <input
                                        className='containerDetail mt-5 ml--5 width-100-percent size30'
                                        style={{ color: appText }}
                                        name='fenceLength'
                                        value={inputs.fenceLength}
                                        onChange={handleChange}
                                        type='number'
                                        min='0'
                                    />
                                </div>
                            </label>
                        </div>
                    </div>
                    <div className='flexContainer mb-10'>
                        <div className='flex2Column'>
                            <label>
                                Picket Width (in):
                                <div>
                                    <input
                                        className='containerDetail mt-5 ml--5 width-100-percent size30'
                                        style={{ color: appText }}
                                        name='picketWidth'
                                        value={inputs.picketWidth}
                                        onChange={handleChange}
                                        type='number'
                                        min='3'
                                    />
                                </div>
                            </label>
                        </div>
                    </div>
                    <div className='flexContainer'>
                        <div className='flex2Column'>
                            <label>
                                Concrete Volume (cu ft):
                                <div>
                                    <input
                                        className='containerDetail mt-5 ml--5 width-100-percent size30'
                                        style={{ color: appText }}
                                        name='concreteVolume'
                                        value={inputs.concreteVolume}
                                        onChange={handleChange}
                                        type='number'
                                        min='0'
                                    />
                                </div>
                            </label>
                        </div>
                    </div>
                    <div className='flexContainer mb-10'>
                    </div>
                </div>
            )}
            <div
                className='containerDetail p-20 size20 mt-5'
                style={{ background: headerBackground, color: appPrimaryColor }}
                onClick={() => handleCollapse('plywood')}
            >
                <h3>
                    <span style={{ marginRight: 8 }}>{collapsed.plywood ? '▶' : '▼'}</span>Plywood/Roofing/Drywall
                </h3>
            </div>
            {!collapsed.plywood && (
                <div
                    className='containerDetail p-20 mt-5 bg-veryLite'
                    style={{ color: appPrimaryColor }}
                >
                    <div className='flexContainer mb-10'>
                        <div className='flex2Column'>
                            <label>
                                Area to Cover (sq ft):
                                <div>
                                    <input
                                        className='containerDetail mt-5 ml--5 width-100-percent size30'
                                        style={{ color: appText }}
                                        name='areaToCover'
                                        value={inputs.areaToCover}
                                        onChange={handleChange}
                                        type='number'
                                        min='0'
                                    />
                                </div>
                            </label>
                        </div>
                    </div>
                    <div className='flexContainer mb-10'>
                        <div className='flex2Column'>
                            <label>
                                Plywood Length (ft):
                                <div>
                                    <input
                                        className='containerDetail mt-5 ml--5 width-100-percent size30'
                                        style={{ color: appText }}
                                        name='plywoodLength'
                                        value={inputs.plywoodLength}
                                        onChange={handleChange}
                                        type='number'
                                        min='1'
                                    />
                                </div>
                            </label>
                        </div>
                    </div>
                    <div className='flexContainer mb-10'>
                        <div className='flex2Column'>
                            <label>
                                Plywood Width (ft):
                                <div>
                                    <input
                                        className='containerDetail mt-5 ml--5 width-100-percent size30'
                                        style={{ color: appText }}
                                        name='plywoodWidth'
                                        value={inputs.plywoodWidth}
                                        onChange={handleChange}
                                        type='number'
                                        min='1'
                                    />
                                </div>
                            </label>
                        </div>
                    </div>
                    <div className='flexContainer mb-10'>
                        <div className='flex2Column'>
                            <label>
                                Roof Area (sq ft):
                                <div>
                                    <input
                                        className='containerDetail mt-5 ml--5 width-100-percent size30'
                                        style={{ color: appText }}
                                        name='roofArea'
                                        value={inputs.roofArea}
                                        onChange={handleChange}
                                        type='number'
                                        min='0'
                                    />
                                </div>
                            </label>
                        </div>
                    </div>
                    <div className='flexContainer mb-10'>
                        <div className='flex2Column'>
                            <label>
                                Drywall Area (sq ft):
                                <div>
                                    <input
                                        className='containerDetail mt-5 ml--5 width-100-percent size30'
                                        style={{ color: appText }}
                                        name='drywallArea'
                                        value={inputs.drywallArea}
                                        onChange={handleChange}
                                        type='number'
                                        min='0'
                                    />
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            )}
            <button
                className='button bg-neogreen color-dark bold p-10 mt-5 width--10 ml-5'
                onClick={calculate}
            >
                Estimate
            </button>
            <div>
                <div
                    className='containerDetail p-20 size20 mt-5'
                    style={{ background: headerBackground, color: appPrimaryColor }}
                    onClick={() => handleCollapse('results')}
                >
                    <h3>
                        <span style={{ marginRight: 8 }}>{collapsed.results ? '▶' : '▼'}</span>Results
                    </h3>
                </div>
                {!collapsed.results && (
                    <div>
                        <div
                            className='containerDetail bg-veryLite mt-5 contentRight'
                            style={{ color: appText }}
                        >
                            <ul className='mt--1 size20'>
                                <li className='containerDetail pr-30 p-10 ml--40 mt-2'><b style={{ marginRight: '10px', color: appPrimaryColor }}>Studs:</b> {results.studCount || 0}</li>
                                <li className='containerDetail pr-30 p-10 mt-5 ml--40'><b style={{ marginRight: '10px', color: appPrimaryColor }}>Top/Bottom Plates (8ft):</b> {results.topBottomPlates || 0}</li>
                                <li className='containerDetail pr-30 p-10 mt-5 ml--40'><b style={{ marginRight: '10px', color: appPrimaryColor }}>Drywall Sheets (4x8):</b> {results.drywallSheets || 0}</li>
                                <li className='containerDetail pr-30 p-10 mt-5 ml--40'><b style={{ marginRight: '10px', color: appPrimaryColor }}>Drywall Screws (est.):</b> {results.screws || 0}</li>
                                <li className='containerDetail pr-30 p-10 mt-5 ml--40'><b style={{ marginRight: '10px', color: appPrimaryColor }}>Insulation Batts:</b> {results.insulationBatts || 0}</li>
                                <li className='containerDetail pr-30 p-10 mt-5 ml--40'><b style={{ marginRight: '10px', color: appPrimaryColor }}>Deck Boards:</b> {results.deckBoards || 0}</li>
                                <li className='containerDetail pr-30 p-10 mt-5 ml--40'><b style={{ marginRight: '10px', color: appPrimaryColor }}>Fence Pickets:</b> {results.pickets || 0}</li>
                                <li className='containerDetail pr-30 p-10 mt-5 ml--40'><b style={{ marginRight: '10px', color: appPrimaryColor }}>Concrete Bags (80lb):</b> {results.concreteBags || 0}</li>
                                <li className='containerDetail pr-30 p-10 mt-5 ml--40'><b style={{ marginRight: '10px', color: appPrimaryColor }}>Plywood Sheets:</b> {results.plywoodSheets || 0}</li>
                                <li className='containerDetail pr-30 p-10 mt-5 ml--40'><b style={{ marginRight: '10px', color: appPrimaryColor }}>Roofing Squares:</b> {results.roofingSquares || 0}</li>
                                <li className='containerDetail pr-30 p-10 mt-5 ml--40 mb--20'><b style={{ marginRight: '10px', color: appPrimaryColor }}>Drywall Takeoff (sheets):</b> {results.drywallTakeoff || 0}</li>
                            </ul>
                        </div>
                    </div>
                )}
                <div
                    className='containerDetail p-20 size20 mt-5'
                    style={{ background: headerBackground, color: appPrimaryColor }}
                    onClick={() => handleCollapse('assistant')}
                >
                    <h3>
                        <span style={{ marginRight: 8 }}>{collapsed.assistant ? '▶' : '▼'}</span>Assistant for Store Associate
                    </h3>
                </div>
                {!collapsed.assistant && (
                    <div className='containerDetail bg-veryLite mt-5 pb-10'>
                        <p className='color-soft p-20' style={{ color: appText }}>
                            Enter wall dimensions, stud spacing, and openings to get a full material list for a wall section.
                        </p>
                        <ul className='mt--5'>
                            <li className='containerDetail pr-30 p-10 mt-5 ml--40'><b style={{ marginRight: '10px', color: appPrimaryColor }}>Input:</b> Wall dimensions, stud spacing, door/window openings</li>
                            <li className='containerDetail pr-30 p-10 mt-5 ml--40'><b style={{ marginRight: '10px', color: appPrimaryColor }}>Output:</b> Stud quantity, top/bottom plates, drywall sheets, screws, insulation batts</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Lumber;
