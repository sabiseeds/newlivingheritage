import React, { useState } from 'react';
import { FileText, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../api';
import CitationDisplay from './CitationDisplay';

export default function ProposalGenerator({ storeName }) {
  const [requirement, setRequirement] = useState('');
  const [metadataFilter, setMetadataFilter] = useState('');
  const [generating, setGenerating] = useState(false);
  const [proposal, setProposal] = useState(null);
  const [citations, setCitations] = useState(null);
  const [error, setError] = useState(null);

  const generateProposal = async (e) => {
    e.preventDefault();

    if (!requirement.trim()) {
      setError('Please enter a requirement description');
      return;
    }

    if (!storeName) {
      setError('Please select a File Search store');
      return;
    }

    setGenerating(true);
    setError(null);
    setProposal(null);
    setCitations(null);

    try {
      const response = await api.generateProposal(
        requirement,
        storeName,
        metadataFilter || null
      );

      setProposal(response.proposal);
      setCitations(response.citations);
    } catch (err) {
      console.error('Error generating proposal:', err);
      setError(err.response?.data?.message || 'Failed to generate proposal');
    } finally {
      setGenerating(false);
    }
  };

  const clearResults = () => {
    setProposal(null);
    setCitations(null);
    setError(null);
  };

  return (
    <div className="card">
      <h2>Generate Software Proposal</h2>

      {!storeName && (
        <div className="alert alert-info">
          Please select a File Search store and upload documents first
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <form onSubmit={generateProposal}>
        <div className="form-group">
          <label>Requirement Description *</label>
          <textarea
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
            placeholder="Describe the software project requirements in detail. For example:&#10;&#10;'We need a web-based e-commerce platform for selling handmade crafts. The platform should support multiple vendors, secure payment processing, inventory management, and mobile-responsive design. Target launch is Q2 2025 with an estimated user base of 10,000 customers.'"
            rows={8}
            disabled={generating || !storeName}
          />
        </div>

        <div className="form-group">
          <label>Metadata Filter (Optional)</label>
          <input
            type="text"
            value={metadataFilter}
            onChange={(e) => setMetadataFilter(e.target.value)}
            placeholder='e.g., category="architecture" or year=2024'
            disabled={generating || !storeName}
          />
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Filter documents by metadata. Example: category="security" AND year=2024
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="submit"
            disabled={generating || !storeName || !requirement.trim()}
            className="btn-primary"
          >
            {generating ? (
              <>
                <span className="spinner"></span>
                Generating Proposal...
              </>
            ) : (
              <>
                <Sparkles size={16} style={{ display: 'inline', marginRight: '8px' }} />
                Generate Proposal
              </>
            )}
          </button>

          {proposal && (
            <button
              type="button"
              onClick={clearResults}
              className="btn-secondary"
            >
              Clear Results
            </button>
          )}
        </div>
      </form>

      {proposal && (
        <div style={{ marginTop: '32px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} />
              Generated Software Proposal
            </h3>
            <button
              onClick={() => {
                const blob = new Blob([proposal], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'software-proposal.md';
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              Download as Markdown
            </button>
          </div>

          <div style={{
            background: 'var(--bg-secondary)',
            padding: '24px',
            borderRadius: '8px',
            border: '1px solid var(--border)'
          }}>
            <div className="prose">
              <ReactMarkdown>{proposal}</ReactMarkdown>
            </div>
          </div>

          {citations && <CitationDisplay citations={citations} />}
        </div>
      )}
    </div>
  );
}
