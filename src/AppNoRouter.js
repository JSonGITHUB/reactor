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
import Product from './components/shop/Product';
import EyeExercises from './components/eye/EyeExercises';
import PDFReport from './components/eye/PDFReport';
import SunTracker from './components/waves/SunTracker';
import StepTimer from './components/utils/StepTimer';
import StepManager from './components/StepManager';
import Garden from './components/garden/Garden';
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
import Currency from './components/utils/Currency';
import Expenses from './components/utils/Expenses';
import Converter from './components/utils/Converter';
import Tracker from './components/tracker/Tracker';
import TrainingLog from './components/tracker/TrainingLog';
import VideoPlayer from './components/utils/VideoPlayer';
import Translator from './components/utils/Translator';
import Accordion from './components/utils/Accordion';
import Route from './components/utils/Route';
import initializeData from './components/utils/InitializeData';
import SunTracker from './components/waves/SunTracker';

export default ({ props }) => {

    const [ isMotionOn, setIsMotionOn ] = useState(true);
    const [ width, setWidth ] = useState(window.innerWidth);
    const [ height, setHeight ] = useState(window.innerHeight);

    const company = 'KFA';

    const setMotion = () => setIsMotionOn(!isMotionOn);
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
                    <Route path='/Snippets'>
                        <Snippets />
                    </Route>
                    <Route path='/Home'><Home /></Route>
                    <Route path='/Accordion'><Accordion items={items} /></Route>
                    <Route path='/BowlBuilder'><BowlBuilder /></Route>
                    {/*<Route path='/Convert'><Calculator /></Route>*/}
                    <Route path='/Notes'><FormNotes /></Route>
                    <Route path='/Reservation'><Reservation /></Route>
                    <Route path='/GuestList'><SignUpDialog /></Route>
                    <Route path='/Session'><Session logId={logId} /></Route>
                    <Route path='/SunTracker'><SunTracker /></Route>
                    <Route path='/EyeExercises'><EyeExercises /></Route>
                    <Route path='/PDFReport'><PDFReport /></Route>
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
                    <Route path='/Converter'><Converter /></Route>
                    <Route path='/Tracker'><Tracker /></Route>
                    <Route path='/TideChart'><TideChart /></Route>
                    <Route path='/TrainingLog'><TrainingLog /></Route>
                    <Route path='/Admin'><Admin /></Route>
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