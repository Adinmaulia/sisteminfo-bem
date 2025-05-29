// ====== frontend/src/components/admin/CrudKegiatan.js ======
import React, { useEffect, useState, useContext } from 'react';
import { useDropzone } from 'react-dropzone';
import api from '../../utils/axios';
import { AuthContext } from '../../context/AuthContext';
import useFuseSearch from '../../hooks/useFuseSearch';

export default function CrudKegiatan() {
  const { user } = useContext(AuthContext);
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ judul: '', deskripsi: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Fuse.js search setup
  const { query, setQuery, results } = useFuseSearch(list, {
    keys: ['judul', 'deskripsi'],
    threshold: 0.3,
  });

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await api.get('/kegiatan', { headers: { 'Cache-Control': 'no-cache' } });
      setList(res.data);
    } catch {
      setError('Gagal mengambil data kegiatan');
    }
    setLoading(false);
  };

  useEffect(() => { fetchList(); }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: accepted => {
      const f = accepted[0];
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault(); setError('');
    if (!form.judul) return setError('Judul wajib diisi');
    if (!form.deskripsi) return setError('Deskripsi wajib diisi');
    const data = new FormData();
    data.append('judul', form.judul);
    data.append('deskripsi', form.deskripsi);
    if (file) data.append('dokumentasi', file);
    try {
      if (editingId) {
        await api.put(`/kegiatan/${editingId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/kegiatan', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setForm({ judul: '', deskripsi: '' }); setFile(null); setPreview(''); setEditingId(null); setShowForm(false);
      fetchList();
    } catch (err) {
      setError(err.response?.data?.msg || 'Terjadi kesalahan');
    }
  };

  const handleEdit = item => {
    setEditingId(item._id);
    setForm({ judul: item.judul, deskripsi: item.deskripsi });
    setPreview(`http://localhost:5000/api/kegiatan/${item._id}/dokumentasi`);
    setShowForm(true);
  };

  const handleDelete = async id => {
    if (!window.confirm('Yakin ingin menghapus kegiatan ini?')) return;
    try {
      await api.delete(`/kegiatan/${id}`);
      setList(prev => prev.filter(i => i._id !== id));
    } catch {
      setError('Gagal menghapus kegiatan');
    }
  };

  const toggleForm = () => {
    setEditingId(null); setForm({ deskripsi: '' }); setFile(null); setPreview(''); setError('');
    setShowForm(!showForm);
  };

  if (!user || user.role !== 'admin') return <div className="p-6 text-red-600 font-semibold">Akses ditolak. Hanya admin.</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <button onClick={toggleForm} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          {showForm ? 'Tutup Form' : 'Tambah Kegiatan'}
        </button>
      </div>
      {error && <p className="mb-4 text-red-600">{error}</p>}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">{editingId ? 'Edit Kegiatan' : 'Tambah Kegiatan'}</h3>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Judul</label>
            <input type="text" name="judul" value={form.judul} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Deskripsi</label>
            <textarea name="deskripsi" value={form.deskripsi} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Dokumentasi</label>
            <div {...getRootProps()} className="w-full p-6 border-dashed border-2 rounded text-center cursor-pointer">
              <input {...getInputProps()} />
              {preview ? <img src={preview} alt="preview" className="mx-auto max-h-40" /> : <p>Tarik & lepas file di sini, atau klik untuk pilih</p>}
            </div>
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {editingId ? 'Update' : 'Tambah'}
          </button>
        </form>
      )}
      {loading ? <p>Loading...</p> : (
        <div className="overflow-x-auto">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Cari kegiatan..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
            <thead><tr className="bg-blue-500 text-teal-100 uppercase text-sm">
              <th className="py-3 px-6 text-left">Judul</th>
              <th className="py-3 px-6 text-left">Dokumentasi</th>
              <th className="py-3 px-6 text-left">Deskripsi</th>
              <th className="py-3 px-6 text-center">Aksi</th>
            </tr></thead>
            <tbody className="text-gray-600 text-sm">
              {results.map(i => (
                <tr key={i._id} className="border-b hover:bg-gray-100">
                  <td className="py-3 px-6">{i.judul}</td>
                  <td className="py-3 px-6"><img src={`http://localhost:5000/api/kegiatan/${i._id}/dokumentasi`} alt="doc" className="h-16 w-16 object-cover rounded" /></td>
                  <td className="py-3 px-6">{i.deskripsi}</td>
                  <td className="py-3 px-6 text-center">
                    <button onClick={() => handleEdit(i)} className="m-2 px-3 py-1 bg-teal-400 rounded hover:bg-teal-500">Edit</button>
                    <button onClick={() => handleDelete(i._id)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
