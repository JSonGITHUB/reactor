import React, { useState } from 'react';
import getKey from '../../utils/KeyGenerator.js';
export default function Todos(props) {
    const getLocal = () => localStorage.getItem("todos") ? localStorage.getItem("todos") : [];
    const getLocalTodos = () => JSON.parse(getLocal());
    const [todos, setTodos] = useState(getLocal() ? getLocalTodos() : []);
//  const [cart, setCart] = useState({id: 'xx22', name: 'iphone 8', quantity: 1});
    const storeIt = () => localStorage.setItem("todos", JSON.stringify(todos));
    const todoInput = () => document.getElementById("todo").value;
    const clearInput = () => document.getElementById("todo").value = "";
    const getNewTodo = (todo) => todo.charAt(0).toUpperCase() + todo.slice(1);;
    const addTodo = () => {
        const newTodo = getNewTodo(todoInput());
        console.log(`new todo: ${newTodo}`);
        setTodos(prevTodos => [...prevTodos, newTodo]);
        clearInput();
    };
    const removeTodo = e => {
        const id = e.target.id;
        console.log(`remove todo: ${todos[id]}`);
        todos.splice(id,1)
        setTodos([...todos]);
    }
    function makeMenu() {
        const makeMenu = (menu) => menu.map(item => <div className="button bg-green r-5 m-5 p-5">{item}</div>);
        const menuData = ["one","two","thee"];
        return (
            <div>{makeMenu(menuData)}</div>
        )
    }
    return (
        <div>
            <div className="color-yellow p-5 r-10 flexContainer">
                <div className="flex3Column"></div>
                <div className="p-5 r-10 flex3Column bg-darker">
                    <label className="flexContainer">
                        <input className="ht-30 m-5 flex2Column p-15 r-5" type="text" id="todo" name="todo" placeholder="Enter a todo"/>
                        <button className="r-5 greet bold bg-green m-5 p-10 flex2Column10Percent" onClick={() => addTodo()}>ADD</button>
                    </label>
                </div>
                <div className="flex3Column"></div>
            </div>
            <div className="color-yellow p-5 r-10 flexContainer">
                <div className="flex3Column"></div>
                <div id="list" className="p-5 r-10 flex3Column bg-darker">
                    {todos.map((todo, index) => (
                        <div key={getKey("todo")} className="flexContainer p-10 bg-dark r-5 m-1">
                            <div className="flex2Column columnLeft">
                                {todo}
                            </div>
                            <div className="flex2Column10Percent columnRight">
                                <button id={index} name={todo} className="r-5 p-15 greet bold bg-red m-5" onClick={(e) => removeTodo(e)}>X</button>
                            </div>
                        </div>
                    ))}
                    {makeMenu()}
                </div>
                <div className="flex3Column"></div>
            </div>
            {storeIt()}
        </div>
    );
}