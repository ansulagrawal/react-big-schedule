import { CalendarOutlined, CloseOutlined, CodeOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
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

function AddMoreGuidePopup({ isVisible, onClose }) {
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
            <PlusOutlined style={iconStyles} />
            Add More Example Guide
          </div>
          <Button type="text" icon={<CloseOutlined />} onClick={onClose} style={closeBtnStyles} size="small" />
        </div>

        <div style={contentStyles}>
          <h3 style={headingStyles}>Overflow Event Management</h3>
          <p style={paragraphStyles}>
            This example demonstrates how React Big Schedule handles event overflow with the &ldquo;Add More&rdquo; feature. When multiple events occupy the same time slot, a
            &ldquo;+N more&rdquo; indicator appears for better space management.
          </p>

          <div style={featuresStyles}>
            <div style={featureItemStyles}>
              <PlusOutlined style={featureIconStyles} />
              <span>Look for &ldquo;+N more&rdquo; indicators</span>
            </div>
            <div style={featureItemStyles}>
              <EyeOutlined style={featureIconStyles} />
              <span>Click to view all hidden events</span>
            </div>
            <div style={featureItemStyles}>
              <CalendarOutlined style={featureIconStyles} />
              <span>Better space utilization</span>
            </div>
            <div style={featureItemStyles}>
              <CodeOutlined style={featureIconStyles} />
              <span>Study the overflow handling</span>
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
          Try Add More Feature ➕
        </Button>
      </div>
    </div>
  );
}

AddMoreGuidePopup.propTypes = {
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
          Add More Example
        </Typography.Title>
      </Row>
      <SourceCode value="https://github.com/ansulagrawal/react-big-schedule/blob/master/src/examples/pages/Add-More/index.jsx" />
      <ClassBased />

      {/* Add More Example Guide Popup */}
      <AddMoreGuidePopup isVisible={showGuide} onClose={handleCloseGuide} />
    </>
  );
}

export default Basic;
