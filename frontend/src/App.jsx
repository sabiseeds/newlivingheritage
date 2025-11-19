import React, { useState, useEffect } from 'react';
import { Sparkles, UserCheck, FileText, Image } from 'lucide-react';
import StoreManager from './components/StoreManager';
import FileUpload from './components/FileUpload';
import ProposalGenerator from './components/ProposalGenerator';
import HRApp from './HRApp';
import DocumentImageApp from './DocumentImageApp';
import api from './api';

function App() {
  const [selectedStore, setSelectedStore] = useState(null);
  const [apiConfigured, setApiConfigured] = useState(false);
  const [checking, setChecking] = useState(true);
  const [activeModule, setActiveModule] = useState('proposals'); // 'proposals', 'hr', or 'document-image'

  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await api.healthCheck();
      setApiConfigured(response.configured);
    } catch (err) {
      console.error('API health check failed:', err);
      setApiConfigured(false);
    } finally {
      setChecking(false);
    }
  };

  // If the API is not configured, show the error regardless of module selection
  if (checking) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner" style={{ margin: '0 auto 16px', width: '32px', height: '32px' }}></div>
          <p>Checking API configuration...</p>
        </div>
      </div>
    );
  }

  if (!apiConfigured) {
    return (
      <div className="container">
        <div className="alert alert-error">
          <strong>API Configuration Required</strong>
          <p style={{ marginTop: '8px', marginBottom: '8px' }}>
            The Gemini API key is not configured. Please set up your environment:
          </p>
          <ol style={{ marginLeft: '20px', marginTop: '8px' }}>
            <li>Copy <code>backend/.env.example</code> to <code>backend/.env</code></li>
            <li>Add your Gemini API key to the <code>GEMINI_API_KEY</code> variable</li>
            <li>Restart the backend server</li>
          </ol>
          <p style={{ marginTop: '12px', fontSize: '14px' }}>
            Get your API key from: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>Google AI Studio</a>
          </p>
        </div>
      </div>
    );
  }

  // If HR module is selected, show HRApp
  if (activeModule === 'hr') {
    return (
      <>
        <ModuleNavigation activeModule={activeModule} setActiveModule={setActiveModule} />
        <HRApp />
      </>
    );
  }

  // If Document Image module is selected, show DocumentImageApp
  if (activeModule === 'document-image') {
    return (
      <>
        <ModuleNavigation activeModule={activeModule} setActiveModule={setActiveModule} />
        <DocumentImageApp />
      </>
    );
  }

  // Default: Show Proposal Generator
  return (
    <>
      <ModuleNavigation activeModule={activeModule} setActiveModule={setActiveModule} />
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
            <Sparkles size={32} style={{ color: 'var(--primary)' }} />
            <h1 style={{ fontSize: '32px', margin: 0 }}>
              Gemini Software Proposal Generator
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', margin: 0 }}>
            Generate comprehensive software proposals using AI and your knowledge base
          </p>
        </header>

        <>
          <div className="grid grid-2">
            <StoreManager
              selectedStore={selectedStore}
              onStoreSelect={setSelectedStore}
            />
            <FileUpload
              storeName={selectedStore}
              onUploadComplete={() => {
                // Could refresh store info here if needed
              }}
            />
          </div>

          <ProposalGenerator storeName={selectedStore} />
        </>

        <footer style={{
          textAlign: 'center',
          padding: '20px',
          color: 'var(--text-secondary)',
          fontSize: '14px',
          marginTop: '40px'
        }}>
          <p>
            Powered by{' '}
            <a
              href="https://ai.google.dev/gemini-api/docs/file-search"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--primary)', textDecoration: 'none' }}
            >
              Gemini File Search API
            </a>
          </p>
          <p style={{ marginTop: '8px', fontSize: '12px' }}>
            Supports RAG (Retrieval Augmented Generation) with semantic search and citations
          </p>
        </footer>
      </div>
    </>
  );
}

// Module Navigation Component
function ModuleNavigation({ activeModule, setActiveModule }) {
  return (
    <div style={{
      background: 'var(--bg-primary)',
      borderBottom: '2px solid var(--border)',
      boxShadow: '0 2px 4px var(--shadow)',
      marginBottom: '20px',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="container" style={{ padding: '0' }}>
        <nav style={{
          display: 'flex',
          gap: '4px',
          padding: '8px 0'
        }}>
          <button
            onClick={() => setActiveModule('proposals')}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderBottom: activeModule === 'proposals' ? '3px solid var(--primary)' : '3px solid transparent',
              background: 'transparent',
              color: activeModule === 'proposals' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FileText size={18} />
            Software Proposals
          </button>
          <button
            onClick={() => setActiveModule('hr')}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderBottom: activeModule === 'hr' ? '3px solid var(--primary)' : '3px solid transparent',
              background: 'transparent',
              color: activeModule === 'hr' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <UserCheck size={18} />
            HR & Recruitment
          </button>
          <button
            onClick={() => setActiveModule('document-image')}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderBottom: activeModule === 'document-image' ? '3px solid var(--primary)' : '3px solid transparent',
              background: 'transparent',
              color: activeModule === 'document-image' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Image size={18} />
            Document Images
          </button>
        </nav>
      </div>
    </div>
  );
}

export default App;
