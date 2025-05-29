// frontend/src/components/UserDashboard.js
import React, { useState } from 'react';
import Navbar from './users/Navbar';
import Dashboard from './users/Dashboard';
import Profil from './users/Profil';
import Kegiatan from './users/Kegiatan';
import Pengurus from './users/Pengurus';
import Dokumen from './users/Dokumen';

export default function AdminDashboard() {
  const sections = [
    { name: 'dashboard', label: 'Dashboard', component: <Dashboard /> },
    { name: 'profil', label: 'Profil', component: <Profil /> },
    { name: 'kegiatan', label: 'Kegiatan', component: <Kegiatan /> },
    { name: 'pengurus', label: 'Pengurus', component: <Pengurus /> },
    { name: 'dokumen', label: 'Dokumen', component: <Dokumen /> },
  ];

  const [active, setActive] = useState('dashboard');
  const activeSection = sections.find(sec => sec.name === active);

  return (
    <div className="flex">
      <Navbar sections={sections} active={active} onSelect={setActive} />
      <main className="flex-1 ml-64 p-6 min-h-screen">
        <h2 className="text-3xl font-bold mb-4 text-blue-700">{activeSection.label}</h2>
        <div className="bg-transparent rounded-lg p-4">
          {activeSection.component}
        </div>
      </main>
    </div>
  );
}