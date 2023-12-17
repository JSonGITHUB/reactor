import React from 'react';
import Home from '../Home.js';
import Translator from './Translator.js';
import Counter from '../hooks/Counter.js';
import Route from './Route.js';
import Accordion from './Accordion.js';

const showHome = () => {
    const pathname = window.location.pathname;
    if (pathname === '/') { return <Home /> }
}
const showCounter = () => {
    const pathname = window.location.pathname;
    if (pathname === '/Counter') { return <Counter /> }
}
const showTranslator = () => {
    const pathname = window.location.pathname;
    if (pathname === '/Translator') { return <Translator /> }
}

export default () => {
    return (
        <React.Fragment>
            <Route path='/'>
                <Accordion items={items} />
            </Route>
        </React.Fragment>
    )
};