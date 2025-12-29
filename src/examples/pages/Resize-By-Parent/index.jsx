import { CloseOutlined, CodeOutlined, ColumnWidthOutlined, ExpandOutlined, MobileOutlined } from '@ant-design/icons';
import { Button, Row, Typography } from 'antd';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import SourceCode from '../../components/SourceCode';
import ClassResizeByParent from './class-based';
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

function ResizeByParentGuidePopup({ isVisible, onClose }) {
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
            <ExpandOutlined style={iconStyles} />
            Responsive Design Guide
          </div>
          <Button type="text" icon={<CloseOutlined />} onClick={onClose} style={closeBtnStyles} size="small" />
        </div>

        <div style={contentStyles}>
          <h3 style={headingStyles}>Parent-Based Responsiveness</h3>
          <p style={paragraphStyles}>
            This example shows how React Big Schedule automatically adapts to its parent container size. Perfect for
            embedded components, dashboards, and responsive layouts that need flexible sizing.
          </p>

          <div style={featuresStyles}>
            <div style={featureItemStyles}>
              <ExpandOutlined style={featureIconStyles} />
              <span>Automatic container adaptation</span>
            </div>
            <div style={featureItemStyles}>
              <ColumnWidthOutlined style={featureIconStyles} />
              <span>Flexible width and height scaling</span>
            </div>
            <div style={featureItemStyles}>
              <MobileOutlined style={featureIconStyles} />
              <span>Responsive across all devices</span>
            </div>
            <div style={featureItemStyles}>
              <CodeOutlined style={featureIconStyles} />
              <span>Study responsive implementation</span>
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
          Test Responsive Layout 📱
        </Button>
      </div>
    </div>
  );
}

ResizeByParentGuidePopup.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

function ResizeByParent() {
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
          Resize By Parent Example
        </Typography.Title>
      </Row>

      <SourceCode value={URLS.examples.resizeByParent} />
      <ClassResizeByParent />

      {/* Resize By Parent Example Guide Popup */}
      <ResizeByParentGuidePopup isVisible={showGuide} onClose={handleCloseGuide} />
    </>
  );
}

export default ResizeByParent;
