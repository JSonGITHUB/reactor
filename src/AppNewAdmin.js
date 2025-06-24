import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import LoginPage from './components/site/LoginPage';
import AdminDashboard from './routes/AdminDashboard';
import UserDashboard from './routes/UserDashboard';
import VisitorDashboard from './routes/VisitorDashboard';

const App = () => {
    return (
        <Router>
            <Switch>
                <Route exact path="/" component={LoginPage} />
                <Route path="/admin" component={AdminDashboard} />
                <Route path="/user" component={UserDashboard} />
                <Route path="/visitor" component={VisitorDashboard} />
            </Switch>
        </Router>
    );
};

export default App;
