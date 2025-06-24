import React from 'react';
import { useLogin } from '../components/context/LoginContext';

const UserDashboard = () => {
    const { logout } = useLogin();
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">User Dashboard</h1>
            <button onClick={logout} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">
                Logout
            </button>
        </div>
    );
};

export default UserDashboard;
