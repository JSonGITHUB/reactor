import React from 'react';
import FormEssay from './components/forms/FormEssay.js';
import Reservation from './components/forms/FormReservation.js';
import SignUpDialog from './components/utils/SignUpDialog.js';
import debounce from './components/utils/Debouncer.js';
import Footer from './components/site/Footer.js';
import Header from './components/site/Header.js';
import Home from './components/Home.js';
import Calculator from './components/Calculator.js';
import BowlBuilder from './components/BowlBuilder.js';
import SurfLog from './components/Logger.js';
import './assets/css/App.css';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isMotionOn: true,
      width: window.innerWidth
    };
    this.setIt = this.setIt.bind(this);
  }
  base = 'reactor/';
  company = "KFA";
  path = window.location.pathname;
  componentId = this.path.replace('/','').toLocaleLowerCase();
  currentComponent = this.componentId;
  setMotion = () => this.setState({ isMotionOn: !this.state.isMotionOn });
  
  updateState = () => {
    this.setState({ width: window.innerWidth })
  }
  setIt = () => (window.innerWidth !== this.state.width) ? this.updateState() : false;
  components = {
    surflog: <SurfLog />,
    guestlist: <SignUpDialog title="Guest List" message="Sign up" />,
    reservation: <Reservation />,
    essay: <FormEssay className='mt-40' />,
    tempconverter: <Calculator />,
    bowlbuilder: <BowlBuilder />,
    home: <Home />
  };
  
  render() {
    window.addEventListener('resize', debounce(this.setIt, 250));
    const componentTag = (current) => <div className="App">
            <Header company={this.company} width={this.state.width} isMotionOn={this.state.isMotionOn}/>
              <div className="fadeIn">
                {this.components[current]}
              </div>
            <Footer isMotionOn={this.state.isMotionOn} setMotion={this.setMotion}/>
          </div>;

    let AppComponent = () => componentTag(this.currentComponent);
    return (
      //AppComponent();
      <Router basename={this.base}>
        <div className="App">
            <Switch>
              <Header company={this.company} menu='false' width={this.state.width} isMotionOn={this.state.isMotionOn}/>
            </Switch> 
            <div className="fadeIn">
                <Switch>
                  <Route exact path="/" exact component={Home} />
                  <Route path="/Home" component={Home} />
                  <Route path="/BowlBuilder" component={BowlBuilder} />
                  <Route path="/TempConverter" component={Calculator} />
                  <Route path="/Essay" component={FormEssay} />
                  <Route path="/Reservation" component={Reservation} />
                  <Route path="/GuestList" component={SignUpDialog} />
                  <Route path="/SurfLog" component={SurfLog} />
                </Switch>
              </div>
            <Footer isMotionOn={this.state.isMotionOn} setMotion={this.setMotion}/>
          </div>
      </Router>
    );
  }
}
export default App;