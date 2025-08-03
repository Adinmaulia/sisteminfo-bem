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
  const [activeTab, setActiveTab] = useState('all'); // Default menampilkan semua

  // Fuse.js search setup - disesuaikan dengan struktur data backend
  const { query, setQuery, results } = useFuseSearch(dokumens, {
    keys: ['jenisDokumen', 'nomorSurat', 'fileName'],
    threshold: 0.3,
  });

  useEffect(() => {
    async function fetchDokumens() {
      try {
        const res = await api.get('/dokumen');
        setDokumens(res.data);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Gagal memuat data dokumen');
      } finally {
        setLoading(false);
      }
    }
    fetchDokumens();
  }, []);

  const openModal = (id, title) => {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    setModalPdfUrl(`${baseUrl}/api/dokumen/${id}/pdf`);
    setModalTitle(title);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalPdfUrl('');
    setModalTitle('');
  };

  // Fungsi untuk mendapatkan jenis dokumen yang unik
  const getUniqueDocumentTypes = () => {
    const types = [...new Set(dokumens.map(doc => doc.jenisDokumen))];
    return types.filter(type => type); // Remove undefined/null values
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data dokumen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 text-center">{error}</p>
      </div>
    );
  }

  // Filter dokumen berdasarkan tab aktif
  const filteredResults = results.filter(dokumen => {
    if (activeTab === 'all') return true;
    return dokumen.jenisDokumen === activeTab;
  });

  const documentTypes = getUniqueDocumentTypes();

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dokumen</h1>
        <p className="text-gray-600">Daftar dokumen yang tersedia untuk dilihat</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari dokumen berdasarkan jenis, nomor surat, atau nama file..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full px-4 py-3 pl-10 text-gray-700 placeholder-gray-400 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap mb-6 border-b border-gray-200">
        <button
          className={`py-3 px-4 font-medium transition-colors duration-200 ${
            activeTab === 'all' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('all')}
        >
          Semua Dokumen ({dokumens.length})
        </button>
        {documentTypes.map(type => {
          const count = dokumens.filter(doc => doc.jenisDokumen === type).length;
          return (
            <button
              key={type}
              className={`py-3 px-4 font-medium transition-colors duration-200 ${
                activeTab === type 
                  ? 'border-b-2 border-blue-500 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(type)}
            >
              {type} ({count})
            </button>
          );
        })}
      </div>

      {/* Dokumen List */}
      <div className="space-y-4">
        {filteredResults.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-lg">
              {query ? 'Tidak ada dokumen yang sesuai dengan pencarian' : 'Tidak ada dokumen tersedia'}
            </p>
            {query && (
              <p className="text-gray-400 text-sm mt-2">
                Coba ubah kata kunci pencarian Anda
              </p>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredResults.map((dokumen) => (
              <div key={dokumen._id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {dokumen.jenisDokumen}
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">
                      {dokumen.fileName}
                    </h3>
                    {dokumen.nomorSurat && (
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Nomor:</span> {dokumen.nomorSurat}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Dibuat:</span> {new Date(dokumen.createdAt).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <button
                  className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                  onClick={() => openModal(dokumen._id, dokumen.fileName)}
                >
                  <svg className="inline-block w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Lihat Dokumen
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal untuk menampilkan PDF */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 truncate mr-4">
                {modalTitle}
              </h3>
              <div className="flex items-center space-x-2">
                <a
                  href={modalPdfUrl}
                  download={modalTitle}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="inline-block w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download
                </a>
                <button
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors duration-200"
                  onClick={closeModal}
                >
                  <svg className="inline-block w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Tutup
                </button>
              </div>
            </div>
            
            {/* Content Modal */}
            <div className="flex-1 p-4">
              <iframe
                src={modalPdfUrl}
                title={modalTitle}
                className="w-full h-full min-h-[70vh] border border-gray-200 rounded"
                style={{ minHeight: '500px' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}