import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';
import api from '../api';

export default function FileUpload({ storeName, onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState({ category: '', year: '' });

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!storeName) {
      setError('Please select a File Search store first');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      for (const file of acceptedFiles) {
        const metadataObj = {};
        if (metadata.category) metadataObj.category = metadata.category;
        if (metadata.year) metadataObj.year = parseInt(metadata.year);

        await api.uploadFile(
          storeName,
          file,
          file.name,
          Object.keys(metadataObj).length > 0 ? metadataObj : null
        );

        setUploadedFiles(prev => [...prev, {
          name: file.name,
          size: file.size,
          uploadedAt: new Date()
        }]);
      }

      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  }, [storeName, metadata, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 100 * 1024 * 1024, // 100MB
    disabled: !storeName || uploading
  });

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="card">
      <h2>Upload Knowledge Base Documents</h2>

      {!storeName && (
        <div className="alert alert-info">
          Please select or create a File Search store first
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="form-group">
        <label>Document Metadata (Optional)</label>
        <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: '1fr 1fr' }}>
          <input
            type="text"
            placeholder="Category (e.g., architecture, security)"
            value={metadata.category}
            onChange={(e) => setMetadata(prev => ({ ...prev, category: e.target.value }))}
          />
          <input
            type="number"
            placeholder="Year (e.g., 2024)"
            value={metadata.year}
            onChange={(e) => setMetadata(prev => ({ ...prev, year: e.target.value }))}
          />
        </div>
      </div>

      <div
        {...getRootProps()}
        style={{
          border: `2px dashed ${isDragActive ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: '8px',
          padding: '40px',
          textAlign: 'center',
          cursor: storeName && !uploading ? 'pointer' : 'not-allowed',
          background: isDragActive ? 'var(--bg-secondary)' : 'transparent',
          transition: 'all 0.2s',
          opacity: !storeName || uploading ? 0.5 : 1
        }}
      >
        <input {...getInputProps()} />
        <Upload size={48} style={{ color: 'var(--primary)', margin: '0 auto 16px' }} />
        {uploading ? (
          <p>Uploading and indexing files...</p>
        ) : isDragActive ? (
          <p>Drop files here...</p>
        ) : (
          <>
            <p style={{ marginBottom: '8px', fontWeight: 500 }}>
              Drag & drop files here, or click to select
            </p>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Supports PDF, DOCX, TXT, MD, and many other formats (max 100MB per file)
            </p>
          </>
        )}
      </div>

      {uploadedFiles.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Uploaded Files</h3>
          <ul className="file-list">
            {uploadedFiles.map((file, index) => (
              <li key={index} className="file-item">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <File size={16} style={{ marginRight: '8px', color: 'var(--primary)' }} />
                  <span>{file.name}</span>
                  <span className="badge badge-success">Indexed</span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  style={{
                    background: 'none',
                    padding: '4px',
                    color: 'var(--text-secondary)'
                  }}
                  title="Remove from list"
                >
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
