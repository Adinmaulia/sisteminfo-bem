// frontend/src/components/admin/Dashboard.js
import React, { useEffect, useState, useContext } from 'react';
import api from '../../utils/axios';
import { AuthContext } from '../../context/AuthContext';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [counts, setCounts] = useState({ suratMasuk: 0, suratKeluar: 0, pengurus: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const fetchCounts = async () => {
      try {
        setLoading(true);
        // Ambil daftar dokumen
        const resDocs = await api.get('/dokumen');
        const docs = resDocs.data;
        // Karena setiap dokumen memiliki satu suratMasuk dan satu suratKeluar
        const suratMasukCount = docs.length;
        const suratKeluarCount = docs.length;
        // Ambil daftar pengurus
        const resPengurus = await api.get('/pengurus');
        const pengurusCount = resPengurus.data.length;

        setCounts({ suratMasuk: suratMasukCount, suratKeluar: suratKeluarCount, pengurus: pengurusCount });
      } catch (err) {
        setError('Gagal memuat data');
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [user]);

  if (!user || user.role !== 'admin') {
    return <div className="p-6 text-red-600 font-semibold">Akses ditolak. Hanya admin.</div>;
  }

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-teal-500 rounded-lg shadow-md">
          <p className="text-sm text-white">Jumlah Surat Masuk</p>
          <p className="text-3xl font-semibold text-blue-800">{counts.suratMasuk}</p>
        </div>
        <div className="p-4 bg-teal-500 rounded-lg shadow-md">
          <p className="text-sm text-white">Jumlah Surat Keluar</p>
          <p className="text-3xl font-semibold text-blue-800">{counts.suratKeluar}</p>
        </div>
        <div className="p-4 bg-teal-500 rounded-lg shadow-md">
          <p className="text-sm text-white">Jumlah Pengurus</p>
          <p className="text-3xl font-semibold text-blue-800">{counts.pengurus}</p>
        </div>
      </div>
    </div>
  );
}
