import React from 'react';
//import ReactDOM from 'react-dom';

//<Lister items={[1,2,3]} />

const Lister = props => {
    const items = props.items;
    const listItems = items.map((number) =>
        <li key={number.toString()}>{number}</li>
    );

    return (
        <ul>{listItems}</ul>
    );
}

export default Lister;

/*
ReactDOM.render(
    <Lister items={[1,2,3]} />,
    document.getElementById('root')
);

let initLister = () => {
    ReactDOM.render(
        <Lister items={[1,2,3]} />,
        document.getElementById('root')
    );
}
setTimeout(initLister\, 1000);
*/