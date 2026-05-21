import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Selector from './forms/FunctionalSelector';
import icons from './site/icons';
import NavItems from './site/NavItems';
import NavItemsMeta from './site/NavItemsMeta';
import initializeData from './utils/InitializeData';
import Timer from './utils/Timer';
import Calculator from "./utils/Calculator";

const INIT_CATEGORIES = [
  'all', 'play', 'train', 'track', 'convert', 'schedule', 'document',
  'reflect', 'simplify', 'improve'
];

const MENUS_INIT = {
  all: NavItems,
  play: [
    "Scores",
    "Waves",
    "SurfDasboard",
    "Sets",
    "TicTacToe",
    //"CrosswordPuzzle",
    "Roulette",
    "BlackJack",
    "Poker",
    "Animation",
    "Checkers",
    "WheelOfFortune",
    "News", // Added News to play menu
    "Water",
    "Music",
    "Grocery"
  ],
  train: [
    "TrainingLog",
    "Journals",
    "Circuit"
  ],
  track: [
    "TrainingLog",
    "Journals",
    "Scores",
    "Fuel",
    "Camp",
    "Parks",
    "Moon",
    "PhotoAssistant",
    "Notes",
    "Tasks",
    "Sets",
    //"Events",
    "Links",
    "Sessions",
    "Dose",
    "Expenses",
    "Interest",
    "Mortgage",
    "Budget",
    "TradeView",
    "Trade",
    "Crypto",
    "Pricing",
    "Collections",
    "WorkDay",
    "BusinessTax",
    "GeoZipFind",
    "Weather"
  ],
  convert: [
    "TrainingLog",
    "Fuel",
    "Parks",
    "PhotoAssistant",
    "Expenses",
    "Interest",
    "Mortgage",
    "Budget",
    "Pricing",
    "Converter",
    "Currency",
    "Collections",
    "WorkDay",
    "NaturalRX"
  ],
  schedule: [
    "Scheduler",
    "Camp",
    "Dose",
    "Todos"
  ],
  document: [
    "TrainingLog",
    "Journals",
    "Scores",
    "Camp",
    "Cook",
    "NaturalRX",
    "Notes",
    "Tasks",
    "Sets",
    //"Events",
    "Links",
    "Sessions",
    "Expenses",
    "Interest",
    "Budget",
    "Pricing",
    "Collections",
    "WorkDay",
    "BusinessTax",
    "Note",
    "Charges"
  ],
  reflect: [
    "TrainingLog",
    "Journals",
    "Scores",
    "Fuel",
    "Parks",
    "PhotoAssistant",
    "Notes",
    "Links",
    "Sessions",
    "Note",
    "Photos",
    "Videos",
    "Wiki"
  ],
  simplify: [
    "TrainingLog",
    "Journals",
    "Scores",
    "Tide",
    "Buoys",
    "Camp",
    "Scheduler",
    "Mortgage",
    "Shop",
    "Vote",
    "House",
    "Cook",
    "NaturalRX",
    "Links",
    "Garden",
    "Fishing",
    "Translate",
    "Videos",
    "Photos",
    "News", // Added News to simplify menu
    "Water",
    "Music",
    "Grocery"
  ],
  improve: [
    "TrainingLog",
    "Journals",
    "Camp",
    "Scheduler",
    "Mortgage",
    "Circuit",
    "NaturalRX"
  ],
  admin: [
    "MenuScreen",
    "Admin",
  ]
};

const QuickAppButton = memo(function QuickAppButton({ label, onOpen, icon }) {
  return (
    <div
      title={label}
      onClick={() => onOpen(label)}
      className='z1 button containerBox flexColumn'
      tabIndex={0}
      aria-label={`Open ${label}`}
      onKeyDown={e => { if (e.key === 'Enter') onOpen(label); }}
    >
      {icon}
    </div>
  );
});

const PortraitAppButton = memo(function PortraitAppButton({ label, onOpen, icon, classes }) {
  return (
    <div
      className='ml-auto pl-10 pr-10 mr-auto'
      title={label}
      tabIndex={0}
      aria-label={`Open ${label}`}
      onClick={() => onOpen(label)}
      onKeyDown={e => { if (e.key === 'Enter') onOpen(label); }}
    >
      <div className={classes}>
        <div className='size50 m-10 mt-20 text-outline-dark'>
          {icon}
        </div>
        <div className='color-yellow text-outline-dark'>
          {label}
        </div>
      </div>
    </div>
  );
});

const SelectableAppButton = memo(function SelectableAppButton({ label, onToggle, icon, isSelected }) {
  const btnClasses = `containerDetail fl-left pb-15 m-5 pl-15 pr-15 bg-${isSelected ? 'black' : 'lite'}`;
  return (
    <div
      className={btnClasses}
      title={label}
      tabIndex={0}
      aria-label={`Select ${label}`}
      onClick={() => onToggle(label)}
      onKeyDown={e => { if (e.key === 'Enter') onToggle(label); }}
    >
      <div className='size30 m-10 mt-20'>
        {icon}
      </div>
      <div className='color-yellow'>
        {label}
      </div>
    </div>
  );
});

