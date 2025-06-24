import React, { useState } from 'react';
import FormNotes from './components/forms/FormEssay';
//import Reservation from './components/forms/FormReservation';
//import SignUpDialog from './components/utils/SignUpDialog';
import debounce from './components/utils/Debouncer';
import Footer from './components/site/Footer';
import Header from './components/site/Header';
import Home from './components/Home';
//import BowlBuilder from './components/BowlBuilder';
import Sessions from './components/waves/Sessions';
import Session from './components/waves/Session';
import Waves from './components/waves/Waves';
import Snippets from './components/utils/Snippets';
import TideChart from './components/waves/tide/TideChart';
import Buoys from './components/waves/SurfReports';
import SlideShow from './components/utils/SlideShow';
import PhotoSequence from './components/utils/PhotoSequence';
import Reducer from './components/Reducer';
import Adder from './components/hooks/Adder';
import Counter from './components/hooks/Counter';
import Todos from './components/hooks/Todos';
import './assets/css/App.css';
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
import Fuel from './components/utils/Fuel';
import SoundBoard from './components/sound/SoundBoard';
import TicTacToe from './components/games/tictactoe/TicTacToe';
import Currency from './components/converter/Currency';
import Expenses from './components/expense/Expenses';
import Converter from './components/converter/Converter';
import Tracker from './components/tracker/Tracker';
import TrainingLog from './components/tracker/TrainingLog';
//import Checklist from './components/utils/SheetsChecklist';
//import VideoPlayer from './components/utils/VideoPlayer';
import Translator from './components/translator/Translator';
import Accordion from './components/utils/Accordion';
import Weather from './components/weather/Weather';
import Scores from './components/games/scorekeeper/Scores';
import Calculator from './components/converter/Calculator';
import Shop from './components/shop/Shop';
import MusicPlayer from './components/music/Player';
import history from './components/utils/history';
import Fireworks from './components/legacy/Fireworks';
import CountryContext from './components/context/CountryContext';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import initializeData from './components/utils/InitializeData';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isMotionOn: true,
      width: window.innerWidth,
      height: window.innerHeight,
      isSignedIn: null,
      country: 'us'
    };
    this.setIt = this.setIt.bind(this);
  }
  base = 'reactor/';
  company = 'KFA';
  path = initializeData('path', window.location.pathname);
  componentId = this.path.replace('/', '').toLocaleLowerCase();
  currentComponent = this.componentId;
  setMotion = () => this.setState({ isMotionOn: !this.state.isMotionOn });
  setSignIn = () => {
    console.log(`sssetSignIn ======> ${!this.state.isSignedIn}`);
    this.setState({
      isSignedIn: !this.state.isSignedIn,
    });
  };
  setCountry = (countryInitials) => {
    console.log(`setCountry => ${countryInitials}`);
    this.setState({
      country: countryInitials
    });
  };
  widthChanged = () => (window.innerWidth !== this.state.width ? true : false);
  heightChanged = () =>
    window.innerHeight !== this.state.height ? true : false;
  updateState = () => {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };
  setIt = () =>
    this.widthChanged() || this.heightChanged() ? this.updateState() : false;
  items = [
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

  components = {
    surflog: <Session />,
    //guestlist: <SignUpDialog title='Guest List' message='Sign up' />,
    //reservation: <Reservation />,
    notes: <FormNotes className='mt-40' />,
    tempconverter: <Calculator />,
    //bowlbuilder: <BowlBuilder />,
    home: <Home />,
  };

  render() {
    window.addEventListener('resize', debounce(this.setIt, 250));
    const path = `/${window.location.pathname.split('/')[2]}`
    localStorage.setItem('path', path)
    /*
    const componentTag = (current) => <div className='App'>
            <Header company={this.company} width={this.state.width} isMotionOn={this.state.isMotionOn}/>
              <div className='fadeIn'>
                {this.components[current]}
              </div>
            <Footer isMotionOn={this.state.isMotionOn} setMotion={this.setMotion}/>
          </div>;
    */
    //let AppComponent = () => componentTag(this.currentComponent);
    const logIdExists = window.location.search.includes('logId') ? true : false;
    const startIndex = () => window.location.search.indexOf('logId=') + 6;
    const endIndex = () => window.location.search.length;
    const getLogId = () =>
      window.location.search.substring(startIndex(), endIndex());
    const logId = logIdExists ? getLogId() : '';
    // eslint-disable-next-line
    const { width, height, isMotionOn, isSignedIn } = this.state;
    console.log(`App => this.state.isSignedIn: ${this.state.isSignedIn}`);

    return (
      //AppComponent();<ScrollToTop loc={window.location} />
      <Provider store={store}>
        <Router basename={this.base} history={history}>

          <div className='App'>
            <Switch>
              <Header
                company={this.company}
                width={width}
                isSignedIn={this.state.isSignedIn}
                isMotionOn={isMotionOn}
                setSignIn={this.setSignIn}
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
                <Route path='/Notes' component={FormNotes} />
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
                <Route path='/SoundBoard' render={(props) => <SoundBoard />} />
                <Route path='/TicTacToe' render={(props) => <TicTacToe />} />
                <Route path='/Currency' render={(props) => <Currency />} />
                <Route path='/Expenses' render={(props) => <Expenses />} />
                <Route path='/Converter' render={(props) => <Converter />} />
                <Route path='/Tracker' render={(props) => <Tracker />} />
                <Route path='/TideChart' render={(props) => <TideChart />} />
                <Route path='/TrainingLog' render={(props) => <TrainingLog />} />
                <Route path='/Admin' render={(props) => <Admin />} />
                {/*<Route path='/Checklist' render={(props) => <Checklist />} />*/}
                <Route path='/Translate' render={(props) => <Translator />} />
                <Route path='/Scores' render={(props) => <Scores />} />
                <Route path='/Shop' render={(props) => <Shop />} />
                <Route path='/Music' render={(props) => <MusicPlayer />} />
                <Route
                  path='/Accordion'
                  render={(props) => <Accordion items={this.items} />}
                />
                <Route path='/Todos' render={(props) => <Todos />} />
                <Route path='/Reducer' component={Reducer} />
              </Switch>
            </div>
            <Switch>
              <CountryContext.Provider value={this.state.country}>
                <Footer
                  isMotionOn={isMotionOn}
                  isSignedIn={this.state.isSignedIn}
                  setMotion={this.setMotion}
                  setSignIn={this.setSignIn}
                  setCountry={this.setCountry}
                />
              </CountryContext.Provider>
            </Switch>
          </div>
        </Router>
      </Provider>
    );
  }
}
export default App;