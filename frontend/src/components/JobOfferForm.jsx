import React, { useState } from 'react';
import { Briefcase, FileText, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import hrApi from '../hrApi';
import CitationDisplay from './CitationDisplay';

export default function JobOfferForm({ candidate, storeName }) {
  const [jobDetails, setJobDetails] = useState({
    position: '',
    department: '',
    startDate: '',
    salary: '',
    location: '',
    employmentType: 'Full-time',
    additionalDetails: ''
  });

  const [generating, setGenerating] = useState(false);
  const [jobOffer, setJobOffer] = useState(null);
  const [citations, setCitations] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (!candidate) {
      setError('Please select a candidate first');
      return;
    }

    if (!jobDetails.position) {
      setError('Position is required');
      return;
    }

    setGenerating(true);
    setError(null);
    setJobOffer(null);
    setCitations(null);

    try {
      const response = await hrApi.generateJobOffer(
        candidate.id,
        jobDetails,
        storeName || null
      );

      setJobOffer(response.jobOffer);
      setCitations(response.citations);
    } catch (err) {
      console.error('Error generating job offer:', err);
      setError(err.response?.data?.message || 'Failed to generate job offer');
    } finally {
      setGenerating(false);
    }
  };

  const downloadJobOffer = () => {
    if (!jobOffer) return;

    const blob = new Blob([jobOffer.offerLetter], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `job-offer-${candidate['Full Name']?.replace(/\s+/g, '-')}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card">
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Briefcase size={24} />
        Generate Job Offer
      </h2>

      {!candidate && (
        <div className="alert alert-info">
          Please select a candidate from the list to generate a job offer
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {candidate && !jobOffer && (
        <form onSubmit={handleGenerate}>
          <div className="alert alert-info" style={{ marginBottom: '16px' }}>
            <strong>Selected Candidate:</strong> {candidate['Full Name'] || candidate.name}
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label>Position / Job Title *</label>
              <input
                type="text"
                value={jobDetails.position}
                onChange={(e) => setJobDetails({ ...jobDetails, position: e.target.value })}
                placeholder="e.g., Senior Software Engineer"
                required
                disabled={generating}
              />
            </div>

            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                value={jobDetails.department}
                onChange={(e) => setJobDetails({ ...jobDetails, department: e.target.value })}
                placeholder="e.g., Engineering"
                disabled={generating}
              />
            </div>

            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={jobDetails.startDate}
                onChange={(e) => setJobDetails({ ...jobDetails, startDate: e.target.value })}
                disabled={generating}
              />
            </div>

            <div className="form-group">
              <label>Salary / Compensation</label>
              <input
                type="text"
                value={jobDetails.salary}
                onChange={(e) => setJobDetails({ ...jobDetails, salary: e.target.value })}
                placeholder="e.g., $120,000/year or As discussed"
                disabled={generating}
              />
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={jobDetails.location}
                onChange={(e) => setJobDetails({ ...jobDetails, location: e.target.value })}
                placeholder="e.g., New York, NY (Hybrid)"
                disabled={generating}
              />
            </div>

            <div className="form-group">
              <label>Employment Type</label>
              <select
                value={jobDetails.employmentType}
                onChange={(e) => setJobDetails({ ...jobDetails, employmentType: e.target.value })}
                disabled={generating}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Temporary">Temporary</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Additional Details (Benefits, Perks, etc.)</label>
            <textarea
              value={jobDetails.additionalDetails}
              onChange={(e) => setJobDetails({ ...jobDetails, additionalDetails: e.target.value })}
              placeholder="Enter any additional details such as benefits, perks, remote work policy, etc."
              rows={4}
              disabled={generating}
            />
          </div>

          <div className="alert alert-info">
            <strong>AI-Powered Job Offer Generation</strong>
            <p style={{ marginTop: '8px', fontSize: '14px' }}>
              Our system will generate a professional job offer letter that includes all necessary details,
              benefits, and next steps. If you have HR policies or templates in your File Search store,
              they will be used to ensure consistency with company standards.
            </p>
          </div>

          <button
            type="submit"
            disabled={generating || !jobDetails.position}
            className="btn-primary"
            style={{ width: '100%' }}
          >
            {generating ? (
              <>
                <span className="spinner"></span>
                Generating Job Offer...
              </>
            ) : (
              <>
                <FileText size={16} style={{ display: 'inline', marginRight: '8px' }} />
                Generate Job Offer Letter
              </>
            )}
          </button>
        </form>
      )}

      {jobOffer && (
        <div style={{ marginTop: '24px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--border)'
          }}>
            <div>
              <h3 style={{ margin: 0 }}>Job Offer Letter</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                For: {jobOffer.candidateName} - {jobOffer.position}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={downloadJobOffer}
                className="btn-secondary"
              >
                <Download size={16} style={{ display: 'inline', marginRight: '4px' }} />
                Download
              </button>
              <button
                onClick={() => {
                  setJobOffer(null);
                  setCitations(null);
                }}
                className="btn-secondary"
              >
                Create New
              </button>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-secondary)',
            padding: '24px',
            borderRadius: '8px',
            border: '1px solid var(--border)'
          }}>
            <div className="prose">
              <ReactMarkdown>{jobOffer.offerLetter}</ReactMarkdown>
            </div>
          </div>

          {citations && <CitationDisplay citations={citations} />}
        </div>
      )}
    </div>
  );
}
