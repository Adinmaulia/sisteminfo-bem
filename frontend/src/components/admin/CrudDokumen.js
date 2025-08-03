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
  const [file, setFile] = useState(null);
  const [nomorSurat, setNomorSurat] = useState('');
  const [jenisDokumen, setJenisDokumen] = useState('suratMasuk');
  const [previewName, setPreviewName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('suratMasuk');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDoc, setModalDoc] = useState({ id: null, name: '' });

  // Fuse.js search setup
  const { query, setQuery, results } = useFuseSearch(docs, {
    keys: ['fileName', 'nomorSurat', 'jenisDokumen'],
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

  // Setup dropzone
  const dropzone = useDropzone({ 
    accept: 'application/pdf', 
    onDrop: acceptedFiles => {
      setFile(acceptedFiles[0]);
      setPreviewName(acceptedFiles[0].name);
    } 
  });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    
    if (!file) {
      setError('File PDF wajib diupload');
      return;
    }
    
    const data = new FormData();
    data.append('file', file);
    data.append('nomorSurat', nomorSurat);
    data.append('jenisDokumen', jenisDokumen);
    
    try {
      if (editingId) {
        await api.put(`/dokumen/${editingId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/dokumen', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setShowForm(false); 
      setEditingId(null); 
      setFile(null); 
      setPreviewName(''); 
      setNomorSurat('');
      fetchDocs();
    } catch (err) {
      setError('Gagal menyimpan dokumen: ' + (err.response?.data?.msg || ''));
    }
  };

  const handleEdit = d => {
    setEditingId(d._id);
    setShowForm(true);
    setNomorSurat(d.nomorSurat || '');
    setJenisDokumen(d.jenisDokumen || 'suratMasuk');
    setPreviewName(d.fileName || '');
    // Note: We don't set the file for editing, user needs to re-upload if they want to change it
  };

  const handleDelete = async id => {
    if (!window.confirm('Yakin hapus?')) return;
    try {
      await api.delete(`/dokumen/${id}`);
      fetchDocs();
    } catch {
      setError('Gagal hapus');
    }
  };

  const openModal = (id, name) => {
    setModalDoc({ id, name });
    setIsModalOpen(true);
  };
  
  const closeModal = () => setIsModalOpen(false);

  // Filter dokumen berdasarkan jenisDokumen
  const filteredDocs = results.filter(d => d.jenisDokumen === activeTab);

  if (!user || user.role !== 'admin') {
    return <div className="p-6 text-red-600 font-semibold">Akses ditolak. Hanya admin.</div>;
  }

  return (
    <div>
      <div className="flex justify-between mb-4">
        <button 
          onClick={() => { 
            setShowForm(!showForm); 
            setEditingId(null); 
            setFile(null); 
            setPreviewName(''); 
            setNomorSurat('');
            setJenisDokumen(activeTab);
          }} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showForm ? 'Tutup Form' : 'Tambah Dokumen'}
        </button>
      </div>

      {error && <p className="mb-4 text-red-600">{error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block mb-1 font-medium">Jenis Dokumen</label>
            <select
              value={jenisDokumen}
              onChange={e => setJenisDokumen(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              disabled={editingId} // Can't change jenis dokumen when editing
            >
              <option value="suratMasuk">Surat Masuk</option>
              <option value="suratKeluar">Surat Keluar</option>
              <option value="lpjKegiatan">LPJ Kegiatan</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block mb-1 font-medium">File PDF</label>
            <div {...dropzone.getRootProps()} className="p-6 border-dashed border-2 rounded text-center cursor-pointer">
              <input {...dropzone.getInputProps()} />
              {previewName
                ? <p>{previewName}</p>
                : <p>Tarik & lepas PDF di sini, atau klik untuk pilih</p>
              }
            </div>
            {editingId && !previewName && <p className="text-sm text-gray-500 mt-1">Biarkan kosong jika tidak ingin mengganti file</p>}
          </div>
          
          <div className="mb-4">
            <label className="block mb-1 font-medium">Nomor Surat</label>
            <input
              type="text"
              value={nomorSurat}
              onChange={(e) => setNomorSurat(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Masukkan nomor surat"
            />
          </div>
          
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            {editingId ? 'Update' : 'Tambah'}
          </button>
        </form>
      )}

      {/* Tab Navigation */}
      <div className="flex mb-6 border-b">
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'suratMasuk' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('suratMasuk')}
        >
          Surat Masuk
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'suratKeluar' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('suratKeluar')}
        >
          Surat Keluar
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'lpjKegiatan' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('lpjKegiatan')}
        >
          LPJ Kegiatan
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari dokumen..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      
      <div className="space-y-4">
        {filteredDocs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Tidak ada data dokumen {activeTab === 'suratMasuk' ? 'surat masuk' : activeTab === 'suratKeluar' ? 'surat keluar' : 'LPJ kegiatan'}.
          </div>
        ) : (
          filteredDocs.map(d => (
            <div key={d._id} className="bg-white border rounded-lg shadow-sm p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-blue-600">
                    {d.jenisDokumen === 'suratMasuk' ? 'Surat Masuk' : 
                     d.jenisDokumen === 'suratKeluar' ? 'Surat Keluar' : 'LPJ Kegiatan'}
                  </h3>
                  <p className="text-sm text-gray-500">Nomor: {d.nomorSurat || '–'}</p>
                </div>
                <div>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
                    onClick={() => openModal(d._id, d.fileName || 'Dokumen')}
                  >
                    Lihat Dokumen
                  </button>
                  <button 
                    onClick={() => handleEdit(d)} 
                    className="mr-2 px-3 py-1 bg-teal-400 rounded hover:bg-teal-500"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(d._id)} 
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Hapus
                  </button>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600">Nama File: {d.fileName || '–'}</p>
            </div>
          ))
        )}
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
                src={`${API_URL}/dokumen/${modalDoc.id}/pdf`}
                title={modalDoc.name}
                className="w-full h-full"
              />
            </div>
            <div className="mt-2 text-right">
              <a
                href={`${API_URL}/dokumen/${modalDoc.id}/pdf`}
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
