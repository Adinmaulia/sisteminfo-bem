// src/components/admin/CrudPengurus.js
import React, { useEffect, useState, useContext } from 'react';
import api from '../../utils/axios';
import { AuthContext } from '../../context/AuthContext';
import useFuseSearch from '../../hooks/useFuseSearch';

function CrudPengurus() {
  const { user } = useContext(AuthContext);
  const [pengurus, setPengurus] = useState([]);
  const [form, setForm] = useState({ jabatan: '', nama: '', nim: '', jurusan: '', periode: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Fuse.js search setup
  const { query, setQuery, results } = useFuseSearch(pengurus, {
    keys: ['jabatan', 'nama', 'nim', 'jurusan', 'periode'],
    threshold: 0.3,
  });

  const fetchPengurus = async () => {
    try {
      setLoading(true);
      const res = await api.get('/pengurus');
      setPengurus(res.data);
      setLoading(false);
    } catch (err) {
      setError('Gagal mengambil data pengurus');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPengurus();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.put(`/pengurus/${editingId}`, form);
        setEditingId(null);
      } else {
        await api.post('/pengurus', form);
      }
      setForm({ jabatan: '', nama: '', nim: '', jurusan: '', periode: '' });
      setShowForm(false);
      fetchPengurus();
    } catch (err) {
      setError(err.response?.data?.msg || 'Terjadi kesalahan');
    }
  };

  const handleEdit = item => {
    setEditingId(item._id);
    setForm({
      jabatan: item.jabatan,
      nama: item.nama,
      nim: item.nim,
      jurusan: item.jurusan,
      periode: item.periode
    });
    setError('');
    setShowForm(true);
  };

  const handleDelete = async id => {
    if (!window.confirm('Yakin ingin menghapus pengurus ini?')) return;
    try {
      await api.delete(`/pengurus/${id}`);
      fetchPengurus();
    } catch (err) {
      setError('Gagal menghapus pengurus');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ jabatan: '', nama: '', nim: '', jurusan: '', periode: '' });
    setError('');
    setShowForm(false);
  };

  const toggleForm = () => {
    if (showForm && editingId) {
      setEditingId(null);
      setForm({ jabatan: '', nama: '', nim: '', jurusan: '', periode: '' });
    }
    setShowForm(!showForm);
  };

  return (
    <>
      {!user || user.role !== 'admin' ? (
        <div className="p-6 text-red-600 font-semibold">Akses ditolak. Hanya admin yang dapat mengakses halaman ini.</div>
      ) : (
        <div className="mx-auto">
          <div className="flex justify-between items-center mb-4">
            {/* <h2 className="text-3xl font-bold mb-4">Kelola Pengurus</h2> */}
            <button
              onClick={toggleForm}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              {showForm ? 'Tutup Form' : 'Tambah Pengurus'}
            </button>
          </div>

          {error && <p className="mb-4 text-red-600">{error}</p>}

          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">{editingId ? 'Edit Pengurus' : 'Tambah Pengurus Baru'}</h3>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Jabatan</label>
                <input
                  type="text"
                  name="jabatan"
                  value={form.jabatan || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Nama</label>
                <input
                  type="text"
                  name="nama"
                  value={form.nama || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">NIM</label>
                <input
                  type="text"
                  name="nim"
                  value={form.nim || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Jurusan</label>
                <input
                  type="text"
                  name="jurusan"
                  value={form.jurusan || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Periode</label>
                <input
                  type="text"
                  name="periode"
                  value={form.periode || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded mr-2 hover:bg-blue-700 transition">
                  {editingId ? 'Update' : 'Tambah'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          )}

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Cari pengurus..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <table className="min-w-full bg-white rounded-lg shadow-md">
                <thead>
                  <tr className="w-full bg-blue-500 text-teal-100 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">Jabatan</th>
                    <th className="py-3 px-6 text-left">Nama</th>
                    <th className="py-3 px-6 text-left">NIM</th>
                    <th className="py-3 px-6 text-left">Jurusan</th>
                    <th className="py-3 px-6 text-left">Periode</th>
                    <th className="py-3 px-6 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                  {results.map(p => (
                    <tr
                      key={p._id}
                      className="border-b border-gray-200 hover:bg-gray-100"
                    >
                      <td className="py-3 px-6 text-left whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="font-medium">{p.jabatan}</span>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-left">
                        <div>{p.nama}</div>
                      </td>
                      <td className="py-3 px-6 text-left">
                        <div>{p.nim}</div>
                      </td>
                      <td className="py-3 px-6 text-left">
                        <div>{p.jurusan}</div>
                      </td>
                      <td className="py-3 px-6 text-left">
                        <div>{p.periode}</div>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <button
                          onClick={() => handleEdit(p)}
                          className="mr-2 px-3 py-1 bg-teal-400 rounded hover:bg-teal-500 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default CrudPengurus;
