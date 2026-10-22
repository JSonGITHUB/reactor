import React, { useEffect, useMemo, useState } from 'react';
import icons from '../site/icons';
import CollapseToggleButton from './CollapseToggleButton';

const EMERGENCY_SNAPSHOT_KEY = 'emergencyOfflineSnapshot';
const GO_BAG_PROGRESS_KEY = 'goBagBuilderProgress';

const emergencyNumbersByRegion = {
    us: [{ region: 'US/Canada', number: '911', note: 'Police, fire, and EMS' }],
    eu: [{ region: 'EU', number: '112', note: 'General emergency number' }],
    uk: [
        { region: 'UK', number: '999', note: 'Police, fire, and ambulance' },
        { region: 'UK', number: '112', note: 'Also works in UK and EU' }
    ],
    au: [
        { region: 'Australia', number: '000', note: 'Police, fire, and ambulance' },
        { region: 'Australia', number: '112', note: 'Mobile emergency backup' }
    ],
    intl: [
        { region: 'Global', number: '112', note: 'Common international emergency number' },
        { region: 'US/Canada', number: '911', note: 'If in North America' },
        { region: 'Australia', number: '000', note: 'If in Australia' },
        { region: 'UK', number: '999', note: 'If in the UK' }
    ]
};

const regionOptions = [
    { value: 'auto', label: 'Auto Detect' },
    { value: 'us', label: 'US/Canada' },
    { value: 'eu', label: 'EU' },
    { value: 'uk', label: 'UK' },
    { value: 'au', label: 'Australia' },
    { value: 'intl', label: 'International' }
];

const detectRegion = () => {
    const locale = String(navigator.language || '').toLowerCase();
    const timezone = String(Intl.DateTimeFormat().resolvedOptions().timeZone || '').toLowerCase();

    if (locale.includes('-gb') || timezone.includes('london')) return 'uk';
    if (locale.includes('-au') || timezone.includes('australia')) return 'au';
    if (locale.includes('-us') || locale.includes('-ca') || timezone.includes('america')) return 'us';
    if (/-fr|-de|-es|-it|-pt|-nl|-be|-dk|-fi|-se|-no|-pl|-gr|-ie|-cz|-at|-ro|-hu/.test(locale) || timezone.includes('europe')) return 'eu';
    return 'intl';
};

const immediateActions = [
    '👀 Check scene safety first. Do not become a second victim.',
    '📞 Call emergency services early and share exact location details.',
    '🩸 Control severe bleeding with direct pressure and clean cloth.',
    '🫀 If trained, begin CPR for unresponsive person not breathing normally.',
    '⚡️ Use an AED immediately when available and follow voice prompts.',
    '🔥 For burns, cool with running water for 20 minutes. Avoid ice.',
    `🫤 For possible stroke, use\n
    FAST: 🥵😉🤪🤨😕🥴🤤\n
    🥴 Face droop,\n
    🫀 Arm weakness,\n
    🗣️ Speech changes,\n
    📞 Time to call.`
];

const kitChecklist = [
    '💧 Water (at least 1 gallon per person/day for 3 days)',
    '🥫 Non-perishable food (3-day minimum)',
    '🔦 Flashlights and spare batteries',
    '🔋 Phone power banks and charging cables',
    '🩹 First-aid kit and personal medications',
    '🆔 Copies of IDs, insurance, and emergency contacts',
    '📢 Whistle, multi-tool, duct tape, and N95 masks',
    '🛏️ Blanket, gloves, and weather layers'
];

const survivalHacks = [
    '📍 Share your location with trusted contacts before trips.',
    '📇 Keep a printed contact card in wallet and vehicle.',
    '💧 Store emergency water in multiple small containers.',
    '📶 Use SMS when calls fail on overloaded networks.',
    '📌 Create a family meetup plan with two backup locations.',
    '🎒 Keep one go-bag at home and one in your vehicle.',
    '🗺️ Save local offline maps for areas with weak service.'
];

const resources = [
    { name: 'Ready.gov', url: 'https://www.ready.gov/' },
    { name: 'CDC Emergency Preparedness', url: 'https://www.cdc.gov/preparedness/' },
    { name: 'Red Cross Preparedness', url: 'https://www.redcross.org/get-help/how-to-prepare-for-emergencies.html' },
    { name: 'WHO Emergencies', url: 'https://www.who.int/emergencies' }
];

const goBagItems = [
    { id: 'water', icon: '💧', label: 'Water Bottles', category: 'Hydration', baseQty: 3, perPerson: true },
    { id: 'food', icon: '🥫', label: 'Ready-to-eat Meals', category: 'Nutrition', baseQty: 6, perPerson: true },
    { id: 'meds', icon: '💊', label: 'Medication Pack', category: 'Medical', baseQty: 1, perPerson: false },
    { id: 'firstaid', icon: '🩹', label: 'First-Aid Kit', category: 'Medical', baseQty: 1, perPerson: false },
    { id: 'light', icon: '🔦', label: 'Flashlight', category: 'Power', baseQty: 1, perPerson: false },
    { id: 'batteries', icon: '🔋', label: 'Battery Set', category: 'Power', baseQty: 2, perPerson: false },
    { id: 'charger', icon: '🔌', label: 'Phone Charging Cable', category: 'Power', baseQty: 1, perPerson: true },
    { id: 'docs', icon: '🆔', label: 'ID and Contact Copies', category: 'Documents', baseQty: 1, perPerson: false },
    { id: 'cash', icon: '💵', label: 'Emergency Cash Envelope', category: 'Documents', baseQty: 1, perPerson: false },
    { id: 'whistle', icon: '📢', label: 'Whistle', category: 'Tools', baseQty: 1, perPerson: true },
    { id: 'multitool', icon: '🛠️', label: 'Multi-tool', category: 'Tools', baseQty: 1, perPerson: false },
    { id: 'blanket', icon: '🛏️', label: 'Thermal Blanket', category: 'Shelter', baseQty: 1, perPerson: true }
];

const decisionSupportGoalOptions = [
    { id: 'medical', label: 'Medical or Injury Right Now', prompt: 'Choose the issue that best matches the current situation.' },
    { id: 'disaster', label: 'Disaster and Environment Risk', prompt: 'Choose the event type for location-specific guidance.' },
    { id: 'preparedness', label: 'Preparedness and Planning', prompt: 'Choose what you want to build or improve.' },
    { id: 'contacts', label: 'Emergency Contacts and Rapid Share', prompt: 'Use local emergency numbers and share location quickly.' }
];

const medicalDecisionOptions = [
    { id: 'stroke-fast', label: 'Possible Stroke (FAST)', type: 'tree' },
    { id: 'chest-pain', label: 'Chest Pain Risk', type: 'tree' },
    { id: 'severe-bleeding', label: 'Severe Bleeding', type: 'tree' },
    { id: 'cpr', label: 'Unresponsive / CPR Needed', type: 'guide', guideId: 'cpr' },
    { id: 'burns', label: 'Burn Injury', type: 'guide', guideId: 'burns' },
    { id: 'choking', label: 'Choking', type: 'guide', guideId: 'choking' }
];

const preparednessFocusOptions = [
    { id: 'kit', label: '72 Hour Kit Checklist' },
    { id: 'gobag', label: 'Go-Bag Builder' },
    { id: 'survival', label: 'Survival Methods' },
    { id: 'resources', label: 'Trusted Resources' }
];

const firstAidGuides = [
    {
        id: 'cpr',
        title: 'CPR (Adult)',
        caution: 'Call emergency services and use an AED as soon as available.',
        steps: [
            '🩺 Check responsiveness and normal breathing.',
            '📞 Call emergency services or direct someone to call.',
            '🤲 Place hands center chest and push hard/fast (100-120 per minute).',
            '↩️ Allow full chest recoil between compressions.',
            '⏳ Continue until help arrives or person shows clear signs of life.'
        ]
    },
    {
        id: 'bleeding',
        title: 'Severe Bleeding',
        caution: 'Use gloves/barrier if available and apply firm direct pressure.',
        steps: [
            '📞 Call emergency services for heavy or uncontrolled bleeding.',
            '🩹 Apply direct pressure with clean cloth or bandage.',
            '➕ Add more layers if soaked; do not remove first layer.',
            '⬆️ Elevate injured limb if no fracture is suspected.',
            '🩺 If life-threatening and trained, apply a tourniquet above wound.'
        ]
    },
    {
        id: 'burns',
        title: 'Burns',
        caution: 'Cool burn quickly with running water and avoid ice.',
        steps: [
            '🧯 Stop the burning source and move to safety.',
            '💧 Cool with cool running water for 20 minutes.',
            '🔗 Remove tight items near burn (rings, watches) early if possible.',
            '🩹 Cover with clean non-stick dressing or cloth.',
            '🏥 Seek urgent care for large, deep, facial, hand, or airway burns.'
        ]
    },
    {
        id: 'choking',
        title: 'Choking (Conscious Adult)',
        caution: 'Call emergency services if object does not clear quickly.',
        steps: [
            '🗣️ Ask if they can cough or speak; encourage strong coughing first.',
            '🤲🏼 If severe airway block, stand behind and give abdominal thrusts.',
            '🤲🏼 Repeat thrusts until object comes out or person becomes unresponsive.',
            '🆘 If unresponsive, begin CPR and check mouth for visible object between cycles.',
            '🚫 Do not perform blind finger sweeps.'
        ]
    }
];

