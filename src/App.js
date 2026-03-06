import React, { useState } from 'react';
import FormNotes from './components/forms/FormEssay';
//import Reservation from './components/forms/FormReservation';
//import SignUpDialog from './components/utils/SignUpDialog';
import debounce from './components/utils/Debouncer';
import TradeView from './components/utils/TradeView';
import Header from './components/site/Header';
import Home from './components/Home';

import './assets/css/App.css';
//import BowlBuilder from './components/BowlBuilder';
import Sessions from './components/waves/Sessions';
import Session from './components/waves/Session';
import Waves from './components/waves/Waves';
import Weather from './components/waves/Weather';
import Dive from './components/waves/Dive';
import Location from './components/waves/Location';
import WindDirection from './components/waves/WindDirection';
import Product from './components/shop/Product';
//import EyeExercises from './components/eye/EyeExercises';
//import PDFReport from './components/eye/PDFReport';
import SunTracker from './components/waves/SunTracker';
import StepTimer from './components/utils/StepTimer';
import StepManager from './components/StepManager';
import Garden from './components/garden/Garden';
import FishFinder from './components/fishing/FishFinder';
import DebtCollector from './components/finance/DebtCollector';
import WorkDay from './components/finance/WorkDay';
import NaturalRX from './components/functional/NaturalRX';
import Snippets from './components/utils/Snippets';
import TideChart from './components/waves/tide/TideChart';
import Buoys from './components/waves/SurfReports';
import SlideShow from './components/utils/SlideShow';
import PhotoSequence from './components/utils/PhotoSequence';
import Reducer from './components/Reducer';
import Adder from './components/hooks/Adder';
import Counter from './components/hooks/Counter';
import Todos from './components/hooks/Todos';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
//import ScrollToTop from './components/utils/ScrollToTop';
import Photos from './components/utils/Photos';
import Videos from './components/video/Videos';
import Wiki from './components/wiki/Wiki';
import Video from './components/video/Video';
import ExchangeRates from './components/converter/ExchangeRates';
import Assessments from './components/utils/Assessments';
import GallonsCalculator from './components/utils/GallonsCalculator';
import Admin from './components/utils/Admin';
//import AIDashboard from './components/utils/AIDashboard';
import Fuel from './components/utils/Fuel';
import Parks from './components/Parks/Parks';
import Moon from './components/utils/Moon';
import PhotoAssistant from './components/utils/PhotoAssistant';
import SoundBoard from './components/sound/SoundBoard';
import TicTacToe from './components/games/tictactoe/TicTacToe';
//import CrosswordPuzzle from './components/games/words/CrosswordPuzzle';
import Currency from './components/converter/Currency';
import Expenses from './components/expense/Expenses';
import Interest from './components/finance/Interest';
import Pay from './components/finance/Pay';
import Budget from './components/expense/Budget';
import Pricing from './components/expense/Pricing';
import Converter from './components/converter/Converter';
import Tracker from './components/tracker/Tracker';
import Expense529 from './components/tracker/Expense529';
import Notes from './components/tracker/Notes';
import Tasks from './components/tracker/Tasks';
import Sets from './components/tracker/Sets';
//import Events from './components/tracker/Events';
import Charges from './components/tracker/Charges';
import Links from './components/tracker/Links';
import Cook from './components/tracker/Cook';
import Ingredients from './components/tracker/Ingredients';
import Train from './components/tracker/Train';
import Journals from './components/tracker/Journals';
import BusinessTax from './components/tracker/BusinessTax';
import Scheduler from './components/tracker/Scheduler';
import BlackJack from './components/games/Gamble/BlackJack';
import Poker from './components/games/Poker';
import Animation from './components/games/Gamble/Animation';
import Checkers from './components/games/checkers/Checkers.jsx';
import WheelOfFortune from './components/games/Gamble/WheelOfFortune';
import Roulette from './components/games/Gamble/Roulette';

