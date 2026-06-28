import React from 'react';

/**
 * Loader — An isometric 3D box loading animation (task-integrated).
 * Integrates the boxes design and works with styles added in index.css.
 */
export const Loader: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-8 min-h-[120px]">
      <div className="boxes" aria-hidden="true">
        <div className="box">
          <div />
          <div />
          <div />
          <div />
        </div>
        <div className="box">
          <div />
          <div />
          <div />
          <div />
        </div>
        <div className="box">
          <div />
          <div />
          <div />
          <div />
        </div>
        <div className="box">
          <div />
          <div />
          <div />
          <div />
        </div>
      </div>
    </div>
  );
};

export default Loader;
