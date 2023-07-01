import React from "react";
import FormNotes from "./components/forms/FormEssay.js";
//import Reservation from './components/forms/FormReservation.js';
//import SignUpDialog from './components/utils/SignUpDialog.js';
import debounce from "./components/utils/Debouncer.js";
import Footer from "./components/site/Footer.js";
import Header from "./components/site/Header.js";
import Home from "./components/Home.js";
//import BowlBuilder from './components/BowlBuilder.js';
import LogDirectory from "./components/waves/LogDirectory.js";
import SurfLog from "./components/waves/LoggerFunctional.js";
import WaveFinder from "./components/waves/WaveFinder.js";
import Buoys from "./components/waves/SurfReports.js";
import SlideShow from "./components/utils/SlideShow.js";
import PhotoBlog from "./components/blog/PhotoBlog.js";
import Blog from "./components/blog/Blog.js";
import PhotoSequence from "./components/utils/PhotoSequence.js";
import Reducer from "./components/Reducer.js";
import Adder from "./components/hooks/Adder.js";
import Counter from "./components/hooks/Counter.js";
import Todos from "./components/hooks/Todos.js";
import "./assets/css/App.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
//import ScrollToTop from "./components/utils/ScrollToTop.js";
import Photos from "./components/utils/Photos.js";
import Videos from "./components/utils/Videos.js";
import WikiSearch from "./components/utils/WikiSearch.js";
import DualVideoPlayer from "./components/utils/DualVideoPlayer.js";
import ExchangeRates from "./components/utils/ExchangeRates.js";
import ExchangeConverter from "./components/utils/ExchangeConverter.js";
import ExpenseTracker from "./components/utils/ExpenseTracker.js";
import TaskTracker from "./components/utils/TaskTracker.js";
import VideoPlayer from "./components/utils/VideoPlayer.js";
import Translator from "./components/translator/Translator.js";
import Accordion from "./components/utils/Accordion.js";
import Weather from "./components/weather/Weather.js";
import ScoreKeeper from "./components/utils/ScoreKeeper.js";
import Calculator from './components/converter/Calculator.js';
import Shop from "./components/shop/Shop.js";
import MusicPlayer from "./components/music/Player.js";
import StreamCreate from './components/streams/StreamCreate';
import StreamEdit from './components/streams/StreamEdit';
import StreamDelete from './components/streams/StreamDelete';
import StreamList from './components/streams/StreamList';
import StreamShow from './components/streams/StreamShow';
import history from './components/utils/history.js';
import Fireworks from './components/utils/Fireworks.js';
import CountryContext from './components/context/CountryContext.js';

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
  base = "reactor/";
  company = "KFA";
  path = window.location.pathname;
  componentId = this.path.replace("/", "").toLocaleLowerCase();
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
      title: "item1",
      content: "content 1",
    },
    {
      title: "item2",
      content: "content 2",
    },
    {
      title: "item3",
      content: "content 3",
    },
    {
      title: "item4",
      content: "content 4",
    },
  ];

  components = {
    surflog: <SurfLog />,
    //guestlist: <SignUpDialog title="Guest List" message="Sign up" />,
    //reservation: <Reservation />,
    notes: <FormNotes className="mt-40" />,
    tempconverter: <Calculator />,
    //bowlbuilder: <BowlBuilder />,
    home: <Home />,
  };

  render() {
    window.addEventListener("resize", debounce(this.setIt, 250));
    /*
    const componentTag = (current) => <div className="App">
            <Header company={this.company} width={this.state.width} isMotionOn={this.state.isMotionOn}/>
              <div className="fadeIn">
                {this.components[current]}
              </div>
            <Footer isMotionOn={this.state.isMotionOn} setMotion={this.setMotion}/>
          </div>;
    */
    //let AppComponent = () => componentTag(this.currentComponent);
    const logIdExists = window.location.search.includes("logId") ? true : false;
    const startIndex = () => window.location.search.indexOf("logId=") + 6;
    const endIndex = () => window.location.search.length;
    const getLogId = () =>
      window.location.search.substring(startIndex(), endIndex());
    const logId = logIdExists ? getLogId() : "";
    // eslint-disable-next-line
    const { width, height, isMotionOn, isSignedIn } = this.state;
    console.log(`App => this.state.isSignedIn: ${this.state.isSignedIn}`);
    return (
      //AppComponent();<ScrollToTop loc={window.location} />
      <Router basename={this.base} history={history}>
        
        <div className="App">
          <Switch>
            <Header
              company={this.company}
              width={width}
              isSignedIn={this.state.isSignedIn}
              isMotionOn={isMotionOn}
              setSignIn={this.setSignIn}
            />
          </Switch>
          <div className="fadeIn">
            <Switch>
              <Route
                exact
                path="/"
                render={(props) => (
                  <WaveFinder
                    {...props}
                    tide="medium"
                    isSwell1="false"
                    isSwell2="false"
                    isTide="false"
                    isWind="false"
                    swell1Direction="SSW"
                    swell2Direction="W"
                    swell1Angle="210"
                    swell2Angle="278"
                    swell1Height="3"
                    swell2Height="2"
                    swell1Interval="17 seconds"
                    swell2Interval="17 seconds"
                    windDirection="W"
                    distance="10"
                  />
                )}
              />
              <Route path="/Home" component={Home} />
              {/*<Route path="/BowlBuilder" component={BowlBuilder} />*/}
              {/*<Route path='/BowlBuilder' render={(props) => <BowlBuilder {...props} width={width} height={height} />}/>*/}
              <Route path="/Converter" component={Calculator} />
              <Route path="/Notes" component={FormNotes} />
              {/*<Route path="/Reservation" component={Reservation} />*/}
              {/*<Route path="/GuestList" component={SignUpDialog} />*/}
              {/*<Route path="/SurfLog" component={SurfLog} />*/}
              <Route
                path="/SurfLog"
                render={(props) => <SurfLog {...props} logId={logId} />}
              />
              <Route
                path="/WaveFinder"
                render={(props) => (
                  <WaveFinder
                    {...props}
                    tide="medium"
                    isSwell1="false"
                    isSwell2="false"
                    isTide="false"
                    isWind="false"
                    swell1Direction="SSW"
                    swell2Direction="W"
                    swell1Angle="210"
                    swell2Angle="278"
                    swell1Height="3"
                    swell2Height="2"
                    swell1Interval="17 seconds"
                    swell2Interval="17 seconds"
                    windDirection="W"
                    distance="10"
                  />
                )}
              /> 
              <Route
                path="/Fireworks"
                render={(props) => (
                  <Fireworks display='true' quantity='50' />
                )}
              />
              <Route path="/Weather" render={(props) => <Weather />} />
              <Route path="/Buoys" component={Buoys} />
              <Route path="/LogDirectory" component={LogDirectory} />
              <Route path="/Swell" component={SlideShow} />
              <Route path="/PhotoBlog" component={PhotoBlog} />
              <Route path="/Blog" component={Blog} />
              <Route path="/PhotoSequence" component={PhotoSequence} />
              <Route
                path="/Adder"
                render={(props) => (
                  <Adder
                    {...props}
                    label="How big was it?"
                    unit="ft"
                    count="10"
                  />
                )}
              />
              <Route path="/Counter" render={(props) => <Counter />} />
              <Route path="/Photos" render={(props) => <Photos />} />
              <Route path="/Videos" render={(props) => <Videos />} />
              <Route path="/WikiSearch" render={(props) => <WikiSearch />} />
              <Route path="/DualVideoPlayer" render={(props) => <DualVideoPlayer />} />
              <Route path="/ExchangeRates" render={(props) => <ExchangeRates />} />
              <Route path="/ExchangeConverter" render={(props) => <ExchangeConverter />} />
              <Route path="/ExpenseTracker" render={(props) => <ExpenseTracker />} />
              <Route path="/TaskTracker" render={(props) => <TaskTracker />} />
              <Route path="/Translator" render={(props) => <Translator />} />
              <Route path="/ScoreKeeper" render={(props) => <ScoreKeeper />} />
              <Route path="/Shop" render={(props) => <Shop />} />
              <Route path="/Music" render={(props) => <MusicPlayer />} />
              <Route
                path="/Accordion"
                render={(props) => <Accordion items={this.items} />}
              />
              <Route path="/Todos" render={(props) => <Todos />} />
              <Route path="/Reducer" component={Reducer} />
              <Route path="/streams" exact component={StreamList} />
              <Route path="/streams/" exact component={StreamList} />
              <Route path="/streams/list" exact component={StreamList} />
              <Route path="/streams/new" exact component={StreamCreate} />
              <Route path="/streams/edit/:id" exact component={StreamEdit} />
              <Route path="/streams/delete/:id" exact component={StreamDelete} />
              <Route path="/streams/:id" exact component={StreamShow} />
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
    );
  }
}
export default App;