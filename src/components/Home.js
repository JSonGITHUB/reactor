import { useEffect, useState } from 'react';
import Selector from './forms/FunctionalSelector';
import icons from './site/icons';
import NavItems from './site/NavItems';
import NavItemsMeta from './site/NavItemsMeta';
import initializeData from './utils/InitializeData';
import getKey from './utils/KeyGenerator';
import Timer from './utils/Timer';
import Calculator from "./utils/Calculator";

const Home = () => {
  const initCategories = [
    'all', 'play', 'train', 'track', 'convert', 'schedule', 'document',
    'reflect', 'simplify', 'improve'
  ];

  const [showCalc, setShowCalc] = useState();
  const [result, setResult] = useState();
  const [firstTime, setFirstTime] = useState();
  const [categorySort, setCategorySort] = useState();
  const [longitude, setLongitude] = useState();
  const [latitude, setLatitude] = useState();
  const [distance, setDistance] = useState();
  const [tracking, setTracking] = useState();
  const [markedLongitude, setMarkedLongitude] = useState();
  const [markedLatitude, setMarkedLatitude] = useState();
  const [menus, setMenus] = useState();
  const [menuItems, setMenuItems] = useState();
  const [categories, setCategories] = useState();
  const [addCategoryDialog, setAddCategoryDialog] = useState();
  const [newCategory, setNewCategory] = useState();
  const [selectedApps, setSelectedApps] = useState();
  const [appSearch, setAppSearch] = useState();
  const [meta, setMeta] = useState();
  const [editCategory, setEditCategory] = useState();

  const handleCalculatorSubmit = (val) => {
    setResult(val);
  };

  // Menu definitions
  const menusInit = {
    all: NavItems,
    play: [
      "Scores",
      "Waves",
      "Sets",
      "TicTacToe",
      //"CrosswordPuzzle",
      "Roulette",
      "BlackJack",
      "Checkers",
      "WheelOfFortune"
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
      "Notes",
      "Tasks",
      "Sets",
      "Events",
      "Links",
      "Sessions",
      "Dose",
      "Expenses",
      "Budget",
      "TradeView",
      "Pricing",
      "Collections",
      "BusinessTax",
      "GeoZipFind",
      "Weather"
    ],
    convert: [
      "TrainingLog",
      "Fuel",
      "Expenses",
      "Budget",
      "Pricing",
      "Converter",
      "Currency",
      "Collections"
    ],
    schedule: [
      "Scheduler",
      "Dose",
      "Todos"
    ],
    document: [
      "TrainingLog",
      "Journals",
      "Scores",
      "Cook",
      "Notes",
      "Tasks",
      "Sets",
      "Events",
      "Links",
      "Sessions",
      "Expenses",
      "Budget",
      "Pricing",
      "Collections",
      "BusinessTax",
      "Note",
      "Charges"
    ],
    reflect: [
      "TrainingLog",
      "Journals",
      "Scores",
      "Fuel",
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
      "Scheduler",
      "Shop",
      "Vote",
      "House",
      "Cook",
      "Links",
      "Garden",
      "Fishing",
      "Translate",
      "Videos",
      "Photos"
    ],
    improve: [
      "TrainingLog",
      "Journals",
      "Scheduler",
      "Circuit"
    ]
    ,admin: [
      "MenuScreen",
      "Admin",
    ]
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
    setMeta(initializeData('NavItemsMeta', NavItemsMeta));
    const storedCategories = initializeData('categories', initCategories);
    console.log(`useEffect => storedCategories: ${JSON.stringify(storedCategories, null, 2)}`);
    console.log(`useEffect => storedCategories.length: ${storedCategories.length}`);
    if (storedCategories.length > 0) {
      setCategories(storedCategories);
    } else {
      setCategories(initCategories);
    }
    const storedMenus = initializeData('menus', menusInit);
    console.log(`Home => useEffect => storedMenus: ${JSON.stringify(storedMenus, null, 2)}`);
    if (Object.keys(storedMenus).length > 1) {
      setMenus(storedMenus);
    } else {
      setMenus(menusInit);
    }
    const storedMenuItems = localStorage.getItem('menuItems');
    if (storedMenuItems) {
      if (JSON.parse(storedMenuItems).includes('529')) {
        setMenuItems(JSON.parse(storedMenuItems));
      } else {
        setMenuItems(NavItems);
      }
    }
    // If no menus found, set to default
    if (Object.keys(storedMenus).length === 0)
    setMenus();
    setShowCalc(false);
    // Redirect to /reactor/home if needed
    const timer = setTimeout(() => {
      const path = String(window.location).split('/reactor/')[1];
      if (path === '') window.location = `/reactor/home`;
    }, 1000);
    const timer2 = setTimeout(() => {
      if (categories) {
        setCategorySort(categories[0]);
      } else {
        setCategories(initCategories);
        setCategorySort('all');
      }
    }, 1010);
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    }
  }, []);
  useEffect(() => {
    if (editCategory) {
      setSelectedApps(menuItems);
      setNewCategory(categorySort);
      setAddCategoryDialog(true);
    }
  }, [editCategory, menuItems, categorySort]);
  useEffect(() => {
    if (menus && Object.keys(menus).length === 0) return;
    localStorage.setItem('menus', JSON.stringify(menus));
  }, [menus]);
  useEffect(() => {
    if (categories && categories.length > 0) {
      if (!categories.includes(categorySort)) {
        setCategorySort(categories[0]);
        localStorage.setItem('categories', JSON.stringify(categories));
      }
    }
  }, [categories]);
  useEffect(() => {
    if (meta && Object.keys(meta).length === 0) return;
    localStorage.setItem('NavItemsMeta', JSON.stringify(meta));
  }, [meta]);
  useEffect(() => {
    if (menus && categorySort && menus[categorySort]) {
      console.log(`Home => useEffect(menus) => menus[${categorySort}]: ${JSON.stringify(menus[categorySort], null, 2)}`);
      const newMenuItems = menus[categorySort];
      setMenuItems(newMenuItems);
      localStorage.setItem('menuItems', JSON.stringify(newMenuItems));
    }
  }, [menus]);
  useEffect(() => {
    if (menus && categorySort && menus[categorySort]) {
      console.log(`Home => useEffect(categorySort) => menus[${categorySort}]: ${JSON.stringify(menus[categorySort], null, 2)}`);
      const newMenuItems = menus[categorySort];
      setMenuItems(newMenuItems);
      localStorage.setItem('categorySort', categorySort);
    }
  }, [categorySort]);

  // Category selector handler
  const selectSort = (_, __, value) => setCategorySort(value);

  // Distance calculation logic
  const calculateDistance = () => {
    const lat1 = markedLatitude;
    const lat2 = latitude;
    const lon1 = markedLongitude;
    const lon2 = longitude;
    let unit = 'feet';
    if ((lat1 === lat2 && lon1 === lon2) || !lat1 || !lat2 || !lon1 || !lon2) {
      return 0;
    } else if (tracking) {
      const radlat1 = (Math.PI * lat1) / 180;
      const radlat2 = (Math.PI * lat2) / 180;
      const theta = lon1 - lon2;
      const radtheta = (Math.PI * theta) / 180;
      const feetOrYards = (dist) =>
        dist * 5280 > 30
          ? `${(dist * 1760).toFixed(2)} yards`
          : `${(dist * 5280).toFixed(2)} feet`;
      let dist =
        Math.sin(radlat1) * Math.sin(radlat2) +
        Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) dist = 1;
      dist = Math.acos(dist);
      dist = (dist * 180) / Math.PI;
      dist = dist * 60 * 1.1515;
      dist = dist < 0.25 ? feetOrYards(dist) : `${dist.toFixed(2)} miles`;
      if (unit === 'Kilometers') dist = dist * 1.609344;
      if (unit === 'Nautical') dist = dist * 0.8684;
      return dist;
    }
    return distance;
  };

  // Location update logic
  const updateCurrentLocation = (longitude, latitude) => {
    setLongitude(longitude);
    setLatitude(latitude);
    setDistance(calculateDistance());
  };

  const getIcon = (label) => icons[String(label).replace(' ', '').toLowerCase()];

  const startDistance = () => {
    setTracking(true);
    setMarkedLatitude(latitude);
    setMarkedLongitude(longitude);
  };
  const stopTracking = () => setTracking(false);
  const getDistance = () => distance;

  // Portrait button for menu items
  const classes = 'containerBox button bg-lite w-150 height-100 ml-auto mr-10 mt-10 mb-10';
    const getApp = (label) => {
      // Always start from the full menus object
      const newMenus = { ...menus };
  
      // Update 'recent' without removing other keys
      const MAX_RECENT = 10;
      const recentList = newMenus.recent ? [...newMenus.recent] : [];
      newMenus.recent = [label, ...recentList.filter(item => item !== label)].slice(0, MAX_RECENT);
  
      // Optionally add 'recent' to categories if not present
      if (!categories.includes('recent')) setCategories([...categories, 'recent']);
      setMenus(newMenus);
      window.location = `/reactor/${label}`;
  };
  const portraitButton = (label) => (
    <div
      className='ml-auto pl-10 pr-10 mr-auto'
      title={label}
      key={getKey(label)}
      tabIndex={0}
      aria-label={`Open ${label}`}
      onClick={() => getApp(label)}
      onKeyDown={e => { if (e.key === 'Enter') getApp(label); }}
    >
      <div className={classes}>
        <div className='size30 m-10 mt-20'>
          {getIcon(label)}
        </div>
        <div className='color-yellow'>
          {label}
        </div>
      </div>
    </div>
  );
  const selectCategory = (label) => {
    setSelectedApps((prev = []) =>
      prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
    );
  };
  const selectButton = (label) => {
    const isSelected = selectedApps.includes(label);
    const btnClasses = `containerDetail pl-20 pr-20 pb-20 m-5 flexColumn bg-${isSelected ? 'black' : 'lite'}`;
    return (
      <div
        className={btnClasses}
        title={label}
        key={getKey(label)}
        tabIndex={0}
        aria-label={`Select ${label}`}
        onClick={() => selectCategory(label)}
        onKeyDown={e => { if (e.key === 'Enter') selectCategory(label); }}
      >
        <div className='size30 m-10 mt-20'>
          {icons[String(label).toLowerCase()]}
        </div>
        <div className='color-yellow'>
          {label}
        </div>
      </div>
    );
  };
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
            {menuItems &&  menuItems
              .filter(notification => {
                if (!appSearch) return true;
                const lowerSearch = appSearch.toLowerCase();
                const categoryTerms = meta[notification] || [];
                return categoryTerms.some(term =>
                  term.toLowerCase().includes(lowerSearch)
                );
              })
              .map((notification, index) => (
                <div
                  title={notification}
                  onClick={() => window.location = `/reactor/${notification}`}
                  key={getKey(index)}
                  className='z1 button containerBox flexColumn'
                  tabIndex={0}
                  aria-label={`Open ${notification}`}
                  onKeyDown={e => { if (e.key === 'Enter') window.location = `/reactor/${notification}`; }}
                >
                  {getIcon(notification)}
                </div>
              ))}
          </div>
          <div className='containerBox mr-10 pr-10'>
            <div className='pl-10 pr-10 pb-10 size30 bold color-yellow'>Let's Go!</div>
            <div className='pl-10 pr-10 size20'>Personal goals tools</div>
            <div className='pl-10 pr-10 size12 i'>
              play, train, track, convert, schedule, document, reflect, simplify and improve
            </div>
          </div>
          <input
            id='app search'
            name='app search'
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
                <div className='containerBox color-yellow'>
                  {editCategory ? 'Edit category' : 'Add category'}
                </div>
                <div className='containerBox'>
                  <input
                    id='category'
                    name='category'
                    className='containerBox columnLeftAlign width--10'
                    type='text'
                    placeholder='Category'
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                </div>
                <div className='containerBox'>
                  Activate apps for {newCategory}
                </div>
                <div className='containerBox flexContainer h-scroll ht-50'>
                  {NavItems.map(item => selectButton(item))}
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
            {NavItems.map((notification, index) => (
              <div
                title={notification}
                onClick={() => window.location = `/reactor/${notification}`}
                key={getKey(index)}
                className='containerBox flexColumn'
                tabIndex={0}
                aria-label={`Open ${notification}`}
                onKeyDown={e => { if (e.key === 'Enter') window.location = `/reactor/${notification}`; }}
              >
                {icons[notification.toLowerCase()]}
              </div>
            ))}
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
              (menus && categorySort && menus[categorySort] && menus[categorySort].length > 0)
              ? menus[categorySort]
                .filter(app => {
                  if (!appSearch) return true;
                  const lowerSearch = appSearch.toLowerCase();
                  const categoryTerms = meta[app] || [];
                  return categoryTerms.some(term =>
                    term.toLowerCase().includes(lowerSearch)
                  );
                })
                .map(item => portraitButton(item))
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
            onClick={() => window.location = 'https://jsongithub.github.io/portfolio/'}
            tabIndex={0}
            aria-label='Open portfolio'
            onKeyDown={e => { if (e.key === 'Enter') window.location = 'https://jsongithub.github.io/portfolio/'; }}
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