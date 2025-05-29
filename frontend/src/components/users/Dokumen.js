import React, { useEffect, useState } from 'react';
import api from '../../utils/axios';
import useFuseSearch from '../../hooks/useFuseSearch';

export default function Dokumen() {
  const [dokumens, setDokumens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPdfUrl, setModalPdfUrl] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  // Fuse.js search setup
  const { query, setQuery, results } = useFuseSearch(dokumens, {
    keys: ['suratMasukName', 'suratKeluarName', 'lpjKegiatanName'],
    threshold: 0.3,
  });

  useEffect(() => {
    async function fetchDokumens() {
      try {
        const res = await api.get('/dokumen');
        setDokumens(res.data);
      } catch (err) {
        setError('Gagal memuat data dokumen');
      } finally {
        setLoading(false);
      }
    }
    fetchDokumens();
  }, []);

  const openModal = (id, field, title) => {
    const baseUrl = process.env.REACT_APP_API_URL || '';
    setModalPdfUrl(baseUrl + 'http://localhost:5000/api/dokumen/' + id + '/pdf/' + field);
    setModalTitle(title);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalPdfUrl('');
    setModalTitle('');
  };

  if (loading) return <p>Memuat data dokumen...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari dokumen..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full px-4 py-3 text-gray-700 placeholder-gray-400 border border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="text-left py-3 px-4 w-12">No</th>
              <th className="text-left py-3 px-6">Surat Masuk</th>
              <th className="text-left py-3 px-6">Surat Keluar</th>
              <th className="text-left py-3 px-6">LPJ Kegiatan</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">Tidak ada data dokumen.</td>
              </tr>
            ) : (
              results.map((dokumen, index) => (
                <tr key={dokumen._id} className="border-t border-gray-200 hover:bg-blue-50 transition">
                  <td className="py-4 px-4 align-top">{index + 1}</td>
                  <td className="py-4 px-6 align-top">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => openModal(dokumen._id, 'suratMasuk', dokumen.suratMasukName)}
                    >
                      {dokumen.suratMasukName}
                    </button>
                  </td>
                  <td className="py-4 px-6 align-top">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => openModal(dokumen._id, 'suratKeluar', dokumen.suratKeluarName)}
                    >
                      {dokumen.suratKeluarName}
                    </button>
                  </td>
                  <td className="py-4 px-6 align-top">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => openModal(dokumen._id, 'lpjKegiatan', dokumen.lpjKegiatanName)}
                    >
                      {dokumen.lpjKegiatanName}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div className="bg-white rounded p-4 max-w-4xl max-h-full overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{modalTitle}</h3>
              <button
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={closeModal}
              >
                Tutup
              </button>
            </div>
            <iframe
              src={modalPdfUrl}
              title={modalTitle}
              className="w-full h-[80vh] border"
            />
            <a
              href={modalPdfUrl}
              download={modalTitle}
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download
            </a>
          </div>
        </div>
      )}
    </>
  );
}
