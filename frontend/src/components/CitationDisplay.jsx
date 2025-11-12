import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

export default function CitationDisplay({ citations }) {
  const [expanded, setExpanded] = useState(false);

  if (!citations || !citations.groundingChunks || citations.groundingChunks.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: '24px' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: 500,
          marginBottom: expanded ? '12px' : 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={16} />
          <span>Citations & Sources ({citations.groundingChunks.length})</span>
        </div>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {expanded && (
        <div style={{
          background: 'var(--bg-secondary)',
          padding: '16px',
          borderRadius: '6px',
          border: '1px solid var(--border)'
        }}>
          <p style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginBottom: '16px'
          }}>
            The proposal above was generated using information from the following sources in your knowledge base:
          </p>

          <div style={{ display: 'grid', gap: '12px' }}>
            {citations.groundingChunks.map((chunk, index) => (
              <div
                key={index}
                style={{
                  background: 'var(--bg-primary)',
                  padding: '12px',
                  borderRadius: '4px',
                  border: '1px solid var(--border)'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    background: 'var(--primary)',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 600
                  }}>
                    [{index + 1}]
                  </span>
                  {chunk.web && (
                    <span style={{ fontSize: '13px', fontWeight: 500 }}>
                      {chunk.web.title || chunk.web.uri}
                    </span>
                  )}
                  {chunk.retrievedContext && chunk.retrievedContext.title && (
                    <span style={{ fontSize: '13px', fontWeight: 500 }}>
                      {chunk.retrievedContext.title}
                    </span>
                  )}
                </div>

                {chunk.web?.uri && (
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    <a
                      href={chunk.web.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--primary)', textDecoration: 'none' }}
                    >
                      {chunk.web.uri}
                    </a>
                  </div>
                )}

                {chunk.retrievedContext?.text && (
                  <div style={{
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                    padding: '8px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '4px',
                    borderLeft: '3px solid var(--primary)',
                    fontStyle: 'italic',
                    maxHeight: '100px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {chunk.retrievedContext.text.substring(0, 200)}
                    {chunk.retrievedContext.text.length > 200 && '...'}
                  </div>
                )}
              </div>
            ))}
          </div>

          {citations.groundingSupports && citations.groundingSupports.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Grounding Support</h4>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {citations.groundingSupports.map((support, idx) => (
                  <div key={idx} style={{ marginBottom: '4px' }}>
                    Segment [{support.segmentStartIndex} - {support.segmentEndIndex}] supported by sources: {' '}
                    {support.groundingChunkIndices?.join(', ')}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
