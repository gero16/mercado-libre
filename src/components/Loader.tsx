import React from 'react';
import './Loader.css';

interface LoaderProps {
  type?: 'spinner' | 'dots' | 'bars' | 'pulse';
  size?: 'small' | 'medium' | 'large';
  text?: string;
  className?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'custom';
  customColor?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
  type = 'spinner',
  size = 'medium', 
  text = 'Cargando productos...', 
  className = '',
  color = 'primary',
  customColor
}) => {
  const renderLoader = () => {
    switch (type) {
      case 'dots':
        return (
          <div className={`loader-dots loader-${size}`}>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        );
      case 'bars':
        return (
          <div className={`loader-bars loader-${size}`}>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
        );
      case 'pulse':
        return (
          <div className={`loader-pulse loader-${size}`}>
            <div className="pulse-circle"></div>
          </div>
        );
      default:
        return (
          <div className={`loader-spinner loader-${size}`}>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
        );
    }
  };

  const getColorClass = () => {
    if (color === 'custom' && customColor) {
      return '';
    }
    return `loader-${color}`;
  };

  const getCustomStyle = () => {
    if (color === 'custom' && customColor) {
      return { '--custom-color': customColor } as React.CSSProperties;
    }
    return {};
  };

  return (
    <div 
      className={`loader-container ${getColorClass()} ${className}`}
      style={getCustomStyle()}
    >
      {renderLoader()}
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
};

export default Loader;
