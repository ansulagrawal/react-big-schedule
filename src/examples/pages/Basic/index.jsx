import { CalendarOutlined, CloseOutlined, CodeOutlined, DragOutlined, EyeOutlined } from '@ant-design/icons';
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
import { URLS } from '../../constants';

function BasicGuidePopup({ isVisible, onClose }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!isVisible) {
      return;
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
            <CodeOutlined style={iconStyles} />
            Basic Example Guide
          </div>
          <Button type="text" icon={<CloseOutlined />} onClick={onClose} style={closeBtnStyles} size="small" />
        </div>

        <div style={contentStyles}>
          <h3 style={headingStyles}>Explore the Scheduler</h3>
          <p style={paragraphStyles}>
            This basic example demonstrates the core functionality of React Big Schedule. Interact with the scheduler
            below to see how it works in action.
          </p>

          <div style={featuresStyles}>
            <div style={featureItemStyles}>
              <DragOutlined style={featureIconStyles} />
              <span>Try dragging events around</span>
            </div>
            <div style={featureItemStyles}>
              <CalendarOutlined style={featureIconStyles} />
              <span>Switch between view modes</span>
            </div>
            <div style={featureItemStyles}>
              <EyeOutlined style={featureIconStyles} />
              <span>Check the source code link</span>
            </div>
            <div style={featureItemStyles}>
              <CodeOutlined style={featureIconStyles} />
              <span>Inspect implementation details</span>
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
          Start Exploring 📅
        </Button>
      </div>
    </div>
  );
}

BasicGuidePopup.propTypes = {
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
          Basic Example
        </Typography.Title>
      </Row>
      <SourceCode value={URLS.examples.basic} />
      <ClassBased />

      {/* Basic Example Guide Popup */}
      <BasicGuidePopup isVisible={showGuide} onClose={handleCloseGuide} />
    </>
  );
}

export default Basic;
