import React, { Suspense, lazy, useState } from 'react';
import debounce from './components/utils/Debouncer';
import Header from './components/site/Header';
import SitewideLowerNav from './components/site/SitewideLowerNav';
import Home from './components/Home';

import './assets/css/App.css';
import { LayoutProvider } from './components/utils/LayoutContext';
import Todos from './components/hooks/Todos';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import ScrollToTop from './components/utils/ScrollToTop';
import Admin from './components/utils/Admin';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { VotingForm } from './components/VotingForm';
import { MultiInputProvider } from './MultiInputContext';
import { FocusManagerProvider } from './FocusManagerContext';
import { MenuScreen } from './MenuScreen';

const Tracker = lazy(() => import('./components/tracker/Tracker'));
const Expense529 = lazy(() => import('./components/tracker/Expense529'));
const Notes = lazy(() => import('./components/tracker/Notes'));
const Tasks = lazy(() => import('./components/tracker/Tasks'));
const Sets = lazy(() => import('./components/tracker/Sets'));
const Charges = lazy(() => import('./components/tracker/Charges'));
const Links = lazy(() => import('./components/tracker/Links'));
const Cook = lazy(() => import('./components/tracker/Cook'));
const Ingredients = lazy(() => import('./components/tracker/Ingredients'));
const Train = lazy(() => import('./components/tracker/Train'));
const Journals = lazy(() => import('./components/tracker/Journals'));
const BusinessTax = lazy(() => import('./components/tracker/BusinessTax'));
const Scheduler = lazy(() => import('./components/tracker/Scheduler'));
const TrainingLog = lazy(() => import('./components/tracker/TrainingLog'));
const Lumber = lazy(() => import('./components/HomeDepot/Lumber'));
const Concrete = lazy(() => import('./components/HomeDepot/Concrete'));
const THD = lazy(() => import('./components/HomeDepot/THD.js'));
const TipCalculator = lazy(() => import('./components/finance/TipCalculator'));
const DebtCollector = lazy(() => import('./components/finance/DebtCollector'));
const WorkDay = lazy(() => import('./components/finance/WorkDay'));
const TicTacToe = lazy(() => import('./components/games/tictactoe/TicTacToe'));
const Pacman = lazy(() => import('./components/games/Gamble/Pacman'));
const Expenses = lazy(() => import('./components/expense/Expenses'));
const Interest = lazy(() => import('./components/finance/Interest'));
const Mortgage = lazy(() => import('./components/finance/Mortgage'));
const Pay = lazy(() => import('./components/finance/Pay'));
const Budget = lazy(() => import('./components/expense/Budget'));
const Pricing = lazy(() => import('./components/expense/Pricing'));
const BlackJack = lazy(() => import('./components/games/Gamble/BlackJack'));
const Poker = lazy(() => import('./components/games/Poker'));
const Animation = lazy(() => import('./components/games/Gamble/Animation'));
const Checkers = lazy(() => import('./components/games/checkers/Checkers.jsx'));
const WheelOfFortune = lazy(() => import('./components/games/Gamble/WheelOfFortune'));
const Roulette = lazy(() => import('./components/games/Gamble/Roulette'));
const Scores = lazy(() => import('./components/games/scorekeeper/Scores'));
const Shop = lazy(() => import('./components/shop/Shop'));
const Sessions = lazy(() => import('./components/waves/Sessions'));
const Session = lazy(() => import('./components/waves/Session'));
const Waves = lazy(() => import('./components/waves/Waves'));
const Weather = lazy(() => import('./components/waves/Weather'));
const Dive = lazy(() => import('./components/waves/Dive'));
const Location = lazy(() => import('./components/waves/Location'));
const WindDirection = lazy(() => import('./components/waves/WindDirection'));
const Product = lazy(() => import('./components/shop/Product'));
const Cams = lazy(() => import('./components/waves/Cams'));
const SunTracker = lazy(() => import('./components/waves/SunTracker'));
const StepTimer = lazy(() => import('./components/utils/StepTimer'));
const StepManager = lazy(() => import('./components/StepManager'));
const NaturalRX = lazy(() => import('./components/functional/NaturalRX'));
const Snippets = lazy(() => import('./components/utils/Snippets'));
const TideChart = lazy(() => import('./components/waves/tide/TideChart'));
const Buoys = lazy(() => import('./components/waves/SurfReports'));
const SlideShow = lazy(() => import('./components/utils/SlideShow'));
const PhotoSequence = lazy(() => import('./components/utils/PhotoSequence'));
const Reducer = lazy(() => import('./components/Reducer'));
const Adder = lazy(() => import('./components/hooks/Adder'));
const Counter = lazy(() => import('./components/hooks/Counter'));
const Photos = lazy(() => import('./components/utils/Photos'));
const Videos = lazy(() => import('./components/video/Videos'));
const Wiki = lazy(() => import('./components/wiki/Wiki'));
const Video = lazy(() => import('./components/video/Video'));
const ExchangeRates = lazy(() => import('./components/converter/ExchangeRates'));
const Assessments = lazy(() => import('./components/utils/Assessments'));
const Emergency = lazy(() => import('./components/utils/Emergency'));
const Camp = lazy(() => import('./components/utils/Camp'));
const EStation = lazy(() => import('./components/utils/EStation'));
const GallonsCalculator = lazy(() => import('./components/utils/GallonsCalculator'));
const Fuel = lazy(() => import('./components/utils/Fuel'));
const Parks = lazy(() => import('./components/Parks/Parks'));
const City = lazy(() => import('./components/utils/City'));
const Moon = lazy(() => import('./components/utils/Moon'));
const PhotoAssistant = lazy(() => import('./components/utils/PhotoAssistant'));
const SoundBoard = lazy(() => import('./components/sound/SoundBoard'));
const Converter = lazy(() => import('./components/converter/Converter'));
const News = lazy(() => import('./components/news/News'));
const Dose = lazy(() => import('./components/tracker/Dose'));
const Translator = lazy(() => import('./components/translator/Translator'));
const Accordion = lazy(() => import('./components/utils/Accordion'));
const Grocery = lazy(() => import('./components/utils/Grocery'));
const FormNotes = lazy(() => import('./components/forms/FormEssay'));
const Water = lazy(() => import('./components/utils/Water'));
const Cafe = lazy(() => import('./components/utils/Cafe'));
const TradeView = lazy(() => import('./components/utils/TradeView'));
const Trade = lazy(() => import('./components/utils/Trade'));
const Crypto = lazy(() => import('./components/utils/Crypto'));
const Garden = lazy(() => import('./components/garden/Garden'));
const FishFinder = lazy(() => import('./components/fishing/FishFinder'));
const Eat = lazy(() => import('./components/utils/Eat'));
const Currency = lazy(() => import('./components/converter/Currency'));
const Billiards = lazy(() => import('./components/utils/Billiards'));
const HomeManager = lazy(() => import('./components/Residential/HomeManager'));
const Music = lazy(() => import('./components/music/Music'));
const Fireworks = lazy(() => import('./components/legacy/Fireworks'));
const Watch = lazy(() => import('./components/video/Watch'));
const Pics = lazy(() => import('./components/pics/Pics'));
const Media = lazy(() => import('./components/video/Media'));

