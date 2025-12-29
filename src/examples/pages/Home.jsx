import { CalendarOutlined, CloseOutlined, DragOutlined, RocketOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Typography } from 'antd';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  closeBtnStyles,
  contentStyles,
  ctaButtonStyles,
  featureIconStyles,
  featureItemStyles,
  featuresStyles,
  headerStyles,
  headingStyles,
  iconStyles,
  overlayStyles,
  paragraphStyles,
  popupStyles,
  progressBarStyles,
  progressContainerStyles,
  titleStyles,
} from '../constants/sharedStyles';

const { Title, Paragraph } = Typography;

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
          <Button type="text" icon={<CloseOutlined />} onClick={onClose} style={closeBtnStyles} size="small" />
        </div>

        <div style={contentStyles}>
          <h3 style={headingStyles}>React Big Schedule</h3>
          <p style={paragraphStyles}>
            Discover a powerful scheduling solution that transforms how you manage time and resources. Perfect for
            modern applications requiring advanced calendar functionality.
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

        <Button type="primary" block style={ctaButtonStyles} onClick={onClose}>
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
            React Big Schedule is a powerful and intuitive scheduler and resource planning solution built with React.
            Seamlessly integrate this modern, browser-compatible component into your applications to effectively manage
            time, appointments, and resources. With drag-and-drop functionality, interactive UI, and granular views,
            React Big Schedule empowers you to effortlessly schedule and allocate resources with precision.
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