const criticalDecisionTrees = [
    {
        id: 'stroke-fast',
        title: 'Possible Stroke (FAST)',
        intro: 'Use FAST signs to decide if this is time-critical stroke care.',
        nodes: {
            start: {
                type: 'question',
                text: 'Is there sudden face droop, arm weakness, or speech trouble?',
                yes: 'symptoms-now',
                no: 'monitor'
            },
            'symptoms-now': {
                type: 'question',
                text: 'Did symptoms start within the last 24 hours or time is unknown?',
                yes: 'call-now',
                no: 'urgent-eval'
            },
            'call-now': {
                type: 'result',
                level: 'critical',
                text: 'Call emergency services now. Note last-known-well time. Do not give food or drink.'
            },
            'urgent-eval': {
                type: 'result',
                level: 'urgent',
                text: 'Get emergency evaluation now. Stroke risk remains high even if signs improve.'
            },
            monitor: {
                type: 'result',
                level: 'watch',
                text: 'If any FAST sign appears, treat as stroke and call immediately.'
            }
        }
    },
    {
        id: 'severe-bleeding',
        title: 'Severe Bleeding Control',
        intro: 'Decide when bleeding needs emergency escalation.',
        nodes: {
            start: {
                type: 'question',
                text: 'Is blood flowing heavily, spurting, or soaking through dressings quickly?',
                yes: 'pressure',
                no: 'minor-care'
            },
            pressure: {
                type: 'question',
                text: 'After 10 minutes of firm direct pressure, is bleeding still uncontrolled?',
                yes: 'call-tourniquet',
                no: 'hold-observe'
            },
            'call-tourniquet': {
                type: 'result',
                level: 'critical',
                text: 'Call emergency services now. Continue pressure and use a tourniquet if trained.'
            },
            'hold-observe': {
                type: 'result',
                level: 'urgent',
                text: 'Keep pressure, secure dressing, and seek same-day medical care.'
            },
            'minor-care': {
                type: 'result',
                level: 'watch',
                text: 'Clean and bandage minor bleeding. Watch for dizziness, weakness, or re-bleeding.'
            }
        }
    },
    {
        id: 'chest-pain',
        title: 'Chest Pain Risk Check',
        intro: 'Screen for heart-attack danger signs.',
        nodes: {
            start: {
                type: 'question',
                text: 'Is there chest pressure/pain lasting more than 5 minutes or recurring?',
                yes: 'danger-signs',
                no: 'alt-symptoms'
            },
            'danger-signs': {
                type: 'question',
                text: 'Any shortness of breath, sweating, nausea, jaw/arm pain, or faintness?',
                yes: 'call-now',
                no: 'urgent-check'
            },
            'alt-symptoms': {
                type: 'question',
                text: 'Any unusual fatigue, breathlessness, or upper-body discomfort without clear cause?',
                yes: 'urgent-check',
                no: 'monitor'
            },
            'call-now': {
                type: 'result',
                level: 'critical',
                text: 'Call emergency services now. Rest and unlock doors for responders.'
            },
            'urgent-check': {
                type: 'result',
                level: 'urgent',
                text: 'Seek urgent medical evaluation immediately. Do not drive yourself if worsening.'
            },
            monitor: {
                type: 'result',
                level: 'watch',
                text: 'Continue monitoring. If pain returns or danger signs appear, call emergency services.'
            }
        }
    }
];

const disasterPlaybooks = [
    {
        id: 'earthquake',
        title: 'Earthquake',
        icon: '🌎',
        intro: 'Protect from falling hazards first, then evacuate damaged structures safely.',
        phases: {
            before: [
                'Secure tall furniture, TVs, and heavy wall items.',
                'Store shoes, flashlight, and whistle near bed.',
                'Practice Drop, Cover, and Hold On with household members.',
                'Set two family meeting points: one local and one out-of-area.'
            ],
            during: [
                'Drop to hands/knees, take cover under sturdy furniture, and hold on.',
                'Stay away from windows, mirrors, and tall unsecured objects.',
                'If outside, move away from buildings, signs, and power lines.',
                'If driving, pull over clear of bridges/overpasses and stay in vehicle.'
            ],
            after: [
                'Expect aftershocks and move to safer open area if structure is damaged.',
                'Check injuries and render first aid before moving serious casualties.',
                'Shut off gas/electric only if you suspect leaks or sparks.',
                'Use text/SMS for check-ins and follow local emergency updates.'
            ]
        }
    },
    {
        id: 'flood',
        title: 'Flood',
        icon: '🌊',
        intro: 'Move early to higher ground and avoid all moving water and flood roads.',
        phases: {
            before: [
                'Know evacuation routes and nearest higher-ground shelter options.',
                'Keep go-bags, medications, and important documents in waterproof pouches.',
                'Move valuables/electronics to higher levels when flood watch is issued.',
                'Charge phones and power banks before severe weather arrives.'
            ],
            during: [
                'Evacuate immediately if instructed; do not wait for visible water rise.',
                'Never walk or drive through floodwater: Turn Around, Don\'t Drown.',
                'Avoid bridges over fast-moving water and underpasses.',
                'If trapped, move to highest safe point and call emergency services.'
            ],
            after: [
                'Return only when officials declare area safe.',
                'Avoid standing water that may hide debris, sewage, or energized lines.',
                'Discard food/medications exposed to floodwater.',
                'Photograph damage for insurance and disaster assistance claims.'
            ]
        }
    },
    {
        id: 'wildfire',
        title: 'Wildfire',
        icon: '🔥',
        intro: 'Leave early, protect airways, and keep evacuation routes clear and fast.',
        phases: {
            before: [
                'Create defensible space around home and clear dry vegetation.',
                'Prepare N95 masks, goggles, and long-sleeve clothing.',
                'Set evacuation triggers and keep vehicle fueled.',
                'Save digital copies of IDs, insurance, and home inventory photos.'
            ],
            during: [
                'Evacuate when advised; do not delay to gather extra belongings.',
                'Close windows/doors, shut off HVAC if time allows, and leave lights on.',
                'Use safest route away from smoke plumes and fire direction.',
                'If trapped, call emergency services and shelter in cleared area.'
            ],
            after: [
                'Re-enter only when fire officials clear the zone.',
                'Watch for hot spots, weakened trees, and unstable structures.',
                'Use masks during cleanup to reduce ash inhalation.',
                'Document losses and contact insurers/disaster aid quickly.'
            ]
        }
    },
    {
        id: 'hurricane',
        title: 'Hurricane/Cyclone',
        icon: '🌀',
        intro: 'Prepare for wind, storm surge, and power loss over multiple days.',
        phases: {
            before: [
                'Track trusted forecasts and know local evacuation zones.',
                'Board windows or close storm shutters and secure outdoor items.',
                'Store water, shelf-stable food, and backup lighting for 3+ days.',
                'Charge devices and refrigerate meds requiring cold storage plans.'
            ],
            during: [
                'Shelter in an interior room away from windows and glass.',
                'Stay off roads unless evacuating under official order.',
                'Do not go outside during eye passage; dangerous winds return quickly.',
                'Monitor alerts for tornadoes, flooding, and surge changes.'
            ],
            after: [
                'Avoid downed lines, flooded roads, and unstable buildings.',
                'Run generators outdoors only, far from doors/windows.',
                'Boil or treat water until local supply is confirmed safe.',
                'Prioritize communication by text to reduce network congestion.'
            ]
        }
    }
];

