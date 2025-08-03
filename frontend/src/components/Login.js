// src/components/Login.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function Login() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await login(username, password, isAdmin);
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
      <header className="fixed top-0 left-0 right-0 p-4 flex justify-between items-left z-50">
        <div className="flex items-center space-x-4">
          <img src="/logobemfstuui.png" alt="Logo" className="w-10 h-10" />
          <h1 className="text-xl font-bold text-teal-300">Data Surat dan BEM FST UUI</h1>
        </div>
      </header>
      <form onSubmit={handleSubmit} className="bg-white bg-opacity-10 p-8 rounded-3xl shadow-lg w-full max-w-sm backdrop-blur-sm">
        <div className='flex justify-center'>
          <img src="/logouui.png" alt="Logo" className="w-48 h-auto mb-4 object-contain" />
        </div>
        <h2 className="text-3xl font-extrabold mb-6 text-center text-teal-300 drop-shadow-lg">Login</h2>
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="adminToggle"
            checked={isAdmin}
            onChange={e => setIsAdmin(e.target.checked)}
            className="mr-2 accent-teal-400"
          />
          <label htmlFor="adminToggle" className="text-sm text-gray-700 font-semibold">Login as Admin</label>
        </div>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            className="w-full px-4 py-2 border border-teal-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-teal-200"
          />
        </div>
        <div className="mb-6">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-teal-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-teal-200"
          />
        </div>
        <button type="submit" className="w-full py-2 bg-teal-400 text-white rounded-lg hover:bg-teal-500 transition shadow-md hover:shadow-lg">
          Login
        </button>
        {error && <p className="mt-4 text-red-600 text-sm text-center font-semibold">{error}</p>}
      </form>
    </div>
  );
}

export default Login;