import React from "react";
import * as actions from '../actions/types.js';

const initialTodos = [
  {
    id: "t1",
    task: "Code",
    complete: false
  },
  {
    id: "t2",
    task: "Cook",
    complete: false
  }
];
const todoReducer = (state, action) => {
    console.log(`todoReducer => `)
  switch (action.type) {
    case actions.ADD_TODO:
        console.log(`ADD_TODO:${JSON.stringify(state,2, null)}`);
      return initialTodos.map(todo => {
            console.log(`1b\ntodo: ${JSON.stringify(todo, 2, null)}`)
            return todo;
      });
    case actions.COMPLETE_TODO:
        console.log(`COMPLETE_TODO:`)
      return initialTodos.map(todo => {
        if (todo.id === action.id) {
            console.log(`1a\ntodo.id: ${todo.id}\naction.id: ${action.id}\ntodo: ${JSON.stringify(todo, 2, null)}\ncomplete: ${!todo.complete}`)
          return { ...todo, complete: true };
        } else {
            console.log(`1b\ntodo: ${JSON.stringify(todo, 2, null)}`)
          return todo;
        }
      });
    case actions.INCOMPLETE_TODO:
        console.log(`INCOMPLETE_TODO:`)
      return initialTodos.map(todo => {
        if (todo.id === action.id) {
            console.log(`2a\ntodo.id: ${todo.id}\naction.id: ${action.id}\ntodo: ${JSON.stringify(todo, 2, null)}\ncomplete: ${!todo.complete}`)
          return { ...todo, complete: false };
        } else {
            console.log(`2b\ntodo: ${JSON.stringify(todo, 2, null)}`)
          return todo;
        }
      });
    default:
      return state;
  }
};
const App = () => {
  // eslint-disable-next-line
  let [todos, dispatch] = React.useReducer(todoReducer, initialTodos);
  const handleChange = todo => {
    dispatch({
      type: todo.complete ? "INCOMPLETE_TODO" : "COMPLETE_TODO",
      id: todo.id
    });
  };
  const taskInterface = (todo) => {
    let taskClass = 'ml-5';
    if (todo.complete) {
        taskClass = taskClass + " color-green";
    } else {
        taskClass = taskClass + " color-yellow";
    }
    return <span className={taskClass}>
            {todo.task}
        </span>
  }
  const addTask = () => {
    let newTask = prompt("New task: ", '');
    const id = 't'+ String(initialTodos.length+1);
    console.log(`addTask: id => ${id}`)
    const newTaskObject = {
        id: id,
        task: newTask,
        complete: false
    }
    initialTodos.push(newTaskObject);
    
    dispatch({
        type: "ADD_TODO",
        id: `t${id}`
    });
    console.log(`addTask: initialTodos => ${JSON.stringify(initialTodos, 2, null)}`)
  }
  
  return (
    <React.Fragment>
        <ul>
        {initialTodos.map(todo => (
            <li key={todo.id} >
                <label>
                    <div className='white b p-10'>
                        <input
                        type="checkbox"
                        checked={todo.complete}
                        onChange={() => handleChange(todo)}
                        />
                        {taskInterface(todo)}
                    </div>
                </label>
            </li>
        ))}
        </ul>
        <div className="button bg-dkGreen r-5 color-neogreen b p-10 m-10" 
        onClick={() => addTask()}>Add</div>
    </React.Fragment>
  );
};

export default App;