import React from 'react';

const FloatingSquares = () => {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {Array.from({ length: 30 }).map((_, i) => (
        <div key={i} className="floating-square" style={{
          left: `${(Math.random() * 100).toFixed(2)}%`,
          top: `${(Math.random() * 100).toFixed(2)}%`,
          animationDelay: `${(Math.random() * 5).toFixed(2)}s`,
          animationDuration: `${5 + Math.random() * 5}s`
        }}></div>
      ))}
    </div>
  );
};

export default FloatingSquares;
