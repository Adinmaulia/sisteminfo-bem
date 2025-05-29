import React, { useEffect, useState, useContext } from 'react';
import { useDropzone } from 'react-dropzone';
import api from '../../utils/axios';
import { AuthContext } from '../../context/AuthContext';

export default function CrudProfil() {
  const { user } = useContext(AuthContext);
  const [profils, setProfils] = useState([]);
  const [form, setForm] = useState({ visi: '', misi: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchProfils = async () => {
    setLoading(true);
    try {
      const res = await api.get('/profil');
      setProfils(res.data);
    } catch {
      setError('Gagal mengambil data profil');
    }
    setLoading(false);
  };

  useEffect(() => { fetchProfils(); }, []);

  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    onDrop: accepted => {
      setFile(accepted[0]);
      setPreview(URL.createObjectURL(accepted[0]));
    }
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.visi || !form.misi) return setError('Visi & Misi wajib diisi');
    const data = new FormData();
    data.append('visi', form.visi);
    data.append('misi', form.misi);
    if (file) data.append('gambar', file);
    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (editingId) await api.put(`/profil/${editingId}`, data, config);
      else await api.post('/profil', data, config);
      setForm({ visi: '', misi: '' }); setFile(null); setPreview(''); setEditingId(null); setShowForm(false);
      fetchProfils();
    } catch (err) {
      setError(err.response?.data?.msg || 'Terjadi kesalahan');
    }
  };

  const handleEdit = p => {
    setEditingId(p._id);
    setForm({ visi: p.visi, misi: p.misi });
    setPreview(`/api/profil/${p._id}/gambar`);
    setShowForm(true);
  };

  const handleDelete = async id => {
    if (!window.confirm('Yakin ingin menghapus profil ini?')) return;
    try { await api.delete(`/profil/${id}`); fetchProfils(); } 
    catch { setError('Gagal menghapus profil'); }
  };

  const toggleForm = () => {
    setEditingId(null);
    setForm({ visi: '', misi: '' });
    setFile(null); setPreview(''); setError('');
    setShowForm(!showForm);
  };

  if (!user || user.role !== 'admin') {
    return <div className="p-6 text-red-600 font-semibold">Akses ditolak. Hanya admin.</div>;
  }

  return (
    <div className="mx-auto">
      <div className="flex justify-between items-center mb-4">
        <button onClick={toggleForm} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          {showForm ? 'Tutup Form' : 'Tambah Profil'}
        </button>
      </div>

      {error && <p className="mb-4 text-red-600">{error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">{editingId ? 'Edit Profil' : 'Tambah Profil'}</h3>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Visi</label>
            <textarea name="visi" value={form.visi} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Misi</label>
            <textarea name="misi" value={form.misi} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Gambar</label>
            <div {...getRootProps()} className="w-full p-6 border-dashed border-2 rounded text-center cursor-pointer">
              <input {...getInputProps()} />
              {preview
                ? <img src={preview} alt="preview" className="mx-auto max-h-40" />
                : <p>Tarik & lepas gambar di sini, atau klik untuk pilih file</p>
              }
            </div>
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {editingId ? 'Update' : 'Tambah'}
          </button>
        </form>
      )}

      {loading ? <p>Loading...</p> : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead>
              <tr className="bg-blue-500 text-teal-100 uppercase text-sm">
                <th className="py-3 px-6 text-left">Gambar</th>
                <th className="py-3 px-6 text-left">Visi</th>
                <th className="py-3 px-6 text-left">Misi</th>
                <th className="py-3 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {profils.map(p => (
                <tr key={p._id} className="border-b hover:bg-gray-100">
                  <td className="py-3 px-6"><img src={`http://localhost:5000/api/profil/${p._id}/gambar`} alt="profil" className="h-16 w-16 object-cover rounded"/></td>
                  <td className="py-3 px-6">{p.visi}</td>
                  <td className="py-3 px-6">{p.misi}</td>
                  <td className="py-3 px-6 text-center">
                    <button onClick={() => handleEdit(p)} className="m-2 px-3 py-1 bg-teal-400 rounded hover:bg-teal-500">Edit</button>
                    <button onClick={() => handleDelete(p._id)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Hapus</button>
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
