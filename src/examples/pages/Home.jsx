import React, { useState, useEffect } from 'react';
import { Typography, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { CloseOutlined, RocketOutlined, CalendarOutlined, DragOutlined, SettingOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

const { Title, Paragraph } = Typography;

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
  width: '320px',
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

function GuidePopup({ isVisible, onClose }) {
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
            <RocketOutlined style={iconStyles} />
            Welcome Guide
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
          <h3 style={headingStyles}>React Big Schedule</h3>
          <p style={paragraphStyles}>
            Discover a powerful scheduling solution that transforms how you manage time and resources.
            Perfect for modern applications requiring advanced calendar functionality.
          </p>

          <div style={featuresStyles}>
            <div style={featureItemStyles}>
              <DragOutlined style={featureIconStyles} />
              <span>Drag & Drop Events</span>
            </div>
            <div style={featureItemStyles}>
              <CalendarOutlined style={featureIconStyles} />
              <span>Multiple View Types</span>
            </div>
            <div style={featureItemStyles}>
              <SettingOutlined style={featureIconStyles} />
              <span>Resource Management</span>
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
          Start Exploring 🎯
        </Button>
      </div>
    </div>
  );
}

GuidePopup.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

function Home() {
  const navigate = useNavigate();
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGuide(true);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const handleCloseGuide = () => {
    setShowGuide(false);
  };

  return (
    <>
      <div className="home-page">
        <header>
          <Title level={1}>React Big Schedule</Title>
          <Paragraph>
            React Big Schedule is a powerful and intuitive scheduler and resource planning solution built with React. Seamlessly integrate this modern, browser-compatible component
            into your applications to effectively manage time, appointments, and resources. With drag-and-drop functionality, interactive UI, and granular views, React Big Schedule
            empowers you to effortlessly schedule and allocate resources with precision.
          </Paragraph>
          <Button type="link" size="large" onClick={() => navigate('/basic')}>
            Get Started
          </Button>
        </header>
      </div>

      {/* 3D Guide Popup */}
      <GuidePopup isVisible={showGuide} onClose={handleCloseGuide} />
    </>
  );
}

export default Home;
