import React, { useState } from 'react';
import { Image, Upload, Download, Sparkles, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function DocumentImageApp() {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'analyze'

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.name.endsWith('.docx')) {
        setError('Please select a .docx file');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setResult(null);
      setAnalysis(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setAnalysis(null);

    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await fetch(`${API_URL}/api/document-image/analyze`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Analysis failed');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze document');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleProcess = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setProcessing(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await fetch(`${API_URL}/api/document-image/process`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Processing failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Processing error:', err);
      setError(err.message || 'Failed to process document');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result && result.downloadUrl) {
      window.open(`${API_URL}${result.downloadUrl}`, '_blank');
    }
  };

  const resetForm = () => {
    setFile(null);
    setResult(null);
    setAnalysis(null);
    setError(null);
    document.getElementById('file-input').value = '';
  };

  return (
    <div className="container">
      <header style={{
        textAlign: 'center',
        padding: '40px 20px',
        background: 'var(--bg-primary)',
        borderRadius: '8px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px var(--shadow)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
          <Image size={32} style={{ color: 'var(--primary)' }} />
          <h1 style={{ fontSize: '32px', margin: 0 }}>
            AI Document Image Generator
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px', margin: 0 }}>
          Automatically enhance your documents with AI-generated images
        </p>
      </header>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Upload size={24} />
          Upload Document
        </h2>

        <div style={{
          padding: '40px',
          border: '2px dashed var(--border)',
          borderRadius: '8px',
          textAlign: 'center',
          background: 'var(--bg-secondary)',
          marginBottom: '20px'
        }}>
          <FileText size={48} style={{ color: 'var(--primary)', margin: '0 auto 16px' }} />
          <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
            Select a .docx document to enhance with AI-generated images
          </p>
          <input
            id="file-input"
            type="file"
            accept=".docx"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <label
            htmlFor="file-input"
            className="btn btn-primary"
            style={{ display: 'inline-block', cursor: 'pointer' }}
          >
            Choose File
          </label>
          {file && (
            <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-primary)', borderRadius: '4px' }}>
              <strong>Selected:</strong> {file.name}
              <button
                onClick={resetForm}
                className="btn"
                style={{ marginLeft: '12px', fontSize: '12px', padding: '4px 12px' }}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {file && (
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="btn btn-secondary"
              style={{ flex: 1, maxWidth: '300px' }}
            >
              {analyzing ? (
                <>
                  <div className="spinner" style={{ marginRight: '8px' }}></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={20} style={{ marginRight: '8px' }} />
                  Preview Analysis
                </>
              )}
            </button>
            <button
              onClick={handleProcess}
              disabled={processing}
              className="btn btn-primary"
              style={{ flex: 1, maxWidth: '300px' }}
            >
              {processing ? (
                <>
                  <div className="spinner" style={{ marginRight: '8px' }}></div>
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles size={20} style={{ marginRight: '8px' }} />
                  Generate Images & Process
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '24px' }}>
          <AlertCircle size={20} style={{ marginRight: '8px' }} />
          <div>
            <strong>Error</strong>
            <p style={{ marginTop: '4px' }}>{error}</p>
          </div>
        </div>
      )}

      {analysis && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={24} />
            Analysis Results
          </h2>

          <div style={{
            padding: '16px',
            background: 'var(--bg-secondary)',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Statistics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <strong>Total Paragraphs:</strong> {analysis.statistics.totalParagraphs}
              </div>
              <div>
                <strong>Paragraphs Needing Images:</strong> {analysis.statistics.paragraphsNeedingImages}
              </div>
            </div>
          </div>

          {analysis.analysis && analysis.analysis.length > 0 && (
            <div>
              <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Suggested Images</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {analysis.analysis.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '16px',
                      background: 'var(--bg-secondary)',
                      borderRadius: '8px',
                      borderLeft: '4px solid var(--primary)'
                    }}
                  >
                    <div style={{ marginBottom: '8px' }}>
                      <strong style={{ color: 'var(--primary)' }}>
                        Paragraph {item.paragraphIndex + 1}
                      </strong>
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      {item.paragraphPreview}
                    </div>
                    <div style={{
                      padding: '8px 12px',
                      background: 'var(--bg-primary)',
                      borderRadius: '4px',
                      fontSize: '13px'
                    }}>
                      <strong>Image to generate:</strong> {item.imageDescription}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {result && (
        <div className="card">
          <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={24} style={{ color: 'var(--success)' }} />
            Processing Complete!
          </h2>

          <div style={{
            padding: '20px',
            background: 'var(--success-bg)',
            border: '1px solid var(--success)',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <p style={{ marginBottom: '12px', fontSize: '16px' }}>
              <strong>{result.message}</strong>
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)' }}>
                  {result.statistics.originalParagraphs}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Total Paragraphs
                </div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)' }}>
                  {result.statistics.imagesGenerated}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Images Generated
                </div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)' }}>
                  {result.statistics.paragraphsEnhanced}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Paragraphs Enhanced
                </div>
              </div>
            </div>

            <button
              onClick={handleDownload}
              className="btn btn-primary"
              style={{ width: '100%', fontSize: '16px' }}
            >
              <Download size={20} style={{ marginRight: '8px' }} />
              Download Enhanced Document
            </button>
          </div>

          {result.analysis && result.analysis.length > 0 && (
            <div>
              <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Generated Images</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {result.analysis.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '12px',
                      background: 'var(--bg-secondary)',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    <strong style={{ color: 'var(--primary)' }}>
                      Paragraph {item.paragraphIndex + 1}:
                    </strong>
                    <span style={{ marginLeft: '8px', color: 'var(--text-secondary)' }}>
                      {item.imageDescription}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={resetForm}
            className="btn"
            style={{ marginTop: '16px', width: '100%' }}
          >
            Process Another Document
          </button>
        </div>
      )}

      <div className="card" style={{ marginTop: '24px', background: 'var(--bg-secondary)' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>How It Works</h3>
        <ol style={{ marginLeft: '20px', lineHeight: '1.8' }}>
          <li>Upload your Word document (.docx format)</li>
          <li>AI analyzes each paragraph to identify opportunities for visual enhancement</li>
          <li>AI generates relevant, high-quality images using Gemini Imagen 3</li>
          <li>Images are automatically inserted into appropriate locations in the document</li>
          <li>Download your enhanced document with professional illustrations</li>
        </ol>
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: 'var(--bg-primary)',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          <strong>Tip:</strong> Use "Preview Analysis" to see which paragraphs will get images before generating them.
        </div>
      </div>
    </div>
  );
}

export default DocumentImageApp;
