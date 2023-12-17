import React from 'react';
export default function MakeMenu(props) {
    const makeMenu = (menu) => menu.map(item => <div>{item}</div>);
    const menuData = ["one","two","thee"];
    return (
        <React.Fragment>
            {makeMenu(menuData)}
        </React.Fragment>
    )
}