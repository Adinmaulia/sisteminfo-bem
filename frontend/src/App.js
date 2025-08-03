import React, { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';

function AppContent() {
    const { user, logout } = useContext(AuthContext);
    if (!user) return <Login />;
    return (
        <div className="min-h-screen">
            <header className="fixed top-0 left-0 right-0 bg-blue-600 text-white shadow p-4 flex justify-between items-center z-50">
                <div className="flex items-center space-x-4">
                    <img src="/logouui.png" alt="Logo" className="w-10 h-10" />
                    <img src="/logobemfstuui.png" alt="Logo" className="w-10 h-10" />
                    <h1 className="text-xl font-bold font-roboto">Data Surat dan BEM FST UUI</h1>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-white">Halo {user.username || 'User'}</span>
                    <button onClick={logout} className="text-red-500 hover:text-red-700">Logout</button>
                </div>
            </header>
            <main className="mt-20">
                {user.role === 'admin' ? <AdminDashboard /> : <UserDashboard />}
            </main>
        </div>
    );
}

const App = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;
