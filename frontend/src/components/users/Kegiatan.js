import React, { useEffect, useState } from 'react';
import api from '../../utils/axios';
import useFuseSearch from '../../hooks/useFuseSearch';

export default function Kegiatan() {
  const [kegiatans, setKegiatans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});

  // Fuse.js search setup
  const { query, setQuery, results } = useFuseSearch(kegiatans, {
    keys: ['judul', 'deskripsi'],
    threshold: 0.3,
  });

  useEffect(() => {
    async function fetchKegiatans() {
      try {
        const res = await api.get('/kegiatan');
        setKegiatans(res.data);
      } catch (err) {
        setError('Gagal memuat data kegiatan');
      } finally {
        setLoading(false);
      }
    }
    fetchKegiatans();
  }, []);

  const openModal = (imageUrl) => {
    setModalImage(imageUrl);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalImage(null);
  };

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (loading) return <p>Memuat data kegiatan...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari kegiatan..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full px-4 py-3 text-gray-700 placeholder-gray-400 border border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
        />
      </div>

      <div className="space-y-6">
        {results.length === 0 ? (
          <p className="text-center text-gray-500">Tidak ada data kegiatan.</p>
        ) : (
          results.map((kegiatan) => {
            const imageUrl = `http://localhost:5000/api/kegiatan/${kegiatan._id}/dokumentasi`;
            const isExpanded = expandedItems[kegiatan._id];
            const shortDesc = kegiatan.deskripsi.slice(0, 100);
            return (
              <div
                key={kegiatan._id}
                className="flex flex-col md:flex-row bg-blue-100 rounded-lg shadow-md overflow-hidden transition hover:shadow-lg"
              >
                <div className="w-full md:w-1/3">
                  {kegiatan.dokumentasi ? (
                    <img
                      src={imageUrl}
                      alt="Dokumentasi"
                      className="h-full w-full max-h-60 object-cover cursor-pointer"
                      onClick={() => openModal(imageUrl)}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      Tidak ada
                    </div>
                  )}
                </div>

                <div className="w-full md:w-2/3 p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-teal-700">{kegiatan.judul}</h3>
                    <p className="text-gray-700 text-justify">
                      {isExpanded
                        ? kegiatan.deskripsi
                        : `${shortDesc}${kegiatan.deskripsi.length > 100 ? '...' : ''}`}
                    </p>
                  </div>

                  {kegiatan.deskripsi.length > 100 && (
                    <button
                      onClick={() => toggleExpand(kegiatan._id)}
                      className="mt-2 text-teal-600 hover:underline self-start"
                    >
                      {isExpanded ? 'Sembunyikan' : 'Baca selengkapnya'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded p-4 max-w-4xl max-h-full overflow-auto"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="mb-4 px-3 py-1 bg-teal-600 text-white rounded hover:bg-teal-700"
              onClick={closeModal}
            >
              X
            </button>
            <img
              src={modalImage}
              alt="Dokumentasi Besar"
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
