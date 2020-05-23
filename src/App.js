import React from 'react';
import FormNotes from './components/forms/FormEssay.js';
import Reservation from './components/forms/FormReservation.js';
import SignUpDialog from './components/utils/SignUpDialog.js';
import debounce from './components/utils/Debouncer.js';
import Footer from './components/site/Footer.js';
import Header from './components/site/Header.js';
import Home from './components/Home.js';
import Calculator from './components/Calculator.js';
import BowlBuilder from './components/BowlBuilder.js';
import LogDirectory from './components/LogDirectory.js';
import SurfLog from './components/Logger.js';
import WaveFinder from './components/WaveFinder.js';
import SlideShow from './components/SlideShow.js';
import './assets/css/App.css';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import ScrollToTop from './components/utils/ScrollToTop.js';
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isMotionOn: true,
      width: window.innerWidth,
      height: window.innerHeight
    };
    this.setIt = this.setIt.bind(this);
  }
  base = 'reactor/';
  company = "KFA";
  path = window.location.pathname;
  componentId = this.path.replace('/','').toLocaleLowerCase();
  currentComponent = this.componentId;
  setMotion = () => this.setState({ isMotionOn: !this.state.isMotionOn });
  widthChanged = () => (window.innerWidth !== this.state.width) ? true : false;
  heightChanged = () => (window.innerHeight !== this.state.height) ? true : false;
  updateState = () => {
    this.setState({ 
      width: window.innerWidth,
      height: window.innerHeight
    })
  }
  setIt = () => (this.widthChanged() || this.heightChanged()) ? this.updateState() : false;
  components = {
    surflog: <SurfLog />,
    guestlist: <SignUpDialog title="Guest List" message="Sign up" />,
    reservation: <Reservation />,
    notes: <FormNotes className='mt-40' />,
    tempconverter: <Calculator />,
    bowlbuilder: <BowlBuilder />,
    home: <Home />
  };
  
  render() {
    window.addEventListener('resize', debounce(this.setIt, 250));
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
    const logIdExists = (window.location.search.includes("logId")) ? true : false;
    const startIndex = () => window.location.search.indexOf("logId=")+6;
    const endIndex = () => window.location.search.length;
    const getLogId = () => window.location.search.substring(startIndex(), endIndex());
    const logId = (logIdExists) ? getLogId() : "";
    const height = this.state.height;
    const width = this.state.width;
     return (
      //AppComponent();
      <Router basename={this.base}>
        <ScrollToTop />
        <div className="App">
            <Switch>
              <Header company={this.company} menu='false' width={this.state.width} isMotionOn={this.state.isMotionOn}/>
            </Switch> 
            <div className="fadeIn">
                <Switch>
                  <Route exact path="/" component={Home} />
                  <Route path="/Home" component={Home} />
                  {/*<Route path="/BowlBuilder" component={BowlBuilder} />*/}
                  <Route path='/BowlBuilder' render={(props) => <BowlBuilder {...props} width={width} height={height} />}/>
                  <Route path="/TempConverter" component={Calculator} />
                  <Route path="/Notes" component={FormNotes} />
                  <Route path="/Reservation" component={Reservation} />
                  <Route path="/GuestList" component={SignUpDialog} />
                  {/*<Route path="/SurfLog" component={SurfLog} />*/}
                  <Route path='/SurfLog' render={(props) => <SurfLog {...props} logId={logId} />}/>
                  <Route path='/WaveFinder' render={(props) => <WaveFinder {...props} tide="medium" isSwell1="false" isSwell2="false" isTide="false" isWind="false" swell1Direction="SSW" swell2Direction="W" windDirection="W" distance="10" />}/>
                  <Route path="/LogDirectory" component={LogDirectory} />
                  <Route path="/Swell" component={SlideShow} />
                </Switch>
              </div>
            <Switch>
              <Footer isMotionOn={this.state.isMotionOn} setMotion={this.setMotion}/>
            </Switch>
          </div>
      </Router>
    );
  }
}
export default App;