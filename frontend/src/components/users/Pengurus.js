import React, { useEffect, useState } from 'react';
import api from '../../utils/axios';
import useFuseSearch from '../../hooks/useFuseSearch';

export default function Pengurus() {
  const [penguruses, setPenguruses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fuse.js search setup
  const { query, setQuery, results } = useFuseSearch(penguruses, {
    keys: ['jabatan', 'nama', 'nim', 'jurusan', 'periode'],
    threshold: 0.3,
  });

  useEffect(() => {
    async function fetchPenguruses() {
      try {
        const res = await api.get('/pengurus');
        setPenguruses(res.data);
      } catch (err) {
        setError('Gagal memuat data pengurus');
      } finally {
        setLoading(false);
      }
    }
    fetchPenguruses();
  }, []);

  if (loading) return <p>Memuat data pengurus...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari pengurus..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full px-4 py-3 text-gray-700 placeholder-gray-400 border border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="text-left py-3 px-6">Jabatan</th>
              <th className="text-left py-3 px-6">Nama</th>
              <th className="text-left py-3 px-6">NIM</th>
              <th className="text-left py-3 px-6">Jurusan</th>
              <th className="text-left py-3 px-6">Periode</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">Tidak ada data pengurus.</td>
              </tr>
            ) : (
              results.map(pengurus => (
                <tr
                  key={pengurus._id}
                  className="border-t border-gray-200 hover:bg-blue-50 transition"
                >
                  <td className="py-4 px-6 align-top">{pengurus.jabatan}</td>
                  <td className="py-4 px-6 align-top">{pengurus.nama}</td>
                  <td className="py-4 px-6 align-top">{pengurus.nim}</td>
                  <td className="py-4 px-6 align-top">{pengurus.jurusan}</td>
                  <td className="py-4 px-6 align-top">{pengurus.periode}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