import TrainingLog from './components/tracker/TrainingLog';
import Dose from './components/tracker/Dose';
//import Checklist from './components/utils/SheetsChecklist';
//import VideoPlayer from './components/utils/VideoPlayer';
import Translator from './components/translator/Translator';
import Accordion from './components/utils/Accordion';
//import Weather from './components/weather/Weather';
import Scores from './components/games/scorekeeper/Scores';
import Shop from './components/shop/Shop';
import HomeManager from './components/Residential/HomeManager';
import MusicPlayer from './components/music/Player';
import Fireworks from './components/legacy/Fireworks';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { VotingForm } from './components/VotingForm';
import { MultiInputProvider } from './MultiInputContext';
import { FocusManagerProvider } from './FocusManagerContext';
import { MenuScreen } from './MenuScreen';

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

    return (
        //AppComponent();<ScrollToTop loc={window.location} />
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

                            <div className='App'>
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
                                            render={(props) => (
                                                <div className='containerDetail bg-blue p-30 size30'>
                                                    <WindDirection columns='2' setWind={() => console.log('setWind')} height='0px' collapse={() => console.log('collapse')} />
                                                </div>
                                            )}
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
                                        />
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
                                        <Route path='/GallonsCalculator' render={(props) => <GallonsCalculator />} />
                                        <Route path='/Fuel' render={(props) => <Fuel />} />
                                        <Route path='/Parks' render={(props) => <Parks />} />
                                        <Route path='/Moon' render={(props) => <Moon standalone={true} />} />
                                        <Route path='/PhotoAssistant' render={(props) => <PhotoAssistant />} />
                                        <Route path='/Sounds' render={(props) => <SoundBoard />} />
                                        <Route path='/TicTacToe' render={(props) => <TicTacToe />} />
                                        {/*<Route path='/CrosswordPuzzle' render={(props) => <CrosswordPuzzle />} />*/}
                                        <Route path='/Currency' render={(props) => <Currency />} />
                                        <Route path='/Expenses' render={(props) => <Expenses />} />
                                        <Route path='/Interest' render={(props) => <Interest />} />
                                        <Route path='/Pay' render={(props) => <Pay />} />
                                        <Route path='/Budget' render={(props) => <Budget />} />
                                        <Route path='/TradeView' render={(props) => <TradeView />} />
                                        <Route path='/Pricing' render={(props) => <Pricing />} />
                                        <Route path='/Converter' render={(props) => <Converter />} />
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
                                        {/*<Route path='/Events' render={(props) => <Events />} />*/}
                                        <Route path='/Charges' render={(props) => <Charges />} />
                                        <Route path='/Links' render={(props) => <Links />} />
                                        <Route path='/Cook' render={(props) => <Cook />} />
                                        <Route path='/Ingredients' render={(props) => <Ingredients />} />
                                        <Route path='/Circuit' render={(props) => <Train />} />
                                        <Route path='/Journals' render={(props) => <Journals />} />
                                        <Route path='/BusinessTax' render={(props) => <BusinessTax />} />
                                        <Route path='/Tide' render={(props) => <TideChart />} />
                                        <Route path='/TrainingLog' render={(props) => <TrainingLog />} />
                                        <Route path='/Admin' render={(props) => <Admin />} />
                                        {/*<Route path='/AIDashboard' render={(props) => <AIDashboard />} />*/}
                                        {/*<Route path='/Checklist' render={(props) => <Checklist />} />*/}
                                        <Route path='/Translate' render={(props) => <Translator />} />
                                        <Route path='/Scores' render={(props) => <Scores />} />
                                        <Route path='/Shop' render={(props) => <Shop />} />
                                        <Route path='/Vote' render={(props) => <VotingForm />} />
                                        <Route path='/House' render={(props) => <HomeManager />} />
                                        <Route path='/Music' render={(props) => <MusicPlayer />} />
                                        <Route
                                            path='/Accordion'
                                            render={(props) => <Accordion items={items} />}
                                        />
                                        <Route path='/Todos' render={(props) => <Todos />} />
                                        <Route path='/Reducer' component={Reducer} />
                                    </Switch>
                                </div>
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
    );
}
export default App;
//export default MainApp;