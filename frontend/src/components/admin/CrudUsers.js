// src/components/admin/CrudUsers.js
import React, { useEffect, useState, useContext } from 'react';
import api from '../../utils/axios';
import { AuthContext } from '../../context/AuthContext';
import useFuseSearch from '../../hooks/useFuseSearch';

function CrudUsers() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ nama: '', username: '', password: '', level: '' });
  const [editingUserId, setEditingUserId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false); // State untuk toggle form

  // Fuse.js search setup
  const { query, setQuery, results } = useFuseSearch(users, {
    keys: ['nama', 'username', 'level'],
    threshold: 0.3,
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data);
      setLoading(false);
    } catch (err) {
      setError('Gagal mengambil data user');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      if (editingUserId) {
        // Update user
        await api.put(`/users/${editingUserId}`, form);
        setEditingUserId(null);
      } else {
        // Create user
        await api.post('/users', form);
      }
      setForm({ nama: '', username: '', password: '', level: '' });
      setShowForm(false); // Sembunyikan form setelah submit
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.msg || 'Terjadi kesalahan');
    }
  };

  const handleEdit = user => {
    setEditingUserId(user._id);
    setForm({ nama: user.nama, username: user.username, level: user.level, password: '' });
    setError('');
    setShowForm(true); // Tampilkan form saat mode edit
  };

  const handleDelete = async id => {
    if (!window.confirm('Yakin ingin menghapus user ini?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      setError('Gagal menghapus user');
    }
  };

  const handleCancel = () => {
    setEditingUserId(null);
    setForm({ nama: '', username: '', password: '', level: '' });
    setError('');
    setShowForm(false); // Sembunyikan form saat batal
  };

  const toggleForm = () => {
    if (showForm && editingUserId) {
      // Reset form jika sedang dalam mode edit
      setEditingUserId(null);
      setForm({ nama: '', username: '', password: '', level: '' });
    }
    setShowForm(!showForm);
  };

  return (
    <div>
      {!user || user.role !== 'admin' ? (
        <div className="p-6 text-red-600 font-semibold">Akses ditolak. Hanya admin yang dapat mengakses halaman ini.</div>
      ) : (
        <div className="mx-auto">
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={toggleForm} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              {showForm ? 'Tutup Form' : 'Tambah User'}
            </button>
          </div>

          {error && <p className="mb-4 text-red-600">{error}</p>}

          {/* Form yang dapat di-toggle */}
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">{editingUserId ? 'Edit User' : 'Tambah User Baru'}</h3>
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
                <label className="block mb-1 font-medium">Username</label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Password {editingUserId ? '(Kosongkan jika tidak diubah)' : ''}</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required={!editingUserId}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Level</label>
                <input
                  type="text"
                  name="level"
                  value={form.level || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded mr-2 hover:bg-blue-700 transition">
                  {editingUserId ? 'Update' : 'Tambah'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                >
                  Batal
                </button>
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
                  placeholder="Cari user..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <table className="min-w-full bg-white rounded-lg shadow-md">
                <thead>
                  <tr className="w-full bg-blue-500 text-teal-100 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">Nama</th>
                    <th className="py-3 px-6 text-left">Username</th>
                    <th className="py-3 px-6 text-left">Level</th>
                    <th className="py-3 px-6 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                  {results.map(u => (
                    <tr
                      key={u._id}
                      className="border-b border-gray-200 hover:bg-gray-100"
                    >
                      <td className="py-3 px-6 text-left whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="font-medium">{u.nama}</span>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-left">
                        <div>{u.username}</div>
                      </td>
                      <td className="py-3 px-6 text-left">
                        <div>{u.level}</div>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <button
                          onClick={() => handleEdit(u)}
                          className="mr-2 px-3 py-1 bg-teal-400 rounded hover:bg-teal-500 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(u._id)}
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
    </div>
  );
}

export default CrudUsers;
