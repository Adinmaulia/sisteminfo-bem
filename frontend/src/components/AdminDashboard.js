// frontend/src/components/AdminDashboard.js
import React, { useState } from 'react';
import Navbar from './admin/Navbar';
import Dashboard from './admin/Dashboard';
import CrudProfil from './admin/CrudProfil';
import CrudKegiatan from './admin/CrudKegiatan';
import CrudPengurus from './admin/CrudPengurus';
import CrudDokumen from './admin/CrudDokumen';
import CrudUsers from './admin/CrudUsers';

export default function AdminDashboard() {
  const sections = [
    { name: 'dashboard', label: 'Dashboard', component: <Dashboard /> },
    { name: 'profil', label: 'Profil', component: <CrudProfil /> },
    { name: 'kegiatan', label: 'Kegiatan', component: <CrudKegiatan /> },
    { name: 'pengurus', label: 'Pengurus', component: <CrudPengurus /> },
    { name: 'dokumen', label: 'Dokumen', component: <CrudDokumen /> },
    { name: 'users', label: 'Users', component: <CrudUsers /> },
  ];

  const [active, setActive] = useState('dashboard');
  const activeSection = sections.find(sec => sec.name === active);

  return (
    <div className="flex">
      <Navbar sections={sections} active={active} onSelect={setActive} />
      <main className="flex-1 ml-64 p-6 bg-gray-50 min-h-screen">
        <h2 className="text-3xl font-bold mb-4 text-blue-700">{activeSection.label}</h2>
        <div className="bg-white rounded-lg shadow p-4">
          {activeSection.component}
        </div>
      </main>
    </div>
  );
}