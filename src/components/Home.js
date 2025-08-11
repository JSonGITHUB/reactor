import { useEffect, useState } from 'react';
import Selector from './forms/FunctionalSelector';
import icons from './site/icons';
import NavItems from './site/NavItems';
import NavItemsMeta from './site/NavItemsMeta';
import initializeData from './utils/InitializeData';
import getKey from './utils/KeyGenerator';
import Timer from './utils/Timer';

const Home = () => {
  const initCategories = [
    'all', 'play', 'train', 'track', 'convert', 'schedule', 'document',
    'reflect', 'simplify', 'improve', '➕ category'
  ];
  const [firstTime, setFirstTime] = useState(true);
  const [categorySort, setCategorySort] = useState();
  const [longitude, setLongitude] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [distance, setDistance] = useState(0);
  const [tracking, setTracking] = useState(false);
  const [markedLongitude, setMarkedLongitude] = useState(null);
  const [markedLatitude, setMarkedLatitude] = useState(null);
  const [menus, setMenus] = useState();
  const [menuItems, setMenuItems] = useState();
  const [categories, setCategories] = useState(initCategories);
  const [addCategoryDialog, setAddCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState('new category');
  const [selectedCategories, setSelectedCategories] = useState();
  const [appSearch, setAppSearch] = useState();

  // Menu definitions
  const menusInit = {
    all: NavItems,
    play: [
      'Scores', 'Waves', 'Buoys', 'TicTacToe', 'WheelOfFortune', 'BlackJack', 'Roulette', 'Scheduler',
      'TideChart', 'Sessions', 'Todos', 'Notes', 'Tasks', 'Sets', 'Events', 'Links', 'Charges', 'Garden', 'FishFinder', 'Cook', 'SoundBoard',
      'Photos', 'Videos'
    ],
    circuit: [
      'Train', 'Circuit', 'Journals', 'Tracker', 'TrainingLog', 'Scores', 'Scheduler', 'Waves', 'Buoys', 'TideChart',
      'Sessions', 'Dose', 'Todos', 'Notes', 'Tasks', 'Sets', 'Events', 'Links', 'Charges', 'Garden', 'FishFinder', 'Cook', 'SoundBoard', 'Videos'
    ],
    train: [
      'Train', 'Circuit', 'Journals',  'Tracker', 'TrainingLog', 'Scores', 'Scheduler', 'Waves', 'Buoys', 'TideChart',
      'Sessions', 'Dose', 'Todos', 'Notes', 'Tasks', 'Sets', 'Events', 'Links', 'Charges', 'Garden', 'FishFinder', 'Cook', 'SoundBoard', 'Videos'
    ],
    track: [
      'Train', 'Circuit', 'Journals',  'Tracker', 'TrainingLog', 'Scores', 'Scheduler', 'Waves', 'Buoys', 'TideChart',
      'Sessions', 'Dose', 'Fuel', 'Expenses', 'Converter', 'Currency', 'DebtCollector',
      'Todos', 'Notes', 'Tasks', 'Sets', 'Events', 'Links', 'Charges', 'Garden', 'FishFinder', 'Cook'
    ],
    convert: [
      'TrainingLog', 'Shop', 'Fuel', 'Expenses', 'Converter', 'Currency', 'DebtCollector', 'Translate'
    ],
    schedule: [
      'Train', 'Circuit', 'Journals',  'Tracker', 'TrainingLog', 'Scheduler', 'Dose', 'DebtCollector', 'Todos', 'Notes', 'Tasks', 'Sets', 'Events', 'Links',
      'Charges', 'Garden', 'FishFinder', 'Cook'
    ],
    document: [
      'Train', 'Circuit', 'Journals',  'Tracker', 'TrainingLog', 'Scores', 'Scheduler', 'Sessions', 'Shop', 'Dose', 'Fuel',
      'Expenses', 'DebtCollector', 'Todos', 'Notes', 'Tasks', 'Sets', 'Events', 'Links', 'Charges', 'Garden', 'FishFinder', 'Cook', 'Translate', 'Admin'
    ],
    reflect: [
      'Train', 'Circuit', 'Journals',  'Tracker', 'TrainingLog', 'Scores', 'Scheduler', 'Waves', 'Buoys', 'TideChart',
      'Sessions', 'Shop', 'Dose', 'Fuel', 'Expenses', 'Converter', 'Currency', 'DebtCollector',
      'Todos', 'Notes', 'Tasks', 'Sets', 'Events', 'Links', 'Charges', 'Garden', 'FishFinder', 'Cook', 'SoundBoard', 'Translate', 'Wiki', 'Photos', 'Videos'
    ],
    simplify: [
      'Train', 'Circuit', 'Journals',  'Tracker', 'TrainingLog', 'Scores', 'Scheduler', 'Waves', 'Buoys', 'TideChart', 'Shop',
      'Dose', 'Fuel', 'Expenses', 'Converter', 'Currency', 'DebtCollector', 'Todos', 'Notes', 'Tasks', 'Sets', 'Events', 'Links',
      'Charges', 'Garden', 'FishFinder', 'Cook', 'Translate', 'Wiki', 'Photos', 'Videos', 'Snippets', 'Admin'
    ],
    improve: [
      'Train', 'Circuit', 'Journals',  'Tracker', 'TrainingLog', 'Scores', 'Scheduler', 'Waves', 'Buoys', 'TideChart', 'Sessions',
      'Shop', 'Dose', 'Fuel', 'Expenses', 'Converter', 'Currency', 'DebtCollector', 'Todos',
      'Notes', 'Tasks', 'Sets', 'Events', 'Links', 'Charges', 'Garden', 'FishFinder', 'Cook', 'SoundBoard', 'Product', 'Translate', 'Wiki', 'Photos',
      'Videos', 'Snippets', 'Admin'
    ]
  };
  const addNewCategory = () => {
    const newCategories = [...categories];
    newCategories.splice(0, 0, newCategory);
    setCategories(newCategories);
    setNewCategory(null);
    setAddCategoryDialog(false);
  }
  useEffect(() => {
    const firstTimeCheck = localStorage.getItem('firstTime');
    if (firstTimeCheck === null) {
      localStorage.setItem('firstTime', 'true');
      setFirstTime(true);
    }
    const storedCategorySort = localStorage.getItem('categorySort');
    if (storedCategorySort) {
      setCategorySort(storedCategorySort);
    } else {
      setCategorySort('all')
      localStorage.setItem('categorySort', 'all');
    }
    if (storedCategorySort) {
      setCategorySort(storedCategorySort);
    } else {
      setCategorySort('all')
      localStorage.setItem('categorySort', 'all');
    }
    const newCategories = initializeData('categories', initCategories);
    setCategories(newCategories);
    const newMenus = initializeData('menus', menusInit);
    setMenus(newMenus);
    const timer = setTimeout(() => {
      //window.location = `/reactor/home`;
      const path = String(window.location).split('/reactor/')[1];
      if (path === '') {
        window.location = `/reactor/home`;
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
    
  // Persist categories to localStorage
  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
    if (menus && menus.length > 0) {
      const newMenus = [...menus];
      if (newMenus.length() !== (categories.length()-1)){
        newMenus.push({
          [categories[0]]: [menus['all']]
        });      
      }
      console.log(`useEffect => Home => newMenus: ${JSON.stringify(newMenus, null, 2)}`);
      setMenus(newMenus);
      setAppSearch(categorySort);
    }
  }, [categories]);

  // Update menuItems when menus or categorySort changes
  useEffect(() => {
    if (menus !== undefined) {
      localStorage.setItem('menus', JSON.stringify(menus));
    }
    console.log(`useEffect => Home => menus: ${JSON.stringify(menus, null, 2)}`);
    const storedCategorySort = localStorage.getItem('categorySort');
    if (storedCategorySort) {
      setCategorySort(storedCategorySort);
    } else {
      setCategorySort('all')
      localStorage.setItem('categorySort', 'all');
    }
  }, [menus]);
  useEffect(() => {
    if (menus !== undefined) {
      if (categorySort !== undefined) {
        if (categorySort !== '➕ category') {
          localStorage.setItem('categorySort', categorySort);
        }
        const newMenuItems = menus[categorySort] ?? [];
        console.log(`Home => useEffect => newMenuItems: ${JSON.stringify(newMenuItems, null, 2)}`);
        if (categorySort === '➕ category') {
          setAddCategoryDialog(true);
        } else {
          setAppSearch(categorySort);
          setMenuItems(newMenuItems);
        }
        console.log(`useEffect => Home => menus: ${JSON.stringify(menus, null, 2)}`);
      }
    }
  }, [categorySort]);

  // Persist menuItems to localStorage
  useEffect(() => {
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
    console.log(`useEffect => Home => menuItems: ${JSON.stringify(menuItems, null, 2)}`);
    setAppSearch(categorySort);
  }, [menuItems]);

  // Category selector handler
  const selectSort = (x, y, value) => setCategorySort(value);

  // Distance calculation logic (unchanged)
  const calculateDistance = () => {
    const lat1 = markedLatitude;
    const lat2 = latitude;
    const lon1 = markedLongitude;
    const lon2 = longitude;
    let unit = 'feet';
    if ((lat1 === lat2 && lon1 === lon2) || !lat1 || !lat2 || !lon1 || !lon2) {
      return 0;
    } else if (tracking === true) {
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

  // Location update logic (unchanged)
  const updateCurrentLocation = (longitude, latitude) => {
    setLongitude(longitude);
    setLatitude(latitude);
    setDistance(calculateDistance());
  };

  const startDistance = () => {
    setTracking(true);
    setMarkedLatitude(latitude);
    setMarkedLongitude(longitude);
  };
  const stopTracking = () => setTracking(false);
  const getDistance = () => distance;

  // Tracker UI (unchanged)
  const getTracker = () => (
    <div className='containerBox'>
      <div className='color-neogreen p-20 bold bigHeader bg-dkGreen r-5 m-20'>
        {getDistance()}
      </div>
      <div
        title={tracking ? 'stop tracking' : 'start tracking'}
        className={`size20 bold button p-20 r-5 m-20 ${tracking ? 'bg-red incompletedSelector color-yellow' : 'bg-neogreen completedSelector color-black'}`}
        onClick={tracking ? stopTracking : startDistance}
      >
        {tracking ? 'Stop Tracking' : 'Start Tracking'}
      </div>
    </div>
  );

  // Portrait button for menu items
  const classes = 'containerBox button bg-lite w-150 height-100 ml-auto mr-10 mt-10 mb-10';
  const portraitButton = (label) => (
    <div
      className='ml-auto pl-10 pr-10 mr-auto'
      title={label}
      key={getKey('homeLink')}
      onClick={() => window.location = `/reactor/${label}`}
    >
      <div key={getKey(label)} className={classes}>
        <div className='size30 m-10 mt-20'>
          {icons[String(label).toLowerCase()]}
        </div>
        <div className='color-yellow'>
          {label}
        </div>
      </div>
    </div>
  );
  const selectCategory = (label) => {
    const newCategories = [...selectedCategories, label];
    setSelectedCategories(newCategories);
  }
  const selectButton = (label) => {
    console.log(`Home => selectButton => selectedCategories: ${JSON.stringify(selectedCategories, null, 2)}`);
    if (selectedCategories !== undefined) {
      const isSelected = selectedCategories.includes(label);
      const classes = `bg-${isSelected ? 'black' : 'lite'}`;
      return <div
        className={`${classes} ml-auto pl-10 pr-10 mr-auto`}
          title={label}
          key={getKey('homeLink')}
          onClick={() => selectCategory(label)}
        >
          <div key={getKey(label)} className={classes}>
            <div className='size30 m-10 mt-20'>
              {icons[String(label).toLowerCase()]}
            </div>
            <div className='color-yellow'>
              {label}
            </div>
          </div>
        </div>
    }
    return
  };

  return (
    <div>
      {addCategoryDialog ? (
        <div className='containerBox bg-blue'>
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
          <div className='containerBox flexContainer'>
            <div className='flex2Column containerBox bg-green' onClick={addNewCategory}>
                ➕
            </div>
            <div className='flex2Column containerBox bg-dkRed' onClick={() => setAddCategoryDialog(false)}>
                ❌
            </div>
          </div>
          <div className='containerBox flexContainer h-scroll ht-50'>
              {NavItems && NavItems.length > 0
                ? NavItems.map((item) => selectButton(item))
                : null}
          </div>
        </div>
      ) : null }
      {firstTime ? (
        <div className='containerDetail p-10 color-lite bg-lite mt-5 ml-10 mr-10'>
          
          <div className='relative containerDetail p-10 m-5 flexContainer bg-dark h-scroll'>
            {
              NavItems
                .filter(notification => {
                  if (!appSearch) return true;

                  const lowerSearch = appSearch.toLowerCase();
                  const categoryTerms = NavItemsMeta[notification] || [];

                  return categoryTerms.some(term =>
                    term.toLowerCase().includes(lowerSearch)
                  );
                })
                .map(notification => <div title={notification} onClick={() => window.location = `/reactor/${notification}`} key={getKey(notification)} className='containerBox flexColumn'>
                {icons[notification.toLocaleLowerCase()]}
              </div>
              )
            }
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
            value={typeof appSearch === 'string' ? appSearch : ''}
            onChange={(e) => setAppSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
          />
          <div className='containerBox mr-10 pr-10'>
            <Selector
              groupTitle='sort'
              label='sort:'
              items={categories}
              selected={categorySort}
              onChange={selectSort}
            />
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
            {
              NavItems.map((notification) => <div title={notification} onClick={() => window.location = `/reactor/${notification}`} key={getKey(notification)} className='containerBox flexColumn'>
                {icons[notification.toLocaleLowerCase()]}
              </div>
              )
            }
          </div>
          <div className='containerBox bg-green'>
            <Timer />
          </div>
        </div>
      )}
      
      <div className='containerBoxNoPad waveBackground bg-dark width-100-20 mt-10'>
        <div className='containerFade'>
          <div className='menu-container containerBox'>
            {menuItems && menuItems.length > 0
              ? NavItems
                .filter(notification => {
                  if (!appSearch) return true;

                  const lowerSearch = appSearch.toLowerCase();
                  const categoryTerms = NavItemsMeta[notification] || [];

                  return categoryTerms.some(term =>
                    term.toLowerCase().includes(lowerSearch)
                  );
                })
                .map(item => portraitButton(item))
              : null}
          </div>
        </div>
      </div>
      <div className='containerBox'>
        <div className='containerBox'>
          <div
            className='button p-20 bold size20 r-10 bg-dkGreen'
            onClick={() => window.location = 'https://jsongithub.github.io/portfolio/'}
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