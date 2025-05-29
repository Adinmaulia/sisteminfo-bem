// frontend/src/components/users/Profil.js
import React, { useEffect, useState } from 'react';
import api from '../../utils/axios';

export default function Profil() {
  const [profils, setProfils] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfils() {
      try {
        const res = await api.get('/profil');
        setProfils(res.data);
      } catch (err) {
        setError('Gagal memuat data profil');
      } finally {
        setLoading(false);
      }
    }
    fetchProfils();
  }, []);

  if (loading) return <p>Memuat data profil...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      {profils.length === 0 ? (
        <p className="text-center text-gray-600">Tidak ada data profil.</p>
      ) : (
        profils.map(profil => (
          <div key={profil._id} className="mb-6 p-4 border rounded shadow-sm bg-white">
            <h3 className="text-xl font-semibold mb-4 text-center text-blue-800">
              Struktur Organisasi Badan Eksekutif Mahasiswa Fakultas Sains dan Teknologi Universitas Ubudiyah Indonesia
            </h3>

            {profil.gambar && (
              <div className="mb-4 flex justify-center">
                <img
                  src={`http://localhost:5000/api/profil/${profil._id}/gambar`}
                  alt="Struktur Organisasi"
                  className="max-w-full h-auto rounded shadow"
                />
              </div>
            )}

            <div className="shadow py-6 bg-blue-100 rounded">
              <h4 className="font-bold text-center text-3xl text-teal-600">Visi</h4>
              <p className="text-center text-2xl text-gray-800">{profil.visi}</p>
            </div>

            <div className="mt-4 shadow py-6 bg-blue-100 rounded">
              <h4 className="font-bold text-center text-3xl text-teal-600">Misi</h4>
              <p className="text-center text-2xl text-gray-800">{profil.misi}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
