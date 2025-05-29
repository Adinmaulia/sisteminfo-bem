// frontend/src/components/users/Navbar.js
import React, { useContext } from 'react';
import { Home, User, Users, FileText, Clipboard } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export default function Navbar({ sections, active, onSelect }) {
  const { user } = useContext(AuthContext);

  return (
    <aside className="w-64 bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 h-screen shadow-lg fixed text-white">
      <div className="p-4 font-bold text-xl border-b border-teal-200/20">{user?.username || 'username'}</div>
      <nav className="mt-4">
        <ul>
          {sections.map(sec => (
            <li key={sec.name} className="mb-2">
              <button
                onClick={() => onSelect(sec.name)}
                className={`flex items-center w-full px-4 py-2 rounded transition-colors duration-300 ${active === sec.name
                    ? 'bg-white text-teal-600 font-semibold shadow-lg'
                    : 'text-white hover:bg-teal-500'
                  }`}
              >
                <span className="mr-3">
                  {sec.name === 'dashboard' && <Home size={16} />}
                  {sec.name === 'profil' && <User size={16} />}
                  {sec.name === 'kegiatan' && <Clipboard size={16} />}
                  {sec.name === 'pengurus' && <Users size={16} />}
                  {sec.name === 'dokumen' && <FileText size={16} />}
                </span>
                {sec.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );

}
