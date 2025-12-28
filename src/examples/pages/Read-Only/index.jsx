import { CalendarOutlined, CloseOutlined, CodeOutlined, EyeOutlined, LockOutlined } from '@ant-design/icons';
import { Button, Row, Typography } from 'antd';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import SourceCode from '../../components/SourceCode';
import ClassBased from './class-based';
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
} from '../../constants/sharedStyles';

function ReadOnlyGuidePopup({ isVisible, onClose }) {
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
            <LockOutlined style={iconStyles} />
            Read-Only Example Guide
          </div>
          <Button type="text" icon={<CloseOutlined />} onClick={onClose} style={closeBtnStyles} size="small" />
        </div>

        <div style={contentStyles}>
          <h3 style={headingStyles}>View-Only Scheduler</h3>
          <p style={paragraphStyles}>
            This read-only example showcases how React Big Schedule displays events without allowing modifications. Perfect for viewing schedules in display-only scenarios.
          </p>

          <div style={featuresStyles}>
            <div style={featureItemStyles}>
              <EyeOutlined style={featureIconStyles} />
              <span>View events and schedules</span>
            </div>
            <div style={featureItemStyles}>
              <CalendarOutlined style={featureIconStyles} />
              <span>Navigate between time periods</span>
            </div>
            <div style={featureItemStyles}>
              <LockOutlined style={featureIconStyles} />
              <span>No editing or dragging allowed</span>
            </div>
            <div style={featureItemStyles}>
              <CodeOutlined style={featureIconStyles} />
              <span>Examine the implementation</span>
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
          Explore Read-Only Mode 🔒
        </Button>
      </div>
    </div>
  );
}

ReadOnlyGuidePopup.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

function Basic() {
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
          Read Only Example
        </Typography.Title>
      </Row>
      <SourceCode value="https://github.com/ansulagrawal/react-big-schedule/blob/master/src/examples/pages/Read-Only/index.jsx" />
      <ClassBased />

      {/* Read-Only Example Guide Popup */}
      <ReadOnlyGuidePopup isVisible={showGuide} onClose={handleCloseGuide} />
    </>
  );
}

export default Basic;