const formatSnapshotAge = (isoDate, currentTimeMs = Date.now()) => {
    if (!isoDate) return '';
    const savedMs = new Date(isoDate).getTime();
    if (Number.isNaN(savedMs)) return '';

    const elapsedMs = Math.max(0, currentTimeMs - savedMs);
    const elapsedMinutes = Math.floor(elapsedMs / 60000);

    if (elapsedMinutes < 1) return 'just now';
    if (elapsedMinutes < 60) return `${elapsedMinutes} min ago`;

    const elapsedHours = Math.floor(elapsedMinutes / 60);
    if (elapsedHours < 24) return `${elapsedHours} hr ago`;

    const elapsedDays = Math.floor(elapsedHours / 24);
    return `${elapsedDays} day${elapsedDays === 1 ? '' : 's'} ago`;
};

const Emergency = () => {
    const [decisionSupportCollapsed, setDecisionSupportCollapsed] = useState(true);
    const [immediatePrioritiesCollapsed, setImmediatePrioritiesCollapsed] = useState(true);
    const [emergencyNumbersCollapsed, setEmergencyNumbersCollapsed] = useState(true);
    const [kitChecklistCollapsed, setKitChecklistCollapsed] = useState(true);
    const [goBagBuilderCollapsed, setGoBagBuilderCollapsed] = useState(true);
    const [firstAidGuidesCollapsed, setFirstAidGuidesCollapsed] = useState(true);
    const [decisionTreesCollapsed, setDecisionTreesCollapsed] = useState(true);
    const [playbooksCollapsed, setPlaybooksCollapsed] = useState(true);
    const [survivalMethodsCollapsed, setSurvivalMethodsCollapsed] = useState(true);
    const [trustedResourcesCollapsed, setTrustedResourcesCollapsed] = useState(true);
    const [regionMode, setRegionMode] = useState('auto');
    const [detectedRegion, setDetectedRegion] = useState('intl');
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [snapshotSavedAt, setSnapshotSavedAt] = useState('');
    const [snapshotData, setSnapshotData] = useState(null);
    const [currentTimeMs, setCurrentTimeMs] = useState(Date.now());
    const [shareMessage, setShareMessage] = useState('');
    const [shareStatus, setShareStatus] = useState('');
    const [goBagPeople, setGoBagPeople] = useState(1);
    const [goBagPackedById, setGoBagPackedById] = useState({});
    const [goBagQtyById, setGoBagQtyById] = useState({});
    const [selectedPlaybookId, setSelectedPlaybookId] = useState(disasterPlaybooks[0].id);
    const [selectedPlaybookPhase, setSelectedPlaybookPhase] = useState('during');
    const [decisionSupportStep, setDecisionSupportStep] = useState('goal');
    const [decisionSupportGoal, setDecisionSupportGoal] = useState('');
    const [decisionSupportImmediateDanger, setDecisionSupportImmediateDanger] = useState('');
    const [decisionSupportSelection, setDecisionSupportSelection] = useState('');
    const [decisionSupportTreeId, setDecisionSupportTreeId] = useState('');
    const [decisionSupportTreeNodeId, setDecisionSupportTreeNodeId] = useState('start');
    const [decisionSupportPlaybookPhase, setDecisionSupportPlaybookPhase] = useState('during');
    const [selectedFirstAidGuideId, setSelectedFirstAidGuideId] = useState(firstAidGuides[0].id);
    const [selectedDecisionTreeId, setSelectedDecisionTreeId] = useState(criticalDecisionTrees[0].id);
    const [currentDecisionNodeId, setCurrentDecisionNodeId] = useState('start');

    const emergencyNumbersSource = (!isOnline && snapshotData?.emergencyNumbersByRegion)
        ? snapshotData.emergencyNumbersByRegion
        : emergencyNumbersByRegion;
    const immediateActionsSource = (!isOnline && Array.isArray(snapshotData?.immediateActions) && snapshotData.immediateActions.length > 0)
        ? snapshotData.immediateActions
        : immediateActions;
    const kitChecklistSource = (!isOnline && Array.isArray(snapshotData?.kitChecklist) && snapshotData.kitChecklist.length > 0)
        ? snapshotData.kitChecklist
        : kitChecklist;
    const firstAidGuidesSource = (!isOnline && Array.isArray(snapshotData?.firstAidGuides) && snapshotData.firstAidGuides.length > 0)
        ? snapshotData.firstAidGuides
        : firstAidGuides;
    const decisionTreesSource = (!isOnline && Array.isArray(snapshotData?.criticalDecisionTrees) && snapshotData.criticalDecisionTrees.length > 0)
        ? snapshotData.criticalDecisionTrees
        : criticalDecisionTrees;
    const survivalHacksSource = (!isOnline && Array.isArray(snapshotData?.survivalHacks) && snapshotData.survivalHacks.length > 0)
        ? snapshotData.survivalHacks
        : survivalHacks;
    const resourcesSource = (!isOnline && Array.isArray(snapshotData?.resources) && snapshotData.resources.length > 0)
        ? snapshotData.resources
        : resources;
    const goBagItemsSource = (!isOnline && Array.isArray(snapshotData?.goBagItems) && snapshotData.goBagItems.length > 0)
        ? snapshotData.goBagItems
        : goBagItems;
    const disasterPlaybooksSource = (!isOnline && Array.isArray(snapshotData?.disasterPlaybooks) && snapshotData.disasterPlaybooks.length > 0)
        ? snapshotData.disasterPlaybooks
        : disasterPlaybooks;

    const activeRegion = regionMode === 'auto' ? detectedRegion : regionMode;
    const activeEmergencyNumbers = useMemo(
        () => emergencyNumbersSource[activeRegion] || emergencyNumbersSource.intl || emergencyNumbersByRegion.intl,
        [activeRegion, emergencyNumbersSource]
    );
    const snapshotAgeLabel = useMemo(
        () => formatSnapshotAge(snapshotSavedAt, currentTimeMs),
        [snapshotSavedAt, currentTimeMs]
    );
    const selectedFirstAidGuide = useMemo(
        () => firstAidGuidesSource.find((guide) => guide.id === selectedFirstAidGuideId) || firstAidGuidesSource[0],
        [firstAidGuidesSource, selectedFirstAidGuideId]
    );
    const selectedDecisionTree = useMemo(
        () => decisionTreesSource.find((tree) => tree.id === selectedDecisionTreeId) || decisionTreesSource[0],
        [decisionTreesSource, selectedDecisionTreeId]
    );
    const currentDecisionNode = useMemo(() => {
        if (!selectedDecisionTree?.nodes) return null;
        return selectedDecisionTree.nodes[currentDecisionNodeId] || selectedDecisionTree.nodes.start || null;
    }, [selectedDecisionTree, currentDecisionNodeId]);
    const goBagProgress = useMemo(() => {
        const total = goBagItemsSource.length;
        if (total < 1) return { packed: 0, total: 0, percent: 0 };
        const packed = goBagItemsSource.filter((item) => goBagPackedById[item.id]).length;
        const percent = Math.round((packed / total) * 100);
        return { packed, total, percent };
    }, [goBagItemsSource, goBagPackedById]);
    const selectedPlaybook = useMemo(
        () => disasterPlaybooksSource.find((playbook) => playbook.id === selectedPlaybookId) || disasterPlaybooksSource[0],
        [disasterPlaybooksSource, selectedPlaybookId]
    );
    const selectedPlaybookSteps = useMemo(() => {
        if (!selectedPlaybook?.phases) return [];
        return selectedPlaybook.phases[selectedPlaybookPhase] || selectedPlaybook.phases.during || [];
    }, [selectedPlaybook, selectedPlaybookPhase]);
    const decisionSupportTree = useMemo(
        () => decisionTreesSource.find((tree) => tree.id === decisionSupportTreeId) || null,
        [decisionTreesSource, decisionSupportTreeId]
    );
    const decisionSupportTreeNode = useMemo(() => {
        if (!decisionSupportTree?.nodes) return null;
        return decisionSupportTree.nodes[decisionSupportTreeNodeId] || decisionSupportTree.nodes.start || null;
    }, [decisionSupportTree, decisionSupportTreeNodeId]);
    const decisionSupportGuide = useMemo(() => {
        const selectedOption = medicalDecisionOptions.find((option) => option.id === decisionSupportSelection);
        if (!selectedOption || selectedOption.type !== 'guide') return null;
        return firstAidGuidesSource.find((guide) => guide.id === selectedOption.guideId) || null;
    }, [decisionSupportSelection, firstAidGuidesSource]);
    const decisionSupportPlaybook = useMemo(
        () => disasterPlaybooksSource.find((playbook) => playbook.id === decisionSupportSelection) || null,
        [decisionSupportSelection, disasterPlaybooksSource]
    );
    const decisionSupportPlaybookSteps = useMemo(() => {
        if (!decisionSupportPlaybook?.phases) return [];
        return decisionSupportPlaybook.phases[decisionSupportPlaybookPhase] || decisionSupportPlaybook.phases.during || [];
    }, [decisionSupportPlaybook, decisionSupportPlaybookPhase]);

    useEffect(() => {
        setDetectedRegion(detectRegion());
        try {
            const snapshotRaw = localStorage.getItem(EMERGENCY_SNAPSHOT_KEY);
            const snapshot = snapshotRaw ? JSON.parse(snapshotRaw) : null;
            if (snapshot?.savedAt) {
                setSnapshotSavedAt(snapshot.savedAt);
                setSnapshotData(snapshot);
            }
        } catch (error) {
            // Ignore malformed snapshot and continue without blocking the page.
        }

        try {
            const goBagRaw = localStorage.getItem(GO_BAG_PROGRESS_KEY);
            const goBagProgressState = goBagRaw ? JSON.parse(goBagRaw) : null;
            if (Number.isInteger(goBagProgressState?.people) && goBagProgressState.people > 0) {
                setGoBagPeople(goBagProgressState.people);
            }
            if (goBagProgressState?.packedById && typeof goBagProgressState.packedById === 'object') {
                setGoBagPackedById(goBagProgressState.packedById);
            }
            if (goBagProgressState?.qtyById && typeof goBagProgressState.qtyById === 'object') {
                setGoBagQtyById(goBagProgressState.qtyById);
            }
        } catch (error) {
            // Ignore malformed go-bag progress and continue with defaults.
        }
    }, []);

    useEffect(() => {
        const markOnline = () => setIsOnline(true);
        const markOffline = () => setIsOnline(false);
        window.addEventListener('online', markOnline);
        window.addEventListener('offline', markOffline);
        return () => {
            window.removeEventListener('online', markOnline);
            window.removeEventListener('offline', markOffline);
        };
    }, []);

    useEffect(() => {
        if (!snapshotSavedAt) return undefined;
        const interval = setInterval(() => {
            setCurrentTimeMs(Date.now());
        }, 60000);
        return () => clearInterval(interval);
    }, [snapshotSavedAt]);

    useEffect(() => {
        if (!selectedFirstAidGuide) return;
        if (selectedFirstAidGuide.id !== selectedFirstAidGuideId) {
            setSelectedFirstAidGuideId(selectedFirstAidGuide.id);
        }
    }, [selectedFirstAidGuide, selectedFirstAidGuideId]);

    useEffect(() => {
        if (!selectedDecisionTree) return;
        if (selectedDecisionTree.id !== selectedDecisionTreeId) {
            setSelectedDecisionTreeId(selectedDecisionTree.id);
        }
        setCurrentDecisionNodeId('start');
    }, [selectedDecisionTree, selectedDecisionTreeId]);

    useEffect(() => {
        if (!selectedPlaybook) return;
        if (selectedPlaybook.id !== selectedPlaybookId) {
            setSelectedPlaybookId(selectedPlaybook.id);
        }
        if (!selectedPlaybook?.phases?.[selectedPlaybookPhase]) {
            setSelectedPlaybookPhase('during');
        }
    }, [selectedPlaybook, selectedPlaybookId, selectedPlaybookPhase]);

    useEffect(() => {
        const progress = {
            people: goBagPeople,
            packedById: goBagPackedById,
            qtyById: goBagQtyById
        };
        localStorage.setItem(GO_BAG_PROGRESS_KEY, JSON.stringify(progress));
    }, [goBagPeople, goBagPackedById, goBagQtyById]);

    const saveOfflineSnapshot = () => {
        const savedAt = new Date().toISOString();
        const snapshot = {
            savedAt,
            emergencyNumbersByRegion,
            immediateActions,
            kitChecklist,
            firstAidGuides,
            criticalDecisionTrees,
            goBagItems,
            disasterPlaybooks,
            survivalHacks,
            resources
        };
        localStorage.setItem(EMERGENCY_SNAPSHOT_KEY, JSON.stringify(snapshot));
        console.log('Emergency snapshot saved offline at', EMERGENCY_SNAPSHOT_KEY);
        setSnapshotSavedAt(savedAt);
        setSnapshotData(snapshot);
    };

    const getCurrentPosition = () => new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation unavailable'));
            return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });
    });

    const buildLocationMessage = async () => {
        const response = await getCurrentPosition();
        const lat = Number(response.coords.latitude).toFixed(6);
        const lon = Number(response.coords.longitude).toFixed(6);
        const mapUrl = `https://maps.google.com/?q=${lat},${lon}`;
        const msg = `Emergency. I need help at/near ${lat}, ${lon}. Map: ${mapUrl}`;
        setShareMessage(msg);
        return msg;
    };

    const handleCopyLocation = async () => {
        try {
            const msg = shareMessage || await buildLocationMessage();
            await navigator.clipboard.writeText(msg);
            setShareStatus('Location copied. Paste into SMS/call notes.');
        } catch (error) {
            setShareStatus('Unable to get/copy location. Check browser permissions.');
        }
    };

    const handleShareSms = async () => {
        try {
            const msg = shareMessage || await buildLocationMessage();
            window.location.href = `sms:?&body=${encodeURIComponent(msg)}`;
        } catch (error) {
            setShareStatus('Unable to create SMS message. Check location permissions.');
        }
    };

    const moveDecisionTree = (nextNodeId) => {
        if (!nextNodeId) return;
        setCurrentDecisionNodeId(nextNodeId);
    };

    const resetDecisionTree = () => {
        setCurrentDecisionNodeId('start');
    };

    const getGoBagRecommendedQty = (item) => {
        const baseQty = Number(item?.baseQty || 1);
        return item?.perPerson ? Math.max(1, baseQty * goBagPeople) : Math.max(1, baseQty);
    };

    const getGoBagCurrentQty = (item) => {
        const custom = Number(goBagQtyById[item.id]);
        if (Number.isInteger(custom) && custom > 0) return custom;
        return getGoBagRecommendedQty(item);
    };

    const adjustGoBagQty = (itemId, nextQty) => {
        const safeQty = Math.max(1, Number(nextQty) || 1);
        setGoBagQtyById((prev) => ({ ...prev, [itemId]: safeQty }));
    };

    const toggleGoBagPacked = (itemId) => {
        setGoBagPackedById((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
    };

    const resetGoBagBuilder = () => {
        setGoBagPeople(1);
        setGoBagPackedById({});
        setGoBagQtyById({});
    };

    const resetDecisionSupport = () => {
        setDecisionSupportStep('goal');
        setDecisionSupportGoal('');
        setDecisionSupportImmediateDanger('');
        setDecisionSupportSelection('');
        setDecisionSupportTreeId('');
        setDecisionSupportTreeNodeId('start');
        setDecisionSupportPlaybookPhase('during');
    };

    const selectDecisionSupportGoal = (goalId) => {
        setDecisionSupportGoal(goalId);
        setDecisionSupportSelection('');
        setDecisionSupportTreeId('');
        setDecisionSupportTreeNodeId('start');
        setDecisionSupportPlaybookPhase('during');
        setDecisionSupportStep('danger');
    };

    const setDecisionSupportDanger = (dangerLevel) => {
        setDecisionSupportImmediateDanger(dangerLevel);
        if (decisionSupportGoal === 'contacts') {
            setDecisionSupportStep('result');
            return;
        }
        setDecisionSupportStep('detail');
    };

    const selectDecisionSupportDetail = (selectionId) => {
        setDecisionSupportSelection(selectionId);

        if (decisionSupportGoal === 'medical') {
            const selectedOption = medicalDecisionOptions.find((option) => option.id === selectionId);
            if (selectedOption?.type === 'tree') {
                setDecisionSupportTreeId(selectionId);
                setDecisionSupportTreeNodeId('start');
                setDecisionSupportStep('tree');
                return;
            }
            setDecisionSupportStep('result');
            return;
        }

        if (decisionSupportGoal === 'disaster') {
            setDecisionSupportPlaybookPhase('during');
            setDecisionSupportStep('phase');
            return;
        }

        setDecisionSupportStep('result');
    };

    const moveDecisionSupportTree = (nextNodeId) => {
        if (!nextNodeId) return;
        setDecisionSupportTreeNodeId(nextNodeId);
    };

    return (
        <div className='containerDetail contentLeft bg-lite ml-5 mr-5 mt--25'>
            <div className='containerDetail bg-lite pl-15 pt-20 pb-20 color-yellow size25 mb-5'>
                <span className='mr-5'>{icons.emergency || 'SOS'}</span>
                Emergency
            </div>

            <div className='containerDetail bg-lite color-lite mt-5'>
                <div className='containerDetail pl-10 pt-20 pb-20 bg-lite flexContainer'>
                    <div className='size20 color-yellow flex2Column'>
                        Emergency Share and Status:
                    </div>
                    <div className='flexColumn size12'>
                        {isOnline ? <span className='containerDetail bg-dkGreen brdr-green color-yellow mr-10 p-10'>Online</span> : <span className='containerDetail bg-dkRed brdr-red color-yellow mr-10 p-10'>Offline</span>}
                    </div>
                </div>
                <div className='flexContainer containerDetail bg-lite mt-5'>
                    <div className='flex2Column color-orange p-10'>
                        {snapshotSavedAt ? `Snapshot saved: ${new Date(snapshotSavedAt).toLocaleString()}` : ''}
                    </div>
                    <div className='flexColumn color-orange p-10'>
                        {
                            snapshotSavedAt
                            ? snapshotAgeLabel
                            : null
                        }
                    </div>
                </div>
                {
                    (!isOnline && snapshotData)
                        ? <div className='containerDetail color-yellow p-10 bg-dark mt-5'>Using offline snapshot data.</div>
                        : null
                }
                <div className='flexContainer mt-10 contentCenter'>
                    <div className='button containerDetail flexContainer p-10 bg-green mr-5' onClick={handleCopyLocation}>
                        <div className='flexColumn size30'>
                            📍
                        </div>
                        <div className='flex2Column'>
                            Copy My Location
                        </div>
                    </div>
                    <div className='button containerDetail flexContainer p-10 bg-green mr-5' onClick={handleShareSms}>
                        <div className='flexColumn size30'>
                            📩
                        </div>
                        <div className='flex2Column'>
                            Share via SMS
                        </div>
                    </div>
                    <div className='button containerDetail flexContainer p-10 bg-green' onClick={saveOfflineSnapshot}>
                        <div className='flexColumn size30'>
                            💾
                        </div>
                        <div className='flex2Column'>
                            Save Offline Snapshot
                        </div>
                        
                    </div>
                </div>
                {
                    shareStatus
                        ? <div className='containerDetail mt-10 color-orange p-10'>{shareStatus}</div>
                        : null
                }
            </div>

            <div className={`containerDetail color-lite size20 ${(!decisionSupportCollapsed) ? 'bg-dkGreen': 'bg-lite'} mb-5 mt-5`}>
                <div className='containerDetail bg-lite color-yellow'>
                    <CollapseToggleButton
                        title='Decision Support'
                        isCollapsed={decisionSupportCollapsed}
                        setCollapse={setDecisionSupportCollapsed}
                        align='left'
                    />
                </div>
                {
                    decisionSupportCollapsed
                        ? null
                        : <div className='containerDetail bg-lite mt-5'>
                            <div className='containerDetail bg-tinted p-15'>
                                <div className='color-yellow size20'>Guided Decision Support</div>
                                <div className='color-orange mt-5 size15'>
                                    One question at a time to help identify the best next action.
                                </div>
                            </div>

                            {
                                decisionSupportStep === 'goal'
                                    ? <div className='containerDetail mt-10'>
                                        <div className='color-yellow p-10'>What do you need right now?</div>
                                        {decisionSupportGoalOptions.map((option) => (
                                            <div
                                                key={option.id}
                                                className='button containerDetail bg-lite p-15 mt-5'
                                                onClick={() => selectDecisionSupportGoal(option.id)}
                                            >
                                                {option.label}
                                            </div>
                                        ))}
                                    </div>
                                    : null
                            }

                            {
                                decisionSupportStep === 'danger'
                                    ? <div className='containerDetail mt-10'>
                                        <div className='color-yellow p-10'>Is anyone in immediate life-threatening danger?</div>
                                        <div className='flexContainer'>
                                            <div className='button containerDetail bg-green p-10 mr-5' onClick={() => setDecisionSupportDanger('yes')}>
                                                Yes
                                            </div>
                                            <div className='button containerDetail bg-orange p-10 mr-5' onClick={() => setDecisionSupportDanger('no')}>
                                                No
                                            </div>
                                            <div className='button containerDetail bg-lite p-10' onClick={resetDecisionSupport}>
                                                Restart
                                            </div>
                                        </div>
                                    </div>
                                    : null
                            }

                            {
                                decisionSupportStep === 'detail' && decisionSupportGoal === 'medical'
                                    ? <div className='containerDetail mt-10'>
                                        <div className='color-yellow p-10'>Which medical issue is closest to what you see?</div>
                                        {medicalDecisionOptions.map((option) => (
                                            <div
                                                key={option.id}
                                                className='button containerDetail bg-lite p-15 mt-5'
                                                onClick={() => selectDecisionSupportDetail(option.id)}
                                            >
                                                {option.label}
                                            </div>
                                        ))}
                                    </div>
                                    : null
                            }

                            {
                                decisionSupportStep === 'detail' && decisionSupportGoal === 'disaster'
                                    ? <div className='containerDetail mt-10'>
                                        <div className='color-yellow p-10'>What event are you dealing with?</div>
                                        {disasterPlaybooksSource.map((playbook) => (
                                            <div
                                                key={playbook.id}
                                                className='button containerDetail bg-lite p-15 mt-5'
                                                onClick={() => selectDecisionSupportDetail(playbook.id)}
                                            >
                                                {playbook.icon} {playbook.title}
                                            </div>
                                        ))}
                                    </div>
                                    : null
                            }

                            {
                                decisionSupportStep === 'detail' && decisionSupportGoal === 'preparedness'
                                    ? <div className='containerDetail mt-10'>
                                        <div className='color-yellow p-10'>What preparedness area should we optimize first?</div>
                                        {preparednessFocusOptions.map((option) => (
                                            <div
                                                key={option.id}
                                                className='button containerDetail bg-lite p-15 mt-5'
                                                onClick={() => selectDecisionSupportDetail(option.id)}
                                            >
                                                {option.label}
                                            </div>
                                        ))}
                                    </div>
                                    : null
                            }

                            {
                                decisionSupportStep === 'phase' && decisionSupportGoal === 'disaster'
                                    ? <div className='containerDetail mt-10'>
                                        <div className='color-yellow p-10'>Choose the timeline phase:</div>
                                        <div className='flexContainer'>
                                            {['before', 'during', 'after'].map((phase) => (
                                                <div
                                                    key={phase}
                                                    className={`button containerDetail p-10 mr-5 ${decisionSupportPlaybookPhase === phase ? 'bg-green' : 'bg-lite'}`}
                                                    onClick={() => {
                                                        setDecisionSupportPlaybookPhase(phase);
                                                        setDecisionSupportStep('result');
                                                    }}
                                                >
                                                    {phase === 'before' ? 'Before' : phase === 'during' ? 'During' : 'After'}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    : null
                            }

                            {
                                decisionSupportStep === 'tree' && decisionSupportTree
                                    ? <div className='containerDetail mt-10'>
                                        <div className='containerDetail bg-lite p-15'>
                                            <div className='color-yellow size20'>{decisionSupportTree.title}</div>
                                            <div className='color-orange mt-5'>{decisionSupportTree.intro}</div>
                                        </div>
                                        {
                                            decisionSupportTreeNode?.type === 'question'
                                                ? <div className='containerDetail bg-tinted p-15 mt-10'>
                                                    <div className='color-lite mb-10'>{decisionSupportTreeNode.text}</div>
                                                    <div className='flexContainer'>
                                                        <div
                                                            className='button containerDetail bg-green p-10 mr-5'
                                                            onClick={() => moveDecisionSupportTree(decisionSupportTreeNode.yes)}
                                                        >
                                                            Yes
                                                        </div>
                                                        <div
                                                            className='button containerDetail bg-orange p-10 mr-5'
                                                            onClick={() => moveDecisionSupportTree(decisionSupportTreeNode.no)}
                                                        >
                                                            No
                                                        </div>
                                                        <div
                                                            className='button containerDetail bg-lite p-10'
                                                            onClick={resetDecisionSupport}
                                                        >
                                                            Restart
                                                        </div>
                                                    </div>
                                                </div>
                                                : null
                                        }
                                        {
                                            decisionSupportTreeNode?.type === 'result'
                                                ? <div className='containerDetail bg-tinted p-15 mt-10'>
                                                    <div className='color-yellow mb-5'>
                                                        {decisionSupportTreeNode.level === 'critical' ? 'Critical Action' : decisionSupportTreeNode.level === 'urgent' ? 'Urgent Action' : 'Watch and Reassess'}
                                                    </div>
                                                    <div className='color-lite mb-10'>{decisionSupportTreeNode.text}</div>
                                                    <div className='flexContainer'>
                                                        <div className='button containerDetail bg-green p-10 mr-5' onClick={() => setDecisionSupportStep('result')}>
                                                            View Next Steps
                                                        </div>
                                                        <div className='button containerDetail bg-lite p-10' onClick={resetDecisionSupport}>
                                                            Restart
                                                        </div>
                                                    </div>
                                                </div>
                                                : null
                                        }
                                    </div>
                                    : null
                            }

                            {
                                decisionSupportStep === 'result'
                                    ? <div className='containerDetail mt-10'>
                                        {
                                            decisionSupportImmediateDanger === 'yes'
                                                ? <div className='containerDetail bg-dkRed brdr-red p-15 mb-10'>
                                                    <div className='color-yellow size20'>Immediate Escalation</div>
                                                    <div className='color-lite mt-5'>Call emergency services now and keep communication short/clear.</div>
                                                    <div className='mt-10'>
                                                        {activeEmergencyNumbers.map((item) => (
                                                            <div key={`decision-support-number-${item.region}-${item.number}`} className='containerDetail bg-lite mt-5 p-10 flexContainer'>
                                                                <div className='flexColumn color-yellow'><b>{item.region}</b></div>
                                                                <div className='flexColumn color-orange pl-15 pr-15'>{item.number}</div>
                                                                <div className='flex2Column color-lite'>{item.note}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                : null
                                        }

                                        {
                                            decisionSupportGoal === 'contacts'
                                                ? <div className='containerDetail bg-lite p-15 mb-10'>
                                                    <div className='color-yellow size20'>Rapid Contact Workflow</div>
                                                    <div className='color-orange mt-5'>Use the emergency numbers below, then send your location via Copy/Share tools.</div>
                                                    <div className='containerDetail mt-10 color-lite p-10 bg-tinted'>
                                                        {shareMessage ? shareMessage : 'Tap Copy My Location or Share via SMS in the Emergency Share and Status section.'}
                                                    </div>
                                                </div>
                                                : null
                                        }

                                        {
                                            decisionSupportGoal === 'medical' && decisionSupportTreeNode?.type === 'result'
                                                ? <div className='containerDetail bg-lite p-15 mb-10'>
                                                    <div className='color-yellow size20'>Recommended Medical Path</div>
                                                    <div className='color-lite mt-5'>{decisionSupportTreeNode.text}</div>
                                                    <div className='color-orange mt-10'>Immediate priorities:</div>
                                                    {immediateActionsSource.slice(0, 3).map((item) => (
                                                        <div key={`decision-support-priority-${item}`} className='containerDetail bg-tinted mt-5 p-10'>
                                                            {item}
                                                        </div>
                                                    ))}
                                                </div>
                                                : null
                                        }

                                        {
                                            decisionSupportGoal === 'medical' && decisionSupportGuide
                                                ? <div className='containerDetail bg-lite p-15 mb-10'>
                                                    <div className='color-yellow size20'>{decisionSupportGuide.title}</div>
                                                    <div className='color-orange mt-5'>{decisionSupportGuide.caution}</div>
                                                    <div className='mt-10'>
                                                        {decisionSupportGuide.steps.map((step) => (
                                                            <div key={`decision-support-guide-${step}`} className='containerDetail flexContainer bg-tinted mt-5'>
                                                                <div className='flexColumn size30 p-10'>{step.split(' ')[0]}</div>
                                                                <div className='flex2Column p-15'>{step.substring(3, step.length)}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                : null
                                        }

                                        {
                                            decisionSupportGoal === 'disaster' && decisionSupportPlaybook
                                                ? <div className='containerDetail bg-lite p-15 mb-10'>
                                                    <div className='color-yellow size20'>{decisionSupportPlaybook.icon} {decisionSupportPlaybook.title}</div>
                                                    <div className='color-orange mt-5'>{decisionSupportPlaybook.intro}</div>
                                                    <div className='containerDetail bg-tinted mt-10 p-10'>
                                                        <div className='color-yellow'>Phase: {decisionSupportPlaybookPhase === 'before' ? 'Before' : decisionSupportPlaybookPhase === 'during' ? 'During' : 'After'}</div>
                                                    </div>
                                                    <div className='mt-10'>
                                                        {decisionSupportPlaybookSteps.map((step) => (
                                                            <div key={`decision-support-playbook-${step}`} className='containerDetail flexContainer bg-tinted mt-5'>
                                                                <div className='flexColumn size30 p-10'>•</div>
                                                                <div className='flex2Column p-15'>{step}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                : null
                                        }

                                        {
                                            decisionSupportGoal === 'preparedness' && decisionSupportSelection === 'kit'
                                                ? <div className='containerDetail bg-lite p-15 mb-10'>
                                                    <div className='color-yellow size20'>72 Hour Kit Focus</div>
                                                    {kitChecklistSource.map((item) => (
                                                        <div key={`decision-support-kit-${item}`} className='containerDetail flexContainer bg-tinted mt-5'>
                                                            <div className='flexColumn size30 p-10'>{item.split(' ')[0]}</div>
                                                            <div className='flex2Column p-15'>{item.substring(2, item.length)}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                                : null
                                        }

                                        {
                                            decisionSupportGoal === 'preparedness' && decisionSupportSelection === 'gobag'
                                                ? <div className='containerDetail bg-lite p-15 mb-10'>
                                                    <div className='color-yellow size20'>Go-Bag Action Plan</div>
                                                    <div className='color-orange mt-5'>Household size: {goBagPeople}. Progress: {goBagProgress.packed}/{goBagProgress.total} packed.</div>
                                                    {goBagItemsSource.slice(0, 8).map((item) => (
                                                        <div key={`decision-support-gobag-${item.id}`} className='containerDetail flexContainer bg-tinted mt-5'>
                                                            <div className='flexColumn size30 p-10'>{item.icon}</div>
                                                            <div className='flex2Column p-15'>{item.label} ({item.category})</div>
                                                            <div className='flexColumn color-yellow p-15'>x {getGoBagRecommendedQty(item)}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                                : null
                                        }

                                        {
                                            decisionSupportGoal === 'preparedness' && decisionSupportSelection === 'survival'
                                                ? <div className='containerDetail bg-lite p-15 mb-10'>
                                                    <div className='color-yellow size20'>Survival Methods</div>
                                                    {survivalHacksSource.map((item) => (
                                                        <div key={`decision-support-survival-${item}`} className='containerDetail flexContainer bg-tinted mt-5'>
                                                            <div className='flexColumn size30 p-10'>{item.split(' ')[0]}</div>
                                                            <div className='flex2Column p-15'>{item.substring(2, item.length)}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                                : null
                                        }

                                        {
                                            decisionSupportGoal === 'preparedness' && decisionSupportSelection === 'resources'
                                                ? <div className='containerDetail bg-lite p-15 mb-10'>
                                                    <div className='color-yellow size20'>Trusted Resources</div>
                                                    {resourcesSource.map((item) => (
                                                        <div key={`decision-support-resource-${item.url}`} className='containerDetail bg-tinted mt-5 p-15'>
                                                            <a
                                                                className='color-lite'
                                                                href={item.url}
                                                                target='_blank'
                                                                rel='noreferrer'
                                                                aria-label={`Open trusted resource: ${item.name}`}
                                                            >
                                                                {item.name}
                                                            </a>
                                                        </div>
                                                    ))}
                                                </div>
                                                : null
                                        }

                                        <div className='flexContainer mt-10'>
                                            <div className='button containerDetail bg-green p-10 mr-5' onClick={resetDecisionSupport}>
                                                Start Over
                                            </div>
                                            {
                                                decisionSupportGoal === 'contacts'
                                                    ? null
                                                    : <div className='button containerDetail bg-lite p-10' onClick={() => setDecisionSupportStep('detail')}>
                                                        Refine Choices
                                                    </div>
                                            }
                                        </div>
                                    </div>
                                    : null
                            }
                        </div>
                }
            </div>

            <div className={`containerDetail color-lite size20 ${(!immediatePrioritiesCollapsed) ? 'bg-dkGreen': 'bg-lite'} mb-5 mt-5`}>
                <div className='containerDetail bg-lite color-yellow'>
                    <CollapseToggleButton
                        title='Priorities 👀📞🩸🫀⚡️🔥🫤'
                        isCollapsed={immediatePrioritiesCollapsed}
                        setCollapse={setImmediatePrioritiesCollapsed}
                        align='left'
                    />
                </div>
                {
                    immediatePrioritiesCollapsed
                        ? null
                        : immediateActionsSource.map((item) => (
                            <div className='containerDetail bg-lite flexContainer mt-5' key={item}>
                                <div className='pl-10 flexColumn size50'>
                                    {item.split(' ')[0]}
                                </div>
                                <div className='flex2Column p-20' key={item}>
                                    {
                                        item
                                            .split('\n')
                                            .map((line, index) => (
                                                <div key={index}>{line.substring(2,line.length)}</div>
                                            ))
                                    }
                                </div>
                            </div>
                        ))
                }
            </div>

            <div className={`containerDetail color-lite size20 ${(!emergencyNumbersCollapsed) ? 'bg-dkGreen': 'bg-lite'} mb-5`}>
                <div className='containerDetail bg-lite color-yellow'>
                    <CollapseToggleButton
                        title='Emergency Numbers'
                        isCollapsed={emergencyNumbersCollapsed}
                        setCollapse={setEmergencyNumbersCollapsed}
                        align='left'
                    />
                </div>
                {
                    emergencyNumbersCollapsed
                        ? null
                        : <div>
                            <div className='containerDetail bg-lite mt-5 flexContainer p-10'>
                                <div className='flex2Column ml-10 mt-15'>Region:</div>
                                <select
                                    className='containerDetail flex2Column bg-lite color-yellow mb-5'
                                    value={regionMode}
                                    onChange={(event) => setRegionMode(event.target.value)}
                                >
                                    {regionOptions.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                            {activeEmergencyNumbers.map((item) => (
                                <div className='containerDetail bg-lite color-lite p-20 mt-5 flexContainer' key={`${item.region}-${item.number}`}>
                                    <div className='flexColumn color-yellow'><b>{item.region}</b></div>
                                    <div className='flexColumn color-orange pl-15 pr-15'>{item.number}</div>
                                    <div className='flex2Column'>{item.note}</div>
                                </div>
                            ))}
                        </div>
                }
            </div>

            <div className={`containerDetail color-lite size20 ${(!kitChecklistCollapsed) ? 'bg-dkGreen': 'bg-lite'} mb-5`}>
                <div className='containerDetail bg-lite color-yellow'>
                    <CollapseToggleButton
                        title='72 Hour Kit'
                        isCollapsed={kitChecklistCollapsed}
                        setCollapse={setKitChecklistCollapsed}
                        align='left'
                    />
                </div>
                {
                    kitChecklistCollapsed
                        ? null
                        : kitChecklistSource.map((item) => (
                            <div className='containerDetail flexContainer bg-lite mt-5' key={item}>
                                <div className='pl-10 flexColumn size50'>
                                    {item.split(' ')[0]}
                                </div>
                                <div className='flex2Column p-20 mt-5'>
                                    {item.substring(2,item.length)}
                                </div>
                            </div>
                        ))
                }
            </div>

            <div className={`containerDetail color-lite size20 ${(!goBagBuilderCollapsed) ? 'bg-dkGreen': 'bg-lite'} mb-5`}>
                <div className='containerDetail bg-lite color-yellow'>
                    <CollapseToggleButton
                        title='Go-Bag Builder'
                        isCollapsed={goBagBuilderCollapsed}
                        setCollapse={setGoBagBuilderCollapsed}
                        align='left'
                    />
                </div>
                {
                    goBagBuilderCollapsed
                        ? null
                        : <div className='containerDetail bg-lite mt-5'>
                            <div className='containerDetail bg-tinted'>
                                <div className='containerDetail p-15'>
                                    <div className='color-yellow size20'>
                                        Progress: <span className='color-lite containerDetail p-10'>{goBagProgress.packed}/{goBagProgress.total}</span> packed <span className='containerDetail color-lite p-10'>({goBagProgress.percent}%)</span>
                                    </div>
                                    <div className='color-orange mt-10 size15'>
                                        Adjust household size to auto-scale person-based supplies.
                                    </div>
                                </div>
                                <div className='containerDetail flexContainer mt-5 p-10'>
                                    <div className='color-lite p-10'>
                                        People:
                                    </div>
                                    <div className='button containerDetail bg-lite p-10 mr-5' onClick={() => setGoBagPeople((prev) => Math.max(1, prev - 1))}>
                                        -
                                    </div>
                                    <div className='containerDetail bg-dark p-10 mr-5 color-yellow'>
                                        {goBagPeople}
                                    </div>
                                    <div className='button containerDetail bg-lite p-10 mr-10' onClick={() => setGoBagPeople((prev) => Math.min(12, prev + 1))}>
                                        +
                                    </div>
                                    <div className='button containerDetail bg-green p-10' onClick={resetGoBagBuilder}>
                                        Reset
                                    </div>
                                </div>
                            </div>
                            <div className='containerDetail mt-5 ht-400'>
                                {goBagItemsSource.map((item) => {
                                    const recommendedQty = getGoBagRecommendedQty(item);
                                    const currentQty = getGoBagCurrentQty(item);
                                    const isPacked = Boolean(goBagPackedById[item.id]);

                                    return (
                                        <div key={item.id} className='containerDetail mt-5'>
                                            <div className='containerDetail flexContainer bg-lite'>
                                                <label className={`flexColumn button p-10 ${isPacked ? 'containerDetail bg-dkGreen brdr-green' : ''}`}>
                                                    <input
                                                        type='checkbox'
                                                        checked={isPacked}
                                                        className=''
                                                        onChange={() => toggleGoBagPacked(item.id)}
                                                        aria-label={`Mark ${item.label} as packed`}
                                                    />
                                                </label>
                                                <div className='flexColumn size30 pl-10 pr-10'>{item.icon}</div>
                                                <div className='flex2Column'>
                                                    <div className='color-yellow'>{item.label}</div>
                                                    <div className='color-orange size12'>{item.category} | Recommended: {recommendedQty}</div>
                                                </div>
                                            </div>

                                            <div className='flexContainer mt-10 contentRight'>
                                                <div className='color-lite p-10'>Qty:</div>
                                                <div className='button containerDetail bg-lite p-10 mr-5' onClick={() => adjustGoBagQty(item.id, currentQty - 1)}>-</div>
                                                <div className='containerDetail bg-dark p-10 mr-5 color-yellow'>{currentQty}</div>
                                                <div className='button containerDetail bg-lite p-10' onClick={() => adjustGoBagQty(item.id, currentQty + 1)}>+</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                }
            </div>

            <div className={`containerDetail color-lite size20 ${(!firstAidGuidesCollapsed) ? 'bg-dkGreen': 'bg-lite'} mb-5 mt-5`}>
                <div className='containerDetail bg-lite color-yellow'>
                    <CollapseToggleButton
                        title='Interactive First Aid Guides'
                        isCollapsed={firstAidGuidesCollapsed}
                        setCollapse={setFirstAidGuidesCollapsed}
                        align='left'
                    />
                </div>
                {
                    firstAidGuidesCollapsed
                        ? null
                        : <div className='containerDetail bg-lite mt-5'>
                            <div className='containerDetail bg-lite'>
                                {firstAidGuidesSource.map((guide) => (
                                    <div
                                        key={guide.id}
                                        className={`button containerDetail p-10 mt-5 mr-5 ${selectedFirstAidGuide?.id === guide.id ? 'bg-green' : 'bg-tinted'} w--5`}
                                        onClick={() => setSelectedFirstAidGuideId(guide.id)}
                                    >
                                        {guide.title}
                                    </div>
                                ))}
                            </div>
                            {
                                selectedFirstAidGuide
                                    ? <div className='mt-5'>
                                        <div className='containerDetail bg-lite p-15'>
                                            <div className='color-yellow size20 mb-5'>{selectedFirstAidGuide.title}</div>
                                            <div className='color-orange mb-10'>{selectedFirstAidGuide.caution}</div>
                                        </div>
                                        <div>
                                            {selectedFirstAidGuide.steps.map((step) => (
                                                <li key={step} className='containerDetail flexContainer mt-5 bg-lite'>
                                                    <div className='flexColumn size30 p-20'>
                                                        {step.split(' ')[0]}
                                                    </div>
                                                    <div className='flex2Column p-20 mt-5'>
                                                        {step.substring(3, step.length)}
                                                    </div>
                                                </li>
                                            ))}
                                        </div>
                                    </div>
                                    : null
                            }
                        </div>
                }
            </div>
            <div className={`containerDetail color-lite size20 ${(!survivalMethodsCollapsed) ? 'bg-dkGreen': 'bg-lite'} mb-5`}>
                <div className='containerDetail bg-lite color-yellow'>
                    <CollapseToggleButton
                        title='Survival Methods'
                        isCollapsed={survivalMethodsCollapsed}
                        setCollapse={setSurvivalMethodsCollapsed}
                        align='left'
                    />
                </div>
                {
                    survivalMethodsCollapsed
                        ? null
                        : survivalHacksSource.map((item) => (
                            <div className='containerDetail flexContainer bg-lite mt-5' key={item}>
                                <div className='pl-10 flexColumn size50'>
                                    {item.split(' ')[0]}
                                </div>
                                <div className='flex2Column p-20 mt-5'>
                                    {item.substring(2, item.length)}
                                </div>
                            </div>
                            
                        ))
                }
            </div>

            <div className={`containerDetail color-lite size20 ${(!decisionTreesCollapsed) ? 'bg-dkGreen': 'bg-lite'} mb-5 mt-5`}>
                <div className='containerDetail bg-lite color-yellow'>
                    <CollapseToggleButton
                        title='Critical Decision Trees'
                        isCollapsed={decisionTreesCollapsed}
                        setCollapse={setDecisionTreesCollapsed}
                        align='left'
                    />
                </div>
                {
                    decisionTreesCollapsed
                        ? null
                        : <div className='containerDetail bg-lite mt-5'>
                            <div className='containerDetail bg-lite'>
                                {decisionTreesSource.map((tree) => (
                                    <div
                                        key={tree.id}
                                        className={`button containerDetail p-10 mt-5 mr-5 ${selectedDecisionTree?.id === tree.id ? 'bg-green' : 'bg-tinted'} w--5`}
                                        onClick={() => {
                                            setSelectedDecisionTreeId(tree.id);
                                            setCurrentDecisionNodeId('start');
                                        }}
                                    >
                                        {tree.title}
                                    </div>
                                ))}
                            </div>

                            {
                                selectedDecisionTree
                                    ? <div className='containerDetail bg-lite p-15 mt-10'>
                                        <div className='color-yellow size20 mb-5'>{selectedDecisionTree.title}</div>
                                        <div className='color-orange mb-10'>{selectedDecisionTree.intro}</div>

                                        {
                                            currentDecisionNode?.type === 'question'
                                                ? <div className='containerDetail bg-tinted p-15'>
                                                    <div className='color-lite mb-10'>{currentDecisionNode.text}</div>
                                                    <div className='flexContainer'>
                                                        <div
                                                            className='button containerDetail bg-green p-10 mr-5'
                                                            onClick={() => moveDecisionTree(currentDecisionNode.yes)}
                                                        >
                                                            Yes
                                                        </div>
                                                        <div
                                                            className='button containerDetail bg-orange p-10 mr-5'
                                                            onClick={() => moveDecisionTree(currentDecisionNode.no)}
                                                        >
                                                            No
                                                        </div>
                                                        <div
                                                            className='button containerDetail bg-lite p-10'
                                                            onClick={resetDecisionTree}
                                                        >
                                                            Restart
                                                        </div>
                                                    </div>
                                                </div>
                                                : null
                                        }

                                        {
                                            currentDecisionNode?.type === 'result'
                                                ? <div className='containerDetail bg-tinted p-15'>
                                                    <div className='color-yellow mb-5'>
                                                        {currentDecisionNode.level === 'critical' ? 'Critical Action' : currentDecisionNode.level === 'urgent' ? 'Urgent Action' : 'Watch and Reassess'}
                                                    </div>
                                                    <div className='color-lite mb-10'>{currentDecisionNode.text}</div>
                                                    <div
                                                        className='button containerDetail bg-green p-10'
                                                        onClick={resetDecisionTree}
                                                    >
                                                        Start Over
                                                    </div>
                                                </div>
                                                : null
                                        }
                                    </div>
                                    : null
                            }
                        </div>
                }
            </div>

            <div className={`containerDetail color-lite size20 ${(!playbooksCollapsed) ? 'bg-dkGreen': 'bg-lite'} mb-5 mt-5`}>
                <div className='containerDetail bg-lite color-yellow'>
                    <CollapseToggleButton
                        title='Disaster-Specific Playbooks'
                        isCollapsed={playbooksCollapsed}
                        setCollapse={setPlaybooksCollapsed}
                        align='left'
                    />
                </div>
                {
                    playbooksCollapsed
                        ? null
                        : <div className='containerDetail bg-lite mt-5'>
                            <div className='containerDetail bg-lite'>
                                {disasterPlaybooksSource.map((playbook) => (
                                    <div
                                        key={playbook.id}
                                        className={`button containerDetail p-10 mt-5 mr-5 ${selectedPlaybook?.id === playbook.id ? 'bg-green' : 'bg-tinted'} w--5`}
                                        onClick={() => {
                                            setSelectedPlaybookId(playbook.id);
                                            setSelectedPlaybookPhase('during');
                                        }}
                                    >
                                        {playbook.icon} {playbook.title}
                                    </div>
                                ))}
                            </div>

                            {
                                selectedPlaybook
                                    ? <div className='containerDetail bg-lite p-15 mt-10'>
                                        <div className='color-yellow size20 mb-5'>{selectedPlaybook.icon} {selectedPlaybook.title}</div>
                                        <div className='color-orange mb-10'>{selectedPlaybook.intro}</div>

                                        <div className='flexContainer'>
                                            {['before', 'during', 'after'].map((phase) => (
                                                <div
                                                    key={phase}
                                                    className={`button containerDetail p-10 mr-5 ${selectedPlaybookPhase === phase ? 'bg-green' : 'bg-lite'}`}
                                                    onClick={() => setSelectedPlaybookPhase(phase)}
                                                >
                                                    {phase === 'before' ? 'Before' : phase === 'during' ? 'During' : 'After'}
                                                </div>
                                            ))}
                                        </div>

                                        <div className='mt-10'>
                                            {selectedPlaybookSteps.map((step) => (
                                                <div key={step} className='containerDetail flexContainer bg-lite mt-5'>
                                                    <div className='pl-10 flexColumn size30'>•</div>
                                                    <div className='flex2Column p-15'>{step}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    : null
                            }
                        </div>
                }
            </div>

            <div className={`containerDetail color-lite size20 ${(!trustedResourcesCollapsed) ? 'bg-dkGreen': 'bg-lite'} mt-5`}>
                <div className='containerDetail bg-lite color-yellow'>
                    <CollapseToggleButton
                        title='Trusted Resources'
                        isCollapsed={trustedResourcesCollapsed}
                        setCollapse={setTrustedResourcesCollapsed}
                        align='left'
                    />
                </div>
                <div>
                {
                    trustedResourcesCollapsed
                        ? null
                        : <div className='mt-5'>
                            {
                                resourcesSource.map((item) => (
                                    <div className='containerDetail bg-lite mt-5 button p-15' key={item.url}>
                                        <a
                                            className={`color-lite `}
                                            key={item.url}
                                            href={item.url}
                                            target='_blank'
                                            rel='noreferrer'
                                            aria-label={`Open trusted resource: ${item.name}`}
                                        >
                                            {item.name}
                                        </a>
                                    </div>
                                ))
                            }
                        </div>
                }
            </div>
            </div>

            <div className='containerDetail bg-lite p-15 mt-10 color-orange'>
                Educational information only. In life-threatening emergencies, call your local emergency number immediately.
            </div>
        </div>
    );
};

export default Emergency;
