import React from 'react';
import axios from 'axios';

const { useState, useEffect } = React;

const URL = 'https://jsonplaceholder.typicode.com/users';

const GetUsers = () => {
    const [users, setUsers] = useState([]);
    
    useEffect(() => {
        // Add code here to fetch some users with axios and the URL variable
        // then update the 'users' piece of state
        const getUsers = async () => {
            const { data } = await axios.get(URL);
            setUsers(data);
        };
        getUsers();
    }, []);
     
    const renderedUsers = users.map((user) => {
        return <li key={user.id}>{user.name}</li>;
    });
    
    return (
        <div className='maxWidth400 columnLeftAlign color-yellow mt-20 sides-auto p-10 r-5 bg-green'>
            {renderedUsers}
        </div>
    );
}

export default GetUsers;