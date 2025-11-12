import React, { useState, useEffect } from 'react';
import { Users, User, Briefcase, Mail, Phone, MapPin, RefreshCw } from 'lucide-react';
import hrApi from '../hrApi';

export default function CandidateList({ onSelectCandidate, refreshTrigger }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    loadCandidates();
  }, [filter, refreshTrigger]);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const statusFilter = filter === 'all' ? undefined : filter;
      const response = await hrApi.getCandidates(statusFilter);
      setCandidates(response.candidates || []);
    } catch (err) {
      console.error('Error loading candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (candidate) => {
    setSelectedId(candidate.id);
    if (onSelectCandidate) {
      onSelectCandidate(candidate);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      applied: 'var(--primary)',
      screening: 'var(--warning)',
      interviewing: 'var(--warning)',
      'offer-sent': 'var(--secondary)',
      hired: 'var(--secondary)',
      rejected: 'var(--danger)'
    };
    return colors[status] || 'var(--text-secondary)';
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={24} />
          Candidates
        </h2>
        <button
          onClick={loadCandidates}
          disabled={loading}
          className="btn-secondary"
          style={{ padding: '8px 12px' }}
        >
          <RefreshCw size={16} style={{ display: 'inline', marginRight: '4px' }} />
          Refresh
        </button>
      </div>

      <div className="form-group">
        <label>Filter by Status</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Candidates</option>
          <option value="applied">Applied</option>
          <option value="screening">Screening</option>
          <option value="interviewing">Interviewing</option>
          <option value="offer-sent">Offer Sent</option>
          <option value="hired">Hired</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '8px' }}>Loading candidates...</p>
        </div>
      ) : candidates.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: 'var(--bg-secondary)',
          borderRadius: '8px',
          color: 'var(--text-secondary)'
        }}>
          <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <p>No candidates found</p>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>
            Upload a CV to get started
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              onClick={() => handleSelect(candidate)}
              style={{
                padding: '16px',
                background: selectedId === candidate.id ? 'var(--bg-secondary)' : 'transparent',
                border: `2px solid ${selectedId === candidate.id ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', gap: '16px', alignItems: 'start' }}>
                {candidate.profilePhoto ? (
                  <img
                    src={hrApi.getCandidatePhotoUrl(candidate.id)}
                    alt={candidate['Full Name'] || candidate.name}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--border)'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'var(--bg-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <User size={32} style={{ color: 'var(--text-secondary)' }} />
                  </div>
                )}

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <h3 style={{ margin: 0 }}>
                      {candidate['Full Name'] || candidate.name || 'Unknown'}
                    </h3>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 500,
                        background: `${getStatusColor(candidate.status)}20`,
                        color: getStatusColor(candidate.status)
                      }}
                    >
                      {candidate.status}
                    </span>
                  </div>

                  {candidate['Professional Summary'] && (
                    <p style={{
                      fontSize: '14px',
                      color: 'var(--text-secondary)',
                      marginBottom: '12px',
                      lineHeight: 1.4
                    }}>
                      {candidate['Professional Summary'].substring(0, 150)}
                      {candidate['Professional Summary'].length > 150 && '...'}
                    </p>
                  )}

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {candidate.Email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={14} />
                        <span>{candidate.Email}</span>
                      </div>
                    )}
                    {candidate.Phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={14} />
                        <span>{candidate.Phone}</span>
                      </div>
                    )}
                    {candidate.Location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={14} />
                        <span>{candidate.Location}</span>
                      </div>
                    )}
                  </div>

                  {candidate.Skills && Array.isArray(candidate.Skills) && candidate.Skills.length > 0 && (
                    <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {candidate.Skills.slice(0, 5).map((skill, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: '2px 8px',
                            background: 'var(--bg-tertiary)',
                            borderRadius: '4px',
                            fontSize: '11px',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                      {candidate.Skills.length > 5 && (
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          +{candidate.Skills.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
