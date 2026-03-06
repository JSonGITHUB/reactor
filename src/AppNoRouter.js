import React, { useState } from 'react';
import FormNotes from './components/forms/FormEssay';
import Reservation from './components/forms/FormReservation';
import SignUpDialog from './components/utils/SignUpDialog';
import debounce from './components/utils/Debouncer';
import Footer from './components/site/Footer';
import Header from './components/site/HeaderNoRouter';
import Home from './components/Home';
import Calculator from './components/Calculator';
import BowlBuilder from './components/BowlBuilder';
import Sessions from './components/waves/LogDirectoryNoRouter';
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
import Snippets from './components/utils/Snippets';
import TideChart from './components/waves/tide/TideChart';
import Buoys from './components/waves/SurfReports';                            
import SlideShow from './components/SlideShow';
import PhotoSequence from './components/utils/PhotoSequence';
import Reducer from './components/Reducer';
import Adder from './components/hooks/Adder';
import Counter from './components/hooks/Counter';
import Todos from './components/hooks/Todos';   
import './assets/css/App.css';
import Photos from './components/utils/Photos';
import Videos from './components/utils/Videos';
import Wiki from './components/wiki/Wiki';
import Video from './components/utils/Video';
import ExchangeRates from './components/utils/ExchangeRates';
import Admin from './components/utils/Admin';
//import AIDashboard from './components/utils/AIDashboard';
import Currency from './components/utils/Currency';
import Expenses from './components/utils/Expenses';
import Interest from './components/finance/Interest';
import Pay from './components/finance/Pay';
import Budget from './components/utils/Budget';
import TradeView from './components/utils/TradeView';
import Pricing from './components/utils/Pricing';
import Converter from './components/utils/Converter';
import Tracker from './components/tracker/Tracker';
import Expense529 from './components/tracker/Expense529';
import Notes from './components/tracker/Notes';
import Tasks from './components/tracker/Tasks';
import Sets from './components/tracker/Sets';
//import Events from './components/tracker/Events';
import Charges from './components/tracker/Charges';
import Ingredients from './components/tracker/Ingredients';
import Cook from './components/tracker/Cook';
import Train from './components/tracker/Train';
import Journals from './components/tracker/Journals';
import BusinessTax from './components/tracker/BusinessTax';
import Scheduler from './components/tracker/Scheduler';
import BlackJack from './components/games/Gamble/BlackJack';
import Poker from './components/games/Poker';
import Animation from './components/tracker/Animation';
import Checkers from './components/games/checkers/Checkers.jsx';
import WheelOfFortune from './components/tracker/WheelOfFortune';
import Roulette from './components/tracker/Roulette';
import TrainingLog from './components/tracker/TrainingLog';
import Dose from './components/tracker/Dose';
import VideoPlayer from './components/utils/VideoPlayer';
import Translator from './components/utils/Translator';
import Accordion from './components/utils/Accordion';
import Route from './components/utils/Route';
import initializeData from './components/utils/InitializeData';
import SunTracker from './components/waves/SunTracker';
import MenuScreen from './components/site/MenuScreen';