const Home = () => {

  const history = useHistory();
  const [showCalc, setShowCalc] = useState();
  const [result, setResult] = useState();
  const [firstTime, setFirstTime] = useState();
  const [categorySort, setCategorySort] = useState();
  const [menus, setMenus] = useState();
  const [categories, setCategories] = useState();
  const [addCategoryDialog, setAddCategoryDialog] = useState();
  const [newCategory, setNewCategory] = useState('');
  const [selectedApps, setSelectedApps] = useState([]);
  const [appSearch, setAppSearch] = useState('');
  const [meta, setMeta] = useState();
  const [editCategory, setEditCategory] = useState();

  const handleCalculatorSubmit = (val) => {
    setResult(val);
  };

  // Add new category
  const addNewCategory = () => {
    if (!newCategory || selectedApps.length === 0) return;
    const newCategories = [...categories, newCategory];
    const newMenus = { ...menus, [newCategory]: [...selectedApps] };
    setCategories(newCategories);
    setMenus(newMenus);
    setNewCategory('new category');
    setAddCategoryDialog(false);
    setSelectedApps([]);
  };

  // Save edited category
  const saveEditedCategory = () => {
    if (!newCategory) return;
    const newMenus = { ...menus, [newCategory]: [...selectedApps] };
    setMenus(newMenus);
    setAddCategoryDialog(false);
    setEditCategory(false);
    setSelectedApps([]);
  };

  // Initial load
  useEffect(() => {
    if (localStorage.getItem('firstTime') === null) {
      localStorage.setItem('firstTime', 'true');
      setFirstTime(true);
    } else {
      setFirstTime(localStorage.getItem('firstTime') === 'true');
    }
    const storedCategorySort = localStorage.getItem('categorySort');
    setCategorySort(storedCategorySort || 'all');
    const storedMeta = initializeData('NavItemsMeta', NavItemsMeta);
    if (Object.keys(storedMeta).length === 0) {
      setMeta(NavItemsMeta);
    } else {
      setMeta(storedMeta);
    }
    localStorage.setItem('firstTime', 'false');
    const storedCategories = initializeData('categories', INIT_CATEGORIES);
    //console.log(`useEffect => storedCategories: ${JSON.stringify(storedCategories, null, 2)}`);
    //console.log(`useEffect => storedCategories.length: ${storedCategories.length}`);
    // Deduplicate categories to prevent multiple 'recent' entries
    const uniqueCategories = Array.from(new Set(storedCategories.length > 0 ? storedCategories : INIT_CATEGORIES));
    if (uniqueCategories.length > 0) {
      setCategories(uniqueCategories);
    } else {
      setCategories(INIT_CATEGORIES);
    }
    const storedMenus = initializeData('menus', MENUS_INIT);
    const mergedMenus = { ...MENUS_INIT, ...storedMenus };

    Object.keys(MENUS_INIT).forEach((category) => {
      const defaultItems = Array.isArray(MENUS_INIT[category]) ? MENUS_INIT[category] : [];
      const existingItems = Array.isArray(mergedMenus[category]) ? mergedMenus[category] : [];
      mergedMenus[category] = Array.from(new Set([...existingItems, ...defaultItems]));
    });

    //console.log(`Home => useEffect => storedMenus: ${JSON.stringify(storedMenus, null, 2)}`);
    if (Object.keys(mergedMenus).length > 1) {
      setMenus(mergedMenus);
    } else {
      setMenus(MENUS_INIT);
    }
    // If no menus found, set to default
    if (Object.keys(mergedMenus).length === 0)
    setMenus();
    setShowCalc(false);
    // Redirect to /reactor/home if needed
    const timer = setTimeout(() => {
      const path = String(window.location).split('/reactor/')[1];
      if (path === '') history.push('/home');
    }, 1000);
    return () => {
      clearTimeout(timer);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const currentMenuItems = useMemo(() => {
    if (!(menus && categorySort && Array.isArray(menus[categorySort]))) return [];
    return menus[categorySort];
  }, [menus, categorySort]);

  useEffect(() => {
    if (editCategory) {
      setSelectedApps(currentMenuItems);
      setNewCategory(categorySort);
      setAddCategoryDialog(true);
    }
  }, [editCategory]);
  useEffect(() => {
    if (menus && Object.keys(menus).length === 0) return;
    localStorage.setItem('menus', JSON.stringify(menus));
  }, [menus]);
  useEffect(() => {
    if (categories && categories.length > 0) {
      // Deduplicate categories before storing to prevent accumulation of duplicates
      const uniqueCategories = Array.from(new Set(categories));
      localStorage.setItem('categories', JSON.stringify(uniqueCategories));
      if (!uniqueCategories.includes(categorySort)) {
        setCategorySort(uniqueCategories[0]);
      }
    }
  }, [categories, categorySort]);
  useEffect(() => {
    if (meta && Object.keys(meta).length === 0) return;
    localStorage.setItem('NavItemsMeta', JSON.stringify(meta));
  }, [meta]);
  useEffect(() => {
    if (menus && categorySort && menus[categorySort]) {
      localStorage.setItem('menuItems', JSON.stringify(currentMenuItems));
      localStorage.setItem('categorySort', categorySort);
    }
  }, [menus, categorySort, currentMenuItems]);

  // Category selector handler
  const selectSort = useCallback((_, __, value) => setCategorySort(value), []);

  const getIcon = useCallback((label) => icons[String(label).replace(' ', '').toLowerCase()], []);
  const normalizedSearch = appSearch.trim().toLowerCase();

  const matchesSearch = useCallback((appLabel) => {
    if (!normalizedSearch) return true;
    const categoryTerms = Array.isArray(meta?.[appLabel]) ? meta[appLabel] : [];
    return categoryTerms.some(term => typeof term === 'string' && term.toLowerCase().includes(normalizedSearch));
  }, [meta, normalizedSearch]);

  const filteredMenuItems = useMemo(() => {
    return currentMenuItems.filter(matchesSearch);
  }, [currentMenuItems, matchesSearch]);

  // Portrait button for menu items
  const classes = 'containerBox button bg-lite w-150 height-100 ml-auto mr-10 mt-10 mb-10';

  const openDirectApp = useCallback((label) => {
    history.push(`/${label}`);
  }, [history]);

  const getApp = useCallback((label) => {
    // Always start from the latest menus object
    setMenus((prevMenus) => {
      const currentMenus = prevMenus || {};
      const nextMenus = { ...currentMenus };

      // Update 'recent' without removing other keys
      const MAX_RECENT = 10;
      const recentList = currentMenus.recent ? [...currentMenus.recent] : [];
      const nextRecent = [label, ...recentList.filter(item => item !== label)].slice(0, MAX_RECENT);

      const recentUnchanged = (
        Array.isArray(currentMenus.recent)
        && currentMenus.recent.length === nextRecent.length
        && currentMenus.recent.every((item, index) => item === nextRecent[index])
      );

      if (recentUnchanged) {
        return prevMenus;
      }

      nextMenus.recent = nextRecent;
      return nextMenus;
    });

    // Optionally add 'recent' to categories if not present
    setCategories((prevCategories = []) => (
      prevCategories.includes('recent') ? prevCategories : [...prevCategories, 'recent']
    ));

    history.push(`/${label}`);
  }, [history]);

  const selectCategory = useCallback((label) => {
    setSelectedApps((prev = []) =>
      prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
    );
  }, []);

  const selectedAppsSet = useMemo(() => new Set(selectedApps || []), [selectedApps]);

  const selectableAppButtons = useMemo(() => {
    return NavItems.map((item) => {
      const isSelected = selectedAppsSet.has(item);
      return (
        <SelectableAppButton
          key={item}
          label={item}
          onToggle={selectCategory}
          icon={icons[String(item).toLowerCase()]}
          isSelected={isSelected}
        />
      );
    });
  }, [selectedAppsSet, selectCategory]);

  const quickMenuButtons = useMemo(() => {
    return filteredMenuItems.map((notification) => (
      <QuickAppButton
        key={notification}
        label={notification}
        onOpen={openDirectApp}
        icon={getIcon(notification)}
      />
    ));
  }, [filteredMenuItems, openDirectApp, getIcon]);

  const firstTimeButtons = useMemo(() => {
    return NavItems.map((notification) => (
      <QuickAppButton
        key={notification}
        label={notification}
        onOpen={openDirectApp}
        icon={icons[notification.toLowerCase()]}
      />
    ));
  }, [openDirectApp]);

  const portraitMenuButtons = useMemo(() => {
    return filteredMenuItems.map((item) => (
      <PortraitAppButton
        key={item}
        label={item}
        onOpen={getApp}
        icon={getIcon(item)}
        classes={classes}
      />
    ));
  }, [filteredMenuItems, getApp, getIcon, classes]);

  const deleteCategory = () => {
    const newCategories = categories.filter(cat => cat !== newCategory);
    const newMenus = { ...menus };
    delete newMenus[newCategory];
    setCategories(newCategories);
    setMenus(newMenus);
    setCategorySort(categories[0]);
    setAddCategoryDialog(false);
    setEditCategory(false);
    setSelectedApps([]);
  };

  return (
    <div>
      {!firstTime 
        ? (
        <div className='containerDetail p-10 color-lite bg-lite mt-5 ml-10 mr-10'>
          <div className='relative containerDetail p-10 m-5 flexContainer bg-dark h-scroll'>
            {quickMenuButtons}
          </div>
          <div className='containerBox mr-10 pr-10'>
            <div className='pl-10 pr-10 pb-10 size30 bold color-yellow'>Let's Go!</div>
            <div className='pl-10 pr-10 size20'>Personal goals tools</div>
            <div className='pl-10 pr-10 size12 i'>
              play, train, track, convert, schedule, document, reflect, simplify and improve
            </div>
          </div>
          <input
            id='home-app-search'
            name='home-app-search'
            className='containerBox color-lite bg-dark width--10'
            type='text'
            placeholder={'Find an app...'}
            value={appSearch}
            onChange={(e) => setAppSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
          />
          <div className='containerBox'>
            {addCategoryDialog && (
              <div className='containerBox bg-lite color-dark'>
                <div className='containerDetail mb-5 contentLeft p-15 color-yellow'>
                  {editCategory ? 'Edit category' : 'Add category'}
                </div>
                <input
                  id='category'
                  name='category'
                  className='containerDetail columnLeftAlign width-100-percent color-lite p-10 mt-5'
                  type='text'
                  placeholder='Category'
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
                <div className='containerDetail mt-5  mb-5 contentLeft p-15 color-yellow'>
                  Activate apps for {newCategory}
                </div>
                <div className='containerDetail ht-120 x-scroll-only'>
                  <div className='content-width-fit'>
                    {selectableAppButtons}
                  </div>
                </div>
                <div className='containerBox flexContainer'>
                  <div className='flex3Column button containerBox bg-green' onClick={editCategory ? saveEditedCategory : addNewCategory}>
                    save
                  </div>
                  <div className='flex3Column button containerBox bg-dkYellow' onClick={() => setAddCategoryDialog(false)}>
                    cancel
                  </div>
                  <div className='flex3Column button containerBox bg-dkRed' onClick={() => deleteCategory()}>
                    🗑️
                  </div>
                </div>
              </div>
            )}
            {!addCategoryDialog && (
              <div className='flexContainer mr-10 pr-10'>
                <div className='flex2Column pr-10'>
                  <Selector
                    groupTitle='sort'
                    label='sort:'
                    items={categories}
                    selected={categorySort}
                    onChange={selectSort}
                  />
                </div>
                  <div className='containerDetail p-15 m-5 size30 flexColumn button bg-lite' onClick={() => setEditCategory(prev => !prev)}>
                  ✏️
                </div>
                <div className='containerDetail p-15 m-5 size30 flexColumn button bg-green' onClick={() => setAddCategoryDialog(true)}>
                  ➕
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className='containerBox size20 bold'>
          {/* 
          <Geolocator
            currentPositionExists='false'
            returnCurrentPosition={updateCurrentLocation}
          /> 
          */}
          <div className='containerDetail p-10 m-5 flexContainer bg-dark h-scroll'>
            {firstTimeButtons}
          </div>
          <div className='containerBox bg-green'>
            <Timer />
          </div>
        </div>
      )}
      <div className='containerBoxNoPad waveBackground bg-dark width-100-20 mt-10'>
        <div className='containerFade'>
          <div className='menu-container containerBox'>
            {
              //NavItems
              (filteredMenuItems.length > 0)
              ? portraitMenuButtons
              : 'No apps found'
            }
          </div>
        </div>
      </div>
      <div>
        <div
          title='Open Calculator'
          onClick={() => setShowCalc(true)}
          className='button containerDetail m-auto p-10 size20 color-lite m-10 bg-blue text-lite'
          tabIndex={0}
          aria-label='Open Calculator'
          onKeyDown={e => { if (e.key === 'Enter') setShowCalc(true); }}
        >
          💻
        </div>
        {showCalc && (
          <Calculator
            newValue={0}
            onSubmit={handleCalculatorSubmit}
            onClose={() => setShowCalc(false)}
          />
        )}
        {result !== null && <div className='containerBox'>Last result: {result}</div>}
      </div>
      <div className='containerBox'>
        <div className='containerBox'>
          <div
            className='button p-20 bold size20 r-10 bg-dkGreen'
            onClick={() => window.open('https://jsongithub.github.io/portfolio/', '_blank', 'noopener,noreferrer')}
            tabIndex={0}
            aria-label='Open portfolio'
            onKeyDown={e => { if (e.key === 'Enter') window.open('https://jsongithub.github.io/portfolio/', '_blank', 'noopener,noreferrer'); }}
          >
            portfolio
          </div>
        </div>
        {/*getTracker()*/}
      </div>
    </div>
  );
};

export default Home;