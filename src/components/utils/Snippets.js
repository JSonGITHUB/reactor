import React, { useState } from 'react';

const data = [
    { snippet: 'ccc', renders: 'Class Component With Constructor' },
    { snippet: 'cc', renders: 'Class Component' },
    { snippet: 'cdc', renders: 'componentDidCatch' },
    { snippet: 'cdm', renders: 'componentDidMount' },
    { snippet: 'cdu', renders: 'componentDidUpdate' },
    { snippet: 'cp', renders: 'Context Provider' },
    { snippet: 'cpf', renders: 'Class Property Function' },
    { snippet: 'cpc', renders: 'Class Pure Component' },
    { snippet: 'cwm', renders: 'componentWillMount' },
    { snippet: 'cwrp', renders: 'componentWillReceiveProps' },
    { snippet: 'cwu', renders: 'componentWillUpdate' },
    { snippet: 'cwun', renders: 'componentWillUnmount' },
    { snippet: 'ffc', renders: 'Function Component' },
    { snippet: 'gds', renders: 'getDerivedStateFromProps' },
    { snippet: 'gsbu', renders: 'getSnapshotBeforeUpdate' },
    { snippet: 'hoc', renders: 'Higher Order Component' },
    { snippet: 'impc', renders: 'Import React / PureComponent' },
    { snippet: 'imrd', renders: 'Import ReactDOM' },
    { snippet: 'imrc', renders: 'Import React / Component' },
    { snippet: 'imr', renders: 'Import React' },
    { snippet: 'imrs', renders: 'Import React / useState' },
    { snippet: 'imrse', renders: 'Import React / useState useEffect' },
    { snippet: 'impt', renders: 'Import PropTypes' },
    { snippet: 'ren', renders: 'render' },
    { snippet: 'rprop', renders: 'Render Prop' },
    { snippet: 'scu', renders: 'shouldComponentUpdate' },
    { snippet: 'sfc', renders: 'Stateless Function Component (Arrow function)' },
    { snippet: 'ssf', renders: 'Functional setState' },
    { snippet: 'ss', renders: 'setState' },
    { snippet: 'ucb', renders: 'useCallback Hook' },
    { snippet: 'uef', renders: 'useEffect Hook' },
    { snippet: 'usf', renders: 'Declare a new state variable using State Hook' },
    { snippet: 'ccc', renders: 'Class Component with Constructor' },
    { snippet: 'cc', renders: 'Class Component' },
    { snippet: 'cdm', renders: 'componentDidMount' },
    { snippet: 'cdu', renders: 'componentDidUpdate' },
    { snippet: 'cpc', renders: 'Class Pure Component' },
    { snippet: 'cp', renders: 'Declare a new Context Provider.Hit Tab to apply PascalCase to type names.' },
    { snippet: 'cwrp', renders: 'componentWillReceiveProps' },
    { snippet: 'cwu', renders: 'componentWillUpdate' },
    { snippet: 'cwun', renders: 'componentWillUnmount' },
    { snippet: 'cwm', renders: 'componentWillMount' },
    { snippet: 'cdc', renders: 'componentDidCatch' },
    { snippet: 'fc', renders: 'Function Component' },
    { snippet: 'ffc', renders: 'Function Syntax Component' },
    { snippet: 'gds', renders: 'getDerivedStateFromProps' },
    { snippet: 'gsbu', renders: 'getSnapshotBeforeUpdate' },
    { snippet: 'impc', renders: 'Import React, { PureComponent }' },
    { snippet: 'imrd', renders: 'Import ReactDOM' },
    { snippet: 'imrc', renders: 'Import React, { Component }' },
    { snippet: 'imrse', renders: 'Import React, { useState, useEffect }' },
    { snippet: 'imrs', renders: 'Import React, { useState }' },
    { snippet: 'imr', renders: 'Import React' },
    { snippet: 'ren', renders: 'render' },
    { snippet: 'rprop', renders: 'Render Prop' },
    { snippet: 'sfc', renders: 'Stateless Function Component' },
    { snippet: 'sfnc', renders: 'Stateless Function Named Component' },
    { snippet: 'ssf', renders: 'Functional setState' },
    { snippet: 'ss', renders: 'setState' },
    { snippet: 'ucb', renders: 'useCallback Hook' },
    { snippet: 'uef', renders: 'useEffect Hook' },
    { snippet: 'usf', renders: 'Declare a new state Variable using the State Hook.Hit Tab to apply CamelCase to function' },
    { snippet: 'usr', renders: 'Declare a new ref Variable using the Ref Hook.' },
    { snippet: 'scu', renders: 'shouldComponentUpdate' },
    { snippet: 'imr', renders: 'Import React' },
    { snippet: 'imrc', renders: 'Import React, Component' },
    { snippet: 'imrd', renders: 'Import ReactDOM' },
    {
        snippet: 'imrs', renders: 'Import React, useState'
    },
    {
        snippet: 'imrse', renders: 'Import React, useState, useEffect'
    },
    {
        snippet: 'impt', renders: 'Import PropTypes'
    },
    {
        snippet: 'impc', renders: 'Import PureComponent'
    },
    {
        snippet: 'cc', renders: 'Class Component'
    },
    {
        snippet: 'ccc', renders: 'Class Component With Constructor'
    },
    {
        snippet: 'cpc', renders: 'Class Pure Component'
    },
    {
        snippet: 'ffc', renders: 'Function Component'
    },
    {
        snippet: 'sfc', renders: 'Stateless Function Component(Arrow function)'
    },
    {
        snippet: 'cdm', renders: 'componentDidMount'
    },
    {
        snippet: 'uef', renders: 'useEffect Hook'
    },
    {
        snippet: 'ucb', renders: 'useCallback Hook'
    },
    {
        snippet: 'cwm', renders: 'componentWillMount deprecated in React v17'
    },
    {
        snippet: 'cwrp', renders: 'componentWillReceiveProps deprecated in React v17'
    },
    {
        snippet: 'gds', renders: 'getDerivedStateFromProps'
    },
    {
        snippet: 'scu', renders: 'shouldComponentUpdate'
    },
    {
        snippet: 'cwu', renders: 'componentWillUpdate deprecated in React v17'
    },
    {
        snippet: 'cdu', renders: 'componentDidUpdate'
    },
    {
        snippet: 'cwun', renders: 'componentWillUnmount'
    },
    {
        snippet: 'cdc', renders: 'componentDidCatch'
    },
    {
        snippet: 'gsbu', renders: 'getSnapshotBeforeUpdate'
    },
    {
        snippet: 'ss', renders: 'setState'
    },
    {
        snippet: 'ssf', renders: 'Functional setState'
    },
    {
        snippet: 'usf', renders: 'Declare a new state variable using State Hook'
    },
    {
        snippet: 'ren', renders: 'render'
    },
    {
        snippet: 'rprop', renders: 'Render Prop'
    },
    {
        snippet: 'hoc', renders: 'Higher Order Component'
    },
    { snippet: 'cpf', renders: 'Class Property Function' }
];

const Snippets = () => {
    const [search, setSearch] = useState('');

    const filteredData = data.filter(
        (item) =>
            item.snippet.toLowerCase().includes(search.toLowerCase()) ||
            item.renders.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className='containerBox'>
            <div className='containerBox color-yellow'>
                <h1>VS Code React Snippets</h1>
                <input
                    id='input'
                    name='input'
                    type='text'
                    placeholder='Search...'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        margin: '15px',
                        fontSize: '16px',
                    }}
                />
            </div>
            <div className='containerBox'>
                {filteredData.map((item, index) => (
                    <div className='containerBox flexContainer' key={index}>
                        <div className='containerBox flex9Column columnRightAlign color-yellow'>
                            <strong>{item.snippet}</strong>
                        </div>
                        <div className='containerBox flex2Column columnLeftAlign'>
                            {item.renders}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Snippets;