export default ({ props }) => {

    const [ isMotionOn, setIsMotionOn ] = useState(true);
    const [ width, setWidth ] = useState(window.innerWidth);
    const [ height, setHeight ] = useState(window.innerHeight);

    const company = 'KFA';

    const setMotion = () => setIsMotionOn(prev => !prev);
    const widthChanged = () => (window.innerWidth !== width) ? true : false;
    const heightChanged = () => (window.innerHeight !== height) ? true : false;

    const updateState = () => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
    }
    const setIt = () => (widthChanged() || heightChanged()) ? updateState() : false;
    const items = [
        {
            title: 'item1',
            content: 'content 1' 
        },
        {
            title: 'item2',
            content: 'content 2' 
        },
        {
            title: 'item3',
            content: 'content 3' 
        },
        {
            title: 'item4',
            content: 'content 4' 
        },
    ]
    window.addEventListener('resize', debounce(setIt, 250));

    const logIdExists = (window.location.search.includes('logId')) ? true : false;
    const startIndex = () => window.location.search.indexOf('logId=')+6;
    const endIndex = () => window.location.search.length;
    const getLogId = () => window.location.search.substring(startIndex(), endIndex());
    const logId = (logIdExists) ? getLogId() : initializeData('logId', null);

    return (
        <div>
            <div className='App'>
                <Header company={company} menu='false' width={width} isMotionOn={isMotionOn}/>
                <div className='fadeIn'>
                    <Route path='/'>
                        <Waves
                            tide='medium' 
                            isSwell1='false' 
                            isSwell2='false' 
                            isTide='false' 
                            isWind='false' 
                            swell1Direction='SSW' 
                            swell2Direction='W'  
                            swell1Angle='210' 
                            swell2Angle='278' 
                            swell1Height='3' 
                            swell2Height='2'
                            swell1Interval='17 seconds' 
                            swell2Interval='17 seconds'  
                            windDirection='W' 
                            distance='10' 
                        />
                    </Route>
                    <Route path='/MenuScreen'>
                        <MenuScreen />
                    </Route>
                    <Route path='/Weather'>
                        <Weather />
                    </Route>
                    <Route path='/Dive'>
                        <Dive coreMetricsOnly={window.location.search.includes('core=true')} />
                    </Route>
                    <Route path='/Location'>
                        <Location mode='display' />
                    </Route>
                    <Route path='/Wind'>
                        <WindDirection />
                    </Route>
                    <Route path='/Water'>
                        <WindDirection />
                    </Route>
                    <Route path='/Air'>
                        <WindDirection />
                    </Route>
                    <Route path='/Snippets'>
                        <Snippets />
                    </Route>
                    <Route path='/Home'><Home /></Route>
                    <Route path='/Accordion'><Accordion items={items} /></Route>
                    <Route path='/BowlBuilder'><BowlBuilder /></Route>
                    {/*<Route path='/Convert'><Calculator /></Route>*/}
                    <Route path='/Note'><FormNotes /></Route>
                    <Route path='/Reservation'><Reservation /></Route>
                    <Route path='/GuestList'><SignUpDialog /></Route>
                    <Route path='/Session'><Session logId={logId} /></Route>
                    <Route path='/SunTracker'><SunTracker /></Route>
                    {/*
                    <Route path='/EyeExercises'><EyeExercises /></Route>
                    <Route path='/PDFReport'><PDFReport /></Route>
                    */}
                    <Route path='/Product'><Product /></Route>
                    <Route path='/Waves'>
                        <Waves 
                            {...props} 
                            tide='medium' 
                            isSwell1='false' 
                            isSwell2='false' 
                            isTide='false' 
                            isWind='false' 
                            swell1Direction='SSW' 
                            swell2Direction='W' 
                            swell1Angle='210' 
                            swell2Angle='278' 
                            swell1Height='3' 
                            swell2Height='2' 
                            swell1Interval='17 seconds' 
                            swell2Interval='17 seconds' 
                            windDirection='W' 
                            distance='10'
                        />
                    </Route>
                    <Route path='/StepTimer'>
                        <StepTimer />
                    </Route>
                    <Route path='/StepManager'>
                        <StepManager />
                    </Route>
                    <Route path='/Garden'>
                        <Garden />
                    </Route>
                    <Route path='/Fishing'>
                        <FishFinder />
                    </Route>
                    <Route path='/Collections'>
                        <DebtCollector />
                    </Route>
                    <Route path='/WorkDay'>
                        <WorkDay />
                    </Route>
                    <Route path='/Buoys'><Buoys /></Route>
                    <Route path='/Sessions'><Sessions /></Route>
                    <Route path='/Swell'><SlideShow /></Route>
                    <Route path='/PhotoSequence'><PhotoSequence /></Route>
                    <Route path='/Adder'>
                        <Adder 
                            label='How big was it?' 
                            unit='ft' 
                            count='10' 
                        />
                    </Route>
                    <Route path='/Counter'><Counter /></Route>
                    <Route path='/Photos'><Photos /></Route>
                    <Route path='/Videos'><Videos /></Route>
                    <Route path='/Wiki'><Wiki /></Route>
                    <Route path='/Video'><Video /></Route>
                    <Route path='/ExchangeRates'><ExchangeRates /></Route>
                    <Route path='/Currency'><Currency /></Route>
                    <Route path='/Expenses'><Expenses /></Route>
                    <Route path='/Interest'><Interest /></Route>
                    <Route path='/Pay'><Pay /></Route>
                    <Route path='/Budget'><Budget /></Route>
                    <Route path='/TradeView'><TradeView /></Route>
                    <Route path='/Pricing'><Pricing /></Route>
                    <Route path='/Converter'><Converter /></Route>
                    <Route path='/Tracker'><Tracker /></Route>
                    <Route path='/529'><Expense529 /></Route>
                    <Route path='/Notes'><Notes /></Route>
                    <Route path='/Tasks'><Tasks /></Route>
                    <Route path='/Sets'><Sets /></Route>
                    <Route path='/Charges'><Charges /></Route>
                    {/*<Route path='/Events'><Events /></Route>*/}
                    <Route path='/Links'><Links /></Route>
                    <Route path='/Circuit'><Train /></Route>
                    <Route path='/Journals'><Journals /></Route>
                    <Route path='/Cook'><Cook /></Route>
                    <Route path='/Ingredients'><Ingredients /></Route>
                    <Route path='/BusinessTax'><BusinessTax /></Route>
                    <Route path='/Dose'><Dose /></Route>
                    <Route path='/Scheduler'><Scheduler /></Route>
                    <Route path='/BlackJack'><BlackJack /></Route>
                    <Route path='/Poker'><Poker /></Route>
                    <Route path='/Animation'><Animation /></Route>
                    <Route path='/Checkers'><Checkers /></Route>
                    <Route path='/WheelOfFortune'><WheelOfFortune /></Route>
                    <Route path='/Roulette'><Roulette /></Route>
                    <Route path='/Tide'><TideChart /></Route>
                    <Route path='/TrainingLog'><TrainingLog /></Route>
                    <Route path='/Admin'><Admin /></Route>
                    {/*<Route path='/AIDashboard'><AIDashboard /></Route>*/}
                    {/*<Route path='/Sheets'><Checklist /></Route>*/}
                    <Route path='/Translate'><Translator /></Route>
                    <Route path='/Todos'><Todos /></Route>
                    <Route path='/Reducer' ><Reducer /></Route>
                </div>
                <Footer isMotionOn={isMotionOn} setMotion={setMotion}/>
             </div>
        </div>
    )
}