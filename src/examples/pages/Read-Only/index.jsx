import { CalendarOutlined, CloseOutlined, CodeOutlined, EyeOutlined, LockOutlined } from '@ant-design/icons';
import { Button, Row, Typography } from 'antd';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import SourceCode from '../../components/SourceCode';
import ClassBased from './class-based';

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
  width: '340px',
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

/**
 * Displays a read-only guide popup with a countdown progress bar and a close action.
 *
 * The popup shows information about a view-only scheduler, updates an internal progress
 * bar over 10 seconds, and automatically calls `onClose` when the countdown reaches zero.
 *
 * @param {Object} props
 * @param {boolean} props.isVisible - If true, renders the popup; if false, renders `null`.
 * @param {Function} props.onClose - Callback invoked when the user closes the popup or when the 10-second countdown completes.
 * @returns {JSX.Element|null} The popup element when visible, or `null` when not visible.
 */
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
          <Button type='text' icon={<CloseOutlined />} onClick={onClose} style={closeBtnStyles} size='small' />
        </div>

        <div style={contentStyles}>
          <h3 style={headingStyles}>View-Only Scheduler</h3>
          <p style={paragraphStyles}>
            This read-only example showcases how React Big Schedule displays events without allowing modifications.
            Perfect for viewing schedules in display-only scenarios.
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

        <Button type='primary' block style={ctaButtonStyles} onClick={onClose}>
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

/**
 * Displays the Read Only Example page including the source link, a class-based demo, and a timed guide popup.
 *
 * The guide popup is shown automatically about 1 second after mount and can be dismissed by the user.
 * @returns {JSX.Element} The rendered page containing the title, SourceCode, ClassBased demo, and ReadOnlyGuidePopup.
 */
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
      <Row align='middle' justify='center'>
        <Typography.Title level={2} className='m-0'>
          Read Only Example
        </Typography.Title>
      </Row>
      <SourceCode value='https://github.com/ansulagrawal/react-big-schedule/blob/master/src/examples/pages/Read-Only/index.jsx' />
      <ClassBased />

      {/* Read-Only Example Guide Popup */}
      <ReadOnlyGuidePopup isVisible={showGuide} onClose={handleCloseGuide} />
    </>
  );
}

export default Basic;