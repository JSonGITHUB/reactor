import React from 'react';
export default function MakeMenu(props) {
    const makeMenu = (menu) => menu.map(item => <div>{item}</div>);
    const menuData = ["one","two","thee"];
    return (
        <div>{makeMenu(menuData)}</div>
    )
}