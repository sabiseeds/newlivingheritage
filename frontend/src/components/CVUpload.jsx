import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, User, CheckCircle } from 'lucide-react';
import hrApi from '../hrApi';

export default function CVUpload({ storeName, onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const onCVDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setCvFile(acceptedFiles[0]);
      setError(null);
      setSuccess(false);
    }
  };

  const onPhotoDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setPhotoFile(acceptedFiles[0]);
      setError(null);
    }
  };

  const { getRootProps: getCVRootProps, getInputProps: getCVInputProps, isDragActive: isCVDragActive } = useDropzone({
    onDrop: onCVDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    disabled: uploading
  });

  const { getRootProps: getPhotoRootProps, getInputProps: getPhotoInputProps, isDragActive: isPhotoDragActive } = useDropzone({
    onDrop: onPhotoDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    disabled: uploading
  });

  const handleUpload = async () => {
    if (!cvFile) {
      setError('Please select a CV file');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await hrApi.uploadCV(cvFile, photoFile, storeName);

      setSuccess(true);
      setCvFile(null);
      setPhotoFile(null);

      if (onUploadComplete) {
        onUploadComplete(result.candidate);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload CV');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card">
      <h2>Upload Candidate CV/Resume</h2>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={16} style={{ display: 'inline', marginRight: '8px' }} />
          CV processed successfully! Candidate profile created with AI-extracted information.
        </div>
      )}

      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr' }}>
        {/* CV Upload */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
            CV/Resume (PDF) *
          </label>
          <div
            {...getCVRootProps()}
            style={{
              border: `2px dashed ${isCVDragActive ? 'var(--primary)' : cvFile ? 'var(--secondary)' : 'var(--border)'}`,
              borderRadius: '8px',
              padding: '30px',
              textAlign: 'center',
              cursor: uploading ? 'not-allowed' : 'pointer',
              background: isCVDragActive ? 'var(--bg-secondary)' : 'transparent',
              transition: 'all 0.2s',
              opacity: uploading ? 0.5 : 1
            }}
          >
            <input {...getCVInputProps()} />
            {cvFile ? (
              <>
                <FileText size={32} style={{ color: 'var(--secondary)', margin: '0 auto 12px' }} />
                <p style={{ fontWeight: 500, color: 'var(--secondary)' }}>{cvFile.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </>
            ) : (
              <>
                <Upload size={32} style={{ color: 'var(--primary)', margin: '0 auto 12px' }} />
                {isCVDragActive ? (
                  <p>Drop the CV here...</p>
                ) : (
                  <>
                    <p style={{ fontWeight: 500 }}>Drag & drop CV here</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      or click to select (PDF only, max 10MB)
                    </p>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Photo Upload */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
            Profile Photo (Optional)
          </label>
          <div
            {...getPhotoRootProps()}
            style={{
              border: `2px dashed ${isPhotoDragActive ? 'var(--primary)' : photoFile ? 'var(--secondary)' : 'var(--border)'}`,
              borderRadius: '8px',
              padding: '30px',
              textAlign: 'center',
              cursor: uploading ? 'not-allowed' : 'pointer',
              background: isPhotoDragActive ? 'var(--bg-secondary)' : 'transparent',
              transition: 'all 0.2s',
              opacity: uploading ? 0.5 : 1
            }}
          >
            <input {...getPhotoInputProps()} />
            {photoFile ? (
              <>
                <User size={32} style={{ color: 'var(--secondary)', margin: '0 auto 12px' }} />
                <p style={{ fontWeight: 500, color: 'var(--secondary)' }}>{photoFile.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {(photoFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </>
            ) : (
              <>
                <User size={32} style={{ color: 'var(--primary)', margin: '0 auto 12px' }} />
                {isPhotoDragActive ? (
                  <p>Drop the photo here...</p>
                ) : (
                  <>
                    <p style={{ fontWeight: 500 }}>Drag & drop photo here</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      or click to select (JPG/PNG, max 5MB)
                    </p>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <div className="alert alert-info">
          <strong>AI-Powered CV Parsing</strong>
          <p style={{ marginTop: '8px', fontSize: '14px' }}>
            Our system will automatically extract structured information from the CV including:
            name, contact details, work experience, education, skills, and certifications.
          </p>
        </div>

        <button
          onClick={handleUpload}
          disabled={!cvFile || uploading}
          className="btn-primary"
          style={{ width: '100%', marginTop: '12px' }}
        >
          {uploading ? (
            <>
              <span className="spinner"></span>
              Processing CV with AI...
            </>
          ) : (
            <>
              <Upload size={16} style={{ display: 'inline', marginRight: '8px' }} />
              Upload and Parse CV
            </>
          )}
        </button>
      </div>
    </div>
  );
}
