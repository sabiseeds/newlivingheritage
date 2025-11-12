import React, { useState } from 'react';
import { ClipboardList, CheckCircle, Circle, Calendar, User as UserIcon, Download } from 'lucide-react';
import hrApi from '../hrApi';
import CitationDisplay from './CitationDisplay';

export default function OnboardingDashboard({ candidate, storeName }) {
  const [jobDetails, setJobDetails] = useState({
    position: '',
    department: '',
    startDate: ''
  });

  const [generating, setGenerating] = useState(false);
  const [onboarding, setOnboarding] = useState(null);
  const [citations, setCitations] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (!candidate) {
      setError('Please select a candidate first');
      return;
    }

    if (!jobDetails.position || !jobDetails.startDate) {
      setError('Position and start date are required');
      return;
    }

    setGenerating(true);
    setError(null);
    setOnboarding(null);
    setCitations(null);

    try {
      const response = await hrApi.generateOnboardingChecklist(
        candidate.id,
        jobDetails,
        storeName || null
      );

      setOnboarding(response.onboarding);
      setCitations(response.citations);
    } catch (err) {
      console.error('Error generating onboarding checklist:', err);
      setError(err.response?.data?.message || 'Failed to generate onboarding checklist');
    } finally {
      setGenerating(false);
    }
  };

  const handleTaskToggle = async (sectionIndex, taskIndex, currentStatus) => {
    try {
      const response = await hrApi.updateTaskCompletion(
        onboarding.id,
        sectionIndex,
        taskIndex,
        !currentStatus
      );

      setOnboarding(response.onboarding);
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task completion');
    }
  };

  const downloadChecklist = () => {
    if (!onboarding) return;

    const sections = onboarding.checklist.sections || onboarding.checklist;
    let content = `# Onboarding Checklist\n\n`;
    content += `**Employee:** ${onboarding.candidateName}\n`;
    content += `**Position:** ${onboarding.position}\n`;
    content += `**Department:** ${onboarding.department}\n`;
    content += `**Start Date:** ${onboarding.startDate}\n\n`;
    content += `**Progress:** ${onboarding.progress.completed}/${onboarding.progress.total} tasks completed\n\n`;

    sections.forEach((section, idx) => {
      content += `## ${section.name || section.title}\n\n`;
      if (section.description) {
        content += `${section.description}\n\n`;
      }
      if (section.tasks) {
        section.tasks.forEach((task, taskIdx) => {
          const checkbox = task.completed ? '[x]' : '[ ]';
          content += `${checkbox} **${task.description || task.task}**\n`;
          if (task.responsible) content += `   - Responsible: ${task.responsible}\n`;
          if (task.dueDate) content += `   - Due: ${task.dueDate}\n`;
          if (task.priority) content += `   - Priority: ${task.priority}\n`;
          content += `\n`;
        });
      }
      content += `\n`;
    });

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onboarding-checklist-${candidate['Full Name']?.replace(/\s+/g, '-')}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'var(--danger)',
      medium: 'var(--warning)',
      low: 'var(--primary)'
    };
    return colors[priority?.toLowerCase()] || 'var(--text-secondary)';
  };

  return (
    <div className="card">
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ClipboardList size={24} />
        Onboarding Checklist & Documents
      </h2>

      {!candidate && (
        <div className="alert alert-info">
          Please select a candidate from the list to generate an onboarding checklist
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {candidate && !onboarding && (
        <form onSubmit={handleGenerate}>
          <div className="alert alert-info" style={{ marginBottom: '16px' }}>
            <strong>Selected Candidate:</strong> {candidate['Full Name'] || candidate.name}
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label>Position *</label>
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
              <label>Start Date *</label>
              <input
                type="date"
                value={jobDetails.startDate}
                onChange={(e) => setJobDetails({ ...jobDetails, startDate: e.target.value })}
                required
                disabled={generating}
              />
            </div>
          </div>

          <div className="alert alert-info">
            <strong>AI-Powered Onboarding Checklist</strong>
            <p style={{ marginTop: '8px', fontSize: '14px' }}>
              Our system will generate a comprehensive onboarding checklist including:
            </p>
            <ul style={{ marginTop: '8px', fontSize: '14px', paddingLeft: '20px' }}>
              <li>Pre-boarding tasks (documents, equipment setup)</li>
              <li>First day orientation tasks</li>
              <li>First week training and integration</li>
              <li>First month milestones and check-ins</li>
              <li>Required HR documents and compliance forms</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={generating || !jobDetails.position || !jobDetails.startDate}
            className="btn-primary"
            style={{ width: '100%' }}
          >
            {generating ? (
              <>
                <span className="spinner"></span>
                Generating Onboarding Checklist...
              </>
            ) : (
              <>
                <ClipboardList size={16} style={{ display: 'inline', marginRight: '8px' }} />
                Generate Onboarding Checklist
              </>
            )}
          </button>
        </form>
      )}

      {onboarding && (
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
              <h3 style={{ margin: 0 }}>Onboarding Progress</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {onboarding.candidateName} - {onboarding.position}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={downloadChecklist}
                className="btn-secondary"
              >
                <Download size={16} style={{ display: 'inline', marginRight: '4px' }} />
                Download
              </button>
              <button
                onClick={() => {
                  setOnboarding(null);
                  setCitations(null);
                }}
                className="btn-secondary"
              >
                Create New
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '14px'
            }}>
              <span style={{ fontWeight: 500 }}>
                {onboarding.progress.completed} of {onboarding.progress.total} tasks completed
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {Math.round((onboarding.progress.completed / onboarding.progress.total) * 100)}%
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              background: 'var(--bg-tertiary)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${(onboarding.progress.completed / onboarding.progress.total) * 100}%`,
                height: '100%',
                background: 'var(--secondary)',
                transition: 'width 0.3s'
              }} />
            </div>
          </div>

          {/* Checklist Sections */}
          <div style={{ display: 'grid', gap: '20px' }}>
            {(onboarding.checklist.sections || onboarding.checklist).map((section, sectionIndex) => (
              <div
                key={sectionIndex}
                style={{
                  background: 'var(--bg-secondary)',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)'
                }}
              >
                <h3 style={{ marginBottom: '8px' }}>
                  {section.name || section.title}
                </h3>
                {section.description && (
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    {section.description}
                  </p>
                )}

                {section.tasks && section.tasks.length > 0 && (
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {section.tasks.map((task, taskIndex) => (
                      <div
                        key={taskIndex}
                        style={{
                          background: 'var(--bg-primary)',
                          padding: '12px',
                          borderRadius: '6px',
                          border: '1px solid var(--border)',
                          display: 'flex',
                          gap: '12px',
                          alignItems: 'start',
                          opacity: task.completed ? 0.7 : 1
                        }}
                      >
                        <button
                          onClick={() => handleTaskToggle(sectionIndex, taskIndex, task.completed)}
                          style={{
                            background: 'none',
                            padding: 0,
                            border: 'none',
                            cursor: 'pointer',
                            marginTop: '2px'
                          }}
                        >
                          {task.completed ? (
                            <CheckCircle size={20} style={{ color: 'var(--secondary)' }} />
                          ) : (
                            <Circle size={20} style={{ color: 'var(--border)' }} />
                          )}
                        </button>

                        <div style={{ flex: 1 }}>
                          <p style={{
                            fontWeight: 500,
                            marginBottom: '8px',
                            textDecoration: task.completed ? 'line-through' : 'none'
                          }}>
                            {task.description || task.task}
                          </p>

                          <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '12px',
                            fontSize: '13px',
                            color: 'var(--text-secondary)'
                          }}>
                            {task.responsible && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <UserIcon size={12} />
                                <span>{task.responsible}</span>
                              </div>
                            )}
                            {task.dueDate && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Calendar size={12} />
                                <span>{task.dueDate}</span>
                              </div>
                            )}
                            {task.priority && (
                              <span
                                style={{
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: 500,
                                  background: `${getPriorityColor(task.priority)}20`,
                                  color: getPriorityColor(task.priority)
                                }}
                              >
                                {task.priority}
                              </span>
                            )}
                          </div>

                          {task.documents && task.documents.length > 0 && (
                            <div style={{ marginTop: '8px' }}>
                              <p style={{ fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                                Required Documents:
                              </p>
                              <ul style={{ fontSize: '12px', paddingLeft: '20px' }}>
                                {task.documents.map((doc, docIdx) => (
                                  <li key={docIdx}>{doc}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {citations && <CitationDisplay citations={citations} />}
        </div>
      )}
    </div>
  );
}
