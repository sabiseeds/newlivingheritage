import React, { useState, useEffect } from 'react';
import { Database, Plus, Trash2, RefreshCw } from 'lucide-react';
import api from '../api';

export default function StoreManager({ selectedStore, onStoreSelect }) {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.listStores();
      setStores(response.stores || []);

      // Auto-select first store if none selected
      if (!selectedStore && response.stores?.length > 0) {
        onStoreSelect(response.stores[0].name);
      }
    } catch (err) {
      console.error('Error loading stores:', err);
      setError(err.response?.data?.message || 'Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const createStore = async (e) => {
    e.preventDefault();
    if (!newStoreName.trim()) return;

    setCreating(true);
    setError(null);
    try {
      const response = await api.createStore(newStoreName.trim());
      await loadStores();
      onStoreSelect(response.store.name);
      setNewStoreName('');
    } catch (err) {
      console.error('Error creating store:', err);
      setError(err.response?.data?.message || 'Failed to create store');
    } finally {
      setCreating(false);
    }
  };

  const deleteStore = async (storeName) => {
    if (!confirm('Are you sure you want to delete this store? This will delete all indexed documents.')) {
      return;
    }

    try {
      await api.deleteStore(storeName);
      await loadStores();
      if (selectedStore === storeName) {
        onStoreSelect(null);
      }
    } catch (err) {
      console.error('Error deleting store:', err);
      setError(err.response?.data?.message || 'Failed to delete store');
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2>File Search Stores</h2>
        <button
          onClick={loadStores}
          disabled={loading}
          className="btn-secondary"
          style={{ padding: '8px 12px' }}
        >
          <RefreshCw size={16} style={{ display: 'inline', marginRight: '4px' }} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <form onSubmit={createStore} style={{ marginBottom: '20px' }}>
        <div className="form-group" style={{ marginBottom: '12px' }}>
          <label>Create New Store</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Enter store name (e.g., my-knowledge-base)"
              value={newStoreName}
              onChange={(e) => setNewStoreName(e.target.value)}
              disabled={creating}
            />
            <button
              type="submit"
              disabled={creating || !newStoreName.trim()}
              className="btn-primary"
              style={{ whiteSpace: 'nowrap' }}
            >
              {creating ? (
                <>
                  <span className="spinner"></span>
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={16} style={{ display: 'inline', marginRight: '4px' }} />
                  Create
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '8px' }}>Loading stores...</p>
        </div>
      ) : stores.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: 'var(--bg-secondary)',
          borderRadius: '8px',
          color: 'var(--text-secondary)'
        }}>
          <Database size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <p>No File Search stores found</p>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>
            Create your first store to get started
          </p>
        </div>
      ) : (
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
            Select Active Store
          </label>
          <div style={{ display: 'grid', gap: '8px' }}>
            {stores.map((store) => (
              <div
                key={store.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  background: selectedStore === store.name ? 'var(--bg-secondary)' : 'transparent',
                  border: `2px solid ${selectedStore === store.name ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => onStoreSelect(store.name)}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>
                    {store.displayName || store.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {store.name}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteStore(store.name);
                  }}
                  className="btn-danger"
                  style={{ padding: '6px 12px' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
