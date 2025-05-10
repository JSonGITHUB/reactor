import React, { useState, useNavigate } from 'react';
import { useLogin } from '../context/LoginContext';
//import { useNavigate } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
const LoginPage = () => {
    const { login } = useLogin();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const history = useHistory();

    const handleSubmit = (e) => {
        e.preventDefault();

        // Your logic to check password
        if (password === 'admin') {
            history.push('/reactor/home'); // 👈 this replaces useNavigate
        } else if (password === 'user') {
            history.push('/user');
        } else if (password === 'visitor') {
            history.push('/visitor');
        } else {
            setError('Invalid password');
        }
    };

    return (
        <div className='containerBox'>
            <h2 className='containerBox'>Enter Password</h2>
            <form onSubmit={handleSubmit} className='containerBox'>
                <input
                    type='password'
                    className='containerBox'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder='Password...'
                />
                {error && <p className='text-red-500 text-sm'>{error}</p>}
                <button
                    type='submit'
                    className='containerBox button'
                >
                    Login
                </button>
            </form>
        </div>
    );
};

export default LoginPage;
