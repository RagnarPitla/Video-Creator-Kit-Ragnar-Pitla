import React from 'react';

/**
 * A single step in a business process model.
 */
export const FlowBox: React.FC<{
  label: string;
  width?: number;
  height?: number;
  filled?: number;
  appear?: number;
}> = ({label, width = 300, height = 168, filled = 0, appear = 1}) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 22,
        background: '#FFFFFF',
        border: '1px solid #E4E9EF',
        boxShadow: `0 18px 44px rgba(24, 46, 72, 0.14), 0 0 0 ${filled * 3}px rgba(30, 195, 189, ${
          filled * 0.5
        })`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 26px',
        textAlign: 'center',
        opacity: appear,
        scale: String(0.9 + appear * 0.1),
      }}
    >
      <span
        style={{
          fontFamily: 'Segoe UI',
          fontWeight: 400,
          fontSize: 44,
          lineHeight: 1.18,
          letterSpacing: '-0.004em',
          color: filled > 0.5 ? '#1EC3BD' : '#48525E',
        }}
      >
        {label}
      </span>
    </div>
  );
};
