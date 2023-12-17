import React, { useState } from 'react';
import FormNotes from './components/forms/FormEssay.js';
import Reservation from './components/forms/FormReservation.js';
import SignUpDialog from './components/utils/SignUpDialog.js';
import debounce from './components/utils/Debouncer.js';
import Footer from './components/site/Footer.js';
import Header from './components/site/HeaderNoRouter.js';
import Home from './components/Home.js';
import Calculator from './components/Calculator.js';
import BowlBuilder from './components/BowlBuilder.js';
import LogDirectory from './components/waves/LogDirectoryNoRouter.js';
import SurfLog from './components/waves/LoggerFunctional.js';
import WaveFinder from './components/waves/WaveFinder.js';
import Buoys from './components/waves/SurfReports.js';                            
import SlideShow from './components/SlideShow.js';
import PhotoBlog from './components/blog/PhotoBlog.js';
import PhotoSequence from './components/utils/PhotoSequence.js';
import Reducer from './components/Reducer.js';
import Adder from './components/hooks/Adder.js';
import Counter from './components/hooks/Counter.js';
import Todos from './components/hooks/Todos.js';   
import './assets/css/App.css';
import Photos from './components/utils/Photos.js';
import Videos from './components/utils/Videos.js';
import WikiSearch from './components/utils/WikiSearch.js';
import DualVideoPlayer from './components/utils/DualVideoPlayer.js';
import ExchangeRates from './components/utils/ExchangeRates.js';
import ExchangeConverter from './components/utils/ExchangeConverter.js';
import ExpenseTracker from './components/utils/ExpenseTracker.js';
import TaskTracker from './components/utils/TaskTracker.js';
import VideoPlayer from './components/utils/VideoPlayer.js';
import Translator from './components/utils/Translator.js';
import Accordion from './components/utils/Accordion.js';
import Route from './components/utils/Route.js';

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
    const logId = (logIdExists) ? getLogId() : localStorage.getItem('logId');

    return (
        <div>
            <div className='App'>
                <Header company={company} menu='false' width={width} isMotionOn={isMotionOn}/>
                <div className='fadeIn'>
                    <Route path='/'>
                        <WaveFinder
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
                    <Route path='/Home'><Home /></Route>
                    <Route path='/Accordion'><Accordion items={items} /></Route>
                    <Route path='/BowlBuilder'><BowlBuilder /></Route>
                    <Route path='/Converter'><Calculator /></Route>
                    <Route path='/Notes'><FormNotes /></Route>
                    <Route path='/Reservation'><Reservation /></Route>
                    <Route path='/GuestList'><SignUpDialog /></Route>
                    <Route path='/SurfLog'><SurfLog logId={logId} /></Route>
                    <Route path='/WaveFinder'>
                        <WaveFinder 
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
                    <Route path='/Buoys'><Buoys /></Route>
                    <Route path='/LogDirectory'><LogDirectory /></Route>
                    <Route path='/Swell'><SlideShow /></Route>
                    <Route path='/PhotoBlog'><PhotoBlog/></Route>
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
                    <Route path='/WikiSearch'><WikiSearch /></Route>
                    <Route path='/DualVideoPlayer'><DualVideoPlayer /></Route>
                    <Route path='/ExchangeRates'><ExchangeRates /></Route>
                    <Route path='/ExchangeConverter'><ExchangeConverter /></Route>
                    <Route path='/ExpenseTracker'><ExpenseTracker /></Route>
                    <Route path='/TaskTracker'><TaskTracker /></Route>
                    <Route path='/Translator'><Translator /></Route>
                    <Route path='/Todos'><Todos /></Route>
                    <Route path='/Reducer' ><Reducer /></Route>
                </div>
                <Footer isMotionOn={isMotionOn} setMotion={setMotion}/>
             </div>
        </div>
    )
}