import React, { useEffect, useState, useContext } from 'react';
import { useDropzone } from 'react-dropzone';
import api from '../../utils/axios';
import { AuthContext } from '../../context/AuthContext';
import useFuseSearch from '../../hooks/useFuseSearch';

// Base API URL (untuk preview & download)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function CrudDokumen() {
  const { user } = useContext(AuthContext);
  const [docs, setDocs] = useState([]);
  const [files, setFiles] = useState({});
  const [previewNames, setPreviewNames] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDoc, setModalDoc] = useState({ id: null, field: '', name: '' });

  // Fuse.js search setup
  const { query, setQuery, results } = useFuseSearch(docs, {
    keys: ['suratMasukName', 'suratKeluarName', 'lpjKegiatanName'],
    threshold: 0.3,
  });

  const fetchDocs = async () => {
    try {
      const res = await api.get('/dokumen');
      setDocs(res.data);
    } catch {
      setError('Gagal mengambil dokumen');
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  // Setup three dropzones
  const dropMasuk = useDropzone({ accept: 'application/pdf', onDrop: acc => { setFiles(f => ({ ...f, suratMasuk: acc[0] })); setPreviewNames(n => ({ ...n, suratMasuk: acc[0].name })); } });
  const dropKeluar = useDropzone({ accept: 'application/pdf', onDrop: acc => { setFiles(f => ({ ...f, suratKeluar: acc[0] })); setPreviewNames(n => ({ ...n, suratKeluar: acc[0].name })); } });
  const dropLPJ    = useDropzone({ accept: 'application/pdf', onDrop: acc => { setFiles(f => ({ ...f, lpjKegiatan: acc[0] })); setPreviewNames(n => ({ ...n, lpjKegiatan: acc[0].name })); } });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    const data = new FormData();
    ['suratMasuk','suratKeluar','lpjKegiatan'].forEach(f => { if (files[f]) data.append(f, files[f]); });
    try {
      if (editingId) {
        await api.put(`/dokumen/${editingId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/dokumen', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setShowForm(false); setEditingId(null); setFiles({}); setPreviewNames({});
      fetchDocs();
    } catch {
      setError('Gagal menyimpan dokumen');
    }
  };

  const handleEdit = d => {
    setEditingId(d._id);
    setShowForm(true);
    setPreviewNames({ suratMasuk: d.suratMasukName, suratKeluar: d.suratKeluarName, lpjKegiatan: d.lpjKegiatanName });
    setFiles({});
  };

  const handleDelete = async id => {
    if (!window.confirm('Yakin hapus?')) return;
    try {
      await api.delete(`/dokumen/${id}`);
      setDocs(prev => prev.filter(x => x._id !== id));
    } catch {
      setError('Gagal hapus');
    }
  };

  const openModal = (id, field, name) => {
    setModalDoc({ id, field, name });
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  if (!user || user.role !== 'admin') {
    return <div className="p-6 text-red-600 font-semibold">Akses ditolak. Hanya admin.</div>;
  }

  return (
    <div>
      <div className="flex justify-between mb-4">
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setFiles({}); setPreviewNames({}); }} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          {showForm ? 'Tutup Form' : 'Tambah Dokumen'}
        </button>
      </div>

      {error && <p className="mb-4 text-red-600">{error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded-lg shadow-md">
          {['suratMasuk','suratKeluar','lpjKegiatan'].map(field => {
            const drop = field === 'suratMasuk' ? dropMasuk : field === 'suratKeluar' ? dropKeluar : dropLPJ;
            return (
              <div key={field} className="mb-4">
                <label className="block mb-1 font-medium">{field}</label>
                <div {...drop.getRootProps()} className="p-6 border-dashed border-2 rounded text-center cursor-pointer">
                  <input {...drop.getInputProps()} />
                  {previewNames[field]
                    ? <p>{previewNames[field]}</p>
                    : <p>Tarik & lepas PDF di sini, atau klik untuk pilih</p>
                  }
                </div>
              </div>
            );
          })}
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            {editingId ? 'Update' : 'Tambah'}
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Cari dokumen..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <table className="min-w-full bg-white rounded-lg shadow-md">
          <thead>
            <tr className="bg-blue-500 text-teal-100 uppercase text-sm">
              <th className="py-3 px-6 text-left">Surat Masuk</th>
              <th className="py-3 px-6 text-left">Surat Keluar</th>
              <th className="py-3 px-6 text-left">LPJ Kegiatan</th>
              <th className="py-3 px-6 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {results.map(d => (
              <tr key={d._id} className="border-b hover:bg-gray-100">
                {['suratMasuk','suratKeluar','lpjKegiatan'].map(f => (
                  <td key={f} className="py-3 px-6">
                    <button
                      onClick={() => openModal(d._id, f, d[f + 'Name'])}
                      className="text-blue-600 hover:underline"
                    >
                      {d[f + 'Name'] || '–'}
                    </button>
                  </td>
                ))}
                <td className="py-3 px-6 text-center">
                  <button onClick={() => handleEdit(d)} className="mr-2 px-3 py-1 bg-teal-400 rounded hover:bg-teal-500">Edit</button>
                  <button onClick={() => handleDelete(d._id)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Preview PDF */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg w-3/4 h-3/4 p-4 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">{modalDoc.name}</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="flex-grow overflow-auto">
              <iframe
                src={`${API_URL}/dokumen/${modalDoc.id}/pdf/${modalDoc.field}`}
                title={modalDoc.name}
                className="w-full h-full"
              />
            </div>
            <div className="mt-2 text-right">
              <a
                href={`${API_URL}/dokumen/${modalDoc.id}/pdf/${modalDoc.field}`}
                download
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Download PDF
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
