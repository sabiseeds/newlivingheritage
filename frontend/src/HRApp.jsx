import React, { useState } from 'react';
import { UserCheck, Briefcase, ClipboardList } from 'lucide-react';
import StoreManager from './components/StoreManager';
import CVUpload from './components/CVUpload';
import CandidateList from './components/CandidateList';
import JobOfferForm from './components/JobOfferForm';
import OnboardingDashboard from './components/OnboardingDashboard';

export default function HRApp() {
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [activeTab, setActiveTab] = useState('candidates');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCVUpload = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const tabs = [
    { id: 'candidates', label: 'Candidates', icon: UserCheck },
    { id: 'job-offer', label: 'Job Offers', icon: Briefcase },
    { id: 'onboarding', label: 'Onboarding', icon: ClipboardList }
  ];

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
          <UserCheck size={32} style={{ color: 'var(--primary)' }} />
          <h1 style={{ fontSize: '32px', margin: 0 }}>
            HR Recruitment & Onboarding
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px', margin: 0 }}>
          AI-powered CV parsing, job offer generation, and onboarding management
        </p>
      </header>

      {/* File Search Store Manager */}
      <StoreManager
        selectedStore={selectedStore}
        onStoreSelect={setSelectedStore}
      />

      {/* Tab Navigation */}
      <div style={{
        background: 'var(--bg-primary)',
        borderRadius: '8px',
        padding: '8px',
        marginBottom: '20px',
        display: 'flex',
        gap: '8px',
        boxShadow: '0 1px 3px var(--shadow)'
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: 'none',
                borderRadius: '6px',
                background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'var(--text-primary)',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Candidates Tab */}
      {activeTab === 'candidates' && (
        <>
          <CVUpload
            storeName={selectedStore}
            onUploadComplete={handleCVUpload}
          />
          <CandidateList
            onSelectCandidate={setSelectedCandidate}
            refreshTrigger={refreshTrigger}
          />

          {selectedCandidate && (
            <div className="card">
              <h2>Candidate Details</h2>
              <div style={{ display: 'grid', gap: '16px' }}>
                {selectedCandidate.profilePhoto && (
                  <div style={{ textAlign: 'center' }}>
                    <img
                      src={`/api/hr/candidates/${selectedCandidate.id}/photo`}
                      alt={selectedCandidate['Full Name']}
                      style={{
                        width: '150px',
                        height: '150px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '3px solid var(--border)'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div>
                  <h3>{selectedCandidate['Full Name'] || selectedCandidate.name}</h3>
                  {selectedCandidate['Professional Summary'] && (
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                      {selectedCandidate['Professional Summary']}
                    </p>
                  )}
                </div>

                {selectedCandidate['Work Experience'] && (
                  <div>
                    <h4>Work Experience</h4>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                      {JSON.stringify(selectedCandidate['Work Experience'], null, 2)}
                    </div>
                  </div>
                )}

                {selectedCandidate.Education && (
                  <div>
                    <h4>Education</h4>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                      {JSON.stringify(selectedCandidate.Education, null, 2)}
                    </div>
                  </div>
                )}

                {selectedCandidate.Skills && (
                  <div>
                    <h4>Skills</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                      {(Array.isArray(selectedCandidate.Skills)
                        ? selectedCandidate.Skills
                        : Object.values(selectedCandidate.Skills || {})
                      ).map((skill, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: '4px 12px',
                            background: 'var(--bg-tertiary)',
                            borderRadius: '16px',
                            fontSize: '13px'
                          }}
                        >
                          {typeof skill === 'string' ? skill : JSON.stringify(skill)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Job Offers Tab */}
      {activeTab === 'job-offer' && (
        <>
          <CandidateList
            onSelectCandidate={setSelectedCandidate}
            refreshTrigger={refreshTrigger}
          />
          <JobOfferForm
            candidate={selectedCandidate}
            storeName={selectedStore}
          />
        </>
      )}

      {/* Onboarding Tab */}
      {activeTab === 'onboarding' && (
        <>
          <CandidateList
            onSelectCandidate={setSelectedCandidate}
            refreshTrigger={refreshTrigger}
          />
          <OnboardingDashboard
            candidate={selectedCandidate}
            storeName={selectedStore}
          />
        </>
      )}

      <footer style={{
        textAlign: 'center',
        padding: '20px',
        color: 'var(--text-secondary)',
        fontSize: '14px',
        marginTop: '40px'
      }}>
        <p>
          AI-powered HR system using Gemini for intelligent document processing and workflow automation
        </p>
      </footer>
    </div>
  );
}
