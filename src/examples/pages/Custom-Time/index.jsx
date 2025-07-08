import { Row, Typography, Button } from 'antd';
import React, { useState, useEffect } from 'react';
import { CloseOutlined, ClockCircleOutlined, CalendarOutlined, CodeOutlined, SettingOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import ClassBased from './class-based';
import SourceCode from '../../components/SourceCode';

const overlayStyles = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 9999,
  pointerEvents: 'none',
};

const popupStyles = {
  position: 'absolute',
  top: '20px',
  right: '20px',
  width: '350px',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '16px',
  padding: '24px',
  boxShadow: `
    0 25px 50px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2)
  `,
  transform: 'translateX(0) rotateY(0deg) scale(1)',
  opacity: 1,
  transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
  pointerEvents: 'auto',
};

const headerStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '16px',
};

const titleStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '16px',
  fontWeight: 600,
  color: '#1890ff',
};

const iconStyles = {
  fontSize: '18px',
};

const closeBtnStyles = {
  color: '#8c8c8c',
  border: 'none',
  boxShadow: 'none',
};

const contentStyles = {
  marginBottom: '20px',
};

const headingStyles = {
  margin: '0 0 8px 0',
  fontSize: '18px',
  fontWeight: 600,
  color: '#262626',
};

const paragraphStyles = {
  margin: '0 0 16px 0',
  color: '#595959',
  lineHeight: 1.5,
  fontSize: '14px',
};

const featuresStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const featureItemStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: '#595959',
  fontSize: '13px',
};

const featureIconStyles = {
  color: '#1890ff',
  fontSize: '14px',
};

const progressContainerStyles = {
  height: '3px',
  background: '#f0f0f0',
  borderRadius: '2px',
  margin: '16px 0',
  overflow: 'hidden',
};

const progressBarStyles = {
  height: '100%',
  background: 'linear-gradient(90deg, #1890ff, #40a9ff)',
  borderRadius: '2px',
  transition: 'width 0.05s linear',
};

const ctaButtonStyles = {
  borderRadius: '8px',
  height: '36px',
  fontWeight: 500,
  background: 'linear-gradient(135deg, #1890ff, #40a9ff)',
  border: 'none',
  boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)',
};

function CustomTimeGuidePopup({ isVisible, onClose }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!isVisible) {
      return undefined;
    }

    const duration = 10000;
    const interval = 50;
    const decrement = (100 * interval) / duration;

    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - decrement;
        if (newProgress <= 0) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return newProgress;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div style={overlayStyles}>
      <div style={popupStyles}>
        <div style={headerStyles}>
          <div style={titleStyles}>
            <ClockCircleOutlined style={iconStyles} />
            Custom Time Guide
          </div>
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={onClose}
            style={closeBtnStyles}
            size="small"
          />
        </div>

        <div style={contentStyles}>
          <h3 style={headingStyles}>Flexible Time Windows</h3>
          <p style={paragraphStyles}>
            This example demonstrates how to create custom time windows and ranges in React Big Schedule.
            Define your own time boundaries, working hours, and display periods to fit specific business needs.
          </p>

          <div style={featuresStyles}>
            <div style={featureItemStyles}>
              <ClockCircleOutlined style={featureIconStyles} />
              <span>Custom time window definitions</span>
            </div>
            <div style={featureItemStyles}>
              <CalendarOutlined style={featureIconStyles} />
              <span>Flexible working hour ranges</span>
            </div>
            <div style={featureItemStyles}>
              <SettingOutlined style={featureIconStyles} />
              <span>Business-specific time periods</span>
            </div>
            <div style={featureItemStyles}>
              <CodeOutlined style={featureIconStyles} />
              <span>Study custom time implementation</span>
            </div>
          </div>
        </div>

        <div style={progressContainerStyles}>
          <div
            style={{
              ...progressBarStyles,
              width: `${progress}%`,
            }}
          />
        </div>

        <Button
          type="primary"
          block
          style={ctaButtonStyles}
          onClick={onClose}
        >
          Explore Time Customization ⏰
        </Button>
      </div>
    </div>
  );
}

CustomTimeGuidePopup.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

function CustomTime() {
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGuide(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleCloseGuide = () => {
    setShowGuide(false);
  };

  return (
    <>
      <Row align="middle" justify="center">
        <Typography.Title level={2} className="m-0">
          Custom Time Example
        </Typography.Title>
      </Row>
      <SourceCode value="https://github.com/ansulagrawal/react-big-schedule/blob/master/src/examples/pages/Custom-Time/index.jsx" />
      <ClassBased />

      {/* Custom Time Example Guide Popup */}
      <CustomTimeGuidePopup isVisible={showGuide} onClose={handleCloseGuide} />
    </>
  );
}

export default CustomTime;
