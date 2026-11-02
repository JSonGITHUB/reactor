import{R as r,K as t}from"./vendor-C21a4Pd0.js";const O="ADD_TODO",p="COMPLETE_TODO",u="INCOMPLETE_TODO",c=[{id:"t1",task:"Code",complete:!1},{id:"t2",task:"Cook",complete:!1}],T=(i,n)=>{switch(console.log("todoReducer => "),n.type){case O:return console.log(`ADD_TODO:${JSON.stringify(i,2,null)}`),c.map(e=>(console.log(`1b
todo: ${JSON.stringify(e,2,null)}`),e));case p:return console.log("COMPLETE_TODO:"),c.map(e=>e.id===n.id?(console.log(`1a
todo.id: ${e.id}
action.id: ${n.id}
todo: ${JSON.stringify(e,2,null)}
complete: ${!e.complete}`),{...e,complete:!0}):(console.log(`1b
todo: ${JSON.stringify(e,2,null)}`),e));case u:return console.log("INCOMPLETE_TODO:"),c.map(e=>e.id===n.id?(console.log(`2a
todo.id: ${e.id}
action.id: ${n.id}
todo: ${JSON.stringify(e,2,null)}
complete: ${!e.complete}`),{...e,complete:!1}):(console.log(`2b
todo: ${JSON.stringify(e,2,null)}`),e));default:return i}},m=()=>{let[i,n]=r.useReducer(T,c);const e=l=>{n({type:l.complete?"INCOMPLETE_TODO":"COMPLETE_TODO",id:l.id})},o=l=>{let s="ml-5";return l.complete?s=s+" color-green":s=s+" color-yellow",t.jsx("span",{className:s,children:l.task})},a=()=>{let l=prompt("New task: ","");const s="t"+String(c.length+1);console.log(`addTask: id => ${s}`);const d={id:s,task:l,complete:!1};c.push(d),n({type:"ADD_TODO",id:`t${s}`}),console.log(`addTask: initialTodos => ${JSON.stringify(c,2,null)}`)};return t.jsxs(r.Fragment,{children:[t.jsx("ul",{children:c.map(l=>t.jsx("li",{children:t.jsx("label",{children:t.jsxs("div",{className:"white b p-10",children:[t.jsx("input",{id:`${o(l)}`,type:"checkbox",checked:l.complete,onChange:()=>e(l)}),o(l)]})})},l.id))}),t.jsx("div",{title:"add",className:"button bg-dkGreen r-5 color-neogreen b p-10 m-10",onClick:()=>a(),children:"Add"})]})};export{m as default};
