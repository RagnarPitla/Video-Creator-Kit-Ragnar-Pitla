import React from 'react';

/**
 * A laptop the camera can travel into. `children` render inside the display.
 */
export const DeviceScreen: React.FC<{
  width: number;
  children?: React.ReactNode;
  glow?: number;
}> = ({width, children, glow = 0}) => {
  const screenH = width * 0.615;
  return (
    <div style={{width, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div
        style={{
          width,
          height: screenH,
          borderRadius: width * 0.028,
          padding: width * 0.014,
          background: 'linear-gradient(160deg, #DCE3EB 0%, #C2CCD8 100%)',
          boxShadow: `0 ${width * 0.05}px ${width * 0.11}px rgba(24, 46, 72, 0.22), 0 0 ${
            glow * 90
          }px rgba(30, 195, 189, ${glow * 0.75})`,
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: width * 0.017,
            background: '#FFFFFF',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {children}
        </div>
      </div>
      <div
        style={{
          width: width * 1.13,
          height: width * 0.024,
          borderRadius: width * 0.012,
          background: 'linear-gradient(180deg, #D3DBE4 0%, #A9B5C3 100%)',
          boxShadow: `0 ${width * 0.012}px ${width * 0.03}px rgba(24, 46, 72, 0.2)`,
        }}
      />
    </div>
  );
};