//const MainApp = () => {
const App = () => {

    //const { role, logout } = useLogin();
    const [state, setState] = useState({
        isMotionOn: true,
        width: window.innerWidth,
        height: window.innerHeight,
        isSignedIn: null,
        country: 'us'
    });

    const base = 'reactor/';
    const company = 'KFA';
    //let path = initializeData('path', window.location.pathname);
    let path = window.location.pathname;
    const setSignIn = () => {
        console.log(`sssetSignIn ======> ${!state.isSignedIn}`);
        setState({
            isSignedIn: !state.isSignedIn,
        });
    };
    const widthChanged = () => (window.innerWidth !== state.width ? true : false);
    const heightChanged = () =>
        window.innerHeight !== state.height ? true : false;
    const updateState = () => {
        setState({
            width: window.innerWidth,
            height: window.innerHeight,
        });
    };
    const setIt = () =>
        widthChanged() || heightChanged() ? updateState() : false;
    const items = [
        {
            title: 'item1',
            content: 'content 1',
        },
        {
            title: 'item2',
            content: 'content 2',
        },
        {
            title: 'item3',
            content: 'content 3',
        },
        {
            title: 'item4',
            content: 'content 4',
        },
    ];

    window.addEventListener('resize', debounce(setIt, 250));
    path = `/${window.location.pathname.split('/')[2]}`
    localStorage.setItem('path', path)
    /*
    const componentTag = (current) => <div className='App'>
            <Header company={company} width={state.width} isMotionOn={state.isMotionOn}/>
              <div className='fadeIn'>
                {components[current]}
              </div>
            <Footer isMotionOn={state.isMotionOn} setMotion={setMotion}/>
          </div>;
    */
    //let AppComponent = () => componentTag(currentComponent);
    const logIdExists = window.location.search.includes('logId') ? true : false;
    const startIndex = () => window.location.search.indexOf('logId=') + 6;
    const endIndex = () => window.location.search.length;
    const getLogId = () =>
        window.location.search.substring(startIndex(), endIndex());
    const logId = logIdExists ? getLogId() : '';
    // eslint-disable-next-line
    const { width, height, isMotionOn, isSignedIn } = state;
    //console.log(`App => state.isSignedIn: ${state.isSignedIn}`);
    let appBg = undefined;
    try {
        const appAppearanceSettings = JSON.parse(localStorage.getItem('appAppearanceSettings'));
        appBg = appAppearanceSettings?.colors?.background;
    } catch { }

     return (
         <LayoutProvider>
            <div className=''>
                {/*
                    <h1 className='text-xl font-bold'>Welcome, {role}!</h1>
                    <button
                        onClick={logout}
                        className='containerBox button'
                    >
                        Logout
                    </button>
                */}
                <MultiInputProvider
                    initialEnabledDevices={{
                        keyboard: true,
                        touch: true,
                        binaryKeypad: false,
                        sipPuff: false,
                    }}
                >
                    <FocusManagerProvider>
                        <Provider store={store}>
                            <Router basename={base}>
                                <ScrollToTop />
                                <div 
                                    className='App'
                                    style={{ background: appBg || undefined }}
                                >
                                    <Switch>
                                        <Header
                                            company={company}
                                            width={width}
                                            isSignedIn={state.isSignedIn}
                                            isMotionOn={isMotionOn}
                                            setSignIn={setSignIn}
                                        />
                                    </Switch>
                                    <div className='fadeIn'>
                                        <Suspense
                                            fallback={(
                                                <div className='containerDetail p-20 size20 color-yellow' role='status' aria-live='polite'>
                                                    Loading...
                                                </div>
                                            )}
                                        >
                                        <Switch>
                                            <Route
                                                exact
                                                path='/'
                                                component={Home}
                                            />
                                            <Route path='/Home' component={Home} />
                                            {/*<Route path='/BowlBuilder' component={BowlBuilder} />*/}
                                            {/*<Route path='/BowlBuilder' render={(props) => <BowlBuilder {...props} width={width} height={height} />}/>*/}
                                            {/*<Route path='/Convert' component={Calculator} />*/}
                                            <Route path='/Note' component={FormNotes} />
                                            {/*<Route path='/Reservation' component={Reservation} />*/}
                                            {/*<Route path='/GuestList' component={SignUpDialog} />*/}
                                            {/*<Route path='/Session' component={Session} />*/}
                                            <Route
                                                path='/Session'
                                                render={(props) => <Session {...props} logId={logId} />}
                                            />
                                            <Route
                                                path='/Waves'
                                                render={(props) => (
                                                    <Waves />
                                                )}
                                            />
                                            {/*
                                            <Route
                                                path='/SurfDashboard'
                                                render={(props) => (
                                                    <SurfDashboard />
                                                )}
                                            */}
                                            <Route
                                                path='/MenuScreen'
                                                render={(props) => (
                                                    <MenuScreen />
                                                )}
                                            />
                                            <Route
                                                path='/Weather'
                                                render={(props) => (
                                                    <Weather />
                                                )}
                                            />
                                            <Route
                                                path='/Dive'
                                                render={(props) => (
                                                    <Dive coreMetricsOnly={props.location.search.includes('core=true')} />
                                                )}
                                            />
                                            <Route
                                                path='/Location'
                                                render={(props) => (
                                                    <Location mode='display' />
                                                )}
                                            />
                                            <Route
                                                path='/Wind'
                                                render={(props) => (
                                                    <div className='containerDetail bg-lite p-30 size30'>
                                                        <WindDirection columns='2' setWind={() => console.log('setWind')} height='0px' collapse={() => console.log('collapse')} />
                                                    </div>
                                                )}
                                            />
                                            <Route
                                                path='/Water'
                                                component={Water}
                                            />
                                            <Route
                                                path='/Cafe'
                                                component={Cafe}
                                            />
                                            <Route
                                                path='/air'
                                                render={(props) => (
                                                    <div className='containerDetail bg-white p-30 size30'>
                                                        <WindDirection columns='2' setWind={() => console.log('setWind')} height='0px' collapse={() => console.log('collapse')} />
                                                    </div>
                                                )}
                                            />
                                            <Route
                                                path='/Dose'
                                                render={(props) => (
                                                    <Dose />
                                                )}
                                            />
                                            <Route
                                                path='/Product'
                                                render={(props) => (
                                                    <div className='mt--50'>
                                                        <Product />
                                                    </div>
                                                )}
                                            />
                                            <Route
                                                path='/Cams'
                                                render={(props) => (
                                                    <div className='mt--50'>
                                                        <Cams />
                                                    </div>
                                                )}
                                            />
                                            {/*
                                            <Route
                                                path='/PDFReport'
                                                render={(props) => (
                                                    <PDFReport />
                                                )}
                                            />
                                            <Route
                                                path='/EyeExercises'
                                                render={(props) => (
                                                    <EyeExercises />
                                                )}
                                            */}
                                            <Route
                                                path='/SunTracker'
                                                render={(props) => (
                                                    <SunTracker />
                                                )}
                                            />
                                            <Route
                                                path='/StepTimer'
                                                render={(props) => (
                                                    <StepTimer />
                                                )}
                                            />
                                            <Route
                                                path='/StepManager'
                                                render={(props) => (
                                                    <StepManager />
                                                )}
                                            />
                                            <Route
                                                path='/Garden'
                                                render={(props) => (
                                                    <Garden />
                                                )}
                                            />
                                            <Route
                                                path='/Fishing'
                                                render={(props) => (
                                                    <FishFinder />
                                                )}
                                            />
                                            <Route
                                                path='/Collections'
                                                render={(props) => (
                                                    <DebtCollector />
                                                )}
                                            />
                                            <Route
                                                path='/WorkDay'
                                                render={(props) => (
                                                    <WorkDay />
                                                )}
                                            />
                                            <Route
                                                path='/NaturalRX'
                                                render={(props) => (
                                                    <NaturalRX />
                                                )}
                                            />
                                            <Route
                                                path='/Snippets'
                                                render={(props) => (
                                                    <Snippets />
                                                )}
                                            />
                                            <Route
                                                path='/Fireworks'
                                                render={(props) => (
                                                    <Fireworks display='true' quantity='50' />
                                                )}
                                            />
                                            <Route path='/Weather' render={(props) => <Weather />} />
                                            <Route path='/Buoys' component={Buoys} />
                                            <Route path='/Sessions' component={Sessions} />
                                            <Route path='/Swell' component={SlideShow} />
                                            <Route path='/PhotoSequence' component={PhotoSequence} />
                                            <Route
                                                path='/Adder'
                                                render={(props) => (
                                                    <Adder
                                                        {...props}
                                                        label='How big was it?'
                                                        unit='ft'
                                                        count='10'
                                                    />
                                                )}
                                            />
                                            <Route path='/Counter' render={(props) => <Counter />} />
                                            <Route path='/Photos' render={(props) => <Photos />} />
                                            <Route path='/Videos' render={(props) => <Videos />} />
                                            <Route path='/Wiki' render={(props) => <Wiki />} />
                                            <Route path='/Video' render={(props) => <Video />} />
                                            <Route path='/ExchangeRates' render={(props) => <ExchangeRates />} />
                                            <Route path='/Assessments' render={(props) => <Assessments />} />
                                            <Route path='/Emergency' render={(props) => <Emergency />} />
                                            <Route path='/Camp' render={(props) => <Camp />} />
                                            <Route path='/EStation' render={(props) => <EStation />} />
                                            <Route path='/GallonsCalculator' render={(props) => <GallonsCalculator />} />
                                            <Route path='/Fuel' render={(props) => <Fuel />} />
                                                <Route path='/Eat' render={(props) => <Eat />} />
                                            <Route path='/Parks' render={(props) => <Parks />} />
                                            <Route path='/City' render={(props) => <City />} />
                                            <Route path='/Moon' render={(props) => <Moon standalone={true} />} />
                                            <Route path='/PhotoAssistant' render={(props) => <PhotoAssistant />} />
                                            {/*<Route path='/PhotoAssistant' render={(props) => <><PhotoAssistant /><AIPhotoAssistant /></>} />*/}
                                            <Route path='/Sounds' render={(props) => <SoundBoard />} />
                                            <Route path='/TicTacToe' render={(props) => <TicTacToe />} />
                                            <Route path='/Pacman' render={(props) => <Pacman />} />

                                            {/*<Route path='/CrosswordPuzzle' render={(props) => <CrosswordPuzzle />} />*/}
                                            <Route path='/Currency' render={(props) => <Currency />} />
                                            <Route path='/Expenses' render={(props) => <Expenses />} />
                                            <Route path='/Interest' render={(props) => <Interest />} />
                                            <Route path='/Mortgage' render={(props) => <Mortgage />} />
                                            <Route path='/Pay' render={(props) => <Pay />} />
                                            <Route path='/Budget' render={(props) => <Budget />} />
                                            <Route path='/TradeView' render={(props) => <TradeView />} />
                                            <Route path='/Crypto' render={(props) => <Crypto />} />
                                            <Route path='/Pricing' render={(props) => <Pricing />} />
                                            <Route path='/Converter' render={(props) => <Converter />} />
                                            <Route path='/News' render={(props) => <News />} />
                                            <Route path='/Scheduler' render={(props) => <Scheduler />} />
                                            <Route path='/BlackJack' render={(props) => <BlackJack />} />
                                            <Route path='/Poker' render={(props) => <Poker />} />
                                            <Route path='/Animation' render={(props) => <Animation />} />
                                            <Route path='/Checkers' render={(props) => <Checkers />} />
                                            <Route path='/WheelOfFortune' render={(props) => <WheelOfFortune />} />
                                            <Route path='/Roulette' render={(props) => <Roulette />} />
                                            <Route path='/Tracker' render={(props) => <Tracker />} />
                                            <Route path='/529' render={(props) => <Expense529 />} />
                                            <Route path='/Notes' render={(props) => <Notes />} />
                                            <Route path='/Tasks' render={(props) => <Tasks />} />
                                            <Route path='/Sets' render={(props) => <Sets />} />
                                            <Route path='/TipCalculator' render={(props) => <TipCalculator />} />
                                            {/*<Route path='/Events' render={(props) => <Events />} />*/}
                                            <Route path='/Charges' render={(props) => <Charges />} />
                                            <Route path='/Links' render={(props) => <Links />} />
                                            <Route path='/Cook' render={(props) => <Cook />} />
                                            <Route path='/Ingredients' render={(props) => <Ingredients />} />
                                            <Route path='/Circuit' render={(props) => <Train />} />
                                            <Route path='/Journals' render={(props) => <Journals />} />
                                            <Route path='/BusinessTax' render={(props) => <BusinessTax />} />
                                            <Route path='/Lumber' render={(props) => <Lumber />} />
                                            <Route path='/Concrete' render={(props) => <Concrete />} />
                                            <Route path='/THD' render={(props) => <THD />} />
                                            <Route path='/Tide' render={(props) => <TideChart standalone='true' />} />
                                            <Route path='/TrainingLog' render={(props) => <TrainingLog />} />
                                            <Route path='/Admin' render={(props) => <Admin />} />
                                            {/*<Route path='/AIDashboard' render={(props) => <AIDashboard />} />*/}
                                            {/*<Route path='/Checklist' render={(props) => <Checklist />} />*/}
                                            <Route path='/Translate' render={(props) => <Translator />} />
                                            <Route path='/Scores' render={(props) => <Scores />} />
                                            <Route path='/Shop' render={(props) => <Shop />} />
                                            <Route path='/Grocery' render={(props) => <Grocery />} />
                                            <Route path='/Vote' render={(props) => <VotingForm />} />
                                            <Route path='/House' render={(props) => <HomeManager />} />
                                            <Route path='/Music' render={(props) => <Music />} />
                                                <Route path='/Watch' render={(props) => <Watch />} />
                                                <Route path='/Pics' render={(props) => <Pics />} />
                                            <Route path='/Media' render={(props) => <Media />} />
                                            <Route
                                                path='/Accordion'
                                                render={(props) => <Accordion items={items} />}
                                            />
                                            <Route path='/Todos' render={(props) => <Todos />} />
                                            <Route path='/Reducer' component={Reducer} />
                                            <Route
                                                path='/Billiards'
                                                render={(props) => (
                                                    <Billiards />
                                                )}
                                            />
                                        </Switch>
                                        </Suspense>
                                    </div>
                                    <SitewideLowerNav />
                                    {/*
                                        <Switch>
                                            <CountryContext.Provider value={state.country}>
                                                <Footer
                                                    isMotionOn={isMotionOn}
                                                    isSignedIn={state.isSignedIn}
                                                    setMotion={setMotion}
                                                    setSignIn={setSignIn}
                                                    setCountry={setCountry}
                                                />
                                            </CountryContext.Provider>
                                        </Switch>
                                    */}                
                                    </div>
                            </Router>
                        </Provider>
                    </FocusManagerProvider>
                </MultiInputProvider>
            
            </div>
         </LayoutProvider>
     );
}
export default App;
//export default MainApp;