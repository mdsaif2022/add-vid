"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MediaUploadForm from '@/components/MediaUploadForm';

export default function AddVidPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [recent, setRecent] = useState<Array<{public_id:string;type:string;url:string;caption:string;description:string;created_at:string;}>>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if already authenticated
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRecent();
    }
  }, [isAuthenticated]);

  const fetchRecent = async () => {
    try {
      const res = await fetch('/api/media', { cache: 'no-store' });
      const data = await res.json();
      setRecent(data.items || []);
    } catch {}
  };

  const deleteItem = async (publicId: string) => {
    if (!confirm('Delete this media?')) return;
    setDeleting(publicId);
    try {
      const res = await fetch('/api/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_id: publicId }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchRecent();
      } else {
        alert(data.error || 'Delete failed');
      }
    } catch {
      alert('Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/check');
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(true);
      } else {
        setError(data.error || 'Invalid password');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setPassword('');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Admin Access
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter password to access the admin panel
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign in
              </button>
            </div>
          </form>

          <div className="text-center">
            <a
              href="/"
              className="text-blue-600 hover:text-blue-800 underline text-sm"
            >
              ← Back to Video Player
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-600">Upload and manage your media</p>
            </div>
            <div className="flex space-x-4">
              <a
                href="/"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                View Player
              </a>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8">
        <MediaUploadForm onUploaded={fetchRecent} />

        {/* Recent uploads */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Uploads</h2>
            <button onClick={fetchRecent} className="text-sm text-blue-600 hover:text-blue-800">Refresh</button>
          </div>
          {recent.length === 0 ? (
            <p className="text-gray-500">No uploads yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {recent.map((item) => (
                <div key={item.public_id} className="bg-white rounded-lg shadow p-3">
                  <div className="aspect-video overflow-hidden rounded">
                    {item.type === 'video' ? (
                      <video src={item.url} controls className="w-full h-full object-cover" />
                    ) : (
                      <img src={item.url} alt={item.caption || 'image'} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="mt-3">
                    <p className="font-medium text-sm">{item.caption || 'Untitled'}</p>
                    <p className="text-xs text-gray-600 line-clamp-2">{item.description || 'No description'}</p>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={() => deleteItem(item.public_id)}
                      disabled={deleting === item.public_id}
                      className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:bg-red-400"
                    >
                      {deleting === item.public_id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
